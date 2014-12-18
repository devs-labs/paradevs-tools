Requirements
------------

You need [Node.js](http://nodejs.org/download/).

Installation
------------

```bash
$ git clone git@github.com:devs-labs/paradevs-tools.git && cd ./paradevs-tools
$ npm install
```

For VLE plugin, first, install vle software (version 1.2) and compile wrapper:

```bash
$ cd translators/vle/pdevs/wrapper
$ node-gyp configure build
```


Execution
---------

```bash
$ node generator.js example/pdevs/example.project
```