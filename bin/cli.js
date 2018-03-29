#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const log = require('../lib/log');

const _ = require('lodash');
const ArgumentParser = require('argparse').ArgumentParser;

const packageConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));

// http://nodeca.github.io/argparse/#HelpFormatter.prototype.addArgument
const cliParser = new ArgumentParser({
    version: packageConfig.version,
    addHelp:true,
    description: 'my-npm-pub cli example'
});

cliParser.addArgument(['-c', '--config'], {
    help: 'Verdaccio configuration file path'
});

cliParser.addArgument(['--packages'], {
    required: false,
    nargs: '+',
    help: 'Installed each packages.'
});

cliParser.addArgument(['-f', '--force'], {
    required: false,
    defaultValue: false,
    help: 'Force the installation of the package.'
});

const args = cliParser.parseArgs();

// verdaccio config.yaml file path
const config = args.c || args.config;

// 개별 패키지명
const packages = args.packages;

// 패키지 설치 강제 여부
const force = args.f || args.force;

if (_.isEmpty(config)) log.fatal('not found config argument');

// publish 시작
new (require('../index.js'))({config: config, packages: packages, force: force}).publish();