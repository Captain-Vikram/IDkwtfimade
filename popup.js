let interval, timeLeft;

// Replace: chrome.tabs.getCurrent().id (not reliable in popup)
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.runtime.sendMessage({ text: "popup opened", tab: tabs[0].id });
});

const displayStatus = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const status = document.getElementById("status");
        const timeRem = document.getElementById("timeRem");
        const startButton = document.getElementById("start");
        const finishButton = document.getElementById("finish");
        const cancelButton = document.getElementById("cancel");

        finishButton.tab = tabs[0].id;

        // Add error handling for callback
        chrome.runtime.sendMessage({ currentTab: tabs[0].id }, (response) => {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError.message);
                return;
            }
            if (response) {
                if (response.status === "complete") {
                    startButton.style.display = "block";
                }
                response = parseInt(response.id);
            } else {
                startButton.style.display = "block";
            }
        });
    });
};

const parseTime = function (time) {
    let minutes = Math.floor(time / 1000 / 60);
    let seconds = Math.floor(time / 1000 % 60);

    if (minutes < 10 && minutes >= 0) {
        minutes = "0" + minutes;
    } else if (minutes < 0) {
        minutes = "00";
    }

    if (seconds < 10 && seconds >= 0) {
        seconds = "0" + seconds;
    } else if (seconds < 0) {
        seconds = "00";
    }

    return `${minutes}:${seconds}`;
};

function stopCaptureFunc(tabid) {
    const status = document.getElementById("status");
    const cancelButton = document.getElementById("cancel");
    const finishButton = document.getElementById("finish");
    const startButton = document.getElementById("start");
    const timeRem = document.getElementById("timeRem");

    finishButton.style.display = "none";
    cancelButton.style.display = "none";
    startButton.style.display = "block";

    var interval = timeRem.interval;
    clearInterval(interval);

    status.innerHTML = "";
    timeRem.innerHTML = "";
}

function updateTimer(tab) {
    chrome.storage.local.get(tab.toString()).then((data) => {
        let time = data[tab.toString()];
        const timeRem = document.getElementById("timeRem");
        const cancelButton = document.getElementById("cancel");
        const finishButton = document.getElementById("finish");
        const startButton = document.getElementById("start");

        if (parseInt(time) && time > 0) {
            chrome.storage.sync.get({ maxTime: 3600000, limitRemoved: false }, (options) => {
                if (options.maxTime > 3600000) {
                    chrome.storage.sync.set({ maxTime: 3600000 });
                    timeLeft = 3600000 - (Date.now() - time);
                } else {
                    timeLeft = options.maxTime - (Date.now() - time);
                }

                const status = document.getElementById("status");
                status.innerHTML = "Tab is currently being captured";

                if (options.limitRemoved) {
                    clearInterval(timeRem.interval);
                    timeRem.innerHTML = `${parseTime(Date.now() - time)}`;
                    finishButton.style.display = "block";
                    cancelButton.style.display = "block";
                    startButton.style.display = "none";
                    interval = setInterval(() => {
                        timeLeft -= 1000;
                        timeRem.innerHTML = `${parseTime(Date.now() - time)}`;
                    }, 1000);
                    timeRem.interval = interval;
                } else {
                    timeRem.innerHTML = `${parseTime(timeLeft)} remaining`;
                    finishButton.style.display = "block";
                    cancelButton.style.display = "block";
                    startButton.style.display = "none";
                    clearInterval(timeRem.interval);
                    interval = setInterval(() => {
                        timeLeft -= 1000;
                        timeRem.innerHTML = `${parseTime(timeLeft)} remaining`;
                    }, 1000);
                    timeRem.interval = interval;
                }
            });
        }
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const status = document.getElementById("status");
        const timeRem = document.getElementById("timeRem");
        const startButton = document.getElementById("start");
        const finishButton = document.getElementById("finish");
        const cancelButton = document.getElementById("cancel");

        var interval;

        if (message.captureStarted && message.captureStarted === tabs[0].id) {
            chrome.storage.sync.get({ maxTime: 3600000, limitRemoved: false }, (options) => {
                if (options.maxTime > 3600000) {
                    chrome.storage.sync.set({ maxTime: 3600000 });
                    timeLeft = 3600000 - (Date.now() - message.startTime);
                } else {
                    timeLeft = options.maxTime - (Date.now() - message.startTime);
                }

                status.innerHTML = "Tab is currently being captured";

                if (options.limitRemoved) {
                    timeRem.innerHTML = `${parseTime(Date.now() - message.startTime)}`;
                    interval = setInterval(() => {
                        timeLeft -= 1000;
                        timeRem.innerHTML = `${parseTime(Date.now() - message.startTime)}`;
                    }, 1000);
                    timeRem.interval = interval;
                } else {
                    timeRem.innerHTML = `${parseTime(timeLeft)} remaining`;
                    interval = setInterval(() => {
                        timeLeft -= 1000;
                        timeRem.innerHTML = `${parseTime(timeLeft)} remaining`;
                    }, 1000);
                    timeRem.interval = interval;
                }
            });

            finishButton.style.display = "block";
            cancelButton.style.display = "block";
            startButton.style.display = "none";
        } else if (message.captureStopped && message.captureStopped === tabs[0].id || message.action === "cancelCapture" || message.popup === "stopCapture") {
            status.innerHTML = "";
            finishButton.style.display = "none";
            cancelButton.style.display = "none";
            startButton.style.display = "block";
            timeRem.innerHTML = "";
            chrome.storage.local.remove(tabs[0].id.toString());
            interval = timeRem.interval;
            clearInterval(interval);
        }
        sendResponse(); // Acknowledge message
        return true; // Keep the message port open
    });
});

document.addEventListener("DOMContentLoaded", function () {
    displayStatus();

    const startKey = document.getElementById("startKey");
    const endKey = document.getElementById("endKey");
    const startButton = document.getElementById("start");
    const finishButton = document.getElementById("finish");
    const timeRem = document.getElementById("timeRem");
    const cancelButton = document.getElementById("cancel");
    const status = document.getElementById("status");

    startButton.onclick = () => {
        finishButton.style.display = "block";
        cancelButton.style.display = "block";
        startButton.style.display = "none";
        chrome.runtime.sendMessage("startCapture");
    };

    finishButton.onclick = () => {
        finishButton.style.display = "none";
        cancelButton.style.display = "none";
        startButton.style.display = "block";
        var interval = timeRem.interval;
        clearInterval(interval);
        status.innerHTML = "";
        timeRem.innerHTML = "";
        var tabid = finishButton.tab;
        chrome.runtime.sendMessage({ command: "stopCapture", tab: tabid });
    };

    cancelButton.onclick = () => {
        var tabid = finishButton.tab;
        chrome.runtime.sendMessage({ action: "cancelCapture", tab: tabid });
        finishButton.style.display = "none";
        cancelButton.style.display = "none";
        startButton.style.display = "block";
        var interval = timeRem.interval;
        clearInterval(interval);
        status.innerHTML = "";
        timeRem.innerHTML = "";
    };

    chrome.runtime.getPlatformInfo((info) => {
        if (info.os === "mac") {
            startKey.innerHTML = "Command + Shift + S to start capture on current tab.";
            endKey.innerHTML = "Command + Shift + X to stop capture on current tab";
        } else {
            startKey.innerHTML = "Ctrl + Shift + S to start capture on current tab";
            endKey.innerHTML = "Ctrl + Shift + X to stop capture on current tab";
        }
    });

    document.getElementById("options").onclick = () => {
        chrome.runtime.openOptionsPage();
    };
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "popupOpened") {
        updateTimer(message.tab);
        const status = document.getElementById("status");
        const timeRem = document.getElementById("timeRem");
        const startButton = document.getElementById("start");
        const finishButton = document.getElementById("finish");
        const cancelButton = document.getElementById("cancel");
        var tabId = finishButton.tab;
        status.innerHTML = "";
        finishButton.style.display = "none";
        cancelButton.style.display = "none";
        startButton.style.display = "block";
        timeRem.innerHTML = "";
        var interval = timeRem.interval;
        clearInterval(interval);
        sendResponse(); // Acknowledge message
        return true; // Keep the message port open
    }

    if (message.action === "stopCapture") {
        stopCaptureFunc(tabId);
        sendResponse();
        return true;
    }
});