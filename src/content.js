// Listens for messages from the background script and applies or toggles the dyslexia-friendly styles on the page.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleDyslexiaFriendly") {
      document.body.classList.toggle('dyslexia-friendly');
    }
  });

