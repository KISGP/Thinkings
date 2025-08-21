---
title: Promise和Async
tags:
  - JS
---

# 什么是 Promise 

Promise 的概念在 JavaScript 中正式被引入是在 ES6（ECMAScript 2015） 标准中。

Promise 是 JavaScript 中用于处理异步操作的核心工具之一。它提供了一种更加优雅和可控的方式来管理异步任务，避免了传统回调函数的复杂性（即回调地狱）和可读性问题。通常用于处理网络请求、数据库操作、文件操作等。

# 回调地狱(Callback Hell)

在 Promise 出现之前，JavaScript 的异步操作主要依赖回调函数。回调函数虽然简单，但在复杂的异步场景中会导致代码难以维护和阅读，这种现象被称为“回调地狱”。

```js
function do1Async(callback) {
  setTimeout(() => {
    callback('第一步完成');
  }, 1000);
}

function do2Async(data, callback) {
  setTimeout(() => {
    callback(data + '，第二步完成');
  }, 1000);
}

function do3Async(data, callback) {
  setTimeout(() => {
    callback(data + '，第三步完成');
  }, 1000);
}

do1Async(result1 => {
  console.log(result1);
  do2Async(result1, result2 => {
    console.log(result2);
    do3Async(result2, result3 => {
      console.log(result3);
    });
  });
});
```

使用 Promise 可以简化代码。

```js
function do1Async() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('第一步完成');
    }, 1000);
  });
}

function do2Async(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data + '，第二步完成');
    }, 1000);
  });
}

function do3Async(data) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data + '，第三步完成');
    }, 1000);
  });
}

do1Async()
  .then(result1 => {
  console.log(result1);
  return do2Async(result1);
})
  .then(result2 => {
  console.log(result2);
  return do3Async(result2);
})
  .then(result3 => {
  console.log(result3);
})
  .catch(error => {
  console.error(error); // 统一处理错误
});
```

# 使用  Promise

## Promise 状态

Promise 有三种状态：

- **Pending**（进行中）：初始状态，既不是成功，也不是失败。
- **Fulfilled**（已成功）：操作成功完成，可以获取操作的结果。
- **Rejected**（已失败）：操作失败，可以获取失败的原因。

Promise 的状态只能从 `Pending` 转变为 `Fulfilled` 或 `Rejected`，并且状态一旦改变就不可逆。调用 `resolve` 或 `reject` 会将 Promise 的状态从 `Pending` 转变为 `Fulfilled` 或 `Rejected`，并触发后续的回调函数。

## 构造一个 Promise

在 JavaScript 中，Promise 构造函数接受一个称为 executor 的函数作为参数，当你创建一个新的 Promise 实例时，这个 executor 函数就会自动运行。executor 函数被称为“执行器”，因为它负责执行异步操作。

```js
const myPromise = new Promise((resolve, reject) => {
  // setTimeout(() => resolve("success"), 1000); // 将 Promise 标记为成功，并传递结果值

  // setTimeout(() => reject("error"), 1000); // 将 Promise 标记为失败，并传递错误信息
});
```

executor 函数接受两个参数：

- `resolve`: 一个函数，用来将 `Promise` 标记为成功，并传递结果值。
- `reject`: 一个函数，用来将 `Promise` 标记为失败，并传递错误信息。

这两个函数都是由 JavaScript 自身提供的回调。executor 只能调用一个 `resolve` 或一个 `reject`。

## 获取结果

为了获取 `Promise` 的结果，可以使用 `.then` 方法。

`.then` 方法接受两个回调函数：一个用于处理成功的结果，一个用于处理失败的情况（可选）。该方法通常用于处理 `Promise` 成功的结果。

```js
new Promise((resolve, reject) => {
  resolve('操作成功');
  reject('操作失败');
}).then(
  result => {
    console.log('操作成功，结果是:', result);
  },
  error => {
    console.error('操作失败，错误是:', error);
  }
);
```

如果我们只对成功完成的情况感兴趣，为 `.then` 提供一个函数参数即可。

```js
new Promise((resolve, reject) => {
  resolve('操作成功');
}).then(
  result => {
    console.log('操作成功，结果是:', result);
  }
);
```

Promise 是支持链式调用的。

```js
// 基础示例
new Promise((resolve, reject) => {
  resolve(1);  // 初始值
})
  .then(result => {
  console.log(result);  // 输出: 1
  return result + 1;    // 返回新值
})
  .then(result => {
  console.log(result);  // 输出: 2
  return result + 1;    // 返回新值
})
  .then(result => {
  console.log(result);  // 输出: 3
});
```

## 错误处理

### 错误捕获

通常我们使用 `.catch` 捕获并处理错误。`.catch` 可以捕获以下几种错误：

- 显式抛出的错误（使用 throw）
- Promise 中的 reject
- 运行时错误（如 TypeError、ReferenceError 等）
- Promise 链中任何位置的错误

```js
// 显式抛出的错误
new Promise((resolve, reject) => {
  throw new Error('操作失败');
}).catch(err => {
  console.log(err.message);
});

// promise 中的 reject
new Promise((resolve, reject) => {
  reject(new Error('Promise 被拒绝'));
}).catch(err => {
  console.log(err.message);
});

// 运行时错误
new Promise((resolve, reject) => {
  const foo = undefined;
  foo.bar();
}).catch(err => {
  console.log(err.message); // Cannot read properties of undefined (reading 'bar')
});

// Promise 链中的错误
Promise.resolve()
  .then(() => {
  throw new Error('链式调用中的错误');
})
  .then(() => {
  console.log('这里不会执行');
})
  .catch(error => {
  console.log(error.message);  // 链式调用中的错误
});
```

> [!note]
>
> `throw new Error` 和 `reject` 在功能上是等效的，都会使 Promise 进入 rejected 状态。

还有一种捕获错误方法使用 `.then` ，我们只需传入第二个参数即可。

```js
new Promise((resolve, reject) => {}).then(null, err => {
	console.log(err.message);
});
// 等价于
new Promise((resolve, reject) => {}).catch(err => {
	console.log(err.message);
});
```

### 错误处理

直接在 `.catch` 处理即可。

```js
Promise.resolve()
	.then(() => {
		throw new Error('错误1');
	})
	.catch(error => {
		return '处理完成';
	})
```

可以在 `.catch` 后继续使用 `then`，这样可以实现错误恢复的逻辑。

```js
Promise.resolve()
	.then(() => {
		throw new Error('错误1');
	})
	.catch(error => {
		return '处理完成';
	})
	.then(value => {
		console.log('最终结果:', value);
	});
```



### 错误传递

在 Promise 中错误的传递遵循以下规则：

1. **向下传递**：错误会沿着 Promise 链向下传递，直到遇到第一个 `catch` 处理器。在错误被处理之前的所有 `then` 都会被跳过。
2. **错误恢复**：`catch` 处理器可以返回一个值来恢复正常流程，返回的值会传递给下一个 `then` 处理器。
3. **错误再抛出**：`catch` 处理器也可以抛出新的错误，新错误会继续向下传递直到遇到下一个 `catch`。
4. **平行处理**：同一个 Promise 可以有多个并行的处理链，每个链都会独立处理错误。
5. **finally 处理**：`finally` 处理器总是会执行，不管是否发生错误，`finally` 不能改变 Promise 链的值或错误状态。

#### 基本的错误传递

```js
Promise.resolve()
	.then(() => {
		throw new Error('错误1'); // 抛出错误
		console.log('A'); // 不会执行
	})
	.then(() => {
		console.log('B'); // 不会执行
	})
	.catch(error => {
		console.log('捕获错误:', error.message); // 输出: 捕获错误: 错误1
		return '恢复正常'; // 返回正常值
	})
	.then(value => {
		console.log('继续执行:', value); // 输出: 继续执行: 恢复正常
	});
```

#### 多个 catch

```js
Promise.resolve()
	.then(() => {
		throw new Error('错误1');
	})
	.catch(error => {
		console.log('第一个 catch:', error.message); // 输出: 第一个 catch: 错误1
		throw new Error('错误2'); // 在 catch 中抛出新错误
	})
	.then(() => {
		console.log('这里不会执行');
	})
	.catch(error => {
		console.log('第二个 catch:', error.message); // 输出: 第二个 catch: 错误2
		return '处理完成';
	})
	.then(value => {
		console.log('最终结果:', value); // 输出: 最终结果: 处理完成
	});
```

#### 复杂的错误处理链

```js
function step1() {
	return new Promise((resolve, reject) => {
		throw new Error('步骤1错误');
	});
}

function step2() {
	return new Promise((resolve, reject) => {
		resolve('步骤2成功');
	});
}

function step3() {
	return new Promise((resolve, reject) => {
		reject(new Error('步骤3错误'));
	});
}

step1()
	.then(() => {
		console.log('步骤1成功'); // 不会执行
		return step2();
	})
	.catch(error => {
		console.log('捕获步骤1错误:', error.message); // 输出: 捕获步骤1错误: 步骤1错误
		return step2(); // 错误处理后继续执行步骤2
	})
	.then(() => {
		console.log('步骤2完成'); // 会执行
		return step3();
	})
	.then(() => {
		console.log('步骤3成功'); // 不会执行
	})
	.catch(error => {
		console.log('捕获步骤3错误:', error.message); // 输出: 捕获步骤3错误: 步骤3错误
	})
	.finally(() => {
		console.log('处理完成'); // 总是会执行
	});
```

### then(null, errorHandler) 和 catch(errorHandler) 的区别

前面提到了捕获错误时可以通过 `.then(null, errorHandler)`，实际上，`catch(errorHandler)` 是 `then(null, errorHandler)` 的语法糖。

他们的区别是 `then(null, errorHandler)` 只能捕获上一个 Promise 的错误，而 `catch(errorHandler)` 可以捕获链中之前所有未处理的错误。

```js
new Promise((resolve, reject) => {
	resolve('成功');
}).then(
	result => {
		throw new Error('then 中抛出的错误'); // 这个错误不会被捕获
	},
	err => {
		// 这个错误处理器只能捕获上一个 Promise 中的错误，不能捕获当前 then 中抛出的错误
		console.log('错误处理器:', err.message);
	}
);

new Promise((resolve, reject) => {
	resolve('成功');
})
	.then(result => {
		throw new Error('then 中抛出的错误'); // 这个错误会被 catch 捕获
	})
	.catch(err => {
		// catch 可以捕获链中任何地方抛出的错误
		console.log('catch 捕获到错误:', err.message);
	});
```

### throw new Error 和 reject 的区别

基本区别

```js
// 使用 throw new Error
const promiseWithThrow = new Promise((resolve, reject) => {
    throw new Error('使用 throw 抛出错误');
    // 后续代码不会执行
    console.log('这里不会执行');
});

// 使用 reject
const promiseWithReject = new Promise((resolve, reject) => {
    reject(new Error('使用 reject 拒绝'));
    // 后续代码会继续执行
    console.log('这里会执行');
});
```

## 最终处理

在 Promise 结束时执行，无论 Promise 是成功(fulfilled)还是失败(rejected)，Promise 都会执行 `finally `方法。

```js
new Promise((resolve, reject) => {
	// 异步操作
	resolve('成功');
	// 或
	// reject('失败');
})
	.then(result => {
		console.log(result);
	})
	.catch(error => {
		console.log(error);
	})
	.finally(() => {
		console.log('无论成功还是失败，这里都会执行');
	});
```

finally 的特点是：回调函数不接收任何参数、返回的值会被忽略，不会改变 Promise 链的结果、抛出的错误会传播到后续的 catch、会等待内部的 Promise 完成。

## Promise 上的方法

### Promise.all()

Promise.all() 是一个用于处理多个Promise的静态方法，它接收一个Promise数组作为参数，并返回一个新的Promise。这个新Promise会等待所有的Promise都完成（或第一个失败）。

```js
const promise = Promise.all([promise1 , promise2, promise3]);
```

只有 promise123 的状态都变成 fulfilled，promise 的状态才会变成 fulfilled，此时 promise123 的返回值组成一个数组，传递给 promise 的回调函数。

```js
const promise1 = Promise.resolve(1);
const promise2 = Promise.resolve(2);
const promise3 = Promise.resolve(3);

Promise.all([promise1, promise2, promise3]).then(values => {
	console.log(values); // [1, 2, 3]
});
```

只要 promise123 之中有一个被 rejected ，p 的状态就变成 rejected，此时第一个被 reject 的实例的返回值，会传递给 p 的回调函数。

```js
const p1 = new Promise(resolve => setTimeout(resolve, 1000, 'one'));
const p2 = Promise.reject('failed');
const p3 = new Promise(resolve => setTimeout(resolve, 500, 'three'));

Promise.all([p1, p2, p3]).catch(error => {
	// 立即返回 'failed'，不会等待p1和p3完成
	console.log(error);
});
```

一些特殊情况：

1. **传入空数组**

   ```js
   Promise.all([]).then(results => {
   	console.log(results); // []
   	// 立即resolve，返回空数组
   });
   ```

2. **传入非 Promise 值**

   ```js
   Promise.all([
   	Promise.resolve(1),
   	2, // 会被自动转换为Promise
   	Promise.resolve(3)
   ]).then(values => {
   	console.log(values); // [1, 2, 3]
   });
   ```

3. **传入的 Promise 有 catch 方法**

   如果作为参数的 Promise 实例，自己定义了 catch 方法，那么它一旦被 rejected，并不会触发 Promise.all() 的 catch 方法。

   如果在自定义的 catch 方法中又抛出新的错误，且没有再次捕获，这个新错误会传播到 Promise.all() 的 catch 方法。

   ```js
   const p1 = new Promise((resolve, reject) => {
   	reject('error');
   }).catch(err => {
   	console.log('p1 自己的catch：', err);
   	return 'p1 recovered'; // 注意这里返回一个新值
   });
   
   const p2 = Promise.resolve('p2 success');
   
   Promise.all([p1, p2])
   	.then(results => {
   		console.log(results); // ['p1 recovered', 'p2 success']
   	})
   	.catch(err => {
   		console.log(err); // 这里不会执行
   	});
   ```

   ```js
   const p1 = new Promise((resolve, reject) => {
   	reject('error');
   }).catch(err => {
   	console.log('p1 自己的catch：', err);
   	// 注意这里不返回值
   });
   
   const p2 = Promise.resolve('p2 success');
   
   Promise.all([p1, p2])
   	.then(results => {
   		console.log(results); // [undefined, 'p2 success']
   	})
   	.catch(err => {
   		console.log(err); // 这里不会执行
   	});
   ```

### Promise.race()

Promise.race() 是一个静态方法，它接收一个 Promise 数组作为参数，返回一个新的 Promise。这个新 Promise 会采用第一个完成（无论是成功还是失败）的 Promise 的状态和结果。

"race" 意味着竞赛，哪个 Promise 先完成就返回哪个结果。

```js
const promise1 = new Promise(resolve => setTimeout(() => resolve('一号'), 500));
const promise2 = new Promise(resolve => setTimeout(() => resolve('二号'), 100));
const promise3 = new Promise(resolve => setTimeout(() => resolve('三号'), 300));

Promise.race([promise1, promise2, promise3]).then(result => {
	console.log(result); // 输出: '二号'，因为promise2最快完成
});
```

```js
// 处理成功和失败的情况
const success = new Promise(resolve => setTimeout(() => resolve('成功'), 200));
const fail = new Promise(reject => setTimeout(() => reject('失败'), 100));

Promise.race([success, fail])
	.then(result => console.log('成功：', result))
	.catch(error => console.log('失败：', error));
```

一些特殊情况：

1. **传入空数组**

   ```js
   Promise.race([])
   	.then(() => console.log('永远不会执行'))
   	.catch(() => console.log('永远不会执行'));
   // Promise会一直处于pending状态
   ```

2. **传入非 Promise 值**

   ```js
   Promise.race([
   	Promise.resolve(1),
   	2, // 会被自动转换为Promise
   	Promise.resolve(3)
   ]).then(value => {
   	console.log(value); // 2，因为非Promise值会立即resolve
   });
   ```

### Promise.allSettled()

Promise.allSettled() 是一个静态方法，它接收一个 Promise 数组作为参数，并返回一个新的 Promise。这个方法会等待所有 Promise 完成（无论是成功还是失败），并返回一个包含每个 Promise 结果的数组。

每个 Promise 的结果对象包含两个属性：

- 成功的情况：`{ status: "fulfilled", value: 结果值 }`
- 失败的情况：`{ status: "rejected", reason: 错误原因 }`

```js
const promises = [Promise.resolve(1), Promise.reject('错误'), Promise.resolve(3)];

Promise.allSettled(promises).then(results => {
	console.log(results);
	// [
	//   { status: "fulfilled", value: 1 },
	//   { status: "rejected", reason: "错误" },
	//   { status: "fulfilled", value: 3 }
	// ]
});
```

### Promise.resolve()

Promise.resolve() 是 Promise 的一个静态方法，它返回一个解析过的（fulfilled）Promise 对象。这个方法可以将现有值转换为 Promise 对象，或者返回一个新的已解决的 Promise。

```js
// 处理数字
const p1 = Promise.resolve(123);
p1.then(value => console.log(value)); // 123

// 处理字符串
const p2 = Promise.resolve('hello');
p2.then(value => console.log(value)); // 'hello'

// 处理null或undefined
const p3 = Promise.resolve(null);
p3.then(value => console.log(value)); // null

// 处理 Promise 对象：promise.resolve将不做任何修改、原封不动地返回这个实例
const originalPromise = new Promise(resolve => setTimeout(() => resolve('original'), 1000));
const resolvedPromise = Promise.resolve(originalPromise);
console.log(resolvedPromise === originalPromise); // true
```

### Promise.reject() 

Promise.reject() 是 Promise 的静态方法，它返回一个被拒绝（rejected）状态的 Promise 对象。与 Promise.resolve() 相反，它用于创建一个立即失败的 Promise。

```js
// 基本用法
const rejectedPromise = Promise.reject('失败原因');
rejectedPromise.catch(error => console.log(error)); // '失败原因'

// 使用Error对象（推荐）
const rejectedWithError = Promise.reject(new Error('发生错误'));
rejectedWithError.catch(error => console.log(error.message)); // '发生错误'
```

# 实现 Promise

```js
class MyPromise {
	// Promise 的三种状态常量
	static PENDING = 'pending';
	static FULFILLED = 'fulfilled';
	static REJECTED = 'rejected';

	constructor(executor) {
		// 初始化状态和值
		this.status = MyPromise.PENDING;
		this.value = undefined;
		this.reason = undefined;
		// 存储回调函数数组
		this.onFulfilledCallbacks = [];
		this.onRejectedCallbacks = [];

		// resolve处理函数
		const resolve = value => {
			if (this.status === MyPromise.PENDING) {
				this.status = MyPromise.FULFILLED;
				this.value = value;
				// 执行所有成功回调
				this.onFulfilledCallbacks.forEach(callback => callback(value));
			}
		};

		// reject处理函数
		const reject = reason => {
			if (this.status === MyPromise.PENDING) {
				this.status = MyPromise.REJECTED;
				this.reason = reason;
				// 执行所有失败回调
				this.onRejectedCallbacks.forEach(callback => callback(reason));
			}
		};

		// 立即执行executor
		try {
			executor(resolve, reject);
		} catch (error) {
			reject(error);
		}
	}

	// then方法实现
	then(onFulfilled, onRejected) {
		// 参数校验，确保是函数
		onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
		onRejected =
			typeof onRejected === 'function'
				? onRejected
				: reason => {
						throw reason;
				  };

		// 返回新的Promise以支持链式调用
		return new MyPromise((resolve, reject) => {
			// 成功状态处理
			if (this.status === MyPromise.FULFILLED) {
				setTimeout(() => {
					try {
						const result = onFulfilled(this.value);
						resolve(result);
					} catch (error) {
						reject(error);
					}
				});
			}

			// 失败状态处理
			if (this.status === MyPromise.REJECTED) {
				setTimeout(() => {
					try {
						const result = onRejected(this.reason);
						resolve(result);
					} catch (error) {
						reject(error);
					}
				});
			}

			// pending状态处理
			if (this.status === MyPromise.PENDING) {
				// 存储成功回调
				this.onFulfilledCallbacks.push(() => {
					setTimeout(() => {
						try {
							const result = onFulfilled(this.value);
							resolve(result);
						} catch (error) {
							reject(error);
						}
					});
				});

				// 存储失败回调
				this.onRejectedCallbacks.push(() => {
					setTimeout(() => {
						try {
							const result = onRejected(this.reason);
							resolve(result);
						} catch (error) {
							reject(error);
						}
					});
				});
			}
		});
	}

	// catch方法实现
	catch(onRejected) {
		return this.then(null, onRejected);
	}

	// finally方法实现
	finally(callback) {
		return this.then(
			// 成功时执行callback并返回原值
			value => {
				callback();
				return value;
			},
			// 失败时执行callback并抛出原因
			reason => {
				callback();
				throw reason;
			}
		);
	}
}

```

#  Promise 带来的问题

当 Promise 代码的调用层数过多时也会造成代码可读性下降。

```js
function fetchUserData() {
	return fetch('/user')
		.then(response => response.json())
		.then(user => {
			return fetch(`/posts/${user.id}`)
				.then(response => response.json())
				.then(posts => {
					return fetch(`/comments/${posts[0].id}`).then(response => response.json());
				});
		})
		.catch(err => {
			console.error(err);
		});
}
```

# async/await

async/await 是 ES2017 (ES8) 引入的语法糖，主要用于解决 Promise 中的回调地狱和代码可读性问题，使异步代码看起来更像同步代码。

例如，将上面的 `fetchUserData `转换成 async 函数后代码可读性更高。

```js
async function fetchUserData() {
	try {
		const userResponse = await fetch('/user');
		const user = await userResponse.json();

		const postsResponse = await fetch(`/posts/${user.id}`);
		const posts = await postsResponse.json();

		const commentsResponse = await fetch(`/comments/${posts[0].id}`);
		const comments = await commentsResponse.json();

		return comments;
	} catch (err) {
		console.log(err);
	}
}
```

`async` 表示这个函数返回一个 promise。

`await` 让 JavaScript 引擎等待直到 promise 完成并返回结果。`await` 实际上会暂停函数的执行，直到 promise 状态变为 settled，然后以 promise 的结果继续执行。这个行为不会耗费任何 CPU 资源，因为 JavaScript 引擎可以同时处理其他任务：执行其他脚本，处理事件等。



# 相关资料

- https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise
- https://zh.javascript.info/promise-basics
- https://zh.javascript.info/async-await