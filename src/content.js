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


