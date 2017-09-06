System.register(["app/plugins/sdk", "lodash", "./functions", "./wf-directives.js", "../css/query.editor.css!"], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __moduleName = context_1 && context_1.id;
    var sdk_1, lodash_1, functions_1, WavefrontQueryCtrl;
    return {
        setters: [
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (functions_1_1) {
                functions_1 = functions_1_1;
            },
            function (_1) {
            },
            function (_2) {
            }
        ],
        execute: function () {
            WavefrontQueryCtrl = (function (_super) {
                __extends(WavefrontQueryCtrl, _super);
                function WavefrontQueryCtrl($scope, $injector) {
                    var _this = _super.call(this, $scope, $injector) || this;
                    _this.addTagMode = false;
                    _this.autoCompleteMetric = function (metric, callback) {
                        var promise = _this.datasource.matchMetric(metric);
                        promise.then(callback);
                    };
                    _this.autoCompleteTagKey = function (key, callback) {
                        _this.datasource.matchPointTag(key, _this.target, _this.panel.scopedVars).then(function (tags) {
                            return ["source", "tag"].concat(tags);
                        }).then(callback);
                    };
                    _this.autoCompleteTagValue = function (key, callback) {
                        switch (_this.target.currentTagKey) {
                            case "source":
                                _this.datasource.matchSource(_this.target.metric, key, _this.panel.scopedVars).then(callback);
                                return;
                            case "tag":
                                _this.datasource.matchSourceTag(key).then(callback);
                                return;
                            default:
                                _this.datasource.matchPointTagValue(_this.target.currentTagKey, key, _this.target, _this.panel.scopedVars).then(callback);
                        }
                    };
                    _this.autoCompleteQuery = function (query, callback) {
                        _this.datasource.matchQuery(query, _this.target.rawQueryPos).then(callback);
                    };
                    _this.target.summarization = _this.panel.summarization;
                    _this.target.granularity = _this.panel.granularity;
                    _this.target.includeObsolete = _this.panel.includeObsolete;
                    _this.target.rawQueryPos = 0;
                    _this.target.errors = {};
                    _this.target.warnings = {};
                    _this.target.functions = _this.target.functions || [];
                    if (_this.target.rawMode) {
                        _this.target.textEditor = true;
                    }
                    return _this;
                }
                WavefrontQueryCtrl.prototype.toggleEditorMode = function () {
                    if (!this.target.textEditor && (!this.target.query || this.target.query === "")) {
                        this.target.query = this.datasource.buildQuery(this.target);
                    }
                    this.target.textEditor = !this.target.textEditor;
                };
                WavefrontQueryCtrl.prototype.getErrorMessage = function () {
                    return lodash_1.default.union(lodash_1.default.values(this.target.errors), lodash_1.default.values(this.target.warnings)).join(", ") || "";
                };
                WavefrontQueryCtrl.prototype.updateRawQueryCursor = function (keyUp) {
                    if (keyUp.target.selectionStart >= 0) {
                        this.target.rawQueryPos = keyUp.target.selectionStart;
                    }
                };
                WavefrontQueryCtrl.prototype.addTag = function () {
                    if (!this.addTagMode) {
                        this.addTagMode = true;
                        return;
                    }
                    if (!this.target.tags) {
                        this.target.tags = [];
                    }
                    if (this.target.currentTagKey && this.target.currentTagValue) {
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
                };
                WavefrontQueryCtrl.prototype.addParenthesis = function (index) {
                    if (this.target.tags[index] || this.target.tags[index].type === "atom") {
                        this.target.tags.splice(index, 0, {
                            type: "parenthesis", isOpen: true
                        });
                        this.target.tags.splice(index + 2, 0, {
                            type: "parenthesis", isOpen: false
                        });
                    }
                };
                WavefrontQueryCtrl.prototype.fixTags = function () {
                    var seenAtom = false;
                    var lastOpen = false;
                    var didChange = false;
                    var tags = this.target.tags;
                    for (var i = 0; i < tags.length; ++i) {
                        var cur = tags[i];
                        switch (cur.type) {
                            case "atom":
                                seenAtom = true;
                                lastOpen = false;
                                break;
                            case "operator":
                                if (!seenAtom || i === 0 || i === tags.length - 1 || (tags[i - 1].type === "parenthesis" && tags[i - 1].isOpen) || (tags[i + 1].type === "parenthesis" && !tags[i + 1].isOpen)) {
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
                                }
                                else {
                                    lastOpen = cur.isOpen;
                                }
                                break;
                            default:
                                break;
                        }
                    }
                    return didChange;
                };
                WavefrontQueryCtrl.prototype.findNthLeftAtom = function (index, n) {
                    if (!n || n < 0) {
                        return -1;
                    }
                    var tags = this.target.tags;
                    for (var i = index - 1; i >= 0; --i) {
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
                };
                WavefrontQueryCtrl.prototype.findNthRightAtom = function (index, n) {
                    if (!n || n < 0) {
                        return -1;
                    }
                    var tags = this.target.tags;
                    for (var i = index + 1; i < tags.length; ++i) {
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
                };
                WavefrontQueryCtrl.prototype.findMatchingParenthesis = function (index) {
                    var tags = this.target.tags;
                    if (tags && tags[index].type === "parenthesis") {
                        var n = void 0;
                        var i = void 0;
                        if (tags[index].isOpen) {
                            n = 1;
                            for (i = index + 1; i < tags.length; ++i) {
                                if (tags[i].type === "parenthesis") {
                                    n += tags[i].isOpen ? +1 : -1;
                                    if (n === 0) {
                                        return i;
                                    }
                                }
                            }
                        }
                        else {
                            n = -1;
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
                };
                WavefrontQueryCtrl.prototype.expandParenthesis = function (index) {
                    var newIndex = this.target.tags[index].isOpen ? this.findNthLeftAtom(index, 1) : this.findNthRightAtom(index, 1);
                    if (newIndex >= 0 && newIndex !== index) {
                        newIndex = this.target.tags[index].isOpen ? newIndex : newIndex + 1;
                        var par = this.target.tags.splice(index, 1)[0];
                        newIndex = newIndex > index ? newIndex - 1 : newIndex;
                        this.target.tags.splice(newIndex, 0, par);
                        this.refresh();
                    }
                };
                WavefrontQueryCtrl.prototype.narrowParenthesis = function (index) {
                    var newIndex = this.target.tags[index].isOpen ? this.findNthRightAtom(index, 2) : this.findNthLeftAtom(index, 2);
                    if (newIndex >= 0 && newIndex !== index) {
                        newIndex = this.target.tags[index].isOpen ? newIndex : newIndex + 1;
                        var par = this.target.tags.splice(index, 1)[0];
                        newIndex = newIndex > index ? newIndex - 1 : newIndex;
                        this.target.tags.splice(newIndex, 0, par);
                        while (this.fixTags()) {
                        }
                        this.refresh();
                    }
                };
                WavefrontQueryCtrl.prototype.canExpand = function (index) {
                    var newIndex = this.target.tags[index].isOpen ? this.findNthLeftAtom(index, 1) : this.findNthRightAtom(index, 1);
                    return newIndex >= 0 && newIndex !== index;
                };
                WavefrontQueryCtrl.prototype.canNarrow = function (index) {
                    var newIndex = this.target.tags[index].isOpen ? this.findNthRightAtom(index, 2) : this.findNthLeftAtom(index, 2);
                    return newIndex >= 0 && newIndex !== index;
                };
                WavefrontQueryCtrl.prototype.removeParenthesis = function (index) {
                    var siblingIndex = this.findMatchingParenthesis(index);
                    if (siblingIndex >= 0) {
                        this.target.tags.splice(Math.max(index, siblingIndex), 1);
                        this.target.tags.splice(Math.min(index, siblingIndex), 1);
                    }
                };
                WavefrontQueryCtrl.prototype.removeTag = function (index) {
                    this.target.tags.splice(index, 1);
                    while (this.fixTags()) {
                    }
                    this.refresh();
                };
                WavefrontQueryCtrl.prototype.addFunction = function (definition) {
                    var newFunction = functions_1.default.createInstance(definition, { withDefaultParameters: true });
                    newFunction.added = true;
                    this.target.functions.push(newFunction);
                    this.refresh();
                };
                WavefrontQueryCtrl.prototype.removeFunction = function (index) {
                    this.target.functions.splice(index, 1);
                    this.refresh();
                };
                WavefrontQueryCtrl.prototype.moveFunction = function (fromIndex, toIndex) {
                    function _move(a, b, c) {
                        a.splice(c, 0, a.splice(b, 1)[0]);
                        return a;
                    }
                    _move(this.target.functions, fromIndex, toIndex);
                    this.refresh();
                };
                WavefrontQueryCtrl.prototype.addRegex = function () {
                    if (this.target.currentRegex && this.target.currentReplacement) {
                        this.target.regexes = this.target.regexes || [];
                        this.target.regexes.push({
                            regex: this.target.currentRegex, replacement: this.target.currentReplacement
                        });
                        delete this.target.currentRegex;
                        delete this.target.currentReplacement;
                        this.refresh();
                    }
                };
                WavefrontQueryCtrl.prototype.removeRegex = function (index) {
                    this.target.regexes.splice(index, 1);
                    this.refresh();
                };
                return WavefrontQueryCtrl;
            }(sdk_1.QueryCtrl));
            WavefrontQueryCtrl.templateUrl = "partials/query.editor.html";
            exports_1("WavefrontQueryCtrl", WavefrontQueryCtrl);
        }
    };
});
//# sourceMappingURL=queryCtrl.js.map