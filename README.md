## angular-snorql
A sparql explorer ultra simple based on the original idea of [SNORQL](https://github.com/kurtjx/SNORQL):

[AngularJS](http://angularjs.org) + [Brunch](http://brunch.io) + [Bootstrap](http://twitter.github.com/bootstrap/)

The purpose of this project is to develop a new version of the original [SNORQL](https://github.com/kurtjx/SNORQL) interface that use the latest web standards for javascript and CSS. Live site http://calipho-sib.github.io/nextprot-snorql

## Installation
```
$ npm install
$ node_modules/.bin/bower install


## later on when a dependency has changed

$ node_modules/.bin/bower update

```
## Usage
```
$ node app
```

##Sparql config: add your own SPARQL endpoint and examples
You can provide SPARQL examples to the user interface by editing file [queries.json](app/assets/queries.json).
You can also set your own sparql endpoint by setting the variables (*namespacePrefixes* and *sparqlEndpoint*) in the file  [app.js](app/js/app.factory.js)

### deploy compiled application on github pages
```
#
# change your project base directory in the script
sh build-gh-pages.sh [/base/ (default angular-snorql)] [remote (default origin)]
```

### minimize the project for production
```
$ ./node_modules/.bin/brunch build -m
```


Enjoy SPARQLing
