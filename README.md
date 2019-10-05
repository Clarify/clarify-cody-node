# clarify-cody
A node client library for Clarify Conversation Dynamics API for node >= 4.

This module provides a thin layer to make using the API very simple. The results are always plain objects as deserialized from the JSON.

See the [Conversation Dynamics API docs](http://cody.clarify.io/) for information on all the API calls, the parameters, and the response content.

Getting Started
---------------

Install with:

```
npm install git+https://git@github.com/Clarify/clarify-cody-node
```

And use the module:

```
const ClarifyCody = require('clarify-cody');

const client = new ClarifyCody.Client('___MY_TOKEN___');
client.getConversations((err, result) => {
    console.log(result);
});
```

Create Conversation
-------------------

```
var data = {
    external_id: 'foo1',
    participants: [
        {
            name: 'agent',
            media: [{
               "url": "http://example.org/calls/1.wav",
               "audio_channel": "left"
            }]
        },
        {
            name: 'client',
            media: [{
               "url": "http://example.org/calls/1.wav",
               "audio_channel": "right"
            }]
        }
    ],
    notify_url: "http://example.org/conversation_ready",
    options: {
        asr: {
            language: "en",
            redact: "pci"
        },
        keywords: {
            model: ""
        }
    }
};

client.createConversation(data, (err, result) => {

    if (!err) {
        // href = ClarifyCody.utils.getLinkHref(result, 'self')
    }
});
```

Get Conversation
----------------

```
client.getConversation(href, {embed: '*'}, (err, result) => {

    if (!err) {
        // result.external_id
        // media = ClarifyCody.utils.getEmbedded(result, 'insight:media');
    }
});
```

Get Insight
-----------

```
client.getConversation(href, (err, result) => {

    if (!err) {
        client.getLink(result, 'insight:transcript', (err, transcript) => {
             // transcript.participants[0].transcript
        });
    }
});
```

List Conversations
------------------

Get the first page (most recent):

```
client.getConversations((err, result) => {

    // count = ClarifyCody.utils.itemCount(result);

    client.getLinkItem(result, 0, (err, conversation) => {
        // conversation.external_id
    });
});
```

Next page:

```
client.getConversations((err, result) => {

    if (ClarifyCody.utils.hasLink(result, 'next')) {

        client.getLink(result, 'next', (err, resultPage2) => {

             client.getLinkItem(resultPage2, 0, (err, conversation) => {
                 // conversation.external_id
             });
        });
    }
});
```

Map all conversations:

```
client.conversationMap(null, function(href, next) {
   // Called for each conversation
   client.getConversation(href, {embed: '*'}, (err, conversation) => {
       // conversation.external_id
       next();
   });

}, function(err, total) {
   // total = total conversation count
});
```

Delete Conversation
------------------

```
client.getConversations((err, result) => {

    client.deleteConversation(ClarifyCody.utils.getLinkItemHref(result, 0), (err) => {
        // no err => success
    });
});
```

Admin Commands
--------------

Prune old conversations:

```
client.adminConversationsPrune((err, result) => {
    // result.total = number of conversations deleted
});
```

Resend notify webhook for conversations with notify_status:

```
client.adminConversationsNotify('error', (err, result) => {
    // result.total = number of conversations to resend notification
});
```

Get conversation processing usage:

```
client.adminConversationsUsage("2018-01-01T00:00:00Z", "2018-07-01T00:00:00Z", (err, result) => {
    // result.seconds = number of seconds of media processed
    // result.conversations = number of conversations processed
});
```

Aggregate conversation usage records by day to save database space:

```
client.adminConversationsUsageAggregate(30, (err, result) => {
    // result.days = number of days aggregated
    // result.conversations = total number of conversations aggregated
});
```

Insight Data
------------

Sample insight JSON can be found in the folder `samples/insights`.


Transcripts
-----------

Transcripts are in JSON format and describe the spoken words in order, along with other data. At the top level is a list of `segments`, each of which contains a list of `words`.


### Transcript Word Fields

The word fields are:

#### Term (`term`)

The text of the word or punctuation mark.

#### Type (`type`)

For normal words, type `word`, the type field is not present. If present, it will be `mark` for a punctuation mark, `non_lex` for non lexical sounds such as `[laugh]`, `[noise]`, or `[unknown]`, `semi_lex` for a semi lexical sound, `sound` for sounds such as a click, or `redacted` for a redacted word.

#### Start time (`start`)

A floating point specifying the number of seconds into the file when the word is spoken.


#### Duration (`dur`)

A floating point specifying the number of seconds in duration of the spoken word.

#### Energy (`energy`)

The relative loudness of a word, relative to the average for that speaker in the call. The values can be positive (louder than the average) or negative (quieter than the average.)

#### Confidence Score (`conf`)

The confidence score is a percentage (represented as a real number between 0 and 1) that specifies how well each word matches the ASR model. Although in many cases this confidence score is a good estimate for the probability that the word is "correct", this is not always the case.

The model is built from a large corpus of general written and spoken language, as well as corpora closer to the actual target domain (ex. voicemail transcripts, call transcripts, domain or company-specific texts etc.) The goal is to get a good model of the speech found in real-world phone calls but how well the model actually represents any particular call is variable. If the speech in a phone call matches the model well, the confidence scores will be closer to the "correctness" probability and confidence for clearly spoken words will generally be high (many with values of 1.) However, if there are words or phrases spoken that are unusual, sound like other words, or not found in the model at all, then the confidence scores for those words may be too high or too high, whether or not they are in fact "correct". For example, a product name, company name or technical term that is not commonly used in English (and that perhaps sounds like other words) but we have added to the model lexicon, could be recognized correctly but since the word is unusual and there are good other possibilities, the confidence score for it may be low. If an unusual or new word is spoken that is not in the model lexicon at all, the recognizer may come up with an incorrect word and, depending on how that word appears in the model and how many other close possibilities exist, the incorrect word may in fact be given a high confidence score.

##### Confidence Score Math

In speech recognition, alternative outputs or hypotheses are typically represented as a lattice. It is effectively an acyclic graph with unique begin and end nodes.

When the decoding is performed using Minimum Bayes Risk (MBR), the word sequence is estimated as:

```
W* = argmin_w \sum_{w’} P(w’|X) L(w,w’)
```

In this implementation, the upper bound for Bayes Risk is minimized to find the most likely word sequence for the given n-best hypotheses in the lattice. In so doing a combination of Levenshtein distance and probability from acoustic observation is employed. This probability is computed using a forward-backward algorithm from the probabilities of traversing lattice arcs.

The confidence scores are affected by the lattice. If there is only one path in the lattice at a certain point (only one word possibility), the confidence will be reported as 1. If there are many word possibilities, a lower confidence score may be reported.


### Transcript Utility Functions

There are some functions useful for manipulating transcripts.

To get a merged transcript from a transcript insight object:

```
const ClarifyCody = require('clarify-cody');
let transcript = ClarifyCody.transcript.transcriptForInsight(insight);
```

To get readable text for a transcript:

```
text = ClarifyCody.transcript.textForTranscript(transcript);
```

Or with simple HTML formatting:

```
text = ClarifyCody.transcript.textForTranscript(transcript, true);
```

To do your own formatting of transcript text, you can use a builder:

```
   let builder = {
      _text: '',
      line: '',
      lineStart: function () {
      },
      lineEnd: function () {
        this._text += this.line + '\n';
        this.line = '';
      },
      speakerChange: function (speaker) {
        this.line += speaker + ': ';
      },
      addWord: function (word, term) {
        this.line += word;
      },
      text: function () {
        return this._text;
      }
    };
  }
  text = ClarifyCody.transcript.textForTranscriptWithBuilder(transcript, builder);
```


Errors
------

The API uses HTTP status codes for all errors and sends back a JSON response with details. These errors are wrapped in a `ClarifyCodyError` object and passed as the first parameter to callbacks. Use `error.content` to get parsed the response JSON for an error. Other errors, for example connection errors, will be native Node or `request` module errors.


Extras
------

See the `extras` folder for extra tools and sample code:

- `pci-data` - Redact an audio file using the pci-data insight.

- `search` - Search a transcript for words and phrases to find hits and annotate the transcript.

- `wavesurfer` - Use transcript data to quickly generate simple waveform data that can be used with the wavesurfer audio player.


License
-------

MIT License - [LICENSE](LICENSE)

Copyright (c) 2017 Clarify, Inc
