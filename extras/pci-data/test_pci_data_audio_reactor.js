
const PCIDataAudioRedactor = require('./pci_data_audio_redactor');
const Path = require('path');
const FS = require('fs');

/*
 * This test script will generated a redacted audio file, based on the Cody "media" and "pci_data" insight data.
 *
 * Input is the path to an audio file, usually stereo.
 * The output audio file will be the same path as the input with '-redact' added to the name.
 *
 * The participant names are used to map the pci data to the audio channels in the media.
 *
 * Media insight is a file containing JSON insight result for 'media':
 * For example:
 *
   {
       "version": "1.0.0",
       "status": "ok",
       "updated": "2017-08-30T22:55:23.561Z",
       "conversation": {
           "duration": 334.2
       },
       "participants": [
           {
               "media": [
                   {
                       "media_size": 10694444,
                       "fetch_code": 200,
                       "mime_type": "audio/x-wav",
                       "fetch_message": "OK",
                       "media_message": "OK",
                       "duration": 334.2,
                       "url": "http://foobar.example.org/media/out-15555555555.1010.wav",
                       "media_code": 1000,
                       "audio_codec": "pcm_s16le",
                       "audio_channel": "left"
                   }
               ],
               "name": "agent"
           },
           {
               "media": [
                   {
                       "media_size": 10694444,
                       "fetch_code": 200,
                       "mime_type": "audio/x-wav",
                       "fetch_message": "OK",
                       "media_message": "OK",
                       "duration": 334.2,
                       "url": "http://foobar.example.org/media/out-15555555555.1010.wav",
                       "media_code": 1000,
                       "audio_codec": "pcm_s16le",
                       "audio_channel": "right"
                   }
               ],
               "name": "client"
           }
       ]
   }
 *
 * PCI Data is a file containing the JSON insight result for 'pci_data'.
 * For example:
 *
   {
     "version": "1.0.0",
     "status": "ok",
     "updated": "2017-08-30T22:55:23.561Z",
     "participants": [
         {
             "pci_data": {
                 "segments": [
                     {
                         "start": 45.5,
                         "end": 60.0
                     }
                 ]
             },
             "name": "agent"
         },
         {
             "pci_data": {
                 "segments": [
                     {
                         "start": 15.3,
                         "end": 23.1
                     },
                     {
                         "start": 145.54,
                         "end": 161.05
                     },
                     {
                         "start": 240.0,
                         "end": 280.0
                     }
                 ]
             },
             "name": "client"
         }
     ]
    }
 */


function process_script() {

    let argc = process.argv.length;

    if (argc < 5) {
        console.log('Usage: node ' + process.argv[1] + ' <media_insight_json> <pci_data_insight_json> <audio_file>');
        process.exit(1);
    }

    let mediaInsightFile = process.argv[argc - 3];
    let pcidataInsightFile = process.argv[argc - 2];
    let audioFile = process.argv[argc - 1];

    let fileext = Path.extname(audioFile);
    let redactFile = audioFile.substr(0, audioFile.length - fileext.length) + '-redact' + fileext;

    FS.readFile(mediaInsightFile, 'utf8', function(err, data) {
        if (err) throw err;
        let mediaData = JSON.parse(data);

        FS.readFile(pcidataInsightFile, 'utf8', function(err, data) {
            if (err) throw err;

            let pciData = JSON.parse(data);
            let redactor = new PCIDataAudioRedactor(console);

            redactor.redactAudio(audioFile, redactFile, mediaData, pciData, function(err, path) {
                if (err) {
                    console.log('Error doing redaction: ' + err);
                } else {
                    console.log('Created file ' + path);
                }
                process.exit(0);
            });
        });
    });
}

process_script();
