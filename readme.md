### 小程序上传ci服务v2(koa版)

#### 1.预览接口

说明:接口请求参数，返回参数同v1版本一致

+ 请求路由地址 `/wx/v1/preview`
+ 请求参数
```json
{
  "appid": "小程序appid",
  "codePath": "小程序包路径",
  "desc": "包描述" // 新加字段，ci包方法新加字段
}
```
+ 返回参数
```json
{
  "code": 0,
  "message": "",
  "data": {
    "previewPath": "" // 小程序预览图片base64数据，v1版本为连接地址，v2版本改为base64数据，不影响使用
  }
}
```