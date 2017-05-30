import _ from "lodash";
import functions from "./functions";
import {dateToEpochSeconds, intervalToSeconds, sanitizeUrl, sanitizeTag, sanitizePartial, stripQuotesAndTrim, nameForTimeseries, clearErrorsAndWarnings, errorMsg, logResult} from "./helpers";
import angular = require("angular");
import BackendSrvCancelledRetriesDecorator from './backendSrvCanelledRetriesDecorator';

const queryKeyLookbackMillis = 7 * 24 * 60 * 60 * 1000;

export function WavefrontDatasource(instanceSettings, $q, backendSrv, templateSrv) {
    this.url = sanitizeUrl(instanceSettings.url);

    this.type = instanceSettings.type;
    this.name = instanceSettings.name;
    this.q = $q;
    this.backendSrv = new BackendSrvCancelledRetriesDecorator(backendSrv, $q);
    this.templateSrv = templateSrv;
    this.defaultRequestTimeoutSecs = 15;

    this.requestConfigProto = {
        headers: {
            "Content-Type": "application/json",
        }, timeout: (instanceSettings.jsonData.timeoutSecs || this.defaultRequestTimeoutSecs) * 1000,
    };

    if (instanceSettings.jsonData.wavefrontToken) {
        this.requestConfigProto.headers["X-AUTH-TOKEN"] = instanceSettings.jsonData.wavefrontToken;
    } else {
        this.requestConfigProto.withCredentials = true;
    }

    const getUserString = () => {
        let result = "";
        const span = $("span[class='dashboard-title ng-binding']");

        if (window && window.grafanaBootData && window.grafanaBootData.user) {
            const user = window.grafanaBootData.user;
            if (user.email) {
                result = user.email;
            }
            if (user.login && result === "") {
                result += (result ? "#" : "") + user.login;
            }
            if (user.name && result === "") {
                result += (result ? "#" : "") + user.name;
            }

            if (span.length !== 0) {
                result += "#dashboard:" + span.html();
            }
        }
        return result;
    };
    const userString = getUserString();

    this.query = (options: IGrafanaPluginDataSourceQueryOptions): angular.IPromise<any> => {
        // Query Window
        const startSecs = dateToEpochSeconds(options.range.from);
        const endSecs = dateToEpochSeconds(options.range.to);
        const intervalSecs = intervalToSeconds(options.interval);
        const numPoints = Math.floor(Math.min(options.maxDataPoints, Math.floor((endSecs - startSecs) / intervalSecs))) || 4000;
        const summarization = options.scopedVars.summarization.toUpperCase();
        const granularity = options.scopedVars.granularity.substring(0, 1);
        const includeObsoleteMetrics = options.scopedVars.includeObsolete || false;
        const baseEvent = {
            autoEvents: false, e: endSecs, i: true, listMode: false, n: userString, p: numPoints, s: startSecs, strict: true, summarization, g: granularity, includeObsoleteMetrics,
        };

        // Create queries for each target and determine active count
        const reqs = options.targets.map((target) => {
            if (target.hide) {
                return this.q.when([]);
            }

            const q = this.makeQuery(target);
            if (!q) {
                return this.q.when([]);
            }

            const reqConfig = this.baseRequestConfig("GET", "chart/api", {
                ...baseEvent, q,
            });

            return this.backendSrv.datasourceRequest(reqConfig).then((result) => {
                clearErrorsAndWarnings(target);
                if (result.data.warnings) {
                    target.warnings.query = result.data.warnings;
                }

                if (!result.data.timeseries) {
                    return [];
                }

                return result.data.timeseries
                    .map((ts: any) => ({
                        datapoints: ts.data.map((data) => [data[1], data[0] * 1000]), target: nameForTimeseries(target, result.data.query, ts, this.templateSrv) || "",
                    }))
                    .sort((targetA, targetB) => targetA.target.localeCompare(targetB.target));
            }, (result) => {
                clearErrorsAndWarnings(target);
                target.errors.query = errorMsg(result);
                logResult(result);
                return [];
            });
        }, this);

        return this.q.all(reqs).then((results) => {
            return {data: _.flatten(results)};
        });
    };

    this.testDatasource = () => {
        return this.requestAutocomplete("grafanaDatasourceTest").then((result) => {
            return {
                message: "Successfully connected to Wavefront! " + "(" + result.status + ")", status: "success", title: "Success",
            };
        }, (result) => ({
            message: "Response was: " + "(" + result.status + ") " + result.statusText, status: "error", title: "Failure",
        }));
    };

    this.annotationQuery = (options: IGrafanaPluginDataSourceAnnotationOptions) => {
        // Query Window
        const startSecs = dateToEpochSeconds(options.range.from);
        const endSecs = dateToEpochSeconds(options.range.to);

        const reqConfig = this.baseRequestConfig("GET", "api/v2/chart/api", {
            n: "queryId",
            q: this.templateSrv.replace(options.annotation.query),
            s: startSecs,
            e: endSecs,
            g: "s",
            p: options.annotation.limit || 100,
            i: true,
            autoEvents: false,
            summarization: "MEAN",
            listMode: false,
            includeObsoleteMetrics: false,
            strict: true,
        });

        return this.backendSrv.datasourceRequest(reqConfig).then((result) => {
            return result.data.events
                .filter((event: any) => Math.floor(event.start / 1000) >= startSecs)
                .map((event: any) => ({
                    annotation: options.annotation, time: event.start, title: event.name || "unknown", text: event.tags.details || "", tags: event.tags,
                }));
        }, (result) => {
            logResult(result);
            return [];
        });
    };

    this.matchChildren = (metricPrefix: string) => {
        const reqConfig = this.baseRequestConfig("GET", "chart/metrics/all", {
            trie: true, q: metricPrefix,
        },);

        return this.backendSrv.datasourceRequest(reqConfig).then((result) => {
            return result.data.metrics || [];
        }, (result) => []);
    };

    this.matchMetric = (metric: string) => {
        metric = metric || "";

        console.log("matchMetric() - " + metric);

        const metricQuery = "ts(" + metric.trim();

        return this.requestAutocomplete(metricQuery).then((result) => {
            return _.filter(result.data.symbols, (m: string) => {
                return (m.indexOf("=") < 0);
            });
        }, (result) => []);
    };

    this.matchMetricAlt = (metric: string) => {
        const query = "ts(\"" + stripQuotesAndTrim(metric) + "\")";

        return this.requestQueryKeysLookup(query).then((result) => {
            return result.data.metrics || [];
        }, (result) => []);
    };

    this.matchQuery = (query: string, position: number) => {
        query = query || "";
        const boundedQuery = this.templateSrv.replace(query);

        return this.requestAutocomplete(boundedQuery, position).then((result) => {
            return _.map(result.data.symbols, (symbol) => {
                    return query.substr(0, result.data.start) + symbol + query.substr(result.data.end);
                }) || [];
        }, (result) => []);
    };

    this.matchSource = (metric: string, host: string) => {
        const query = "ts(\"" + stripQuotesAndTrim(metric) + "\", source=\"" + sanitizePartial(host) + "\")";

        return this.requestQueryKeysLookup(query).then((result) => {
            return result.data.hosts || [];
        }, (result) => []);
    };

    this.matchPointTag = (partialTag: any, target: any) => {
        partialTag = partialTag || "";
        partialTag = partialTag.toLowerCase();

        const query = this.makeQuery(target, true);

        if (!query) {
            return [];
        }

        return this.requestQueryKeysLookup(query).then((result) => {
            // Generate all Point tags for the query
            const allTags = {};
            _.forEach(result.data.queryKeys, (qk) => {
                _.merge(allTags, qk.tags);
            });

            // Filter by partial tag
            const matches = _.filter(_.keys(allTags), (tag) => {
                return tag.toLowerCase().indexOf(partialTag) > -1;
            });

            return matches;
        }, (result) => []);
    };

    this.matchSourceTagName = (partialName: any) => {
        partialName = partialName || "";
        partialName = partialName.toLowerCase();

        const reqConfig = this.baseRequestConfig("GET", "api/manage/source");
        reqConfig.params = {
            limit: 1
        };

        return backendSrv.datasourceRequest(reqConfig).then(function onSuccess(result) {
            return _.filter(_.keys(result.data.counts), (tag) => {
                return tag.toLowerCase().indexOf(partialName) > -1;
            });
        }, (result) => []);
    };

    this.matchPointTagValue = (tag: any, partialValue: any, target: any) => {
        // Don't try to autocomplete if the corresponding tag name is empty
        if (!tag) {
            return [];
        }

        const op = {
            isAnd: false, type: "operator",
        };
        const kvp = {
            key: sanitizeTag(tag), value: sanitizePartial(partialValue), type: "atom",
        };

        const query = target.tags.length ? this.makeQuery(target, true, op, kvp) : this.makeQuery(target, true, kvp);

        return this.requestQueryKeysLookup(query).then((result) => {
            // Generate all Point tag values under the tag for the query
            const allValues = {};
            _.forEach(result.data.queryKeys, (qk) => {
                if (qk.tags[tag]) {
                    allValues[qk.tags[tag]] = true;
                }
            });

            return _.keys(allValues);
        }, (result) => []);
    };

    this.metricFindQuery = (options: any) => {
        const target = typeof (options) === "string" ? options : options.target;

        const boundedQuery = this.templateSrv.replace(target);
        const childrenRegex = /children\((.*)\)/;

        const interpolated = {
            target: this.templateSrv.replace(target),
        };

        const resultWrapper = (result) => {
            return _.map(result, (value) => {
                return {text: value};
            });
        };

        const childrenQuery = boundedQuery.match(childrenRegex);
        if (childrenQuery) {
            return this.matchChildren(childrenQuery[1]).then(resultWrapper);
        }

        const metricsRegex = /metric\((.*)\)/;
        const metricsQuery = boundedQuery.match(metricsRegex);
        if (metricsQuery) {
            return this.matchMetricAlt(metricsQuery[1]).then(resultWrapper);
        }

        const hostNameRegex = /hostName\((.*),\s?(.*)\)/;
        const hostNameQuery = boundedQuery.match(hostNameRegex);
        if (hostNameQuery) {
            return this.matchSource(hostNameQuery[1], hostNameQuery[2]).then(resultWrapper);
        }

        const tagNameRegex = /tagName\((.*),\s?(.*)\)/;
        const tagNameQuery = boundedQuery.match(tagNameRegex);
        if (tagNameQuery) {
            return this.matchPointTag(tagNameQuery[2], {
                metric: stripQuotesAndTrim(tagNameQuery[1]),
            }).then(resultWrapper);
        }

        const tagValueRegex = /tagValue\((.*),\s?(.*),\s?(.*)\)/;
        const tagValueQuery = boundedQuery.match(tagValueRegex);
        if (tagValueQuery) {
            return this.matchPointTagValue(tagValueQuery[2], tagValueQuery[3], {
                metric: stripQuotesAndTrim(tagValueQuery[1]), tags: [],
            }).then(resultWrapper);
        }

        return this.backendSrv.datasourceRequest({
            data: interpolated, headers: {"Content-Type": "application/json"}, method: "POST", url: this.url + "/search",
        }).then(this.mapToTextValue);
    };

    this.mapToTextValue = (result) => {
        return _.map(result.data, (d: any, i) => {
            if (d && d.text && d.value) {
                return {text: d.text, value: d.value};
            }
            return {text: d, value: i};
        });
    };

    this.requestQueryKeysLookup = (query) => {
        const lookbackStartSecs = Math.floor((new Date().getTime() - queryKeyLookbackMillis) / 1000);

        const request = {
            queries: [{
                query, name: "queryKeyLookup",
            }], start: lookbackStartSecs,
        };

        const reqConfig = this.baseRequestConfig("GET", "chart/api/keys", {
            request,
        });

        return this.backendSrv.datasourceRequest(reqConfig);
    };

    this.buildQueryParameters = (options) => {
        // remove placeholder targets
        options.targets = _.filter(options.targets, (target: any) => {
            return target.target !== "select metric";
        });

        const targets = _.map(options.targets, (target: any) => {
            const newTarget: any = {
                hide: target.hide, refId: target.refId, type: target.type || "timeseries",
            } as any;

            if (target.target) {
                newTarget.target = this.templateSrv.replace(target.target);
            }
        });

        options.targets = targets;

        return options;
    };

    /**
     * Builds a basic RequestConfig for use with this datasource
     * @param method The request method (e.g. 'GET')
     * @param path the resource path
     * @param params request parameters
     * @returns {XMLList|XML}
     */
    this.baseRequestConfig = (method, path, params) => {
        return {
            ...this.requestConfigProto, url: this.url + path, method, params: params || {},
        };
    };

    /**
     * Requests a symbolic autocomplete from the Wavefront backend. The backend attempts to
     * autocomplete the symbol at supplied cursor offset.
     * @param expression the (partial) ts expression
     * @param position cursor position within the ts expression
     * @returns {*}
     */
    this.requestAutocomplete = (expression, position?) => {
        let pos = position;

        // default is to autocomplete the last symbol
        if (!pos && pos !== 0) {
            pos = expression.length;
        }

        const reqConfig = this.baseRequestConfig("GET", "chart/autocomplete", {
            exp: expression, p: pos,
        });

        return this.backendSrv.datasourceRequest(reqConfig);
    };

    this.makeQuery = (target, ignoreFunctions?, ...args: any[]) => {
        if (target.textEditor) {
            return this.templateSrv.replace(target.query);
        }

        if (!target.metric) {
            return "";
        }
        let query = "ts(\"" + target.metric + "\"";

        // Filter part
        const tags = _.clone(target.tags) || [];

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < args.length; ++i) {
            tags.push(args[i]);
        }

        if (tags.length) {
            query += ", " + this.makeFilterString(tags);
        }

        query += ")";

        if (!ignoreFunctions && target.functions) {
            query = _.reduce(target.functions, (q, f) => {
                return functions.queryString(f, q);
            }, query);
        }

        // Variable replacement
        query = this.templateSrv.replace(query);

        return query;
    };

    this.makeFilterString = (tags) => {
        let result = "";
        _.each(tags, (component) => {
            switch (component.type) {
                case "atom":
                    result += sanitizeTag(component.key) + "=\"" + component.value + "\"";
                    break;
                case "operator":
                    result += component.isAnd ? " and " : " or ";
                    break;
                case "parenthesis":
                    result += component.isOpen ? "(" : ")";
                    break;
                default:
                    break;
            }
        });
        return result;
    };
}
