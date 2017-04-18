System.register(["app/core/utils/kbn", "lodash"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function dateToEpochSeconds(date) {
        return Math.floor(date.valueOf() / 1000);
    }
    exports_1("dateToEpochSeconds", dateToEpochSeconds);
    function intervalToSeconds(str) {
        return kbn_1.default.interval_to_seconds(str);
    }
    exports_1("intervalToSeconds", intervalToSeconds);
    function sanitizeUrl(url) {
        if (url.endsWith("/")) {
            return url;
        }
        return url + "/";
    }
    exports_1("sanitizeUrl", sanitizeUrl);
    function sanitizeTag(tag) {
        tag = tag || "";
        tag = tag.trim();
        if (!tag || tag.length === 1 || tag.includes(" ")) {
            tag = "'" + tag + "'";
        }
        return tag;
    }
    exports_1("sanitizeTag", sanitizeTag);
    function sanitizePartial(str) {
        str = stripQuotesAndTrim(str);
        if (!str) {
            return "*";
        }
        if (str[0] !== "*") {
            str = "*" + str;
        }
        if (str[str.length - 1] !== "*") {
            str += "*";
        }
        return str;
    }
    exports_1("sanitizePartial", sanitizePartial);
    function stripQuotesAndTrim(s) {
        s = s || "";
        while (s && s.length > 2 && (s[0] === "'" || s[0] === '"') && s[0] === s[s.length - 1]) {
            s = s.slice(1, s.length - 1);
        }
        return s.trim();
    }
    exports_1("stripQuotesAndTrim", stripQuotesAndTrim);
    function nameForTimeseries(target, query, ts, templateSrv) {
        var nameComponents = [];
        if (target.alias) {
            nameComponents.push(target.alias);
        }
        if (ts.label) {
            nameComponents.push(ts.label);
        }
        else {
            nameComponents.push(query);
        }
        if (ts.host) {
            nameComponents.push(ts.host);
        }
        if (ts.tags) {
            var tagsComponents_1 = [];
            lodash_1.default.forOwn(ts.tags, function (val, key) {
                tagsComponents_1.push(key + "='" + val + "'");
            });
            if (tagsComponents_1.length) {
                nameComponents.push("[" + tagsComponents_1.join(", ") + "]");
            }
        }
        var result = nameComponents.join("-");
        lodash_1.default.each(target.regexes, function (r) {
            var matches = result.match(new RegExp(r.regex));
            if (matches) {
                result = r.replacement;
                for (var i = 1; i < matches.length; ++i) {
                    result = typeof (matches[i]) !== "undefined" ? result.replace("$" + i, matches[i]) : result = result.replace("$" + i, "''");
                }
            }
        });
        return templateSrv.replace(result);
    }
    exports_1("nameForTimeseries", nameForTimeseries);
    function clearErrorsAndWarnings(target) {
        if (target) {
            target.errors = target.errors || {};
            delete target.errors["query"];
            target.warnings = target.warnings || {};
            delete target.warnings["query"];
        }
    }
    exports_1("clearErrorsAndWarnings", clearErrorsAndWarnings);
    function errorMsg(result) {
        if (result) {
            if (result.data && result.data.response) {
                return result.data.response;
            }
            return result.statusText || "";
        }
    }
    exports_1("errorMsg", errorMsg);
    function logResult(result) {
        if (result) {
            console.log("Response was: " + "(" + result.status + ") " + errorMsg(result));
        }
    }
    exports_1("logResult", logResult);
    var kbn_1, lodash_1;
    return {
        setters: [
            function (kbn_1_1) {
                kbn_1 = kbn_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }
        ],
        execute: function () {
        }
    };
});
//# sourceMappingURL=helpers.js.map