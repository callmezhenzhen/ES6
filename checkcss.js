const os = require('os')
const desktopDir = os.homedir() + '/Desktop'
const path = require('path')
const prefix = '/Users/zhenzhen/project/tcel-main-project/source/page/'
const fs = require('fs')
const packages = ['train', 'traincommon']
// https://www.w3.org/TR/CSS2/syndata.html#syntax
// [-]?({nmstart})({nmchar})*
// nmstart: [_a-z]|{nonascii}|{escape}
// nmchar: [_a-z0-9-]|{nonascii}|{escape} ===> 不排除不规范的css命名，比如中间出现大写字母 [_a-z0-9-] => [_a-zA-Z0-9-]
// nonascii: [^\0-\237]
// escape: {unicode}|\\[^\n\r\f0-9a-f]
// unicode: \\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?
const reg = /\.[-]?([_a-z]|[^\0-\237]|\\[0-9a-f]{1,6}(\r\n|[\n\r\t\f])?|\\[^\n\r\f0-9a-f])([_a-z0-9-]|[^\0-\237]|\\[0-9a-f]{1,6}(\r\n|[\n\r\t\f])?|\\[^\n\r\f0-9a-f])*/g
// 匹配',' / '{' 
// 如: .xxx,
// 如: .xxx {csskey: cssvalue}
const reg1 = /\.([-]?([_a-z]|[^\0-\237]|\\[0-9a-f]{1,6}(\r\n|[\n\r\t\f])?|\\[^\n\r\f0-9a-f])([_a-z0-9-]|[^\0-\237]|\\[0-9a-f]{1,6}(\r\n|[\n\r\t\f])?|\\[^\n\r\f0-9a-f])*)\s*[,{]/g
// 匹配伪类或者伪元素，这块儿逻辑不够严谨，未知伪类正则
// 如: .xxx::before
// 如: .xxx:first-child
const reg2 = /\.([-]?([_a-z]|[^\0-\237]|\\[0-9a-f]{1,6}(\r\n|[\n\r\t\f])?|\\[^\n\r\f0-9a-f])([_a-z0-9-]|[^\0-\237]|\\[0-9a-f]{1,6}(\r\n|[\n\r\t\f])?|\\[^\n\r\f0-9a-f])*)(:{1,2}[a-z-]+)?\s*[,{]/g
// 去除无用的捕获项 (?:)
const reg3 = /\.([-]?(?:[_a-z]|[^\0-\237]|\\[0-9a-f]{1,6}(?:\r\n|[\n\r\t\f])?|\\[^\n\r\f0-9a-f])(?:[_a-z0-9-]|[^\0-\237]|\\[0-9a-f]{1,6}(?:\r\n|[\n\r\t\f])?|\\[^\n\r\f0-9a-f])*)(?::{1,2}[a-z-]+)?\s*[,{]/g
// 匹配'.'
// 如: .xxx.yyy 或 .xxx .yyy 
// 先行断言 x(?=y)
const reg4 = /\.([-]?(?:[_a-z]|[^\0-\237]|\\[0-9a-f]{1,6}(?:\r\n|[\n\r\t\f])?|\\[^\n\r\f0-9a-f])(?:[_a-z0-9-]|[^\0-\237]|\\[0-9a-f]{1,6}(?:\r\n|[\n\r\t\f])?|\\[^\n\r\f0-9a-f])*)(?::{1,2}[a-z-]+)?\s*(?=[\.,{])/g

// 读取css文件
function readFile (dir, diffs) {
    let files = fs.readdirSync(dir)
    for (let i = 0, len = files.length; i < len; i++) {
        let fullPath = path.join(dir, files[i])
        let stat = fs.statSync(fullPath)
        if (stat.isDirectory()) { // 目录，深度遍历
            readFile(fullPath, diffs)
        } else {
            let wxmlIdx
            if (isWxss(files[i]) && (wxmlIdx = getRelatedWxmlIndex(files, files[i])) > -1) { // .wxss文件并且有匹配的.wxml文件
                let cssData = fs.readFileSync(fullPath, 'utf8') // 读取.wxss文件
                let cssKeys = getCssKeys(cssData) // 解析获取样式列表
                let wxmlData = fs.readFileSync(path.join(dir, files[wxmlIdx]), 'utf8') // 读取.wxml文件
                let wxmlKeys = getClassKeys(wxmlData) // 解析获取样式列表
                const useless = diff(cssKeys, wxmlKeys) // 计算差集
                if (useless && useless.length > 0) {
                    result.totalAmount += useless.length
                    result.matchFiles++
                    diffs.push({
                        fileName: files[i], // 文件名
                        filePath: cutPathFrom(fullPath, 'page'), // 文件路径，page开头
                        uselessCss: useless, // 列表
                        amount: useless.length // 条数
                    })
                }
            }
        }
    }
}

// 获取css属性列表
function getCssKeys (data) {
    // 去除注释内容
    // /* css style */
    // /*
    // css style
    // */
    // 非贪婪模式 *? 
    const reg = /\/\*[\s\S]*?\*\//g
    data = data.replace(reg, '')
    const reg1 = /\.([-]?(?:[_a-z]|[^\0-\237]|\\[0-9a-f]{1,6}(?:\r\n|[\n\r\t\f])?|\\[^\n\r\f0-9a-f])(?:[_a-zA-Z0-9-]|[^\0-\237]|\\[0-9a-f]{1,6}(?:\r\n|[\n\r\t\f])?|\\[^\n\r\f0-9a-f])*)(?::{1,2}[a-z-]+)?\s*(?=[\.,{])/g
    let keys = []
    let result
	while ((result = reg1.exec(data)) !== null) {
		if (result && result[1]) {
			keys.push(result[1])
		} 
    }
    keys = [...new Set(keys)] // 去除重复的css样式
    return keys
}

// 获取wxml中的class
function getClassKeys (data) {
    // 去除注释内容
    // <!-- <view>xxxx</view> -->
    // <!-- 
    //   <view>xxxx</view> 
    //   <view>xxxx</view> 
    // -->
    const reg = /<!--[\s\S]*?-->/g
    data = data.replace(reg, '')
    // 获取class
    let classes = []
    /**
     * 截取
     * class="xxxx"
     * class='xxxx'
     * class="xxx {{yyy ? 'aaa' : 'bbb'}}"
     * class="xxx {{yyy && 'aaa'}}"
     * \n 重复捕获的第n个组
     */
    const reg1 = /(class=('|")[\s\S]*?\2)/g
    let result
    while ((result = reg1.exec(data)) !== null) {
        if (result && result[1]) {
            classes.push(result[1])
        }
    }
    classes = [...new Set(classes)]
    /**
     * class="xxx {{yyy && 'aaa'}}" => class="xxx aaa"
     */
    const reg2 = /{{[\s\S]+&&\s*('|")([\s\S]+?)\1}}/g
    classes = classes.map(item => item.replace(reg2, (match, p1, p2) => p2))
    classes = [...new Set(classes)]
    /**
     * class="xxx {{yyy ? 'aaa' : 'bbb'}}" => class="xxx aaa bbb"
     */
    const reg3 = /{{[\s\S]+\?\s*('|")([\s\S]*?)\1\s*:\s*\1([\s\S]*?)\1\s*}}/g
    classes = classes.map(item => item.replace(reg3, (match, p1, p2, p3) => p2 + ' ' + p3))
    classes = [...new Set(classes)]
    /**
     * class="xxx aaa bbb" => "xxx aaa bbb"
     */
    const reg4 = /class=('|")([\s\S]+?)\1/g
    classes = classes.map(item => item.replace(reg4, (match, p1, p2) => p2))
    classes = [...new Set(classes)]
    /**
     * "xxx aaa bbb"
     * => 多维数组['xxx', 'aaa', 'bbb']
     * => 扁平化
     * => 去重
     */
    classes = [...new Set(flat(classes.map(item => item.split(' '))))]
    return classes
}

/**
 * 求css相对于wxml的差集
 * 即css中有的，wxml中没有
 */
function diff (css, wxml) {
    return css.filter(outer => !wxml.some(inner => outer === inner))
}

/**
 * 是否是wxss文件
 * @param {string} fileName 
 */
function isWxss (fileName) {
    return fileName.indexOf('.wxss') > -1
}

/**
 * 获取匹配的wxml序列
 * @param {array} files 
 * @param {string} fileName 
 */
function getRelatedWxmlIndex (files, fileName) {
    const wxmlName = fileName.replace(/\.wxss/g, '.wxml')
    return files.findIndex(item => item === wxmlName)
}

/**
 * 截取路径，方便读取
 * @param {string} path 
 * @param {string} cuter 
 */
function cutPathFrom (path, cuter) {
    return path.substring(path.indexOf(cuter))
}

/**
 * 展开一层
 * 优先使用原生
 * 其次用拓展运算符替代
 * @param {array} array 
 */
function flat (array) {
    return Array.prototype.flat ? array.flat() : [].concat(...array)
}

/**
 * 格式化日志
 * @param {<object>} diffs 
 * @param {number} totalAmount 
 */
function formatFile (diffs, result) {
    const file = {
        matchedFiles: result.matchFiles,
        totalAmount: result.totalAmount,
        useless: diffs
    }
    writeFile(JSON.stringify(file, null, 4))
}

/**
 * 输出useless-css到桌面
 * @param {<string>} data 
 */
function writeFile (data) {
    fs.writeFile(`${desktopDir}/useless-css.json`, data, (err) => {
        if (err) {
            throw err
        }
        console.log('详见：', `${desktopDir}/useless-css.json`)
    })
}

const result = { // 统计信息
    matchFiles: 0,
    totalAmount: 0
} 

/**
 * 执行入口
 */
function main () {
    let diffs = []
    for (let i = 0, len = packages.length; i < len; i++) {
        let dir = path.join(prefix, packages[i])
        readFile(dir, diffs)
    }
    formatFile(diffs, result)
    console.log(`本次共命中${result.matchFiles}个.wxss文件`)
    console.log(`本次检测出${result.totalAmount}个无用css样式`)
}

main()


