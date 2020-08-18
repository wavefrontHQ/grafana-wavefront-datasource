import _ from "lodash";
import functions from "./functions";
import {dateToEpochSeconds, intervalToSeconds, sanitizeUrl, sanitizeTag, sanitizePartial, stripQuotesAndTrim, nameForTimeseries, clearErrorsAndWarnings, errorMsg, logResult} from "./helpers";
import angular from "angular";
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
        },
        timeout: (instanceSettings.jsonData.timeoutSecs || this.defaultRequestTimeoutSecs) * 1000,
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

        const baseEvent = {
            autoEvents: false, e: endSecs, i: true, listMode: false, n: userString, p: numPoints, s: startSecs, strict: true,
        };

        // Create queries for each target and determine active count
        const reqs = options.targets.map((target) => {
            if (target.hide) {
                return this.q.when([]);
            }

            const q = this.makeQuery(target, options.scopedVars);
            if (!q) {
                return this.q.when([]);
            }

            // options.scopedVars is the old (and broken) way to handle these. backwards compatible
            const summarization = target.summarization ? target.summarization.toUpperCase() :
                options.scopedVars.summarization ? options.scopedVars.summarization.toUpperCase() : "MEAN";
            const granularity = target.granularity ? target.granularity.substring(0, 1) :
                options.scopedVars.granularity  ? options.scopedVars.granularity.substring(0, 1) : "s";
            const includeObsoleteMetrics = target.includeObsolete || options.scopedVars.includeObsolete || false;

            const reqConfig = this.baseRequestConfig("GET", "chart/api", {
                ...baseEvent, summarization, g: granularity, includeObsoleteMetrics, q,
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
            var resultSeries = lodash_1.default.flatten(results);
            var filteredSeries = lodash_1.default.filter(resultSeries, function (d) { return d.datapoints.length > 0; });
            return { data: filteredSeries };
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

    this.metricFindQuery = (options: any) => {
        const target = typeof (options) === "string" ? options : options.target;

        const boundedQuery = this.templateSrv.replace(target);

        if (target === "") {
            return $q.when([]).then(() => {
                return [];
            }, () => {
                return [];
            });
        }

        const resultWrapper = (result) => {
            return _.map(result, (value) => {
                return {text: value};
            });
        };

        // metric search: metrics: ts(...)
        // wildcards in metric name are valid (and expected)
        const metricsRegex = /metrics?\s*:(.*)/;
        const metricsQuery = boundedQuery.match(metricsRegex);
        if (metricsQuery) {
            return this.matchMetricTS(metricsQuery[1]).then(resultWrapper);
        }

        // source search : sources: ts(...)
        const sourceRegex = /sources?\s*:(.*)/;
        const sourceQuery = boundedQuery.match(sourceRegex);
        if (sourceQuery) {
            return this.matchSourceTS(sourceQuery[1]).then(resultWrapper);
        }

        // Source tag search: sourceTags: ts(...)
        const sourceTagRegex = /source[tT]ags?\s*:(.*)/;
        const sourceTagQuery = boundedQuery.match(sourceTagRegex);
        if (sourceTagQuery) {
            return this.matchSourceTagTS(sourceTagQuery[1]).then(resultWrapper);
        }

        // Matching Source tag search: sourceTags: ts(...)
        const matchingSourceTagRegex = /matching[sS]ource[tT]ags?\s*:(.*)/;
        const matchingSourceTagQuery = boundedQuery.match(matchingSourceTagRegex);
        if (matchingSourceTagQuery) {
            return this.matchMatchingSourceTagTS(matchingSourceTagQuery[1]).then(resultWrapper);
        }

        // Tag Name search: tagNames: ts(...)
        const tagNameRegex = /tag[nN]ames?\s*:(.*)/;
        const tagNameQuery = boundedQuery.match(tagNameRegex);
        if (tagNameQuery) {
            return this.matchPointTagTS(tagNameQuery[1]).then(resultWrapper);
        }

        // Tag Value search: tagValues(<tag>): ts(...)
        const tagValueRegex = /tag[vV]alues?\s*\((.+)\)\s*:(.*)/;
        const tagValueQuery = boundedQuery.match(tagValueRegex);
        if (tagValueQuery) {
            return this.matchPointTagValueTS(tagValueQuery[1], tagValueQuery[2]).then(resultWrapper);
        }

        return $q.when([]).then(() => {
            return [];
        }, () => {
            return [];
        });
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

    this.interpolateVariablesInQueries = (queries: DataQuery[]): DataQuery[] => {
      if (queries && queries.length > 0) {
        return queries.map(query => {
          return {
            ...query,
            query: this.templateSrv.replace(query.query),
          };
        });
      }
      return queries;
    }

    this.matchMetric = (metric: string) => {
        metric = metric || "";

        const metricQuery = "ts(" + metric.trim();

        return this.requestAutocomplete(metricQuery).then((result) => {
            return _.filter(result.data.symbols, (m: string) => {
                return (m.indexOf("=") < 0);
            });
        }, (result) => []);
    };

    this.matchMetricTS = (query: string) => {
        return this.requestQueryKeysLookup(query.trim()).then((result) => {
            return result.data.metrics || [];
        }, (result) => []);
    };

    this.matchSource = (metric: string, host: string, scopedVars: any) => {
        let query = "ts(\"" + stripQuotesAndTrim(metric) + "\", source=\"" + sanitizePartial(host) + "\")";
        query = this.templateSrv.replace(query, scopedVars);
        
        return this.requestQueryKeysLookup(query).then((result) => {
            return result.data.hosts || [];
        }, (result) => []);
    };

    this.matchSourceTS = (query: string) => {
        return this.requestQueryKeysLookup(query.trim()).then((result) => {
            return result.data.hosts || [];
        }, (result) => []);
    };

    this.matchSourceTag = (partialName: any) => {
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

    this.matchSourceTagTS = (query: string) => {
        return this.requestQueryKeysLookup(query.trim(), true).then((result) => {
            return result.data.hostTags || [];
        }, (result) => []);
    };

    this.matchMatchingSourceTagTS = (query: string) => {
        return this.requestQueryKeysLookup(query.trim(), true).then((result) => {
            return result.data.matchingHostTags || [];
        }, (result) => []);
    };

    this.matchPointTag = (partialTag: any, target: any, scopedVars: any) => {
        partialTag = partialTag || "";
        partialTag = partialTag.toLowerCase();
        if (partialTag === "*") {
            partialTag = "";
        }

        const query = this.makeQuery(target, scopedVars, true);

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
            return _.filter(_.keys(allTags), (tag) => {
                return tag.toLowerCase().indexOf(partialTag) > -1;
            });
        }, (result) => []);
    };

    this.matchPointTagTS = (query: string) => {
        return this.requestQueryKeysLookup(query.trim()).then((result) => {
            // Generate all Point tags for the query
            const allTags = {};
            _.forEach(result.data.queryKeys, (qk) => {
                _.merge(allTags, qk.tags);
            });
            return _.keys(allTags);
        }, (result) => []);
    };

    this.matchPointTagValue = (tag: any, partialValue: any, target: any, scopedVars: any) => {
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

        const query = target.tags && target.tags.length ? this.makeQuery(target, scopedVars, true, op, kvp) : this.makeQuery(target, true, kvp);

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

    this.matchPointTagValueTS = (tag: string, query: string) => {
        return this.requestQueryKeysLookup(query.trim()).then((result) => {
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

    this.requestQueryKeysLookup = (query, includeHostTags?) => {
        const lookbackStartSecs = Math.floor((new Date().getTime() - queryKeyLookbackMillis) / 1000);

        const request = {
            queries: [
            {
                query,
                name: "queryKeyLookup"
            },
           ],
           start: lookbackStartSecs,
           noHostTags: true,
        };

        const hostTagsFilter = includeHostTags ? "" : "?noHostTags=true";

        const reqConfig = this.baseRequestConfig("GET", "chart/api/keys" + hostTagsFilter, {
            request: JSON.stringify(request),
        });

        return this.backendSrv.datasourceRequest(reqConfig);
    };

    this.makeQuery = (target, scopedVars?, ignoreFunctions?, ...args: any[]) => {
        let query;

        if (target.textEditor) {
            query = target.query;
        } else {
            query = this.buildQuery(target, ignoreFunctions, args);
        }

        // Variable replacement
        query = this.templateSrv.replace(query, scopedVars);
        return query;
    };

    this.buildQuery = (target, ignoreFunctions?, ...args: any[]) => {
        if (!target.metric) {
            return "";
        }

        let query = "ts(\"" + target.metric + "\"";

        // Filter part
        const tags = _.clone(target.tags) || [];

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < args.length; ++i) {
            if (args[i].length) {
                tags.push(args[i]);
            }
        }

        if (tags.length) {
            query += ", " + this.buildFilterString(tags);
        }

        query += ")";

        if (!ignoreFunctions && target.functions) {
            query = _.reduce(target.functions, (q, f) => {
                return functions.queryString(f, q);
            }, query);
        }

        return query;
    };

    this.buildFilterString = (tags) => {
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

    /**
     * Builds a basic RequestConfig for use with this datasource
     * @param method The request method (e.g. 'GET')
     * @param path the resource path
     * @param params request parameters
     * @returns {JSON}
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

}
