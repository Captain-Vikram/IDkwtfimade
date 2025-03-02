document.addEventListener("DOMContentLoaded", () => {
	const mute = document.getElementById("mute"),
		maxTime = document.getElementById("maxTime"),
		save = document.getElementById("save"),
		status = document.getElementById("status"),
		mp3Select = document.getElementById("mp3"),
		wavSelect = document.getElementById("wav"),
		quality = document.getElementById("quality"),
		qualityLi = document.getElementById("qualityLi"),
		limitRemoved = document.getElementById("removeLimit");
	let currentFormat;

	chrome.storage.sync.get(
		{
			muteTab: !1,
			maxTime: 36e5,
			format: "mp3",
			quality: 192,
			limitRemoved: !1,
		},
		(options) => {
			mute.checked = options.muteTab;
			limitRemoved.checked = options.limitRemoved;
			maxTime.disabled = options.limitRemoved;
			maxTime.value = options.maxTime / 6e4;
			currentFormat = options.format;
			if ("mp3" === options.format) {
				mp3Select.checked = !0;
				qualityLi.style.display = "block";
			} else {
				wavSelect.checked = !0;
			}
			if ("96" === options.quality) {
				quality.selectedIndex = 0;
			} else if ("192" === options.quality) {
				quality.selectedIndex = 1;
			} else {
				quality.selectedIndex = 2;
			}
		}
	);

	mute.onchange = () => {
		status.innerHTML = "";
	};

	maxTime.onchange = () => {
		status.innerHTML = "";
		if (maxTime.value < 1) {
			maxTime.value = 1;
		} else if (isNaN(maxTime.value)) {
			maxTime.value = 60;
		}
	};

	mp3Select.onclick = () => {
		currentFormat = "mp3";
		qualityLi.style.display = "block";
		status.innerHTML = "";
	};

	wavSelect.onclick = () => {
		currentFormat = "wav";
		qualityLi.style.display = "none";
		status.innerHTML = "";
	};

	quality.onchange = (e) => {
		status.innerHTML = "";
	};

	limitRemoved.onchange = () => {
		if (limitRemoved.checked) {
			maxTime.disabled = !0;
			status.innerHTML = "WARNING: Recordings that are too long may not save properly!";
		} else {
			maxTime.disabled = !1;
			status.innerHTML = "";
		}
	};

	save.onclick = () => {
		chrome.storage.sync.set({
			muteTab: mute.checked,
			maxTime: 6e4 * maxTime.value,
			format: currentFormat,
			quality: quality.value,
			limitRemoved: limitRemoved.checked,
		});
		status.innerHTML = "Settings saved!";
	};
});