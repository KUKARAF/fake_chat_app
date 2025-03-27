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
let userTyping = false;
let inputBuffer = '';

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

// Simulate typing and gradually reveal the message with realistic timing
function simulateTyping(message, messageContent, typingIndicator, categories) {
    isGenerating = true;
    
    // Calculate the "thinking" time based on message complexity and length
    // Longer messages need more thinking time to simulate real AI processing
    const thinkingTime = Math.min(Math.max(message.length * 5, 1500), 4000);
    
    // Display the thinking animation (typing dots) for the calculated time
    setTimeout(() => {
        messageContent.removeChild(typingIndicator);
        
        // Create a paragraph for the message with cursor effect
        const messageParagraph = document.createElement('p');
        messageParagraph.className = 'mb-0 message-paragraph-typing';
        messageContent.appendChild(messageParagraph);
        
        // Configure realistic typing
        const avgHumanTypingSpeed = 200; // milliseconds per character (5 chars per second)
        const variability = 100; // Add some randomness to typing speed
        
        // Gradually reveal the message character by character with variable speed
        let charIndex = 0;
        let currentDelay = 0;
        
        // Split into "chunks" to simulate how humans read and type
        // Typically humans would type a few chars, then pause slightly at punctuation or between thoughts
        const chunks = message.split(/([,.?!:;])/);
        let currentChunkIndex = 0;
        let currentChunkChar = 0;
        let currentChunk = chunks[0] || '';
        
        const typingInterval = setInterval(() => {
            // Check if we've reached the end of the current chunk
            if (currentChunkChar >= currentChunk.length) {
                // Move to the next chunk
                currentChunkIndex++;
                if (currentChunkIndex >= chunks.length) {
                    // We've finished all chunks
                    clearInterval(typingInterval);
                    
                    // Add categories after a slight delay
                    setTimeout(() => {
                        // Remove typing cursor once the message is fully generated
                        messageParagraph.classList.remove('message-paragraph-typing');
                        
                        if (categories && categories.length > 0) {
                            const categoryContainer = createCategoryContainer(categories);
                            messageContent.appendChild(categoryContainer);
                        }
                        
                        isGenerating = false;
                        scrollToBottom();
                    }, 300);
                    return;
                }
                
                // Get the next chunk and reset character index
                currentChunk = chunks[currentChunkIndex];
                currentChunkChar = 0;
                
                // Add a pause if this is punctuation
                if (/^[,.?!:;]$/.test(currentChunk)) {
                    // Longer pause for end of sentence punctuation
                    const pauseTime = /[.?!]/.test(currentChunk) ? 700 : 300;
                    setTimeout(() => {
                        // Add the punctuation immediately
                        messageParagraph.textContent += currentChunk;
                        currentChunkChar = currentChunk.length;
                        scrollToBottom();
                    }, pauseTime);
                    return;
                }
            }
            
            // Add the next character of the current chunk
            messageParagraph.textContent = message.substring(0, ++charIndex);
            currentChunkChar++;
            scrollToBottom();
            
            // Randomize typing speed slightly to look more human
            currentDelay = avgHumanTypingSpeed + (Math.random() * variability - variability/2);
            
        }, avgHumanTypingSpeed);
        
    }, thinkingTime);
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

// Set up "real typing" effect for the user input field
userInput.addEventListener('keydown', function(e) {
    // Skip for special keys like arrows, shift, etc.
    if (e.ctrlKey || e.altKey || e.metaKey || 
        e.key === 'Shift' || e.key === 'Control' || 
        e.key === 'Alt' || e.key === 'Meta' ||
        e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
        e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        return;
    }
    
    // Handle actual typing
    if (e.key === 'Backspace') {
        inputBuffer = inputBuffer.slice(0, -1);
    } else if (e.key.length === 1) {
        inputBuffer += e.key;
    }
});

// Handle form submission
chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get the user input
    const message = userInput.value.trim();
    
    // Clear and reset the textarea and buffer
    userInput.value = '';
    userInput.style.height = 'auto';
    inputBuffer = '';
    
    // If the message is empty or the AI is still generating, do nothing
    if (message === '' || isGenerating) return;
    
    // First add a visible typing indicator for the user message
    const userMessageContainer = document.createElement('div');
    userMessageContainer.className = 'message-container user-message';
    
    const userMessageContent = document.createElement('div');
    userMessageContent.className = 'message-content';
    
    const userTypingIndicator = document.createElement('div');
    userTypingIndicator.className = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'typing-dot';
        userTypingIndicator.appendChild(dot);
    }
    
    userMessageContent.appendChild(userTypingIndicator);
    userMessageContainer.appendChild(userMessageContent);
    chatMessages.appendChild(userMessageContainer);
    
    // Make the container visible
    setTimeout(() => {
        userMessageContainer.classList.add('visible');
        scrollToBottom();
    }, 10);
    
    // Simulate user typing
    setTimeout(() => {
        userMessageContent.removeChild(userTypingIndicator);
        
        const messageParagraph = document.createElement('p');
        messageParagraph.className = 'mb-0 message-paragraph-typing';
        
        // Gradually reveal the message character by character
        let charIndex = 0;
        const typingSpeed = Math.min(Math.max(message.length * 8, 500), 1500); // Between 0.5 and 1.5 seconds
        const typingInterval = setInterval(() => {
            messageParagraph.textContent = message.substring(0, charIndex + 1);
            charIndex++;
            scrollToBottom();
            
            if (charIndex >= message.length) {
                clearInterval(typingInterval);
                
                // Remove the typing cursor class once typing is complete
                messageParagraph.classList.remove('message-paragraph-typing');
                
                // Add to current conversation once typing is complete
                currentConversation.push({
                    role: 'user',
                    content: message
                });
                
                // Generate AI response after user typing is complete
                setTimeout(() => {
                    generateResponse(message);
                }, 500);
            }
        }, typingSpeed / message.length);
        
        userMessageContent.appendChild(messageParagraph);
    }, 800);
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
