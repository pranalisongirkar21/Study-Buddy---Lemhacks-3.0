// User Profile Management
class UserProfileManager {
    constructor() {
        this.userProfile = null;
        this.init();
    }

    init() {
        this.loadUserProfile();
        this.setupEventListeners();
        this.updateUI();
    }

    loadUserProfile() {
        const profileData = localStorage.getItem('userProfile');
        if (profileData) {
            try {
                this.userProfile = JSON.parse(profileData);
            } catch (e) {
                console.error('Error parsing user profile:', e);
                localStorage.removeItem('userProfile');
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const dropdown = document.querySelector('.profile-dropdown');
            if (dropdown && !e.target.closest('.user-profile')) {
                dropdown.classList.remove('active');
            }
        });
    }

    updateUI() {
        const loginBtn = document.querySelector('.login-btn');
        const navLinks = document.querySelector('.nav-links');

        if (!navLinks) return;

        if (this.userProfile) {
            // Remove login button if exists
            if (loginBtn) {
                loginBtn.remove();
            }

            // Remove existing profile if any
            const existingProfile = document.querySelector('.user-profile');
            if (existingProfile) {
                existingProfile.remove();
            }

            // Create new profile element
            const userProfileElement = this.createProfileElement();
            navLinks.insertAdjacentHTML('beforeend', userProfileElement);

            // Setup dropdown toggle
            const profileContainer = document.querySelector('.user-profile');
            if (profileContainer) {
                profileContainer.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const dropdown = profileContainer.querySelector('.profile-dropdown');
                    if (dropdown) {
                        dropdown.classList.toggle('active');
                    }
                });
            }

            // Setup logout handler
            const logoutBtn = document.querySelector('.logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
            }
        } else {
            // Ensure login button exists
            if (!loginBtn && navLinks) {
                const loginBtnHtml = '<li><button class="login-btn" onclick="window.location.href=\'login.html\'">Login</button></li>';
                navLinks.insertAdjacentHTML('beforeend', loginBtnHtml);
            }
        }
    }

    createProfileElement() {
        return `
            <li class="user-profile">
                <div class="user-avatar">
                    <img src="${this.userProfile.picture}" alt="${this.userProfile.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(this.userProfile.name)}'">
                </div>
                <span class="user-name">${this.userProfile.name.split(' ')[0]}</span>
                <div class="profile-dropdown">
                    <a href="profile.html" class="profile-dropdown-item">
                        <i class="fas fa-user"></i>
                        <span>My Profile</span>
                    </a>
                    <a href="settings.html" class="profile-dropdown-item">
                        <i class="fas fa-cog"></i>
                        <span>Settings</span>
                    </a>
                    <a href="#" class="profile-dropdown-item logout-btn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </a>
                </div>
            </li>
        `;
    }

    handleLogout(e) {
        e.preventDefault();
        localStorage.removeItem('userProfile');
        window.location.href = 'index.html';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.userProfileManager = new UserProfileManager();
});

// Re-initialize on dynamic content changes
document.addEventListener('contentChanged', () => {
    window.userProfileManager.updateUI();
}); 