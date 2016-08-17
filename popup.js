var bg = chrome.extension.getBackgroundPage();
if (bg == null)
    console.log('No background page');
else {
    bg.buildIndex();
}
