## 运行
1. 第一次运行安装依赖
```
npm install
```
2. 运行项目（使用也推荐使用mock数据）
```
npm start
```
## Q & A
### 1. 如何 mock ?
这里的 mock 主要是 模型发送给后端的请求和返回模拟的数据。 npm start 的模式下，默认是开启了 mock,只需要借鉴 /mock 文件夹下的官方示例即可。
即只要mock 中的接口路径和后端中一致会先走mock的方法，如果mock中没有才会请求后端的接口。


## TODO 
1. mock掉 前端登陆的代码 --rich