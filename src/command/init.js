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
      console.log('argument:', arg);
      this.boilerplateName = arg;
      this.getConfig();
    }
  },
  getConfig: function() {
    request(Command.CONFIG, this.onRequest.bind(this));
  },
  onRequest: function(error, response, body) {
    if (error) console.log('error:', error); // Print the error if one occurred
    this.config = JSON.parse(body);
    this.getRepo();
  },
  getRepo: function() {
    var boilerplate = this.config.boilerplates[this.boilerplateName];
    if (boilerplate) {
      simpleGit.clone(boilerplate.repoLink, 'temp', this.onGitCloneComplete.bind(this));

    } else {
      Logger.warn('cannot find this boilerplate');
    }

  },
  onGitCloneComplete: function() {
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
      Logger.ok('installing...');
      exec(boilerplate.install, { cwd: process.cwd() }, (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(stdout);
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