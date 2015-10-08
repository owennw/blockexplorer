(function() {
  'use strict';

  angular.module('blockChain.search', ['blockChain.bitcoin'])
    .controller('SearchCtrl', ['$http', '$q', '$routeParams', '$location', 'bitcoinService',
      function($http, $q, $routeParams, $location, bitcoinService) {
        var self = this;
        self.query = $routeParams.query;
        self.message = 'Searching...';

        function getHash() {
          if (isHash(self.query)) {
            var deferred = $q.defer();
            deferred.resolve(self.query);
            return deferred.promise;
          } else if(isHeight(self.query)) {
            return bitcoinService.fetchHash(self.query)
              .then(function(hash) {
                return hash;
              })
          } else {
            // Invalid search input
          }
        }

        this.submit = function() {
          getHash()
            .then(function(hash) {
              $location.path('/blocks/' + hash);
              self.query = '';
            });
        };

        if(self.query) {
          // Here to prevent navigating back to view dirty data
          this.submit();
        }

        function isHash(input) {
          if (input.length !== 64) {
            return false;
          }

          var match = input.match(/^[a-f0-9]{64}$/);

          if(match) {
            return true;
          } else {
            return false;
          }
        }

        function isHeight(input) {
          var match = input.match(/^[0-9]+$/);

          if(match) {
            return true;
          } else {
            return false;
          }
        }
      }]);
})();