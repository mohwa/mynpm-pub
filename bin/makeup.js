#!/usr/bin/env node

const yargs = require('yargs');
const argv = yargs.argv;

const configPath = argv.configPath;
console.log(configPath);

const MakeUpPrivateNPMServer = require('../index');

console.log(MakeUpPrivateNPMServer);

new MakeUpPrivateNPMServer({configPath: configPath});