
// In a browser, use 'Snowball.min.js'
var Snowball = require('./lib/Snowball.js');


// Exports:
// searchTranscriptAnnotate = function(transcriptJson, searchTerms, annotateFn) {
// searchTranscriptAnnotateHtml = function(transcriptJson, searchTerms, matchedSpanClass)

// Paramters:

// transcriptJson - the JSON transcript

// searchTerms - space-separated search terms where each term is a single word
// or a double-quoted phrase. ex. 'gold start'  '"gold star" sales'

// annotateFn (if present) - a function called for each matching term or terms in the transcript so
// they can be annotated.
// It has a signature:  annotateFn(searchTerm, searchTermIndex, startMatchTerm, endMatchTerm)
// where:
//   - searchTerm is the word or phrase in the searchTerms that was found
//   - searchTermIndex is the index (starting with 0) of the word or phrase in the searchTerms
//   - startMatchTerm is the transcript term that matched the word (or the first word of a phrase)
//   - endMatchTerm is the transcript term that matched the word (or the last word of a phrase)

// For searchTranscriptAnnotateHtml():
// matchedSpanClass - string containing one or more css classes to set in the term
//     annotation spans.
//
// Both functions return an array of results, one item per search term:
//  term - search word or phrase
//  hits - array of objects with start/end times (in seconds)
//
// searchTranscriptAnnotateHtml() also annotates the transcript terms that match with
// term.htmlOpen = '<span class="search-term-N "' + matchedSpanClass + '>'
// term.htmlClose = '</span>'

/*
  Sample return value:
[
  {
    "term": "twenty seventeen",
    "hits": [
      {
        "start": 2.79,
        "end": 3.81
      }
    ]
  },
  {
    "term": "going",
    "hits": [
      {
        "start": 42.6,
        "end": 42.72
      },
      {
        "start": 47.25,
        "end": 47.52
      },
      {
        "start": 126.48,
        "end": 126.630
      },
      {
        "start": 129.09,
        "end": 129.36
      },
      {
        "start": 244.02,
        "end": 244.290
      }
    ]
  }
]
*/

var stemmer = new Snowball('English');


var searchTranscriptAnnotateHtml = function(transcriptJson, searchTerms, matchedSpanClass) {

    var annotateFn = function(searchTerm, searchTermIndex, startMatchTerm, endMatchTerm) {
        startMatchTerm.htmlOpen = '<span class="' + (matchedSpanClass||'') +
            ' search-term-' + searchTermIndex + '">';
        endMatchTerm.htmlClose = '</span>';
    };

    return searchTranscriptAnnotate(transcriptJson, searchTerms, annotateFn);
};


// annotateFn = function(searchTerm, searchTermIndex, startMatchTerm, endMatchTerm)
var searchTranscriptAnnotate = function(transcriptJson, searchTerms, annotateFn) {

    var stemWord = function(word) {
        stemmer.setCurrent(word);
        stemmer.stem();
        return stemmer.getCurrent(word).toLowerCase();
    };

    var parseTerms = function(searchTerms) {
        var parts = searchTerms.split(' ');
        var terms = [];
        var len = parts.length;
        var phrase = null;

        var processTerm = function(t) {
            if (t === '"') {
                if (phrase) {
                    if (phrase.length) {
                        terms.push(phrase);
                    }
                    phrase = null;
                } else {
                    phrase = [];
                }
            } else if (phrase) {
                phrase.push(t);
            } else {
                terms.push(t);
            }
        };

        for (var i = 0; i < len; i++) {
            var t = parts[i];
            var tlen = t.length;

            if (t[0] === '"') {
                if (tlen === 1) {
                    processTerm(t);
                } else {
                    processTerm('"');
                    processTerm(t.substr(1));
                }
            } else if (tlen > 1 && t[tlen - 1] === '"') {
                processTerm(t.substr(0, tlen - 1));
                processTerm('"');
            } else {
                processTerm(t);
            }
        }

        if (phrase && phrase.length) {
            terms.push(phrase);
        }
        return terms;
    };

    var stemPhrase = function(phrase) {
        var len = phrase.length;
        for (var i = 0; i < len; i++) {
            phrase[i] = stemWord(phrase[i]);
        }
        return phrase;
    };

    var searchTermArr = parseTerms(searchTerms);
    var results = [];

    var stlen = searchTermArr.length;
    var i, result;
    for (i = 0; i < stlen; i++) {
        var term = searchTermArr[i];
        var isPhrase = Array.isArray(term);
        result = {
            term: isPhrase ? term.join(' ') : term,
            _phrase: isPhrase,
            _partial: isPhrase ? 0 : undefined,
            _sterm: isPhrase ? stemPhrase(term) : stemWord(term),
            hits: []
        };
        results.push(result);
    }

    var segments = transcriptJson.segments;
    var slen = segments ? segments.length : 0;
    for (var s = 0; s < slen; s++) {
        var segterms = segments[s].terms;
        var wlen = segterms ? segterms.length : 0;
        for (var w = 0; w < wlen; w++) {
            var segterm = segterms[w];
            var sword = stemWord(segterm.term);

            for (i = 0; i < stlen; i++) {
                result = results[i];
                if (result._phrase) {
                    // First reset partial match if this term doesn't match
                    if (result._partial && result._sterm[result._partial] !== sword) {
                        result._partial = 0;
                        result._partials = null;
                    }
                    // Now check partial match
                    if (result._sterm[result._partial] === sword) {
                        if (result._partial === result._sterm.length - 1) {
                            result._partials.push(segterm);
                            result.hits.push({'start': result._partials[0].start, 'end': segterm.start + segterm.dur});
                            if (annotateFn) {
                                annotateFn(searchTermArr[i], i, result._partials[0],
                                           result._partials[result._sterm.length - 1]);
                            }
                            result._partial = 0;
                            result._partials = [];
                        } else {
                            if (result._partial === 0) {
                                result._partials = [];
                            }
                            result._partials.push(segterm);
                            result._partial++;
                        }
                    }
                } else {
                    if (result._sterm === sword) {
                        result.hits.push({'start': segterm.start, 'end': segterm.start + segterm.dur});
                        if (annotateFn) {
                            annotateFn(searchTermArr[i], i, segterm, segterm);
                        }
                    }
                }
            }
        }
    }

    // cleanup results
    for (i = 0; i < stlen; i++) {
        result = results[i];
        delete result._sterm;
        delete result._partials;
        delete result._partial;
        delete result._phrase;
    }
    return results;
};


module.exports.searchTranscriptAnnotate = searchTranscriptAnnotate;
module.exports.searchTranscriptAnnotateHtml = searchTranscriptAnnotateHtml;
