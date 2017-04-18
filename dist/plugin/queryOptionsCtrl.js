System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var WavefrontQueryOptionsCtrl;
    return {
        setters: [],
        execute: function () {
            WavefrontQueryOptionsCtrl = (function () {
                function WavefrontQueryOptionsCtrl() {
                    this.summarizations = ["mean", "median", "min", "max", "sum", "count", "last", "first"];
                    this.granularities = ["second", "minute", "hour", "day"];
                    var scopedVars = this.panelCtrl.panel.scopedVars || {};
                    scopedVars.summarization = scopedVars.summarization || this.summarizations[0];
                    scopedVars.granularity = scopedVars.granularity || this.granularities[0];
                    scopedVars.includeObsolete = scopedVars.includeObsolete || false;
                    this.panelCtrl.panel.scopedVars = scopedVars;
                    this.summarizations = this.summarizations.sort();
                }
                return WavefrontQueryOptionsCtrl;
            }());
            WavefrontQueryOptionsCtrl.templateUrl = "partials/query.options.html";
            exports_1("WavefrontQueryOptionsCtrl", WavefrontQueryOptionsCtrl);
        }
    };
});
//# sourceMappingURL=queryOptionsCtrl.js.map