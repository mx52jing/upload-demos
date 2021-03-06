# ajax上传，无需刷新页面

### 客户端

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>ajax实现文件上传</title>
</head>
<body>
<div class="upload-wrapper">
    <input id="demo4Ajax" type="file" multiple>
    <br>
    <button id="btn-submit">提交</button>
</div>
<script>
    const btn = document.getElementById('btn-submit')
    btn.addEventListener('click', handleUpload)

    function handleUpload() {
        const inputFile = document.getElementById('demo4Ajax'),
            fileList = inputFile.files
        if (!fileList.length) {
            return alert('请选择文件')
        }
        /* 使用FormData对象，将上传对象存入FormData对象内 */
        const formData = new FormData()
        for (let i = 0; i < fileList.length; i++) {
            formData.append('demo4Ajax', fileList[i])
        }
        const xhr = new XMLHttpRequest()
        xhr.open('POST', 'http://localhost:8400', true)
        xhr.onreadystatechange = function() {
            if(xhr.readyState === 4 && xhr.status === 200) {
                const obj = JSON.parse(xhr.responseText);
                console.log(obj);
            }
        }
        xhr.send(formData)
    }
</script>
</body>
</html>
```

### 服务端

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
        let {demo4Ajax = []} = files,
            result = []
        /* 这里要注意一下 如果只上传了一个文件, demo3File就不是一个数组，要兼容一下 */
        if(!Array.isArray(demo4Ajax)) {
            demo4Ajax = [demo4Ajax]
        }
        !!demo4Ajax && demo4Ajax.forEach(item => {
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