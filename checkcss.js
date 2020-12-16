const path = require('path')
const _prefix = '/Users/zhenzhen/project/tcel-main-project/source/page/train/newpassenger/'
const fs = require('fs')
// https://www.w3.org/TR/CSS2/syndata.html#syntax
// [-]?({nmstart})({nmchar})*
// nmstart: [_a-z]|{nonascii}|{escape}
// nmchar: [_a-z0-9-]|{nonascii}|{escape}
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
function readFile (dir, filetype) {
    let files = fs.readdirSync(dir)
    for (let i = 0, len = files.length; i < len; i++) {
        let fullPath = path.join(dir, files[i])
        let stat = fs.statSync(fullPath)
        if (!stat.isDirectory() && files[i].indexOf(filetype) > -1) {
            let filename = files[i].substring(0, files[i].length - 5) // 去除拓展名
            let wxmlIdx = files.findIndex(item => item === filename + '.wxml') // 与之匹配的wxml
            if (wxmlIdx > -1) {
                let cssData = fs.readFileSync(fullPath, 'utf8') // 同步读取
                let cssKeys = getCssKeys(cssData, filename)
                let wxmlData = fs.readFileSync(path.join(dir, files[wxmlIdx]), 'utf8')
                let wxmlKeys = getClassKeys(wxmlData)
                console.log(diff(cssKeys, wxmlKeys))
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
    let keys = []
    let result
	while ((result = reg4.exec(data)) !== null) {
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
    const reg3 = /{{[\s\S]+\?\s*('|")([\s\S]+?)\1\s*:\s*\1([\s\S]+?)\1}}/g
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
 * 展开一层
 * 优先使用原生
 * 其次用拓展运算符替代
 */
function flat (array) {
    return Array.prototype.flat ? array.flat() : [].concat(...array)
}





function readCssFile (dir, directory) {
    dir = path.join(dir, directory)
    readFile(dir, '.wxss')
}

readCssFile(_prefix, 'detail')


