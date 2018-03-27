
# mynpm-pub

`mynpm-pub` is a library that installs all dependent packages required by the project on the [verdaccio](http://www.verdaccio.org/docs/en/configuration.html) private NPM server.


## Install `verdaccio`

```
npm i -g verdaccio
```

## `verdaccio` configuration

[What is Verdaccio?](http://www.verdaccio.org/docs/en/what-is-verdaccio.html) / [verdaccio configuration](http://www.verdaccio.org/docs/en/configuration.html)

## Required `verdaccio` configuration

```
# package storage(absolute path)
storage: /path/to/storage
...

# publish the registry url
uplinks:
  npmjs:
    # public server url
    url: https://registry.npmjs.org
  # **************************************************
  # **************************************************
  # You must have mynpmpub.url attributes.
  # **************************************************
  # **************************************************
  mynpmpub:
    # private npm server url
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

Install package:

```
npm i mynpm-pub
```

Example:
```
const MyNPMPub = require('mynpm-pub');

new MyNPMPub({config: 'path/to/config.yaml', force: false}).start();
```

## Use with CLI

Install package on global location:

```
npm i -g mynpm-pub
```

Default command:

```
mynpm-pub --config /path/to/config.yaml
```

### CLI Arguments

```
usage: mynpm-pub [-h] [-v] [-c CONFIG] [-f FORCE]

mynpm-pub cli example

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
mynpm-pub --config /path/to/config.yaml --force true
```




