var is = require('aimee-is');
var path = require('path');
var post = require('./lib/post');

// 初始化配置文件路径
post.config.init(path.join(process.env.HOME, '.postconfig.json'));

if(is.emptyObject(post.config.get())){
    post.config.merge({
        proxy: {
            proxy: '',
            proxys: ''
        },
        poster: [
            {
                name: 'test',
                url: 'http://test:test@127.0.0.1/upload'
            },
            {
                name: 'prod',
                url: 'http://prod:prod@127.0.0.1/upload'
            }
        ]
    });
    post.config.save({pretty: true});
}

module.exports = post;
