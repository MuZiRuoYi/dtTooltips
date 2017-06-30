/**
 * ngTooltips - easy directive of tooltips.
 * base in jQuery.
 * First Update 2017/06/29
 */
(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        // CommonJS
        if (typeof angular === 'undefined') {
            factory(require('angular'));
        } else {
            factory(angular);
        }
        module.exports = 'qtTooltips';
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(['angular'], factory);
    } else {
        // Global Variables
        factory(root.angular);
    }
}(this, function (angular) {
	'use strict';

	var tips = angular.module('qtTooltips', []);
	tips.factory('tooltipsService', ['$timeout', tooltipsService]);
	tips.factory('tooltips', ['tooltipsService', tooltips]);
	tips.directive('tooltips', ['tooltips', tooltipsDirective]);
	tips.directive('tooltipsWhenLong', ['tooltips', '$timeout', tooltipsWhenLongDirective]);

	/**
	 * tooltips 服务，提供tooltips所需方法集
	 */
	function tooltipsService($timeout) {

		/**
		 * 获取文字所占空间大小
		 * @param 文字
		 * @param 文字的样式
		 * @return {width: Number, Height: Number} 文字所占空间大小
		 */
		function getTextSize(text, style) {
			var ele = $('<div>' + text + '</div>'),
				width,
				height;
			ele.css({
				zIndex: -3,
				display: 'inline-block',
				boxSizing: 'border-box'
			});
			ele.css(style || {});
			$('body').append(ele);
			width = ele.width() + parseInt(ele.css('padding-left')) + parseInt(ele.css('padding-right')) +
				parseInt(ele.css('border-left-width')) + parseInt(ele.css('border-right-width'));
			height = ele.height() + parseInt(ele.css('padding-top')) + parseInt(ele.css('padding-bottom')) +
				parseInt(ele.css('border-top-width')) + parseInt(ele.css('border-bottom-width'));
			ele.remove();

			return {
				width: width,
				height: height
			};
		}

		/**
		 * 鼠标事件 显示
		 * @param {Event} event 鼠标事件
		 * @param {tooltips} tooltips 解析后配置对象
		 */
		function tooltipsShow(event, tooltips) {

			function tooltipsShow(event) {
				var position = showPosition(event, tooltips);
				tooltips.insertedNode = getTemplate().addClass(tooltips.class).css({
					left: position.left,
					top: position.top,
					maxWidth: tooltips.maxWidth
				});
				// console.log(tooltips.insertedNode);
				$(tooltips.insertElement).append(tooltips.insertedNode);
				checkNodeExist();
			}

			function showPosition(event, tooltips) {
				var position;
				if(tooltips.onlyOffset) {
					position = {
						left: tooltips.offsetForMouse.left,
						top: tooltips.offsetForMouse.top
					};
				} else {
					position = calculatePosition(event, tooltips);
				}
				tooltips.showPosition(event, position, tooltips);
				return position;
			}

			function getTemplate() {
				var template;
				if(tooltips.template) {
					if(tooltips.useHtml) {
                        template = '<div>' + tooltips.template + '</div>'
					} else {
                        template = '<div>' + tooltips.template.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>'
					}
				} else if(tooltips.templateNode) {
					return tooltips.templateNode
				}
				// console.log(tooltips);
				return $(template);
			}

			function checkNodeExist() {
				tooltips.checkNodeExistTimer = $timeout(function() {
					var ele = $(document).find(tooltips.element);
					if(ele.length > 0) {
						checkNodeExist();
					} else {
						tooltips.insertedNode.remove();
					}
				}, tooltips.delayHidden);
			}

			tooltipsShow(event);
		}

		/**
		 * 转换配置项 / 配置默认配置
		 * @param {Element} element 使用tooltips的节点
		 * @param {String} text 展示数据（字符串）
		 * @param {Config} config 初始配置
		 * @returns  { | tooltips} 配置项解析结果
		 */
		function getConfig(element, text, config) {
			if(arguments.length === 0) {
				element = 'body';
			}
			if(angular.isObject(text)) {
				config = text;
			}
			if(!config || !angular.isObject(config)) {
				config = {};
			}
			!config.offsetForMouse ? config.offsetForMouse = {} : '';

			return {
				// 可配置
				delayShow: parseInt(config.delayShow) || 360,    // 鼠标保持静止事件，超过该时间展示tooltips
				delayHidden: parseInt(config.delayHidden) || 300,    // 鼠标离开，tooltips该时间后取消
				moveByMouse: !!config.moveByMouse,    // 是否根据鼠标确定tooltips位置
				template: text || config.template,    // 模板（要展示字符串）
                templateUrl: config.templateUrl,
                templateNode: config.templateNode,
				element: $(element),
				offsetForMouse: {
					left: config.offsetForMouse.left || 8,
					top: config.offsetForMouse.top || 24
				},
				onlyOffset: !!config.onlyOffset,
				showPosition: config.showPosition || function() {
				},
				showPositionByMouse: !!config.showPositionByMouse,
				useHtml: config.useHtml !== false,
				class: 'qt-tooltips ' + (config.class || ''),
				tooltipsIsCenter: !!config.tooltipsIsCenter,
				maxWidth: config.maxWidth,
				maxWidthType: config.maxWidthType,
				showField: $(config.showFiled || window),    // tooltips 显示域（边界条件范围基准，但是还是会插入到DOM最外层）,默认为视口
				judgeShow: config.judgeShow || function() { return true; },
				// 不可配置
				paddingLeft: 8,
				autoMaxWidth: 336,
				paddingTop: 4,
				insertedNode: null,
				insertElement: 'body',// $(element).parent(),
				mouseMoveTimer: null,
				mouseLeaveTimer: null,
				checkNodeExistTimer: null
			};
		}

		/**
		 * 计算插入tooltips节点位置
		 * @param {Event} event 事件（获取鼠标位置）
		 * @param {tooltips} tooltips 对象（解析后配置）
		 * @returns {{left: *, top: *}| Object} 插入节点位置信息
		 */
		function calculatePosition(event, tooltips) {
			// 计算插入节点size
			calculateSize(tooltips);

			var e = event || window.event,
				element = tooltips.element,
				eleWidth = element.width(),
				eleParentWidth = element.parent().width(),
				left, top,
				width = tooltips.showField.width(),
				height = tooltips.showField.height();

			if(tooltips.showPositionByMouse) {
				left = e.clientX + tooltips.offsetForMouse.left;
				top = e.clientY + tooltips.offsetForMouse.top;

				// todo 判断是否足够显示
				if(left + tooltips.templateSize.width > width) {
				}
				if(top + tooltips.templateSize.height > height) {
				}
			} else {
				left = tooltips.tooltipsIsCenter
					? element.offset().left + eleWidth / 2 - tooltips.templateSize.width / 2
					: element.offset().left;
				top = e.clientY + tooltips.offsetForMouse.top;

				// 判断是否足够显示
				if(left + tooltips.templateSize.width > width) {
					left = element.offset().left +
						(eleParentWidth > eleWidth ? eleWidth : eleParentWidth) -
						tooltips.templateSize.width;
				}
				if(top + tooltips.templateSize.height > height) {
					top = e.clientY - tooltips.element.height() - tooltips.templateSize.height;
				}
			}

			tooltips.position = {
				left: left,
				top: top
			};
			return tooltips.position;
		}

		/**
		 * 计算插入节点的size
		 * @param {tooltips}
		 * @return 模板size
		 */
		function calculateSize(tooltips) {
			var width = tooltips.element.parent().width();
			tooltips.maxWidth = tooltips.maxWidthType === 'inherit'
				? (width > tooltips.autoMaxWidth ? width : tooltips.autoMaxWidth)
				: (tooltips.maxWidth === false ? 'auto' : tooltips.autoMaxWidth);

			tooltips.templateSize = getTextSize(tooltips.template, {
				padding: tooltips.paddingTop + 'px ' + tooltips.paddingLeft + 'px',
				maxWidth: tooltips.maxWidth,
				fontSize: '12px'
			});

			return tooltips.templateSize;
		}

		/**
		 * 鼠标离开
		 * @param {Event} event 事件
		 * @param {tooltips} tooltips 对象
		 */
		function mouseLeave(event, tooltips) {
			$timeout.cancel(tooltips.mouseMoveTimer);
			tooltips.mouseLeaveTimer = $timeout(function() {
				if(tooltips.insertedNode) {
					tooltips.insertedNode.remove();
				}
			}, tooltips.delayHidden);
		}

		/**
		 * 鼠标移动
		 * @param {Event} event 事件 计算鼠标位置
		 * @param {tooltips} tooltips 对象
		 */
		function mouseMove(event, tooltips) {
			// 是否根据鼠标移动
			if(tooltips.moveByMouse) {
				tooltips.showPositionByMouse = true;
				var position = calculatePosition(event, tooltips);
				tooltips.insertedNode.css(position);
				tooltips.insertedNode.css({
					maxWidth: tooltips.maxWidth
				});
			} else {
				// 不随鼠标移动
				$timeout.cancel(tooltips.mouseMoveTimer);
				tooltips.mouseMoveTimer = $timeout(function() {
					tooltipsShow(event, tooltips);
					$(tooltips.element).unbind('mousemove');
					tooltips.insertedNode.bind('mouseenter', function(event) {
						$timeout.cancel(tooltips.mouseLeaveTimer);
						tooltips.insertedNode.unbind('mouseenter');
					});
					tooltips.insertedNode.bind('mouseleave', function(event) {
						tooltips.insertedNode.unbind('mouseleave');
						if(tooltips.insertedNode) {
							tooltips.insertedNode.remove();
						}
					});
				}, tooltips.delayShow);
			}
		}

		return {
			init: getConfig,
			mouseLeave: mouseLeave,
			mouseMove: mouseMove
		};
	}

	/**
	 * 具体使用tooltips服务
	 * 提供最简单的使用入口：初始化与销毁
	 */
	function tooltips(tooltipsService) {
		/**
		 * 使用tooltips
		 * @param {String} jQuery选择器，找到使用tooltips的节点
		 * @param {String} tooltips所需要展示的字符串
		 * @param {Object} tooltips配置项
		 */
		function useTooltips(selector, str, scope, config) {
			var tooltips = tooltipsService.init($(selector), str, config),
				ele = $(tooltips.element);
			ele.bind('mouseenter', function(event) {
				if(tooltips.judgeShow()) {
					ele.css({
						cursor: 'pointer'
					});
					if(tooltips.moveByMouse) {
						tooltipsService.show(event, tooltips);
					}
					ele.bind('mousemove', function(event) {
						tooltipsService.mouseMove(event, tooltips);
					});
					ele.bind('mouseleave', function(event) {
						ele.unbind('mouseleave');
						tooltipsService.mouseLeave(event, tooltips);
					});
				} else {
					ele.css({
						cursor: ''
					});
					ele.unbind('mousemove');
					ele.unbind('mouseleave');
				}
			});

			return tooltips;
		}

		/**
		 * 销毁tooltips相关所有事件
		 * @param {String} jQuery选择器，查找需要tooltips的节点
		 *        并且取消所有使用时绑定的事件
		 */
		function unbind(selector) {
			$(selector).unbind('mouseenter');
			$(selector).unbind('mouseleave');
			$(selector).unbind('mousemove');
		}

		return {
			init: useTooltips,
			unbind: unbind
		};
	}

	/**
	 * tooltips指令
	 */
	function tooltipsDirective(tooltips) {
		return {
			restrict: 'A',
			scope: {tooltipsConfig: '=', tooltips: '=', tooltipsIsCenter: '='},
			replace: false,
			link: function(scope, element, attrs) {

				function initTooltips() {
					var config = scope.tooltipsConfig || {};
					config.tooltipsIsCenter = scope.tooltipsIsCenter;
					var over = tooltips.init(element, scope.tooltips, scope, config);

					// 监控文案变化，及时更新tooltips展示内容
					var watch = scope.$watch(function() {
						return scope.tooltips;
					}, function() {
						if(angular.isString(scope.tooltips)) {
							over.template = scope.tooltips;
							if(over.insertedNode) {
								over.insertedNode.text(scope.tooltips.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
							}
						}
					});

					// 销毁
					scope.$on('$destroy', function() {
						watch();
					});
				}

				initTooltips();
			}
		};
	}

	/**
	 * tooltips智能化指令
	 * 只有当tooltips接收的内容放不下后才出现tooltips
	 * 根据使用tooltips节点size与父节点size对比
	 */
	function tooltipsWhenLongDirective(tooltips, $timeout) {
		return {
			restrict: 'A',
			scope: {tooltipsWhenLongConfig: '=', tooltipsWhenLong: '=', tooltipsDiff: '='},
			replace: false,
			link: function(scope, element, attrs) {

				function init() {
					var config = scope.tooltipsWhenLongConfig || {};
					config.maxWidthType = config.maxWidth === undefined ? 'inherit' : undefined;
					config.judgeShow = isTooLong;

					// 监控tooltips中内容大小变化
					var watch = scope.$watch(function() {
						return scope.tooltipsWhenLong;
					}, function() {
						if(angular.isString(scope.tooltipsWhenLong) && !scope.over) {
							scope.over = tooltips.init(element, scope.tooltipsWhenLong, scope, config);
						}
						if(angular.isString(scope.tooltipsWhenLong) && scope.over.insertedNode) {
							scope.over.template = scope.tooltipsWhenLong;
							// 
							scope.over.insertedNode.text(scope.tooltipsWhenLong.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
						}
					});

					// 销毁
					scope.$on('$destroy', function() {
						watch();
					});
				}

				/**
				 * 计算节点内容是否超出父节点长度
				 * 判断是否需要显示tooltips
				 * @return 是否需要tooltips
				 */
				function isTooLong() {
					var width = element.width(),
						pWidth = element.parent().width();

					if(scope.tooltipsDiff) {
						width += parseInt(scope.tooltipsDiff);
					}

					return width > pWidth;
				}

				init();

			}
		};
	}
}));


