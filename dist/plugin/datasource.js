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
    var lodash_1, functions_1, helpers_1, backendSrvCanelledRetriesDecorator_1, queryKeyLookbackMillis, CSP_API_TOKEN_URL, CSP_OAUTH_TOKEN_URL;
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
        var appId = instanceSettings.jsonData.cspOAuthClientId;
        var appSecret = instanceSettings.jsonData.cspOAuthClientSecret;
        var credentials = "Basic " + btoa(appId + ":" + appSecret);
        this.requestConfigProto = {
            headers: {
                "Content-Type": "application/json",
            },
            timeout: (instanceSettings.jsonData.timeoutSecs || this.defaultRequestTimeoutSecs) * 1000,
        };
        if (instanceSettings.jsonData.wavefrontToken) {
            this.requestConfigProto.headers["X-AUTH-TOKEN"] = instanceSettings.jsonData.wavefrontToken;
        }
        else if (instanceSettings.jsonData.cspAPIToken) {
            try {
                fetch(CSP_API_TOKEN_URL, {
                    method: "POST",
                    body: JSON.stringify({
                        "api_token": instanceSettings.jsonData.cspAPIToken,
                    }),
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    }
                })
                    .then(function (response) { return response.json(); })
                    .then(function (json) { return console.log(json); });
            }
            catch (e) {
                console.error(e);
            }
            this.requestConfigProto.headers["Authorization"] = "Bearer " + instanceSettings.jsonData.cspAPIToken;
        }
        else if (instanceSettings.jsonData.cspOAuthClientId && instanceSettings.jsonData.cspOAuthClientSecret) {
            try {
                fetch(CSP_OAUTH_TOKEN_URL, {
                    method: "POST",
                    body: JSON.stringify({
                        "grant_type": "client_credentials",
                    }),
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "Authorization": credentials
                    }
                })
                    .then(function (response) { return response.json(); })
                    .then(function (json) { return console.log(json); });
            }
            catch (e) {
                console.error(e);
            }
            this.requestConfigProto.headers["Authorization"] = "Bearer " + instanceSettings.jsonData.cspAPIToken;
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
            var baseEvent = {
                autoEvents: false, e: endSecs, i: true, listMode: false, n: userString, p: numPoints, s: startSecs, strict: true,
            };
            var reqs = options.targets.map(function (target) {
                if (target.hide) {
                    return _this.q.when([]);
                }
                var q = _this.makeQuery(target, options.scopedVars);
                if (!q) {
                    return _this.q.when([]);
                }
                var summarization = target.summarization ? target.summarization.toUpperCase() :
                    options.scopedVars.summarization ? options.scopedVars.summarization.toUpperCase() : "MEAN";
                var granularity = target.granularity ? target.granularity.substring(0, 1) :
                    options.scopedVars.granularity ? options.scopedVars.granularity.substring(0, 1) : "s";
                var includeObsoleteMetrics = target.includeObsolete || options.scopedVars.includeObsolete || false;
                var reqConfig = _this.baseRequestConfig("GET", "chart/api", __assign({}, baseEvent, { summarization: summarization, g: granularity, includeObsoleteMetrics: includeObsoleteMetrics, q: q }));
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
                var resultSeries = lodash_1.default.flatten(results);
                var filteredSeries = lodash_1.default.filter(resultSeries, function (d) { return d.datapoints.length > 0; });
                return { data: filteredSeries };
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
        this.metricFindQuery = function (options) {
            var target = typeof (options) === "string" ? options : options.target;
            var boundedQuery = _this.templateSrv.replace(target);
            if (target === "") {
                return $q.when([]).then(function () {
                    return [];
                }, function () {
                    return [];
                });
            }
            var resultWrapper = function (result) {
                return lodash_1.default.map(result, function (value) {
                    return { text: value };
                });
            };
            var metricsRegex = /metrics?\s*:(.*)/;
            var metricsQuery = boundedQuery.match(metricsRegex);
            if (metricsQuery) {
                return _this.matchMetricTS(metricsQuery[1]).then(resultWrapper);
            }
            var sourceRegex = /sources?\s*:(.*)/;
            var sourceQuery = boundedQuery.match(sourceRegex);
            if (sourceQuery) {
                return _this.matchSourceTS(sourceQuery[1]).then(resultWrapper);
            }
            var sourceTagRegex = /source[tT]ags?\s*:(.*)/;
            var sourceTagQuery = boundedQuery.match(sourceTagRegex);
            if (sourceTagQuery) {
                return _this.matchSourceTagTS(sourceTagQuery[1]).then(resultWrapper);
            }
            var matchingSourceTagRegex = /matching[sS]ource[tT]ags?\s*:(.*)/;
            var matchingSourceTagQuery = boundedQuery.match(matchingSourceTagRegex);
            if (matchingSourceTagQuery) {
                return _this.matchMatchingSourceTagTS(matchingSourceTagQuery[1]).then(resultWrapper);
            }
            var tagNameRegex = /tag[nN]ames?\s*:(.*)/;
            var tagNameQuery = boundedQuery.match(tagNameRegex);
            if (tagNameQuery) {
                return _this.matchPointTagTS(tagNameQuery[1]).then(resultWrapper);
            }
            var tagValueRegex = /tag[vV]alues?\s*\((.+)\)\s*:(.*)/;
            var tagValueQuery = boundedQuery.match(tagValueRegex);
            if (tagValueQuery) {
                return _this.matchPointTagValueTS(tagValueQuery[1], tagValueQuery[2]).then(resultWrapper);
            }
            return $q.when([]).then(function () {
                return [];
            }, function () {
                return [];
            });
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
        this.interpolateVariablesInQueries = function (queries) {
            if (queries && queries.length > 0) {
                return queries.map(function (query) {
                    return __assign({}, query, { query: _this.templateSrv.replace(query.query) });
                });
            }
            return queries;
        };
        this.matchMetric = function (metric) {
            metric = metric || "";
            var metricQuery = "ts(" + metric.trim();
            return _this.requestAutocomplete(metricQuery).then(function (result) {
                return lodash_1.default.filter(result.data.symbols, function (m) {
                    return (m.indexOf("=") < 0);
                });
            }, function (result) { return []; });
        };
        this.matchMetricTS = function (query) {
            return _this.requestQueryKeysLookup(query.trim()).then(function (result) {
                return result.data.metrics || [];
            }, function (result) { return []; });
        };
        this.matchSource = function (metric, host, scopedVars) {
            var query = "ts(\"" + helpers_1.stripQuotesAndTrim(metric) + "\", source=\"" + helpers_1.sanitizePartial(host) + "\")";
            query = _this.templateSrv.replace(query, scopedVars);
            return _this.requestQueryKeysLookup(query).then(function (result) {
                return result.data.hosts || [];
            }, function (result) { return []; });
        };
        this.matchSourceTS = function (query) {
            return _this.requestQueryKeysLookup(query.trim()).then(function (result) {
                return result.data.hosts || [];
            }, function (result) { return []; });
        };
        this.matchSourceTag = function (partialName) {
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
        this.matchSourceTagTS = function (query) {
            return _this.requestQueryKeysLookup(query.trim(), true).then(function (result) {
                return result.data.hostTags || [];
            }, function (result) { return []; });
        };
        this.matchMatchingSourceTagTS = function (query) {
            return _this.requestQueryKeysLookup(query.trim(), true).then(function (result) {
                return result.data.matchingHostTags || [];
            }, function (result) { return []; });
        };
        this.matchPointTag = function (partialTag, target, scopedVars) {
            partialTag = partialTag || "";
            partialTag = partialTag.toLowerCase();
            if (partialTag === "*") {
                partialTag = "";
            }
            var query = _this.makeQuery(target, scopedVars, true);
            if (!query) {
                return [];
            }
            return _this.requestQueryKeysLookup(query).then(function (result) {
                var allTags = {};
                lodash_1.default.forEach(result.data.queryKeys, function (qk) {
                    lodash_1.default.merge(allTags, qk.tags);
                });
                return lodash_1.default.filter(lodash_1.default.keys(allTags), function (tag) {
                    return tag.toLowerCase().indexOf(partialTag) > -1;
                });
            }, function (result) { return []; });
        };
        this.matchPointTagTS = function (query) {
            return _this.requestQueryKeysLookup(query.trim()).then(function (result) {
                var allTags = {};
                lodash_1.default.forEach(result.data.queryKeys, function (qk) {
                    lodash_1.default.merge(allTags, qk.tags);
                });
                return lodash_1.default.keys(allTags);
            }, function (result) { return []; });
        };
        this.matchPointTagValue = function (tag, partialValue, target, scopedVars) {
            if (!tag) {
                return [];
            }
            var op = {
                isAnd: false, type: "operator",
            };
            var kvp = {
                key: helpers_1.sanitizeTag(tag), value: helpers_1.sanitizePartial(partialValue), type: "atom",
            };
            var query = target.tags && target.tags.length ? _this.makeQuery(target, scopedVars, true, op, kvp) : _this.makeQuery(target, true, kvp);
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
        this.matchPointTagValueTS = function (tag, query) {
            return _this.requestQueryKeysLookup(query.trim()).then(function (result) {
                var allValues = {};
                lodash_1.default.forEach(result.data.queryKeys, function (qk) {
                    if (qk.tags[tag]) {
                        allValues[qk.tags[tag]] = true;
                    }
                });
                return lodash_1.default.keys(allValues);
            }, function (result) { return []; });
        };
        this.requestQueryKeysLookup = function (query, includeHostTags) {
            var lookbackStartSecs = Math.floor((new Date().getTime() - queryKeyLookbackMillis) / 1000);
            var request = {
                queries: [
                    {
                        query: query,
                        name: "queryKeyLookup"
                    },
                ],
                start: lookbackStartSecs,
                noHostTags: true,
            };
            var hostTagsFilter = includeHostTags ? "false" : "true";
            var reqConfig = _this.baseRequestConfig("GET", "chart/api/keys", {
                request: JSON.stringify(request),
                noHostTags: hostTagsFilter
            });
            return _this.backendSrv.datasourceRequest(reqConfig);
        };
        this.makeQuery = function (target, scopedVars, ignoreFunctions) {
            var args = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args[_i - 3] = arguments[_i];
            }
            var query;
            if (target.textEditor) {
                query = target.query;
            }
            else {
                query = _this.buildQuery(target, ignoreFunctions, args);
            }
            query = _this.templateSrv.replace(query, scopedVars);
            return query;
        };
        this.buildQuery = function (target, ignoreFunctions) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            if (!target.metric) {
                return "";
            }
            var query = "ts(\"" + target.metric + "\"";
            var tags = lodash_1.default.clone(target.tags) || [];
            for (var i = 0; i < args.length; ++i) {
                if (args[i].length) {
                    tags.push(args[i]);
                }
            }
            if (tags.length) {
                query += ", " + _this.buildFilterString(tags);
            }
            query += ")";
            if (!ignoreFunctions && target.functions) {
                query = lodash_1.default.reduce(target.functions, function (q, f) {
                    return functions_1.default.queryString(f, q);
                }, query);
            }
            return query;
        };
        this.buildFilterString = function (tags) {
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
        function refreshToken() {
            if (instanceSettings.jsonData.cspAPIToken) {
                try {
                    fetch(CSP_API_TOKEN_URL, {
                        method: "POST",
                        body: JSON.stringify({
                            "api_token": instanceSettings.jsonData.cspAPIToken,
                        }),
                        headers: {
                            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                        }
                    })
                        .then(function (response) { return response.json(); })
                        .then(function (json) { return console.log(json); });
                }
                catch (e) {
                    console.error(e);
                }
                this.requestConfigProto.headers["Authorization"] = "Bearer " + instanceSettings.jsonData.cspAPIToken;
            }
            else if (instanceSettings.jsonData.cspOAuthClientId && instanceSettings.jsonData.cspOAuthClientSecret) {
                try {
                    fetch(CSP_OAUTH_TOKEN_URL, {
                        method: "POST",
                        body: JSON.stringify({
                            "grant_type": "client_credentials",
                        }),
                        headers: {
                            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                            "Authorization": credentials
                        }
                    })
                        .then(function (response) { return response.json(); })
                        .then(function (json) { return console.log(json); });
                }
                catch (e) {
                    console.error(e);
                }
                this.requestConfigProto.headers["Authorization"] = "Bearer " + instanceSettings.jsonData.cspAPIToken;
            }
            console.log("Refreshed token!");
        }
        refreshToken();
        var interval = setInterval(refreshToken, 25 * 60 * 1000);
    }
    exports_1("WavefrontDatasource", WavefrontDatasource);
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
            CSP_API_TOKEN_URL = "https://console.cloud.vmware.com/csp/gateway/am/api/auth/api-tokens/authorize";
            CSP_OAUTH_TOKEN_URL = "https://console.cloud.vmware.com/csp/gateway/am/api/auth/authorize";
        }
    };
});
//# sourceMappingURL=datasource.js.map