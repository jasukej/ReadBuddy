// Listens for messages from the background script and applies or toggles the dyslexia-friendly styles on the page.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleDyslexiaFriendly") {
    document.body.classList.toggle('dyslexia-friendly');
  }
});

// Add/Decrease font size
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'increaseFontSize') {
      increaseFontSize();
  } else if (message.action === 'decreaseFontSize') {
      decreaseFontSize();
  }
});





function increaseFontSize() {
  // Scale factor to increase font size
  const scaleFactor = 1.2;
  adjustFontSize(scaleFactor);
}

function decreaseFontSize() {
  // Scale factor to decrease font size
  const scaleFactor = 0.8;
  adjustFontSize(scaleFactor);
}

function adjustFontSize(scaleFactor) {
  // Selecting all text elements in the body
  const textElements = document.querySelectorAll('body *');

  // Calculate & adjust font size 
  textElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const currentFontSize = parseInt(computedStyle.fontSize);
      const newFontSize = currentFontSize * scaleFactor;

      // Set the new font size
      element.style.fontSize = `${newFontSize}px`;
  });
}


const changeFont = css => document.head.appendChild(document.createElement("style")).innerHTML = css

changeFont(`
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
}
`)

function Create_Custom_Element(tag, attr_tag, attr_name, value) {
  const custom_element = document.createElement(tag);
  custom_element.setAttribute(attr_tag, attr_name);
  custom_element.innerHTML = value
  document.body.append(custom_element);

}




// Function to inject CSS into the webpage
// function injectCSSFile(file) {
//   const style = document.createElement('style');
//   style.rel = 'stylesheet';
//   style.type = 'text/css';
//   style.href = chrome.extension.getURL(file);
//   document.head.appendChild(style);
//   return style;
// }


// // Inject dyslexia-friendly CSS into the webpage
// injectCSSFile('./styles/dyslexia-friendly.css');

// `
// body, h1, h2, h3, p{
//   font-family: Arial, sans-serif !important;
// }

// /* Additional styles */
// body {
//   background-color: #F3F2E9;
//   color: #24485E;
// }

// /* Dark mode style */
// body.dark-mode {
//   background-color: #24485E;
//   color: #F3F2E9;
// }

// h1 {
//   font-size: 18px;
// }

// p {
//   font-size: 14px;
//   text-align: left;
//   letter-spacing: 0.25em;
//   word-spacing: 1.00em; /* Approximate calculation */
//   line-height: 1.5em;
// }
// `
