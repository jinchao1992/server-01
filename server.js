const http = require('http')
const fs = require('fs')
const url = require('url')
const port = process.argv[2] || 80

if (!port) {
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

const server = http.createServer(function (request, response) {
  const parsedUrl = url.parse(request.url, true)
  const pathWithQuery = request.url
  const queryString = ''
  if (pathWithQuery.indexOf('?') >= 0) { queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  const path = parsedUrl.pathname
  const query = parsedUrl.query
  const method = request.method
  const filePath = path === '/' ? '/index.html' : path
  const session = JSON.parse(fs.readFileSync('./session.json').toString())

  console.log('超哥说：含查询字符串的路径\n' + pathWithQuery);

  // 登录
  if (path === '/signIn' && method === 'POST') {
    const arr = []
    const userArray = JSON.parse(fs.readFileSync('./db/user.json').toString())
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    // 监听请求数据
    request.on('data', (chunk) => {
      // chunk 是块的意思，代表数据时一段一段上传
      arr.push(chunk)
    })
    // 监听数据完成
    request.on('end', () => {
      const string = Buffer.concat(arr).toString()
      const { name, password } = JSON.parse(string)
      const user = userArray.find((item) => item.name === name && item.password === password)
      if (!user) {
        response.statusCode = 400
        response.setHeader('Content-Type', 'text/json; charset=utf-8')
        response.end('{"errCode": "4001"}')
      } else {
        response.statusCode = 200
        // 登录成功之后设置Cookie HttpOnly 是禁止前端修改Cookie
        // response.setHeader('Set-Cookie', `userId=${user.id}; HttpOnly`)

        // 更加方便的方式则是模拟Session
        const random = Math.random()
        session[random] = { userId: user.id }
        fs.writeFileSync('./session.json', JSON.stringify(session))
        response.setHeader('Set-Cookie', `sessionId=${random}; HttpOnly`)
        response.end('成功')
      }
    })
  }
  // 注册 
  else if (path === '/register' && method === 'POST') {
    const arr = []
    const userArray = JSON.parse(fs.readFileSync('./db/user.json').toString())
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    // 监听请求数据
    request.on('data', (chunk) => {
      // chunk 是块的意思，代表数据时一段一段上传
      arr.push(chunk)
    })

    // 监听数据完成
    request.on('end', () => {
      const string = Buffer.concat(arr).toString()
      const { name, password } = JSON.parse(string)
      const lastUser = userArray[userArray.length - 1]
      const newUser = {
        id: lastUser ? lastUser.id + 1 : 1,
        name,
        password
      }
      userArray.push(newUser)
      fs.writeFileSync('./db/user.json', JSON.stringify(userArray))
      response.end('成功')
    })
  }
  else if (path === '/home.html') {
    response.statusCode = 200
    const cookie = request.headers['cookie']
    let sessionId
    try {
      sessionId = (cookie.split(';').filter(s => s.indexOf('sessionId') >= 0)[0].split('=')[1])
    } catch (err) {
      console.log('出错了，userId不存在')
    }
    if (sessionId && session[sessionId]) {
      const users = JSON.parse(fs.readFileSync('./db/user.json').toString())
      const user = users.find(item => item.id * 1 === session[sessionId].userId * 1)
      const homeHtml = fs.readFileSync('./public/home.html').toString()
      let string
      if (user) {
        string = homeHtml.replace('{{username}}', user.name)
          .replace(/<span class="aaa">([\s\S]){1,}<\/span>/gm, '')
      } else {
        string = homeHtml.replace('{{username}}', '未登录')
      }
      response.write(string)
    } else {
      const homeHtml = fs.readFileSync('./public/home.html').toString()
      const string = homeHtml.replace('{{username}}', '未登录')
      response.write(string)
    }
    response.end()
  }
  else {
    response.statusCode = 200;
    const index = filePath.lastIndexOf('.')
    // 获取后缀
    const suffix = filePath.substring(index)
    const types = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.jpg': 'image/jpeg'
    }
    response.setHeader('Content-Type', `${types[suffix]}; charset=utf-8`);
    let content
    try {
      content = fs.readFileSync(`./public${path}`)
    } catch (err) {
      content = '您所访问的路径不存在'
      response.statusCode = 404
    }
    response.write(content)
    response.end();
  }
})
server.listen(port)
console.log('监听 ' + port + ' 成功\n请在浏览器里打开 http://localhost:' + port)
