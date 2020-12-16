const fs = require('fs');
const path = require('path');
// const _prix = '/Users/zhenzhen/project/tcel-main-project/source/page/';
const _prix = '/Users/zhenzhen/project/tcel-main-project/build/page/';
const excludeFiles = ['.git', '.DS_Store'];
const trainPackageName = 'train';
let trainCommonPackageName = 'traincommon';

// 获取train包下面的分包
function getTrainPackage(dir) {
    const packages = [];
    const files = fs.readdirSync(dir);
    for (let i = 0, len = files.length; i < len; i++) {
        let fullPath = path.join(dir, files[i]);
        let stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            packages.push(files[i]);
        }
    }
    return packages
}

// 计算分包大小
function countPackageSize(dir, size) {
    const files = fs.readdirSync(dir);
    for (let i = 0, len = files.length; i < len; i++) {
        if (excludeFiles.indexOf(files[i]) > -1) {
            continue;
        }
        let fullPath = path.join(dir, files[i]);
        let stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            size += countPackageSize(fullPath, 0); //对每一个文件夹里面的文件大小进行累加，故size重置为0
        } else {
            size += stat.size;
        }
    }
    return size
}

function main() {
    const trainPackages = getTrainPackage(path.join(_prix, trainPackageName));
    let result = [];
    for (let i = 0, len = trainPackages.length; i < len; i++) {
        let name = trainPackages[i];
        let size = Math.ceil(countPackageSize(path.join(_prix, trainPackageName, name), 0) / 1024) + 'kb';
        result.push({package: name, size});
    }
    let size = Math.ceil(countPackageSize(path.join(_prix, trainCommonPackageName), 0) / 1024) + 'kb';
    result.push({package: trainCommonPackageName, size})
    console.table(result);
}

main();