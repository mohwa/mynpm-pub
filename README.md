
# my-npm

`my-npm` is a library that installs all dependent packages required by the project on the [verdaccio](http://www.verdaccio.org/docs/en/configuration.html) private NPM server.

## Install

> `verdaccio` is installed in global location when is this package install.

```bash
npm i -g my-npm
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
  # **************************************************
  # You must have npmjs.url and mynpm.url attributes.
  # **************************************************
  npmjs:
    # public server uri
    url: https://registry.npmjs.org

  mynpm:
    # verdaccio server uri
    url: http://127.0.0.1:4873

# set proxy
packages:
  '@*/*':
	...
    proxy: mynpm
  '**':
    ...
    proxy: mynpm
...
```

## Use with node.js

```
const MyNPM = require('my-npm');

new MyNPM({config: 'path/to/config.yaml', force: false}).start();
```

## Use with CLI

```
mynpm --config /Users/sgjeon/.config/verdaccio/config.yaml
```

### CLI Arguments

```
usage: mynpm [-h] [-v] [-c CONFIG] [-f FORCE]

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
mynpm --config /Users/sgjeon/.config/verdaccio/config.yaml

# publish to force
mynpm --config /Users/sgjeon/.config/verdaccio/config.yaml --force
```




