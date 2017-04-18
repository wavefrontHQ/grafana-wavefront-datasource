import {WavefrontDatasource} from "./plugin/datasource";
import {WavefrontConfigCtrl} from "./plugin/configCtrl";
import {WavefrontQueryCtrl} from "./plugin/queryCtrl";
import {WavefrontQueryOptionsCtrl} from "./plugin/queryOptionsCtrl";

class AnnotationsQueryCtrl {
    static templateUrl = "partials/annotations.editor.html";
}

export {
    WavefrontDatasource as Datasource,
    WavefrontConfigCtrl as ConfigCtrl,
    WavefrontQueryCtrl as QueryCtrl,
    WavefrontQueryOptionsCtrl as QueryOptionsCtrl,
    AnnotationsQueryCtrl as AnnotationsQueryCtrl,
};
