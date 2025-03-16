// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const loginBtn = document.querySelector('.login-btn');
const subjectCards = document.querySelectorAll('.subject-card');
const ctaButtons = document.querySelectorAll('.cta-buttons button');

// Mobile Menu Toggle
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

// Login Button Click Handler
loginBtn.addEventListener('click', () => {
    window.location.href = 'login.html';
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu after clicking a link
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
});

// Add hover effect and click handler for subject cards
subjectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });

    // Updated click handler to redirect to study materials page
    card.addEventListener('click', () => {
        const subject = card.textContent.trim();
        window.location.href = `study-materials.html?subject=${encodeURIComponent(subject)}`;
    });
});


// Add click handlers for CTA buttons
ctaButtons.forEach(button => {
    button.addEventListener('click', () => {
        const action = button.textContent.toLowerCase();
        if (action.includes('find')) {
            window.location.href = 'find-tutor.html';
        } else if (action.includes('become')) {
            window.location.href = 'become-tutor.html';
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all feature cards and subject cards
document.querySelectorAll('.feature-card, .subject-card').forEach(card => {
    observer.observe(card);
});

// Form validation enhancement
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');

if (emailInput && passwordInput) {
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6;
    }

    emailInput.addEventListener('input', () => {
        if (!validateEmail(emailInput.value)) {
            emailInput.setCustomValidity('Please enter a valid email address');
        } else {
            emailInput.setCustomValidity('');
        }
    });

    passwordInput.addEventListener('input', () => {
        if (!validatePassword(passwordInput.value)) {
            passwordInput.setCustomValidity('Password must be at least 6 characters long');
        } else {
            passwordInput.setCustomValidity('');
        }
    });
}

// Add loading states to buttons
function addLoadingState(button) {
    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    return () => {
        button.disabled = false;
        button.textContent = originalText;
    };
}

// Example usage for login form if it exists
const loginForm = document.querySelector('#loginForm');
if (loginForm) {
    const loginSubmitBtn = loginForm.querySelector('button[type="submit"]');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const resetLoading = addLoadingState(loginSubmitBtn);
        
        // Simulate API call
        setTimeout(() => {
            resetLoading();
            // Handle login logic here
        }, 1500);
    });
}
