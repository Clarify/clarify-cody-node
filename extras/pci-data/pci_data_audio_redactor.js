
const ChildProcess = require('child_process');

/**
 * Redact audio files for PCI data.
 *
 * Dependency:
 *
 *   ffmpeg version 2.5.3 or above. Tested with ffmpeg 2.5.3 and 3.2.4.
 *
 */

const PCIDataAudioRedactor = function(logger) {

    this.ffmpeg_env = Object.assign({}, process.env, {"AV_LOG_FORCE_NOCOLOR": "1"});

    this.logger = logger;
};


/**
 * Create a PCI-data redacted audio file based on the audioSourcePath audio file and the
 * media and pci_data insight data. The created audio file will be at audioDestPath.
 *
 * Input audio file can be flac or wav.
 *
 * Output audio file can be in any format supported by ffmpeg. Tthe source and dest files
 * can have different codecs.
 *
 * Due to ffmpeg limitations, the redaction may not be exact to the millisecond but should
 * be within 0.1 seconds which should be fine.
 *
 * callback(err, audioDestPath)
 */
PCIDataAudioRedactor.prototype.redactAudio = function(audioSourcePath, audioDestPath,
                                                      mediaInsight, pciDataInsight, callback) {

    let pciDataArray = this._pciDataArrayForMedia(mediaInsight, pciDataInsight);

    let ffargs = this._ffmpegArgs(audioSourcePath, audioDestPath, pciDataArray);

    this._runFfmpeg(ffargs, audioDestPath, callback);
};


PCIDataAudioRedactor.prototype._pciDataArrayForMedia = function(mediaInsight, pciDataInsight) {
    // Returns an array of pci_data with indexes matching the channels of the audio
    // 0 = left, 1 = right
    let pciDataResult = [];

    let plen = pciDataInsight.participants.length;
    let mlen = mediaInsight.participants.length;

    for (let m=0; m < mlen; m++) {
        let media = mediaInsight.participants[m];
        for (let p=0; p < plen; p++) {
            let pci = pciDataInsight.participants[p];
            if (media.name === pci.name) {
                if (media.media[0].audio_channel === 'right') {
                    pciDataResult[1] = pci.pci_data;
                } else {
                    pciDataResult[0] = pci.pci_data;
                }
            }
        }
    }
    return pciDataResult;
};


PCIDataAudioRedactor.prototype._ffmpegArgs = function(audioSourcePath, audioDestPath, pciDataArray) {

    const ffmpegFiltersForPCIData = function(pciData) {
        let segments = pciData.segments;
        let len = segments ? segments.length : 0;
        if (len) {
            var ret = '';
            for (let i = 0; i < len; i++) {
                if (i > 0) {
                    ret += ',';
                }
                let seg = segments[i];
                // We make a slight adjustment because ffmpeg filter isn't exact.
                ret += 'volume=enable=\'between(t,' + (seg.start - 0.05).toFixed(2) + ',' + seg.end + ')\':volume=0';
            }
            return ret;
        } else {
            return 'anull';
        }
    };

    let leftFilters = ffmpegFiltersForPCIData(pciDataArray[0]);
    let rightFilters = ffmpegFiltersForPCIData(pciDataArray[1]);

    return ['-i', audioSourcePath, '-y',
            '-filter_complex', 'channelsplit=channel_layout=stereo [lin][rin]; ' +
            '[lin]' + leftFilters + ' [lout]; [rin] ' + rightFilters + ' [rout]; [lout][rout] amerge=inputs=2',
            audioDestPath];
};


PCIDataAudioRedactor.prototype._runFfmpeg = function (ffargs, outputPath, callback) {

    let logger = this.logger;

    let options = {
        cwd: undefined,
        env: this.ffmpeg_env,
        detached: false,
        shell: false
    };

    let callbackSent = false;

    if (logger) {
        logger.log('ffmpeg ' + ffargs);
    }

    let ffmpeg = ChildProcess.spawn('ffmpeg', ffargs);

    ffmpeg.stdout.on('data', (data) => {
        if (logger) {
            logger.log(data.toString('utf8'));
        }
    });

    ffmpeg.stderr.on('data', (data) => {
        if (logger) {
            logger.log(data.toString('utf8'));
        }
    });

    ffmpeg.on('error', (err) => {
        // Note: The 'exit' event may or may not fire after an error has occurred.
        if (logger) {
            logger.log('Failed to start ffmpeg.');
        }

        if (!callbackSent) {
            callbackSent = true;
            callback(err);
        }
    });

    ffmpeg.on('exit', (code, signal) => {
        if (logger) {
            logger.log('ffmpeg exited with code ' + code);
        }

        if (!callbackSent) {
            callbackSent = true;

            let err = undefined;
            if (code !== 0) {
                err = new Error('ffmpeg error code ' + code);
            }
            callback(err, outputPath);
        }
    });
};


var exports = module.exports = PCIDataAudioRedactor;
