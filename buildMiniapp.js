const path = require('path')
const _sourceCodeDir = path.resolve('/Users/zhenzhen/project/tcel-main-project/source/')
const _buildCodeDir = path.resolve(_sourceCodeDir, '../build')
const _previewQRImgDir = path.resolve(_sourceCodeDir, '../qr.png')
const {exec, spawn } = require('child_process')
if (process.argv[2] == 'build') {
    build()
} else {
    showQR()
}

/**
 * build
 */
function build () {
    const st = Date.now()
    const ls = spawn(`gulp`, ['build'], {cwd: _sourceCodeDir})
    ls.stdout.on('data', (data) => {console.log(`${data}`)}) // 使用${data}转string
    ls.stderr.on('data', (data) => {console.error(`${data}`)})
    ls.on('close', (code) => {
        if (code == 0) {
            console.log('build success')
            console.log(`build time: ${Math.ceil((Date.now() - st) / 1000)}s`)
            console.log('start preview')
            previewQR()
        }
    })
}

/**
 * 生成二维码
 */
function previewQR () {
    const st = Date.now()
    // const agrs = ['--project', `${_buildCodeDir}`, '-f', 'image', '-o', `${os.homedir()}/Desktop`]
    const _cliPath = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'
    const ls = spawn(`${_cliPath}`, ['preview', '--project', `${_buildCodeDir}`, '-f', 'image', '-o', `${_previewQRImgDir}`])
    ls.stdout.on('data', (data) => {console.log(`${data}`)})
    ls.stderr.on('data', (data) => {console.error(`${data}`)})
    ls.on('close', (code) => {
        console.log('preview success')
        console.log(`preview time: ${Math.ceil((Date.now() - st) / 1000)}s`)
        showQR()
    })
}

/**
 * 打开二维码
 */
function showQR () {
    exec(`open ${_previewQRImgDir}`, (error, stderr, stdout) => { //还是exec用着香
        if (error) {
            console.log(error)
            return
        }
    })  
}

  


