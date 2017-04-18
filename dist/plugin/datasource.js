System.register(["lodash", "./functions", "./helpers", "./backendSrvCanelledRetriesDecorator"], function (exports_1, context_1) {
    "use strict";
    var __assign = (this && this.__assign) || Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    var __moduleName = context_1 && context_1.id;
    function WavefrontDatasource(instanceSettings, $q, backendSrv, templateSrv) {
        var _this = this;
        this.url = helpers_1.sanitizeUrl(instanceSettings.url);
        this.type = instanceSettings.type;
        this.name = instanceSettings.name;
        this.q = $q;
        this.backendSrv = new backendSrvCanelledRetriesDecorator_1.default(backendSrv, $q);
        this.templateSrv = templateSrv;
        this.defaultRequestTimeoutSecs = 15;
        this.requestConfigProto = {
            headers: {
                "Content-Type": "application/json",
            }, timeout: (instanceSettings.jsonData.timeoutSecs || this.defaultRequestTimeoutSecs) * 1000,
        };
        if (instanceSettings.jsonData.wavefrontToken) {
            this.requestConfigProto.headers["X-AUTH-TOKEN"] = instanceSettings.jsonData.wavefrontToken;
        }
        else {
            this.requestConfigProto.withCredentials = true;
        }
        var getUserString = function () {
            var result = "";
            var span = $("span[class='dashboard-title ng-binding']");
            if (window && window.grafanaBootData && window.grafanaBootData.user) {
                var user = window.grafanaBootData.user;
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
        var userString = getUserString();
        this.query = function (options) {
            var startSecs = helpers_1.dateToEpochSeconds(options.range.from);
            var endSecs = helpers_1.dateToEpochSeconds(options.range.to);
            var intervalSecs = helpers_1.intervalToSeconds(options.interval);
            var numPoints = Math.floor(Math.min(options.maxDataPoints, Math.floor((endSecs - startSecs) / intervalSecs))) || 4000;
            var summarization = options.scopedVars.summarization.toUpperCase();
            var granularity = options.scopedVars.granularity.substring(0, 1);
            var includeObsoleteMetrics = options.scopedVars.includeObsolete || false;
            var baseEvent = {
                autoEvents: false, e: endSecs, i: true, listMode: false, n: userString, p: numPoints, s: startSecs, strict: true, summarization: summarization, g: granularity, includeObsoleteMetrics: includeObsoleteMetrics,
            };
            var reqs = options.targets.map(function (target) {
                if (target.hide) {
                    return _this.q.when([]);
                }
                var q = _this.makeQuery(target);
                if (!q) {
                    return _this.q.when([]);
                }
                var reqConfig = _this.baseRequestConfig("GET", "chart/api", __assign({}, baseEvent, { q: q }));
                return _this.backendSrv.datasourceRequest(reqConfig).then(function (result) {
                    helpers_1.clearErrorsAndWarnings(target);
                    if (result.data.warnings) {
                        target.warnings.query = result.data.warnings;
                    }
                    if (!result.data.timeseries) {
                        return [];
                    }
                    return result.data.timeseries
                        .map(function (ts) { return ({
                        datapoints: ts.data.map(function (data) { return [data[1], data[0] * 1000]; }), target: helpers_1.nameForTimeseries(target, result.data.query, ts, _this.templateSrv) || "",
                    }); })
                        .sort(function (targetA, targetB) { return targetA.target.localeCompare(targetB.target); });
                }, function (result) {
                    helpers_1.clearErrorsAndWarnings(target);
                    target.errors.query = helpers_1.errorMsg(result);
                    helpers_1.logResult(result);
                    return [];
                });
            }, _this);
            return _this.q.all(reqs).then(function (results) {
                return { data: lodash_1.default.flatten(results) };
            });
        };
        this.testDatasource = function () {
            return _this.requestAutocomplete("grafanaDatasourceTest").then(function (result) {
                return {
                    message: "Successfully connected to Wavefront! " + "(" + result.status + ")", status: "success", title: "Success",
                };
            }, function (result) { return ({
                message: "Response was: " + "(" + result.status + ") " + result.statusText, status: "error", title: "Failure",
            }); });
        };
        this.annotationQuery = function (options) {
            var startSecs = helpers_1.dateToEpochSeconds(options.range.from);
            var endSecs = helpers_1.dateToEpochSeconds(options.range.to);
            var reqConfig = _this.baseRequestConfig("GET", "api/v2/chart/api", {
                n: "queryId",
                q: _this.templateSrv.replace(options.annotation.query),
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
            return _this.backendSrv.datasourceRequest(reqConfig).then(function (result) {
                return result.data.events
                    .filter(function (event) { return Math.floor(event.start / 1000) >= startSecs; })
                    .map(function (event) { return ({
                    annotation: options.annotation, time: event.start, title: event.name || "unknown", text: event.tags.details || "", tags: event.tags,
                }); });
            }, function (result) {
                helpers_1.logResult(result);
                return [];
            });
        };
        this.matchChildren = function (metricPrefix) {
            var reqConfig = _this.baseRequestConfig("GET", "chart/metrics/all", {
                trie: true, q: metricPrefix,
            });
            return _this.backendSrv.datasourceRequest(reqConfig).then(function (result) {
                return result.data.metrics || [];
            }, function (result) { return []; });
        };
        this.matchMetric = function (metric) {
            metric = metric || "";
            console.log("matchMetric() - " + metric);
            var metricQuery = "ts(" + metric.trim();
            return _this.requestAutocomplete(metricQuery).then(function (result) {
                return lodash_1.default.filter(result.data.symbols, function (m) {
                    return (m.indexOf("=") < 0);
                });
            }, function (result) { return []; });
        };
        this.matchMetricAlt = function (metric) {
            var query = "ts(\"" + helpers_1.stripQuotesAndTrim(metric) + "\")";
            return _this.requestQueryKeysLookup(query).then(function (result) {
                return result.data.metrics || [];
            }, function (result) { return []; });
        };
        this.matchQuery = function (query, position) {
            query = query || "";
            var boundedQuery = _this.templateSrv.replace(query);
            return _this.requestAutocomplete(boundedQuery, position).then(function (result) {
                return lodash_1.default.map(result.data.symbols, function (symbol) {
                    return query.substr(0, result.data.start) + symbol + query.substr(result.data.end);
                }) || [];
            }, function (result) { return []; });
        };
        this.matchSource = function (metric, host) {
            var query = "ts(\"" + helpers_1.stripQuotesAndTrim(metric) + "\", source=\"" + helpers_1.sanitizePartial(host) + "\")";
            return _this.requestQueryKeysLookup(query).then(function (result) {
                return result.data.hosts || [];
            }, function (result) { return []; });
        };
        this.matchPointTag = function (partialTag, target) {
            partialTag = partialTag || "";
            partialTag = partialTag.toLowerCase();
            var query = _this.makeQuery(target, true);
            if (!query) {
                return [];
            }
            return _this.requestQueryKeysLookup(query).then(function (result) {
                var allTags = {};
                lodash_1.default.forEach(result.data.queryKeys, function (qk) {
                    lodash_1.default.merge(allTags, qk.tags);
                });
                var matches = lodash_1.default.filter(lodash_1.default.keys(allTags), function (tag) {
                    return tag.toLowerCase().indexOf(partialTag) > -1;
                });
                return matches;
            }, function (result) { return []; });
        };
        this.matchSourceTagName = function (partialName) {
            partialName = partialName || "";
            partialName = partialName.toLowerCase();
            var reqConfig = _this.baseRequestConfig("GET", "api/manage/source");
            reqConfig.params = {
                limit: 1
            };
            return backendSrv.datasourceRequest(reqConfig).then(function onSuccess(result) {
                return lodash_1.default.filter(lodash_1.default.keys(result.data.counts), function (tag) {
                    return tag.toLowerCase().indexOf(partialName) > -1;
                });
            }, function (result) { return []; });
        };
        this.matchPointTagValue = function (tag, partialValue, target) {
            if (!tag) {
                return [];
            }
            var op = {
                isAnd: false, type: "operator",
            };
            var kvp = {
                key: helpers_1.sanitizeTag(tag), value: helpers_1.sanitizePartial(partialValue), type: "atom",
            };
            var query = target.tags.length ? _this.makeQuery(target, true, op, kvp) : _this.makeQuery(target, true, kvp);
            return _this.requestQueryKeysLookup(query).then(function (result) {
                var allValues = {};
                lodash_1.default.forEach(result.data.queryKeys, function (qk) {
                    if (qk.tags[tag]) {
                        allValues[qk.tags[tag]] = true;
                    }
                });
                return lodash_1.default.keys(allValues);
            }, function (result) { return []; });
        };
        this.metricFindQuery = function (options) {
            var target = typeof (options) === "string" ? options : options.target;
            var boundedQuery = _this.templateSrv.replace(target);
            var childrenRegex = /children\((.*)\)/;
            var interpolated = {
                target: _this.templateSrv.replace(target),
            };
            var resultWrapper = function (result) {
                return lodash_1.default.map(result, function (value) {
                    return { text: value };
                });
            };
            var childrenQuery = boundedQuery.match(childrenRegex);
            if (childrenQuery) {
                return _this.matchChildren(childrenQuery[1]).then(resultWrapper);
            }
            var metricsRegex = /metric\((.*)\)/;
            var metricsQuery = boundedQuery.match(metricsRegex);
            if (metricsQuery) {
                return _this.matchMetricAlt(metricsQuery[1]).then(resultWrapper);
            }
            var hostNameRegex = /hostName\((.*),\s?(.*)\)/;
            var hostNameQuery = boundedQuery.match(hostNameRegex);
            if (hostNameQuery) {
                return _this.matchSource(hostNameQuery[1], hostNameQuery[2]).then(resultWrapper);
            }
            var tagNameRegex = /tagName\((.*),\s?(.*)\)/;
            var tagNameQuery = boundedQuery.match(tagNameRegex);
            if (tagNameQuery) {
                return _this.matchPointTag(tagNameQuery[2], {
                    metric: helpers_1.stripQuotesAndTrim(tagNameQuery[1]),
                }).then(resultWrapper);
            }
            var tagValueRegex = /tagValue\((.*),\s?(.*),\s?(.*)\)/;
            var tagValueQuery = boundedQuery.match(tagValueRegex);
            if (tagValueQuery) {
                return _this.matchPointTagValue(tagValueQuery[2], tagValueQuery[3], {
                    metric: helpers_1.stripQuotesAndTrim(tagValueQuery[1]), tags: [],
                }).then(resultWrapper);
            }
            return _this.backendSrv.datasourceRequest({
                data: interpolated, headers: { "Content-Type": "application/json" }, method: "POST", url: _this.url + "/search",
            }).then(_this.mapToTextValue);
        };
        this.mapToTextValue = function (result) {
            return lodash_1.default.map(result.data, function (d, i) {
                if (d && d.text && d.value) {
                    return { text: d.text, value: d.value };
                }
                return { text: d, value: i };
            });
        };
        this.requestQueryKeysLookup = function (query) {
            var lookbackStartSecs = Math.floor((new Date().getTime() - queryKeyLookbackMillis) / 1000);
            var request = {
                queries: [{
                        query: query, name: "queryKeyLookup",
                    }], start: lookbackStartSecs,
            };
            var reqConfig = _this.baseRequestConfig("GET", "chart/api/keys", {
                request: request,
            });
            return _this.backendSrv.datasourceRequest(reqConfig);
        };
        this.buildQueryParameters = function (options) {
            options.targets = lodash_1.default.filter(options.targets, function (target) {
                return target.target !== "select metric";
            });
            var targets = lodash_1.default.map(options.targets, function (target) {
                var newTarget = {
                    hide: target.hide, refId: target.refId, type: target.type || "timeseries",
                };
                if (target.target) {
                    newTarget.target = _this.templateSrv.replace(target.target);
                }
            });
            options.targets = targets;
            return options;
        };
        this.baseRequestConfig = function (method, path, params) {
            return __assign({}, _this.requestConfigProto, { url: _this.url + path, method: method, params: params || {} });
        };
        this.requestAutocomplete = function (expression, position) {
            var pos = position;
            if (!pos && pos !== 0) {
                pos = expression.length;
            }
            var reqConfig = _this.baseRequestConfig("GET", "chart/autocomplete", {
                exp: expression, p: pos,
            });
            return _this.backendSrv.datasourceRequest(reqConfig);
        };
        this.makeQuery = function (target, ignoreFunctions) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            if (target.textEditor) {
                return _this.templateSrv.replace(target.query);
            }
            if (!target.metric) {
                return "";
            }
            var query = "ts(\"" + target.metric + "\"";
            var tags = lodash_1.default.clone(target.tags) || [];
            for (var i = 0; i < args.length; ++i) {
                tags.push(args[i]);
            }
            if (tags.length) {
                query += "," + _this.makeFilterString(tags);
            }
            query += ")";
            if (!ignoreFunctions && target.functions) {
                query = lodash_1.default.reduce(target.functions, function (q, f) {
                    return functions_1.default.queryString(f, q);
                }, query);
            }
            query = _this.templateSrv.replace(query);
            return query;
        };
        this.makeFilterString = function (tags) {
            var result = "";
            lodash_1.default.each(tags, function (component) {
                switch (component.type) {
                    case "atom":
                        result += helpers_1.sanitizeTag(component.key) + "=\"" + component.value + "\"";
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
    exports_1("WavefrontDatasource", WavefrontDatasource);
    var lodash_1, functions_1, helpers_1, backendSrvCanelledRetriesDecorator_1, queryKeyLookbackMillis;
    return {
        setters: [
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (functions_1_1) {
                functions_1 = functions_1_1;
            },
            function (helpers_1_1) {
                helpers_1 = helpers_1_1;
            },
            function (backendSrvCanelledRetriesDecorator_1_1) {
                backendSrvCanelledRetriesDecorator_1 = backendSrvCanelledRetriesDecorator_1_1;
            }
        ],
        execute: function () {
            queryKeyLookbackMillis = 7 * 24 * 60 * 60 * 1000;
        }
    };
});
//# sourceMappingURL=datasource.js.map