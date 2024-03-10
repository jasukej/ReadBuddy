
// Listens for install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
      console.log("ReadBuddy installed.");
      saveSettings({fontSize: 100, darkMode: false, fontChoice: 'Default', rulerWidth: 50});
  }
});

// Save & Load
function saveSettings(settings) {
  chrome.storage.local.set({settings});
}

function loadSettings(callback) {
  chrome.storage.local.get(['settings'], (result) => {
      callback(result.settings);
  });
}

/*
if (message.type === 'updateSettings') {
  // Store settings for use or send them to content scripts
  chrome.storage.local.set({settings: message.settings}, () => {
      // Notify content script of new settings
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          if (tabs.length > 0) {
              chrome.tabs.sendMessage(tabs[0].id, {
                  action: 'applySettings',
                  settings: message.settings
              });
          }
      });
  });
}
*/

// Listens for messages from other parts of the extension (e.g., popup)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background.js called.");
  if (message.from === 'popup') {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          if (tabs.length > 0) {
              let tabId = tabs[0].id;

              // You might check if a content script needs to be injected here,
              // for now we assume it's always needed when receiving a message.
              chrome.scripting.executeScript({
                  target: {tabId: tabId},
                  files: ['src/content.js']
              }).then(() => {
                  // After ensuring the content script is loaded, forward the original message
                  chrome.tabs.sendMessage(tabId, {
                      action: message.subject, 
                      ...message 
                  });
              }).catch(error => {
                  console.error('Error injecting content script: ', error);
              });
          }
      });
  }
});

// Switching tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
      // Load settings and apply them to the active tab
      loadSettings((settings) => {
          chrome.tabs.sendMessage(tabId, {
              action: 'applySettings',
              settings: settings
          });
      });
  }
});



