"use strict";
// Get UI elements
const extractButton = document.getElementById('extract');
const outputElement = document.getElementById('output');
// Log elements for debugging
console.log('UI SCRIPT LOADED');
console.log('Extract button element:', extractButton);
console.log('Output element:', outputElement);
// Add a function to update the output with a timestamp for debugging
function updateOutput(message) {
    const timestamp = new Date().toLocaleTimeString();
    outputElement.textContent = `[${timestamp}] ${message}`;
    console.log(`Output updated: ${message}`);
}
// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
    console.log('UI initialized - DOMContentLoaded event fired');
    updateOutput('UI initialized. Ready to extract data.');
    // Add loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading';
    loadingIndicator.textContent = 'Loading...';
    loadingIndicator.style.display = 'none';
    document.body.appendChild(loadingIndicator);
    // Debug check for button
    if (!extractButton) {
        console.error('Extract button not found in DOM!');
        updateOutput('ERROR: Extract button not found in DOM!');
    }
    else {
        console.log('Extract button found in DOM');
    }
});
// Handle extract button click
if (extractButton) {
    extractButton.addEventListener('click', () => {
        console.log('Extract button clicked');
        updateOutput('Button clicked! Sending message to plugin...');
        // Show loading indicator
        const loadingIndicator = document.getElementById('loading');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }
        try {
            // Send message to plugin code
            parent.postMessage({ pluginMessage: { type: 'extract-data' } }, '*');
            console.log('Message sent to plugin:', { type: 'extract-data' });
            // Add a timeout to check if we get a response
            setTimeout(() => {
                const loadingIndicator = document.getElementById('loading');
                if (loadingIndicator && loadingIndicator.style.display === 'block') {
                    updateOutput('WARNING: No response received from plugin after 3 seconds. Check console for errors.');
                }
            }, 3000);
        }
        catch (error) {
            console.error('Error sending message to plugin:', error);
            updateOutput('Error sending message to plugin: ' + (error instanceof Error ? error.message : String(error)));
        }
    });
}
else {
    console.error('Extract button not found when adding click handler!');
}
// Handle messages from the plugin code
window.onmessage = (event) => {
    console.log('Message received from plugin (raw):', event);
    if (!event.data || !event.data.pluginMessage) {
        console.error('Received message with invalid format:', event);
        updateOutput('ERROR: Received message with invalid format');
        return;
    }
    const message = event.data.pluginMessage;
    console.log('Message received from plugin (parsed):', message);
    // Hide loading indicator
    const loadingIndicator = document.getElementById('loading');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
    if (message.type === 'figma-data') {
        // Display data
        if (message.data && message.data.length > 0) {
            updateOutput('Data received: ' + JSON.stringify(message.data, null, 2));
        }
        else {
            updateOutput('No data extracted. Make sure you have selected elements in Figma.');
        }
    }
    else if (message.type === 'error') {
        // Display error message
        updateOutput('ERROR: ' + (message.message || 'An unknown error occurred'));
        outputElement.style.color = 'red';
    }
    else {
        console.warn('Received message with unknown type:', message);
        updateOutput('WARNING: Received message with unknown type: ' + message.type);
    }
};
