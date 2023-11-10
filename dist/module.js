System.register(["./plugin/datasource", "./plugin/configCtrl", "./plugin/queryCtrl", "./plugin/queryOptionsCtrl"], function (exports_1, context_1) {
    "use strict";
    var datasource_1, configCtrl_1, queryCtrl_1, queryOptionsCtrl_1, AnnotationsQueryCtrl;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (datasource_1_1) {
                datasource_1 = datasource_1_1;
            },
            function (configCtrl_1_1) {
                configCtrl_1 = configCtrl_1_1;
            },
            function (queryCtrl_1_1) {
                queryCtrl_1 = queryCtrl_1_1;
            },
            function (queryOptionsCtrl_1_1) {
                queryOptionsCtrl_1 = queryOptionsCtrl_1_1;
            }
        ],
        execute: function () {
            exports_1("Datasource", datasource_1.WavefrontDatasource);
            exports_1("ConfigCtrl", configCtrl_1.WavefrontConfigCtrl);
            exports_1("QueryCtrl", queryCtrl_1.WavefrontQueryCtrl);
            exports_1("QueryOptionsCtrl", queryOptionsCtrl_1.WavefrontQueryOptionsCtrl);
            AnnotationsQueryCtrl = (function () {
                function AnnotationsQueryCtrl() {
                }
                AnnotationsQueryCtrl.templateUrl = "partials/annotations.editor.html";
                return AnnotationsQueryCtrl;
            }());
            exports_1("AnnotationsQueryCtrl", AnnotationsQueryCtrl);
        }
    };
});
//# sourceMappingURL=module.js.map