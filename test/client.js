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
    });

    it('should list conversations', function(done) {
        Mocks.mockServer();
        client.getConversations((err, result) => {
            expect(err).to.not.be.ok();
            expect(result.total).to.equal(5);
            expect(result._links.items.length).to.equal(5);
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
            var href = ClarifyCody.Client.getItemLinkHref(result, 0);

            client.getConversation(href , (err, result) => {
                expect(err).to.not.be.ok();
                expect(result.conversation_id).to.be.ok();
                expect(result._links.self.href).to.equal(href);
                done();
            });
        });
    });

    it('should error getting conversation', function(done) {
        Mocks.mockServer();
        client.getConversations((err, result) => {
            client.getItemLink(result, 999, (err, result) => {  // index out of range
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
            client.getItemLink(result, 0 , (err, result) => {
                var insightHref = ClarifyCody.Client.getLinkHref(result, 'insight:media');

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
            var href = ClarifyCody.Client.getItemLinkHref(result, 0);

            client.deleteConversation(href, (err, result) => {
                expect(err).to.not.be.ok();
                done();
            });
        });
    });


  });

});
