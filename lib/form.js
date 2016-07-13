var fs = require('fs');
var request = require('request');

/**
 * 上传文件
 * @param   {String}   url     上传api
 * @param   {Object}   options 配置项
 * @param   {Function} fn      回调
 * @return  {[type]}           form对象
 * @example form('/u', {}, fn)
 */
function form(url, options, fn) {
    var r = request.post(url, fn);
    var form = r.form();
    form.append('field', options.field);
    form.append('filepath', options.filepath);
    form.append('files', fs.createReadStream(options.file));
    return form;
}

module.exports = form;
