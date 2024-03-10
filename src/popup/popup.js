document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('ReadBuddyToggle'); 
    const sections = document.getElementById('sectionsContainer');

    const fontSizeDisplay = document.getElementById('fontSizeValue');
    let currentFontSize = 100; // Default
    fontSizeDisplay.textContent = `${currentFontSize}%`;

    const slider = document.getElementById('rulerWidth');
    const widthText = document.getElementById('rulerWidthValue');

    // Toggle dyslexic mode
    document.getElementById('ReadBuddyToggle').addEventListener('change', () => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleDyslexicMode'});
        });
    });

    // Toggle visibility of content sections
    function toggleSections(display) {
            sections.style.display = display;
    }

    // Check if the toggle is checked
    function isToggleChecked() {
        return toggle.checked;
    }

    // Initial check and event listener for toggling sections
    toggleSections(isToggleChecked() ? 'block' : 'none');
    toggle.addEventListener('change', function() {
        toggleSections(this.checked ? 'block' : 'none');
    });

    // FONT SIZE LISTENERS
    // Increase font size
    document.getElementById('increaseFontSize').addEventListener('click', () => {
        currentFontSize = Math.min(currentFontSize + 10, 500); // Increment and cap at 500%
        fontSizeDisplay.textContent = `${currentFontSize}%`;
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'changeFontSize', newSize: currentFontSize});
        });
    });

    // Decrease font size
    document.getElementById('decreaseFontSize').addEventListener('click', () => {
        currentFontSize = Math.max(currentFontSize - 10, 10); // Decrement and floor at 10%
        fontSizeDisplay.textContent = `${currentFontSize}%`;
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'changeFontSize', newSize: currentFontSize});
        });
    });

    // RULER WIDTH LISTENERS
    // Slider event listener
    slider.min = 10;
    slider.max = 50;
    widthText.textContent = slider.value;

    slider.addEventListener('input', function() {
        widthText.textContent = this.value;
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'updateWidth', width: this.value });
        });
    });
});