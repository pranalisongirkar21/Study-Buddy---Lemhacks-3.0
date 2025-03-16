// AI Study Buddy Assistant
class AIStudyBuddy {
    constructor() {
        this.context = {
            currentSubject: null,
            learningStyle: null,
            difficultyLevel: 'intermediate',
            sessionHistory: [],
            userPreferences: {}
        };

        this.learningStyles = {
            visual: {
                responseStyle: 'Uses diagrams, charts, and visual explanations',
                suggestions: ['Draw diagrams', 'Create mind maps', 'Watch educational videos']
            },
            auditory: {
                responseStyle: 'Emphasizes verbal explanations and discussions',
                suggestions: ['Listen to educational podcasts', 'Participate in group discussions', 'Record and replay explanations']
            },
            kinesthetic: {
                responseStyle: 'Focuses on practical exercises and hands-on examples',
                suggestions: ['Practice with real-world examples', 'Use physical models', 'Conduct experiments']
            },
            reading: {
                responseStyle: 'Provides detailed written explanations and references',
                suggestions: ['Read textbooks', 'Take detailed notes', 'Write summaries']
            }
        };

        this.subjectExperts = {
            mathematics: {
                topics: ['algebra', 'calculus', 'geometry', 'statistics'],
                resources: ['Khan Academy', 'Wolfram Alpha', 'Mathematics Stack Exchange'],
                practiceTypes: ['Problem solving', 'Proof writing', 'Mathematical modeling']
            },
            physics: {
                topics: ['mechanics', 'electromagnetism', 'thermodynamics', 'quantum physics'],
                resources: ['PhET Simulations', 'Physics Classroom', 'HyperPhysics'],
                practiceTypes: ['Problem solving', 'Lab experiments', 'Conceptual understanding']
            },
            chemistry: {
                topics: ['organic', 'inorganic', 'physical', 'analytical'],
                resources: ['ChemTutor', 'PubChem', 'Chemistry LibreTexts'],
                practiceTypes: ['Lab work', 'Molecular modeling', 'Chemical equations']
            },
            biology: {
                topics: ['genetics', 'ecology', 'anatomy', 'molecular biology'],
                resources: ['Biology Online', 'HHMI BioInteractive', 'Nature Education'],
                practiceTypes: ['Case studies', 'Lab experiments', 'Field observations']
            },
            'computer science': {
                topics: ['programming', 'algorithms', 'data structures', 'databases'],
                resources: ['LeetCode', 'Codecademy', 'GitHub'],
                practiceTypes: ['Coding exercises', 'Project building', 'Algorithm analysis']
            }
        };
    }

    // Set user's learning preferences
    setLearningPreferences(preferences) {
        this.context.learningStyle = preferences.learningStyle;
        this.context.difficultyLevel = preferences.difficultyLevel;
        this.context.userPreferences = {
            ...this.context.userPreferences,
            ...preferences
        };
    }

    // Generate personalized study plan
    generateStudyPlan(subject, topic, duration) {
        const plan = {
            subject,
            topic,
            duration,
            activities: [],
            resources: [],
            milestones: []
        };

        const subjectInfo = this.subjectExperts[subject.toLowerCase()];
        const learningStyle = this.learningStyles[this.context.learningStyle];

        if (subjectInfo && learningStyle) {
            // Add learning style specific activities
            plan.activities = learningStyle.suggestions.map(suggestion => ({
                type: suggestion,
                duration: Math.floor(duration / 3) + ' minutes',
                completed: false
            }));

            // Add subject-specific resources
            plan.resources = subjectInfo.resources.map(resource => ({
                name: resource,
                type: 'reference',
                priority: 'high'
            }));

            // Create milestones
            plan.milestones = [
                { name: 'Understand core concepts', deadline: '1 week' },
                { name: 'Complete practice exercises', deadline: '2 weeks' },
                { name: 'Take practice assessment', deadline: '3 weeks' }
            ];
        }

        return plan;
    }

    // Generate contextual response
    async generateResponse(userInput) {
        // Add to session history
        this.context.sessionHistory.push({
            role: 'user',
            content: userInput,
            timestamp: new Date()
        });

        let response = {
            text: '',
            suggestions: [],
            resources: []
        };

        // Analyze user input for intent
        const intent = this.analyzeIntent(userInput);

        switch (intent.type) {
            case 'question':
                response = await this.handleQuestion(userInput);
                break;
            case 'plan':
                response = this.handleStudyPlanRequest(userInput);
                break;
            case 'help':
                response = this.provideHelp(intent.subject);
                break;
            case 'feedback':
                response = this.handleFeedback(userInput);
                break;
            default:
                response.text = "I'm not sure how to help with that. Could you please rephrase or specify what kind of help you need?";
        }

        // Add response to session history
        this.context.sessionHistory.push({
            role: 'assistant',
            content: response,
            timestamp: new Date()
        });

        return response;
    }

    // Analyze user input intent
    analyzeIntent(input) {
        const input_lower = input.toLowerCase();
        
        // Question patterns
        if (input_lower.match(/^(what|how|why|when|where|can you|could you|explain)/)) {
            return { type: 'question', confidence: 0.9 };
        }

        // Study plan request patterns
        if (input_lower.includes('study plan') || input_lower.includes('schedule') || input_lower.includes('organize')) {
            return { type: 'plan', confidence: 0.8 };
        }

        // Help request patterns
        if (input_lower.includes('help') || input_lower.includes('stuck') || input_lower.includes('confused')) {
            return { type: 'help', confidence: 0.7 };
        }

        // Feedback patterns
        if (input_lower.includes('feedback') || input_lower.includes('review') || input_lower.includes('check')) {
            return { type: 'feedback', confidence: 0.6 };
        }

        return { type: 'unknown', confidence: 0.3 };
    }

    // Handle specific question
    async handleQuestion(question) {
        const response = {
            text: '',
            suggestions: [],
            resources: []
        };

        // Identify subject and topic
        const subject = this.identifySubject(question);
        const topic = this.identifyTopic(question, subject);

        if (subject && this.subjectExperts[subject]) {
            const expertInfo = this.subjectExperts[subject];
            
            // Generate subject-specific response
            response.text = `Let me help you with your ${subject} question about ${topic}. `;
            response.text += this.generateSubjectSpecificResponse(subject, topic, question);
            
            // Add relevant resources
            response.resources = expertInfo.resources.slice(0, 2);
            
            // Add practice suggestions
            response.suggestions = expertInfo.practiceTypes.slice(0, 2).map(type => ({
                type: type,
                description: `Try ${type.toLowerCase()} to reinforce your understanding.`
            }));
        } else {
            response.text = "I'll do my best to help. Could you please specify which subject you're asking about?";
        }

        return response;
    }

    // Generate subject-specific response
    generateSubjectSpecificResponse(subject, topic, question) {
        const learningStyle = this.context.learningStyle;
        let response = '';

        // Adapt response based on learning style
        if (learningStyle && this.learningStyles[learningStyle]) {
            const styleInfo = this.learningStyles[learningStyle];
            response += `Based on your ${learningStyle} learning style, let me explain this ${styleInfo.responseStyle}. `;
        }

        // Add subject-specific content
        if (this.subjectExperts[subject]) {
            const expertInfo = this.subjectExperts[subject];
            response += `In ${subject}, ${topic} is a key concept that relates to ${expertInfo.topics.join(', ')}. `;
        }

        return response;
    }

    // Identify subject from user input
    identifySubject(input) {
        const input_lower = input.toLowerCase();
        return Object.keys(this.subjectExperts).find(subject => 
            input_lower.includes(subject) || 
            this.subjectExperts[subject].topics.some(topic => input_lower.includes(topic))
        );
    }

    // Identify topic within a subject
    identifyTopic(input, subject) {
        if (!subject || !this.subjectExperts[subject]) return null;
        
        const input_lower = input.toLowerCase();
        return this.subjectExperts[subject].topics.find(topic => 
            input_lower.includes(topic)
        ) || 'general concepts';
    }

    // Handle study plan request
    handleStudyPlanRequest(input) {
        const subject = this.identifySubject(input);
        if (!subject) {
            return {
                text: "I'd be happy to help create a study plan. Which subject would you like to focus on?",
                suggestions: Object.keys(this.subjectExperts)
            };
        }

        const plan = this.generateStudyPlan(subject, 'general', 60);
        return {
            text: `I've created a personalized study plan for ${subject}. Here's what I recommend:`,
            plan: plan,
            suggestions: plan.activities.map(a => a.type)
        };
    }

    // Provide help based on subject
    provideHelp(subject) {
        if (!subject) {
            return {
                text: "I'm here to help! What subject are you working on?",
                suggestions: Object.keys(this.subjectExperts)
            };
        }

        const expertInfo = this.subjectExperts[subject];
        return {
            text: `Let's work through this ${subject} problem together. What specific topic are you struggling with?`,
            topics: expertInfo.topics,
            resources: expertInfo.resources
        };
    }

    // Handle feedback request
    handleFeedback(input) {
        return {
            text: "I'll review your work and provide feedback. Could you share what you've done so far?",
            suggestions: [
                "Share your solution",
                "Explain your approach",
                "Show your work"
            ]
        };
    }
}

// Export the AI Study Buddy class
export default AIStudyBuddy; 