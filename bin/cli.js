#!/usr/bin/env node

const _ = require('lodash');
const yargs = require('yargs');
const argv = yargs.argv;

const config = argv.config;
const force = argv.force ? true : false;

if (_.isEmpty(config)) throw new Error('not found config argument');

new (require('../index.js'))({config: config, force: force}).start();