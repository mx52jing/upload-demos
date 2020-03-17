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
        * demo2File就是一个数组，而不是一个对象
        * */
        let { demo2File = [] } = files,
            result = []
        /* 这里要注意一下 如果只上传了一个文件, demo2File就不是一个数组，要兼容处理一下 */
        if (!Array.isArray(demo2File)) {
            demo2File = [demo2File]
        }
        !!demo2File && demo2File.forEach(item => {
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

