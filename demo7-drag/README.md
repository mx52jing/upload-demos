## 拖拽上传

#### 事件

- dragenter 当拖动的元素或选择文本输入有效的放置目标时，会触发此事件

- dragover 当将元素或文本选择拖动到有效放置目标上时，会触发此事件(每几百毫秒触发一次)。

- dragleave 当拖动的元素或文本选择离开有效的放置目标时，会触发此事件

- drop 当在有效放置目标上放置元素或选择文本时触发此事件


## 相关代码

### 客户端

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>拖拽上传</title>
    <style>
        .drop-box {
            width: 350px;
            height: 300px;
            text-align: center;
            line-height: 300px;
            border: 1px solid #666666;
            background-color: #ccc;
        }
    </style>
</head>
<body>
<div class="drag-wrapper">
    拖拽上传
    <div class="drop-box">将文件拖到此处上传</div>
    <button class="btn-submit">提交</button>
</div>
<script>
	const getEl = el => document.querySelector(el),
		/* 获取监听拖拽的盒子 */
		dropBox = getEl('.drop-box'),
		/* 获取提交按钮 */
		submitBtn = getEl('.btn-submit')
	/* 上传文件数组 */
	let uploadFiles = []
	/* 阻止浏览器默认拖放行为 */
	document.addEventListener('drop', event => {
		event.preventDefault();
	});
	const handleDrag = () => {
		dropBox.addEventListener('dragover', event => {
			event.preventDefault()
			dropBox.style.cssText = 'background-color: green'
		})
		dropBox.addEventListener('dragleave', event => {
			event.preventDefault()
			dropBox.style.cssText = 'background-color: #999'
		})
		dropBox.addEventListener('drop', event => {
			event.preventDefault()
			const { dataTransfer } = event,
				{ files } = dataTransfer
			if (!!files.length) {
				uploadFiles = files
			}
		}, false)
	}
	/* 处理拖拽事件 */
	handleDrag()

	const handleSubmit = () => {
		if (!uploadFiles.length) {
			return alert('请选择文件')
		}
		const formData = new FormData()
		for (let i = 0; i < uploadFiles.length; i++) {
			formData.append('demo7Drag', uploadFiles[i])
		}
		const xhr = new XMLHttpRequest()
        xhr.open('POST', 'http://localhost:8700', true)
        xhr.onreadystatechange = () => {
			if(xhr.readyState === 4) {
				const obj = JSON.parse(xhr.responseText);
				if(obj.fileUrl && obj.fileUrl.length){
					alert('上传成功');
				}
			}
        }
        xhr.send(formData)
	}
	/* 处理上传 */
	submitBtn.addEventListener('click', handleSubmit)
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
        const { files = {} } = ctx.request
        /*
        * 多个文件上传，
        * demo7Drag就是一个数组，而不是一个对象
        * */
        let { demo7Drag = [] } = files,
            result = []
        /* 这里要注意一下 如果只上传了一个文件, demo7Drag就不是一个数组，要兼容一下 */
        if (!Array.isArray(demo7Drag)) {
            demo7Drag = [demo7Drag]
        }
        !!demo7Drag && demo7Drag.forEach(item => {
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
