---
title: Express实现用户认证
tags:
  - Express
  - JS
---

# Session 认证

## 认证过程

1. **客户端初次请求**：服务器生成一个唯一的会话 ID。会话 ID 被存储在服务端的会话存储中，同时通过 HTTP 响应发送到客户端，通常保存在 Cookie 中。
2. **客户端后续请求**：客户端在每次请求中都会通过 Cookie 携带会话 ID。服务器从请求中提取会话 ID，根据该 ID 从会话存储中加载会话数据。

## 在 Express 中使用

安装相关依赖：[express-session](https://www.npmjs.com/package/express-session)

```bash
npm i express-session
```

完整代码可以查看[官方示例](https://github.com/expressjs/session?tab=readme-ov-file#examples)

```js
var session = require('express-session')

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.post('/login', express.urlencoded({ extended: false }), function (req, res) {
  req.session.regenerate(function (err) {
    if (err) next(err)

    req.session.user = req.body.user

    req.session.save(function (err) {
      if (err) return next(err)
      res.redirect('/')
    })
  })
})

app.get('/logout', function (req, res, next) {
  req.session.user = null
  req.session.save(function (err) {
    if (err) next(err)
    
    req.session.regenerate(function (err) {
      if (err) next(err)
      res.redirect('/')
    })
  })
})
```

## Express-session 的工作流程

1. **初次请求：识别用户并生成会话**。当用户第一次访问服务器时，`express-session` 会检测请求是否携带一个会话 ID（通常在 Cookie 中）。如果没有，说明这是一个新的会话。然后中间件生成一个新的会话对象，并为其分配一个唯一的会话 ID。

   > 会话 ID 和关联的会话数据会存储在服务器的会话存储（例如内存、Redis、数据库等）中。
   >
   > 会话 ID 被发送给客户端，通常通过 `Set-Cookie` 响应头，存储在浏览器的 Cookie 中。

2. **后续请求：通过会话 ID 识别用户**。在后续请求中，浏览器会自动将存储的会话 ID 通过 Cookie 发送给服务器。`express-session` 从请求的 Cookie 中提取会话 ID，并在服务器的会话存储中查找对应的会话数据。找到会话数据后，将其加载到 `req.session`，使其在当前请求中可以被修改或读取。

3. **会话修改和保存**：可以通过 `req.session` 修改会话数据，例如 `req.session.user = 'JohnDoe'`。在请求结束时，`express-session` 会自动保存会话数据到存储中，或者通过显式调用 `req.session.save()` 手动保存。

# JWT 认证

JWT(JSON Web Token)是一种开放标准(RFC 7519)，常用于实现身份认证。

> 除了使用 JWT 认证还可以使用 Session 认证。但 Session 认证使用到了 Cookie 而 Cookie 默认不支持跨域访问，因此需要做很多额外的配置，才能实现跨域 Session 认证。

## JWT 生成

JWT 由三部分组成，分别是

- Header（头部）：Header 通常包含两部分信息，即令牌的类型（通常是 JWT）和所使用的签名算法。
- Payload（载荷）：Payload 包含了实际的数据。
- Signature（签名）：Signature 是通过将编码后的 Header 和 Payload 用点（.）连接起来，然后使用指定的签名算法（如 HS256）和密钥进行签名生成的。用于验证 JWT 的完整性和真实性，确保 JWT 在传输过程中未被篡改。

这三部分之间用点（.）分隔，形成一个字符串，格式为 `Header.Payload.Signature`。

## JWT 验证

1. 解析 JWT：服务器接收到 JWT 后，首先将其解析为 Header、Payload 和 Signature 三部分。
2. 验证 Signature：使用相同的签名算法和密钥，对 Header 和 Payload 重新生成 Signature，并与 JWT 中的 Signature 进行对比。如果一致，说明 JWT 未被篡改。
3. 验证 Payload：检查 Payload 中的声明，如过期时间（`exp`）等，确保 JWT 仍然有效。
4. 提取用户信息：从 Payload 中提取用户信息，如用户ID、角色等，用于后续的授权和业务逻辑处理。

## 使用过程

1. **用户认证**：用户通过用户名和密码向服务器发送登录请求。服务器验证用户身份后，生成一个唯一的 Token（令牌）。
2. **Token 返回给客户端**：服务器将生成的 Token 返回给客户端。
3. **客户端存储 Token**：客户端将 Token 存储在 `localStorage` 或 `sessionStorage` 等地方。
4. **后续请求携带 Token**：客户端在每次请求时，将 Token 添加到请求头（如 `Authorization: Bearer <token>`）或请求体中。
5. **服务器验证 Token**：服务器在每次请求中解析并验证 Token，确保请求合法。如果 Token 有效，服务器允许访问受保护的资源；否则拒绝请求。

## 在 Express 中使用 JWT

安装相关依赖：[express-jwt](https://github.com/auth0/express-jwt) 和 [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)

```bash
npm install express-jwt jsonwebtoken
```

> express-jwt 内部引用了 jsonwebtoken，对其封装使用。通常 jsonwebtoken 是用来生成 token 给客户端的，而 express-jwt 是用来验证 token 的。

### 生成 Token

```ts
import JWToken from 'jsonwebtoken';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  // 生成 token
  const token =
        "Bearer " +
        JWToken.sign({ uuid: user.uuid, createTime: new Date() }, config.jwt_secret, {
          expiresIn: "1d"
        })

  // 返回 token 给客户端
  res.status(200).json({
    data: { token }
  })
};
```

### 解析 Token

```ts
import { expressjwt as jwt } from "express-jwt"

// 注册中间件
app.use(
  jwt({ 
    secret: config.jwt_secret, 
    algorithms: ["HS256"] 
  }).unless({ 
    path: ["/auth/login", "/auth/register"] 
  })
)
```

使用 Token 中的数据

```ts
import { Request as JWTRequest } from "express-jwt"

export const upload = async (req: JWTRequest, res: Response, next: NextFunction) => {
	// 必需要在注册中间件后才能使用 req.auth
  console.log(req.auth)
}
```

