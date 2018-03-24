#!/usr/bin/env node

const yargs = require('yargs');
const argv = yargs.argv;

const configPath = argv.configPath;
console.log(configPath);

const NPNS = require('../index');

console.log(NPNS);

new NPNS({configPath: configPath});