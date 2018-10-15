const FS = require('fs');
const search = require('./search');
const transcriptUtils = require('../../lib/transcript');

// Usage: node test.js <insight-transcript-json-file>

FS.readFile(process.argv[2], 'utf8', function(err, data) {
    if (err) throw err;
    var transcriptData = JSON.parse(data);

    // Get the times of hits for each participant and adds highlighting info in the transcript json
    var participants = transcriptData.participants;
    var len = participants.length;
    for (var i=0; i < len; i++) {
        var results = search.searchTranscriptAnnotateHtml(participants[i].transcript,
                                                          'hello "your product" information',
                                                          'seach-term-match');
        console.log(JSON.stringify(results, ' ', 2));
        //console.log(JSON.stringify(participants[0].transcript, ' ', 2));
    }

    // Generate a combined transcript of the participants and then generate html for it
    if (len > 0) {
        transcriptUtils.setSpeakerInTranscript(transcriptData.participants[0].transcript, 'Tom Jones');
    }
    if (len > 1) {
        transcriptUtils.setSpeakerInTranscript(transcriptData.participants[1].transcript, 'Mariah Carey');
    }

    var combinedTranscript = transcriptUtils.transcriptForInsight(transcriptData);
    var html = transcriptUtils.textForTranscript(combinedTranscript, true);
    console.log(html);
});
