(function (angular, undefined) {'use strict';

//Define the application global configuration
angular.module('snorql.config', []).factory('config', [
    function () {

        var namespacePrefixes={
            rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
            owl: 'http://www.w3.org/2002/07/owl#',
            dc: 'http://purl.org/dc/elements/1.1/',
            dcterms: 'http://purl.org/dc/terms/',
            foaf: 'http://xmlns.com/foaf/0.1/',
            sim: 'http://purl.org/ontology/similarity/',
            mo: 'http://purl.org/ontology/mo/',
            ov: 'http://open.vocab.org/terms/',
            xsd: 'http://www.w3.org/2001/XMLSchema#',
            "": 'http://nextprot.org/rdf#',
            entry: 'http://nextprot.org/rdf/entry/',
            isoform: 'http://nextprot.org/rdf/isoform/',
            annotation: 'http://nextprot.org/rdf/annotation/',
            evidence: 'http://nextprot.org/rdf/evidence/',
            xref: 'http://nextprot.org/rdf/xref/',
            publication: 'http://nextprot.org/rdf/publication/',
            identifier: 'http://nextprot.org/rdf/identifier/',
            term: 'http://nextprot.org/rdf/terminology/',
            cv: 'http://nextprot.org/rdf/terminology/',
            gene: 'http://nextprot.org/rdf/gene/',
            source: 'http://nextprot.org/rdf/source/',
            db: 'http://nextprot.org/rdf/db/',
            context: 'http://nextprot.org/rdf/context/'
        };

        ///// TODO: fixing; we are breaking the DRY principle and it is really bad (see duplication in nextprot-ui/app/js/np.js) !!!!
        var BASE_URL = "http://localhost:8080/nextprot-api-web"
        //var BASE_URL = "http://dev-api.nextprot.org"

        //Environment that should be set from outside //TODO should replace this using GRUNT
        var nxEnvironment = "NX_ENV"; //env can be replaced, by dev, alpha or pro

        if (nxEnvironment.indexOf("NX_") == -1) // means an environment has been set, sed command has done some magic tricks
        {
            BASE_URL = 'http://' + nxEnvironment.toLowerCase() + '-api.nextprot.org';
            if (nxEnvironment.toLowerCase() === "pro") {
                BASE_URL = 'https://api.nextprot.org'; // Don't forget https!
            }
        }

        // global application configuration
        var defaultConfig = {
            environment : nxEnvironment,
            apiUrl : BASE_URL,
            // home:'https://github.com/calipho-sib/nextprot-snorql',
            home:'/',
            sparql : {
              endpoint: BASE_URL + '/sparql',
              examples: BASE_URL + '/queries/tutorial.json?snorql=true',
              // endpoint: 'http://localhost:8080/nextprot-api-web/sparql',
              // examples: 'http://localhost:8080/nextprot-api-web/demo/sparql/queries.json',
              prefixes: namespacePrefixes
          }
        }


        return defaultConfig;
    }
]);


})(angular);
