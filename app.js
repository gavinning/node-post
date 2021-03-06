var is = require('aimee-is');
var path = require('path');
var post = require('./lib/post');
var filepath = path.join(process.env.HOME, '.postconfig.json');

// 初始化配置文件路径
post.create(filepath);
post.config.init(filepath);

if(is.emptyObject(post.config.get())){
    post.config.merge({
        poster: [
            {
                name: 'test',
                url: 'http://test:test@127.0.0.1/upload'
            },
            {
                name: 'prod',
                url: 'http://prod:prod@127.0.0.1/upload'
            }
        ],
        posterSelectedIndex: 0
    });
    post.config.save({pretty: true});
}

module.exports = post;
