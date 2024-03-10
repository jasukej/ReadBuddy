// Listens for install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("ReadBuddy installed.");
    saveSettings({
      fontSize: 100,
      darkMode: false,
      fontChoice: "Default",
      rulerWidth: 50,
    });
  }
});

// Save & Load
function saveSettings(settings) {
  chrome.storage.local.set({ settings });
}

function loadSettings(callback) {
  chrome.storage.local.get(["settings"], (result) => {
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

const injectedTabs = {};

// Listens for messages from other parts of the extension (e.g., popup)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background.js called.");
  if (message.from === "popup") {
    console.log("Message from popup received.");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        let tabId = tabs[0].id;

        if (!injectedTabs[tabId]) {
          chrome.scripting
            .executeScript({
                target: { tabId: tabId },
                files: ["src/content.js"],
            })
            .then(() => {
                injectedTabs[tabId] = true;
                // After ensuring the content script is loaded, forward the original message
                chrome.tabs.sendMessage(tabId, {
                    action: message.subject,
                    ...message,
                });
              console.log("Message sent to content.js.");
            })
            .catch((error) => {
              console.error("Error injecting content script: ", error);
            });
        } else {
          // If already injected, just forward the message
            chrome.tabs.sendMessage(tabId, {
            action: message.subject,
            ...message,
          });
        }
      }
    });
  }
});

// Storing states when switching tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "loading") { 
      delete injectedTabs[tabId]; // Remove the tab from the injectedTabs list to allow re-injection
    }
    if (changeInfo.status === "complete" && tab.active) {
      // Load settings and apply them to the active tab
      loadSettings((settings) => {
        if (!injectedTabs[tabId]) { 
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["src/content.js"],
          }).then(() => {
            injectedTabs[tabId] = true; 
            // Sendings settings
            chrome.tabs.sendMessage(tabId, {
              action: "applySettings",
              settings: settings,
            });
          }).catch((error) => {
            console.error("Error injecting content script: ", error);
          });
        } else {
          // Send settings directly if already injected
          chrome.tabs.sendMessage(tabId, {
            action: "applySettings",
            settings: settings,
          });
        }
      });
    }
  });
  
