document.getElementById('toggleButton').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleDyslexicMode'});
    });
});

// Toggle visibility of content based on header
document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('ReadBuddyToggle'); // Corrected ID here
    const sections = document.querySelectorAll('#font-choice, #ruler-section, #dark-mode-section');

    // Function to show or hide sections
    function toggleSections(display) {
        sections.forEach(section => {
            section.style.display = display;
        });
    }

    // Function to check if the toggle is checked
    function isToggleChecked() {
        return toggle.checked;
    }

    // Initial check
    toggleSections(isToggleChecked() ? 'block' : 'none');

    // Add event listener
    toggle.addEventListener('change', function() {
        toggleSections(this.checked ? 'block' : 'none');
    });
});

// Font size event listeners
document.getElementById('increaseFontSize').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'increaseFontSize'});
    });
});

document.getElementById('decreaseFontSize').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'decreaseFontSize'});
    });
});

// Width slider
document.addEventListener('DOMContentLoaded', function() {

    const slider = document.getElementById('rulerWidth');
    const widthText = document.getElementById('rulerWidthValue');

    // Minimum and maximum values for the slider
    slider.min = 10;
    slider.max = 50;

    // Update the width text element based on the initial slider value
    widthText.textContent = slider.value;

    slider.addEventListener('input', function() {
        // Update width text element with the slider value
        widthText.textContent = this.value;

        // Send a message to the content script to update the width
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'updateWidth', width: this.value });
        });
    });
});
