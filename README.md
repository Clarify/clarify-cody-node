# clarify-cody
A node client library for Clarify Conversation Dynamics API.

This module provides a thin layer to make using the API very simple. The results are always plain objects as deserialized from the JSON.

See the Conversation Dynamics API docs for information on all the API calls, the parameters, and the response content.

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
    notify_url: "http://example.org/conversation_ready"
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
client.adminConversationsPrune((err, total) => {
    // total = number of conversations deleted
});
```

Resend notify webhook for conversations with notify_status:

```
client.adminConversationsNotify('error', (err, total) => {
    // total = number of conversations to resend notification
});
```

Errors
------

The API uses HTTP status codes for all errors and sends back a JSON response with details. These errors are wrapped in a `ClarifyCodyError` object and passed as the first parameter to callbacks. Use `error.content` to get parsed the response JSON for an error. Other errors, for example connection errors, will be native Node or `request` module errors.



License
-------

MIT License - [LICENSE](LICENSE)

Copyright (c) 2017 Clarify, Inc
