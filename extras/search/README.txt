
The code in this folder can be used in a server or a browser page that allows searching for transcripts.

Assuming the user has entered search terms in a text field and that text is now in a string, and
a matching transcript result has been fetched for a call, we can:

1. Determine the hits (start and end times in seconds) in the audio where each search term is spoken. This can be used to show marks on the player scrubber.

2. Annotate the transcript and/or generate HTML for the transcript with spans such as <span class="seach-term-match search-term-0"></span> where each search term is in the transcript text. The css classes search-term-0, search-term-2, etc correspond to the search terms the user entered.


The input search term can be space separated words or phrases with "double quotes" around them.

Run the sample test with:

  node test.js sample_insight_transcript.json
