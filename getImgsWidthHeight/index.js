const sizeOf = require('image-size')
const fs = require('fs')
const _dir = './res/'

fs.readdir(_dir, (err, files) => {
    if (err) {
        throw err
    }
    let imgs = []
    for (i = 0, len = files.length; i < len; i++) {
        let dimensions = sizeOf(_dir + files[i])
        imgs.push({name: files[i], width: dimensions.width, height: dimensions.height})
    }
    console.table(imgs)
})

