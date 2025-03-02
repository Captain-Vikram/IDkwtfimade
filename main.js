// Get the user's language and set the link text accordingly
const language = window.navigator.userLanguage || window.navigator.language;
let link_text = language === "it" 
    ? "👋 Hey, CLICCA QUI Con il TASTO DESTRO e poi Salva link come..." 
    : "👋 Hey, RIGHT-CLICK here, then click Save link as...";

const url = window.location.href;

// Scroll to the bottom of the page
function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
}

// Check if there is a fixed or sticky element at the top of the page
function hasFixedElementAtTop() {
    const allElements = document.body.getElementsByTagName("*");
    for (let element of allElements) {
        const style = window.getComputedStyle(element);
        const position = style.getPropertyValue("position");
        const top = style.getPropertyValue("top");

        if ((position === "fixed" || position === "sticky") && (top === "0px" || top === "0")) {
            element.style.top = "60px";
            const rect = element.getBoundingClientRect();
            if (rect.top === 0 && rect.height > 0) {
                return rect.height + 20;
            }
        }
    }
    return 20;
}

// Show results based on the URL
function showResults() {
    if (url.includes("rainfocus")) {
        webinarText.style.height = "65px";
    } else if (url.includes("meet.google.com") || url.includes("picard.replit.dev")) {
        document.body.style.overflow = "visible";
        document.documentElement.style.overflowY = "visible";

        const forLink = document.getElementById("forLink");
        const scrollLink = document.getElementById("scrollLink");
        const webinaraLink = document.getElementById("webinaraLink");
        const scrollDown = document.getElementById("scrollDown");
        const webinarData = document.getElementById("webinarDataHeader");
        const webinarFooter = document.getElementById("webinarFooterHeader");
        const webinarText = document.getElementById("webinarText");

        if (forLink) forLink.href = "";
        if (scrollLink) scrollLink.href = "";
        if (webinaraLink) webinaraLink.href = "";
        if (scrollDown) scrollDown.href = "";

        const config = {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true,
            attributeOldValue: true,
            characterDataOldValue: true,
            attributeFilter: ["class", "style"]
        };

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains("c-wiz") && !isObservingCWiz) {
                        isObservingCWiz = true;
                        observer.disconnect();
                        node.style.background = "transparent";
                        node.style.height = "70%";
                        observer.observe(document.body, config);
                    }
                });
            });
        });

        observer.observe(document.body, config);

        const footerHeader = document.getElementById("webinarFooterHeader");
        if (footerHeader) {
            footerHeader.style.position = "relative";
            footerHeader.style.marginTop = "350px";
            footerHeader.style.display = "inline-block";
        }

        if (forLink) {
            forLink.addEventListener("click", (e) => {
                e.preventDefault();
                document.querySelector("#webinarFooterHeader").scrollIntoView({ behavior: "smooth" });
            });
        }

        if (scrollLink) {
            scrollLink.addEventListener("click", (e) => {
                e.preventDefault();
                document.querySelector("#webinarFooterHeader").scrollIntoView({ behavior: "smooth" });
            });
        }

        if (webinaraLink) {
            webinaraLink.addEventListener("click", (e) => {
                e.preventDefault();
                document.querySelector("#webinarFooterHeader").scrollIntoView({ behavior: "smooth" });
            });
        }

        if (scrollDown) {
            scrollDown.addEventListener("click", (e) => {
                e.preventDefault();
                document.querySelector("#webinarFooterHeader").scrollIntoView({ behavior: "smooth" });
            });
        }

        if (!(url.includes("landing") || url.includes("about") || url.includes("intl") || url.includes("_meet") || url.includes("about"))) {
            document.body.style.marginTop = "0px";
            webinarData.style.visibility = "hidden";
            webinarFooter.style.visibility = "hidden";

            const intervalId = setInterval(() => {
                const ppl = document.getElementById("ppl");
                const topMargin = window.getComputedStyle(document.body).marginTop;
                const topMarginMeasure = parseInt(topMargin.replace("px", ""));

                if (Array.from(document.getElementsByTagName("h1")).find(el => el.innerText.trim() === "You left the meeting")) {
                    clearInterval(intervalId);
                    document.body.style.marginTop = topMarginMeasure + 60 + "px";
                    webinarFooter.style.display = "visible";
                    webinarFooter.style.visibility = "visible";
                    webinarData.style.display = "visible";
                    webinarData.style.visibility = "visible";
                    document.body.style.marginTop = topMarginMeasure + 60 + "px";
                    forLink.onclick = scrollToBottom;
                    scrollLink.onclick = scrollToBottom;
                    ppl.style.lineHeight = "16px";
                    ppl.style.fontSize = "18px";
                    webinarFooter.style.marginTop = "350px";
                    webinarData.style.position = "fixed";
                    webinarData.style.top = "10px";
                    webinarData.style.marginTop = "0px";
                    webinarData.style.height = "55px";
                    document.body.style.overflow = "visible";
                    document.documentElement.style.overflowY = "visible";
                    document.body.style.marginTop = topMarginMeasure + 60 + "px";
                    hasFixedElementAtTop();
                }
            }, 1000);
        }
    } else if (url.includes("app.zoom.us") && url.includes("/wc/") && !url.includes("home")) {
        webinarData.style.visibility = "hidden";
        webinarFooter.style.visibility = "hidden";
        document.body.style.marginTop = "0px";

        setInterval(() => {
            if (window.location.href.includes("app.zoom.us/wc/home")) {
                const topMargin = window.getComputedStyle(document.body).marginTop;
                parseInt(topMargin.replace("px", ""));
                webinarText.style.display = "visible";
                webinarFooter.style.display = "visible";
                webinarText.style.visibility = "visible";
                webinarFooter.style.visibility = "visible";
                webinarData.style.display = "visible";
                webinarData.style.visibility = "visible";
                document.body.style.marginTop = "60px";
                document.body.style.overflow = "visible";
                document.documentElement.style.overflowY = "visible";
                webinarData.style.visibility = "visible";
                webinarFooter.style.visibility = "visible";
                webinarFooter.style.display = "visible";
                webinarData.style.display = "visible";
                webinarData.style.marginTop = "-60px";
            }

            if ((window.location.href.includes("app.zoom.us") && window.location.href.includes("start")) || 
                (window.location.href.includes("app.zoom.us") && window.location.href.includes("join"))) {
                webinarData.style.visibility = "hidden";
                webinarFooter.style.visibility = "hidden";
                document.body.style.overflow = "hidden";
                document.body.style.marginTop = "0px";
            }
        }, 2000);
    } else if (url.includes("zoom.us")) {
        setInterval(() => {
            if (window.location.href.includes("app.zoom.us/wc/home")) {
                document.body.style.marginTop = "60px";
                document.body.style.overflow = "visible";
                document.documentElement.style.overflowY = "visible";
                webinarData.style.visibility = "visible";
                webinarFooter.style.visibility = "visible";
                webinarFooter.style.display = "visible";
                webinarData.style.display = "visible";
            }

            if ((window.location.href.includes("app.zoom.us") && window.location.href.includes("start")) || 
                (window.location.href.includes("app.zoom.us") && window.location.href.includes("join"))) {
                webinarData.style.visibility = "hidden";
                webinarFooter.style.visibility = "hidden";
                document.body.style.overflow = "hidden";
                document.body.style.marginTop = "0px";
            }
        }, 2000);
    } else if (url.includes("app.zoom.us/wc/home")) {
        document.body.style.overflow = "visible";
        document.documentElement.style.overflowY = "visible";
        document.body.style.marginTop = topMarginMeasure + 60 + "px";
    } else if (url.includes("teams.live.com")) {
        document.body.style.overflow = "visible";
        document.documentElement.style.overflowY = "visible";
    } else {
        const headerLength = hasFixedElementAtTop();
    }
}

// Fetch data from a URL
function fetchData(url, settings = {}) {
    let jsonUrl = `https://us-central1-webinarstvus.cloudfunctions.net/webinarJSON?url=${encodeURIComponent(url)}`;
    let zmGlobalMrktId = window.zmGlobalMrktId;

    if (settings.zoomGlobalMrktId) {
        jsonUrl = `https://us-central1-webinarstvus.cloudfunctions.net/webinarJSON/show?url=${url}`;
        zmGlobalMrktId = settings.zoomGlobalMrktId;
        const topMargin = window.getComputedStyle(document.body).marginTop;
        parseInt(topMargin.replace("px", ""));
        if (document.body.style.marginTop === "0px") {
            document.body.style.marginTop = "170px";
            document.getElementById("webinarDataHeader").style.marginTop = "-170px";
        }
    }

    if (zmGlobalMrktId) {
        jsonUrl += `&zmGlobalMrktId=${zmGlobalMrktId}`;
    }

    if (settings.showTopReco) {
        jsonUrl += `&showTopReco=${settings.showTopReco}`;
    }

    if (settings.showBottomReco) {
        jsonUrl += `&showBottomReco=${settings.showBottomReco}`;
    }

    if (settings.defaultCategory) {
        jsonUrl += `&defaultCategory=${settings.defaultCategory}`;
    }

    if (settings.forceFillRate) {
        jsonUrl += `&forceFillRate=${settings.forceFillRate}`;
    }

    return fetch(jsonUrl)
        .then(response => response)
        .catch(error => "")
        .then(data => {
            const ppl = document.getElementById("ppl");
            const webinarData = document.getElementById("webinarDataHeader");
            const webinarFooter = document.getElementById("webinarFooterHeader");

            return data.text().then(data => {
                if (ppl) {
                    ppl.innerHTML = data;
                    if (data !== "") {
                        document.body.style.overflow = "visible";
                        document.documentElement.style.overflowY = "visible";
                        webinarData.style.visibility = "visible";
                        webinarFooter.style.visibility = "visible";
                        showResults();
                    }
                }
            });
        })
        .catch(error => "");
}

// Main function to initialize the script
function mbmain(meetEndingPage) {
    const url = window.location.href;
    const providers = [
        "zoom.us", "gotowebinar.com", "webex.com", "teams.microsoft.com", "webinarninja.com",
        "clickmeeting.com", "livestorm.co", "app.sequel.io", "coro.wistia.com", "easywebinar.com",
        "on24.com", "sessions.us", "webinarjam.com", "ringcentral.com", "kaltura.com", "demio.com",
        "rainfocus.com", "gotowebinar.com", "stova.io", "cvent.com", "goldcast.io", "wsw.com",
        "airmeet.com", "companywebcast.com", "workcast.com", "goto.com", "workspace.google.com",
        "teams.live.com", "picard.replit.dev"
    ];

    let providerCon = false;
    for (let i = 0; i < providers.length; i++) {
        if (url.includes(providers[i])) {
            providerCon = providers[i];
            break;
        }
    }

    if (url.includes("meet.google.com") && meetEndingPage) {
        providerCon = "meet.google.com";
    }

    if (providerCon) {
        const baseUrl = url.split("?")[0];
        const provider = providers.find(p => baseUrl.includes(p));

        if (!meetEndingPage && !provider) return;

        const webinarData = document.createElement("div");
        webinarData.id = "webinarDataHeader";
        webinarData.style.marginBottom = "20px";
        webinarData.style.backgroundColor = "#f7f7f7";
        webinarData.style.border = "1px solid #e0e0e0";
        webinarData.style.borderRadius = "5px";
        webinarData.style.textAlign = "left";
        webinarData.style.color = "#333";
        webinarData.style.position = "fixed";
        webinarData.style.zIndex = 400;
        webinarData.style.width = "100%";
        webinarData.style.marginBottom = "0px";
        webinarData.style.justifyContent = "left";

        const webinarImage = document.createElement("img");
        webinarImage.style.width = "20px";
        webinarImage.style.height = "20px";
        webinarImage.style.marginRight = "10px";

        const webinarText = document.createElement("span");
        webinarText.id = "webinarText";
        webinarText.style.verticalAlign = "middle";
        webinarText.style.display = "inline-block";
        webinarText.style.lineHeight = "60px";
        webinarText.style.height = "60px";
        webinarText.style.width = "100%";
        webinarText.style.color = "black";

        const scrollLink = document.createElement("a");
        scrollLink.id = "scrollLink";
        scrollLink.innerHTML = " personalized recommendations  ";
        scrollLink.style.marginTop = "0px";
        scrollLink.style.marginBottom = "0px";
        scrollLink.style.marginLeft = "37px";
        scrollLink.style.fontSize = "20px";
        scrollLink.style.fontWeight = "normal";
        scrollLink.style.textDecoration = "none";
        scrollLink.style.color = "black";
        scrollLink.onclick = () => document.getElementById("ppl").scrollIntoView();

        const scrollDown = document.createElement("a");
        scrollDown.id = "scrollDown";
        scrollDown.innerHTML = "(or scroll to the bottom) ";
        scrollDown.style.marginTop = "0px";
        scrollDown.style.marginBottom = "0px";
        scrollDown.style.fontSize = "20px";
        scrollDown.style.fontWeight = "normal";
        scrollDown.style.textDecoration = "none";
        scrollDown.onclick = () => document.getElementById("ppl").scrollIntoView();
        scrollDown.style.marginLeft = "-5px";
        scrollDown.style.color = "black";

        const forLink = document.createElement("a");
        forLink.id = "forLink";
        forLink.innerHTML = "For ";
        forLink.style.marginTop = "0px";
        forLink.style.marginBottom = "0px";
        forLink.style.fontSize = "20px";
        forLink.style.fontWeight = "normal";
        forLink.style.textDecoration = "none";
        forLink.onclick = () => document.getElementById("ppl").scrollIntoView();
        forLink.style.color = "black";

        const webinaraLink = document.createElement("a");
        webinaraLink.id = "webinaraLink";
        webinaraLink.onclick = () => document.getElementById("ppl").scrollIntoView();
        webinaraLink.style.width = "100%";
        webinaraLink.style.marginLeft = "20px";
        webinaraLink.append(webinarText);

        const closeButton = document.createElement("span");
        closeButton.innerHTML = "x";
        closeButton.style.position = "absolute";
        closeButton.style.top = "5px";
        closeButton.style.right = "15px";
        closeButton.style.cursor = "pointer";
        closeButton.style.fontSize = "20px";
        closeButton.style.color = "#666";
        closeButton.onclick = () => webinarData.style.display = "none";

        const topMargin = window.getComputedStyle(document.body).marginTop;
        const topMarginMeasure = parseInt(topMargin.replace("px", "")) + 60;
        document.body.style.marginTop = topMarginMeasure + 60 + "px";
        webinarData.style.marginTop = `-${topMarginMeasure + 60}px`;
        webinarData.append(closeButton);

        const clickButton = document.createElement("a");
        clickButton.onclick = () => document.getElementById("ppl").scrollIntoView();
        clickButton.innerHTML = "Click Here";
        clickButton.style.display = "inline-block";
        clickButton.style.padding = "10px";
        clickButton.style.textAlign = "center";
        clickButton.style.textDecoration = "none";
        clickButton.style.marginRight = "10px";
        clickButton.style.fontSize = "18px";
        clickButton.style.borderRadius = "5px";
        clickButton.style.fontWeight = "normal";
        clickButton.style.cursor = "pointer";
        clickButton.style.transition = "background-color 0.3s";
        clickButton.style.lineHeight = "60%";
        clickButton.style.color = "white";
        clickButton.style.backgroundColor = "#1976d2";

        const table = document.createElement("table");
        table.style = "justify-content:space-between;align-items:center;width:100%;cellpadding:0;cellspacing:0";

        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        td1.style = "text-align:left;fontSize:25px;font-weight:normal";
        td1.innerHTML = "You might also like:";

        const td2 = document.createElement("td");
        td2.style = "text-align:center; font-size: 13px;font-family: Arial, sans-serif;font-weight:normal";
        td2.innerHTML = "Sponsored";

        tr.appendChild(td1);
        tr.appendChild(td2);
        table.appendChild(tr);

        const image8 = document.createElement("img");
        image8.id = "image8";
        image8.src = chrome.runtime.getURL("images/8.gif");
        image8.style.height = "34px";
        image8.style.marginBottom = "16px";
        image8.style.marginLeft = "-5px";
        image8.style.marginRight = "-2px";
        image8.style.position = "fixed";
        image8.style.top = "10px";

        forLink.style.display = "inline";
        image8.style.display = "inline";
        scrollLink.style.display = "inline";
        clickButton.style.display = "inline";
        scrollDown.style.display = "inline";
        webinaraLink.style.display = "inline";

        webinarText.append(forLink);
        webinarText.append(image8);
        webinarText.append(scrollLink);
        webinarText.append(clickButton);
        webinarText.append(scrollDown);

        const webinarFooter = document.createElement("div");
        webinarData.append(webinaraLink);

        const firstHeaderNode = document.body.firstChild;
        window.scrollTo(0, 0);
        document.body.insertBefore(webinarData, firstHeaderNode);

        webinarFooter.id = "webinarFooterHeader";
        webinarFooter.style.marginTop = "20px";
        webinarFooter.style.marginBottom = "20px";
        webinarFooter.style.padding = "20px";
        webinarFooter.style.backgroundColor = "#f7f7f7";
        webinarFooter.style.border = "1px solid #e0e0e0";
        webinarFooter.style.borderRadius = "5px";
        webinarFooter.style.textAlign = "left";
        webinarFooter.style.fontSize = "20px";
        webinarFooter.style.fontWeight = "bold";
        webinarFooter.style.color = "#333";
        webinarFooter.style.zIndex = 400;
        webinarFooter.style.width = "100%";
        webinarFooter.style.justifyContent = "left";
        webinarFooter.style.scrollMarginTop = "60px";

        const footerNode = document.getElementById("footer_container");
        const miniLayouts = document.getElementsByClassName("mini-layout");
        document.body.appendChild(webinarFooter);

        try {
            document.body.insertBefore(webinarFooter, footerNode);
        } catch (e) {}

        const ppl = document.createElement("div");
        ppl.id = "ppl";
        ppl.style.fontWeight = "normal";
        const urllocation = window.location.href;
        document.body.style.marginTop = "0px";
        webinarData.style.visibility = "hidden";
        webinarFooter.style.visibility = "hidden";

        const pplresp = window.fetchDataObj ? fetchData(urllocation, window.fetchDataObj) : fetchData(urllocation);
        pplresp.then(pplresps => {
            if (pplresps !== "") {
                document.body.style.marginTop = topMarginMeasure + 60 + "px";
                webinarData.style.visibility = "visible";
                webinarFooter.style.visibility = "visible";
            }
        });

        webinarFooter.appendChild(table);
        webinarFooter.appendChild(ppl);

        const legal = document.createElement("div");
        legal.style = "text-align:center;font-size: 10px; color: #666666; font-family: Arial, sans-serif;";
        legal.innerHTML = "MeetingTV is not affiliated with this site";

        if (provider === "zoom.us") {
            legal.innerHTML = "MeetingTV is not affiliated with zoom video communications.";
        }

        const followThrough = document.createElement("span");
        followThrough.style = "font-size: 18px; font-family: Arial, sans-serif;font-weight: normal;";
        followThrough.innerHTML = "Browse more webinars at ";

        const followThrougha = document.createElement("a");
        followThrougha.innerHTML = "MeetingTV.us";
        followThrougha.color = "#0000EE;";
        followThrougha.href = "https://meetingtv.us/catalog";
        followThrougha.style = "font-size: 18px; font-family: Arial, sans-serif;";

        webinarFooter.appendChild(followThrough);
        webinarFooter.appendChild(followThrougha);
        webinarFooter.appendChild(legal);
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "fetchData") {
            window.fetchDataObj = request;
            fetchData(url, request);
            sendResponse({ result: "Function result" });
        }
        return true;
    });
}

// Initialize the script
mbmain();

// Handle specific URLs
if (window.location.href.includes("teams.live.com") || window.location.href.includes("teams.microsoft.com")) {
    document.documentElement.style.position = "static";
}

if (window.location.href.includes("meet.google.com")) {
    const config = {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true,
        attributeOldValue: true,
        characterDataOldValue: true,
        attributeFilter: ["class", "style"]
    };

    new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node && node.querySelector) {
                    if (node.querySelector('div[data-call-ended="true"]')) {
                        mbmain(true);
                    }
                }
            });

            if (mutation.type === "attributes" && mutation.attributeName === "data-call-ended" && mutation.target.getAttribute("data-call-ended") === "true") {
                mbmain(true);
            }
        });
    }).observe(document.body, config);
}

// Main function to handle recording
function mainFunction() {
    if (url.includes("/rec/") && chrome.runtime.getManifest().name.startsWith("ZED")) {
        let counter = 6;

        const div = document.createElement("div");
        div.innerHTML = `
            <div id="zoom-downloader-container" style="position:fixed;z-index:99999999999999999999;right:0px;bottom:0px;width:100%;padding:5px 20px 5px 20px;border:1px solid #2D8CFF;font-size:20px;background-color:#2D8CFF;font-weight:bold;text-align:center;">
                <span id="zoom-downloader-close" style="font-size:12px;cursor:pointer;position:absolute;top:0px;right:0px;color:white;">❌</span>
                <a style="color:white !important" id="zoom-downloader" download="proposed_file_name.mp4"></a>
            </div>
        `;
        document.body.appendChild(div);

        document.getElementById("zoom-downloader-close").addEventListener("click", () => {
            document.getElementById("zoom-downloader-container").style.display = "none";
        }, false);

        function count() {
            if (counter > 0) {
                const loading_text = language === "it" 
                    ? `⏳ Download disponibile in ${counter} secondi` 
                    : `⏳ Download available in ${counter} seconds`;
                document.getElementById("zoom-downloader").innerText = loading_text;
                counter--;
                setTimeout(() => count(), 1000);
            } else {
                const my_link = document.getElementById("zoom-downloader");
                const videosElements = document.getElementsByTagName("video");
                const audioElements = document.getElementsByTagName("audio");

                if (videosElements.length > 0 || audioElements.length > 0) {
                    let linkLocation = videosElements[0] || audioElements[0];

                    if (videosElements.length > 1) {
                        for (let i = 0; i < videosElements.length; i++) {
                            if (videosElements[i].parentElement && videosElements[i].parentElement.parentElement && videosElements[i].parentElement.parentElement.className === "player-view") {
                                linkLocation = videosElements[i];
                                break;
                            }
                        }
                    }

                    const zoom_link = linkLocation.src;
                    my_link.href = zoom_link;
                    my_link.innerHTML = link_text;
                    document.body.style.height = "1500px";
                }

                document.addEventListener("contextmenu", (event) => {
                    event.returnValue = true;
                    event.stopPropagation && event.stopPropagation();
                }, true);
            }
        }

        count();
    }
}

// Add webinar information
function addWebinar() {
    const xpathResult = document.evaluate('//*[text()="You left the meeting"]', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
    if (xpathResult.snapshotItem(0) && !document.getElementById("webdoc")) {
        const webRef = document.createElement("img");
        webRef.src = chrome.runtime.getURL("images/howto.jpg");
        webRef.id = "webdoc";
        webRef.style.width = "73%";
        webRef.style.marginTop = "10px";

        const webHolder = document.createElement("span");
        const webLink = document.createElement("a");
        webLink.href = "https://zoomcorder.com/left";
        webLink.target = "_blank";

        const webText = document.createElement("div");
        webText.innerHTML = `
            Record your next webinar or meeting (without attending!)
            <br style="line-height: 15px" />
            <ul style="margin-top: 5px; margin-bottom: 5px">
                <li>Get a recording sent to you immediately afterwards</li>
                <li>No need to be at PC or phone to record</li>
                <li>Download to watch anytime</li>
                <li>Works with Zoom and Google Meet</li>
            </ul>
            <a style="margin-bottom: 10px" href="https://zoomcorder.com/pricing">Sign Up Now</a>
            <br>
            <br>
            <a href="https://zoomcorder.com"><em class="centered-text">See How Recording Works</em></a>
        `;
        webText.style.fontSize = "26px";
        webText.style.textAlign = "left";

        webLink.append(webRef);
        webHolder.append(webText);
        webHolder.append(webLink);

        xpathResult.snapshotItem(0).parentElement.append(webHolder);
    }
}

// Extract content from a string
function extractContent(s) {
    const span = document.createElement("span");
    span.innerHTML = s;
    return span.textContent || span.innerText;
}

// Initialize the main function
mainFunction();

// Add webinar information if applicable
addWebinar();
