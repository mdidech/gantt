const data = {
    chatHistory: [{
        message: "Hi! How can i assist you today?",
        isUser: false
    }]
};

// Function to add message to chat
function addMessage(message, isUser = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    if (isUser) {
        messageDiv.textContent = message;
    } else {
        messageDiv.innerHTML = message;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to add chat history on initialization
function addChatHistory(history) {
    history.forEach(({ message, isUser }) => {
        addMessage(message, isUser);
    });
}

// Function to show typing indicator with bubbles
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'typing-indicator';
    
    const bubble = document.createElement('div');
    bubble.className = 'typing-bubble';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        bubble.appendChild(dot);
    }
    
    typingDiv.appendChild(bubble);
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to remove typing indicator
function removeTypingIndicator() {
    const typingDiv = document.getElementById('typing-indicator');
    if (typingDiv) {
        typingDiv.remove();
    }
}

// Function to save chat history
function saveChatHistory() {
    const chatMessages = document.getElementById('chatMessages');
    const messages = Array.from(chatMessages.children).map(messageDiv => ({
        message: messageDiv.classList.contains('user-message') ? 
            messageDiv.textContent : 
            messageDiv.innerHTML,
        isUser: messageDiv.classList.contains('user-message')
    }));
    return JSON.stringify(messages);
}

function processUserMessage() {
    const userInput = document.getElementById('userInput');
    const chatData = document.querySelector('input[name="data[teste]"]');
    const message = userInput.value.trim();
    
    if (message) {
        // Add user message
        addMessage(message, true);
        
        // Save history before clearing
        const chatHistory = saveChatHistory();
        userInput.value = "";
        
        // Show typing indicator instead of "Loading..."
        showTypingIndicator();
        
        data.chatHistory = chatHistory;
        // Submit form
        const submitButton = document.querySelector('button[type="submit"][name="data[submit]"]');
        if (submitButton) {
            submitButton.click();
        }
    }
}

// Initialize events
document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');
    const chatHeader = document.querySelector('.chat-header');
    const chatContainer = document.querySelector('.chat-container');
    const resizeHandle = document.querySelector('.chat-resize-handle');
    
    // Set initial chat size
    chatContainer.style.width = '500px';
    chatContainer.style.height = '600px';
    
    
    // Send button click event
    sendButton.addEventListener('click', processUserMessage);
    
    // Enter key event on input
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processUserMessage();
        }
    });
    
    // Header click event to minimize/maximize
    chatHeader.addEventListener('click', () => {
        chatContainer.classList.toggle('collapsed');
    });

    // Resize logic
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = chatContainer.offsetWidth;
        startHeight = chatContainer.offsetHeight;
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResize);
        e.preventDefault();
    });

    function handleMouseMove(e) {
        if (!isResizing) return;

        const newWidth = startWidth + (e.clientX - startX);
        const newHeight = startHeight + (e.clientY - startY);

        // Apply minimum and maximum limits
        const width = Math.min(Math.max(newWidth, 600), 1600);
        const height = Math.min(Math.max(newHeight, 800), 1600);

        chatContainer.style.width = `${width}px`;
        chatContainer.style.height = `${height}px`;
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResize);
    }
    
    try {
        const history = data.chatHistory;
        addChatHistory(history);
    } catch (e) {
        // Erro silencioso para produção
    }
    
}); 