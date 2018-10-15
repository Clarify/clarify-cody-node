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

exports.adminConversationsPrune = {
  "_links": {
    "self": {
      "href": "/v1/admin/conversations/prune"
    }
  },
  "total": 0
};

exports.adminConversationsNotify = {
  "_links": {
    "self": {
      "href": "/v1/admin/conversations/notify"
    }
  },
  "total": 1
};

exports.adminConversationsUsage = {
  "_links": {
    "self": {
      "href": "/v1/admin/conversations/usage"
    }
  },
  "count": 5,
  "total": 50
};

exports.adminConversationsUsageAggregate = {
  "_links": {
    "self": {
      "href": "/v1/admin/conversations/usage/aggregate"
    }
  },
  "days": 2,
  "conversations": 10
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

    Nock(baseUrl).get(/\/v1\/conversations\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/)
        .query({embed: 'media'})
        .reply(200, function(uri, requestBody) {
            var path = uri.split('?')[0];
            var conv = JSON.parse(JSON.stringify(exports.conversations[path]));
            conv._embedded = {
                'insight:media': exports.media_insights[path + '/insights/media']
            };
            return conv;
        }).persist();

    Nock(baseUrl).delete(/\/v1\/conversations\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/).reply(204, '');

    Nock(baseUrl).get('/v1/conversations').query({limit:2}).reply(200, exports.listConversationsLimit2Page1);
    Nock(baseUrl).get('/v1/conversations').query({iterator:'n_4', limit:2}).reply(200, exports.listConversationsLimit2Page2);
    Nock(baseUrl).get('/v1/conversations').query({iterator:'n_2',limit:2}).reply(200, exports.listConversationsLimit2Page3);

    Nock(baseUrl).post('/v1/admin/conversations/prune').reply(200, exports.adminConversationsPrune);
    Nock(baseUrl).post('/v1/admin/conversations/notify', {notify_status:'error'}).reply(200, exports.adminConversationsNotify);

    var start = "2018-01-01T00:00:00Z";
    var end = "2018-07-01T00:00:00Z";
    Nock(baseUrl).get('/v1/admin/conversations/usage').query({start: start, end: end}).reply(200, exports.adminConversationsUsage);
    Nock(baseUrl).post('/v1/admin/conversations/usage/aggregate', {days_ago: 0}).reply(200, exports.adminConversationsUsageAggregate);
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


exports.transcriptInsight = {
  "_links": {
    "self": {
      "href": "/v1/conversations/{CONVERSATION_ID}/insights/transcript"
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
  "version": "1.0.0",
  "status": "ok",
  "updated": "2017-08-30T22:55:23.561Z",
  "participants": [
        {
            "transcript": {
                "segments": [
                    {
                        "language": "en",
                        "terms": [
                            {
                                "term": "Hello",
                                "energy": -2.465,
                                "start": 0.02,
                                "dur": 0.34
                            },
                            {
                                "term": ".",
                                "type": "mark",
                                "start": 0.36,
                                "dur": 0
                            }
                        ],
                        "energy": -2.465,
                        "start": 0.02,
                        "dur": 0.34
                    },
                    {
                        "language": "en",
                        "terms": [
                            {
                                "term": "Yes",
                                "energy": 1.03,
                                "start": 2.54,
                                "dur": 0.36
                            },
                            {
                                "term": ".",
                                "type": "mark",
                                "start": 2.88,
                                "dur": 0
                            }
                        ],
                        "energy": 1.03,
                        "start": 2.54,
                        "dur": 0.36
                    }
                ],
                "meta": {
                    "format": "clarify_transcript",
                    "version": 1
                }
            },
            "name": "agent"
        },
        {
            "transcript": {
                "meta": {
                    "format": "clarify_transcript",
                    "version": 1
                },
                "segments": [
                    {
                        "language": "en",
                        "terms": [
                            {
                                "term": "Hi",
                                "energy": -2.465,
                                "start": 0.81,
                                "dur": 0.48
                            },
                            {
                                "term": "is",
                                "energy": -2.89,
                                "start": 1.29,
                                "dur": 0.18
                            },
                            {
                                "term": "this",
                                "energy": -0.947,
                                "start": 1.47,
                                "dur": 0.36
                            },
                            {
                                "term": "you",
                                "energy": -4.848,
                                "start": 1.83,
                                "dur": 0.27
                            },
                            {
                                "term": ".",
                                "type": "mark",
                                "start": 2.1,
                                "dur": 0
                            }
                        ],
                        "energy": -2.572,
                        "start": 0.81,
                        "dur": 1.29
                    },
                    {
                        "language": "en",
                        "terms": [
                            {
                                "term": "I'm",
                                "energy": -2.228,
                                "start": 7.68,
                                "dur": 0.69
                            },
                            {
                                "term": "calling",
                                "energy": -8.028,
                                "start": 8.7,
                                "dur": 0.57
                            },
                            {
                                "term": "about",
                                "energy": -3.366,
                                "start": 9.39,
                                "dur": 0.66
                            },
                            {
                                "term": "your",
                                "energy": -5.506,
                                "start": 10.11,
                                "dur": 0.54
                            },
                            {
                                "term": "product",
                                "energy": -1.932,
                                "start": 10.71,
                                "dur": 0.54
                            },
                            {
                                "term": "that",
                                "energy": -20.568,
                                "start": 11.28,
                                "dur": 0.06
                            },
                            {
                                "term": "I",
                                "energy": -3.3,
                                "start": 11.37,
                                "dur": 0.57
                            },
                            {
                                "term": "read",
                                "energy": -3.134,
                                "start": 11.97,
                                "dur": 0.57
                            },
                            {
                                "term": "about",
                                "energy": -5.503,
                                "start": 12.63,
                                "dur": 0.54
                            },
                            {
                                "term": "in",
                                "energy": -3.259,
                                "start": 13.26,
                                "dur": 0.66
                            },
                            {
                                "term": "your",
                                "energy": -3.076,
                                "start": 14.01,
                                "dur": 0.24
                            },
                            {
                                "term": "blog",
                                "energy": -1.458,
                                "start": 14.25,
                                "dur": 0.33
                            },
                            {
                                "term": ".",
                                "type": "mark",
                                "start": 14.58,
                                "dur": 0
                            }
                        ],
                        "energy": -3.651,
                        "start": 7.68,
                        "dur": 6.9
                    },
                    {
                        "language": "en",
                        "terms": [
                            {
                                "term": "Can",
                                "energy": -0.703,
                                "start": 18.84,
                                "dur": 0.21
                            },
                            {
                                "term": "you",
                                "energy": -0.505,
                                "start": 19.05,
                                "dur": 0.18
                            },
                            {
                                "term": "give",
                                "energy": -0.607,
                                "start": 19.23,
                                "dur": 0.27
                            },
                            {
                                "term": "me",
                                "energy": -1.493,
                                "start": 19.5,
                                "dur": 0.12
                            },
                            {
                                "term": "more",
                                "energy": -3.516,
                                "start": 19.62,
                                "dur": 0.45
                            },
                            {
                                "term": "information",
                                "energy": -1.641,
                                "start": 20.07,
                                "dur": 0.21
                            },
                            {
                                "term": "on",
                                "energy": -2.32,
                                "start": 20.28,
                                "dur": 0.09
                            },
                            {
                                "term": "it",
                                "energy": -5.317,
                                "start": 20.37,
                                "dur": 0.72
                            },
                            {
                                "term": ".",
                                "type": "mark",
                                "start": 21.09,
                                "dur": 0
                            }
                        ],
                        "energy": -1.764,
                        "start": 18.84,
                        "dur": 2.25
                    }
                ]
            },
            "name": "client"
    }
  ]
};
