
# makeup-private-npm-server

`makeup-private-npm-server` is a library that installs all dependent packages required by the project on the [verdaccio](http://www.verdaccio.org/docs/en/configuration.html) private NPM server.

## Install

> `verdaccio` is installed in global location when is this package install.

```bash
npm i -g makeup-private-npm-server
```

## `verdaccio` configuration

[What is Verdaccio?](http://www.verdaccio.org/docs/en/what-is-verdaccio.html) / [verdaccio configuration](http://www.verdaccio.org/docs/en/configuration.html)

## Required configuration

```
# package storage
storage: ./storage
...

# publish The registry url
uplinks:
  npmjs:
    url: https://registry.npmjs.org

# set proxy
packages:
  '@*/*':
	...
    proxy: http://127.0.0.1:4873
  '**':
    ...
    proxy: http://127.0.0.1:4873
...

# server host and port
listen:
	- 127.0.0.1:4873
```

## Use with node.js

```
const MPNS = require('makeup-private-npm-server');

new MPNS({config: 'path/to/config.yaml', force: false}).start();
```

## Use with CLI

```
mpns --config /Users/sgjeon/.config/verdaccio/config.yaml
```

### CLI Arguments

```
usage: mpns [-h] [-v] [-c CONFIG] [-f FORCE]

MPNS CLI

Optional arguments:
  ...
  -c CONFIG, --config CONFIG
                        verdaccio configuration file path
  -f FORCE, --force FORCE
                        Force the installation of the package.
```





