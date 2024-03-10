chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  connsole.log("2");
  switch (request.action) {
    case "toggleDyslexiaFriendly":
      // document.body.classList.toggle('dyslexia-friendly');
      break;
    case 'changeFont':
        changeFont(request.font);
        break;
    case 'adjustFontSize':
      console.log(request.newSize);
      adjustFontSize(request.newSize);
      break;
    case 'updateRulerWidth':
        createOrUpdateRuler(request.width);
        break;
    case 'toggleDarkMode':
      if (request.darkMode) {
          document.body.style.backgroundColor = '#282828'; 
          document.body.style.color = '#FFFFFF'; 
      } else {
          document.body.style.backgroundColor = '';
          document.body.style.color = ''; 
      }
      break;
  }
});

// Handles font size
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

  console.log("2");
}

// Handles font changing
function changeFont(font) {
  document.body.style.fontFamily = font;

  const textElements = document.querySelectorAll('body *');
  textElements.forEach(element => {
      element.style.fontFamily = font;
  });
}

// Function to inject CSS into the webpage
function injectCSSFile(file) {
  const style = document.createElement('style');
  style.rel = 'stylesheet';
  style.type = 'text/css';
  style.href = chrome.extension.getURL(file);
  document.head.appendChild(style);
  return style;
}

// Applying default styles
const applyGlobalStyles = css => {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = css;
  document.head.appendChild(styleSheet);
};

// Then use it like this:
applyGlobalStyles(`
* {
  font-family: Arial, sans-serif !important;
  letter-spacing: 0.1em !important;
  word-spacing: 0.2em !important;
  font-size: 16px !important;
  line-height: 1.6em !important;
}

/* Additional styles */
body {
  background-color: #F3F2E9;
  color: #24485E;
}

/* Dark mode style */
body.dark-mode {
  background-color: #24485E;
  color: #F3F2E9;
}`);

function Create_Custom_Element(tag, attr_tag, attr_name, value) {
  const custom_element = document.createElement(tag);
  custom_element.setAttribute(attr_tag, attr_name);
  custom_element.innerHTML = value
  document.body.append(custom_element);
}


//  RULER
let ruler = null; 

function createOrUpdateRuler(newWidth) {
    if (!ruler) {
        ruler = document.createElement('div');
        ruler.style.position = 'fixed';
        ruler.style.top = '0';
        ruler.style.left = '0';
        ruler.style.width = '100%'; 
        ruler.style.pointerEvents = 'none'; // Allow click-through
        ruler.style.zIndex = '9999';
        document.body.appendChild(ruler);
        
        document.addEventListener('mousemove', (e) => {
            ruler.style.top = `${e.clientY}px`; // Move the ruler with the mouse
        });
    }

    // Update the ruler's height based on newWidth, treating width as the thickness of the horizontal line
    ruler.style.height = `${newWidth}px`;
    ruler.style.backgroundColor = 'rgba(0,0,0,0.2)'; // Example: semi-transparent black, change as needed
}