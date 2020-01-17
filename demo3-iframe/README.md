### 局部刷新

页面内放一个隐藏的`iframe`，或者使用`js`动态创建，指定`form`表单的`target`属性值为iframe标签的`name`属性值，这样`form`表单的`shubmit`行为的跳转就会在`iframe`内完成，整体页面不会刷新。

### 拿到接口数据

为`iframe`添加load事件，得到`iframe`的页面内容，将结果转换为`JSON`对象，这样就拿到了接口的数据

### html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>使用iframe 多个文件上传</title>
</head>
<body>
<iframe
    style="display:none;"
    name="upload-iframe"
    id="upload-iframe"
    src=""
    frameborder="0">
</iframe>
<!-- 使用iframe多文件上传 -->
<form
    target="upload-iframe"
    method="post"
    action="http://localhost:8300"
    enctype="multipart/form-data">
    <!-- 多文件上传 input要 添加 multiple 属性-->
    请选择文件：(可多选)
    <input type="file" name="demo3File" multiple>
    <br>
    <input type="submit">
</form>
<script>
    const iframe = document.getElementById('upload-iframe')
    iframe.addEventListener('load', () => {
        const res = iframe.contentWindow.document.body.innerText,
            resObj = JSON.parse(res)
        if(
            resObj &&
            resObj['fileUrl'] &&
            resObj['fileUrl'].length
        ) {
            console.log(obj);
        }
    })
</script>
</body>
</html>
```

### JS

```javascript
const path = require('path')
const fs = require('fs')
const Koa = require('koa')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')

const app = new Koa(),
    port = process.env.PORT

app.use(koaBody({
    formidable: {
        //设置文件的默认保存目录，不设置则保存在系统临时目录下os
        uploadDir: path.resolve(__dirname, '../static/uploads')
    },
    multipart: true // 支持文件上传
}))

//开启静态文件访问
app.use(koaStatic(
    path.resolve(__dirname, '../static')
));

app.use(async ctx => {
    /*
    * files就是上传的文件对象 格式: {[name]: {xxx}}
    * name就是type为file的input设置的name属性
    */
    try {
        const {files = {}} = ctx.request
            /*
            * 多个文件上传，
            * demo3File就是一个数组，而不是一个对象
            * */
        let {demo3File = []} = files,
            result = []
        /* 这里要注意一下 如果只上传了一个文件, demo3File就不是一个数组，要兼容一下 */
        if(!Array.isArray(demo3File)) {
            demo3File = [demo3File]
        }
        !!demo3File && demo3File.forEach(item => {
            /*
             * path 路径
             * name 文件名称 例如 a.png
             * size 文件大小
            */
            const {name, path: filePath, size} = item
            if (size > 0 && filePath) {
                const suffix = path.extname(name),
                    newPath = `${filePath}${suffix}`
                fs.renameSync(filePath, newPath)
                result.push(`http://localhost:${port}/uploads${newPath.slice(newPath.lastIndexOf('/'))}`)
            }
            ctx.body = `{
                "fileUrl": ${JSON.stringify(result)}
            }`;
            // ctx.body = {
            //     filePath: `${JSON.stringify(result)}`
            // }
        })
    } catch (e) {
        console.log(e);
    }
})

app.listen(port, () => {
    console.log(`Servering is Running at http://localhost:${port}`);
})

```