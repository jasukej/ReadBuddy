// Listens for the extension's installation and browser action clicks, and communicates with content scripts.

chrome.runtime.onInstalled.addListener(() => {
    console.log('Dyslexia Friendly extension installed.');
    // Here, you could set default values for your extension's settings if needed.
  });
  
  chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      function: setPageStyle
    });
  });
  
  function setPageStyle() {
    chrome.tabs.sendMessage(tab.id, {action: "toggleDyslexiaFriendly"});
  }