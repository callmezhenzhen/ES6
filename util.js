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


// sleep function start
const fn = (name) => {
    console.log('fuck code '+ name)
}

const sleep1 = (fn, delay) => {
    setTimeout(fn, delay, 'sleep1')
}
sleep1(fn, 1000)

const sleep2 = (fn, delay) => {
    new Promise((resolve, reject) => {
        setTimeout(() => { resolve('sleep2') }, delay)
    }).then((name) => { fn(name) })
}
sleep2(fn, 1000)

const sleep3 = async (fn, delay) => {
    let getPromise = () => {
        return new Promise((resolve, reject) => { setTimeout(resolve, delay) })
    }
    await getPromise()
    fn('sleep3')
}
sleep3(fn, 1000)

function* sleep4(delay) {
    yield new Promise((resolve, reject) => { setTimeout(resolve, delay)})
}
sleep(1000).next().value.then(() => {
    fn('sleep4')
})
// sleep function end

// 隐式类型转换 start
function Person (name) {
    this.name = name
}
Person.prototype.toString = function () {
    return 1
}
const person = new Person('ddz')
console.log(person == 1) // true  == 运算符会进行隐式转换，调用toString方法
// 隐式类型转换 end

// proxy start
const a = {
    name: 'ddz'
}
const withZeroValue = (obj, zeroValue) => {
    return new Proxy(obj, {
        get (obj, prop) {
            return prop in obj ? obj[prop] : zeroValue
        }
    })
}
const proxy = withZeroValue(a, 0)
console.log(proxy.name)
console.log(proxy.age)

// proxy end


// Object.defineProperty start
const a = {
    name: 'ddz'
}
let name = a.name // 本次不会触发get
Object.defineProperty(a, 'name', {
    get () {
        return name
    },
    set (nv) {
        name = nv
    } 
})
// Object.defineProperty end

// proxy1 start
const a = { name: 'ddz' }
const proxy = new Proxy(a, {
    get (target, prop, reciever) {
        return prop in target ? target[prop] : ''
    },
    set (target, prop, value, reciever) {
        if (typeof value != 'string') {
            console.error('not string')
            return false
        } else {
            target[prop] = value
            return true
        }
    }
})
console.log(proxy.name)
proxy.name = 1
console.log(proxy.name)
proxy.name = 'wsy'
console.log(proxy.name)
// proxy1 end


// proxy + reflect start
const a = { name: 'ddz' }
const proxy = new Proxy(a, {
    get (target, prop, reciever) {
        return Reflect.get(target, prop, reciever)
    },
    set (target, prop, value, reciever) {
        if (Reflect.set(target, prop, value, reciever)) {
            return true
        } else {
            console.error('error')
        }
    }
}) 
console.log(proxy.age)
console.log(proxy.name)
proxy.age = 18
proxy.name = 'wsy'
console.log(proxy.age)
console.log(proxy.name)
// proxy + reflect end

// self flat start
const newArray = []
const flat = (array) => {
    array.forEach(item => {
        if (Array.isArray(item)) {
            flat(item)
        } else {
            newArray.push(item)
        }
    })
}
flat([1, [1, 2, [3, 4, 5], 7], [8, 9, 0], 10, 11])
console.log(newArray)


const flat1 = (array) => {
    while (array.some(item => Array.isArray(item))) {
        array = [].concat(...array)
    }
    return array
}
flat1([1, [1, 2, [3, 4, 5], 7], [8, 9, 0], 10, 11])


const flat2 = (array) => {
    return array.reduce((acc, cur) => Array.isArray(cur) ? [...acc, ...flat2(cur)] : [...acc, cur], [])
}
flat2([1, [1, 2, [3, 4, 5], 7], [8, 9, 0], 10, 11])
// self flat end

// bfs dfs start
const obj = {
    a: 1,
    b: {
        c: {
            e: 3,
            f: {
                g: {
                    i: 5,
                    j: {
                        k: {
                            m: 6,
                            n: 7
                        }
                    }
                },
                h: 4
            }
        },
        d: 2
    }
}
// 递归
const dfs = (target) => {
    if (Array.isArray(target)) {
        for (let key of target) {
            dfs(target[key])
        }
    } else if (typeof target == 'object') {
        for (let key in target) {
            dfs(target[key])
        }
    } else {
        console.log(target)
    }
}
dfs(obj)


const list = [
    {
        id: '1',
        child: [
            {
                id: '1-1',
                child: [
                    {
                        id: '1-1-1',
                        child: null
                    }, 
                    {
                        id: '1-1-2',
                        child: [
                            {
                                id: '1-1-2-1',
                                child: null
                            }
                        ]
                    }
                ]
            },
            {
                id: '1-2',
                child: [
                    {
                        id: '1-2-1',
                        child: [
                            {
                                id: '1-2-1-1',
                                child: null
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 2,
        child: {
            id: '2-1',
            child: [
                {
                    id: '2-1-1',
                    child: null
                }
            ]
        }
    }
]

// bfs dfs end
// dub start

function dub (fn, delay) {
    let timer = null
    return function () {
        if (timer) clearTimeout(timer)
        timer = setTimeout(function () {
            console.log('arguments', arguments)
            fn.call(this, arguments)
        }, delay)
    }
}
function scroll () {
    console.log(11111)
}
const fn = dub(scroll, 300)
window.addEventListener('scroll', fn, false)

// dub end





