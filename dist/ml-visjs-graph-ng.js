(function () {
  'use strict';
  
  angular.module('ml.visjsGraph', [
    'ngVis',
    'ui.bootstrap'
  ]);

})();

(function () {

  'use strict';

  angular.module('ml.visjsGraph')
    .provider('visjsGraphService', VisjsGraphService);

  function VisjsGraphService() {
        var api = '/v1/resources';
        this.setApi = function(url) {
          api = url;
        };

        this.$get = function($http) {
          var service = {
            search: search,
            expand: expand,
            // merge: merge,
            // addLinks: addLinks,
            // addTriple: addTriple

          };

          function search(ids) {
            return $http.get(api+'/visjs?rs:subject=' + encodeURIComponent(ids[0]))
            .then(
              function(response) {
                return response.data;
              }
            );
          }

          function expand(ids) {
            return $http.get(
              api+'/visjs?rs:expand=true&rs:subject=' + encodeURIComponent(ids[0]))
            .then(
              function (response) {
                return response.data;
              });
          }

          // function merge(primaryId, secondaryId) {
          //   return $http.post(api+'/merge?rs:primaryId=' + primaryId + '&rs:secondaryId=' + secondaryId);
          // }

          // function addLinks(linkData) {
          //   return $http.post(api+'/link', linkData);
          // }

          // function addTriple(triple) {
          //   return $http.post(api+'/visjs', triple);
          // }

          return service;
        };
  }
})();

(function () {

  'use strict';

  angular.module('ml.visjsGraph')
  .directive('mlVisjsGraph', VisjsGraphDirective);

  VisjsGraphDirective.$inject = ['visjsGraphService'];

  function VisjsGraphDirective(visjsGraphService) {
    return {
      restrict: 'E',
      scope: {
        uris: '=',
        graphSearch: '=?',
        graphExpand: '=?',
        physics: '=?',
        layout: '=?',
        customGraphOptions: '=?graphOptions',
        customGraphEvents: '=?graphEvents'
      },
      templateUrl: '/visjs-graph/visjs-graph.html',
      controller: 'visjsGraphCtrl',
      controllerAs: 'ctrl',
      link: function($scope, element, attrs) {
        if (!attrs.graphSearch) {
          $scope.graphSearch = visjsGraphService.search;
        }

        if (!attrs.graphExpand) {
          $scope.graphExpand = visjsGraphService.expand;
        }

        if (!attrs.physics) {
          $scope.physicsEnabled = true;
          $scope.physics = 'forceAtlas2Based';
        } else if (attrs.physics === 'false') {
          $scope.physicsEnabled = false;
          $scope.physics = 'forceAtlas2Based';
        } else {
          $scope.physicsEnabled = true;
          $scope.userDefinedPhysics = true;
        }

        if (!attrs.layout) {
          $scope.layout = 'standard';
        }
      }
    };
  }

})();

(function () {

  'use strict';

  angular.module('ml.visjsGraph')
    .controller('visjsGraphCtrl', visjsGraphCtrl);

  visjsGraphCtrl.$inject = ['$scope', '$location', 'VisDataSet'];

  function visjsGraphCtrl($scope, $location, VisDataSet) {
    var ctrl = this;

    var nodes = new VisDataSet([]);
    var edges = new VisDataSet([]);
    ctrl.graphData = {
      nodes: nodes,
      edges: edges
    };

    ctrl.graphOptions = {
      layout: {
        hierarchical: false,
        randomSeed: 2
      },
      interaction: {
        navigationButtons: true
      },
      height: '500px',
      groups: {
        'http://xmlns.com/foaf/0.1/Person': {
          image: 'bower_components/ml-visjs-graph-ng/dist/images/person.png'
        }
      },
      nodes: {
        size: 30,
        borderWidth: 2,
        shadow: true,
        borderWidthSelected: 6,
        shape: 'circularImage',
        image: 'bower_components/ml-visjs-graph-ng/dist/images/generic.png',
        color: {
          background: 'white',
        },
        font: {
          size: 12
        },
      },
      physics: {
        enabled: false,

        // OBI default
        // barnesHut: {
        //   gravitationalConstant : -8000,
        //   centralGravity: 0.5,
        //   springLength: 150,
        //   springConstant: 0.04,
        //   damping: 1.0,
        //   avoidOverlap: 0
        // },
        // GJo tweaks
        barnesHut: {
          gravitationalConstant : -8000,
          centralGravity: 0.1,
          springLength: 200,
          springConstant: 0.04,
          damping: 0.5,
          avoidOverlap: 0
        },

        // built-in default
        // forceAtlas2Based: {
        //   gravitationalConstant: -50,
        //   centralGravity: 0.01,
        //   springLength: 100,
        //   springConstant: 0.08,
        //   damping: 0.4,
        //   avoidOverlap: 0
        // },
        // GJo tweaks
        forceAtlas2Based: {
          gravitationalConstant: -200,
          centralGravity: 0.01,
          springLength: 100,
          springConstant: 0.08,
          damping: 0.4,
          avoidOverlap: 0
        },

        // built-in default
        // repulsion: {
        //   centralGravity: 0.2,
        //   springLength: 200,
        //   springConstant: 0.05,
        //   nodeDistance: 100,
        //   damping: 0.09
        // },
        // GJo tweaks
        repulsion: {
          centralGravity: 0.1,
          springLength: 200,
          springConstant: 0.05,
          nodeDistance: 200,
          damping: 0.09
        },
        hierarchicalRepulsion: {
          centralGravity: 0.0,
          springLength: 100,
          springConstant: 0.01,
          nodeDistance: 120,
          damping: 0.09
        },
        maxVelocity: 150, // default 50
        minVelocity: 6, // default 0.1
        stabilization: {
          enabled: true,
          iterations: 1000,
          updateInterval: 100,
          onlyDynamicEdges: false,
          fit: true
        },
        timestep: 0.5,
        adaptiveTimestep: true
      },
      edges: {
        width: 2,
        shadow: true,
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.75
          }
        },
        font: {
          size: 10,
          align: 'top'
        },
        smooth: {
          type: 'curvedCW',
          roundness: 0.1
        }
      }
    };

    ctrl.graphEvents = {
      onload: function(network) {
        $scope.network = network;
      },
      stabilized: function() {
        $scope.network.fit();
      },
      // Right-click for a redirect to the detail page for a node
      oncontext: function(params) {
        var coordinates = params.pointer.DOM;
        var targetNode = $scope.network.getNodeAt(coordinates);
        if (targetNode) {
          $location.path('/detail' + targetNode);
          $scope.$apply();
        }
        return params.event.preventDefault();
      },
      doubleClick: function(params) {
        var nodeUri = params.nodes[0];
        $scope.graphExpand([nodeUri]).then(ctrl.updateGraph);
      },
      afterDrawing: function(ctx) {
        var nodePositions = $scope.network.getPositions();
        nodes.forEach(function(node) {
          var nodePosition = nodePositions[node.id];

          // Backwards compatibility
          if (node.linkCount) {
            node.edgeCount = node.linkCount;
          }

          if (node.edgeCount && node.edgeCount > 0) {
            var radius;
            if (node.edgeCount >= 100 && node.edgeCount < 1000) {
              radius = 15;
            }
            else if (node.edgeCount >= 1000) {
              radius = 20;
            }
            else {
              radius = 10;
            }

            ctx.strokeStyle = 'white';
            ctx.fillStyle = '#848484';
            ctx.lineWidth = 1;
            ctx.circle(nodePosition.x - 20, nodePosition.y - 20, radius);
            ctx.fill();
            ctx.stroke();

            // Text info
            ctx.font = '8pt Lucida';
            ctx.strokeText(node.edgeCount, nodePosition.x - 20, nodePosition.y - 24);
          }
        });
      }
    };

    ctrl.physicsUpdated = function() {
      if($scope.network) {
        $scope.network.setOptions({ physics: {
          enabled: $scope.physicsEnabled,
          solver: $scope.physics
        }});
        $scope.network.stabilize();
      }
    };

    ctrl.layoutUpdated = function() {
      var options = {
        edges: {
          smooth: {
            type: 'curvedCW',
            roundness: 0.1
          }
        }
      };
      if ($scope.layout === 'standard') {
        if ($scope.physics === 'hierarchicalRepulsion') {
          $scope.physics = 'forceAtlas2Based';
        }
        options.layout = {
          hierarchical: false
        };
      }
      else if ($scope.layout === 'hierarchyTop') {
        $scope.physics = 'hierarchicalRepulsion';
        options.layout = {
          hierarchical: {
            direction: 'UD',
            sortMethod: 'directed'
          }
        };
      }
      else if ($scope.layout === 'hierarchyBottom') {
        $scope.physics = 'hierarchicalRepulsion';
        options.layout = {
          hierarchical: {
            direction: 'DU',
            sortMethod: 'directed'
          }
        };
      }
      else if ($scope.layout === 'hierarchyLeft') {
        $scope.physics = 'hierarchicalRepulsion';
        options.layout = {
          hierarchical: {
            direction: 'LR',
            sortMethod: 'directed'
          }
        };
      }
      else if ($scope.layout === 'hierarchyRight') {
        $scope.physics = 'hierarchicalRepulsion';
        options.layout = {
          hierarchical: {
            direction: 'RL',
            sortMethod: 'directed'
          }
        };
      }

      var physicsOptions = {
        physics: {
          enabled: $scope.physicsEnabled,
          solver: $scope.physics
        }
      };

      // Set options for layout
      if ($scope.network) {
        $scope.network.setOptions(options);
        $scope.network.stabilize();
      }

      //
      // Set options for physics
      //
      // NOTE:  Needed second call to <setOptions> because the physics
      //        settings were being overwritten based on layout setting.
      //
      if ($scope.network) {
        $scope.network.setOptions(physicsOptions);
      }
    };

    function init() {
      if ($scope.items.nodes[0] && $scope.items.nodes[0].label) {
        ctrl.label = $scope.items.nodes[0].label;
      } else {
        ctrl.label = 'this node';
      }

      ctrl.refreshGraph();
      ctrl.physicsUpdated();
      ctrl.layoutUpdated();
    }

    $scope.$watch('graphSearch', function(newValue, oldValue) {
      $scope.graphSearch($scope.uris).then(function(items) {
        $scope.items = items;
        init();
      });
    });

    $scope.$watch('customGraphOptions', function(newValue, oldValue) {
      angular.merge(ctrl.graphOptions, newValue);
      if ($scope.network) {
        $scope.network.setOptions(newValue);
      }
    });

    $scope.$watch('customGraphEvents', function(newValue, oldValue) {
      angular.extend(ctrl.graphEvents, newValue);
    });

    $scope.$watch('physicsEnabled', function(newValue, oldValue) {
      ctrl.physicsUpdated();
    });

    $scope.$watch('physics', function(newValue, oldValue) {
      ctrl.physicsUpdated();
    });

    $scope.$watch('layout', function(newValue, oldValue) {
      ctrl.layoutUpdated();
    });

    ctrl.getNode = function(nodeId) {
      return nodes.get(nodeId);
    };

    ctrl.updateGraph = function(data) {
      $scope.items = data;
      ctrl.refreshGraph();
    };

    ctrl.refreshGraph = function() {
      if ($scope.items) {
        nodes.update($scope.items.nodes);
        // allow 'links' instead of 'edges' for backwards compatibility
        // with the visjs-graph mlpm  library
        if ($scope.items.edges) {
          edges.update($scope.items.edges);
        } else if ($scope.items.links) {
          edges.update($scope.items.links);
        }
      }
    };

  }

})();
