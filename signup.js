// DOM Elements
const formsContainer = document.querySelector('.forms-container');
const signUpBtn = document.querySelector('#sign-up-btn');
const signInBtn = document.querySelector('#sign-in-btn');
const signInForm = document.querySelector('.sign-in-form');
const signUpForm = document.querySelector('.sign-up-form');
const signupForm = document.getElementById('signupForm');
const switchToSignInBtn = document.getElementById('switchToSignIn');
const loadingOverlay = document.querySelector('.loading-overlay');
const toastContainer = document.querySelector('.toast-container');

// Toggle Forms
signUpBtn.addEventListener('click', () => {
    formsContainer.classList.add('sign-up-mode');
});

signInBtn.addEventListener('click', () => {
    formsContainer.classList.remove('sign-up-mode');
});

// Form Validation
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
}

function validateConfirmPassword(password, confirmPassword) {
    return password === confirmPassword;
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

// Password Strength Indicator
function createPasswordStrengthIndicator(passwordInput) {
    const strengthIndicator = document.createElement('div');
    strengthIndicator.className = 'password-strength';
    
    const strengthBar = document.createElement('div');
    strengthBar.className = 'strength-bar';
    
    const strengthText = document.createElement('span');
    strengthText.className = 'strength-text';
    
    strengthIndicator.appendChild(strengthBar);
    strengthIndicator.appendChild(strengthText);
    
    passwordInput.parentElement.appendChild(strengthIndicator);
    
    return { strengthBar, strengthText };
}

function updatePasswordStrength(password, strengthBar, strengthText) {
    let strength = 0;
    let feedback = '';
    
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    strengthBar.style.width = `${strength}%`;
    
    if (strength <= 25) {
        strengthBar.style.backgroundColor = '#ff4444';
        feedback = 'Weak';
    } else if (strength <= 50) {
        strengthBar.style.backgroundColor = '#ffa700';
        feedback = 'Fair';
    } else if (strength <= 75) {
        strengthBar.style.backgroundColor = '#00C851';
        feedback = 'Good';
    } else {
        strengthBar.style.backgroundColor = '#007E33';
        feedback = 'Strong';
    }
    
    strengthText.textContent = feedback;
}

// Handle Sign In Form
signInForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = signInForm.querySelector('input[type="email"]').value;
    const password = signInForm.querySelector('input[type="password"]').value;
    const rememberMe = signInForm.querySelector('input[type="checkbox"]').checked;

    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }

    if (!validatePassword(password)) {
        showError('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
        return;
    }

    // Add loading state
    const submitBtn = signInForm.querySelector('input[type="submit"]');
    const originalText = submitBtn.value;
    submitBtn.value = 'Signing in...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        console.log('Sign in:', { email, password, rememberMe });
        submitBtn.value = originalText;
        submitBtn.disabled = false;
        
        // For demo purposes
        showSuccess('Successfully signed in!');
        // Redirect to dashboard after successful login
        // window.location.href = 'dashboard.html';
    }, 1500);
});

// Handle Google Sign Up
function handleGoogleSignUp(response) {
    try {
        showLoading();
        
        // Get the credential from Google's response
        const credential = response.credential;
        const decodedToken = JSON.parse(atob(credential.split('.')[1]));
        
        // Extract user information
        const { name, email, picture } = decodedToken;
        
        // Here you would typically send this token to your backend
        console.log('Google Sign Up successful:', { name, email, picture });
        
        showToast('Successfully signed up with Google!', 'success');
        
        // Redirect to dashboard with a small delay to show loading state
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
        
    } catch (error) {
        console.error('Google Sign Up error:', error);
        showToast('Failed to sign up with Google. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Handle Sign Up Form
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(signupForm);
    const data = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        userType: formData.get('userType')
    };
    
    // Validation
    if (!data.fullName.trim()) {
        showToast('Please enter your full name', 'error');
        return;
    }
    
    if (!validateEmail(data.email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    if (!validatePassword(data.password)) {
        showToast('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers', 'error');
        return;
    }
    
    if (!validateConfirmPassword(data.password, data.confirmPassword)) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    try {
        showLoading();
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showToast('Account created successfully! Redirecting to login...', 'success');
        
        // Redirect to dashboard with a small delay to show loading state
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
        
    } catch (error) {
        showToast('An error occurred. Please try again.', 'error');
    } finally {
        hideLoading();
    }
});

// Error and Success Messages
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message error';
    errorDiv.textContent = message;
    
    // Remove any existing messages
    removeMessages();
    
    // Add new message
    document.querySelector('.forms-container').appendChild(errorDiv);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'message success';
    successDiv.textContent = message;
    
    // Remove any existing messages
    removeMessages();
    
    // Add new message
    document.querySelector('.forms-container').appendChild(successDiv);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

function removeMessages() {
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => message.remove());
}

// Add these styles dynamically
const style = document.createElement('style');
style.textContent = `
    .message {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }

    .message.error {
        background-color: #ff4444;
    }

    .message.success {
        background-color: #00C851;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

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
        } catch (error) {
            showToast(`Failed to authenticate with ${platform}`, 'error');
        } finally {
            hideLoading();
        }
    });
});

// Switch to Sign In
switchToSignInBtn.addEventListener('click', () => {
    window.location.href = 'login.html';
});

// Initialize password strength indicator
const passwordInput = signupForm.querySelector('input[type="password"]');
const { strengthBar, strengthText } = createPasswordStrengthIndicator(passwordInput);

passwordInput.addEventListener('input', (e) => {
    updatePasswordStrength(e.target.value, strengthBar, strengthText);
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