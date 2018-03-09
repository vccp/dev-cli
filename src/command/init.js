var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var request = require('request');
if (process.cwd().indexOf('dev-cli') >= 0) return;
const simpleGit = require('simple-git')(process.cwd());
var ncp = require('ncp').ncp;
const { exec } = require('child_process');

var Command = {
  CONFIG: "https://raw.githubusercontent.com/vccp/vccp-cli-config/master/vccp-cli-config.json",
  GIST_LINK: "https://github.com/vccp/vccp-cli-config/blob/master/vccp-cli-config.json",
  GITHUB_LINK: "https://github.com/vccp/vccp-cli",
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
      this.Logger.ok('starting to install ' + this.boilerplateName +  ' boilerplate');
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
      this.Logger.warn('cannot find this boilerplate. Please check the following file to see the available boilerplates: \n' + this.GIST_LINK);
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
    }else{
    	this.Logger.ok('done!');
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