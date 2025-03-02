document.addEventListener("DOMContentLoaded", () => {
	const encodeProgress = document.getElementById("encodeProgress"),
		saveButton = document.getElementById("saveCapture"),
		timestampButton = document.getElementById("timestampedFile"),
		closeButton = document.getElementById("close"),
		review = document.getElementById("review"),
		status = document.getElementById("status"),
		statusTime = document.getElementById("statusTime");
	let format, encoding = !1;
	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request.audioURL, "createTab" === request.type) {
			format = request.format;
			let startID = request.startID;
			if (status.innerHTML = "Please wait...", request.tabName && (request.tabName = request.tabName.slice(0, 60), document.title = request.tabName), closeButton.onclick = () => {
				chrome.runtime.sendMessage({
					cancelEncodeID: startID
				}), chrome.tabs.getCurrent((tab => {
					chrome.tabs.remove(tab.id)
				}))
			}, request.audioURL) {
				encodeProgress.style.width = "100%", status.innerHTML = "File ready!";
				var newFileName, fileExtension = request.audioURL.split(".").pop();
				newFileName = request.audioURL, request.tabName && (request.tabName = request.tabName.slice(0, 60), newFileName = request.tabName + fileExtension), request.tabName && (request.tabName = request.tabName.slice(0, 60), document.title = newFileName + " - Complete", status.innerHTML = newFileName + " - Complete"), generateSave(newFileName)
			} else encoding = !0
		}
		var url;

		function generateSave(url) {
			saveButton.onclick = () => {
				var fileTitle = document.title;
				fileTitle || (fileTitle = new Date(Date.now()).toDateString()), (fileTitle = fileTitle.replace(/[^a-z0-9]/gi, "").toLowerCase()).length > 50 && (fileTitle = fileTitle.slice(0, 50)), fileTitle.length < 1 && (fileTitle = new Date(Date.now()).toDateString());
				try {
					new URL(url)
				} catch (e) {
					chrome.tabs.create({
						url: "mailto:radioshots@gmail.com?subject=Chrome%20Audio%20Capture%20Feedback&body=Please%20let%20us%20know%20what%20happened%20so%20we%20can%20improve%20it.%0A" + document.title + "%0A" + window.location.href + "%0AHere%20is%20what%20we%20know%20%3A%0A" + e
					})
				}
				chrome.downloads.download({
					url: url,
					filename: `${fileTitle}.${format}`,
					saveAs: !0
				}).then((downloadId => {
					chrome.downloads.onChanged.addListener((function downloadListener(delta) {
						if (delta.id === downloadId) {
							var fileTime = "00:00";
							statusTime && (fileTime = statusTime.innerHTML.split("Duration: ")[1]), delta.error && (chrome.tabs.create({
								url: "mailto:radioshots@gmail.com?subject=Chrome%20Audio%20Capture%20Feedback&body=Please%20let%20us%20know%20what%20happened%20so%20we%20can%20improve%20it.%0A" + fileTime + "%0A" + document.title + "%0A" + window.location.href + "%0AHere%20is%20what%20we%20know%20%3A%0A" + delta.error.current
							}), chrome.downloads.onChanged.removeListener(downloadListener)), delta.state && "complete" === delta.state.current && chrome.downloads.onChanged.removeListener(downloadListener)
						}
					}))
				}))
			}, saveButton.style.display = "inline-block"
		}
		"encodingComplete" === request.type && encoding && (encoding = !1, newFileName = request.audioURL, newFileName = document.title + fileExtension, status.innerHTML = document.title + " - Complete", statusTime.innerHTML = "Duration: " + parseTime(request.duration), encodeProgress.style.width = "100%", generateSave(request.audioURL), url = request.audioURL, timestampButton.onclick = () => {
			var fileTitle = new Date(Date.now()).toDateString();
			chrome.downloads.download({
				url: url,
				filename: `${fileTitle}.${format}`,
				saveAs: !0
			})
		}, timestampButton.style.display = "inline-block"), "encodingProgress" === request.type && encoding && (encodeProgress.style.width = 100 * request.progress + "%", statusTime.innerHTML = "Duration: " + parseTime(request.duration))
	}), review.onclick = () => {
		chrome.tabs.create({
			url: "https://chrome.google.com/webstore/detail/chrome-audio-capture/kfokdmfpdnokpmpbjhjbcabgligoelgp/reviews"
		})
	}, saveButton.hasAttribute("onclick") || (saveButton.onclick = () => {
		var fileTime = "00:00";
		statusTime && (fileTime = statusTime.innerHTML.split("Duration: ")[1]), chrome.tabs.create({
			url: "mailto:radioshots@gmail.com?subject=Chrome%20Audio%20Capture%20Feedback&body=Please%20let%20us%20know%20what%20you%20think%20of%20Chrome%20Audio%20Capture%20and%20how%20we%20can%20improve%20it.%0Afiletime%20" + fileTime + "%0A" + document.title + "%0A" + window.location.href + "%0ANo%20download%20process%20started"
		})
	}), timestampButton.hasAttribute("onclick") || (timestampButton.onclick = () => {
		var fileTime = "00:00";
		statusTime && (fileTime = statusTime.innerHTML.split("Duration: ")[1]), chrome.tabs.create({
			url: "mailto:radioshots@gmail.com?subject=Chrome%20Audio%20Capture%20Feedback&body=Please%20let%20us%20know%20what%20you%20think%20of%20Chrome%20Audio%20Capture%20and%20how%20we%20can%20improve%20it.%20filetime%0A" + fileTime + "%0A" + document.title + "%0A" + window.location.href + "%0ANo%20download%20process%20started"
		})
	})
});
const parseTime = function (time) {
	let minutes = Math.floor(time / 1e3 / 60),
		seconds = Math.floor(time / 1e3 % 60);
	return minutes < 10 && minutes >= 0 ? minutes = "0" + minutes : minutes < 0 && (minutes = "00"), seconds < 10 && seconds >= 0 ? seconds = "0" + seconds : seconds < 0 && (seconds = "00"), `${minutes}:${seconds}`
};