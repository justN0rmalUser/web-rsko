export async function getTab() {
    return await chrome.tabs.query({
        active: true,
        currentWindow: true
    }).then((tabs) => {
        return tabs[0];
    })
};

export const CONFIG = {
    HOST_URL: "kuban.rossko.ru", // FIXME
    PATH_URL: "/cart/",
    MAX_LENGTH: 80,
    SERVER_URL: "http://127.0.0.1:8080/data", // FIXME
    AUTH: "437219047" // FIXME
};