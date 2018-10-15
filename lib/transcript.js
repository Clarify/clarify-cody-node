
exports = module.exports = {};

// Return a single transcript for a transcript insight.
exports.transcriptForInsight = function (insight) {
  // Merge 2 transcripts if necessary
  var transcript = null;
  var participants = insight.participants;
  var len = participants.length;

  if (len === 0) {
    transcript = {'segments': []};
  } else if (len === 1 || !participants[1].transcript) {
    transcript = exports.setSpeakerInTranscript(participants[0].transcript, participants[0].name || 'Speaker 1', true);
  } else if (!participants[0].transcript) {
    transcript = exports.setSpeakerInTranscript(participants[1].transcript, participants[1].name || 'Speaker 2', true);
  } else if (len >= 2) {
    var p0 = participants[0];
    var p1 = participants[1];
    transcript = exports.mergeTranscripts(p0.transcript, p1.transcript, p0.name, p1.name, true);
  }
  return transcript;
};

exports.setSpeakerInTranscript = function (transcript, speaker, ifNotSet) {
  var segments = transcript.segments;
  var len = segments.length;
  for (var i = 0; i < len; i++) {
    if (!ifNotSet || !segments[i].speaker) {
      segments[i].speaker = speaker;
    }
  }
  return transcript;
};

exports.mergeTranscripts = function (transcript0, transcript1, speaker0, speaker1, setSpeakerIfNotSet) {
  // Merge 2 transcripts if necessary
  var transcript = null;

  transcript = {
    meta: transcript0.meta
  };
  speaker0 = speaker0 || 'Speaker 1';
  speaker1 = speaker1 || 'Speaker 2';
  var segments0 = transcript0.segments;
  var segments1 = transcript1.segments;
  var segments = transcript.segments = [];
  var curSeg = null;
  var curIndex = null;
  var len0 = segments0.length;
  var i0 = 0;
  var seg0 = null;
  var slen0;
  var s0;
  var len1 = segments1.length;
  var i1 = 0;
  var seg1 = null;
  var slen1;
  var s1;
  while (i0 < len0 || i1 < len1 || seg0 || seg1) {
    // i0 < len0 && i1 < len1) {
    if (!seg0 && i0 < len0) {
      do {
        seg0 = segments0[i0++];
        if (!setSpeakerIfNotSet || !seg0.speaker) {
          seg0.speaker = speaker0;
        }
        slen0 = seg0.terms.length;
        s0 = 0;
      } while (!seg0.terms.length && i0 < len0);
    }
    if (!seg1 && i1 < len1) {
      do {
        seg1 = segments1[i1++];
        if (!setSpeakerIfNotSet || !seg1.speaker) {
          seg1.speaker = speaker1;
        }
        slen1 = seg1.terms.length;
        s1 = 0;
      } while (!seg1.terms.length && i1 < len1);
    }
    if (seg0 && (!seg1 || seg0.terms[s0].type === 'mark' ||
           (seg1.terms[s1].type !== 'mark' &&
          ((curIndex !== 1 && seg0.terms[s0].start <=
            seg1.terms[s1].start + seg1.terms[s1].dur) ||
           (curIndex !== 0 && seg1.terms[s1].start >
            seg0.terms[s0].start + seg0.terms[s0].dur))))) {
      if (curIndex !== 0) {
        curIndex = 0;
        curSeg = { speaker: seg0.speaker || speaker0, terms: [] };
        segments.push(curSeg);
      }
      curSeg.terms.push(seg0.terms[s0++]);
    } else if (seg1) {
      if (curIndex !== 1) {
        curIndex = 1;
        curSeg = { speaker: seg1.speaker || speaker1, terms: [] };
        segments.push(curSeg);
      }
      curSeg.terms.push(seg1.terms[s1++]);
    }
    if (s0 >= slen0) {
      seg0 = null;
      if (curIndex === 0) {
        curIndex = null;
      }
    }
    if (s1 >= slen1) {
      seg1 = null;
      if (curIndex === 1) {
        curIndex = null;
      }
    }
  }
  if (segments) {
    // Set the segment start and dur times.
    len0 = segments.length;
    for (s0 = 0; s0 < len0; s0++) {
      seg0 = segments[s0];
      var tlen = seg0.terms.length;
      if (tlen > 0) {
        seg0.start = seg0.terms[0].start;
        seg0.dur = (seg0.terms[tlen - 1].start + seg0.terms[tlen - 1].dur) - seg0.start;
      }
    }
  }
  return transcript;
};

// builder {
//  lineStart: function(),
//  lineEnd: function(),
//  speakerChange: function(speaker),
//  addWord: function(word, term)
//  text: function()
// }
exports.textForTranscriptWithBuilder = function (transcript, builder) {
  var segments = transcript.segments;
  var lastSpeaker = null;

  for (var i in segments) {
    var seg = segments[i];
    var inQuotes = false;
    var noSpace = true;

    builder.lineStart();
    if (seg.speaker && seg.speaker !== lastSpeaker) {
      builder.speakerChange(seg.speaker);
      lastSpeaker = seg.speaker;
    }

    for (var it in seg.terms) {
      var term = seg.terms[it];

      if (term.type === 'mark') {
        if (term.term === '"') {
          if (!inQuotes) {
            builder.addWord(' ');
            noSpace = true;
          }
          inQuotes = !inQuotes;
        }
        builder.addWord(term.term, term);
      } else {
        if (term.term) {
          if (!noSpace) {
            builder.addWord(' ');
          } else {
            noSpace = false;
          }
          if (term.type === 'semi_lex') {
            builder.addWord(term.term, term);
          } else if (term.type === 'non_lex') {
            builder.addWord('[' + term.term + ']', term);
          } else if (!term.type || term.type === 'word') {
            builder.addWord(term.term, term);
          }
        }
      }
    }
    builder.lineEnd();
  }
  return builder.text();
};

exports.textForTranscript = function (transcript, htmlFormat) {
  var builder;

  if (htmlFormat) {
    builder = {
      _text: '<div>\n',
      line: '',
      lineStart: function () {
        this.line += '<p>';
        this.lineHasSpeaker = false;
      },
      lineEnd: function () {
        this._text += this.line + '</p>\n';
        this.line = '';
      },
      speakerChange: function (speaker) {
        this.line += '<b>' + speaker + ':</b> ';
        this.lineHasSpeaker = true;
      },
      addWord: function (word, term) {
        if (!this.lineHasSpeaker) {
          this.lineHasSpeaker = true;
          this.line += '<span style="margin-left: 46px;"></span>';
        }
        if (term && term.htmlOpen) {
          this.line += term.htmlOpen;
        }
        this.line += word;
        if (term && term.htmlClose) {
          this.line += term.htmlClose;
        }
      },
      text: function () {
        return this._text + '</div>';
      }
    };
  } else {
    builder = {
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
  return exports.textForTranscriptWithBuilder(transcript, builder);
};

/*
exports.textForTranscript = function (transcript, htmlFormat) {
  var segments = transcript.segments;
  var text = htmlFormat ? '<div>' : '';
  var lastSpeaker = null;

  for (var i in segments) {
  var seg = segments[i];
  var inQuotes = false;
  var noSpace = !seg.speaker;

  var line = htmlFormat ? '<p>' : '';
  if (seg.speaker && seg.speaker !== lastSpeaker) {
    if (htmlFormat) {
    line += '<b>';
    }
    line += seg.speaker + ':';
    if (htmlFormat) {
    line += '</b>';
    }
    lastSpeaker = seg.speaker;
  } else if (htmlFormat) {
    line += '<span style="margin-left: 46px;"></span>';
  }

  for (var it in seg.terms) {
    var term = seg.terms[it];

    if (term.type === 'mark') {
    if (term.term === '"') {
      if (!inQuotes) {
      line += ' ';
      noSpace = true;
      }
      inQuotes = !inQuotes;
    }
    line += term.term;
    } else {
    if (term.term) {
      if (!noSpace) {
      line += ' ';
      } else {
      noSpace = false;
      }
      if (htmlFormat && term.htmlOpen) {
      line += term.htmlOpen;
      }
      if (term.type === 'semi_lex') {
      line += term.term;
      } else if (term.type === 'non_lex') {
      line += '[' + term.term + ']';
      } else if (!term.type || term.type === 'word') {
      line += term.term;
      }
      if (htmlFormat && term.htmlClose) {
      line += term.htmlClose;
      }
    }
    }
  }
  if (htmlFormat) {
    line += '</p>';
  }
  text += line + '\n';
  }
  if (htmlFormat) {
  text += '</div>';
  }
  return text;
};
*/
