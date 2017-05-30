define(
		[
			"angular",
			"lodash",
			"jquery",
			"./functions"
		],
		function (angular, _, $, functions) {

			"use strict";

			functions = functions.default || functions;

			angular.module("grafana.directives").directive("wavefrontAddFunction", function ($compile) {

				var inputTemplate = "<input type=\"text\"" +
						" class=\"gf-form-input\"" +
						" spellcheck=\"false\" style=\"display:none\" />";

				var buttonTemplate = "<a  class=\"gf-form-label query-part dropdown-toggle\"" +
						" tabindex=\"2\" gf-dropdown=\"functionMenu\" data-toggle=\"dropdown\">" +
						"<i class=\"fa fa-plus\"></i></a>";

				return {
					link: function ($scope, elem) {
						var categories = functions.getCategories();
						var allFunctions = getAllFunctionNames(categories);
						var $input = $(inputTemplate);
						var $button = $(buttonTemplate);

						$scope.functionMenu = createFunctionDropDown(categories);

						$input.appendTo(elem);
						$button.appendTo(elem);

						// Typeahead
						$input.attr("data-provide", "typeahead");
						$input.typeahead(
								{
									source: allFunctions,
									minLength: 1,
									items: 10,
									updater: function (value) {
										var definition = functions.getDefinition(value);
										if (!definition) {
											value = value.toLowerCase();

											definition = _.find(allFunctions, function (name) {
												return name.toLowerCase().indexOf(value) === 0;
											});

											if (!definition) {
												return;
											}
										}

										$scope.$apply(function () {
											$scope.ctrl.addFunction(definition);
										});

										$input.trigger("blur");
										return "";
									}
								});

						$button.click(function () {
							$button.hide();
							$input.show();
							$input.focus();
						});

						$input.keyup(function () {
							elem.toggleClass("open", $input.val() === "");
						});

						$input.blur(function () {
							setTimeout(function () {
								$input.val("");
								$input.hide();
								$button.show();
								elem.removeClass("open");
							}, 200);
						});

						$compile(elem.contents())($scope);
					}
				};
			});

			function getAllFunctionNames(categories) {
				return _.reduce(categories, function (list, category) {
					_.each(category, function (func) {
						list.push(func.name);
					});
					return list;
				}, []);
			}

			function createFunctionDropDown(categories) {
				return _.map(categories, function (functionList, categoryName) {
					return {
						text: categoryName,
						submenu: _.map(functionList, function (func) {
							return {
								text: func.name,
								click: "ctrl.addFunction('" + func.name + "')"
							};
						})
					};
				});
			}

			angular.module("grafana.directives").directive("wavefrontFunctionEditor", function ($compile, templateSrv, $log) {

				var functionTemplate = "<span class=\"dropdown\">"
						+ "<a class=\"pointer dropdown-toggle\" data-toggle=\"dropdown\""
						+ "bs-tooltip=\"\'{{wfFunction.definition.tooltip}}\'\">"
						+ "{{wfFunction.definition.name}}</a><span>(</span>"
						+ "<ul class=\"dropdown-menu\" role=\"menu\">"
						+ "<li role=\"menuitem\">"
						+ "<a ng-click=\"ctrl.moveFunction($index, $index-1)\" ng-show=\"!$first\">"
						+ "<i class=\"fa fa-arrow-left\"></i>Move left</a></li>"
						+ "<li role=\"menuitem\">"
						+ "<a ng-click=\"ctrl.moveFunction($index, $index+1)\" ng-show=\"!$last\">"
						+ "<i class=\"fa fa-arrow-right\"></i>Move right</a></li>"
						+ "<li role=\"menuitem\">"
						+ "<a ng-click=\"ctrl.removeFunction($index)\">"
						+ "<i class=\"fa fa-remove\"></i>Remove</a></li>"
						+ "</ul></span>";
				var parameterTemplate = "<input type=\"text\" style=\"display:none\" "
						+ "class=\"input-mini tight-form-func-param\" />";
				return {
					restrict: "A",
					link: function postLink($scope, elem) {
						var $functionLink = $(functionTemplate);
						var wfFunction = $scope.wfFunction;
						var definition = wfFunction.definition;
						var scheduleRelink = false;
						var numParameters = 0;

						function clickFunctionParameter(index) {
							/* jshint validthis: true */
							var $link = $(this);
							var $input = $link.next();

							$input.val(wfFunction.parameters[index]);
							$input.css("width", ($link.width() + 16) + "px");

							$link.hide();
							$input.show();
							$input.focus();
							$input.select();

							var typeahead = $input.data("typeahead");
							if (typeahead) {
								$input.val("");
								typeahead.lookup();
							}
						}

						function scheduleRelinkIfNeeded() {
							if (numParameters === wfFunction.parameters.length) {
								return;
							}

							if (!scheduleRelink) {
								scheduleRelink = true;
								setTimeout(function () {
									relink();
									scheduleRelink = false;
								}, 200);
							}
						}

						function inputBlur(index) {
							/* jshint validthis: true */
							var $input = $(this);
							var $link = $input.prev();
							var newValue = $input.val();

							if (newValue !== "" || wfFunction.definition.parameters[index].optional) {
								functions.updateParameter(wfFunction, newValue, index);
								$link.html(htmlForValue(index));
								scheduleRelinkIfNeeded();
								$scope.$apply(_.bind($scope.ctrl.refresh, $scope.ctrl));
							}

							$input.hide();
							$link.show();
						}

						function inputKeyPress(index, e) {
							if (e.which === 13) {
								/* jshint validthis: true */
								inputBlur.call(this, index);
							}
						}

						function inputKeyDown() {
							/* jshint validthis: true */
							this.style.width = (this.value.length + 3) * 8 + "px";
						}

						function addTypeahead($input, index) {
							$input.attr("data-provide", "typeahead");

							var parameters = definition.parameters[index];
							var options = parameters.options;
							if (parameters.type === "int") {
								options = _.map(options, function (value) {
									return value.toString();
								});
							}

							$input.typeahead(
									{
										source: options,
										minLength: 0,
										items: 20,
										updater: function (value) {
											setTimeout(function () {
												inputBlur.call($input[0], index);
											}, 0);
											return value;
										}
									});

							var typeahead = $input.data("typeahead");
							// Unfortunately the version of bootstrap type-ahead that ships with Grafana does not
							// allow lookup on empty strings.
							typeahead.lookup = function () {
								var items;

								this.query = this.$element.val();

								if (this.query.length < this.options.minLength) {
									return this.shown ? this.hide() : this;
								}

								items =
										$.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this))
												: this.source;

								return items ? this.process(items) : this;
							};
						}

						function htmlForValue(index) {
							if (wfFunction.parameters[index] || wfFunction.parameters[index] === 0) {
								return templateSrv.highlightVariablesAsHtml(wfFunction.parameters[index]);
							} else if (wfFunction.definition.parameters[index].optional) {
								return "<i class=\"fa fa-plus\"></i>";
							}
							$log.error("Invalid index \"" + index
									+ "\"for htmlForValue, value is neither defined nor optional.");

						}

						function addElementsAndCompile() {
							$functionLink.appendTo(elem);

							_.each(definition.parameters, function (parameter, index) {
								if (parameter.optional && wfFunction.parameters.length <= index) {
									return;
								}

								var $parameter = $(
										"<a ng-click=\"\" class=\"wavefront-func-param-link\""
										+ "style=\"color: orange\""
										+ "bs-tooltip=\"" + wfFunction.definition.parameters[index].tooltip + "\">"
										+ htmlForValue(index)
										+ "</a>");
								var $input = $(parameterTemplate);

								numParameters += 1;

								$parameter.appendTo(elem);
								$input.appendTo(elem);

								$input.blur(_.partial(inputBlur, index));
								$input.keyup(inputKeyDown);
								$input.keypress(_.partial(inputKeyPress, index));
								$parameter.click(_.partial(clickFunctionParameter, index));

								if (definition.parameters[index].options) {
									addTypeahead($input, index);
								}

								$("<span>, </span>").appendTo(elem);
							});
							$compile(elem.contents())($scope);
						}

						function ifJustAddedFocusFirstParam() {
							if ($scope.wfFunction.added) {
								$scope.wfFunction.added = false;
								setTimeout(function () {
									elem.find(".wavefront-func-param-link").first().click();
								}, 10);
							}
						}

						function relink() {
							elem.children().remove();

							addElementsAndCompile();
							ifJustAddedFocusFirstParam();
						}

						relink();
					}
				};
			});

			angular.module("grafana.directives").directive("regexValidator", function () {
				return {
					require: "ngModel",
					restrict: "A",
					link: function (scope, elem, attr, ngModel) {

						ngModel.$parsers.unshift(function (value) {
							var valid = isValidRegex(value);
							ngModel.$setValidity("regexValidator", valid);
							if (!valid) {
								return undefined;
							}
							return value;
						});

						ngModel.$formatters.unshift(function (value) {
							ngModel.$setValidity("regexValidator", isValidRegex(value));
							return value;
						});

						function isValidRegex(str) {
							try {
								new RegExp(str);
								return true;
							} catch (e) {
								return false;
							}
						}
					}
				};
			});

			angular.module("grafana.directives").directive("wfTypeahead", ["$parse", function ($parse) {

				return {
					restrict: "A",
					require: "ngModel",
					link: function postLink(scope, element, attrs, controller) {

						var getter = $parse(attrs.wfTypeahead);
						var value = getter(scope);

						// Watch wfTypeahead for changes
						scope.$watch(attrs.wfTypeahead, function (newValue, oldValue) {
							if (newValue !== oldValue) {
								value = newValue;
							}
						});

						element.attr("data-provide", "typeahead");
						element.typeahead({
							source: function () {
								return angular.isFunction(value) ? value.apply(null, arguments) : value;
							},
							minLength: attrs.minLength || 1,
							items: attrs.items,
							updater: function (value) {
								// If we have a controller (i.e. ngModelController) then wire it up
								if (controller) {
									scope.$apply(function () {
										controller.$setViewValue(value);
									});
								}

								if (value !== "" && value.endsWith(".")) {
									this.lookup(value);
								}

								scope.$emit("typeahead-updated", value);
								return value;
							}
						});

						// Bootstrap override
						var typeahead = element.data("typeahead");
						typeahead.lookup = function (value) {
							var items;
							this.query = value || this.$element.val() || "";
							if (this.query.length < this.options.minLength) {
								return this.shown ? this.hide() : this;
							}
							items = $.isFunction(this.source) ? this.source(this.query, $.proxy(function (itemAry) {
										if (itemAry.length === 1 && itemAry[0] === this.$element.val()) {
											// do nothing
										} else {
											this.process(itemAry);
										}
									}, this)) : this.source;
							return items ? this.process(items) : this;
						};

						// Return true on every item, for example if the dropdown is populated with server-side sugggestions
						if (!!attrs.matchAll) {
							typeahead.matcher = function () {
								return true;
							};
						}

						// Support 0-minLength
						if (attrs.minLength === "0") {
							setTimeout(function () { // Push to the event loop to make sure element.typeahead is defined (breaks tests otherwise)
								element.on("focus", function () {
									if (element.val().length === 0) {
										setTimeout(element.typeahead.bind(element, "lookup"), 200);
									}
								});
							});
						}

					}
				};

			}]);
		}
);
