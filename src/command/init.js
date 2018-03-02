var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var request = require('request');
if (process.cwd().indexOf('dev-cli') >= 0) return;
const simpleGit = require('simple-git')(process.cwd());
var ncp = require('ncp').ncp;
const { exec } = require('child_process');

var Command = {
  CONFIG: "https://gist.githubusercontent.com/fahimc/8ddd9c2741d436758be61423713510d8/raw/71092cde1a4fd9af8c7b89a18403047e61ba7a2a/dev-cli-config.json",
  GIST_LINK: "https://gist.github.com/fahimc/8ddd9c2741d436758be61423713510d8",
  GITHUB_LINK: "https://github.com/fahimc/dev-cli",
  Logger: require('../logger.js'),
  argsLength: 3,
  boilerplateName: null,
  config: null,
  init: function(args) {
    this.getTask(args);
  },
  getTask: function(args) {
    if (args.length - 1 == this.argsLength) {
      var arg = args[this.argsLength];
      this.boilerplateName = arg;
      this.getConfig();
    }else{
    	this.Logger.warn('please supply the boilerplate you wish to install. Check out the readme:\n'+ this.GITHUB_LINK);
    }
  },
  getConfig: function() {
  	this.Logger.warn('getting boilerplate file','');
    request(Command.CONFIG, this.onRequest.bind(this));
  },
  onRequest: function(error, response, body) {
    if (error) {
    	console.error('error:', error); // Print the error if one occurred
    	return;
    }
    this.Logger.ok('boilerplate file obtained');
    this.config = JSON.parse(body);
    this.getRepo();
  },
  getRepo: function() {
    var boilerplate = this.config.boilerplates[this.boilerplateName];
    if (boilerplate) {
      this.Logger.warn('cloning repo','','');
      simpleGit.clone(boilerplate.repoLink, 'temp', this.onGitCloneComplete.bind(this));

    } else {
      this.Logger.warn('cannot find this boilerplate. Please check the following file to see the available boilerplates: \nhttps://gist.github.com/fahimc/8ddd9c2741d436758be61423713510d8');
    }

  },
  onGitCloneComplete: function() {
    this.Logger.ok('clone complete');
    this.deleteFolderRecursive('temp/.git');
    ncp('temp', '.', this.copyComplete.bind(this));
  },
  copyComplete: function(err) {
    if (err) {
      return console.error(err);
    }
    this.deleteFolderRecursive('temp/');
    this.install();
  },
  install: function() {
    var boilerplate = this.config.boilerplates[this.boilerplateName];
    if (boilerplate.install) {
      this.Logger.warn('running install command...','');
      var spawn = exec(boilerplate.install, { cwd: process.cwd() }, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(stdout);
      });
      spawn.on('close', (code) => {
         this.Logger.ok('done!');
      });
    }
  },
  deleteFolderRecursive: function(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function(file, index) {
        var curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          Command.deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }

}

module.exports = Command.init.bind(Command);