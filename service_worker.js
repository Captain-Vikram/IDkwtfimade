async function getCurrentTab() {
	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	return tab;
}

async function currentTabCallback(tab, request, sender, sendResponse) {
	let cts;
	if (!tab) return void sendResponse(false);
	cts = tab.id.toString();
	let localStorage = await chrome.storage.local.get(cts);
	if (Object.keys(localStorage).length === 0) localStorage = false;
	if (cts && localStorage) {
		sendResponse(localStorage);
	} else if (cts) {
		sendResponse(false);
	} else if (request === "startCapture") {
		startCapture(tab.id);
	}
}

let creating;
async function setupOffscreenDocument(path) {
	const offscreenUrl = chrome.runtime.getURL(path);
	const contexts = await chrome.runtime.getContexts({ contextTypes: ["OFFSCREEN_DOCUMENT"], documentUrls: [offscreenUrl] });
	if (contexts.length === 0) {
		if (creating) {
			await creating;
		} else {
			creating = chrome.offscreen.createDocument({ url: path, reasons: ["USER_MEDIA"], justification: "Recording tab audio" });
			await creating;
			creating = null;
		}
	}
}

async function startCapture(tabid) {
	var mstorage = await chrome.storage.local.get(tabid.toString());
	if (mstorage && Object.keys(mstorage).length === 0) {
		await setupOffscreenDocument("offscreen.html");
		var capdata = {};
		capdata[tabid.toString()] = Date.now();
		chrome.storage.local.set(capdata);
		chrome.storage.sync.get({ maxTime: 3600000, muteTab: false, format: "mp3", quality: 192, limitRemoved: false }, (options) => {
			let time = options.maxTime;
			if (time > 3600000) time = 3600000;
			chrome.tabCapture.getMediaStreamId({ targetTabId: tabid }).then((streamId) => {
				chrome.runtime.sendMessage({ action: "audioCapture", data: [time, options.muteTab, options.format, options.quality, options.limitRemoved, streamId, tabid] });
			});
		});
	}
	chrome.runtime.sendMessage({ captureStarted: tabid, startTime: Date.now() });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	getCurrentTab().then((resp) => {
		chrome.storage.local.get(resp.id.toString()).then((dat) => {
			if (Object.keys(dat).length === 0) dat = false;
			if (resp.id && dat) {
				sendResponse(resp);
			} else if (request === "startCapture") {
				startCapture(resp.id);
				sendResponse(true);
			} else {
				sendResponse(false);
			}
		});
	});
	return true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.text === "clearStorage") {
		chrome.storage.local.remove(message.tab.toString());
	}
	if (message.text === "popup opened") {
		getCurrentTab().then((resp) => {
			chrome.storage.local.get(resp.id.toString()).then((dat) => {
				if (Object.keys(dat).length === 0) {
					chrome.runtime.sendMessage({ action: "stopCapture", tab: resp.id });
				}
			});
		});
	}
	if (message.currentTab) {
		chrome.runtime.sendMessage({ action: "popupOpened", tab: message.currentTab });
	}
	if (message.type === "createCompleteTab") {
		var currentTabName = "";
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			currentTabName = tabs[0].title;
		});
		var requestTime = message.time;
		chrome.tabs.create({ url: "complete.html", active: true }, (tab) => {
			let completeCallback = () => {
				chrome.tabs.sendMessage(tab.id, { type: "createTab", format: message.format, audioURL: message.audioURL, startID: message.startID, tab: message.tab, time: requestTime, tabName: currentTabName });
			};
			chrome.runtime.sendMessage({ action: "stopCapture", tab: tab.id }).then(() => {
				setTimeout(completeCallback, 500);
			});
		});
	}
	if (message.command === "stopCapture") {
		chrome.runtime.sendMessage({ popup: "stopCapture", tab: message.tab });
	}
});

chrome.commands.onCommand.addListener((command) => {
	if (command === "start") {
		getCurrentTab().then((resp) => {
			startCapture(resp.id);
		});
	}
	if (command === "stop") {
		getCurrentTab().then((resp) => {
			chrome.runtime.sendMessage({ action: "stopCapture", tab: resp.id });
			chrome.runtime.sendMessage({ command: "stopCapture", tab: resp.id });
		});
	}
});

let sampleRate, numChannels, recLength = 0, recBuffers = [];

function init(config) {
	sampleRate = config.sampleRate;
	numChannels = config.numChannels;
	initBuffers();
}

function record(inputBuffer) {
	for (var channel = 0; channel < numChannels; channel++) {
		recBuffers[channel].push(inputBuffer[channel]);
	}
	recLength += inputBuffer[0].length;
}

function exportWAV(type) {
	let interleaved, buffers = [];
	for (let channel = 0; channel < numChannels; channel++) {
		buffers.push(mergeBuffers(recBuffers[channel], recLength));
	}
	interleaved = numChannels === 2 ? interleave(buffers[0], buffers[1]) : buffers[0];
	let dataview = encodeWAV(interleaved);
	let audioBlob = new Blob([dataview], { type: type });
	this.postMessage({ command: "exportWAV", data: audioBlob });
}

function getBuffer() {
	let buffers = [];
	for (let channel = 0; channel < numChannels; channel++) {
		buffers.push(mergeBuffers(recBuffers[channel], recLength));
	}
	this.postMessage({ command: "getBuffer", data: buffers });
}

function clear() {
	recLength = 0;
	recBuffers = [];
	initBuffers();
}

function initBuffers() {
	for (let channel = 0; channel < numChannels; channel++) {
		recBuffers[channel] = [];
	}
}

function mergeBuffers(recBuffers, recLength) {
	let result = new Float32Array(recLength), offset = 0;
	for (let i = 0; i < recBuffers.length; i++) {
		result.set(recBuffers[i], offset);
		offset += recBuffers[i].length;
	}
	return result;
}

function interleave(inputL, inputR) {
	let length = inputL.length + inputR.length, result = new Float32Array(length), index = 0, inputIndex = 0;
	while (index < length) {
		result[index++] = inputL[inputIndex];
		result[index++] = inputR[inputIndex];
		inputIndex++;
	}
	return result;
}

function floatTo16BitPCM(output, offset, input) {
	for (let i = 0; i < input.length; i++, offset += 2) {
		let s = Math.max(-1, Math.min(1, input[i]));
		output.setInt16(offset, s < 0 ? s * 32768 : s * 32767, true);
	}
}

function writeString(view, offset, string) {
	for (let i = 0; i < string.length; i++) {
		view.setUint8(offset + i, string.charCodeAt(i));
	}
}

function encodeWAV(samples) {
	let buffer = new ArrayBuffer(44 + samples.length * 2), view = new DataView(buffer);
	writeString(view, 0, "RIFF");
	view.setUint32(4, 36 + samples.length * 2, true);
	writeString(view, 8, "WAVE");
	writeString(view, 12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, numChannels, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * 4, true);
	view.setUint16(32, numChannels * 2, true);
	view.setUint16(34, 16, true);
	writeString(view, 36, "data");
	view.setUint32(40, samples.length * 2, true);
	floatTo16BitPCM(view, 44, samples);
	return view;
}

onmessage = function (e) {
	switch (e.data.command) {
		case "init":
			init(e.data.config);
			break;
		case "record":
			record(e.data.buffer);
			break;
		case "exportWAV":
			exportWAV(e.data.type);
			break;
		case "getBuffer":
			getBuffer();
			break;
		case "clear":
			clear();
			break;
	}
};

chrome.runtime.setUninstallURL("https://meetingtv.us/cacuninstall");
chrome.runtime.onInstalled.addListener(function (details) {
	if (details.reason === "install" || details.reason === "update") {
		chrome.tabs.create({ url: "https://meetingtv.us/cacupdate" });
	}
});