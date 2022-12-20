# nestjs

## jwt

`token` 分为了头部 `Header` , 载荷 `Payload` , 签名 `Signature` 三个部分

* `Header` 主要声明使用的算法

  ```json
  {
    "alg": "HS256",
    "typ": "JWT" 
  } 
  ```

* `Payload` 存放实际内容

  ```json
  {
    "uid": "1234567890",
    "name": "John Doe",
    "iat": 1516239022
  }
  ```

* `Signature` 对前两者进行签名

### 优点

1. 可防护 CSRF 攻击

2. 一处生成, 多处使用, 解决单点登录问题

3. 服务端无需保存会话信息

### 缺点

1. `payload` 不能存放敏感信息

2. 密钥要保护好, 一旦泄露后果不堪设想

3. 最好使用 `https` 协议