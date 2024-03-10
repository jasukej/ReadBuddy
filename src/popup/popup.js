document.addEventListener("DOMContentLoaded", function () {
  // Popup elements
  const toggle = document.getElementById("ReadBuddyToggle");
  const sections = document.getElementById("sectionsContainer");

  const fontSizeDisplay = document.getElementById("fontSizeValue");
  let currentFontSize = 100; // Default
  fontSizeDisplay.textContent = `${currentFontSize}%`;

  const slider = document.getElementById("rulerWidth");
  const widthText = document.getElementById("rulerWidthValue");

  const fontDropdown = document.getElementById("fontDropdown");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // Retrieve and apply the stored extension state
  chrome.storage.local.get(["extensionEnabled"], function (result) {
    if (result.hasOwnProperty("extensionEnabled")) {
      toggle.checked = result.extensionEnabled;
      toggleSections(result.extensionEnabled ? "block" : "none");
    }
  });

  // Retrieve stored settings
  chrome.storage.local.get(
    ["fontSize", "darkMode", "fontChoice", "rulerWidth"],
    function (result) {
      if (result.fontSize) {
        currentFontSize = result.fontSize;
        fontSizeDisplay.textContent = `${currentFontSize}%`;
      }
      if (result.darkMode !== undefined) {
        darkModeToggle.checked = result.darkMode;
      }
      if (result.fontChoice) {
        fontDropdown.value = result.fontChoice;
      }
      if (result.rulerWidth) {
        slider.value = result.rulerWidth;
        widthText.textContent = result.rulerWidth;
      }
    }
  );

  // Toggle dyslexic mode
  document
    .getElementById("ReadBuddyToggle")
    .addEventListener("change", function () {
      const isEnabled = this.checked;
      chrome.storage.local.set({ extensionEnabled: isEnabled }, function () {
        console.log("Extension enabled state is set to ", isEnabled);
      });
      /*
      chrome.runtime.sendMessage({
        from: "popup",
        subject: "toggleDyslexicMode",
        status: this.checked,
      });
    */
    });

  // Toggle visibility of content sections
  function toggleSections(display) {
    sections.style.display = display;
  }

  // Check if the toggle is checked
  function isToggleChecked() {
    return toggle.checked;
  }

  // Initial check and event listener for toggling sections
  toggleSections(isToggleChecked() ? "block" : "none");
  toggle.addEventListener("change", function () {
    toggleSections(this.checked ? "block" : "none");
  });

  // CHANGE FONT
  fontDropdown.addEventListener("change", function () {
    const selectedFont = this.value;
    chrome.runtime.sendMessage({
      from: "popup",
      subject: "changeFont",
      font: selectedFont,
    });
  });

  // FONT SIZE LISTENERS
  // Increase font size
  document.getElementById("increaseFontSize").addEventListener("click", () => {
    currentFontSize = Math.min(currentFontSize + 10, 500); // Increment and cap at 500%
    fontSizeDisplay.textContent = `${currentFontSize}%`;
    chrome.runtime.sendMessage({
      from: "popup",
      subject: "adjustFontSize",
      newSize: currentFontSize,
    });
    console.log("Font size user input sent.");
  });

  // Decrease font size
  document.getElementById("decreaseFontSize").addEventListener("click", () => {
    currentFontSize = Math.max(currentFontSize - 10, 10); // Decrement and floor at 10%
    fontSizeDisplay.textContent = `${currentFontSize}%`;
    chrome.runtime.sendMessage({
      from: "popup",
      subject: "adjustFontSize",
      newSize: currentFontSize,
    });
  });

  // RULER WIDTH LISTENERS
  // Toggle Ruler On/Off
  const rulerToggle = document.getElementById("toggleRuler");
  rulerToggle.addEventListener("change", function () {
    const rulerStatus = this.checked;
    chrome.runtime.sendMessage({
      from: "popup",
      subject: "toggleRuler",
      status: rulerStatus,
    });
  });

  // Slider event listener
  slider.min = 10;
  slider.max = 50;
  widthText.textContent = slider.value;

  slider.addEventListener("input", function () {
    widthText.textContent = this.value;
    chrome.runtime.sendMessage({
      from: "popup",
      subject: "updateRulerHeight",
      height: this.value,
    });
  });

  // Toggle Dark Mode
  darkModeToggle.addEventListener("change", function () {
    chrome.runtime.sendMessage({
      from: "popup",
      subject: "toggleDarkMode",
      darkMode: this.checked,
    });
  });

  // Toggle Text 2 Speech
  const ttsToggle = document.getElementById("toggleTextToSpeech");
  const ttsInstructions = document.getElementById("ttsInstructions");

  chrome.storage.local.get(["ttsEnabled"], function (result) {
    ttsToggle.checked = !!result.ttsEnabled;
    updateTTSInstructions(ttsToggle.checked); // initial state of instructions
  });

  ttsToggle.addEventListener("change", function () {
    const ttsStatus = this.checked;
    chrome.storage.local.set({ ttsEnabled: ttsStatus });
    chrome.runtime.sendMessage({
      from: "popup",
      subject: "toggleTextToSpeech",
      status: ttsStatus,
    });
    updateTTSInstructions(ttsStatus);
  });

  // Update UI display
  function updateTTSInstructions(isEnabled) {
    if (isEnabled) {
      ttsInstructions.classList.remove("hidden");
    } else {
      ttsInstructions.classList.add("hidden");
    }
  }
});

// Listens for messages from other parts of the extension (e.g., popup)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background.js called.");
  if (message.from === "popup") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        let tabId = tabs[0].id;

        chrome.scripting
          .executeScript({
            target: { tabId: tabId },
            files: ["src/content.js"],
          })
          .then(() => {
            // After ensuring the content script is loaded, forward the original message
            chrome.tabs.sendMessage(tabId, {
              action: message.subject,
              ...message,
            });
          })
          .catch((error) => {
            console.error("Error injecting content script: ", error);
          });
      }
    });
  }
});
