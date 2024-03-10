// Listens for the extension's installation and browser action clicks, and communicates with content scripts.

chrome.runtime.onInstalled.addListener(() => {
    console.log('Dyslexia Friendly extension installed.');
  });
  
  // Function to send a message to the content script in the active tab.
  function sendMessageToContentScript(message) {
  // Query the current active tab
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // Safety check for active tabs
        if (tabs.length > 0) {
            // Send message to the content script of the active tab
            chrome.tabs.sendMessage(tabs[0].id, message);
        }
    });
  }
  
  function setPageStyle() {
    chrome.tabs.sendMessage(tab.id, {action: "toggleDyslexiaFriendly"});
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'toggleDyslexicMode') {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "toggleDyslexicMode", fontDetails: request.fontDetails});
        });
    }

    // More messages
});