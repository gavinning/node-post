var fs = require('fs-extra');
var path = require('path');
var glob = require('glob');
var color = require('colorful');
var fstring = require('fullstring');
var is = require('aimee-is');
var extend = require('aimee-extend');
var commander = require('commander');
var lib = require('linco.lab');
var format = require('date-format');
var Config = require('vpm-config').Config;
var pkg = fs.readJsonSync(path.join(__dirname, '../package.json'));
var form = require('./form');
var post;

class Post {

    constructor(options) {
        this.extend = extend;
        this.config = new Config;
        this.cwd = process.cwd();
        this.options = extend({ mode: 'form' }, options || {});
    }

    // Url结尾添加 path.sep 用于标准化路径
    pathend(src) {
        return (src + path.sep).replace(/[\\\/]+$/, path.sep);
    }

    /**
     * 获取上传文件
     * @param   {Array}   array   文件或文件夹数组
     * @param   {Object}  options glob.options
     * @example this.get(['lib'])
     */
    get(array, options) {
        this.files = [];

        // glob默认配置项
        options = extend({
            nodir: true,
            cwd: process.cwd(),
            ignore: [
                './node_modules/**',
                '../node_modules/**',
                '../**/node_modules/**',
                '**/node_modules/**'
            ]
        }, options);

        // 查找文件
        array.forEach((pattern) => {
            if(lib.isFile(pattern)){
                this.files.push(pattern);
            }
            if(lib.isDir(pattern)){
                this.files = this.files.concat(glob.sync(pattern + '/**', options))
            }
        })

        return this
    }

    /**
     * 执行上传操作
     * @example this.get(['lib']).post()
     */
    post() {
        var array;
        var config = this.config.get();
        var poster = config.poster[config.posterSelectedIndex];

        // 当前CONFIG不存在paths配置时
        if(!config.poster[config.posterSelectedIndex].paths){
            return console.log(color.yellow('Warn: Please collocate paths first'))
        }

        array = this.files.map((file) => {
            var paths = this.getPaths(file, poster);
            return new Promise((res, rej) => {
                form(
                    poster.url,
                    {
                        file: file,
                        field: 'files',
                        filepath: paths.serverFilepath
                    },
                    (err, resp, msg) => {
                        if(err){
                            rej(err);
                            console.log(color.red('Error: ' + err.message));
                        }
                        else{
                            res(msg);
                            resp.statusCode === 200 ?
                                console.log(color.cyan('=> ' + poster.name), paths.relative):
                                console.log(color.yellow('Warn: ' + msg), color.gray('[post|post.js|96]'));
                        }
                    }
                )
            })
        })

        Promise
            .all(array)
            .catch(function(err) {
                throw err;
            })
    }

    /**
     * 获取文件路径信息
     * @param   {String}  file   本地文件路径
     * @param   {Object}  poster 当前POST配置项
     * @return  {Object}         本地文件的相关路径信息
     */
    getPaths(file, poster) {
        var paths, local, cwd;
        // 获取服务器路径配置
        paths = poster.paths.find((url) => {
            // 标准化路径
            cwd = this.pathend(this.cwd);
            local = this.pathend(url.local);
            return local === cwd || cwd.indexOf(local) === 0;
        })
        // 如果为空则退出进程
        if(!paths){
            console.log(color.yellow('Warn: This folder is not workplace'))
            process.exit(1)
        }
        return {
            local: paths.local,
            server: paths.server,
            relative: path.relative(paths.local, file),
            localFilepath: path.join(this.cwd, file),
            serverFilepath: path.join(paths.server, path.relative(paths.local, file))
        }
    }

    /**
     * 获取本地文件的服务器的路径
     * @param   {String}  file   本地文件路径
     * @param   {Object}  poster 当前POST配置项
     * @return  {String}         本地文件的服务器路径
     */
    getServerpath(file, poster) {
        // Server + Project.relative + filepath
        return this.getPaths(file, poster).serverFilepath;
    }

    /**
     * 返回当前已有配置项
     * @return  {Array}   格式化后的配置项
     * @example this.getList()
     */
    getList() {
        var list;
        var config = this.config.get();
        // 提取配置
        list = config.poster.map((conf) => {
            return ['  ' + conf.name, conf.url].join(', ');
        });

        // 高亮选中项
        list[config.posterSelectedIndex || 0] = list[config.posterSelectedIndex || 0].replace(/^\s{1}/, '*');
        // 补全字符串
        return fstring(list, {split: ',', splitTo: ' '});
    }

    /**
     * 获取配置索引
     * @param   {String}  index 配置名称
     * @param   {Number}  index 配置索引
     * @return  {Number}        配置索引
     * @example this.getIndex(1)
     * @example this.getIndex('configname')
     */
    getIndex(index) {
        return isNaN(index) ?
            this.config.get().poster.findIndex((item) => item.name === index) : Number(index);
    }

    getName(index) {
        return this.config.get().poster[index].name
    }

    /**
     * 选择配置
     * @param   {String}  index 配置名称
     * @param   {Number}  index 配置索引
     * @example this.select(1)
     * @example this.select('configname')
     */
    select(index) {
        var config = this.config.get();

        index = this.getIndex(index);

        // 检查配置是否存在
        if(index < 0 || index >= config.poster.length){
            return Post.msg.none()
        }

        // 检查目标配置是否为当前配置
        if(index !== config.posterSelectedIndex){
            this.config.set('posterSelectedIndex', index);
            this.config.save();
        }

        console.log('')
        console.log(this.getList().join('\n'))
        console.log('')
    }

    /**
     * 添加一个配置
     * @param   {String}  name 配置名称
     * @param   {String}  url  配置URL
     * @example this.add('dev', 'qq.com')
     */
    add(name, url) {
        this.config.get().poster.push({
            name: name,
            url: url
        })
        this.config.save();
        console.log('')
        console.log('   ' + name, 'has been added')
        console.log('')
    }

    /**
     * 删除一个配置
     * @param   {String}  name 配置名称
     * @param   {Number}  name 配置索引
     * @example this.del(0)
     */
    del(name) {
        var index = this.getIndex(name);
        var config = this.config.get();

        // 检查配置是否存在
        if(index < 0 || index >= config.poster.length){
            return Post.msg.none()
        }

        // 删除指定配置
        Post.msg.removeIndex(config.poster, index);

        // 如果默认项被删除则默认选中1
        if(config.posterSelectedIndex == index){
            config.posterSelectedIndex = 0;
        }

        this.config.save();
        console.log('')
        console.log('   ' + name, 'has been deleted')
        console.log('')
    }
}

Post.msg = {

    none() {
        console.log('')
        console.error('   ' + color.yellow('Warn: Can\'t find this config, Please input the correct config name'))
        console.log('')
    },

    removeIndex(arr, index){
        arr.splice(index, 1);
        return arr;
    }
}


post = new Post;
post.Post = Post;
module.exports = post;
