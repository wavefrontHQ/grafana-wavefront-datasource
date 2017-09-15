import {QueryCtrl} from "app/plugins/sdk";
import _ from "lodash";
import functions from "./functions";
import "./wf-directives.js";
import "../css/query.editor.css!";

export class WavefrontQueryCtrl extends QueryCtrl {
    static templateUrl = "partials/query.editor.html";

    public addTagMode = false;

    public panel: any;

    constructor($scope, $injector) {
        super($scope, $injector);

        this.target.summarization = this.panel.summarization;
        this.target.granularity = this.panel.granularity;
        this.target.includeObsolete = this.panel.includeObsolete;
        this.target.rawQueryPos = 0;
        this.target.errors = {};
        this.target.warnings = {};
        this.target.functions = this.target.functions || [];
        if (this.target.rawMode) {
            this.target.textEditor = true;
        }
    }

    public toggleEditorMode() {
        if (!this.target.textEditor && (!this.target.query || this.target.query === "")) {
            this.target.query = this.datasource.buildQuery(this.target);
        }
        this.target.textEditor = !this.target.textEditor;
    }

    /**
     * Returns warning and/or error messages pertaining to the active target.
     * @returns {string|string}
     */
    public getErrorMessage() {
        return _.union(_.values(this.target.errors), _.values(this.target.warnings)).join(", ") || "";
    }

    //  +=================+
    //  | AutoCompletions |
    //  +-----------------+

    /**
     * Metric name autocomplete hook.
     * @param metric
     * @param callback
     */
    public autoCompleteMetric = (metric, callback) => {
        const promise = this.datasource.matchMetric(metric);
        promise.then(callback);
    };

    /**
     * Tag Key/Name autocomplete hook
     * Key autocompletions are scoped to the metric and host of the current target.
     * @param key
     * @param callback
     */
    public autoCompleteTagKey = (key, callback) => {
        this.datasource.matchPointTag(key, this.target, this.panel.scopedVars).then((tags) => {
            return ["source", "tag"].concat(tags);
        }).then(callback);
    };

    /**
     * Tag Value autocomplete hook
     * Value autocompletions are scoped to the metric, host and corresponding key of the
     * current target.
     * @param key
     * @param callback
     */
    public autoCompleteTagValue = (key, callback) => {
        switch (this.target.currentTagKey) {
            case "source":
                this.datasource.matchSource(this.target.metric, key, this.panel.scopedVars).then(callback);
                return;
            case "tag":
                this.datasource.matchSourceTag(key).then(callback);
                return;
            default:
                this.datasource.matchPointTagValue(this.target.currentTagKey, key, this.target, this.panel.scopedVars).then(callback);
        }
    };

    /**
     * Query autocomplete hook
     * NOTE: This does not translate all that well from our api. The typeahead only seems to
     * prompt auto-completions to the user if the cursor is at the end of input.
     * @param query
     * @param callback
     */
    public autoCompleteQuery = (query, callback) => {
        this.datasource.matchQuery(query, this.target.rawQueryPos).then(callback);
    };

    /**
     * Helper to track the cursor position within the raw query input.
     * @param keyUp
     */
    public updateRawQueryCursor(keyUp) {
        if (keyUp.target.selectionStart >= 0) {
            this.target.rawQueryPos = keyUp.target.selectionStart;
        }
    }

    //  +======+
    //  | Tags |
    //  +------+

    /**
     * Adds the current tag to this target.
     */
    public addTag() {
        if (!this.addTagMode) {
            this.addTagMode = true;
            return;
        }

        if (!this.target.tags) {
            this.target.tags = [];
        }

        if (this.target.currentTagKey && this.target.currentTagValue) {
            // Add an operator if this is not the first kvp
            if (this.target.tags.length) {
                this.target.tags.push({
                    isAnd: true, type: "operator"
                });
            }
            this.target.tags.push({
                key: this.target.currentTagKey, value: this.target.currentTagValue, type: "atom"
            });
        }

        this.target.currentTagKey = "";
        this.target.currentTagValue = "";
        this.addTagMode = false;
        this.refresh();
    }

    public addParenthesis(index) {
        if (this.target.tags[index] || this.target.tags[index].type === "atom") {
            this.target.tags.splice(index, 0, {
                type: "parenthesis", isOpen: true
            });
            this.target.tags.splice(index + 2, 0, {
                type: "parenthesis", isOpen: false
            });
        }
    }

    /**
     * This makes a [linear] attempt to repair the filter expression (e.g. after the removal of a
     * kvp).
     * @returns {boolean}
     */
    private fixTags() {
        let seenAtom = false;
        let lastOpen = false;
        let didChange = false;
        const tags = this.target.tags;

        for (let i = 0; i < tags.length; ++i) {
            const cur = tags[i];
            switch (cur.type) {
                case "atom":
                    seenAtom = true;
                    lastOpen = false;
                    break;
                case "operator":
                    if (!seenAtom || i === 0 || i === tags.length - 1 || (tags[i - 1].type === "parenthesis" && tags[i - 1].isOpen) || (tags[i + 1].type === "parenthesis" && !tags[i + 1].isOpen)) {
                        // dangling:
                        tags.splice(i, 1);
                        i -= 1;
                        didChange = true;
                    }
                    seenAtom = false;
                    lastOpen = false;
                    break;
                case "parenthesis":
                    if (lastOpen && !cur.isOpen) {
                        i -= 1;
                        tags.splice(i, 2);
                        i -= 1;
                        didChange = true;
                        lastOpen = false;
                    } else {
                        lastOpen = cur.isOpen;
                    }
                    break;
                default:
                    break;
            }
        }
        return didChange;
    }

    /**
     * Returns the n-th atom left of index without "crossing" any parenthesis.
     * @param index
     * @param n
     * @returns {number} the index or -1 if not found.
     */
    private findNthLeftAtom(index, n) {
        if (!n || n < 0) {
            return -1;
        }

        const tags = this.target.tags;

        for (let i = index - 1; i >= 0; --i) {
            if (tags[i].type === "atom") {
                --n;
                if (n === 0) {
                    return i;
                }
            }
            if (tags[i].type === "parenthesis") {
                return -1;
            }
        }

        return -1;
    }

    /**
     * Returns the n-th atom right of index without "crossing" any parenthesis.
     * @param index
     * @param n
     * @returns {*}
     */
    private findNthRightAtom(index, n) {
        if (!n || n < 0) {
            return -1;
        }

        const tags = this.target.tags;

        for (let i = index + 1; i < tags.length; ++i) {
            if (tags[i].type === "atom") {
                --n;
                if (n === 0) {
                    return i;
                }
            }
            if (tags[i].type === "parenthesis") {
                return -1;
            }
        }

        return -1;
    }

    /**
     * Computes the index of the matching parenthesis.
     * @param index
     * @returns {*}
     */
    private findMatchingParenthesis(index) {
        const tags = this.target.tags;

        if (tags && tags[index].type === "parenthesis") {
            let n;
            let i;
            if (tags[index].isOpen) {
                n = 1;
                // search right
                for (i = index + 1; i < tags.length; ++i) {
                    if (tags[i].type === "parenthesis") {
                        n += tags[i].isOpen ? +1 : -1;
                        if (n === 0) {
                            return i;
                        }
                    }
                }
            } else {
                n = -1;
                // search left
                for (i = index - 1; i >= 0; --i) {
                    if (tags[i].type === "parenthesis") {
                        n += tags[i].isOpen ? +1 : -1;
                        if (n === 0) {
                            return i;
                        }
                    }
                }
            }
        }
        return -1;
    }

    /**
     * Expands the parenthesis at index.
     * @param index
     */
    public expandParenthesis(index) {
        let newIndex = this.target.tags[index].isOpen ? this.findNthLeftAtom(index, 1) : this.findNthRightAtom(index, 1);

        if (newIndex >= 0 && newIndex !== index) {
            newIndex = this.target.tags[index].isOpen ? newIndex : newIndex + 1;
            const par = this.target.tags.splice(index, 1)[0];
            // Adjust newIndex for the removed element
            newIndex = newIndex > index ? newIndex - 1 : newIndex;
            this.target.tags.splice(newIndex, 0, par);
            this.refresh();
        }
    }

    /**
     * Narrows the parenthesis at index.
     * @param index
     */
    public narrowParenthesis(index) {
        let newIndex = this.target.tags[index].isOpen ? this.findNthRightAtom(index, 2) : this.findNthLeftAtom(index, 2);

        if (newIndex >= 0 && newIndex !== index) {
            newIndex = this.target.tags[index].isOpen ? newIndex : newIndex + 1;
            const par = this.target.tags.splice(index, 1)[0];
            // Adjust newIndex for the removed element
            newIndex = newIndex > index ? newIndex - 1 : newIndex;
            this.target.tags.splice(newIndex, 0, par);
            // We can end up with an empty parenthesis pair at this point
            while (this.fixTags()) {
            } // jshint ignore:line
            this.refresh();
        }
    }

    public canExpand(index) {
        const newIndex = this.target.tags[index].isOpen ? this.findNthLeftAtom(index, 1) : this.findNthRightAtom(index, 1);

        return newIndex >= 0 && newIndex !== index;
    }

    public canNarrow(index) {
        const newIndex = this.target.tags[index].isOpen ? this.findNthRightAtom(index, 2) : this.findNthLeftAtom(index, 2);

        return newIndex >= 0 && newIndex !== index;
    }

    /**
     * Removes the parenthesis at index together with its sibling.
     * @param index
     */
    public removeParenthesis(index) {
        const siblingIndex = this.findMatchingParenthesis(index);
        if (siblingIndex >= 0) {
            this.target.tags.splice(Math.max(index, siblingIndex), 1);
            this.target.tags.splice(Math.min(index, siblingIndex), 1);
        }
    }

    /**
     * Removes a tag from this target.
     * @param index
     */
    public removeTag(index) {
        this.target.tags.splice(index, 1);
        while (this.fixTags()) {
        } // jshint ignore:line
        this.refresh();
    }

    //  +===========+
    //  | Functions |
    //  +-----------+

    /**
     * Wraps the expression for the active target in a function.
     * @param definition the function defintion
     */
    public addFunction(definition) {
        const newFunction = functions.createInstance(definition, {withDefaultParameters: true});
        newFunction.added = true;
        this.target.functions.push(newFunction);
        this.refresh();
    }

    /**
     * Removes the function at index from the active target. Indices go from outer to inner
     * functions. E.g. for f(g(h())), indices 0,1,2 respectively reference 'f','g','h'
     * @param index
     */
    public removeFunction(index) {
        this.target.functions.splice(index, 1);
        this.refresh();
    }

    /**
     * Moves a function in the active target's telescoping expression. E.g. for f(g(h())),
     * moveFunction(0,2) results in g(h(f()))
     * @param fromIndex
     * @param toIndex
     */
    public moveFunction(fromIndex, toIndex) {
        // even though lodash has _.move function, we get a TypeScript compile error since it's not part of DefinitelyTyped
        function _move(a, b, c) {
            a.splice(c, 0, a.splice(b, 1)[0]);
            return a;
        }

        _move(this.target.functions, fromIndex, toIndex);
        this.refresh();
    }

    //  +=====================+
    //  | Regular Expressions |
    //  +---------------------+

    /**
     * Adds a new regex-replacement pair.
     */
    public addRegex() {
        if (this.target.currentRegex && this.target.currentReplacement) {
            this.target.regexes = this.target.regexes || [];

            this.target.regexes.push({
                regex: this.target.currentRegex, replacement: this.target.currentReplacement
            });

            delete this.target.currentRegex;
            delete this.target.currentReplacement;
            this.refresh();
        }
    }

    /**
     * Removes the regex-replacement pair at index.
     */
    public removeRegex(index) {
        this.target.regexes.splice(index, 1);
        this.refresh();
    }
}
