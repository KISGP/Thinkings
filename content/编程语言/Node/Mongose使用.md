---
title: 在 Express 中使用 Mongose
tags:
  - Express
  - MongoDB
---

参考：https://mongoosejs.net/

# 安装 Mongose

```bash
 npm install mongoose
```



# 定义 Model

```ts
// users.model.ts

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface User {
	email: string;
	password: string;
}

interface UserMethods {
	comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = mongoose.Model<User, {}, UserMethods>;

const userSchema = new mongoose.Schema<User, UserModel, UserMethods>({
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	}
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
	return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<User, UserModel>('users', userSchema);
```



> [!tip]
>
> Mongoose 会自动找到名称是 model 名字复数形式的 collection 。因此在创建 model 需要注意对应的 collection 在数据库中是否存在。
>
> 当然 Mongose 提供了[直接指定的方式](https://mongoosejs.com/docs/guide.html#collection)，如：
>
> ```js
> const dataSchema = new Schema({ /* ... */ }, { collection: 'data' });
> ```

# 使用 Model

```ts
const user = await UserModel.findOne({ uuid })
```



# 查找文档



# 更新文档

## Model.updateOne

使用 [Model.updateOne](https://mongoosejs.com/docs/api/model.html#Model.updateOne()) 更新单个文档。

```ts
const res = await UsersModel.updateOne(
  { _id: "6787db40b110f6067f657a62" },
  {
    $set: {
      "capacity.used": 789,
    }
  }
)

const res = await UsersModel.updateOne(
  { _id: "6787db40b110f6067f657a62" },
  {
    capacity: {
      used: 0
    }
  }
)
```

```ts
// 查询返回结果如下
{
  acknowledged: true,
  modifiedCount: 1,
  upsertedId: null,
  upsertedCount: 0,
  matchedCount: 1
}
```

## Model.updateMany

使用 [Model.updateMany](https://mongoosejs.com/docs/api/model.html#Model.updateMany()) 更新多个文档。

```ts
const result = await UsersModel.updateMany(
  { "capacity.used": { $gt: 0 } }, // 查询条件：已用容量大于0的用户
  {
    $set: {
      "capacity.used": 0 // 更新操作：将已用容量设置为0
    }
  }
);
```
查询返回结果和 Model.updateOne 一样。

## Model.findByIdAndUpdate

使用 [Model.findByIdAndUpdate](https://mongoosejs.com/docs/api/model.html#Model.findByIdAndUpdate()) 根据 ID 更新单个文档。

```ts
const result = await UsersModel.findByIdAndUpdate(
  _id,
  {
    $set: {
      "capacity.used": 0 // 更新操作：将已用容量设置为0
    }
  },
  { new: true } // 选项：返回更新后的文档
);
```

返回结果是文档，如果 `new: true` 则是更新后的文档，如果是 `false` 则是未修改前的文档。

## Model.findOneAndUpdate

使用 [Model.findOneAndUpdate](https://mongoosejs.com/docs/api/query.html#Query.prototype.findOneAndUpdate()) 更新单个文档。

该方法与 findByIdAndUpdate 类似，区别在于第一个参数不一样。

```ts
const result = await UsersModel.findOneAndUpdate(
  { email: "user@example.com" }, // 查询条件：根据邮箱查找用户
  {
    $set: {
      "capacity.used": 78 // 更新操作：将已用容量设置为78
    }
  }
);
```

返回结果与 findByIdAndUpdate 一样都是文档。

## Document.save

使用 [Document.save](https://mongoosejs.com/docs/api/document.html#Document.prototype.save()) 更新文档实例。

```ts
// 查找用户文档
const user = await UsersModel.findById("6787db40b110f6067f657a62");
if (user) {
  // 更新字段值
  user.capacity.used = 78; // 更新操作：将已用容量设置为78

  // 保存更改
  const result = await user.save();
  console.log(result);
}
```
## Model.update(弃用)

在 Mongose V7 中[已弃用](https://mongoosejs.com/docs/migrating_to_7.html#removed-update)，使用`updateOne`代替。



# 原子操作

```js
await UsersModel.findOneAndUpdate(
    { uuid: user.uuid },
    {
      $inc: {
        "capacity.used": file.size,
        "capacity.free": -file.size
      }
    }
)
```



# 事务

在MongoDB中，事务是指一组操作，这些操作要么全部成功，要么全部失败。MongoDB支持单文档操作的原子性，这意味着对单个文档的操作是原子的。如果需要对多个文档（在单个或多个集合中）的读写操作实现原子性，MongoDB支持分布式事务。

分布式事务可以跨多个操作、集合、数据库、文档和分片使用。事务与会话相关联，每个会话一次只能有一个打开的事务。如果会话结束且有未完成的事务，该事务将被中止。

