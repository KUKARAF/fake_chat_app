// DOM elements
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const chatHistoryList = document.getElementById('chat-history-list');

// State variables
let currentConversation = [];
let isGenerating = false;
let conversationHistory = [];

// Fetch the conversation data from the server when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchConversations();
    
    // Adjust textarea height based on content
    userInput.addEventListener('input', autoResizeTextarea);
    
    // Toggle sidebar on mobile
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });
    }
});

// Auto-resize textarea as user types
function autoResizeTextarea() {
    userInput.style.height = 'auto';
    userInput.style.height = (userInput.scrollHeight) + 'px';
}

// Fetch conversations from server
function fetchConversations() {
    fetch('/api/conversations')
        .then(response => response.json())
        .then(data => {
            conversationHistory = data.conversations || [];
            updateChatHistoryList();
            
            // Load the first conversation if available
            if (conversationHistory.length > 0) {
                loadConversation(0);
            }
        })
        .catch(error => {
            console.error('Error fetching conversations:', error);
            // Add a default conversation with a single system message
            addSystemMessage('Failed to load conversations. Please try again later.');
        });
}

// Update the chat history list in the sidebar
function updateChatHistoryList() {
    chatHistoryList.innerHTML = '';
    
    conversationHistory.forEach((conversation, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'nav-item';
        
        const link = document.createElement('a');
        link.className = 'nav-link';
        link.href = '#';
        link.textContent = `Chat ${index + 1}`;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadConversation(index);
        });
        
        listItem.appendChild(link);
        chatHistoryList.appendChild(listItem);
    });
}

// Load a conversation from history
function loadConversation(index) {
    if (index >= 0 && index < conversationHistory.length) {
        currentConversation = conversationHistory[index];
        chatMessages.innerHTML = '';
        
        // Add an initial system message
        addSystemMessage('Chat history loaded. Continue your conversation!');
        
        // Display all messages in the conversation
        currentConversation.forEach(message => {
            if (message.role === 'user') {
                addUserMessage(message.content, false);
            } else if (message.role === 'system') {
                addSystemMessage(message.content, message.categories, false);
            }
        });
        
        // Scroll to the bottom of the chat
        scrollToBottom();
    }
}

// Start a new chat
function startNewChat() {
    currentConversation = [];
    chatMessages.innerHTML = '';
    addSystemMessage('Welcome to a new chat! How can I help you today?');
}

// Add a user message to the chat
function addUserMessage(message, animate = true) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container user-message';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageParagraph = document.createElement('p');
    messageParagraph.className = 'mb-0';
    messageParagraph.textContent = message;
    
    messageContent.appendChild(messageParagraph);
    messageContainer.appendChild(messageContent);
    chatMessages.appendChild(messageContainer);
    
    // Add to current conversation
    currentConversation.push({
        role: 'user',
        content: message
    });
    
    if (animate) {
        // Delay to allow DOM to update
        setTimeout(() => {
            messageContainer.classList.add('visible');
            scrollToBottom();
        }, 10);
    } else {
        messageContainer.classList.add('visible');
    }
}

// Add a system (AI) message to the chat
function addSystemMessage(message, categories = [], animate = true) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container system-message';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (animate) {
        // Create and add the typing indicator first
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dot.className = 'typing-dot';
            typingIndicator.appendChild(dot);
        }
        
        messageContent.appendChild(typingIndicator);
        messageContainer.appendChild(messageContent);
        chatMessages.appendChild(messageContainer);
        
        // Make the container visible
        setTimeout(() => {
            messageContainer.classList.add('visible');
            scrollToBottom();
        }, 10);
        
        // Simulate typing and gradually reveal the message
        simulateTyping(message, messageContent, typingIndicator, categories);
    } else {
        // Add the message immediately without animation
        const messageParagraph = document.createElement('p');
        messageParagraph.className = 'mb-0';
        messageParagraph.textContent = message;
        
        messageContent.appendChild(messageParagraph);
        
        // Add categories if provided
        if (categories && categories.length > 0) {
            const categoryContainer = createCategoryContainer(categories);
            messageContent.appendChild(categoryContainer);
        }
        
        messageContainer.appendChild(messageContent);
        chatMessages.appendChild(messageContainer);
        messageContainer.classList.add('visible');
    }
    
    // Add to current conversation
    currentConversation.push({
        role: 'system',
        content: message,
        categories: categories
    });
}

// Simulate typing and gradually reveal the message
function simulateTyping(message, messageContent, typingIndicator, categories) {
    isGenerating = true;
    
    // Calculate typing time based on message length (between 1-5 seconds)
    const typingTime = Math.min(Math.max(message.length * 20, 1000), 5000);
    
    // Remove typing indicator and add the message after the typing time
    setTimeout(() => {
        messageContent.removeChild(typingIndicator);
        
        // Create a paragraph for the message
        const messageParagraph = document.createElement('p');
        messageParagraph.className = 'mb-0';
        messageContent.appendChild(messageParagraph);
        
        // Gradually reveal the message character by character
        let charIndex = 0;
        const typingInterval = setInterval(() => {
            messageParagraph.textContent = message.substring(0, charIndex + 1);
            charIndex++;
            scrollToBottom();
            
            if (charIndex >= message.length) {
                clearInterval(typingInterval);
                
                // Add categories if provided
                if (categories && categories.length > 0) {
                    const categoryContainer = createCategoryContainer(categories);
                    messageContent.appendChild(categoryContainer);
                }
                
                isGenerating = false;
                scrollToBottom();
            }
        }, typingTime / message.length);
    }, 1500);
}

// Create category tags container
function createCategoryContainer(categories) {
    const categoryContainer = document.createElement('div');
    categoryContainer.className = 'category-tags';
    
    // Available category types for styling
    const categoryTypes = ['info', 'success', 'warning', 'danger', 'primary'];
    
    categories.forEach((category, index) => {
        const categoryTag = document.createElement('span');
        // Cycle through category types
        const categoryType = categoryTypes[index % categoryTypes.length];
        categoryTag.className = `category-tag ${categoryType}`;
        categoryTag.textContent = category;
        categoryContainer.appendChild(categoryTag);
    });
    
    return categoryContainer;
}

// Scroll to the bottom of the chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle form submission
chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get the user input
    const message = userInput.value.trim();
    
    // Clear and reset the textarea
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // If the message is empty or the AI is still generating, do nothing
    if (message === '' || isGenerating) return;
    
    // Add the user message to the chat
    addUserMessage(message);
    
    // Simulate AI response
    generateResponse(message);
});

// Generate a mock AI response
function generateResponse(userMessage) {
    // Mock responses based on user input
    let response, categories;
    
    // Simple keyword-based response generation
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        response = "Hello! How can I assist you today?";
        categories = ["Greeting", "Introduction"];
    } 
    else if (lowerMessage.includes('weather')) {
        response = "I don't have access to real-time weather data, but I can tell you that weather patterns are influenced by atmospheric pressure, temperature, humidity, and air movement. What specific weather information are you looking for?";
        categories = ["Weather", "Meteorology", "Clarification"];
    }
    else if (lowerMessage.includes('machine learning') || lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence')) {
        response = "Machine learning is a branch of artificial intelligence that focuses on building systems that learn from data. There are several types including supervised learning, unsupervised learning, and reinforcement learning. Would you like to know more about a specific type?";
        categories = ["Machine Learning", "AI", "Technology", "Education"];
    }
    else if (lowerMessage.includes('joke') || lowerMessage.includes('funny')) {
        response = "Why don't scientists trust atoms? Because they make up everything! 😄";
        categories = ["Humor", "Science"];
    }
    else if (lowerMessage.includes('python') || lowerMessage.includes('code') || lowerMessage.includes('programming')) {
        response = "Python is a high-level, interpreted programming language known for its readability and simplicity. It's widely used in data science, web development, and automation. Would you like to see an example of Python code?";
        categories = ["Programming", "Python", "Technology"];
    }
    else if (lowerMessage.includes('thank')) {
        response = "You're welcome! If you have any other questions, feel free to ask.";
        categories = ["Gratitude", "Conclusion"];
    }
    else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
        response = "Goodbye! Have a great day!";
        categories = ["Farewell"];
    }
    else {
        // Default response for unrecognized queries
        response = "That's an interesting question. While I don't have specific information on that topic, I'd be happy to discuss it further. Could you provide more details about what you're looking for?";
        categories = ["General", "Clarification"];
    }
    
    // Add the system message to the chat with a delay to simulate processing
    setTimeout(() => {
        addSystemMessage(response, categories);
    }, 1000);
}
