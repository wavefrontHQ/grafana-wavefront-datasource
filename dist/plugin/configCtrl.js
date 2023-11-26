System.register([], function (exports_1, context_1) {
    "use strict";
    var WavefrontConfigCtrl;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            WavefrontConfigCtrl = (function () {
                function WavefrontConfigCtrl() {
                    this.wavefrontTokenExists = false;
                    this.cspApiTokenExists = false;
                    this.cspOAuthExists = false;
                    this.wavefrontTokenExists = (this.current.jsonData.wavefrontToken != null && this.current.jsonData.wavefrontToken !== "");
                    this.cspApiTokenExists = (this.current.jsonData.cspAPIToken != null && this.current.jsonData.cspAPIToken !== "");
                    this.cspOAuthExists = (this.current.jsonData.cspOAuthClientId != null && this.current.jsonData.cspOAuthClientSecret !== "");
                }
                WavefrontConfigCtrl.prototype.resetWavefrontToken = function () {
                    this.current.jsonData.wavefrontToken = "";
                    this.wavefrontTokenExists = false;
                };
                WavefrontConfigCtrl.prototype.resetCspApiToken = function () {
                    this.current.jsonData.cspAPIToken = "";
                    this.cspApiTokenExists = false;
                };
                WavefrontConfigCtrl.prototype.resetCspOAuth = function () {
                    this.current.jsonData.cspOAuthClientId = "";
                    this.current.jsonData.cspOAuthClientSecret = "";
                    this.cspOAuthExists = false;
                };
                WavefrontConfigCtrl.templateUrl = "partials/config.html";
                return WavefrontConfigCtrl;
            }());
            exports_1("WavefrontConfigCtrl", WavefrontConfigCtrl);
        }
    };
});
//# sourceMappingURL=configCtrl.js.map