# Node-post
快速上传文件

```sh
$ npm i node-post -g
```

### Help
```sh
$ post -h
```

### First
```sh
$ post add config-name http://domian.com/upload
$ post ls
```

### Then
```sh
$ post add -p config-name '/local/path' '/server/path'
```

### Upload
```sh
$ post *
$ post lib
$ post lib/**
$ post lib bin
```

### Server By Express
[node-post-server](https://www.npmjs.com/package/node-post-server)
```sh
$ npm i node-post-server --save
$ npm i connect-multiparty --save
```
```js
var auth = require('basic-auth')
var poster = require('node-post-server');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart(); // 可选 option: {uploadDir: '/tmp'} 默认为 os.tmpdir()

// Upload api
router.post('/u', multipartMiddleware, function(req, res){
    var user, source, target;
    // 获取User
    user = auth(req);

    // 检查用户
    if(!checkUser(user)){
        return res.status(403).send('Permission denied')
    }

    source = req.files[req.body.field].path;
    target = path.normalize(req.body.filepath);

    console.log('=>', target)

    poster.dest(source, target, (err) => {
        err ?
            res.status(403).send(err.message):
            res.send(target)
    })
})
```

```js
req.files = {
    files: {
        fieldName: 'custom_file',
        originalFilename: '1.png',
        path: '/var/folders/wv/f11wc52113lfnqrnp0pEv8_m0000gn/T/lFs43x3i0saqM2FEriU5VS7v.png',
        headers: { 'content-disposition': 'form-data; name="custom_file"; filename="1.png"',
        'content-type': 'image/png' },
        size: 67092,
        name: '1.png',
        type: 'image/png'
    }
}
```
