document.getElementById('changeFont').addEventListener('click', () => {
    chrome.runtime.sendMessage({message: 'change_font'});
});