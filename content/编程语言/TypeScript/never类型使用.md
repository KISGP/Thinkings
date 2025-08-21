---
title: never类型使用
tags:
  - TS
---

# 使用1

实现一个判断方法类型的函数

```ts
type Method = "GET" | "POST"

function judgeMethod(method: Method) {
  if (method === "GET") {
    method // 此处 ts 会类型收缩为 "GET"
  } else if (method === "POST") {
    method // 此处 ts 会类型收缩为 "POST"
  }
}
```

此时需要添加一个新的方法 "PUT"

```ts
type Method = "GET" | "POST" | "PUT"
```

以前的代码并不会报错，但需要我们手动修改以便可以识别 "PUT" 类型

```ts
function judgeMethod(method: Method) {
  if (method === "GET") {
    method // 此处 ts 会类型收缩为 "GET"
  } else if (method === "POST") {
    method // 此处 ts 会类型收缩为 "POST"
  } else if (method === "PUT") {
    method // 此处 ts 会类型收缩为 "PUT"
  }
}
```

但问题在于，类型更改可能会引起大量代码更改，而前面的代码却没有报错或者警告，导致我们只能手动去找代码修改。

此时我们可以使用 never 类型提醒我们。

```ts
type Method = "GET" | "POST"

function judgeMethod(method: Method) {
  if (method === "GET") {
    method
  } else if (method === "POST") {
    method
  } else {
    const _: never = method // 此处 method 的类型收缩为 never 并赋值给一个 never 类型
  }
}
```

添加一个新的方法 "PUT"，编译器就会告诉我们这里代码需要修改。

```ts
type Method = "GET" | "POST" | "PUT"

function judgeMethod(method: Method) {
  if (method === "GET") {
    method
  } else if (method === "POST") {
    method
  } else {
    const _: never = method // 此处 method 的类型收缩为 "PUT" 并赋值给一个 never 类型, 编译器警告
  }
}
```

# 使用2

假设有一个需求，有一个函数的参数可以是任何类型但不能是 number

```ts
type BandType<T, U> = T extends U ? never : T;

function method<T>(x: BandType<T, number>){}
```

