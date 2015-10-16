﻿(function () {
  'use strict';

  angular.module('blockChain.transaction', ['blockChain.bitcoin'])
    .controller('TransactionCtrl', ['$routeParams', 'bitcoinService', function ($routeParams, bitcoinService) {
      var self = this;
      self.blockHash = $routeParams.blockHash;
      self.txHash = $routeParams.txHash;
      self.nodes = [];
      self.links = [];

      function createDict() {
        // prevent outside access to this dictionary
        var txDict = {};
        return {
          add: function (txHash, tx, id) {
            txDict[txHash] = { id: id, tx: tx };
          },
          get: function (txHash) {
            return txDict[txHash];
          }
        };
      }

      var dict = createDict();

      function initialise() {
        bitcoinService.fetchTransaction(self.txHash)
          .then(function (tx) {
            var rootNode = { txHash: self.txHash, expanded: false, root: true };
            self.nodes.push(rootNode);
            dict.add(self.txHash, tx, 0);
            expandTransaction(self.txHash);
            rootNode.expanded = true;
          });
      }

      function addNode(node, source, target) {
        self.nodes.push(node);
        self.links.push({ source: source, target: target });
      }

      function addTx(txHash, parentId) {
        bitcoinService.fetchTransaction(txHash)
          .then(function (tx) {
            var myId = id();
            var newNode = { txHash: tx.txid, expanded: false, root: false };

            dict.add(txHash, tx, myId);

            addNode(newNode, parentId, myId);
          });
      }

      function expandTransaction(txHash) {
        var parent = dict.get(txHash);
        var txs = parent.tx.vin;
        for (var i = 0, max = txs.length; i < max; i += 1) {
          addTx(txs[i].txid, parent.id);
        }
      }

      self.expand = function (node) {
        if (!node.expanded) {
          expandTransaction(node.txHash);
          node.expanded = true;
        }
      };

      self.expandLayer = function () {
        var tempNodes = self.nodes;
        tempNodes.forEach(function (node) {
          if (!node.expanded) {
            self.expand(node);
          }
        });
      };

      self.nodeCount = function () {
        return self.nodes.length;
      };

      function id() {
        return self.nodes.length;
      }

      initialise();
    }]);
}());
