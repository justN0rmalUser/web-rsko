
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "getFullHTML":
            sendResponse(document.documentElement.outerHTML);
            break;
        case "parseHTML":
            // todo
            sendResponse(1);
            break;
        }
    }
);
