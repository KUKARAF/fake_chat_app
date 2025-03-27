# Animated Chat Application

This is a Flask-based chat application that demonstrates realistic typing animations, message categories, and simulated AI responses - all with beautiful animations and visual effects.

## Features

- Realistic typing animations for both user and AI messages
- Animated typing indicators (dot animations) before messages appear
- Cursor blinking effect during message typing simulation
- Natural pauses at punctuation for more human-like typing
- Different colored typing indicators for user vs AI messages
- Category tags displayed with AI responses
- Mobile-responsive design with sidebar toggling
- Conversation history storage and loading

## How to Run the Application

1. Make sure you have Python installed (Python 3.6 or later)
2. Install the required dependencies:
   ```
   pip install flask flask-sqlalchemy gunicorn psycopg2-binary email-validator
   ```

3. Start the application:
   ```
   gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app
   ```
   
   Or simply use the Replit "Run" button to activate the configured workflow.

4. Open your browser and navigate to the application URL (e.g., http://localhost:5000 or your Replit URL)

## How to Modify AI Responses

The AI responses in this application are currently mocked using simple keyword matching in JavaScript. You can modify these responses in a few ways:

### 1. Editing Responses in JavaScript

Open the file `static/js/chat.js` and locate the `generateResponse()` function. This function contains the keyword matching logic and response templates.

```javascript
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
    // Add more responses here...
}
```

To add a new response pattern:
1. Add a new conditional check for keywords
2. Define the response text
3. Define categories for the response

Example of adding a new response:

```javascript
else if (lowerMessage.includes('music') || lowerMessage.includes('song')) {
    response = "Music is a universal language! I can discuss music theory, genres, instruments, or recommend songs. What aspect of music interests you most?";
    categories = ["Music", "Entertainment", "Culture"];
}
```

### 2. Using the Pre-defined Conversations in JSON

The application loads pre-defined conversations from a JSON file. You can edit the `data/conversations.json` file to add new scripted conversations:

1. Open `data/conversations.json`
2. Add a new conversation object to the array with a title and messages
3. Each message should have a `role` ("user" or "system") and `content`
4. For system messages, you can also include `categories` as an array of strings

Example of adding a new conversation:

```json
{
  "title": "Learning about Python",
  "messages": [
    {
      "role": "user",
      "content": "Tell me about Python programming"
    },
    {
      "role": "system",
      "content": "Python is a high-level, interpreted programming language known for its readability and simplicity. It's widely used in data science, web development, and automation.",
      "categories": ["Programming", "Python", "Technology"]
    },
    {
      "role": "user",
      "content": "What are some popular Python libraries?"
    },
    {
      "role": "system",
      "content": "Some popular Python libraries include NumPy for numerical computing, Pandas for data analysis, TensorFlow and PyTorch for machine learning, Django and Flask for web development, and Matplotlib for data visualization.",
      "categories": ["Libraries", "Python", "Programming Tools"]
    }
  ]
}
```

### 3. Backend Integration (Advanced)

For more sophisticated responses, you can modify the application to use a backend API:

1. Create a new endpoint in `app.py` that handles message processing
2. Modify the `generateResponse()` function in `chat.js` to make an API call to your endpoint
3. Implement more advanced NLP or integrate with external APIs in your backend

Example of modifying the frontend to use a backend API:

```javascript
// In chat.js
async function generateResponse(userMessage) {
    try {
        const response = await fetch('/api/generate_response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
        });
        
        const data = await response.json();
        
        if (data.response) {
            // Add the system message with a delay to simulate processing
            setTimeout(() => {
                addSystemMessage(data.response, data.categories || []);
            }, 1000);
        }
    } catch (error) {
        console.error('Error generating response:', error);
        addSystemMessage("I'm sorry, I encountered an error processing your request.", ["Error"]);
    }
}
```

## Animation Configuration

You can adjust the animation timing and behavior by modifying these parameters in `chat.js`:

- `avgHumanTypingSpeed`: Controls the typing speed for AI responses
- `variability`: Adds randomness to the typing speed
- `thinkingTime`: Delay before AI starts typing
- `typingSpeed`: Speed for user message typing animation

## Contributing

Feel free to fork this project and make your own enhancements. Some ideas for improvement:

- Add real-time chat capabilities using WebSockets
- Implement user authentication
- Store conversations in a database
- Integrate with a real AI service API
- Add more animations and visual effects