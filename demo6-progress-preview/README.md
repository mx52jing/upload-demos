### 相关知识点

##### 预览图片用到的API`window.URL.createObjectURL(object)`

- object 就是上传的file对象

这个方法的返回值作为img的src就可以实现图片预览

```javascript
const src = window.URL.createObjectURL(object),
    img = document.createElement('img'),
img.src = src
```

注意⚠：

在每次调用`createObjectURL()`方法时，都会创建一个新的`URL`对象，
当不再需要这些`URL`对象时，每个对象必须通过调用`URL.revokeObjectURL()`方法来释放。
浏览器在`document`卸载的时候，会自动释放它们，但是为了获得最佳性能和内存使用状况，应该在安全的时机主动释放掉它们。️

以上知识摘自[MDN-URL.createObjectURL](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL)

```javascript
const src = window.URL.createObjectURL(object),
    img = document.createElement('img'),
img.src = src
img.onload = () => {
	URL.revokeObjectURL(object)
}
```

##### 上传

上传过程中如果中止了上传，`xhr.readyState会等于4`

### 相关代码

#### 客户端

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>文件上传 显示上传进度 + 预览</title>
    <style>
        #demo6ProgressPreview {
            display: none;
        }
        
        .upload-label {
            display: block;
        }
        .upload-label,
        .upload-select {
            font-size: 12px;
            width: 80px;
            height: 80px;
            display: flex;
            justify-content: center;
            align-items: center;
            border: 1px solid #999999;
        }
        
        .preview-wrapper {
            display: flex;
            flex-wrap: wrap;
        }
        
        .preview-item {
            margin: 10px;
            border: 1px solid #999999;
        }
        
        .preview-item img {
            display: block;
            width: 188px;
            height: 188px;
        }
    </style>
</head>
<body>
<div class="upload-wrapper">
    <label class="upload-label">
        <div class="upload-select">点击选择图片</div>
        <input id="demo6ProgressPreview" type="file" multiple>
    </label>
    <div class="preview-wrapper"></div>
    <button id="btn-submit">提交</button>
</div>
<script>
    const getEl = el => document.querySelector(el),
        createEl = nodeType => document.createElement(nodeType)
    /* 提交按钮 */
    submitBtn = document.getElementById('btn-submit'),
        /* 获取预览区域dom */
        imgPreviewWrapper = getEl('.preview-wrapper'),
        /* input file */
        inputFile = getEl('#demo6ProgressPreview'),
        /* 最大上传文件数量 */
        maxUploadCount = 6,
        /* 上传文件数组 */
        uploadAry = []
    /* 监听input change事件函数 */
    const handleInputChange = () => {
        const files = inputFile.files,
            { length: filesLength } = files
        if (
            filesLength > maxUploadCount ||
            filesLength + uploadAry.length > maxUploadCount ||
            uploadAry.length === maxUploadCount
        ) {
            return alert(`最多只能上传${maxUploadCount}张图片`)
        }
        for (let i = 0; i < filesLength; i++) {
            /* 创建单个预览图片容器 */
            const previewItem = createEl('div'),
                /* 图片 */
                imgWrapper = createEl('img'),
                /* 进度条和中止按钮 */
                progressWrap = createEl('div')
            progressWrap.setAttribute('class', 'preview-abort')
            previewItem.setAttribute('class', 'preview-item')
            imgWrapper.src = URL.createObjectURL(files[i])
            /*
            * 每次调用 createObjectURL() 方法时，都会创建一个新的 URL 对象
            * 当不再需要这些 URL 对象时，每个对象必须通过调用 URL.revokeObjectURL() 方法来释放
            * */
            imgWrapper.onload = () => {
                URL.revokeObjectURL(files[i])
            }
            progressWrap.innerHTML = `
                <div class="item-progress"></div>
                <button class="btn-abort">Abort</button>
            `
            previewItem.appendChild(imgWrapper)
            previewItem.appendChild(progressWrap)
            imgPreviewWrapper.appendChild(previewItem)
            uploadAry.push({
                file: files[i],
                progressWrap
            })
        }
    }
    inputFile.addEventListener('change', handleInputChange)

    /* 处理每个上传 */
    const handleUpload = ({ file, progressWrap }, index) => {
        /* 获取中止上传按钮 */
        const abortBtn = progressWrap.querySelector('.btn-abort'),
            /* 获取进度条容器 */
            itemProgress = progressWrap.querySelector('.item-progress')
        const xhr = new XMLHttpRequest
        xhr.open('POST', 'http://localhost:8600', true)
        xhr.onreadystatechange = () => {
            if(xhr.readyState === 4 && xhr.uploaded) {
				const obj = JSON.parse(xhr.responseText);   //返回值
				console.log(obj);
            }
        }
        const formData = new FormData()
        formData.append('demo6ProgressPreview', file)
        /* 监听上传进度函数 */
        const handleProgress = event => {
            const {
                lengthComputable, //上传进度改变
                loaded, // 加载的字节数
                total // 总共字节数
            } = event
            if (lengthComputable) {
                const progress = (loaded / total * 100).toFixed(2)
                itemProgress.textContent = `${progress}%`
                itemProgress.style.cssText = `width: ${progress}%; background-color: red`
                if(progress > 99) {
                    itemProgress.style.cssText = `width: ${progress}%; background-color: green`
                }
                if(progress >= 100) {
                	/* 给xhr 添加自定义属性，表示上传成功 */
                	xhr.uploaded = true
                }
            }
        }
        xhr.upload.onprogress = handleProgress
        /* 终止上传事件 */
        const handleAbort = () => {
        	/* 终止上传后 xhr.readyState 会等于 4*/
            xhr.abort()
        }
        abortBtn.addEventListener('click', handleAbort)
        xhr.send(formData)
    }
    /* 上传事件处理函数 */
    const handleSubmit = () => {
        if (!uploadAry.length) {
            return alert('请选择文件')
        }
        uploadAry.forEach((item, index) => handleUpload(item, index))
    }
    submitBtn.addEventListener('click', handleSubmit)
</script>
</body>
</html>
```

#### 服务端(和之前相比没有变化)

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
        const { files = {} } = ctx.request
        /*
        * 多个文件上传，
        * demo6ProgressPreview就是一个数组，而不是一个对象
        * */
        let { demo6ProgressPreview = [] } = files,
            result = []
        /* 这里要注意一下 如果只上传了一个文件, demo6ProgressPreview就不是一个数组，要兼容一下 */
        if (!Array.isArray(demo6ProgressPreview)) {
            demo6ProgressPreview = [demo6ProgressPreview]
        }
        !!demo6ProgressPreview && demo6ProgressPreview.forEach(item => {
            /*
             * path 路径
             * name 文件名称 例如 a.png
             * size 文件大小
            */
            const { name, path: filePath, size } = item
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
    const url = `http://localhost:${port}`
    console.log(
        `Servering is Running at ${url}\n`,
        `浏览器中输入【${url}/html/index.html】查看效果`
    );
})
```
