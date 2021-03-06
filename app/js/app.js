(function (angular, undefined) {
    'use strict';
    /**
     * create application snorql and load dependencies
     */
    var app = angular.module('snorql', [
        'ngRoute',
        'ngResource',
        'npHelp',
        'ui.codemirror',
        'snorql.config',
        'snorql.service',
        'snorql.ui',
        'snorql.version',
        'snorql.tracker',
        'app.release.info',
        'snorql.user',  // user
        'auth0',        // authorization (auth0)
        'angular-jwt',  // token
        'ipCookie'      // cookie
    ]);

    app.controller('SnorqlCtrl', SnorqlCtrl)
        .factory('errorInterceptor', errorInterceptor)
        .config(appConfig)
        .run(appRun);


// init app
    appRun.$inject = ['gitHubContent', 'config']
    function appRun(gitHubContent, config) {
        gitHubContent.initialize({
            // baseUrl:"http://uat-web2:8080",
            //helpPath: config.apiUrl + '/assets/rdfhelp.json',
            helpPath: config.apiUrl + '/rdf/help/type/all.json',
            helpTitle: 'Generalities',
            root: 'help', // specify the root of RDF entity routes
            githubRepo: '/',
            githubApi: config.apiUrl,
            githubEditPage: "https://github.com/calipho-sib/nextprot-docs/edit/master/",
            githubToken: null
        });
    };

//
// implement controller SnorqlCtrl
    SnorqlCtrl.$inject = ['Tracker', '$scope', '$routeParams', '$timeout', '$window', '$location', 'snorql', 'config', 'gitHubContent', 'user', 'sparqlPrefixService']
    function SnorqlCtrl(Tracker, $scope, $routeParams, $timeout, $window, $location, snorql, config, gitHubContent, user, sparqlPrefixService) {
        // user
        $scope.user = user;

        //
        // go home link
        $scope.home = config.home;
        $scope.pushState = config.pushState;

        //
        // snorql service provide examples, examples tags, config and executeQuery
        $scope.snorql = snorql;

        //
        // setup default output
        $scope.outputs = ['html', 'json', 'csv', 'xml'];
        $scope.output = 'html';
        $scope.showPrefixes = false;

        //
        // default message
        $scope.message = "Executing query ...";

        $scope.waiting = false;
        $scope.filter = ""
        $scope.filterTag = null;

        // codemirror option
        $scope.cmOption = {
            lineNumbers: false,
            indentWithTabs: true,
            uiRefresh: true,
            mode: 'sparql'
        };

        $scope.$on('$routeChangeSuccess', function (event, next, current) {
            Tracker.trackPageView();
            Tracker.trackRouteChangeEvent();
        });

        // vocabulary query
        var vocSparqlQuery = 'SELECT DISTINCT * WHERE { ?term rdfs:label ?label ; a ?type . filter(regex(?label,"^__CV__","i")) } LIMIT 30';
        $scope.searchTerm = function (term) {

            var time = Date.now();
            $scope.executionTime = false;
            $scope.waiting = true;
            $scope.error = false;
            snorql.executeQuery(vocSparqlQuery.replace('__CV__', term), {output: 'html'}).$promise.then(function () {
                $scope.waiting = false;
                $scope.executionTime = (Date.now() - time) / 1000;

                Tracker.trackSearchTermEvent(term, true);
            }, function (reason) {
                $scope.error = reason.data.message;
                $scope.waiting = false;

                Tracker.trackSearchTermEvent(term, false);
            });
        }

        $scope.getPrefixes = function() {
            return sparqlPrefixService.getSparqlPrefixesArray();
        }

            $scope.routingOutside = function(input) {
            Tracker.trackTransitionRouteChangeEvent(input);
        };

        $scope.executeQuery = function (sparql, output) {
            var time = Date.now();
            $scope.executionTime = false;
            $scope.waiting = true;
            $scope.error = false;
            if(sparql.length < 6000) // We'll use GET method, show url
                $location.search('query', sparql)
            //$location.search('query', sparql) removed because urls can become too long for the referer header and cause 400 BAD request
            $location.search('class', null)
            $location.search('property', null)
            $location.search('describe', null)
            var params = angular.extend($location.search(), {output: output});
            snorql.executeQuery(sparql, params).$promise.then(function () {
                $scope.waiting = false;
                $scope.executionTime = (Date.now() - time) / 1000;
            }
            , function (reason) {
                //alert(reason.data.message);
               $scope.error = reason.data.message
                $scope.waiting = false
            });
        };

        $scope.selectExample = function (elm) {
            snorql.query = snorql.examples[elm].sparql;
            snorql.description = snorql.examples[elm].description;
            snorql.selectedQueryId = snorql.examples[elm].userQueryId;
            snorql.queryTitle = snorql.examples[elm].title;
            $scope.qSelected = elm
            $('.row-offcanvas').removeClass('active')

            Tracker.trackSelectExampleEvent(snorql.examples[elm].publicId);
        };

        $scope.setFilterTag = function (tag) {
            $scope.filterTag = tag;
        };

        $scope.resetFilters = function () {
            $scope.filterTag = null;
        };

        $scope.reset = function () {
            snorql.reset();
        };

        $scope.login = function () {
            user.login();
        };

        $scope.logout = function () {
            user.logout();
        };

        // Have a keystroke handling function
         $(document).keydown(function(event) {
            //alert(event.which);
             if (event.which === 112) // bind copyresults to F1
              snorql.copyResults(snorql.result.results.bindings);
             else if (event.which === 113) {// bind create values to F2
               snorql.createEntryValues();
            }
        });
        
        // load sparql examples
        snorql.loadExamples()

        //
        // kind of queries,
        // query, describe, class, property
        snorql.updateQuery($location.search())
        // $scope.executeQuery(snorql.updateQuery($location.search()));
        $scope.$on('$locationChangeSuccess', function (url) {
            snorql.updateQuery($location.search())

            if ($location.path() === '/') {
                $window.document.title = "neXtProt SnorQL";
            }

        })
    };


    /**
     * ANGULAR BOOTSTRAP
     */
    appConfig.$inject = ['$routeProvider', '$locationProvider', '$httpProvider', 'authProvider', 'jwtInterceptorProvider']
    function appConfig($routeProvider, $locationProvider, $httpProvider, authProvider, jwtInterceptorProvider) {

        authProvider.init({
            clientID: '7vS32LzPoIR1Y0JKahOvUCgGbn94AcFW',
            callbackURL: window.location.origin,
            domain: 'nextprot.auth0.com',
            icon: '/img/np.png'
        });

        jwtInterceptorProvider.tokenGetter = ['ipCookie', function (ipCookie) {
            // Return the saved token
            return ipCookie('nxtoken');
        }];
        $httpProvider.interceptors.push('jwtInterceptor');

        // intercept errors
        $httpProvider.interceptors.push('errorInterceptor')


        // List of routes of the application
        $routeProvider
            // Home page
            .when('/', {title: 'welcome to snorql', templateUrl: '/partials/home.html'})
            // Pages (in nextprot-docs/pages): about, copyright...
            .when('/:article', {title: 'page', templateUrl: '/partials/page.html'})
            //// Help pages
            // GENERALITIES
            .when('/help/doc/:article', {title: 'help for snorql', templateUrl: '/partials/doc.html'})
            // RDF ENTITIES
            .when('/help/entity/:entity', {title: 'help for snorql', templateUrl: '/partials/help.html'})

        // Without serve side support html5 must be disabled.
        $locationProvider.html5Mode(true);
        //$locationProvider.hashPrefix = '!';
    };

    errorInterceptor.$inject = ['$q', '$rootScope', '$location']
    function errorInterceptor($q, $rootScope, $location) {
        return {
            request: function (config) {
                return config || $q.when(config);
            },
            requestError: function (request) {
                return $q.reject(request);
            },
            response: function (response) {
                return response || $q.when(response);
            },
            responseError: function (response) {
                if (response && response.status === 0) {
                    $rootScope.error = "The API is not accessible";
                }
                if (response && response.status === 401) {
                    $rootScope.error = "You are not authorized to access the resource. Please login or review your privileges.";
                }
                if (response && response.status === 404) {
                    $rootScope.error = "URL not found";
                }
                if (response && response.status >= 500) {
                    $rootScope.error = "Request Failed";
                }
                return $q.reject(response);
            }
        };
    };


})(angular);
