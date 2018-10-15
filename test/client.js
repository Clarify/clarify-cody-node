'use strict';

const ClarifyCody = require('..');
const expect = require('expect.js');
const Nock = require('nock');
const Mocks = require('./mocks');


const client = new ClarifyCody.Client('foobar');

describe('Clarify Cody API tests', function() {

  describe('Client tests', function() {

    it('should be valid client', function() {
        expect(client).to.be.an('object');

        expect(function(){ ClarifyCody.Client();}).to.throwError();

        var opts = {baseUrl: 'http://example.org',
                    headers: { 'User-Agent': 'test' }};

        var obj = new ClarifyCody.Client('foobar', opts);
        expect(obj).to.be.an('object');
        expect(obj.baseUrl).to.equal(opts.baseUrl);
        // lowecased and set properly
        expect(obj.headers['user-agent'].indexOf(opts.headers['User-Agent'])).to.equal(0);
    });

    it('should list conversations', function(done) {
        Mocks.mockServer();
        client.getConversations((err, result) => {
            expect(err).to.not.be.ok();
            expect(result.total).to.equal(5);
            expect(result._links.items.length).to.equal(5);
            expect(ClarifyCody.utils.hasLink(result, 'self')).to.be.ok();
            expect(ClarifyCody.utils.hasLink(result, 'next')).to.not.be.ok();
            expect(ClarifyCody.utils.itemCount(result)).to.equal(5);
            done();
        });
    });

    it('should map conversations', function(done) {
        var convs = [];
        Mocks.mockServer();
        client.conversationMap(null, function(href, next) {
            convs.push(href);
            next();
        }, function(err, total) {
            expect(err).to.not.be.ok();
            expect(total).to.equal(5);
            expect(convs.length).to.equal(5);
            let unique = new Set(convs);
            expect(unique.size).to.equal(5);
            done();
        });
    });

    it('should map conversations multi-page', function(done) {
        var convs = [];
        Mocks.mockServer();
        client.getConversations({limit: 2}, (err, result) => {
            expect(result).limit = 2;
            client.conversationMap(result, function(href, next) {
                convs.push(href);
                next();
            }, function(err, total) {
                expect(err).to.not.be.ok();
                expect(total).to.equal(5);
                expect(convs.length).to.equal(5);
                let unique = new Set(convs);
                expect(unique.size).to.equal(5);
                done();
            });
        });
    });

    it('should map conversations with error', function(done) {
        var convs = [];
        Mocks.mockServer();
        client.conversationMap(null, function(href, next) {
            convs.push(href);
            if (convs.length == 2) {
                next(new Error('Stop map'));
            } else {
                next();
            }
        }, function(err, total) {
            expect(err).to.be.ok();
            expect(total).to.equal(2);
            expect(convs.length).to.equal(2);
            done();
        });
    });


    it('should generate request error', function(done) {
        Mocks.mockRequestError();

        client.getConversations((err, result) => {
            expect(err.message).to.equal('Request parameter validation failed');
            expect(err.content.error).to.equal('Bad Request');
            expect(err.content.code).to.equal(400);
            done();
        });
    });

    it('should get conversation', function(done) {
        Mocks.mockServer();
        client.getConversations((err, result) => {
            var href = ClarifyCody.utils.getLinkItemHref(result, 0);

            client.getConversation(href, (err, result) => {
                expect(err).to.not.be.ok();
                expect(result.conversation_id).to.be.ok();
                expect(result._links.self.href).to.equal(href);
                done();
            });
        });
    });

    it('should get conversation with embed', function(done) {
        Mocks.mockServer();
        client.getConversations((err, result) => {
            var href = ClarifyCody.utils.getLinkItemHref(result, 0);

            client.getConversation(href, {embed: 'media'}, (err, result) => {
                expect(err).to.not.be.ok();
                expect(result.conversation_id).to.be.ok();
                expect(result._links.self.href).to.equal(href);
                var insight = ClarifyCody.utils.getEmbedded(result, 'insight:media');
                expect(insight).to.be.ok();
                expect(insight.insight).to.equal('media');
                expect(insight.conversation.duration).to.equal(334.2);

                insight = ClarifyCody.utils.getEmbedded(result, 'insight:not_there');
                expect(insight).to.not.be.ok();

                insight = ClarifyCody.utils.getEmbedded({}, 'insight:not_there');
                expect(insight).to.not.be.ok();
                done();
            });
        });
    });

    it('should error getting conversation', function(done) {
        Mocks.mockServer();
        client.getConversations((err, result) => {
            client.getLinkItem(result, 999, (err, result) => {  // index out of range
                expect(err.message).to.be.ok();
                expect(result).to.not.be.ok();
                done();
            });
        });
    });

    it('should create conversation', function(done) {
        Mocks.mockServer();
        var data = {
            external_id: 'foobar'
        };

        client.createConversation(data , (err, result) => {
            expect(err).to.not.be.ok();
            expect(result.conversation_id).to.be.ok();
            expect(result._links.self.href).to.be.ok();
            done();
        });
    });

    it('should get conversation insight', function(done) {
        Mocks.mockServer();

        client.getConversations((err, result) => {
            client.getLinkItem(result, 0 , (err, result) => {
                var insightHref = client.utils.getLinkHref(result, 'insight:media');

                client.getLink(result, 'insight:media', (err, result) => {
                    expect(err).to.not.be.ok();
                    expect(result.conversation_id).to.be.ok();
                    expect(result.insight).to.equal('media');
                    expect(result._links.self.href).to.equal(insightHref);
                    done();
                });
            });
        });
    });

    it('should error getting conversation non insight', function(done) {
        Mocks.mockServer();

        client.getConversations((err, result) => {
            client.getLink(result, 'insight:not_found', (err, result) => {
                expect(err.message).to.be.ok();
                expect(result).to.not.be.ok();
                done();
            });
        });
    });

    it('should delete conversation', function(done) {
        Mocks.mockServer();
        client.getConversations((err, result) => {
            var href = ClarifyCody.utils.getLinkItemHref(result, 0);

            client.deleteConversation(href, (err, result) => {
                expect(err).to.not.be.ok();
                done();
            });
        });
    });

    it('should admin conversations prune', function(done) {
        Mocks.mockServer();
        client.adminConversationsPrune((err, result) => {
            expect(err).to.not.be.ok();
            expect(result.total).to.equal(0);
            done();
        });
    });

    it('should admin conversations notify', function(done) {
        Mocks.mockServer();
        client.adminConversationsNotify('error', (err, result) => {
            expect(err).to.not.be.ok();
            expect(result.total).to.equal(1);
            done();
        });
    });

    it('should admin conversations usage', function(done) {
        Mocks.mockServer();
        var start = "2018-01-01T00:00:00Z";
        var end = "2018-07-01T00:00:00Z";

        client.adminConversationsUsage(start, end, (err, result) => {
            expect(err).to.not.be.ok();
            expect(result.count).to.equal(5);
            expect(result.total).to.equal(50);
            done();
        });
    });

    it('should admin conversations usage aggregate', function(done) {
        Mocks.mockServer();
        client.adminConversationsUsageAggregate(0, (err, result) => {
            expect(err).to.not.be.ok();
            expect(result.days).to.equal(2);
            expect(result.conversations).to.equal(10);
            done();
        });
    });

  });

  describe('Utils tests', function() {

    it('should convert keys to lowercase', function() {

        var obj = {
            'a': 'a',
            'B': 'B',
            'C': 'C',
            'c': 'c'
        };
        var out = ClarifyCody.utils.objectPropertiesToLowerCase(obj);
        expect(out.a).to.equal('a');
        expect(out.B).to.not.be.ok();
        expect(out.b).to.equal('B');
        expect(out.C).to.not.be.ok();
        expect(out.c).to.be.ok(); // could be 'c' or 'C' depending on ordering
    });

  });
});
