// get vongfong book1 url参数 start
var pages = getCurrentPages()
var page = pages[pages.length - 1]
var str = page.options.src
function getVongFongBook1Url(str) {
    const e = decodeURIComponent;
    const reg = /booking1\?([\s\S]*)\&showwxpaytitle/;
    const url = e(e(e(str)));
    const result = reg.exec(url);
    if (result && result[1]) console.log(result[1])
}
getVongFongBook1Url(str)
// get vongfong book1 url参数 end


// get git add/delete/update results start

// total
// git log --author="ddz10349" --pretty=tformat: --numstat | awk '{ add += $1 ; subs += $2 ; loc += $1 - $2 } END { printf "增加的行数:%s 删除的行数:%s 总行数: %s\n",add,subs,loc }'

// since or before
// git log --author="ddz10349" --since='2020-10-20' --until='2020-10-30' --pretty=tformat: --numstat | awk '{ add += $1 ; subs += $2 ; loc += $1 - $2 } END { printf "增加的行数:%s 删除的行数:%s 总行数: %s\n",add,subs,loc }'

// get git add/delete/update results start


// format book1 url 参数 start
var pages = getCurrentPages()
var page = pages[pages.length - 1]
var str = page.options.src
function getVongFongBook1Url(str) {
    const e = decodeURIComponent;
    const reg = /booking1\?([\s\S]*)\&showwxpaytitle/;
    const url = e(e(e(str)));
    const result = reg.exec(url);
    if (result && result[1]) return result[1]
}
var obj = {}
function formatVongFongBook1Url(str) {
    let arr = str.split('&')
    arr.forEach(el => {
        let [key, val] = el.split('=')
        obj[key] = val
    });
    return obj
}
formatVongFongBook1Url(getVongFongBook1Url(str))
// format book1 url 参数 end










