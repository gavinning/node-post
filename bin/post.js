#!/usr/bin/env node
var fs = require('fs-extra');
var path = require('path');
var glob = require('glob');
var is = require('aimee-is');
var commander = require('commander');
var post = require(path.join(__dirname, '../app'));
var pkg = fs.readJsonSync(path.join(__dirname, '../package.json'));

commander
    .option('-v, --version', 'output the version number', () => console.log(pkg.version))

commander
    .command('ls')
    .alias('list')
    .description('list all the config')
    .action((name) =>{
        if(name === 'config'){
            console.log('')
            console.log(post.config.get())
            console.log('')
        }
        else{
            console.log('')
            console.log(post.getList().join('\n'))
            console.log('')
        }
    })

commander
    .command('use <name|index>')
    .description('change config')
    .action((name) =>{
        if(is.string(name)){
            return post.select(name)
        }
        return commander.outputHelp()
    })

commander
    .command('add <name> <url>')
    .description('add one custom config')
    .action((name, url) =>{
        if(is.string(name) && is.string(url)){
            return post.add(name, url)
        }
    })

commander
    .command('rm <name|index>')
    .alias('del')
    .description('delete one custom config')
    .action((name) => {
        if(is.string(name)){
            return post.del(name)
        }
        commander.outputHelp()
    })

commander
    .command('help')
    .description('output usage information')
    .action(() => {
        return commander.outputHelp();

    })

commander
    .command('*')
    .description('upload file')
    .action(function(){
        var files;
        files = Array.from(arguments);
        files.pop();
        post.get(files).post()
    })

commander.parse(process.argv);

if(process.argv.length === 2){
    return commander.outputHelp();
}
