
Open wave.html in a browser for a live test.

View the source to see how to use it.

If you use the backend: 'MediaElement' option the audio can start playing before the waveform is drawn (see https://wavesurfer-js.org/faq/):

  var wavesurfer = WaveSurfer.create({
      container: '#waveform',
      backend: 'MediaElement',
      ...
  });


Use the transcript to generate the waveform data.

  var peaks = transcriptToWaveform(sampleTranscript);
  wavesurfer.load('audio.wav', peaks);
