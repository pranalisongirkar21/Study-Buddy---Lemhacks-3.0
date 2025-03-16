// DOM Elements
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const chatMessages = document.getElementById('chatMessages');
const topicList = document.querySelector('.topic-list');
const learningStyleSelect = document.getElementById('learningStyle');
const difficultySelect = document.getElementById('difficultyLevel');

// Set initial topic from localStorage or default to Mathematics
let currentTopic = localStorage.getItem('selectedSubject') || 'Mathematics';

// Initialize chat interface
document.addEventListener('DOMContentLoaded', () => {
    // Update active topic in sidebar
    updateActiveTopic();
    
    // Add welcome message
    addMessage({
        text: `Hello! I'm your AI study assistant. I see you're interested in ${currentTopic}. How can I help you with your studies today?`,
        suggestions: [
            'Create a study plan',
            'Ask a question',
            'Get help with a problem',
            'Review my work'
        ]
    });
});

// Function to add a message to the chat
function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const icon = document.createElement('i');
    icon.className = isUser ? 'fas fa-user' : 'fas fa-robot';
    messageContent.appendChild(icon);
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-wrapper';

    // Add main text
    const textContent = document.createElement('div');
    textContent.className = 'text';
    textContent.textContent = isUser ? message : message.text;
    textDiv.appendChild(textContent);

    // Add suggestions if available
    if (!isUser && message.suggestions && message.suggestions.length > 0) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'suggestions';
        message.suggestions.forEach(suggestion => {
            const suggestionBtn = document.createElement('button');
            suggestionBtn.className = 'suggestion-btn';
            suggestionBtn.textContent = suggestion;
            suggestionBtn.onclick = () => {
                userInput.value = suggestion;
                chatForm.dispatchEvent(new Event('submit'));
            };
            suggestionsDiv.appendChild(suggestionBtn);
        });
        textDiv.appendChild(suggestionsDiv);
    }

    messageContent.appendChild(textDiv);
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to add typing indicator
function addTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator message ai-message';
    indicator.innerHTML = `
        <div class="message-content">
            <i class="fas fa-robot"></i>
            <div class="dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicator;
}

// Function to remove typing indicator
function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.remove();
    }
}

// Update active topic in sidebar
function updateActiveTopic() {
    const topics = document.querySelectorAll('.topic-item');
    topics.forEach(topic => {
        if (topic.textContent === currentTopic) {
            topic.classList.add('active');
        } else {
            topic.classList.remove('active');
        }
    });
}

// Handle form submission
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message = userInput.value.trim();
    if (!message) return;
    
    // Disable input while processing
    userInput.disabled = true;
    
    // Clear input
    userInput.value = '';
    
    // Add user message to chat
    addMessage(message, true);
    
    // Show typing indicator
    const typingIndicator = addTypingIndicator();
    
    try {
        // Get AI response
        const response = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                topic: currentTopic
            })
        });

        const data = await response.json();
        removeTypingIndicator(typingIndicator);
        
        addMessage({
            text: data.response,
            suggestions: [
                'Tell me more',
                'Give me an example',
                'I need help understanding'
            ]
        });
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator(typingIndicator);
        addMessage({
            text: 'Sorry, I encountered an error. Please try again later.',
            suggestions: ['Try a different question', 'Change topic', 'Get help']
        });
    } finally {
        // Re-enable input
        userInput.disabled = false;
        userInput.focus();
    }
});

// Handle topic selection
document.querySelectorAll('.topic-item').forEach(topic => {
    topic.addEventListener('click', () => {
        currentTopic = topic.textContent;
        localStorage.setItem('selectedSubject', currentTopic);
        updateActiveTopic();
        
        addMessage({
            text: `Switching to ${currentTopic}. What would you like to learn about?`,
            suggestions: [
                'Explain basic concepts',
                'Give me practice problems',
                'Help with homework'
            ]
        });
    });
});

// Handle learning style changes
learningStyleSelect.addEventListener('change', (e) => {
    const newStyle = e.target.value;
    localStorage.setItem('learningStyle', newStyle);
    aiStudyBuddy.setLearningPreferences({
        learningStyle: newStyle
    });
    
    addMessage({
        text: `I'll adapt my explanations to your ${newStyle} learning style. How can I help you learn?`,
        suggestions: [
            'Show me an example',
            'Explain a concept',
            'Create a study plan'
        ]
    });
});

// Handle difficulty level changes
difficultySelect.addEventListener('change', (e) => {
    const newLevel = e.target.value;
    localStorage.setItem('difficultyLevel', newLevel);
    aiStudyBuddy.setLearningPreferences({
        difficultyLevel: newLevel
    });
    
    addMessage({
        text: `I'll adjust the difficulty of my explanations to ${newLevel} level. What would you like to learn?`,
        suggestions: [
            'Start with basics',
            'Challenge me',
            'Practice problems'
        ]
    });
});

// Test server connection on load
async function testServerConnection() {
    try {
        const response = await fetch('http://localhost:3000/api/test');
        if (!response.ok) {
            throw new Error('Server test failed');
        }
        // Server is running properly
        updateActiveTopic(); // Update the active topic on load
        addMessage({
            text: `Hello! I'm your AI study assistant. I see you're interested in ${currentTopic}. How can I help you with your studies today?`,
            suggestions: [
                'Create a study plan',
                'Ask a question',
                'Get help with a problem',
                'Review my work'
            ]
        });
    } catch (error) {
        console.error('Server connection error:', error);
        addMessage({
            text: "Sorry, I'm having trouble connecting to the server. Please try refreshing the page.",
            suggestions: ['Try again later', 'Check your internet connection']
        });
    }
}

// Initialize the chat
testServerConnection(); 