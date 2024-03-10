chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "toggleDyslexiaFriendly":
      document.body.classList.toggle('dyslexia-friendly');
      break;
    case 'changeFont':
        changeFont(request.fontFamily);
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
}

// Handles font changing
function changeFont(fontName) {
  document.body.style.fontFamily = fontName;

  const textElements = document.querySelectorAll('body *');
  textElements.forEach(element => {
      element.style.fontFamily = fontName;
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


// Inject dyslexia-friendly CSS into the webpage
injectCSSFile('./styles/dyslexia-friendly.css');

//  RULER
let ruler = null; 

function createOrUpdateRuler(newWidth) {
    if (!ruler) {
        ruler = document.createElement('div');
        ruler.style.position = 'fixed';
        ruler.style.top = '0';
        ruler.style.left = '0';
        ruler.style.width = '100%'; // The ruler width will actually be the height for horizontal line
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