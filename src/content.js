// Listens for messages from the background script and applies or toggles the dyslexia-friendly styles on the page.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleDyslexiaFriendly") {
    document.body.classList.toggle('dyslexia-friendly');
  }
});


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

//   const styles = `
//   body {
//     font-family: Arial, sans-serif;
//     background-color: #f0f0f0;
// }

// .dyslexia-friendly {
//     font-family: "OpenDyslexic", Arial, sans-serif;
//     letter-spacing: 0.05em;
//     word-spacing: 0.1em;
//     line-height: 1.5;
//     color: #000; /* Adjust color for readability */
// }
// `;

// const styleElement = document.createElement('style');
// styleElement.textContent = styles;
// document.head.append(styleElement);
