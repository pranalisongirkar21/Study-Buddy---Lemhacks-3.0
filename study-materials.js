// Get the subject from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const subject = urlParams.get('subject');

// Update the page title with the subject
const subjectTitle = document.getElementById('subject-title');
if (subject) {
    subjectTitle.textContent = subject;
    document.title = `${subject} Study Materials - Study Buddy`;
}

// Mobile menu functionality
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Handle download buttons
document.querySelectorAll('.download-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        
        const materialTitle = button.closest('.material-card').querySelector('h3').textContent;
        const isViewDetails = button.textContent === 'View Details';
        
        if (isViewDetails) {
            showDetailsModal(materialTitle);
        } else {
            // Simulate PDF download
            simulateDownload(materialTitle);
        }
    });
});

// Show details modal
function showDetailsModal(title) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'pdf-modal';
    
    modal.innerHTML = `
        <div class="pdf-modal-content">
            <span class="close-modal">&times;</span>
            <h2>${title}</h2>
            <div class="material-details">
                <p><strong>Author:</strong> John Doe</p>
                <p><strong>Publisher:</strong> Education Press</p>
                <p><strong>Year:</strong> 2024</p>
                <p><strong>Description:</strong> This comprehensive resource covers all essential topics with detailed explanations and examples.</p>
                <p><strong>Price:</strong> $29.99</p>
                <button class="download-btn">Purchase Now</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => {
        modal.remove();
    };
    
    // Close modal when clicking outside
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// Simulate download
function simulateDownload(title) {
    // Create loading overlay
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loading);
    
    // Simulate download delay
    setTimeout(() => {
        loading.remove();
        alert(`Download started for: ${title}`);
    }, 1500);
}

// Add animation on scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.material-section').forEach(section => {
    observer.observe(section);
}); 