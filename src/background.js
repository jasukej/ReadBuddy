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
        chrome.scripting
          .executeScript({
            target: { tabId: tabId },
            files: ["src/content.js"],
          })
          .then(() => {
            injectedTabs[tabId] = true;
            // Sendings settings
            chrome.tabs.sendMessage(tabId, {
              action: "applySettings",
              settings: settings,
            });
          })
          .catch((error) => {
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.from === "popup" && message.subject === "toggleTextToSpeech") {
    // Forward TTS toggle status to the content script
    console.log("TTS toggled.");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          subject: "toggleTextToSpeech",
          status: message.status,
        });
      }
    });
  } else if (message.from === "content" && message.subject === "speakText") {
    // Call to Google's Text-to-Speech API
    const data = {
      input: { text: message.text },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    };

    fetch(
      "https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyBs40mW43xj-bJKeu25766_Xy-E4XKgTTo",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        const audioContent = data.audioContent;
        const binaryString = atob(audioContent); // Separate decoding base64
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes], { type: "audio/mp3" });
        const audioUrl = URL.createObjectURL(audioBlob);
        chrome.tabs.sendMessage(sender.tab.id, {
          subject: "playAudio",
          audioUrl: audioUrl,
        });
        console.log(audioUrl);
      })
      .catch((error) => console.error("Error:", error));
  }
  return true; // async sendResponse
});
