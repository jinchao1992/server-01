const fs = require('fs')

// 读取数据
const userString = fs.readFileSync('./db/user.json').toString()
const parseUser = JSON.parse(userString)

// 写数据
const data = { name: 'tom', id: '3', password: '456' }
parseUser.push(data)
fs.writeFileSync('./db/user.json', JSON.stringify(parseUser))