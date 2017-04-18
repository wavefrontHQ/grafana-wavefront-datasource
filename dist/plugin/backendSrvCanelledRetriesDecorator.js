System.register([], function (exports_1, context_1) {
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
    var CHROME_RANDOM_CANCEL_THRESHOLD, BackendSrvCancelledRetriesDecorator;
    return {
        setters: [],
        execute: function () {
            CHROME_RANDOM_CANCEL_THRESHOLD = 1000;
            BackendSrvCancelledRetriesDecorator = (function () {
                function BackendSrvCancelledRetriesDecorator(undecoratedBackendSrv, $q, attempts) {
                    if (attempts === void 0) { attempts = 10; }
                    this.undecoratedBackendSrv = undecoratedBackendSrv;
                    this.attempts = attempts;
                    this.$q = $q;
                }
                BackendSrvCancelledRetriesDecorator.prototype.datasourceRequest = function (reqConfig) {
                    var _this = this;
                    var issueRequest = function () { return _this.undecoratedBackendSrv.datasourceRequest(__assign({}, reqConfig, { issueTime: Date.now() })); };
                    return this.retryPromise(issueRequest, this.attempts);
                };
                BackendSrvCancelledRetriesDecorator.prototype.retryPromise = function (promise, attempts) {
                    var _this = this;
                    return promise()
                        .catch(function (result) {
                        var timeInFlight = Date.now() - result.err.config.issueTime;
                        var shouldRetry = result.cancelled &&
                            timeInFlight < CHROME_RANDOM_CANCEL_THRESHOLD &&
                            attempts > 0;
                        return shouldRetry
                            ? _this.retryPromise(promise, attempts--)
                            : _this.$q.reject(result);
                    });
                };
                return BackendSrvCancelledRetriesDecorator;
            }());
            exports_1("default", BackendSrvCancelledRetriesDecorator);
        }
    };
});
//# sourceMappingURL=backendSrvCanelledRetriesDecorator.js.map