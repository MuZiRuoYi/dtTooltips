## dtTooltips


#### 简介

dtTooltips是基于angular.js的指令，主要目的在于鼠标移动上去后展示文字信息，主要以下包含两种指令，`dtTooltips` 和 `dtTooltipsWhenLong`。前者鼠标移动上去即展示，后者需要内容宽度大于父节点宽度才展示tooltips。<br>
tooltips位置：一般情况，与内容左对齐，与鼠标指针最上方相差`24px`，也可以根据配置进行设置。

#### 使用方法

HTML：
```html
<div class="dt-tooltips-text" tooltips="ex1" ng-bind="ex1"></div>
<div class="dt-tooltips-text">
    <span tooltips-when-long="ex2" ng-bind="ex2"></div>
</div>
<div class="dt-tooltips-text" tooltips="ex1" ng-bind="ex1"></div>
```
CSS:
```css
.dt-tooltips-text {
    width:  300px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
```
JS:
```javascript
$scope.ex1 = 'This is the first example for dtTooltips.';
$scope.ex2 = 'This is the seconed example for dtTooltips, but this is more long.';
```

#### 其他属性

HTML：
```html
<div class="dt-tooltips-text" tooltips="ex1" tooltips-is-center='true'></div>
```
tooltipsIsCenter：true/false，默认false, 控制tooltips展示位置是否与元素相对居中。

#### 其他可配置项

HTML:
```html 
<div class="dt-tooltips-text" tooltips="ex1" tooltips-config='config'></div>
```

config.delayShow: number, 鼠标进入后延时出现，默认360ms<br>
config.delayHidden：number，鼠标离开后延时隐藏，默认360ms<br>
config.templateNode：jQueryNode，tooltips模板，定义后tooltips展示模板内容<br>
config.offsetForMouse.left：number，相对偏移位置，默认8px<br>
config.offsetForMouse.top：number，相对偏移位置，默认24px<br>
config.showPosition：function(event, tooltips)，手动更改位置<br>
config.useHtml：true/false，是否接受HTML，默认false<br>
config.class：string，接受class属性，可自定义样式<br>
config.tooltipsIsCenter：true/false，tooltips是否居中展示，默认false，居左<br>
config.maxWidth: number，tooltips最大宽度，默认336px<br>
config.maxWidthType：auto/inherit，不设置最大宽度/继承父元素最大宽度，默认null<br>
config.judgeShow：function(){return true/false;}, 根据返回值判断是否展示tooltips<br>

