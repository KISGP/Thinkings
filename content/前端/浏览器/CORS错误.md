---
title: CORS错误
tags:
  - 浏览器
---
# 同源策略

同源策略([Same-Origin Policy, SOP](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy))是浏览器的一种基本安全策略，旨在防止不同来源的网页之间相互访问数据。它限制了来自一个源的网页脚本访问或修改另一个源的内容。

在浏览器中，同源指的是协议（如HTTP、HTTPS）、域名（如`example.com`）和端口（如`80`、`443`）都必须完全相同。

同源策略只会作用于浏览器和服务器之间，而不限制服务器和服务器的通信。

# 跨域资源共享

可以使用CORS(Cross-origin resource sharing)来允许跨源访问。CORS 是一种浏览器安全机制，它允许或限制不同来源（域、协议或端口）之间的资源共享。默认情况下，浏览器出于安全考虑会阻止不同来源之间的请求，但 CORS 允许服务器明确声明哪些来源可以访问其资源。

这个安全机制主要是用来解决跨站请求伪造(Cross-Site Request Forgery, CSRF)和数据窃取(Data Theft)等安全问题。

# CORS错误

```
Access to fetch at 'http://localhost:4399/login' from origin 'http://localhost:5173' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```



# CORS错误解决

## 一 使用代理工具

https://github.com/Rob--W/cors-anywhere/

## 二 使用 Express 创建代理服务器

```js
const express = require('express');

const app = express();

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '');
	next();
});

app.get('/test', async (req, res) => {
	const data = await (await fetch('http://emaxple.com/test')).json();
	res.send(data);
});

app.listen(3000, () => console.log(`listening on ${PORT}`));
```

## 三 设置允许跨域访问

本地开发时使用。例如在 Express 中直接使用 [cors](https://github.com/expressjs/cors) 中间件。
