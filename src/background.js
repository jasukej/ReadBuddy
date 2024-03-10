// Listens for the extension's installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Dyslexia Friendly extension installed.');
});

// Listens for messages from other parts of the extension (e.g., popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Check if the received message is to toggle the dyslexic mode
  if (request.action === 'toggleDyslexicMode') {
      // Query the current active tab
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          // Safety check for active tabs
          if (tabs.length > 0) {
              // Send message to the content script of the active tab
              chrome.tabs.sendMessage(tabs[0].id, {action: "toggleDyslexicMode"});
          }
      });
  }
  // You can add more actions here if needed
});

// This example function seems unused, so make sure it fits your extension's needs
function setPageStyle() {
  // Query the current active tab
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs.length > 0) {
          // This assumes you want to toggle styles; make sure this is your intended use
          chrome.tabs.sendMessage(tabs[0].id, {action: "toggleDyslexiaFriendly"});
      }
  });
}
