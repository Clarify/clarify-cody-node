# clarify-cody
A node client library for Clarify Conversation Dynamics API.

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

Transcripts
-----------

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



License
-------

MIT License - [LICENSE](LICENSE)

Copyright (c) 2017 Clarify, Inc
