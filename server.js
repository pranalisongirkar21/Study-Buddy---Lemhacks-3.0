const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Simple knowledge base for different subjects
const knowledgeBase = {
    Mathematics: {
        keywords: {
            'solve': 'To solve a problem, break it down into smaller steps and tackle each part separately.',
            'equation': 'An equation is a mathematical statement that shows two expressions are equal. It contains an equals sign (=) and may have variables.',
            'algebra': 'Algebra is a branch of mathematics dealing with symbols and the rules for manipulating these symbols.',
            'calculus': 'Calculus is the mathematical study of continuous change.',
            'geometry': 'Geometry is a branch of mathematics that studies the sizes, shapes, positions, and dimensions of things.'
        },
        defaultResponse: 'That\'s an interesting math question! Try breaking it down into smaller parts and applying relevant formulas.'
    },
    Physics: {
        keywords: {
            'force': 'Force is any interaction that, when unopposed, will change the motion of an object.',
            'energy': 'Energy is the ability to do work. It exists in various forms like kinetic, potential, thermal, etc.',
            'motion': 'Motion is the change in position of an object over time.',
            'gravity': 'Gravity is a force of attraction between all masses in the universe.',
            'velocity': 'Velocity is the speed of an object in a specific direction.'
        },
        defaultResponse: 'That\'s an interesting physics question! Remember to consider the fundamental laws and principles involved.'
    },
    Chemistry: {
        keywords: {
            'reaction': 'A chemical reaction is a process where substances change into different substances.',
            'element': 'An element is a pure substance made of only one type of atom.',
            'molecule': 'A molecule is a group of atoms bonded together.',
            'acid': 'Acids are substances that donate hydrogen ions (H+) in solutions.',
            'base': 'Bases are substances that accept hydrogen ions (H+) in solutions.'
        },
        defaultResponse: 'That\'s an interesting chemistry question! Consider the properties and interactions of the substances involved.'
    },
    Biology: {
        keywords: {
            'cell': 'A cell is the basic unit of life, capable of replicating independently.',
            'dna': 'DNA is a molecule that carries genetic instructions for development and functioning.',
            'evolution': 'Evolution is the change in characteristics of species over generations.',
            'protein': 'Proteins are large molecules that perform various functions in living organisms.',
            'ecosystem': 'An ecosystem is a community of living organisms and their physical environment.'
        },
        defaultResponse: 'That\'s an interesting biology question! Think about how different biological systems interact.'
    },
    'Computer Science': {
        keywords: {
            'algorithm': 'An algorithm is a step-by-step procedure for solving a problem or accomplishing a task.',
            'programming': 'Programming is the process of creating a set of instructions for computers to follow.',
            'database': 'A database is an organized collection of structured information.',
            'loop': 'A loop is a sequence of instructions that is repeated until a certain condition is met.',
            'function': 'A function is a reusable block of code that performs a specific task.'
        },
        defaultResponse: 'That\'s an interesting computer science question! Try breaking down the problem into smaller, manageable parts.'
    },
    Literature: {
        keywords: {
            'analysis': 'Literary analysis involves examining the different components and meaning of a text.',
            'theme': 'A theme is the central idea or underlying meaning of a literary work.',
            'character': 'A character is a person, animal, or entity in a story.',
            'plot': 'Plot is the sequence of events in a story.',
            'metaphor': 'A metaphor is a figure of speech that makes a direct comparison between two unlike things.'
        },
        defaultResponse: 'That\'s an interesting literature question! Consider the context and deeper meaning of the text.'
    }
};

// Function to generate response based on topic and message
function generateResponse(topic, message) {
    const topicData = knowledgeBase[topic];
    if (!topicData) {
        return 'I\'m not familiar with that subject. Please try asking about Mathematics, Physics, Chemistry, Biology, Computer Science, or Literature.';
    }

    // Convert message to lowercase for better matching
    const messageLower = message.toLowerCase();
    
    // Check for keywords in the message
    for (const [keyword, response] of Object.entries(topicData.keywords)) {
        if (messageLower.includes(keyword.toLowerCase())) {
            return response;
        }
    }

    // If no keyword matches, return default response for the topic
    return topicData.defaultResponse;
}

// Chat endpoint
app.post('/api/chat', (req, res) => {
    try {
        const { message, topic } = req.body;
        
        if (!message || !topic) {
            return res.status(400).json({
                error: 'Missing message or topic',
                response: 'Please provide both a message and a topic.'
            });
        }

        const response = generateResponse(topic, message);
        res.json({ response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Something went wrong',
            response: 'I apologize, but I\'m having trouble processing your request. Please try again.'
        });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ status: 'Server is running properly' });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Access the chat interface at http://localhost:${port}/chat.html`);
}); 