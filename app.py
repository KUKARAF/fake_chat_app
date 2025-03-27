import os
import json
import logging
from flask import Flask, render_template, jsonify

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

def load_conversations():
    """Load the conversation data from JSON file"""
    try:
        with open('data/conversations.json', 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        logger.error("Conversations file not found")
        return {"conversations": []}
    except json.JSONDecodeError:
        logger.error("Invalid JSON in conversations file")
        return {"conversations": []}

@app.route('/')
def index():
    """Render the main chat interface"""
    return render_template('index.html')

@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    """API endpoint to get the conversation data"""
    conversations = load_conversations()
    return jsonify(conversations)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
