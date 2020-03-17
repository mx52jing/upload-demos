const path = require('path')
const fs = require('fs')
const Koa = require('koa')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')

const app = new Koa(),
    port = process.env.PORT

app.use(koaBody({
    formidable: {
        //设置文件的默认保存目录，不设置则保存在系统临时目录下  os
        uploadDir: path.resolve(__dirname, '../static/uploads')
    },
    multipart: true //支持文件上传
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
        const { files = {} } = ctx.request,
            { demo1File = {} } = files,
            /*
            * path 路径
            * name 文件名称 例如 a.png
            * size 文件大小
            * */
            { path: filePath, name, size } = demo1File
        if (size > 0 && filePath) {
            const suffix = path.extname(name),
                newPath = `${filePath}${suffix}`
            fs.renameSync(filePath, newPath)
            ctx.body = {
                fileUrl: `http://localhost:${port}/uploads${newPath.slice(newPath.lastIndexOf('/'))}`
            }
            return
        }
        ctx.body = {
            filePath: ''
        }
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

