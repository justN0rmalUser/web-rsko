export async function getTab() {
    return await chrome.tabs.query({
        active: true,
        currentWindow: true
    }).then((tabs) => {
        return tabs[0];
    })
}