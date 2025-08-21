---
title: JS笔记
tags:
  - JS
---
# JS 修改原数组

```js
const list = [1,2,3,4,5];

list.forEach((item, index, self)=>{
  self[index]++;
});

console.log(list);// 2,3,4,5,6
```



# call、apply、bind

call 的参数是（this，参数1，参数2，....）,立即执行函数

```js
function f(name) {
	console.log(`name is ${name} , this.name is ${this.name}.`);
}

f.call({ name: 'Alice' }, 'Bob'); // name is Bob , this.name is Alice 
```

apply 的参数是（this，[参数1，参数2，...]）,立即执行函数

```js
function f(name) {
	console.log(`name is ${name} , this.name is ${this.name}.`);
}

f.apply({ name: 'Alice' }, ['Bob']);  // name is Bob , this.name is Alice 
```

bind 的参数是（this，参数1，参数2，...）,返回一个函数

```js
function f(name) {
	console.log(`name is ${name} , this.name is ${this.name}.`);
}

const f2 = f.bind({ name: 'Alice' }, 'Bob');
f2(); // name is Bob , this.name is Alice 
```



# ES6

- **ES5**：2009年发布，是早期广泛使用的JavaScript标准（如 `var`、函数作用域、回调函数）。
- **ES6**：2015年发布，带来了现代语言特性（如 `let/const`、箭头函数、类、模块化等），是JavaScript现代化的里程碑。

---

1. **块级作用域变量**：`let` 和 `const` 替代 `var`，解决变量提升和重复声明问题。

2. **箭头函数（Arrow Functions）**：简化函数语法，自动绑定外层 `this`。

3. **模板字符串（Template Literals）**：支持多行字符串和变量插值。

4. **解构赋值（Destructuring）**：快速提取对象或数组的值。

   ```js
   // 对象解构
   const { name, age } = user;
   // 数组解构
   const [first, second] = [1, 2];
   ```

5. **默认参数（Default Parameters）**：函数参数默认值。

   ```js
   function greet(name = "Guest") {
     return `Hello, ${name}!`;
   }
   ```

6. **类（Class）**：语法糖，简化面向对象编程。

   ```js
   class Person {
     constructor(name) { this.name = name; }
     sayHi() { console.log(`Hi, I'm ${this.name}`); }
   }
   ```

7. **模块化（Modules）**：`import/export` 替代全局变量污染。

   ```js
   // 导出
   export const apiUrl = "https://api.example.com";
   // 导入
   import { apiUrl } from './config';
   ```

8. **Promise 和异步编程**：解决回调地狱，支持链式调用（后升级为 `async/await`）。

   ```js
   fetch(url)
     .then(response => response.json())
     .catch(error => console.error(error));
   ```

9. **展开与剩余运算符（Spread/Rest）**：简化数组/对象操作和参数传递。

   ```js
   // 展开数组（React中常见于传递props）
   const parts = [1, 2];
   const arr = [...parts, 3]; // [1, 2, 3]
   // 剩余参数
   function sum(...nums) { /* ... */ }
   ```



# fetch 添加定时功能

```js
function createFetchWithTimeout(fetch, timeout = 5000) {
  return function (url, options) {
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      
      fetch(url, {
        ...options,
        signal: controller.signal
      }).then(resolve, reject);
      
      setTimeout(() => {
        reject(new Error('fetch timeout'));
        // 取消请求
        controller.abort();
      }, timeout);
    });
  };
}

// const request = createFetchWithTimeout(fetch, 5000);

// const request = createFetchWithTimeout(fetch, 10000);
```

