# 你不知道的JavaScript 阅读笔记

## 相关
- 可以在这里下载本书第一部分“作用域和闭包”随附的资料（代码示例、练习题等）：
http://bit.ly/1c8HEWF。
- 可以在这里下载本书第二部分“this 和对象原型”随附的资料（代码示例、练习题等）：
http://bit.ly/ydkjs-this-code

## 作用域是什么
### 1.编译原理
传统语言中，三个步骤

__分词/词法分析（Tokenizing/Lexing）:__ 这个过程会将由字符组成的字符串分解成（对编程语言来说）有意义的代码块，这些代
码块被称为词法单元（token）。例如，考虑程序 var a = 2;。这段程序通常会被分解成
为下面这些词法单元：var、a、=、2 、;。

__解析/语法分析（Parsing）:__ 这个过程是将词法单元流（数组）转换成一个由元素逐级嵌套所组成的代表了程序语法
结构的树。这个树被称为“抽象语法树”（Abstract Syntax Tree，AST）。

__代码生成：__ 将AST 转换为可执行代码的过程称被称为代码生成，包括分配内存等

比起那些编译过程只有三个步骤的语言的编译器，JavaScript 引擎要复杂得多，任何JavaScript 代码片段在执行前都要进行编译（通常就在执行前）

### 2.理解作用域

- __引擎__&emsp;从头到尾负责整个JavaScript 程序的编译及执行过程。
- __编译器__&emsp;引擎的好朋友之一，负责语法分析及代码生成等脏活累活（详见前一节的内容）。
- __作用域__&emsp;引擎的另一位好朋友，负责收集并维护由所有声明的标识符（变量）组成的一系列查
询，并实施一套非常严格的规则，确定当前执行的代码对这些标识符的访问权限。

RHS和LHS，查找变量的值和查找容器本身
#### 2.1工作流程
_举例：`var a = 2`_
1. 遇到var a，编译器会询问作用域是否已经有一个该名称的变量存在于同一个作用域的
集合中。如果是，编译器会忽略该声明，继续进行编译；否则它会要求作用域在当前作
用域的集合中声明一个新的变量，并命名为a。
2. 接下来编译器会为引擎生成运行时所需的代码，这些代码被用来处理a = 2 这个赋值
操作。引擎运行时会首先询问作用域，在当前的作用域集合中是否存在一个叫作a 的
变量。如果是，引擎就会使用这个变量；如果否，引擎会继续查找该变量（查看1.3
节）。

总结：变量的赋值操作会执行两个动作，首先__编译器__会在当前作用域中声明一个变量（如
果之前没有声明过），然后在运行时__引擎__会在作用域中查找该变量，如果能够找到就会对
它赋值

3.
 ```JavaScript
function foo(a) {
  console.log( a ); // 2
}
foo( 2 );
```
```
让我们把上面这段代码的处理过程想象成一段对话，这段对话可能是下面这样的。
引擎：我说作用域，我需要为 foo 进行RHS引用。你见过它吗？
作用域：别说，我还真见过，编译器那小子刚刚声明了它。它是一个函数，给你。
引擎：哥们太够意思了！好吧，我来执行一下 foo 。
引擎：作用域，还有个事儿。我需要为 a 进行LHS引用，这个你见过吗？
作用域：这个也见过，编译器最近把它声名为 foo 的一个形式参数了，拿去吧。
引擎：大恩不言谢，你总是这么棒。现在我要把 2 赋值给 a 。
引擎：哥们，不好意思又来打扰你。我要为 console 进行RHS引用，你见过它吗？
作用域：咱俩谁跟谁啊，再说我就是干这个。这个我也有， console 是个内置对象。
给你。
引擎：么么哒。我得看看这里面是不是有 log(..) 。太好了，找到了，是一个函数。
引擎：哥们，能帮我再找一下对 a 的RHS引用吗？虽然我记得它，但想再确认一次。
作用域：放心吧，这个变量没有变动过，拿走，不谢。
引擎：真棒。我来把 a 的值，也就是 2 ，传递进 log(..)
```
4. 作用域嵌套

引擎会一层一层往上找，直到全局

### 3. 异常
- 如果 RHS 查询在所有嵌套的作用域中遍寻不到所需的变量，引擎就会抛出 ReferenceError
异常。

- 当引擎执行 LHS 查询时，如果在顶层（全局作用域）中也无法找到目标变量，
全局作用域中就会创建一个具有该名称的变量，并将其返还给引擎，前提是程序运行在非
“严格模式”下。
在
严格模式中 LHS 查询失败时，并不会创建并返回一个全局变量，引擎会抛出同 RHS 查询
失败时类似的 ReferenceError 异常。

- 如果 RHS 查询找到了一个变量，但是你尝试对这个变量的值进行不合理的操作，
比如试图对一个非函数类型的值进行函数调用，或着引用 null 或 undefined 类型的值中的
属性，那么引擎会抛出另外一种类型的异常，叫作 TypeError 。

## 词法作用域
- 作用域共有两种主要的工作模型。第一种是最为普遍的，被大多数编程语言所采用的__词法
作用域__，我们会对这种作用域进行深入讨论。
另外一种叫作__动态作用域__，仍有一些编程语
言在使用（比如 Bash 脚本、Perl 中的一些模式等）。

### 1. 词法阶段
大部分标准语言编译器的第一个工作阶段叫作词法化（也叫单词化）。
词法作用域就是定义在词法阶段的作用域（由你在写
代码时将变量和块作用域写在哪里来决定的）。
#### 1.1 查找
作用域查找始终从运行时所处的最内部作用域开始，逐级向外或者说向上进行，直到遇见
第一个匹配的标识符为止。

### 2. 欺骗词法

JavaScript 中有两种机制来实现这个目的.

_欺骗词法作用域会导致性能下降_

_另外一个不推荐使用 eval(..) 和 with 的原因是会被严格模式所影响（限
制）。 with 被完全禁止，而在保留核心功能的前提下，间接或非安全地使用
eval(..) 也被禁止了。_

#### 2.1 eval
```JavaScript
function foo(str, a) {
eval( str ); // 欺骗！
console.log( a, b );
}
var b = 2;
foo( "var b = 3;", 1 ); // 1, 3
```
eval(..) 调用中的 "var b = 3;" 这段代码会被当作本来就在那里一样来处理。在严格模式的程序中， eval(..) 在运行时有其自己的词法作用域

#### 2.2 with
```JavaScript
function foo(obj) {
with (obj) {
a = 2;
}
}
var o1 = {
a: 3
};
var o2 = {
b: 3
};
foo( o1 );
console.log( o1.a ); // 2
foo( o2 );
console.log( o2.a ); // undefined
console.log( a ); // 2——不好，a 被泄漏到全局作用域上了！
```

可以这样理解，当我们传递 o1 给 with 时， with 所声明的作用域是 o1 ，而这个作用域中含
有一个同 o1.a 属性相符的标识符。但当我们将 o2 作为作用域时，其中并没有 a 标识符，
因此进行了正常的 LHS 标识符查找（查看第 1 章）。

o2 的作用域、 foo(..) 的作用域和全局作用域中都没有找到标识符 a ，因此当 a＝2 执行
时，自动创建了一个全局变量（因为是非严格模式）。

## 函数作用域和块作用域
### 1. 函数中的作用域
属于这个函数的全部变量都可以在整个函数的范围内使用及复
用（事实上在嵌套的作用域中也可以使用

### 2. 隐藏内部实现

对函数的传统认知就是先声明一个函数，然后再向里面添加代码。但反过来想也可以带来
一些启示：从所写的代码中挑选出一个任意的片段，然后用函数声明对它进行包装，实际
上就是把这些代码“隐藏”起来了。

基于作用域的隐藏方法大都是从最小特权原则中引申出来
的，也叫最小授权或最小暴露原则。这个原则是指在软件设计中，应该最小限度地暴露必
要内容，而将其他内容都“隐藏”起来，比如某个模块或对象的 API 设计。

例如：
```JavaScript
function doSomething(a) {
b = a + doSomethingElse( a * 2 );
console.log( b * 3 );
}
function doSomethingElse(a) {
return a - 1;
}
var b;
doSomething( 2 ); // 15
```
在这个代码片段中，变量 b 和函数 doSomethingElse(..) 应该是 doSomething(..) 内部具体
实现的“私有”内容。给予外部作用域对 b 和 doSomethingElse(..) 的“访问权限”不仅
没有必要，而且可能是“危险”的，因为它们可能被有意或无意地以非预期的方式使用，
从而导致超出了 doSomething(..) 的适用条件。更“合理”的设计会将这些私有的具体内
容隐藏在 doSomething(..) 内部
```JavaScript
function doSomething(a) {
function doSomethingElse(a) {
return a - 1;
}
var b;
b = a + doSomethingElse( a * 2 );
console.log( b * 3 );
}
doSomething( 2 ); // 15
```

#### 2.1 规避冲突
“隐藏”作用域中的变量和函数所带来的另一个好处，是可以避免同名标识符之间的冲突，
两个标识符可能具有相同的名字但用途却不一样，无意间可能造成命名冲突。

- 变量冲突的一个典型例子存在于__全局作用域__中。当程序中加载了多个第三方库时，如果它
们没有妥善地将内部私有的函数或变量隐藏起来，就会很容易引发冲突。
- 另外一种避免冲突的办法和现代的模块机制很接近，就是从众多__模块管理器__中挑选一个来
使用。使用这些工具，任何库都无需将标识符加入到全局作用域中，而是通过依赖管理器
的机制将库的标识符显式地导入到另外一个特定的作用域中。

### 3. 函数作用域

#### 3.1 匿名和具名
函数表达式可以是匿名的，
而函数声明则不可以省略函数名

#### 3.2 立即执行函数表达式
- IIFE，代表立即执行函数表达式
（Immediately Invoked Function Expression）

由于函数被包含在一对 ( ) 括号内部，因此成为了一个表达式，通过在末尾加上另外一个
( ) 可以立即执行这个函数，比如 (function foo(){ .. })() 。第一个 ( ) 将函数变成表
达式，第二个 ( ) 执行了这个函数

IIFE 的另一个非常普遍的进阶用法是把它们当作函数调用并传递参数进去。
```JavaScript
var a = 2;
(function IIFE( global ) {
var a = 3;
console.log( a ); // 3
console.log( global.a ); // 2
})( window );
console.log( a ); // 2
```
我们将 window 对象的引用传递进去，但将参数命名为 global ，因此在代码风格上对全局
对象的引用变得比引用一个没有“全局”字样的变量更加清晰。

IIFE 还有一种变化的用途是倒置代码的运行顺序,这种模式在 UMD（Universal Module Definition）项目中被广
泛使用

```JavaScript
var a = 2;
(function IIFE( def ) {
def( window );
})(function def( global ) {
var a = 3;
console.log( a ); // 3
console.log( global.a ); // 2
});
```
### 4. 块作用域
块作用域的用处。变量的声明应该距离使用的地方越近越好，并最大限度地本地化。

变量`i`会污染整个全局作用域
```JavaScript
for (var i=0; i<10; i++) {
console.log( i );
}
```

#### 一些能够创建块作用域的语句：
```JavaScript
// 1
with(something){
    
}
// 2
try {

} catch (e) {

} finally {

}
// 3
let

{
  // 显示的声明一个块级作用域,并用let 将变量绑定在当前作用域上。
  // 在这个块中定义的内容可以被内存回收销毁
  // 这个应该是指类似 
  let a = 1
}

// 4
const b = 0
```
### 5. 小结
函数是 JavaScript 中最常见的作用域单元。本质上，声明在一个函数内部的变量或函数会
在所处的作用域中“隐藏”起来，这是有意为之的良好软件的设计原则。
但函数不是唯一的作用域单元。块作用域指的是变量和函数不仅可以属于所处的作用域，
也可以属于某个代码块（通常指 { .. } 内部）。
从 ES3 开始， try/catch 结构在 catch 分句中具有块作用域。
在 ES6 中引入了 let 关键字（ var 关键字的表亲），用来在任意代码块中声明变量。 if
(..) { let a = 2; } 会声明一个劫持了 if 的 { .. } 块的变量，并且将变量添加到这个块
中。
有些人认为块作用域不应该完全作为函数作用域的替代方案。两种功能应该同时存在，开
发者可以并且也应该根据需要选择使用何种作用域，创造可读、可维护的优良代码。

## 提升

### 1. 先鸡先蛋
直觉上会认为 JavaScript 代码在执行时是由上到下一行一行执行的。但实际上这并不完全
正确，有一种特殊情况会导致这个假设是错误的
```JavaScript
a = 2;
var a;
console.log( a );  // 2
```
```JavaScript
console.log( a ); // undefined
var a = 2;
```
### 2. 编译器
看到 `var a = 2;` 时，可能会认为这是一个声明。但 JavaScript 实际上会将其看成两个
声明： `var a;` 和 `a = 2;` 。第一个定义声明是在编译阶段进行的。第二个赋值声明会被留在
原地等待执行阶段。

我们的第一个代码片段会以如下形式进行处理：
```JavaScript
var a;
a = 2;
console.log( a );
```
其中第一部分是编译，而第二部分是执行。
类似地，我们的第二个代码片段实际是按照以下流程处理的：
```JavaScript
var a;
console.log( a );
a = 2;
```
因此，打个比方，这个过程就好像变量和函数声明从它们在代码中出现的位置被“移动”
到了最上面。这个过程就叫作提升。

__只有声明本身会被提升，而赋值或其他运行逻辑会留在原地__

注意的是，每个作用域都会进行提升操作

比如：
```JavaScript
foo();
function foo() {
console.log( a ); // undefined
var a = 2;
}
```
```JavaScript
function foo() {
var a;
console.log( a ); // undefined
a = 2;
}
foo();
```
函数表达式便不会提升
```JavaScript
foo(); // 不是 ReferenceError, 而是 TypeError!
var foo = function bar() {
// ...
}
```
### 3. 函数优先
```JavaScript
foo(); // 1
var foo;
function foo() {
console.log( 1 );
}
foo = function() {
console.log( 2 );
};
```
### 4. 小结
我们习惯将 `var a = 2;` 看作一个声明，而实际上 JavaScript 引擎并不这么认为。它将 `var a`和 `a = 2` 当作两个单独的声明，第一个是编译阶段的任务，而第二个则是执行阶段的任务。这意味着无论作用域中的声明出现在什么地方，都将在代码本身被执行前首先进行处理。可以将这个过程形象地想象成所有的声明（变量和函数）都会被“移动”到各自作用域的最顶端，这个过程被称为提升。

## 闭包

定义:当函数可以记住并访问所在的词法作用域时，就产生了闭包，即使函数是在当前词法作用域之外执行。

```JavaScript
function foo() {
var a = 2;
function bar() {
console.log( a );
}
return bar;
}
var baz = foo();
baz(); // 2 —— magical
```
解读：
```
函数 bar() 的词法作用域能够访问 foo() 的内部作用域。然后我们将 bar() 函数本身当作
一个值类型进行传递。在这个例子中，我们将 bar 所引用的函数对象本身当作返回值。
在 foo() 执行后，其返回值（也就是内部的 bar() 函数）赋值给变量 baz 并调用 baz() ，实
际上只是通过不同的标识符引用调用了内部的函数 bar() 。
bar() 显然可以被正常执行。但是在这个例子中，它在自己定义的词法作用域以外的地方
执行。
在 foo() 执行后，通常会期待 foo() 的整个内部作用域都被销毁，因为我们知道引擎有垃
圾回收器用来释放不再使用的内存空间。由于看上去 foo() 的内容不会再被使用，所以很
自然地会考虑对其进行回收。
而闭包的“神奇”之处正是可以阻止这件事情的发生。事实上内部作用域依然存在，因此
没有被回收。谁在使用这个内部作用域？原来是 bar() 本身在使用。
拜 bar() 所声明的位置所赐，它拥有涵盖 foo() 内部作用域的闭包，使得该作用域能够一
直存活，以供 bar() 在之后任何时间进行引用。
bar() 依然持有对该作用域的引用，而这个引用就叫作闭包。
```
本质上无论何时何地，如果将函数（访问它们各自的词法作用域）当作第一
级的值类型并到处传递，你就会看到闭包在这些函数中的应用。在定时器、事件监听器、
Ajax 请求、跨窗口通信、Web Workers 或者任何其他的异步（或者同步）任务中，只要使
用了回调函数，实际上就是在使用闭包！

### 1. 循环和闭包

```JavaScript
for (var i=1; i<=5; i++) {
setTimeout( function timer() {
console.log( i );
}, i*1000 );
}
```

```JavaScript
for (var i=1; i<=5; i++) {
(function(j) {
setTimeout( function timer() {
console.log( j );
}, j*1000 );
})( i );
}
```
我们使用 IIFE 在每次迭代时都创建一个新的作用域。换句话说，每次迭代我们都需要一个块作用域。第 3 章介绍了 `let` 声明，可以用来劫
持块作用域，并且在这个块作用域中声明一个变量
```JavaScript
for (var i=1; i<=5; i++) {
let j = i; // 是的，闭包的块作用域！
setTimeout( function timer() {
console.log( j );
}, j*1000 );
}
```
for 循环头部的 let 声明还会有一个特殊的行为。这个行为指出变量在循环过程中不止被声明一次，每次迭代都会声明。随后的每个迭代都会使用上一个迭代结束时的值来初始化这个变量。

```JavaScript
for (let i=1; i<=5; i++) {
setTimeout( function timer() {
console.log( i );
}, i*1000 );
}
```

### 2. 模块
```JavaScript
function CoolModule() {
var something = "cool";
var another = [1, 2, 3];
function doSomething() {
console.log( something );
}
function doAnother() {
console.log( another.join( " ! " ) );
}
return {
doSomething: doSomething,
doAnother: doAnother
};
}
var foo = CoolModule();
foo.doSomething(); // cool
foo.doAnother(); // 1 ! 2 ! 3
```
```JavaScript
var foo = (function CoolModule(id) {
function change() {
// 修改公共 API
publicAPI.identify = identify2;
}
function identify1() {
console.log( id );
}
function identify2() {
console.log( id.toUpperCase() );
}
var publicAPI = {
change: change,
identify: identify1
};
return publicAPI;
})( "foo module" );
foo.identify(); // foo module
foo.change();
foo.identify(); // FOO MODULE
```
### 3. 小结
当函数可以记住并访问所在的词法作用域，即使函数是在当前词法作用域之外执行，这时
就产生了闭包。

## 第二部分：this

一些this的用法
```JavaScript
function identify() {
return this.name.toUpperCase();
}
function speak() {
var greeting = "Hello, I'm " + identify.call( this );
console.log( greeting );
}
var me = {
name: "Kyle"
};
var you = {
name: "Reader"
};
identify.call( me ); // KYLE
identify.call( you ); // READER
speak.call( me ); // Hello, 我是 KYLE
speak.call( you ); // Hello, 我是 READE
```
```JavaScript
function foo() {
foo.count = 4; // foo 指向它自身
}
setTimeout( function(){
// 匿名（没有名字的）函数无法指向自身
}, 10 );
```
__this 是在运行时进行绑定的，并不是在编写时绑定，它的上下文取决于函数调
用时的各种条件。 this 的绑定和函数声明的位置没有任何关系，只取决于函数的调用方式__

__当一个函数被调用时，会创建一个活动记录（有时候也称为执行上下文）。这个记录会包
含函数在哪里被调用（调用栈）、函数的调用方法、传入的参数等信息。 this 就是记录的
其中一个属性，会在函数执行的过程中用到。__

## this解析
### 1. 调用位置
在理解 this 的绑定过程之前，首先要理解调用位置：调用位置就是函数在代码中被调用的
位置（而不是声明的位置）

### 2. 绑定规则
默认绑定在全局，如果__调用__的位置存在对应的上下文，那么绑定到对应的上下文上。可以显式的通过`call`和`apply`绑定到指定上下文，或者使用es5的 `Function.prototype.bind()` 绑定。

#### 2.1 默认绑定

```JavaScript
function foo() {
  console.log( this.a );
}
var a = 2;
foo(); // 2
```
注意，声明在全局作用域中的变量（比如 var a = 2 ）就是全局对
象的一个同名属性。它们本质上就是同一个东西，并不是通过复制得到的，就像一个硬币
的两面一样。

`foo()`是直接使用不带任何修饰的函数引用进行调用的，因此只能使用默认绑定，无法应用其他规则。

如果使用严格模式（ strict mode ），那么全局对象将无法使用默认绑定，因此 this 会绑定
到`undefined`

这里有一个微妙但是非常重要的细节，虽然 this 的绑定规则完全取决于调用位置，但是只
有 foo() 运行在非 strict mode 下时，默认绑定才能绑定到全局对象；严格模式下与 foo()
的调用位置无关：
```JavaScript
function foo() {
  console.log( this.a );
}
var a = 2;
(function(){
  "use strict";
  foo(); // 2
})();
```

#### 2.2 隐式绑定

另一条需要考虑的规则是__调用位置__是否有__上下文对象__
```JavaScript
function foo() {
  console.log( this.a );
}
var obj = {
  a: 2,
  foo: foo
};
obj.foo(); // 2
```
当函数引用有上下文对象时，隐式绑定规则会把函数调用中的 this 绑定到这个上下文对象。

对象属性引用链中只有最顶层或者说最后一层会影响调用位置。
```JavaScript
function foo() {
console.log( this.a );
}
var obj2 = {
  a: 42,
  foo: foo
};
var obj1 = {
  a: 2,
  obj2: obj2
};
obj1.obj2.foo(); // 42
```

__隐式丢失__
```JavaScript
function foo() {
  console.log( this.a );
}
var obj = {
  a: 2,
  foo: foo
};
var bar = obj.foo; // 函数别名！
var a = "oops, global"; // a 是全局对象的属性
bar(); // "oops, global"
```
虽然 bar 是 obj.foo 的一个引用，但是实际上，它引用的是 foo 函数本身，因此此时的bar() 其实是一个不带任何修饰的函数调用，因此应用了默认绑定。回调函数也会类似。

#### 2.3 显式绑定

使用 call(..) 和 apply(..) 方法
它们的第一个参数是一个对象，它们会把这个对象绑定到
this ，接着在调用函数时指定这个 this
```JavaScript
function foo() {
  console.log( this.a );
}
var obj = {
  a:2
};
foo.call( obj ); // 2
```
__硬绑定__
```JavaScript
function foo() {
console.log( this.a );
}
var obj = {
a:2
};
var bar = function() {
foo.call( obj );
};
bar(); // 2
setTimeout( bar, 100 ); // 2
// 硬绑定的 bar 不可能再修改它的 this
bar.call( window ); // 2
```

应用场景
```JavaScript
// 包裹函数
function foo(something) {
  console.log( this.a, something );
  return this.a + something;
}
var obj = {
  a:2
};
var bar = function() {
  return foo.apply( obj, arguments );
};
var b = bar( 3 ); // 2 3
console.log( b ); // 5
```
```JavaScript

function foo(something) {
  console.log( this.a, something );
  return this.a + something;
}
// 简单的辅助绑定函数
function bind(fn, obj) {
  return function() {
    return fn.apply( obj, arguments );
  };
}
var obj = {
  a:2
};
var bar = bind( foo, obj );
var b = bar( 3 ); // 2 3
console.log( b ); // 5
```

由于硬绑定是一种非常常用的模式，所以在 ES5 中提供了内置的方法 Function.prototype.
bind ，它的用法如下
```JavaScript
function foo(something) {
  console.log( this.a, something );
  return this.a + something;
}
var obj = {
  a:2
};
var bar = foo.bind( obj );
var b = bar( 3 ); // 2 3
console.log( b ); // 5
```

__API调用的“上下文”__

第三方库的许多函数，以及 JavaScript 语言和宿主环境中许多新的内置函数，都提供了一
个可选的参数，通常被称为“上下文”（context），其作用和 bind(..) 一样，确保你的回调
函数使用指定的 this 。
```JavaScript
function foo(el) {
console.log( el, this.id );
}
var obj = {
id: "awesome"
};
// 调用 foo(..) 时把 this 绑定到 obj
[1, 2, 3].forEach( foo, obj );
// 1 awesome 2 awesome 3 awesome
```

#### 2.4 new 绑定

构造函数：它们只是被 new 操作符调用的普通函数而已

举例来说，思考一下 Number(..) 作为构造函数时的行为，

ES5.1 中这样描述它：
```
15.7.2　Number 构造函数
当 Number 在 new 表达式中被调用时，它是一个构造函数：它会初始化新创建的
对象。
```
包括内置对象函数（比如 Number(..) ）在内的所有函数都可
以用 new 来调用，这种函数调用被称为构造函数调用。这里有一个重要但是非常细微的区
别：实际上并不存在所谓的`构造函数`，只有对于函数的`构造调用`。

使用new或者说发生构造函数调用时会发生下面操作
1. 创建（或者说构造）一个全新的对象。
2. 这个新对象会被执行 [[ 原型 ]] 连接。
3. 这个新对象会绑定到函数调用的 this 。
4. 如果函数没有返回其他对象，那么 new 表达式中的函数调用会自动返回这个新对象。

```JavaScript
function foo(a) {
  this.a = a;
}
var bar = new foo(2);
console.log( bar.a ); // 2
```

### 3. 优先级
new > bind()/call/apply > 隐式 > 默认

在new 中使用 硬绑定的话：

_之所以要在 new 中使用硬绑定函数，主要目的是预先设置函数的一些参数，这样在使用
new 进行初始化时就可以只传入其余的参数。 bind(..) 的功能之一就是可以把除了第一个
参数（第一个参数用于绑定 this ）之外的其他参数都传给下层的函数（这种技术称为“部
分应用”，是“柯里化”的一种）。_

```JavaScript
function foo(p1,p2) {
  this.val = p1 + p2;
}
// 之所以使用 null 是因为在本例中我们并不关心硬绑定的 this 是什么
// 反正使用 new 时 this 会被修改
var bar = foo.bind( null, "p1" );
var baz = new bar( "p2" );
baz.val; // p1p2
```

### 4. 绑定例外

#### 4.1.忽略this

使用 apply(..) 来“展开”一个数组，并当作参数传入一个函数
这两种方法都需要传入一个参数当作 this 的绑定对象。如果函数并不关心 this 的话，你
仍然需要传入一个占位值，这时 null 可能是一个不错的选择
```JavaScript
function foo(a,b) {
console.log( "a:" + a + ", b:" + b );
}
// 把数组“展开”成参数
foo.apply( null, [2, 3] ); // a:2, b:3
// 使用 bind(..) 进行柯里化
var bar = foo.bind( null, 2 );
bar( 3 ); // a:2, b:3
```

但是考虑加入了第三方库的话，默认this会被绑定到window，会造成不可预期的影响

更安全的是传入一个__空的非委托对象__,在 JavaScript 中创建一个空对象最简单的方法都是 Object.create(null)（详细介绍请看第 5 章）。 Object.create(null) 和 {} 很像，但是并不会创建 Object.prototype 这个委托，所以它比 {} “更空”：

```JavaScript
function foo(a,b) {
console.log( "a:" + a + ", b:" + b );
}
// 我们的 DMZ 空对象
var ø = Object.create( null );
// 把数组展开成参数
foo.apply( ø, [2, 3] ); // a:2, b:3
// 使用 bind(..) 进行柯里化
var bar = foo.bind( ø, 2 );
bar( 3 ); // a:2, b:3
```
#### 4.2 间接引用
```JavaScript
function foo() {
console.log( this.a );
}
var a = 2;
var o = { a: 3, foo: foo };
var p = { a: 4 };
o.foo(); // 3
(p.foo = o.foo)(); // 2
```
__严格模式， this 会被绑定到 undefined__

#### 4.3. 软绑定
```JavaScript
if (!Function.prototype.softBind) {
  Function.prototype.softBind = function(obj) {
    var fn = this;
    // 捕获所有 curried 参数
    var curried = [].slice.call( arguments, 1 );
    var bound = function() {
      return fn.apply(
        (!this || this === (window || global)) ?
        obj : this,
        curried.concat.apply( curried, arguments )
      );
    };
    bound.prototype = Object.create( fn.prototype );
    return bound;
  };
}
```
测试如下
```JavaScript
function foo() {
console.log("name: " + this.name);
}
var obj = { name: "obj" },
obj2 = { name: "obj2" },
obj3 = { name: "obj3" };
var fooOBJ = foo.softBind( obj );
fooOBJ(); // name: obj
obj2.foo = foo.softBind(obj);
obj2.foo(); // name: obj2 <---- 看！！！
fooOBJ.call( obj3 ); // name: obj3 <---- 看！
setTimeout( obj2.foo, 10 );
// name: obj <---- 应用了软绑定
```
### 5. this词法

箭头函数不使用 this 的四种标准规则，而是根据外层（函数或者全局）作用域来决
定 this
```JavaScript
function foo() {
  // 返回一个箭头函数
  return (a) => {
    //this 继承自 foo()
    console.log( this.a );
  };
}
var obj1 = {
  a:2
};
var obj2 = {
  a:3
};
var bar = foo.call( obj1 );
bar.call( obj2 ); // 2, 不是 3
```
箭头函数最常用于回调函数中，例如事件处理器或者定时器：
```JavaScript
function foo() {
setTimeout(() => {
// 这里的 this 在此法上继承自 foo()
console.log( this.a );
},100);
}
var obj = {
a:2
};
foo.call( obj ); // 2
```
箭头函数可以像 bind(..) 一样确保函数的 this 被绑定到指定对象，此外，其重要性还体
现在它用更常见的词法作用域取代了传统的 this 机制
_注：箭头函数将this绑定在了函数内的词法作用域上，故函数内引用this时会使用当前词法作用域内的this，而非采用传统的this绑定机制（隐式、间接、显式绑定、bind、new）_

本书推荐
1. 只使用词法作用域并完全抛弃错误 this 风格的代码；
2. 完全采用 this 风格，在必要时使用 bind(..) ，尽量避免使用 self = this 和箭头函数。

原因是：在同一个函数或者同一个程序中混合使用这两种风格通常会使代码更难维护，并且可能也会更难编写

_注：其目的应该是希望清楚的区分词法作用域和this机制，箭头函数或者self会在this上使用词法作用域机制，在代码上会产生混淆.孰好孰坏不好说，但我个人是比较赞同作者的思想，看似更高的效率其实失去了一些传统的美。_

### 6. 小结
如果要判断一个运行中函数的 this 绑定，就需要找到这个函数的直接调用位置。找到之后
就可以顺序应用下面这四条规则来判断 this 的绑定对象。
1. 由 new 调用？绑定到新创建的对象。
2. 由 call 或者 apply （或者 bind ）调用？绑定到指定的对象。
3. 由上下文对象调用？绑定到那个上下文对象。
4. 默认：在严格模式下绑定到 undefined ，否则绑定到全局对象。
一定要注意，有些调用可能在无意中使用默认绑定规则。如果想“更安全”地忽略 this 绑
定，你可以使用一个 DMZ 对象，比如 ø = Object.create(null) ，以保护全局对象。
ES6 中的箭头函数并不会使用四条标准的绑定规则，而是根据当前的词法作用域来决定
this ，具体来说，箭头函数会继承外层函数调用的 this 绑定（无论 this 绑定到什么）。这
其实和 ES6 之前代码中的 self = this 机制一样。
----
## 对象
### 1. 语法
两种形式
文字语法（对象字面量）
```JavaScript
var myObj = {
  key: value
  // ...
};
```
构造函数
```JavaScript
var myObj = new Object();
myObj.key = value;
```
### 2. 类型
JavaScript一共6种主要类型
- string
- number
- boolean
- null
- undefined
- object

ES6中新加入了`Symbol`,第七种。

null 有时会被当作一种对象类型，但是这其实只是语言本身的一个 bug，即对 null 执行
typeof null 时会返回字符串 "object" 。 1 实际上， null 本身是基本类型。

原理是这样的，不同的对象在底层都表示为二进制，在 JavaScript 中二进制前三位都为 0 的话会被判
断为 object 类型， null 的二进制表示是全 0，自然前三位也是 0，所以执行 typeof 时会返回“ object ”。

JavaScript 中有许多特殊的对象子类型，我们可以称之为复杂基本类型。
函数就是对象的一个子类型（从技术角度来说就是“可调用的对象”）。JavaScript 中的函
数是“一等公民”，因为它们本质上和普通的对象一样（只是可以调用），所以可以像操作
其他对象一样操作函数（比如当作另一个函数的参数）。
数组也是对象的一种类型，具备一些额外的行为。数组中内容的组织方式比一般的对象要
稍微复杂一些。

__内置对象__
- String
- Number
- Boolean
- Object
- Function
- Array
- Date
- Regxp
- Error

在 JavaScript 中，它们实际上只是一些内置函数

```JavaScript
var strPrimitive = "I am a string";
typeof strPrimitive; // "string"
strPrimitive instanceof String; // false
var strObject = new String( "I am a string" );
typeof strObject; // "object"
strObject instanceof String; // true
// 检查 sub-type 对象
Object.prototype.toString.call( strObject ); // [object String] 对象子类型

```
```JavaScript
var strPrimitive = "I am a string";
console.log( strPrimitive.length ); // 13
console.log( strPrimitive.charAt( 3 ) ); // "m"
```
必要时语言会自动把字符串字面量转换成一个 String 对象，可以直接在字符串字面量上访问属性或者方法，是因为引擎自动把字面量转换成 String 对象

同样的事也会发生在数值字面量上,对于布尔字面量来说也是如此

null 和 undefined 没有对应的构造形式，它们只有文字形式。相反， Date 只有构造，没有
文字形式。

Object 、 Array 、 Function 和 RegExp （正则表达式）来说，无论使用文字形式还是构
造形式，它们都是对象，不是字面量。

Error 一般用不上，本书没有详细说明

### 3. 内容

之前我们提到过，对象的内容是由一些存储在特定命名位置的（任意类型的）值组成的，
我们称之为属性。

需要强调的一点是，当我们说“内容”时，似乎在暗示这些值实际上被存储在对象内部，
但是这只是它的表现形式。在引擎内部，这些值的存储方式是多种多样的，__一般并不会存在对象容器内部。存储在对象容器内部的是这些属性的名称，__ 它们就像指针（从技术角度来说就是引用）一样，指向这些值真正的存储位置。

```JavaScript
var myObject = {
a: 2
};
myObject.a; // 2
myObject["a"]; // 2
```
.a 语法通常被称为“属性访问”， ["a"] 语法通常被称为“键访问”,实际上它们访问的是同一个位置，并且会返回相同的值 2

这两种语法的主要区别在于 . 操作符要求属性名满足标识符的命名规范，而 [".."] 语法
可以接受 __任意 UTF-8/Unicode__ 字符串作为属性名。举例来说，如果要引用名称为 "Super-
Fun!" 的属性，那就必须使用 ["Super-Fun!"] 语法访问，因为 Super-Fun! 并不是一个有效
的标识符属性名。

在对象中，属性名永远都是字符串。如果你使用 string （字面量）以外的其他值作为属性名，那它首先会被转换为一个字符串。即使是数字也不例外，虽然在数组下标中使用的的确是数字，但是在对象属性名中数字会被转换成字符串，所以当心不要搞混 __对象__ 和)__数组__ 中数字的用法：

#### 3.1 可计算属性名
ES6新增
```JavaScript
var prefix = "foo";
var myObject = {
[prefix + "bar"]:"hello",
[prefix + "baz"]: "world"
};
myObject["foobar"]; // hello
myObject["foobaz"]; // world
```
可计算属性名最常用的场景可能是 ES6 的符号（Symbol）。
```javascript
var myObject = {
[Symbol.Something]: "hello world"
}
```
#### 3.2 属性和方法
_这节就是口水仗，主要就是说一个对象的一个属性如果是函数的话，这个严格来说不一定就是这个对象的方法，因为这个函数可以随处引用，和对象的牵连可能也只是this指向的上下文关系_

如果访问的对象属性是一个函数，由于函数很容易被认为是属于某个对象，在其他语言中，属于对象（也被称为“类”）的函数通常被称为“方法”，因此把“属性访问”说成是“方法访问”也就不奇怪了

从技术角度来说，函数永远不会“属于”一个对象，所以把对象内部引用的函数称为“方
法”似乎有点不妥。

#### 3.3 数组
数组也是对象，所以虽然每个下标都是整数，你仍然可以给数组添加属性
```javascript
var myArray = [ "foo", 42, "bar" ];
myArray.baz = "baz";
myArray.length; // 3
myArray.baz; // "baz"
```

#### 3.4 复制对象
为什么没有内置的copy()?
```javascript
function anotherFunction() { /*..*/ }
var anotherObject = {
c: true
};
var anotherArray = [];
var myObject = {
a: 2,
b: anotherObject, // 引用，不是复本！
c: anotherArray, // 另一个引用！
d: anotherFunction
};
anotherArray.push( anotherObject, myObject );
```
对于浅拷贝来说，复制出的新对象中 a 的值会复制旧对象中 a 的值，也就是 2，但是新对象中 b 、 c 、 d 三个属性其实只是三个引用，它们和旧对象中 b 、 c 、 d 引用的对象是一样的。对于深复制来说，除了复制 myObject 以外还会复制 anotherObject 和 anotherArray 。这时问题就来了， anotherArray 引用了 anotherObject 和myObject ，所以又需要复制 myObject ，这样就会由于循环引用导致死循环。

除此之外，我们还不确定“复制”一个函数意味着什么。有些人会通过 toString() 来序列
化一个函数的源代码

对于 JSON 安全（也就是说可以被序列化为一个 JSON 字符串并且可以根据这个字符串解
析出一个结构和值完全一样的对象）的对象来说，有一种巧妙的复制方法：
```javascript
var newObj = JSON.parse( JSON.stringify( someObj ) );
```
这种方法需要保证对象是 JSON 安全的，所以只适用于部分情况。

浅复制非常易懂且问题少得多
ES6
```javascript
var newObj = Object.assign( {}, myObject );
newObj.a; // 2
newObj.b === anotherObject; // true
newObj.c === anotherArray; // true
newObj.d === anotherFunction; // true
```

#### 3.5 属性描述符
从 ES5 开始，所有的属性都具备了属性描述符。
```javascript
var myObject = {
a:2
};
Object.getOwnPropertyDescriptor( myObject, "a" );
// {
// value: 2,
// writable: true,
// enumerable: true,
// configurable: true
// }
```
__Writeable__
writable 决定是否可以修改属性的值。
严格模式抛出错误，非严格模式静默失败
__Configurable__
只要属性是可配置的，就可以使用 defineProperty(..) 方法来修改属性描述符,把 configurable 修改成false 是单向操作，无法撤销！，即便属性是 configurable:false ， 我们还是可以把 writable 的状态由 true 改为 false ，但是无法由 false 改为 true 。

除了无法修改， configurable:false 还会禁止删除这个属性

__Enumerable__
可枚举
#### 3.6 不变性
所有的方法创建的都是浅不变形，也就是说，它们只会影响目标对象和
它的直接属性。如果目标对象引用了其他对象（数组、对象、函数，等），其他对象的内
容不受影响，仍然是可变的：
```javascript
myImmutableObject.foo; // [1,2,3]
myImmutableObject.foo.push( 4 );
myImmutableObject.foo; // [1,2,3,4]
```
假设代码中的 myImmutableObject 已经被创建而且是不可变的，但是为了保护它的内容
myImmutableObject.foo ，你还需要使用下面的方法让 foo 也不可变。
_注：在 JavaScript 程序中很少需要深不可变性。有些特殊情况可能需要这样做，但是根据通用的设计模式，如果你发现需要密封或者冻结所有的对象，那你或许应当退一步，重新思考一下程序的设计，让它能更好地应对对象值的改变。_

__对象常量__

结合 writable:false 和 configurable:false 就可以创建一个真正的常量属性（不可修改、重定义或者删除）：
```javascript
var myObject = {};
Object.defineProperty( myObject, "FAVORITE_NUMBER", {
value: 42,
writable: false,
configurable: false
} );
```
__禁止扩展__

如果你想禁止一个对象添加新属性并且保留已有属性，可以使用 Object.prevent
Extensions(..) ：
```javascript
var myObject = {
a:2
};
Object.preventExtensions( myObject );
myObject.b = 3;
myObject.b; // undefined
```

__密封__
Object.seal(..) 会创建一个“密封”的对象，这个方法实际上会在一个现有对象上调用
Object.preventExtensions(..) 并把所有现有属性标记为 configurable:false 。不能配置或者删除现有的值，但是可以修改属性的值

__冻结__
ject.freeze(..) 会创建一个冻结对象，这个方法实际上会在一个现有对象上调用Object.seal(..) 并把所有“数据访问”属性标记为 writable:false ，这样就无法修改它们的值,这个方法是你可以应用在对象上的级别最高的不可变性，它会禁止对于对象本身及其任意直接属性的修改（不过就像我们之前说过的，这个对象引用的其他对象是不受影响的）。

#### 3.7 [[get]]

```javascript
var myObject = {
a: 2
};
myObject.a; // 2
```
在语言规范中， myObject.a 在 myObject 上实际上是实现了 [[Get]] 操作（有点像函数调用： \[[Get]]() ）,首先会找相同名称的属性，找不到就会遍历原型，原型上没有就返回`undefined`。

这种方法和访问变量时是不一样的。如果你引用了一个当前词法作用域中不存在的变量，并不会像对象属性一样返回 undefined ，而是会抛出一个 ReferenceError 异常。

```javascript
var myObject = {
a: undefined
};
myObject.a; // undefined
myObject.b; // undefined
```
根据返回值无法判断出到底变量的值为 undefined 还是变量不存在

#### 3.8 [[put]]

[[Put]] 被触发时，实际的行为取决于许多因素，包括对象中是否已经存在这个属性（这
是最重要的因素）。
如果已经存在这个属性， [[Put]] 算法大致会检查下面这些内容。

1. 属性是否是访问描述符？如果是并且存在 setter 就调用 setter。
2. 属性的数据描述符中 writable 是否是 false ？如果是，在非严格模式下静默失败，在严格模式下抛出 TypeError 异常。
3. 如果都不是，将该值设置为属性的值。

#### 3.9 Getter和Setter
对象默认的 [[Put]] 和 [[Get]] 操作分别可以控制属性值的设置和获取。在语言的未来 / 高级特性中，有可能可以改写整个对象（不仅仅是某个属性）
的默认 [[Get]] 和 [[Put]] 操作。

getter 是一个隐藏函数，会在获取属性值时调用。setter 也是一个隐藏函数，会在设置属性值时调用。

```javascript
var myObject = {
    get a(){
        return 2
    }
}
Object.defineProperty(myObject,'b',{
    // 描述符
    // 给b一个描述符
    get:function () {
        return this.a * 2
    },
    // 确保b会出现在对象的属性列表中
    enumerable:true
})


console.log(myObject.a)
console.log(myObject.b)
```
不管是 __对象文字语法__ 中的 get a() { .. } ，还是 defineProperty(..) 中的 __显式定义__，二者都会在对象中创建一个不包含值的属性，对于这个属性的访问会自动调用一个隐藏函数，__它的返回值会被当作属性访问的返回值__

由于我们只定义了 a 的 getter，所以对 a 的值进行设置时 set 操作会忽略赋值操作，不会抛出错误。

_注：和直接定义一个普通属性不同的是，这里只创建了`myObject`中a和b的get，实际中是不存在a属性和b属性的。_

setter 会覆盖单个属性默认的[[Put]] （也被称为赋值）操作。通常来说 getter 和 setter 是成对出现的（只定义一个的话通常会产生意料之外的行为）：
```javascript
var myObject = {
// 给 a 定义一个 getter
get a() {
return this._a_;
},
// 给 a 定义一个 setter
set a(val) {
this._a_ = val * 2;
}
};
myObject.a = 2;
myObject.a; // 4
```
实际上我们把赋值（ [[Put]] ）操作中的值 2 存储到了另一个变量_a_ 中。名称 _a_ 只是一种惯例，没有任何特殊的行为——和其他普通属性一样。

#### 3.10 存在性

如何区分对象的属性不存在还是属性值是undefined？
```javascript
var myObject = {
a:2
};
("a" in myObject); // true
("b" in myObject); // false
myObject.hasOwnProperty( "a" ); // true
myObject.hasOwnProperty( "b" ); // false
```

in 操作符会检查属性是否在对象及其 [[Prototype]] 原型链中（参见第 5 章）。相比之下，hasOwnProperty(..) 只会检查属性是否在 myObject 对象中，不会检查 [[Prototype]] 链

通过 Object.create(null) 来创建的对象原型上没有hasOwnProperty,这时可以用
```javascript
 Object.prototype.hasOwnProperty.call(myObject,"a")
```

看起来 in 操作符可以检查容器内是否有某个值，但是它实际上检查的是某个属性名是否存在。对于数组来说这个区别非常重要， 4 in [2, 4, 6] 的结果并不是你期待的 True ，因为 [2, 4, 6] 这个数组中包含的属性名是 0、1、2，没有 4。

__枚举__

enumerable 为false 不会出现在for...in中，
_注：在数组上应用 for..in 循环有时会产生出人意料的结果，因为这种枚举不仅会包含所有数值索引，还会包含所有可枚举属性。最好只在对象上应用for..in 循环，如果要遍历数组就使用传统的 for 循环来遍历数值索引。_

区分属性是否可枚举
```javascript
var myObject = { };
Object.defineProperty(
myObject,
"a",
// 让 a 像普通属性一样可以枚举
{ enumerable: true, value: 2 }
);
Object.defineProperty(
myObject,
"b",
// 让 b 不可枚举
{ enumerable: false, value: 3 }
);
myObject.propertyIsEnumerable( "a" ); // true
myObject.propertyIsEnumerable( "b" ); // false
Object.keys( myObject ); // ["a"]
Object.getOwnPropertyNames( myObject ); // ["a", "b"]
```

propertyIsEnumerable(..) 会检查给定的属性名是否直接存在于对象中（而不是在原型链上）并且满足 enumerable:true 。

Object.keys(..) 会返回一个数组，包含所有可枚举属性， 

Object.getOwnPropertyNames(..)会返回一个数组，包含所有属性，无论它们是否可枚举。

（目前）并没有内置的方法可以获取 in 操作符使用的属性列表（对象本身的属性以及 [[Prototype]] 链中的所有属性，参见第 5 章）。不过你可以递归遍历某个对象的整条[[Prototype]] 链并保存每一层中使用 Object.keys(..) 得到的属性列表——只包含可枚举属性。

### 4. 遍历

for..in 循环可以用来遍历对象的可枚举属性列表（包括 [[Prototype]] 链）。但是如何遍历属性的值呢？

对于数值索引的数组来说，可以使用标准的 for 循环来遍历值：

这实际上并不是在遍历值，而是遍历下标来指向值，如 myArray[i] 
```javascript
var myArray = [1, 2, 3];
for (var i = 0; i < myArray.length; i++) {
console.log( myArray[i] );
}
// 1 2 3
```
ES5 中增加了一些数组的辅助迭代器

forEach(..) 会遍历数组中的所有值并忽略回调函数的返回值

every(..) 会一直运行直到回调函数返回 false （或者“假”值）

some(..) 会一直运行直到回调函数返回 true （或者“真”值）。

使用 for..in 遍历对象是无法直接获取属性值的，因为它实际上遍历的是对象中的所有可枚举属性，你需要手动获取属性值。

_注意:遍历数组下标时采用的是数字顺序（ for 循环或者其他迭代器），但是遍历对象属性时的顺序是不确定的，在不同的 JavaScript 引擎中可能不一样。因此，在不同的环境中需要保证一致性时，一定不要相信任何观察到的顺序，它们是不可靠的。_

ES6 增加了一种用来遍历数组的 for..of 循环语法（如果对象本身定义了迭代器的话也可以遍历对象）

```javascript
var myArray = [ 1, 2, 3 ];
for (var v of myArray) {
console.log( v );
}
// 1
// 2
// 3
```

数组有内置的 @@iterator ，因此 for..of 可以直接应用在数组上。我们使用内置的 @@iterator 来手动遍历数组，看看它是怎么工作的：
```javascript
var myArray = [ 1, 2, 3 ];
var it = myArray[Symbol.iterator]();
it.next(); // { value:1, done:false }
it.next(); // { value:2, done:false }
it.next(); // { value:3, done:false }
it.next(); // { done:true }。 done 是一个布尔值，表示是否还有可以遍历的值。
```

_注：默认的 Iterator 接口部署在数据结构的Symbol.iterator属性，或者说，一个数据结构只要具有Symbol.iterator属性，就可以认为是“可遍历的”（iterable），Symbol.iterator属性本身是一个函数，就是当前数据结构默认的遍历器生成函数。执行这个函数，就会返回一个迭代器。调用迭代器的 next() 方法会返回形式为 { value: .. , done: .. } 的值

普通的对象没有内置的@@iterator,但是可以自己写一个
```javascript
var myObject = {
    a: 2,
    b: 3
};
Object.defineProperty( myObject, Symbol.iterator, {
    enumerable: false,
    writable: false,
    configurable: true,
    value: function() {
        var o = this;
        var idx = 0;
        var ks = Object.keys( o );
        return {
            next: function() {
                return {
                    // 这里是一个闭包，所以每次++ 都能在对象o的基础上
                    value: o[ks[idx++]],
                    done: (idx > ks.length)
                };
            }
        };
    }
} );
// 手动遍历 myObject
var it = myObject[Symbol.iterator]();
it.next(); // { value:2, done:false }
it.next(); // { value:3, done:false }
it.next(); // { value:undefined, done:true }
// 用 for..of 遍历 myObject
for (var v of myObject) {
console.log( v );
}
// 2
// 3
```

###5. 小结
对象是 6 个（或者是 7 个，取决于你的观点）基础类型之一。对象有包括 function 在内的子类型，不同子类型具有不同的行为，比如内部标签 [object Array] 表示这是对象的子类型数组

对象就是键 / 值对的集合。可以通过 .propName 或者 ["propName"]语法来获取属性值。访问属性时，引擎实际上会调用内部的默认 [[Get]] 操作（在设置属性值时是 [[Put]] ），[[Get]] 操作会检查对象本身是否包含这个属性，如果没找到的话还会查找 [[Prototype]]链

属性的特性可以通过属性描述符来控制，比如 writable 和 configurable。此外，可以使用Object.preventExtensions(..) 、 Object.seal(..) 和 Object.freeze(..) 来设置对象（及其属性）的不可变性级别。

属性不一定包含值——它们可能是具备 getter/setter 的“访问描述符”。此外，属性可以是可枚举或者不可枚举的，这决定了它们是否会出现在 for..in 循环中。

你可以使用 ES6 的 for..of 语法来遍历数据结构（数组、对象，等等）中的值， for..of会寻找内置或者自定义的 @@iterator 对象并调用它的 next() 方法来遍历数据值。

----