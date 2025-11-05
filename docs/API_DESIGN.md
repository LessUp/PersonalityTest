# API 设计文档

## API 设计原则

### RESTful 设计原则

1. **资源导向**: URL代表资源，使用名词而非动词
2. **HTTP方法**: 使用标准HTTP方法表示操作
3. **无状态**: 每个请求独立，包含所有必要信息
4. **统一接口**: 保持API设计的一致性
5. **分层系统**: 客户端无需了解中间层
6. **可缓存**: 响应应明确是否可缓存

## API 版本管理

### URL版本控制（推荐）

```
https://api.example.com/v1/users
https://api.example.com/v2/users
```

### Header版本控制

```
GET /users
Accept: application/vnd.api+json;version=1
```

## 通用API规范

### 基础URL结构

```
{protocol}://{host}:{port}/api/{version}/{resource}
```

示例：
```
https://api.example.com/api/v1/users
```

### HTTP方法映射

| HTTP方法 | 操作 | 说明 |
|---------|------|------|
| GET | 查询 | 获取资源 |
| POST | 创建 | 创建新资源 |
| PUT | 更新 | 完全更新资源 |
| PATCH | 更新 | 部分更新资源 |
| DELETE | 删除 | 删除资源 |

## 请求规范

### 请求头

```http
Content-Type: application/json
Authorization: Bearer {token}
Accept: application/json
Accept-Language: zh-CN
User-Agent: MyApp/1.0
```

### 请求体格式

```json
{
  "data": {
    "type": "users",
    "attributes": {
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
}
```

### 查询参数

#### 分页

```
GET /api/v1/users?page=1&limit=20
GET /api/v1/users?offset=0&limit=20
```

#### 排序

```
GET /api/v1/users?sort=created_at:desc
GET /api/v1/users?sort=username:asc,created_at:desc
```

#### 过滤

```
GET /api/v1/users?filter[status]=active
GET /api/v1/users?filter[age][gte]=18
GET /api/v1/users?search=john
```

#### 字段选择

```
GET /api/v1/users?fields=id,username,email
```

#### 关联数据

```
GET /api/v1/posts?include=author,comments
```

## 响应规范

### 统一响应格式

#### 成功响应

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  },
  "message": "操作成功",
  "timestamp": "2025-11-05T12:00:00Z"
}
```

#### 列表响应

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "john_doe"
    },
    {
      "id": 2,
      "username": "jane_smith"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "links": {
    "self": "/api/v1/users?page=1",
    "next": "/api/v1/users?page=2",
    "prev": null,
    "first": "/api/v1/users?page=1",
    "last": "/api/v1/users?page=5"
  }
}
```

#### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "验证失败",
    "details": [
      {
        "field": "email",
        "message": "邮箱格式不正确"
      },
      {
        "field": "password",
        "message": "密码长度至少8位"
      }
    ]
  },
  "timestamp": "2025-11-05T12:00:00Z"
}
```

### HTTP状态码

#### 2xx 成功

- `200 OK`: 请求成功
- `201 Created`: 资源创建成功
- `202 Accepted`: 请求已接受，处理中
- `204 No Content`: 请求成功，无返回内容

#### 3xx 重定向

- `301 Moved Permanently`: 资源永久移动
- `302 Found`: 资源临时移动
- `304 Not Modified`: 资源未修改

#### 4xx 客户端错误

- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未认证
- `403 Forbidden`: 无权限
- `404 Not Found`: 资源不存在
- `405 Method Not Allowed`: 方法不允许
- `409 Conflict`: 资源冲突
- `422 Unprocessable Entity`: 请求格式正确但语义错误
- `429 Too Many Requests`: 请求过多

#### 5xx 服务器错误

- `500 Internal Server Error`: 服务器内部错误
- `502 Bad Gateway`: 网关错误
- `503 Service Unavailable`: 服务不可用
- `504 Gateway Timeout`: 网关超时

## 错误代码设计

### 错误代码结构

```
{模块代码}{错误类型}{序号}
```

示例：
```
AUTH001: 认证失败
AUTH002: Token过期
AUTH003: Token无效
USER001: 用户不存在
USER002: 用户已存在
```

### 常见错误代码

```typescript
const ErrorCodes = {
  // 认证相关 (AUTH)
  AUTH_FAILED: 'AUTH001',
  TOKEN_EXPIRED: 'AUTH002',
  TOKEN_INVALID: 'AUTH003',
  PERMISSION_DENIED: 'AUTH004',

  // 用户相关 (USER)
  USER_NOT_FOUND: 'USER001',
  USER_ALREADY_EXISTS: 'USER002',
  INVALID_CREDENTIALS: 'USER003',

  // 验证相关 (VALIDATION)
  VALIDATION_ERROR: 'VAL001',
  INVALID_EMAIL: 'VAL002',
  INVALID_PHONE: 'VAL003',

  // 服务器相关 (SERVER)
  INTERNAL_ERROR: 'SRV001',
  DATABASE_ERROR: 'SRV002',
  EXTERNAL_API_ERROR: 'SRV003',

  // 业务相关 (BUSINESS)
  INSUFFICIENT_BALANCE: 'BIZ001',
  ORDER_CANCELLED: 'BIZ002',
};
```

## API端点设计示例

### 用户管理 API

#### 获取用户列表

```http
GET /api/v1/users
```

**查询参数:**
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 20）
- `sort`: 排序字段（默认: created_at:desc）
- `filter[status]`: 状态筛选

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "status": "active",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

#### 获取单个用户

```http
GET /api/v1/users/:id
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://cdn.example.com/avatar.jpg"
    },
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-02T00:00:00Z"
  }
}
```

#### 创建用户

```http
POST /api/v1/users
```

**请求体:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password",
  "profile": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**响应:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2025-01-01T00:00:00Z"
  },
  "message": "用户创建成功"
}
```

#### 更新用户

```http
PUT /api/v1/users/:id
```

**请求体:**
```json
{
  "email": "newemail@example.com",
  "profile": {
    "firstName": "John",
    "lastName": "Smith"
  }
}
```

**响应:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "newemail@example.com",
    "updated_at": "2025-01-02T00:00:00Z"
  },
  "message": "用户更新成功"
}
```

#### 删除用户

```http
DELETE /api/v1/users/:id
```

**响应:** `204 No Content`

### 认证 API

#### 用户登录

```http
POST /api/v1/auth/login
```

**请求体:**
```json
{
  "email": "john@example.com",
  "password": "secure_password"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    }
  },
  "message": "登录成功"
}
```

#### 刷新Token

```http
POST /api/v1/auth/refresh
```

**请求体:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 用户登出

```http
POST /api/v1/auth/logout
```

**请求头:**
```
Authorization: Bearer {token}
```

**响应:**
```json
{
  "success": true,
  "message": "登出成功"
}
```

### 文件上传 API

#### 上传文件

```http
POST /api/v1/upload
Content-Type: multipart/form-data
```

**请求体:**
```
file: <binary data>
```

**响应:**
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.example.com/files/abc123.jpg",
    "filename": "image.jpg",
    "size": 102400,
    "mime_type": "image/jpeg"
  }
}
```

## 安全性

### 认证

#### JWT Token

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### API Key

```
X-API-Key: your-api-key-here
```

### 限流

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### CORS

```http
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

## 性能优化

### 缓存策略

```http
Cache-Control: public, max-age=3600
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Last-Modified: Wed, 05 Nov 2025 12:00:00 GMT
```

### 压缩

```http
Accept-Encoding: gzip, deflate, br
Content-Encoding: gzip
```

### 条件请求

```http
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
If-Modified-Since: Wed, 05 Nov 2025 12:00:00 GMT
```

## API文档工具

### OpenAPI/Swagger

```yaml
openapi: 3.0.0
info:
  title: API Documentation
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get user list
      responses:
        '200':
          description: Success
```

### Postman Collection

导出Postman Collection用于API测试和文档共享。

## 测试

### 单元测试

```typescript
describe('GET /api/v1/users', () => {
  it('should return user list', async () => {
    const response = await request(app).get('/api/v1/users');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### 集成测试

测试API端点的完整流程，包括数据库交互。

## 最佳实践

1. **版本控制**: 使用语义化版本控制
2. **文档优先**: 先设计API文档，再实现
3. **向后兼容**: 保持API向后兼容
4. **错误处理**: 提供清晰的错误信息
5. **安全性**: 实施认证、授权和输入验证
6. **性能**: 使用缓存和分页
7. **监控**: 记录API使用情况和性能指标
8. **测试**: 保持高测试覆盖率

---

**注意**: 本文档应与实际API实现保持同步，建议使用自动化工具生成API文档。
