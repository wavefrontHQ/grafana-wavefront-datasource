System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var WavefrontConfigCtrl;
    return {
        setters: [],
        execute: function () {
            WavefrontConfigCtrl = (function () {
                function WavefrontConfigCtrl() {
                    this.wavefrontTokenExists = false;
                    this.wavefrontTokenExists = (this.current.jsonData.wavefrontToken != null && this.current.jsonData.wavefrontToken !== "");
                }
                WavefrontConfigCtrl.prototype.resetWavefrontToken = function () {
                    this.current.jsonData.wavefrontToken = "";
                    this.wavefrontTokenExists = false;
                };
                return WavefrontConfigCtrl;
            }());
            WavefrontConfigCtrl.templateUrl = "partials/config.html";
            exports_1("WavefrontConfigCtrl", WavefrontConfigCtrl);
        }
    };
});
//# sourceMappingURL=configCtrl.js.map