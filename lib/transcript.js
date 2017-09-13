'use strict';

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
    transcript = participants[0].transcript;
  } else if (!participants[0].transcript) {
    transcript = participants[1].transcript;
  } else if (len >= 2) {
    var p0 = participants[0];
    var p1 = participants[1];
    transcript = exports.mergeTranscripts(p0.transcript, p1.transcript, p0.name, p1.name);
  }
  return transcript;
};

exports.mergeTranscripts = function (transcript0, transcript1, speaker0, speaker1) {
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
  while (i0 < len0 || i1 < len1) {
    // i0 < len0 && i1 < len1) {
    if (!seg0 && i0 < len0) {
      do {
        seg0 = segments0[i0++];
        seg0.speaker = speaker0;
        slen0 = seg0.terms.length;
        s0 = 0;
      } while (!seg0.terms.length);
    }
    if (!seg1 && i1 < len1) {
      do {
        seg1 = segments1[i1++];
        seg1.speaker = speaker1;
        slen1 = seg1.terms.length;
        s1 = 0;
      } while (!seg1.terms.length);
    }
    if (seg0 && (!seg1 || seg0.terms[s0].type === 'mark' ||
           (seg1.terms[s1].type !== 'mark' &&
          ((curIndex === 0 && seg0.terms[s0].start <=
            seg1.terms[s1].start + seg1.terms[s1].dur) ||
           (curIndex === 1 && seg1.terms[s1].start >
            seg0.terms[s0].start + seg0.terms[s0].dur))))) {
      if (curIndex !== 0) {
        curIndex = 0;
        curSeg = { speaker: speaker0, terms: [] };
        segments.push(curSeg);
      }
      curSeg.terms.push(seg0.terms[s0++]);
    } else if (seg1) {
      if (curIndex !== 1) {
        curIndex = 1;
        curSeg = { speaker: speaker1, terms: [] };
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
          if (term.type === 'semi_lex') {
            line += term.term;
          } else if (term.type === 'non_lex') {
            line += '[' + term.term + ']';
          } else if (!term.type || term.type === 'word') {
            line += term.term;
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
