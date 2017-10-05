'use strict';

const ClarifyCody = require('..');
const Mocks = require('./mocks');
const expect = require('expect.js');


describe('Clarify Cody transcript tests', function() {

  describe('Transcript tests', function() {

    it('should set speaker', function() {

        var transcript = Mocks.transcriptInsight.participants[0].transcript;
        var speaker = 'John Doe';
        ClarifyCody.transcript.setSpeakerInTranscript(transcript, speaker);

        var segments = transcript.segments;
        var len = segments.length;
        for (var i=0; i < len; i++) {
            expect(segments[i].speaker).to.equal(speaker);
        }

    });

    it('should merge transcripts and generate text', function() {

        var transcript = ClarifyCody.transcript.transcriptForInsight(Mocks.transcriptInsight);
        expect(transcript).to.be.an('object');
        expect(transcript.segments.length).to.equal(5);

        var textMerged = ClarifyCody.transcript.textForTranscript(transcript);
        console.log(textMerged);
        expect(textMerged.length).to.equal(168);
        expect(textMerged.indexOf('John Doe: Hello')).to.equal(0);

        var htmlMerged = ClarifyCody.transcript.textForTranscript(transcript, true);
        console.log(htmlMerged);
        expect(htmlMerged.length).to.equal(282);
        expect(htmlMerged.indexOf('<b>John Doe:</b> Hello')).to.equal(8);
    });

  });
});
