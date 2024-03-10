chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received from background.js.");
  switch (request.action) {
    case "toggleDyslexiaFriendly":
      // Here you would toggle a class for dyslexia-friendly styles if you have predefined styles in your CSS.
      // document.body.classList.toggle('dyslexia-friendly');
      break;
    case 'changeFont':
      updateGlobalStyles({fontFamily: request.font});
      break;
    case 'adjustFontSize':
      adjustFontSize(request.newSize);
      break;
    case 'updateRulerWidth':
      createOrUpdateRuler(request.width);
      break;
    case 'toggleDarkMode':
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
    font-size: ${fontSize} !important;
    line-height: 1.6em !important;
    color: ${darkMode ? '#FFFFFF' : '#000000'} !important;
    background-color: ${darkMode ? '#000000' : '#F3F2E9'} !important;
  }

  /* Additional styles */
  a {
    color: ${darkMode ? '#64b5f6' : '#1976d2'} !important; 
  }
  
  /* Add more specific selectors and adjust colors as needed */
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
