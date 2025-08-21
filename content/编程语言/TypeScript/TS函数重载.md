---
title: TS 笔记
tags:
  - TS
---

# TS实现函数重载

## 什么是函数重载

函数重载是指：**同一个函数名，可以有多个不同的参数类型和返回值类型声明**。在 TypeScript 中，只有最后一个实现（带函数体），前面的都是“重载签名”，用于类型检查和智能提示。

## 背景

函数 `generateFinderResult` 用于返回寻找结果

```ts
export function generateFinderResult(
  success: boolean,
  msg: string,
  data: string | null,
): FinderResult {
  return {
    success,
    msg,
    data,
  };
}
```

现在我有一个新的需求：当 `success` 为 `true` 时，`data` 一定是 `string`，`success` 为 `false` 时，`data` 一定是 `null`。

## 实现1

```ts
export function generateFinderResult(
  success: false,
  msg: string,
  data: null,
): FinderFailureResult;

export function generateFinderResult(
  success: true,
  msg: string,
  data: string,
): FinderSuccessResult;

export function generateFinderResult(
  success: boolean,
  msg: string,
  data: string | null,
): FinderResult {
  if (success) {
    return { success, msg, data: data as string } as FinderSuccessResult;
  } else {
    return { success, msg, data: null } as FinderFailureResult;
  }
}
```

修改后新的问题出现了

```ts
generateFinderResult(true, "test", null); // 编译器不警告
generateFinderResult(false, "test", "null");// 编译器警告
```

原因：

- **前两个是重载签名**，只做类型检查和提示，不会生成 JS 代码。
- **最后一个是实现签名**，有函数体，参数类型是 [success: boolean, msg: string, data: string | null](vscode-file://vscode-app/c:/Program Files/Microsoft VS Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)，它必须兼容所有重载签名。

## 编译器的重载匹配流程

当调用 `generateFinderResult(true, "test", null)` 时，TypeScript 会：

1. **尝试匹配重载签名**
   - `success: true, msg: string, data: string` ❌ 不匹配（data 是 null）
   - `success: false, msg: string, data: null` ❌ 不匹配（success 是 true）
2. **匹配不到重载签名后，退回到实现签名**
   - 实现签名是 `success: boolean, msg: string, data: string | null`
   - 参数 `true, "test", null` 完全兼容这个类型

所以 `generateFinderResult(true, "test", null)` 不会报错！

## 实现2



## 其它

```ts
function message(options: object): void;
function message(text: string, onclose?: Function): void;
function message(text: string, mode: string, duration?: number): void;
function message(text: string, duration?: number, onClose?: Function): void;

function message(param1: string | Object, param2?: Function | string | number, param3?: Function | string | number): void {
  if (typeof param1 === 'string') {
  } else if (typeof param1 === 'object') {
  }
}
```

在对象里面实现承载

```ts
interface ShowMessage {
  (options: object): void;
  (text: string, onclose?: Function): void;
  (text: string, mode: string, duration?: number): void;
  (text: string, duration?: number, onClose?: Function): void;
}
interface Utils {
  showMessage: ShowMessage;
}

const utils: Utils = {
  showMessage(param1: string | Object, param2?: Function | string | number, param3?: Function | string | number) {}
};
```

