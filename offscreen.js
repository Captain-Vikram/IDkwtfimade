const WORKER_FILE = {
    wav: "WavWorker.js",
    mp3: "Mp3Worker.js"
};

async function getAudioStream(streamId, startTabId) {
    const audioConstraints = {
        audio: {
            mandatory: {
                chromeMediaSource: "tab",
                chromeMediaSourceId: streamId
            }
        },
        video: false
    };

    const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
    return [stream, startTabId];
}

const extend = function (target, ...sources) {
    sources.forEach(source => {
        for (let key in source) {
            if (source.hasOwnProperty(key)) {
                const val = source[key];
                target[key] = typeof val === 'object' ? extend(target[key] || {}, val) : val;
            }
        }
    });
    return target;
};

const CONFIGS = {
    workerDir: "/workers/",
    numChannels: 2,
    encoding: "wav",
    options: {
        timeLimit: 1200,
        encodeAfterRecord: true,
        progressInterval: 1000,
        bufferSize: undefined,
        wav: { mimeType: "audio/wav" },
        mp3: { mimeType: "audio/mpeg", bitRate: 192 }
    }
};

class Recorder {
    constructor(source, configs = {}) {
        extend(this, CONFIGS, configs);
        this.context = source.context;
        this.input = this.context.createGain();
        source.connect(this.input);
        this.buffer = [];
        this.initWorker();
    }

    isRecording() {
        return !!this.processor;
    }

    setEncoding(encoding) {
        if (!this.isRecording() && this.encoding !== encoding) {
            this.encoding = encoding;
            this.initWorker();
        }
    }

    setTab(tabId) {
        this.tabId = tabId;
    }

    setOptions(options) {
        if (!this.isRecording()) {
            extend(this.options, options);
            this.worker.postMessage({ command: "options", options: this.options });
        }
    }

    startRecording() {
        if (!this.isRecording()) {
            this.processor = this.context.createScriptProcessor(this.options.bufferSize, this.numChannels, this.numChannels);
            this.input.connect(this.processor);
            this.processor.connect(this.context.destination);

            this.processor.onaudioprocess = event => {
                for (let ch = 0; ch < this.numChannels; ch++) {
                    this.buffer[ch] = event.inputBuffer.getChannelData(ch);
                }
                this.worker.postMessage({ command: "record", buffer: this.buffer });
            };

            this.worker.postMessage({ command: "start", bufferSize: this.processor.bufferSize });
            this.startTime = Date.now();
        }
    }

    cancelRecording() {
        if (this.isRecording()) {
            this.input.disconnect();
            this.processor.disconnect();
            delete this.processor;
            this.worker.postMessage({ command: "cancel" });
        }
    }

    finishRecording() {
        if (this.isRecording()) {
            this.input.disconnect();
            this.processor.disconnect();
            delete this.processor;
            this.worker.postMessage({ command: "finish" });
            this.endTime = Date.now();
            chrome.runtime.sendMessage({ text: "clearStorage", tab: this.tabId });
        }
    }

    cancelEncoding() {
        if (this.options.encodeAfterRecord && !this.isRecording()) {
            this.onEncodingCanceled(this);
            this.initWorker();
        }
    }

    getDuration() {
        return this.isRecording() ? Date.now() - this.startTime : this.endTime - this.startTime;
    }

    initWorker() {
        if (this.worker) {
            this.worker.terminate();
        }

        this.onEncoderLoading(this, this.encoding);
        this.worker = new Worker(this.workerDir + WORKER_FILE[this.encoding]);

        this.worker.onmessage = event => {
            const data = event.data;
            switch (data.command) {
                case "loaded":
                    this.onEncoderLoaded(this, this.encoding);
                    break;
                case "timeout":
                    this.onTimeout(this);
                    break;
                case "progress":
                    this.onEncodingProgress(this, data.progress);
                    break;
                case "complete":
                    this.onComplete(this, data.blob);
                    break;
            }
        };

        this.worker.postMessage({
            command: "init",
            config: {
                sampleRate: this.context.sampleRate,
                numChannels: this.numChannels
            },
            options: this.options
        });
    }

    onEncoderLoading(recorder, encoding) {}
    onEncoderLoaded(recorder, encoding) {}
    onTimeout(recorder) {}
    onEncodingProgress(recorder, progress) {}
    onEncodingCanceled(recorder) {}
    onComplete(recorder, blob) {}
}

const audioCapture = (timeLimit, muteTab, format, quality, limitRemoved, streamId, startTabId) => {
    setTimeout(() => {}, timeLimit);

    getAudioStream(streamId, startTabId).then(([stream, startTabId]) => {
        const liveStream = stream;
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        let mediaRecorder = new Recorder(source);

        let completeTabID = null;
        let audioURL = null;

        const onStopClick = request => {
            const tabId = request.tabId || request.tab;
            if (request === "stopCapture" || request.command === "stopCapture") {
                stopCapture(tabId);
            } else if (request.action === "cancelCapture") {
                cancelCapture(tabId);
            }
        };

        mediaRecorder.setTab(startTabId);
        mediaRecorder.setEncoding(format);
        mediaRecorder.setOptions({
            timeLimit: limitRemoved ? 10800 : timeLimit / 1000
        });

        if (format === "mp3") {
            mediaRecorder.setOptions({ mp3: { bitRate: quality } });
        } else if (format === "wav") {
            mediaRecorder.setOptions({ wav: { mimeType: "audio/wav" } });
        }

        mediaRecorder.startRecording();
        chrome.runtime.onMessage.addListener(onStopClick);

        mediaRecorder.onComplete = (recorder, blob) => {
            audioURL = window.URL.createObjectURL(blob);
            chrome.runtime.sendMessage({
                type: "encodingComplete",
                audioURL: audioURL,
                tabId: startTabId,
                duration: mediaRecorder.getDuration()
            });
            mediaRecorder = null;
            closeStream(startTabId);
        };

        mediaRecorder.onEncodingProgress = (recorder, progress) => {
            if (completeTabID) {
                chrome.runtime.sendMessage({
                    type: "encodingProgress",
                    progress: progress,
                    tabId: startTabId,
                    duration: mediaRecorder.getDuration()
                });
            }
        };

        if (!limitRemoved) {
            setTimeout(() => {
                createCompleteTab(format, audioURL, mediaRecorder.tabId).then(() => {
                    completeTabID = mediaRecorder.tabId;
                    setTimeout(() => {
                        if (mediaRecorder) {
                            mediaRecorder.finishRecording();
                        }
                    }, 2000);
                });
            }, timeLimit);
        }

        const stopCapture = endTabId => {
            if (mediaRecorder) {
                createCompleteTab(format, audioURL, mediaRecorder.tabId).then(() => {
                    completeTabID = mediaRecorder.tabId;
                    setTimeout(() => {
                        if (mediaRecorder && mediaRecorder.tabId === endTabId) {
                            mediaRecorder.finishRecording();
                        }
                    }, 2000);
                });
            }
        };

        const cancelCapture = tabId => {
            const endTabId = mediaRecorder.tabId;
            if (mediaRecorder && tabId === endTabId) {
                mediaRecorder.cancelRecording();
                closeStream(endTabId);
            }
        };

        const closeStream = endTabId => {
            chrome.runtime.onMessage.removeListener(onStopClick);
            if (mediaRecorder) {
                mediaRecorder.onTimeout = () => {};
            }
            audioCtx.close();
            liveStream.getAudioTracks()[0].stop();
            chrome.runtime.sendMessage({ captureStopped: endTabId });
        };

        if (!muteTab) {
            const audio = new Audio();
            audio.srcObject = liveStream;
            audio.play();
        }
    });
};

function createCompleteTab(format, audioURL, tabId) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            type: "createCompleteTab",
            format: format,
            audioURL: audioURL,
            startID: tabId
        }, response => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}

chrome.runtime.onMessage.addListener(request => {
    if (request.action === "audioCapture") {
        audioCapture(...request.data);
    }
});
