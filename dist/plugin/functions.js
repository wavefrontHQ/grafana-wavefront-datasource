System.register(["lodash"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function addFunction(definition) {
        definition.parameters = definition.parameters || [];
        definition.defaultParameters = definition.defaultParameters || [];
        if (definition.category) {
            categories[definition.category].push(definition);
        }
        index[definition.name] = definition;
    }
    var lodash_1, index, categories, functions;
    return {
        setters: [
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }
        ],
        execute: function () {
            index = [];
            categories = {
                Aggregate: [], RawAggregate: [], Filter: [], Derivative: [], Time: [], MovingWindow: [], Rounding: [], Math: [], Interpolate: [],
            };
            addFunction({
                name: "min",
                category: "Aggregate",
                tooltip: "When at least 1 series reports a value, aggregate across all series in order to display the lowest value at that time interval. All series that did not report a value at that time will have an interpolated value applied if possible prior to the aggregation.",
                parameters: [{
                        name: "group-by",
                        tooltip: "Group by - An optional clause that can be applied to aggregate or rawaggregate functions, group bys will aggregate the set of data at each time interval by metric, source, source tag, or point tag.",
                        type: "string",
                        optional: true,
                        options: ["sources", "metrics", "sourceTags"],
                    },],
                defaultParameters: [""],
                baseIndex: 0,
            });
            addFunction({
                name: "max",
                category: "Aggregate",
                tooltip: "When at least 1 series reports a value, aggregate across all series in order to display the highest value at that time interval. All series that did not report a value at that time will have an interpolated value applied if possible prior to the aggregation.",
                parameters: [{
                        name: "group-by",
                        tooltip: "Group by - An optional clause that can be applied to aggregate or rawaggregate functions, group bys will aggregate the set of data at each time interval by metric, source, source tag, or point tag.",
                        type: "string",
                        optional: true,
                        options: ["sources", "metrics", "sourceTags"],
                    },],
                defaultParameters: [""],
                baseIndex: 0,
            });
            addFunction({
                name: "sum",
                category: "Aggregate",
                tooltip: "When at least 1 series reports a value, aggregate across all series in order to display the total value at that time interval. All series that did not report a value at that time will have an interpolated value applied if possible prior to the aggregation.",
                parameters: [{
                        name: "group-by",
                        tooltip: "Group by - An optional clause that can be applied to aggregate or rawaggregate functions, group bys will aggregate the set of data at each time interval by metric, source, source tag, or point tag.",
                        type: "string",
                        optional: true,
                        options: ["sources", "metrics", "sourceTags"],
                    },],
                defaultParameters: [""],
                baseIndex: 0,
            });
            addFunction({
                name: "avg",
                category: "Aggregate",
                tooltip: "When at least 1 series reports a value, aggregate across all series in order to display the average value at that time interval. All series that did not report a value at that time will have an interpolated value applied if possible prior to the aggregation.",
                parameters: [{
                        name: "group-by",
                        tooltip: "Group by - An optional clause that can be applied to aggregate or rawaggregate functions, group bys will aggregate the set of data at each time interval by metric, source, source tag, or point tag.",
                        type: "string",
                        optional: true,
                        options: ["sources", "metrics", "sourceTags"],
                    },],
                defaultParameters: [""],
                baseIndex: 0,
            });
            addFunction({
                name: "count",
                category: "Aggregate",
                tooltip: "When at least 1 series reports a value, aggregate across all series in order to display the total number of values at that time interval. All series that did not report a value at that time will have an interpolated value applied if possible prior to the aggregation.",
                parameters: [{
                        name: "group-by",
                        tooltip: "Group by - An optional clause that can be applied to aggregate or rawaggregate functions, group bys will aggregate the set of data at each time interval by metric, source, source tag, or point tag.",
                        type: "string",
                        optional: true,
                        options: ["sources", "metrics", "sourceTags"],
                    },],
                defaultParameters: [""],
                baseIndex: 0,
            });
            addFunction({
                name: "variance",
                category: "Aggregate",
                tooltip: "When at least 1 series reports a value, aggregate across all series in order to display the value associated with how far a set of values are spread out. All series that did not report a value at that time will have an interpolated value applied if possible prior to the aggregation.",
                parameters: [{
                        name: "group-by",
                        tooltip: "Group by - An optional clause that can be applied to aggregate or rawaggregate functions, group bys will aggregate the set of data at each time interval by metric, source, source tag, or point tag.",
                        type: "string",
                        optional: true,
                        options: ["sources", "metrics", "sourceTags"],
                    },],
                defaultParameters: [""],
                baseIndex: 0,
            });
            addFunction({
                name: "percentile",
                category: "Aggregate",
                tooltip: "When at least 1 series reports a value, aggregate across all series in order to display the value at that time interval that corresponds with the desired percentile value. All series that did not report a value at that time will have an interpolated value applied if possible prior to the aggregation.",
                parameters: [{
                        name: "nth-percentile", tooltip: "Percentile - a decimal value between 1 and 100.", type: "int",
                    }, {
                        name: "group-by",
                        tooltip: "Group by - An optional clause that can be applied to aggregate or rawaggregate functions, group bys will aggregate the set of data at each time interval by metric, source, source tag, or point tag.",
                        type: "string",
                        optional: true,
                        options: ["", "sources", "metrics", "sourceTags"],
                    },],
                defaultParameters: [95, ""],
                baseIndex: 1,
            });
            addFunction({
                name: "rawmin",
                category: "RawAggregate",
                tooltip: "When at least 1 series reports a value, aggregate across all series in order to display the lowest value at that time interval. Unlike min(), all series that did not report a value at that time will not have an interpolated value applied prior to the aggregation.",
                parameters: [{
                        name: "group-by",
                        tooltip: "Group by - An optional clause that can be applied to aggregate or rawaggregate functions, group bys will aggregate the set of data at each time interval by metric, source, source tag, or point tag.",
                        type: "string",
                        optional: true,
                        options: ["sources", "metrics", "sourceTags"],
                    },],
                defaultParameters: [""],
                baseIndex: 0,
            });
            addFunction({
                name: "rawmax",
                category: "RawAggregate",
                tooltip: " When at least 1 series reports a value, aggregate across all series in order to display the highest value at that time interval. Unlike max(), all series that did not report a value at that time will not have an interpolated value applied prior to the aggregation.",
                parameters: [{
                        name: "group-by",
                        tooltip: "Group by - An optional clause that can be applied to aggregate or rawaggregate functions, group bys will aggregate the set of data at each time interval by metric, source, source tag, or point tag.",
                        type: "string",
                        optional: true,
                        options: ["sources", "metrics", "sourceTags"],
                    },],
                defaultParameters: [""],
                baseIndex: 0,
            });
            addFunction({
                name: "rawsum",
                category: "RawAggregate",
                tooltip: "When at least 1 series reports a value, aggregate across all series in order to display the total value at that time interval. Unlike sum(), all series that did not report a value at that time will not have an interpolated value applied prior to the aggregation.",
                parameters: [{
                        name: "group-by",
                        tooltip: "Group by - An optional clause that can be applied to aggregate or rawaggregate functions, group bys will aggregate the set of data at each time interval by metric, source, source tag, or point tag.",
                        type: "string",
                        optional: true,
                        options: ["sources", "metrics", "sourceTags"],
                    },],
                defaultParameters: [""],
                baseIndex: 0,
            });
            addFunction({
                name: "rawavg",
                category: "RawAggregate",
                tooltip: " When at least 1 series reports a value, aggregate across all series in order to display the average value at that time interval. Unlike avg(), all series that did not report a value at that time will not have an interpolated value applied prior to the aggregation.",
                parameters: [{
                        name: "group-by",
                        tooltip: "Group by - An optional clause that can be applied to aggregate or rawaggregate functions, group bys will aggregate the set of data at each time interval by metric, source, source tag, or point tag.",
                        type: "string",
                        optional: true,
                        options: ["sources", "metrics", "sourceTags"],
                    },],
                defaultParameters: [""],
                baseIndex: 0,
            });
            addFunction({
                name: "rawcount",
                category: "RawAggregate",
                tooltip: "When at least 1 series reports a value, aggregate across all series in order to display the total number of values at that time interval. Unlike count(), all series that did not report a value at that time will not have an interpolated value applied prior to the aggregation.",
                parameters: [{
                        name: "group-by",
                        tooltip: "Group by - An optional clause that can be applied to aggregate or rawaggregate functions, group bys will aggregate the set of data at each time interval by metric, source, source tag, or point tag.",
                        type: "string",
                        optional: true,
                        options: ["sources", "metrics", "sourceTags"],
                    },],
                defaultParameters: [""],
                baseIndex: 0,
            });
            addFunction({
                name: "rawvariance",
                category: "RawAggregate",
                tooltip: "When at least 1 series reports a value, aggregate across all series in order to display the value associated with how far a set of values are spread out. Unlike variance(), all series that did not report a value at that time will not have an interpolated value applied prior to the aggregation.",
                parameters: [{
                        name: "group-by",
                        tooltip: "Group by - An optional clause that can be applied to aggregate or rawaggregate functions, group bys will aggregate the set of data at each time interval by metric, source, source tag, or point tag.",
                        type: "string",
                        optional: true,
                        options: ["sources", "metrics", "sourceTags"],
                    },],
                defaultParameters: [""],
                baseIndex: 0,
            });
            addFunction({
                name: "rawpercentile",
                category: "RawAggregate",
                tooltip: "When at least 1 series reports a value, aggregate across all series in order to display the value at that time interval that corresponds with the desired percentile value. Unlike percentile(), all series that did not report a value at that time will not have an interpolated value applied prior to the aggregation.",
                parameters: [{
                        name: "nth-percentile", tooltip: "Percentile - a decimal value between 1 and 100.", type: "int",
                    }, {
                        name: "group-by",
                        tooltip: "Group by - An optional clause that can be applied to aggregate or rawaggregate functions, group bys will aggregate the set of data at each time interval by metric, source, source tag, or point tag.",
                        type: "string",
                        optional: true,
                        options: ["sources", "metrics", "sourceTags"],
                    },],
                defaultParameters: [95, ""],
                baseIndex: 1,
            });
            addFunction({
                name: "highpass", category: "Filter", tooltip: "Only reported values that are greater than the provided threshold will be displayed. All other reported values are ignored.", parameters: [{
                        name: "threshold", tooltip: "Threshold - The filtering threshold.", type: "int",
                    },], defaultParameters: [0],
            });
            addFunction({
                name: "lowpass", category: "Filter", tooltip: "Only reported values that are less than the provided threshold will be displayed. All other reported values are ignored.", parameters: [{
                        name: "threshold", tooltip: "Threshold - The filtering threshold.", type: "int",
                    },], defaultParameters: [0],
            });
            addFunction({
                name: "topk", category: "Filter", tooltip: "Compares all reporting series on a chart and return only ‘X’ number of series that are highest in magnitude based on the most recent time interval in your window.", parameters: [{
                        name: "k", tooltip: "K - the number of series to display.", type: "int",
                    },], defaultParameters: [5],
            });
            addFunction({
                name: "bottomk", category: "Filter", tooltip: "Compares all reporting series on a chart and return only ‘X’ number of series that are lowest in magnitude based on the most recent time interval in your window.", parameters: [{
                        name: "k", tooltip: "K - the number of series to display.", type: "int",
                    },], defaultParameters: [5],
            });
            addFunction({
                name: "between",
                category: "Filter",
                tooltip: "Provides a true value of 1 when the value associated with the first argument is between the second and third argument, and a false value of 0 when the value is not. Values equal to the second or third argument are considered true.",
                parameters: [{
                        name: "lowerThreshold", tooltip: "Lower Threshold - the lower filtering threshold.", type: "int",
                    }, {
                        name: "upperThreshold", tooltip: "Upper Threshold - the upper filtering threshold.", type: "int",
                    },],
                defaultParameters: [0, 100],
                baseIndex: 1,
            });
            addFunction({
                name: "rate", category: "Derivative", tooltip: "This function is intended to be used with counter metrics, and will compute the per-second change of the expression. Zero-resets will not result in large negative spikes.",
            });
            addFunction({
                name: "deriv",
                category: "Derivative",
                tooltip: "This function is intended to be used with counter metrics, and will compute the per-second change of the expression. Unlike rate(), zero-resets will result in large negative spikes with deriv()",
            });
            addFunction({
                name: "at", category: "Time", tooltip: "At() evaluates to the constant value of its base expression at a user defined time. The time is given as an offset to the current time.", parameters: [{
                        name: "timeWindow", type: "time", tooltip: "Time Period - the time period to use, e.g. 5s, 10m or 2h.",
                    },], defaultParameters: ["24h"],
            });
            addFunction({
                name: "lag", category: "Time", tooltip: "lag() shifts an expression by a selectable time period.", parameters: [{
                        name: "timeWindow", type: "time", tooltip: "Time Period - the time period to use, e.g. 5s, 10m or 2h.",
                    },], defaultParameters: ["24h"],
            });
            addFunction({
                name: "align",
                category: "Time",
                tooltip: "This function evaluates each series independently and allows you to bucket any expression and just emit values occurring at each time slice. The aggregation method is selectable.",
                parameters: [{
                        name: "timeWindow", type: "time", tooltip: "Time Period - the time period to use, e.g. 5s, 10m or 2h.",
                    }, {
                        name: "aggregator", type: "keyword", tooltip: "Aggregator - the method to use to select a bucket representative.", options: ["mean", "median", "min", "max", "first", "last", "count"],
                    },],
                defaultParameters: ["5m", "median"],
            });
            addFunction({
                name: "downsample", category: "Time", tooltip: "Filters each series and only displays values reported at a given time interval.", parameters: [{
                        name: "timeWindow", type: "time", tooltip: "Time Period - the time period to use, e.g. 5s, 10m or 2h.",
                    },], defaultParameters: ["5m"],
            });
            addFunction({
                name: "msum",
                category: "MovingWindow",
                tooltip: "Retrieves all values reported over the provided moving time window, and displays the sum of those values on the chart. This function evaluates each series independently.",
                parameters: [{
                        name: "timeWindow", type: "time", tooltip: "Time Window - the time window to use, e.g. 5s, 10m or 2h.",
                    },],
                defaultParameters: ["10m"],
            });
            addFunction({
                name: "mavg",
                category: "MovingWindow",
                tooltip: "Retrieves all values reported over the provided moving time window, and displays the average of those values on the chart. This function evaluates each series independently.",
                parameters: [{
                        name: "timeWindow", type: "time", tooltip: "Time Window - the time window to use, e.g. 5s, 10m or 2h.",
                    },],
                defaultParameters: ["10m"],
            });
            addFunction({
                name: "mmedian",
                category: "MovingWindow",
                tooltip: "Retrieves all values reported over the provided moving time window, and displays the median of those values on the chart. This function evaluates each series independently.",
                parameters: [{
                        name: "timeWindow", type: "time", tooltip: "Time Window - the time window to use, e.g. 5s, 10m or 2h.",
                    },],
                defaultParameters: ["10m"],
            });
            addFunction({
                name: "mmin",
                category: "MovingWindow",
                tooltip: "Retrieves all values reported over the provided moving time window, and displays the lowest reported value on the chart. This function evaluates each series independently.",
                parameters: [{
                        name: "timeWindow", type: "time", tooltip: "Time Window - the time window to use, e.g. 5s, 10m or 2h.",
                    },],
                defaultParameters: ["10m"],
            });
            addFunction({
                name: "mmax",
                category: "MovingWindow",
                tooltip: "Retrieves all values reported over the provided moving time window, and displays the highest reported value on the chart. This function evaluates each series independently.",
                parameters: [{
                        name: "timeWindow", type: "time", tooltip: "Time Window - the time window to use, e.g. 5s, 10m or 2h.",
                    },],
                defaultParameters: ["10m"],
            });
            addFunction({
                name: "mcount",
                category: "MovingWindow",
                tooltip: "Retrieves all values reported over the provided moving time window, and displays the total number of reported values on the chart. This function evaluates each series independently.",
                parameters: [{
                        name: "timeWindow", type: "time", tooltip: "Time Window - the time window to use, e.g. 5s, 10m or 2h.",
                    },],
                defaultParameters: ["10m"],
            });
            addFunction({
                name: "mvar",
                category: "MovingWindow",
                tooltip: " Retrieves all values reported over the provided moving time window, and displays the variance of those values on the chart. This function evaluates each series independently.",
                parameters: [{
                        name: "timeWindow", type: "time", tooltip: "Time Window - the time window to use, e.g. 5s, 10m or 2h.",
                    },],
                defaultParameters: ["10m"],
            });
            addFunction({
                name: "mpercentile",
                category: "MovingWindow",
                tooltip: "Retrieves all values reported over the provided moving time window, and displays the given percentile value on the chart. This function evaluates each series independently and also requires a percentile value in addition to the time window.",
                parameters: [{
                        name: "timeWindow", type: "time", tooltip: "Time Window - the time window to use, e.g. 5s, 10m or 2h.",
                    }, {
                        name: "nth-percentile", type: "int", tooltip: "Percentile - a decimal value between 1 and 100.",
                    },],
                defaultParameters: ["10m", "95"],
            });
            addFunction({
                name: "integrate", category: "MovingWindow", tooltip: " Computes the moving integration on a given time series expression over a specified time interval.", parameters: [{
                        name: "timeWindow", type: "time", tooltip: "Time Window - the time window to use, e.g. 5s, 10m or 2h.",
                    },], defaultParameters: ["30m"],
            });
            addFunction({
                name: "flapping", category: "MovingWindow", tooltip: "When applied to a counter metric, this function will count the number of times a counter has reset within a moving time window.", parameters: [{
                        name: "timeWindow", type: "time", tooltip: "Time Window - the time window to use, e.g. 5s, 10m or 2h.",
                    },], defaultParameters: ["30m"],
            });
            addFunction({
                name: "any", category: "MovingWindow", tooltip: "Evaluates all reported values within a moving time window and returns a value of 1 if there are any non-zero values reported. Otherwise it will return a 0.", parameters: [{
                        name: "timeWindow", type: "time", tooltip: "Time Window - the time window to use, e.g. 5s, 10m or 2h.",
                    },], defaultParameters: ["30m"],
            });
            addFunction({
                name: "all", category: "MovingWindow", tooltip: "Evaluates all reported values within a moving time window and returns a value of 1 if all values are non-zero. Otherwise it returns a value of 0.", parameters: [{
                        name: "timeWindow", type: "time", tooltip: "Time Window - the time window to use, e.g. 5s, 10m or 2h.",
                    },], defaultParameters: ["30m"],
            });
            addFunction({
                name: "round", category: "Rounding", tooltip: "Rounds each reported value to the nearest whole number.",
            });
            addFunction({
                name: "ceil", category: "Rounding", tooltip: "Rounds each reported value up to the next largest whole number.",
            });
            addFunction({
                name: "floor", category: "Rounding", tooltip: "Rounds each reported value down to the next smallest whole number.",
            });
            addFunction({
                name: "sqrt", category: "Math", tooltip: "Provides the square root of every reported data value. Typically used with mvar() to help calculate standard deviations.",
            });
            addFunction({
                name: "exp", category: "Math", tooltip: "Provides the exponential of its argument.",
            });
            addFunction({
                name: "log", category: "Math", tooltip: "The inverse of exp(), log() takes the natural log of its argument.",
            });
            addFunction({
                name: "log10", category: "Math", tooltip: "Takes the log(base 10) of its argument.",
            });
            addFunction({
                name: "sin", category: "Math", tooltip: "The trigonometric functions act as expected on their argument, interpreted as radians.",
            });
            addFunction({
                name: "cos", category: "Math", tooltip: "The trigonometric functions act as expected on their argument, interpreted as radians.",
            });
            addFunction({
                name: "tan", category: "Math", tooltip: "The trigonometric functions act as expected on their argument, interpreted as radians.",
            });
            addFunction({
                name: "asin", category: "Math", tooltip: "The trigonometric functions act as expected on their argument, interpreted as radians.",
            });
            addFunction({
                name: "acos", category: "Math", tooltip: "The trigonometric functions act as expected on their argument, interpreted as radians.",
            });
            addFunction({
                name: "atan", category: "Math", tooltip: "The trigonometric functions act as expected on their argument, interpreted as radians.",
            });
            addFunction({
                name: "sinh", category: "Math", tooltip: "The trigonometric functions act as expected on their argument, interpreted as radians.",
            });
            addFunction({
                name: "cosh", category: "Math", tooltip: "The trigonometric functions act as expected on their argument, interpreted as radians.",
            });
            addFunction({
                name: "tanh", category: "Math", tooltip: "The trigonometric functions act as expected on their argument, interpreted as radians.",
            });
            addFunction({
                name: "abs", category: "Math", tooltip: "This function returns the magnitude of a real number without regard to its sign.",
            });
            addFunction({
                name: "normalize", category: "Math", tooltip: "Evaluates each series within the chart window and creates a scale with a minimum of 0 and a maximum of 1. It enables you to see shape correlation between series of very different scale.",
            });
            addFunction({
                name: "default", category: "Interpolate", tooltip: "This function will replace any gaps of missing data with the default value provided.", parameters: [{
                        name: "timeWindow", type: "time", optional: true, tooltip: "Time Window - the time window to use, e.g. 5s, 10m or 2h.",
                    }, {
                        name: "defaultValue", type: "int", tooltip: "Default Value - the value to use for any gaps.",
                    },], defaultParameters: ["", 0],
            });
            addFunction({
                name: "last",
                category: "Interpolate",
                tooltip: "This function will replace any gaps of missing data with the last known reported value. By default, it will only apply the last known reported value if it was reported within the last 4 weeks.",
                parameters: [{
                        name: "timeWindow", type: "time", optional: true, tooltip: "Time Window - the time window to use, e.g. 5s, 10m or 2h.",
                    },],
                defaultParameters: [""],
            });
            addFunction({
                name: "next", category: "Interpolate", tooltip: "This function will replace any gaps of missing data with the next reported value. Gaps of missing data will not fill in until the next value is reported.", parameters: [{
                        name: "timeWindow", type: "time", optional: true, tooltip: "Time Window - the time window to use, e.g. 5s, 10m or 2h.",
                    },], defaultParameters: [""],
            });
            addFunction({
                name: "interpolate",
                category: "Interpolate",
                tooltip: "This function will replace any gaps of missing data between reported values with an interpolated value. Data values are required on each side in order for an interpolated value to be displayed.",
            });
            lodash_1.default.each(categories, function (functionList, name) {
                categories[name] = lodash_1.default.sortBy(functionList, "name");
            });
            functions = {
                createInstance: function (definition, options) {
                    if (lodash_1.default.isString(definition)) {
                        if (!index[definition]) {
                            throw { message: "No function with name " + definition };
                        }
                        definition = index[definition];
                    }
                    var instance = {
                        definition: definition, parameters: [], added: undefined,
                    };
                    if (options && options.withDefaultParameters) {
                        instance.parameters = definition.defaultParameters.slice();
                    }
                    return instance;
                },
                updateParameter: function (instance, strValue, updateIndex) {
                    instance.parameters[updateIndex] = strValue;
                },
                getDefinition: function (name) {
                    return index[name];
                },
                getCategories: function () {
                    return categories;
                },
                queryString: function (wfFunction, baseExpression) {
                    var qString = wfFunction.definition.name + "(";
                    var parameters = lodash_1.default.map(wfFunction.parameters, function (value, paramIndex) {
                        var type = wfFunction.definition.parameters[paramIndex].type;
                        if (type === "string" && value) {
                            return "'" + value + "'";
                        }
                        return value;
                    });
                    parameters = lodash_1.default.filter(parameters, function (value, pIndex) {
                        if (wfFunction.definition.parameters[pIndex].optional) {
                            return value || value === 0;
                        }
                        return true;
                    });
                    if (baseExpression) {
                        var baseIndex = lodash_1.default.has(wfFunction.definition, "baseIndex") ? wfFunction.definition.baseIndex : parameters.length;
                        baseIndex = Math.min(baseIndex, parameters.length);
                        parameters.splice(baseIndex, 0, baseExpression);
                    }
                    return qString + parameters.join(",") + ")";
                },
            };
            exports_1("default", functions);
        }
    };
});
//# sourceMappingURL=functions.js.map