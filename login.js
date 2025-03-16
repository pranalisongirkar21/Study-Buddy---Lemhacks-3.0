// DOM Elements
const loginForm = document.getElementById('loginForm');
const switchToSignUpBtn = document.getElementById('switchToSignUp');
const loadingOverlay = document.querySelector('.loading-overlay');
const toastContainer = document.querySelector('.toast-container');

// Form Validation
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    
    const text = document.createElement('span');
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);
    toastContainer.appendChild(toast);
    
    // Animate and remove toast
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Loading State
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Handle Google Sign In
function handleGoogleSignIn(response) {
    try {
        showLoading();
        
        // Get the credential from Google's response
        const credential = response.credential;
        const decodedToken = JSON.parse(atob(credential.split('.')[1]));
        
        // Extract user information
        const { name, email, picture } = decodedToken;
        
        // Store user info in localStorage
        const userProfile = {
            name,
            email,
            picture,
            isLoggedIn: true,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        showToast('Successfully signed in with Google!', 'success');
        
        // Redirect to homepage after successful login
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Google Sign In error:', error);
        showToast('Failed to sign in with Google. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Handle Login Form Submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;
    const rememberMe = loginForm.querySelector('input[type="checkbox"]').checked;
    
    // Validation
    if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showToast('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        showLoading();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // For demo purposes - In real application, you would handle the API response
        showToast('Login successful! Redirecting...', 'success');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        showToast('Login failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
});

// Switch to Sign Up
switchToSignUpBtn.addEventListener('click', () => {
    window.location.href = 'signup.html';
});

// Social Media Authentication
document.querySelectorAll('.social-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        const platform = button.classList[1];
        
        try {
            showLoading();
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            showToast(`Successfully authenticated with ${platform}`, 'success');
            
            // Redirect to dashboard after successful social login
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } catch (error) {
            showToast(`Failed to authenticate with ${platform}`, 'error');
        } finally {
            hideLoading();
        }
    });
});

// Add input animations
document.querySelectorAll('.input-field input').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
        if (!input.value) {
            input.parentElement.classList.remove('focused');
        }
    });
}); 