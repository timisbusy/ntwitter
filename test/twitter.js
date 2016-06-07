'use strict';

var assert = require('assert');
var nock = require('nock');
var Twitter = require('../lib/twitter');
var VERSION = require('../package.json').version;

describe('Twitter', function() {

  describe('Constructor', function() {

    describe('new Twitter();', function() {

      var defaults = {};

      before(function() {
        defaults = {
          consumer_key: null,
          consumer_secret: null,
          access_token_key: null,
          access_token_secret: null,
          bearer_token: null,
          rest_base: 'https://api.twitter.com/1.1',
          stream_base: 'https://stream.twitter.com/1.1',
          user_stream_base: 'https://userstream.twitter.com/1.1',
          site_stream_base: 'https://sitestream.twitter.com/1.1',
          media_base: 'https://upload.twitter.com/1.1',
          request_options: {
            headers: {
              'Accept': '*/*',
              'Connection': 'close',
              'User-Agent': 'node-twitter/' + VERSION
            }
          }
        };
      });

      it('create new instance', function() {
        var client = new Twitter();
        assert(client instanceof Twitter);
      });

      it('has default options', function() {
        var client = new Twitter();
        assert.equal(
          Object.keys(defaults).length,
          Object.keys(client.options).length
        );
        assert.deepEqual(
          Object.keys(defaults),
          Object.keys(client.options)
        );
      });

      it('accepts and overrides options', function() {
        var options = {
          consumer_key: 'XXXXX',
          power: 'Max',
          request_options: {
            headers: {
              'Accept': 'application/json'
            }
          }
        };

        var client = new Twitter(options);

        assert(client.options.hasOwnProperty('power'));
        assert.equal(client.options.power, options.power);

        assert.equal(client.options.consumer_key, options.consumer_key);

        assert.equal(
          client.options.request_options.headers.Accept,
          options.request_options.headers.Accept);
      });

      it('has pre-configured request object', function(next) {
        var client = new Twitter({
          request_options: {
            headers: {
              foo: 'bar'
            }
          }
        });

        assert(client.hasOwnProperty('request'));

        nock('http://node.twitter').get('/').reply(200);
        client.request.get('http://node.twitter/', function(error, response) {

          var headers = response.request.headers;

          assert(headers.hasOwnProperty('foo'));
          assert(headers.foo, 'bar');

          assert.equal(headers['User-Agent'], 'node-twitter/' + VERSION);
          assert(headers.hasOwnProperty('Authorization'));
          assert(headers.Authorization.match(/^OAuth/));

          next();
        });

      });

      //Issue https://github.com/desmondmorris/node-twitter/pull/98
      it('send good authentication data to request without bearer', function(next) {
          var client = new Twitter({
            'bearer_token':false,
            'consumer_key':'6c84cbd30cf9350a990bad2bcc1bec5f',
            'consumer_secret':'eb25d379ac9289dadbb4b57e3f6126d7',
            'access_token_key':'a78bd9b40919c2a676a464419e238477',
            'access_token_secret':'ff4a53caff3c88d04b73cd1156c1f7ac',
          });
          nock('http://node.twitter').get('/').reply(200);
          client.request.get('http://node.twitter/', function(error, response) {
            var authorizationHeader = response.request.headers.Authorization;
            assert(authorizationHeader.indexOf('oauth_consumer_key="6c84cbd30cf9350a990bad2bcc1bec5f"' >= 0));
            assert(authorizationHeader.indexOf('oauth_token="a78bd9b40919c2a676a464419e238477"' >= 0));
            assert(authorizationHeader.indexOf('oauth_signature="BVjeSxnDVDgGI2XrkrpfLwFJMmw%3D"' >= 0));
            next();
          });
      });
    });
  });

  describe('Prototypes', function() {
    describe('prototype.__buildEndpoint();', function() {
      var client;

      before(function() {
        client = new Twitter({});
      });

      it('method exists', function() {
        assert.equal(typeof client.__buildEndpoint, 'function');
      });

      it('build url', function() {
        var path = 'statuses';
        var endpoint = 'https://stream.twitter.com/1.1/statuses';

        assert.throws(
          client.__buildEndpoint,
          Error
        );

        assert.equal(
          client.__buildEndpoint(path),
          client.options.rest_base + '/' + path + '.json'
        );

        assert.equal(
          client.__buildEndpoint(path + '.json'),
          client.options.rest_base + '/' + path + '.json'
        );

        assert.equal(
          client.__buildEndpoint('/' + path),
          client.options.rest_base + '/' + path + '.json'
        );

        assert.equal(
          client.__buildEndpoint(path + '/'),
          client.options.rest_base + '/' + path + '.json'
        );

        assert.equal(
          client.__buildEndpoint(path, 'media'),
          client.options.media_base + '/' + path + '.json'
        );

        assert.equal(
          client.__buildEndpoint(endpoint),
          endpoint + '.json'
        );

        assert.equal(
          client.__buildEndpoint(endpoint),
          endpoint + '.json'
        );
      });
    });

    describe('prototype.__request();', function() {
    });

    describe('prototype.__get();', function() {
    });

    describe('prototype.__post();', function() {
    });

    describe('prototype.__stream();', function() {
    });
  });

});
