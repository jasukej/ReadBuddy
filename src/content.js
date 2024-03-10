let currDarkMode = false;

// Store original styles when extension is first activated
let originalPageStyles;

// Listen for changes in state of toggleDyslexicMode
chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key === "extensionEnabled") {
      updateExtensionState(newValue);
    }
  }
});

// Check stored state whenever content.js is modified or reloaded
chrome.storage.local.get(['extensionEnabled'], function(result) {
  if (result.hasOwnProperty('extensionEnabled')) {
      updateExtensionState(result.extensionEnabled);
  } else {
      updateExtensionState(false);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received from background.js.");
  switch (request.action) {
    case "toggleDyslexicMode":
      if (request.dyslexicMode) {
        storeOriginalStyles();
        updateGlobalStyles({
          fontFamily: "Arial, sans-serif",
          fontSize: "16px",
          darkMode: false,
        });
      } else {
        resetToDefaultStyles(); // Reset to original styles when turning off
      }
      break;
    case "changeFont":
      updateGlobalStyles({ fontFamily: request.font, darkMode: currDarkMode });
      break;
    case "adjustFontSize":
      adjustFontSize(request.newSize);
      break;
    case "toggleRuler":
      if (request.status) {
        createOrUpdateRuler(20);
        console.log("Ruler width updating...");
        if (ruler) ruler.style.display = "block";
      } else {
        if (ruler) ruler.style.display = "none"; // Hide the ruler
      }
      break;
    case "updateRulerHeight":
      console.log("Ruler width updating...");
      createOrUpdateRuler(request.height);
      break;
    case 'toggleDarkMode':
      currDarkMode = request.darkMode;
      updateGlobalStyles({darkMode: request.darkMode});
      break;
  }
});

function updateExtensionState(enabled) {
  if (enabled) {
      updateGlobalStyles({
          fontFamily: "Arial, sans-serif", 
          fontSize: "16px",
          darkMode: false, 
      });
  } else {
      resetToDefaultStyles();
  }
}

function storeOriginalStyles() {
  originalPageStyles = document.documentElement.style.cssText;
}

function resetToDefaultStyles() {
  // Remove the applied global styles
  const existingStyles = document.getElementById("customGlobalStyles");
  if (existingStyles) {
    existingStyles.remove();
  }

  // Revert to original page styles
  if (originalPageStyles !== null) {
    document.documentElement.style.cssText = originalPageStyles;
  }
}

// Handles updating global styles with new parameters
// Default values
function updateGlobalStyles({
  fontFamily = "Arial, sans-serif",
  fontSize = "16px",
  darkMode = false,
}) {

  const importStatement = `
  /* Import Google Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap');
`;
  const css = `
  ${importStatement}
    * {
      font-family: ${fontFamily} !important;
      letter-spacing: 0.1em !important;
      word-spacing: 0.2em !important;
      font-size: ${fontSize};
      line-height: 1.6em !important;
    }
    h1, h2, h3,
    h4, h5, h6 {
      font-size: 1.2*${fontSize} !important;
    }
  
    /* Additional styles */
    body {
      background-color: ${darkMode ? "#282828" : "#F3F2E9"};
      color: ${darkMode ? "#FFFFFF" : "#24485E"};
    }
  `;


  applyGlobalStyles(css);
}

// Applying or updating global styles in the document
const applyGlobalStyles = (css) => {
  // Remove any existing custom global styles to avoid duplicates
  const existingStyles = document.getElementById("customGlobalStyles");
  if (existingStyles) {
    existingStyles.remove();
  }

  // Apply new global styles
  const styleSheet = document.createElement("style");
  styleSheet.id = "customGlobalStyles";
  styleSheet.type = "text/css";
  styleSheet.innerText = css;

  (document.head || document.documentElement).appendChild(styleSheet);
};

// Initial global styles setup
updateGlobalStyles({});

// Function to inject CSS into the webpage
function injectCSSFile(file) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = chrome.runtime.getURL(file);
  document.head.appendChild(link);
}

// Stores initial font size of every element
let initialFontSizes = new Map();

// Calculates font size
function adjustFontSize(newSize) {
  console.log(`Adjusting font size to new size: ${newSize}`);
  if (isNaN(newSize)) {
    console.error(`New size is not a valid number: ${newSize}`);
    return;
  }

  const scaleFactor = newSize / 100;
  console.log(`Scale factor is: ${scaleFactor}`);

  const textElements = document.querySelectorAll("body *");
  console.log(`Found ${textElements.length} elements to adjust.`);

  textElements.forEach((element, index) => {
    if (!initialFontSizes.has(element)) {
      const computedStyle = window.getComputedStyle(element);
      const initialFontSize = parseFloat(computedStyle.fontSize);
      if (!isNaN(initialFontSize)) {
        initialFontSizes.set(element, initialFontSize);
      } else {
        console.error(
          `Failed to parse initial font size for element at index ${index}`
        );
        return;
      }
    }

    const initialSize = initialFontSizes.get(element);
    const newFontSize = initialSize * scaleFactor;
    console.log(
      `Setting new font size for element at index ${index}: ${newFontSize}px`
    );
    element.style.fontSize = `${newFontSize}px`;
  });
}

let ruler = null;

function createOrUpdateRuler(newWidth) {
  if (!ruler) {
    ruler = document.createElement("div");
    ruler.style.position = "fixed";
    ruler.style.top = "0";
    ruler.style.left = "0";
    ruler.style.width = "100%";
    ruler.style.pointerEvents = "none";
    ruler.style.zIndex = "9999";
    document.body.appendChild(ruler);

    document.addEventListener("mousemove", (e) => {
      ruler.style.top = `${e.clientY - 0.8 * ruler.offsetHeight}px`;
    });
  }

  ruler.style.height = `${newWidth}px`; // Always update width regardless of display state
  ruler.style.backgroundColor = "rgba(0,0,0,0.2)"; // Changed for better visibility
}
