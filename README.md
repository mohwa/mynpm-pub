
# mynpm-pub

`mynpm-pub` is a library that installs all dependent packages required by the project on the [verdaccio](http://www.verdaccio.org/docs/en/configuration.html) private NPM server.

## Install

> `verdaccio` is installed in global location when is this package install.

```bash
npm i -g mynpm-pub
```

## `verdaccio` configuration

[What is Verdaccio?](http://www.verdaccio.org/docs/en/what-is-verdaccio.html) / [verdaccio configuration](http://www.verdaccio.org/docs/en/configuration.html)

## Required configuration

```
# package storage
storage: ./storage
...

# publish the registry url
uplinks:
  # **************************************************
  # You must have npmjs.url and mynpmpub.url attributes.
  # **************************************************
  npmjs:
    # public server uri
    url: https://registry.npmjs.org

  mynpmpub:
    # verdaccio server uri
    url: http://127.0.0.1:4873

# set proxy
packages:
  '@*/*':
	...
    proxy: mynpmpub
  '**':
    ...
    proxy: mynpmpub
...
```

## Use with node.js

```
const MyNPMPub = require('mynpm-pub');

new MyNPMPub({config: 'path/to/config.yaml', force: false}).start();
```

## Use with CLI

```
mynpm-pub --config /path/to/config.yaml
```

### CLI Arguments

```
usage: mynpm-pub [-h] [-v] [-c CONFIG] [-f FORCE]

mynpm cli example

Optional arguments:
  ...
  -c CONFIG, --config CONFIG
                        verdaccio configuration file path
  -f FORCE, --force FORCE
                        Force the installation of the package.
```

## ClI Example

```
# default
mynpm-pub --config /path/to/config.yaml

# publish to force
mynpm-pub --config /path/to/config.yaml --force
```




