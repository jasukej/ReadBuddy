let currDarkMode = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received from background.js.");
  switch (request.action) {
    case "toggleDyslexiaFriendly":
      updateGlobalStyles({});
      // Here you would toggle a class for dyslexia-friendly styles if you have predefined styles in your CSS.
      // document.body.classList.toggle('dyslexia-friendly');
      break;
    case 'changeFont':
      updateGlobalStyles({fontFamily: request.font, darkMode: currDarkMode});
      break;
    case 'adjustFontSize':
      adjustFontSize(request.newSize);
      break;
    case 'updateRulerWidth':
      createOrUpdateRuler(request.width);
      break;
    case 'toggleDarkMode':
      currDarkMode = request.darkMode;
      updateGlobalStyles({darkMode: request.darkMode});
      break;
  }
});

// Handles updating global styles with new parameters
// Default values
function updateGlobalStyles({ fontFamily = 'Arial, sans-serif', fontSize = '16px', darkMode = false }) {
  const css = `
    * {
      font-family: ${fontFamily} !important;
      letter-spacing: 0.1em !important;
      word-spacing: 0.2em !important;
      font-size: ${fontSize} !important;
      line-height: 1.6em !important;
    }
    h1, h2, h3,
    h4, h5, h6 {
      font-size: 1.2*${fontSize} !important;
    }
  
    /* Additional styles */
    body {
      background-color: ${darkMode ? '#282828' : '#F3F2E9'};
      color: ${darkMode ? '#FFFFFF' : '#24485E'};
    }
  `;

  applyGlobalStyles(css);
}

// Applying or updating global styles in the document
const applyGlobalStyles = css => {
  // Remove any existing custom global styles to avoid duplicates
  const existingStyles = document.getElementById('customGlobalStyles');
  if (existingStyles) {
    existingStyles.remove();
  }

  // Apply new global styles
  const styleSheet = document.createElement("style");
  styleSheet.id = 'customGlobalStyles';
  styleSheet.type = "text/css";
  styleSheet.innerText = css;
  document.head.appendChild(styleSheet);
};

// Initial global styles setup
updateGlobalStyles({}); // Could be empty or with default values

// Function to inject CSS into the webpage
function injectCSSFile(file) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = chrome.runtime.getURL(file);
  document.head.appendChild(link);
}

// Calculates font size
function adjustFontSize(newSize) {
  const scaleFactor = newSize / 100;  // Convert percentage to a decimal for scaling
  const textElements = document.querySelectorAll('body *');
  
  // Adjust font size for each text element
  textElements.forEach(element => {
    const computedStyle = window.getComputedStyle(element);
    const currentFontSize = parseFloat(computedStyle.fontSize);
    const newFontSize = currentFontSize * scaleFactor; 

    element.style.fontSize = `${newFontSize}px`;
  });

}

let ruler = null; 

function createOrUpdateRuler(newWidth) {
    if (!ruler) {
        ruler = document.createElement('div');
        ruler.style.position = 'fixed';
        ruler.style.top = '0';
        ruler.style.left = '0';
        ruler.style.width = '100%'; 
        ruler.style.pointerEvents = 'none';
        ruler.style.zIndex = '9999';
        document.body.appendChild(ruler);
        
        document.addEventListener('mousemove', (e) => {
            ruler.style.top = `${e.clientY}px`;
        });
    }

    ruler.style.height = `${newWidth}px`;
    ruler.style.backgroundColor = 'rgba(0,0,0,0.2)';
}
