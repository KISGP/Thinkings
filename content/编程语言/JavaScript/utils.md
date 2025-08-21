---
title: 常用工具函数
tags:
  - JS
---

# transformBytes

```ts
/**
 * @description 根据字节大小转换为相应的单位
 * @param bytes 字节大小
 * @returns 转换后的字符串
 * @example transformBytes(1024) => "1 KB" 
 * @example transformBytes(1024 * 1024) => "1 MB"
 * @example transformBytes(1024 * 1024 * 1024) => "1 GB"
 * @example transformBytes(1024 * 1024 * 1024 * 1024) => "1 TB"
 * */
export function transformBytes(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  if (bytes === 0) return "0 Byte"

  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
}
```

# debounce 防抖

```js
/**
 * debounce函数
 * @param {Function} func - 需要防抖的函数
 * @param {number} wait - 等待时间，单位为毫秒
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} - 防抖后的函数
 */
function debounce(func, wait, immediate) {
  let timeout;

  return function() {
    const context = this, args = arguments;

    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }, wait);

    if (immediate && !timeout) func.apply(context, args);
  };
}

// 使用示例
window.addEventListener('resize', debounce(function() {
  console.log('窗口大小改变了！');
}, 250));
```

使用 ts 代码时则需要显示声明 this 和 args

```ts
/**
 * debounce函数
 * @param {Function} func - 需要防抖的函数
 * @param {number} wait - 等待时间，单位为毫秒
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} - 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    const context = this

    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }, wait)

    if (immediate && !timeout) func.apply(context, args)
  }
}
```

> [!tip]
>
> - immediate 为 false：防抖函数在等待时间结束后执行，重复调用会重置等待时间。
> - immediate 为 true：防抖函数在初次调用时立即执行，重复调用会重置等待时间，但不会在等待时间结束后再次执行。

# throttle 节流

```ts
function throttle<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null;
  let lastExecution = 0;

  const throttledFunction = (...args: Parameters<T>): void => {
    const now = Date.now();

    if (lastExecution && now < lastExecution + wait) {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        lastExecution = now;
        func(...args);
      }, wait - (now - lastExecution));
    } else {
      lastExecution = now;
      func(...args);
    }
  };

  return throttledFunction as T;
}

// 示例使用:
const log = () => console.log('Function executed');
const throttledLog = throttle(log, 2000);

throttledLog(); // 立即执行
throttledLog(); // 不会执行，因为在2秒内重复调用
setTimeout(throttledLog, 2500); // 2.5秒后执行，因为超过了节流时间
```



