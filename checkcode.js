const fs = require('fs')
const path = require('path')
const args = process.argv.slice(2)
console.log('args', args)
let _prix, _packages
if (args[0] == 1) {
    _prix = '/Users/zhenzhen/project/tcel-main-project/source/page/'
    _packages = ['train', 'traincommon']
} else if (args[0] == 2) {
    _prix = '/Users/zhenzhen/project/vongfong/'
    _packages = ['src']
}
let _startTime
// 读取文件列表
function getFileList(dir, fileList) {
    const files = fs.readdirSync(dir)
    for (let i = 0, len = files.length; i < len; i++) {
        let fullPath = path.join(dir, files[i])
        let stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
            fileList = getFileList(fullPath, fileList)
        } else {
            fileList.push(fullPath)
        }
    }
    return fileList
}
// 读取文件
function readFileList(fileList, callback) {
    let totalNum = fileList.length
    let readNum = 0
    let match = {count: 0}
    for (let i = 0; i < totalNum; i++) {
        fs.readFile(fileList[i], 'utf8', (err, data) => {
            readNum++
            if (err) {
                console.log(err)
                return
            }
            if (data, fileList[i]) {
                callback && callback(data, fileList[i], match);
                if (readNum === totalNum) {
                    console.log('---------执行完毕!----------')
                    console.log(`本次搜索项目为：${_prix}`)
                    console.log(`本次共搜索：${totalNum}个文件`)
                    console.log(`本次共匹配到：${match.count}个文件`)
                    console.log(`本次共耗时：${Date.now() - _startTime}ms`)
                }
            }
        });
    }
}
// 检查特定字符
function checkMock(data, fileName, match) {
    if (data) {
        const reg = /暂时写死/g; //注意一定要把reg定义放外面，否则会死循环
        let result
        while ((result = reg.exec(data)) !== null) {
            match.count++
            // 前后多取5个，如果能取到的话
            let range = 5
            let start = result.index - range > 0 ? result.index - range : 0
            let end = start + 4 + range
            console.log(`匹配内容：${data.substring(start, end)}\n所在文件：${fileName}`)
        }
    }
}
// 读取配置目录文件
function readPackages(packages) {
    _startTime = Date.now()
    let fileList = []
    for (let i = 0, len = packages.length; i < len; i++) {
        let fullPath = path.join(_prix, packages[i])
        fileList = getFileList(fullPath, fileList)
    }
    readFileList(fileList, (data, fileName, match) => {
        checkMock(data, fileName, match)
    })
}


readPackages(_packages)









