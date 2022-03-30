## 运行
1. 第一次运行安装依赖
```
npm install
```
>步骤2到6在遇到具体的报错时进行安装，如果npm start没有问题可以直接忽视
2. 安装react-monaco-editor和monaco-editor-webpack-plugin
```
npm add react-monaco-editor
npm install monaco-editor-webpack-plugin
```
如果monaco还报错安装monaco-editor
```
npm install monaco-editor
```

3. 安装core-js 或者 core-js@3.18.3版本
```
npm install core-js
npm install --save core-js@3.18.3
```

4. 安装blueprintjs
```
npm install --save @blueprintjs/core
```

5. 安装ts自动生成uuid
```
npm install --save @types/uuid
```

6. @umi/ 安装教程
https://www.cnblogs.com/zhaoxxnbsp/p/12672652.html#2%E5%AE%89%E8%A3%85

8. compile 出错时可参考
```
npm i @ant-design/pro-card@1.18.0 --save
npm i @ant-design/pro-form@1.50.0 --save
npm i @ant-design/pro-table@2.61.0 --save
```

7. 运行项目（使用也推荐使用mock数据）
```
npm start
```
## Q & A
### 1. 如何 mock ?
这里的 mock 主要是 模型发送给后端的请求和返回模拟的数据。 npm start 的模式下，默认是开启了 mock,只需要借鉴 /mock 文件夹下的官方示例即可。
即只要mock 中的接口路径和后端中一致会先走mock的方法，如果mock中没有才会请求后端的接口。


## TODO 
1. mock掉 前端登陆的代码 --rich
