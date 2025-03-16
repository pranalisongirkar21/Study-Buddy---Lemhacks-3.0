// Sample data for demonstration
const sampleTutors = [
    {
        id: 1,
        name: "Sarah Johnson",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
        rating: 4.8,
        subjects: ["mathematics", "physics"],
        topics: ["Calculus", "Mechanics"],
        level: "advanced",
        availability: "both",
        experience: "3 years",
        hourlyRate: "$25",
        languages: ["English", "Spanish"]
    },
    {
        id: 2,
        name: "Michael Chen",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
        rating: 4.9,
        subjects: ["computer-science", "mathematics"],
        topics: ["Programming", "Data Structures"],
        level: "intermediate",
        availability: "weekends",
        experience: "4 years",
        hourlyRate: "$30",
        languages: ["English", "Mandarin"]
    },
    // Add more sample tutors as needed
];

// DOM Elements
const subjectSelect = document.getElementById('subject');
const topicInput = document.getElementById('topic');
const levelSelect = document.getElementById('level');
const availabilitySelect = document.getElementById('availability');
const findMatchesBtn = document.querySelector('.find-matches-btn');
const resultsGrid = document.getElementById('resultsGrid');
const sortSelect = document.getElementById('sort');

// Event Listeners
findMatchesBtn.addEventListener('click', findMatches);
sortSelect.addEventListener('change', sortResults);

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Show some initial results
    displayResults(sampleTutors);
});

// Find matches based on filters
function findMatches() {
    const filters = {
        subject: subjectSelect.value,
        topic: topicInput.value.toLowerCase(),
        level: levelSelect.value,
        availability: availabilitySelect.value
    };

    // Show loading state
    showLoading();

    // Simulate API call
    setTimeout(() => {
        // Filter tutors based on criteria
        let matches = sampleTutors.filter(tutor => {
            return (!filters.subject || tutor.subjects.includes(filters.subject)) &&
                   (!filters.topic || tutor.topics.some(t => t.toLowerCase().includes(filters.topic))) &&
                   (!filters.level || tutor.level === filters.level) &&
                   (!filters.availability || tutor.availability === filters.availability || tutor.availability === 'both');
        });

        // Display results
        displayResults(matches);
        hideLoading();
    }, 1000);
}

// Display results in the grid
function displayResults(matches) {
    resultsGrid.innerHTML = '';

    if (matches.length === 0) {
        resultsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No matches found</h3>
                <p>Try adjusting your filters to find more study partners</p>
            </div>
        `;
        return;
    }

    matches.forEach(tutor => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.innerHTML = `
            <div class="match-header">
                <div class="match-avatar">
                    <img src="${tutor.avatar}" alt="${tutor.name}">
                </div>
                <h4 class="match-name">${tutor.name}</h4>
                <div class="match-rating">
                    ${generateStars(tutor.rating)}
                    <span>(${tutor.rating})</span>
                </div>
            </div>
            <div class="match-details">
                <div class="match-info">
                    <i class="fas fa-book"></i> ${tutor.subjects.join(', ')}
                </div>
                <div class="match-info">
                    <i class="fas fa-clock"></i> ${tutor.availability}
                </div>
                <div class="match-info">
                    <i class="fas fa-graduation-cap"></i> ${tutor.experience}
                </div>
                <div class="match-info">
                    <i class="fas fa-dollar-sign"></i> ${tutor.hourlyRate}/hour
                </div>
                <div class="match-info">
                    <i class="fas fa-language"></i> ${tutor.languages.join(', ')}
                </div>
            </div>
            <div class="match-actions">
                <button class="match-btn connect-btn" onclick="connectWithTutor(${tutor.id})">
                    Connect
                </button>
                <button class="match-btn message-btn" onclick="messageTutor(${tutor.id})">
                    Message
                </button>
            </div>
        `;
        resultsGrid.appendChild(card);
    });
}

// Generate star rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}

// Sort results
function sortResults() {
    const sortBy = sortSelect.value;
    const currentResults = Array.from(resultsGrid.children);
    
    if (currentResults.length <= 1) return;

    const sortedResults = currentResults.sort((a, b) => {
        switch (sortBy) {
            case 'rating':
                return parseFloat(b.querySelector('.match-rating span').textContent.slice(1, -1)) -
                       parseFloat(a.querySelector('.match-rating span').textContent.slice(1, -1));
            case 'experience':
                return parseInt(b.querySelector('.match-info:nth-child(3)').textContent) -
                       parseInt(a.querySelector('.match-info:nth-child(3)').textContent);
            default:
                return 0;
        }
    });

    resultsGrid.innerHTML = '';
    sortedResults.forEach(card => resultsGrid.appendChild(card));
}

// Loading state
function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    loading.innerHTML = '<div class="loading-spinner"></div>';
    resultsGrid.appendChild(loading);
}

function hideLoading() {
    const loading = document.querySelector('.loading-overlay');
    if (loading) loading.remove();
}

// Connect with tutor
function connectWithTutor(tutorId) {
    window.location.href = `tutor-connect.html?tutorId=${tutorId}`;
}

// Message tutor
function messageTutor(tutorId) {
    window.location.href = `tutor-connect.html?tutorId=${tutorId}#chat`;
} 