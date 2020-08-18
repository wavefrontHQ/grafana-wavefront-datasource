System.register([], function (exports_1, context_1) {
    "use strict";
    var WavefrontQueryOptionsCtrl;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            WavefrontQueryOptionsCtrl = (function () {
                function WavefrontQueryOptionsCtrl() {
                    this.summarizations = ["mean", "median", "min", "max", "sum", "count", "last", "first"];
                    this.granularities = ["second", "minute", "hour", "day"];
                    var panel = this.panelCtrl.panel;
                    var scopedVars = panel.scopedVars || {};
                    panel.summarization = panel.summarization || scopedVars.summarization || this.summarizations[0];
                    panel.granularity = panel.granularity || scopedVars.granularity || this.granularities[0];
                    panel.includeObsolete = panel.includeObsolete || scopedVars.includeObsolete || false;
                    this.summarizations = this.summarizations.sort();
                }
                WavefrontQueryOptionsCtrl.prototype.refresh = function () {
                    var panel = this.panelCtrl.panel;
                    var targets = panel.targets;
                    for (var i = 0; i < targets.length; i++) {
                        targets[i].summarization = panel.summarization;
                        targets[i].granularity = panel.granularity;
                        targets[i].includeObsolete = panel.includeObsolete;
                    }
                    this.panelCtrl.refresh();
                };
                WavefrontQueryOptionsCtrl.templateUrl = "partials/query.options.html";
                return WavefrontQueryOptionsCtrl;
            }());
            exports_1("WavefrontQueryOptionsCtrl", WavefrontQueryOptionsCtrl);
        }
    };
});
//# sourceMappingURL=queryOptionsCtrl.js.map