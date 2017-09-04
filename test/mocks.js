'use strict';

const Nock = require('nock');
const URL = require('url');

const baseUrl = 'https://cdapi.clarify.io';

var exports = module.exports = {
    baseUrl: baseUrl,
    conversations: {},
    media_insights: {}
};


const conversation_template = {
  "_links": {
    "self": {
      "href": "/v1/conversations/{CONVERSATION_ID}"
    },
    "insight:keywords": {
      "href": "/v1/conversations/{CONVERSATION_ID}/insights/keywords"
    },
    "insight:media": {
      "href": "/v1/conversations/{CONVERSATION_ID}/insights/media"
    },
    "insight:speech": {
      "href": "/v1/conversations/{CONVERSATION_ID}/insights/speech"
    },
    "insight:transcript": {
      "href": "/v1/conversations/{CONVERSATION_ID}/insights/transcript"
    }
  },
  "conversation_id": "{CONVERSATION_ID}",
  "external_id": "ext-1",
  "created": "2017-08-30T20:20:01.284Z",
  "updated": "2017-08-30T22:55:26.080Z",
  "status": "ready",
  "participants": [
    {
      "name": "agent",
      "media": [
        {
          "url": "http://example.org/calls/1.wav",
          "audio_channel": "left"
        }
      ]
    },
    {
      "name": "client",
      "media": [
        {
          "url": "http://example.org/calls/1.wav",
          "audio_channel": "right"
        }
      ]
    }
  ],
  "options": {
    "language": "en"
  }
};

exports.listConversationsLimit10 = {
  "_links": {
    "self": {
      "href": "/v1/conversations?iterator=&limit=10"
    },
    "items": [
      {
        "href": "/v1/conversations/e710e290-33f6-468e-807a-b392af7cdd62"
      },
      {
        "href": "/v1/conversations/b25f655e-d877-4bd1-9979-e708b826dfd5"
      },
      {
        "href": "/v1/conversations/a04beb86-28b8-4e40-924c-c86a8a0cdc21"
      },
      {
        "href": "/v1/conversations/c3f931cc-69e6-450c-8286-a0b5372a55c5"
      },
      {
        "href": "/v1/conversations/9f8ffa09-dc4e-472c-b2e3-968b87fb19ec"
      }
    ],
    "first": {
      "href": "/v1/conversations?iterator=&limit=10"
    },
    "last": {
      "href": "/v1/conversations?iterator=last&limit=10"
    }
  },
  "total": 5,
  "limit": 10
};


exports.listConversationsLimit2Page1 = {
  "_links": {
    "self": {
      "href": "/v1/conversations?iterator=&limit=2"
    },
    "items": [
      {
        "href": "/v1/conversations/e710e290-33f6-468e-807a-b392af7cdd62"
      },
      {
        "href": "/v1/conversations/b25f655e-d877-4bd1-9979-e708b826dfd5"
      }
    ],
    "first": {
      "href": "/v1/conversations?iterator=&limit=2"
    },
    "last": {
      "href": "/v1/conversations?iterator=last&limit=2"
    },
    "next": {
      "href": "/v1/conversations?iterator=n_4&limit=2"
    }
  },
  "total": 5,
  "limit": 2
};


exports.listConversationsLimit2Page2 = {
  "_links": {
    "self": {
      "href": "/v1/conversations?iterator=n_4&limit=2"
    },
    "items": [
      {
        "href": "/v1/conversations/a04beb86-28b8-4e40-924c-c86a8a0cdc21"
      },
      {
        "href": "/v1/conversations/c3f931cc-69e6-450c-8286-a0b5372a55c5"
      }
    ],
    "first": {
      "href": "/v1/conversations?iterator=&limit=2"
    },
    "last": {
      "href": "/v1/conversations?iterator=last&limit=2"
    },
    "prev": {
      "href": "/v1/conversations?iterator=p_3&limit=2"
    },
    "next": {
      "href": "/v1/conversations?iterator=n_2&limit=2"
    }
  },
  "total": 5,
  "limit": 2
};


exports.listConversationsLimit2Page3 = {
  "_links": {
    "self": {
      "href": "/v1/conversations?iterator=n_2&limit=2"
    },
    "items": [
      {
        "href": "/v1/conversations/9f8ffa09-dc4e-472c-b2e3-968b87fb19ec"
      }
    ],
    "first": {
      "href": "/v1/conversations?iterator=&limit=2"
    },
    "last": {
      "href": "/v1/conversations?iterator=last&limit=2"
    },
    "prev": {
      "href": "/v1/conversations?iterator=p_1&limit=2"
    }
  },
  "total": 5,
  "limit": 2
};


const media_insight_template = {
  "_links": {
    "self": {
      "href": "/v1/conversations/{CONVERSATION_ID}/insights/media"
    },
    "curies": [
      {
        "name": "clarify",
        "href": "/rels/clarify/{rel}",
        "templated": true
      }
    ],
    "clarify:conversation": {
      "href": "/v1/conversations/{CONVERSATION_ID}"
    }
  },
  "conversation_id": "{CONVERSATION_ID}",
  "insight": "media",
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
          "url": "http://example.org/calls/1.wav",
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
          "url": "http://example.org/calls/1.wav",
          "media_code": 1000,
          "audio_codec": "pcm_s16le",
          "audio_channel": "right"
        }
      ],
      "name": "client"
    }
  ]
};


const buildConversations = function() {
    var items = exports.listConversationsLimit10._links.items;
    for (var i=0; i < items.length; i++) {
        var href = items[i].href;
        var id = href.split('/')[3];
        exports.conversations[href] = JSON.parse(
            JSON.stringify(conversation_template).replace(/\{CONVERSATION_ID\}/g,id));

        var ihref = href + '/insights/media';
        exports.media_insights[ihref] = JSON.parse(
            JSON.stringify(media_insight_template).replace(/\{CONVERSATION_ID\}/g,id));
    }
};

buildConversations();

exports.mockServer = function(noClean) {
    if (!noClean) {
        Nock.cleanAll();
    }

    Nock(baseUrl).get('/v1/conversations').reply(200, exports.listConversationsLimit10);
    Nock(baseUrl).post('/v1/conversations').reply(200, exports.conversations['/v1/conversations/e710e290-33f6-468e-807a-b392af7cdd62']);

    Nock(baseUrl).get(/\/v1\/conversations\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/).reply(200, function(uri, requestBody) {
        return exports.conversations[uri];
    }).persist();

    Nock(baseUrl).get(/\/v1\/conversations\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/insights\/media$/).reply(200, function(uri, requestBody) {
        return exports.media_insights[uri];
    }).persist();

    Nock(baseUrl).delete(/\/v1\/conversations\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/).reply(204, '');

    Nock(baseUrl).get('/v1/conversations').query({limit:2}).reply(200, exports.listConversationsLimit2Page1);
    Nock(baseUrl).get('/v1/conversations').query({iterator:'n_4', limit:2}).reply(200, exports.listConversationsLimit2Page2);
    Nock(baseUrl).get('/v1/conversations').query({iterator:'n_2',limit:2}).reply(200, exports.listConversationsLimit2Page3);

};


exports.mockRequestError = function(noClean) {
    if (!noClean) {
        Nock.cleanAll();
    }

    Nock(baseUrl).get('/v1/conversations').reply(400, {
        "error": "Bad Request",
        "message": "Request parameter validation failed",
        "code": 400,
        "errors": [
            {
                "field": "foobar",
                "message": "\"foobar\" is not allowed"
            }
        ],
        "_links": {
            "about": {
                "href": "https://en.wikipedia.org/wiki/HTTP_400"
            }
        }
    });
};
