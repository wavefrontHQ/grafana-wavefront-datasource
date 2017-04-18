import kbn from "app/core/utils/kbn";
import _ from "lodash";

/**
 * Converts Grafana time expressions like 'now' or 'now-6h' to seconds since epoch.
 * @param date
 * @returns {number}
 */
function dateToEpochSeconds(date) {
    return Math.floor(date.valueOf() / 1000);
}

/**
 * Converts Grafana interval expressions like '30s' or '1h' to seconds.
 * @param str
 * @returns {number}
 */
function intervalToSeconds(str) {
    return kbn.interval_to_seconds(str);
}

function sanitizeUrl(url: any) {
    if (url.endsWith("/")) {
        return url;
    }
    return url + "/";
}

function sanitizeTag(tag) {
    tag = tag || "";
    tag = tag.trim();

    if (!tag || tag.length === 1 || tag.includes(" ")) {
        tag = "'" + tag + "'";
    }
    return tag;
}

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

function stripQuotesAndTrim(s) {
    s = s || "";

    while (s && s.length > 2 && (s[0] === "'" || s[0] === '"') && s[0] === s[s.length - 1]) {
        s = s.slice(1, s.length - 1);
    }

    return s.trim();
}

function nameForTimeseries(target, query, ts, templateSrv): string {
    const nameComponents = [];

    // Target discriminator
    if (target.alias) {
        nameComponents.push(target.alias);
    }

    // Timeseries label (or query if there is none)
    if (ts.label) {
        nameComponents.push(ts.label);
    } else {
        nameComponents.push(query);
    }

    // Host/Source
    if (ts.host) {
        nameComponents.push(ts.host);
    }

    // Tags
    if (ts.tags) {
        const tagsComponents = [];
        _.forOwn(ts.tags, (val, key) => {
            tagsComponents.push(key + "='" + val + "'");
        });

        if (tagsComponents.length) {
            nameComponents.push("[" + tagsComponents.join(", ") + "]");
        }
    }

    let result = nameComponents.join("-");

    // Regex replacements
    _.each(target.regexes, (r) => {
        const matches = result.match(new RegExp(r.regex));
        if (matches) {
            result = r.replacement;
            for (let i = 1; i < matches.length; ++i) {
                result = typeof (matches[i]) !== "undefined" ? result.replace("$" + i, matches[i]) : result = result.replace("$" + i, "''");
            }
        }
    });

    // Apply global replacements
    return templateSrv.replace(result);
}

function clearErrorsAndWarnings(target) {
    if (target) {
        target.errors = target.errors || {};
        delete target.errors["query"];
        target.warnings = target.warnings || {};
        delete target.warnings["query"];
    }
}

function errorMsg(result) {
    if (result) {
        if (result.data && result.data.response) {
            return result.data.response;
        }
        return result.statusText || "";
    }
}

function logResult(result) {
    if (result) {
        console.log("Response was: " + "(" + result.status + ") " + errorMsg(result));
    }
}

export {
    dateToEpochSeconds, intervalToSeconds, sanitizeUrl, sanitizeTag, sanitizePartial, stripQuotesAndTrim, nameForTimeseries, clearErrorsAndWarnings, errorMsg, logResult,
}
