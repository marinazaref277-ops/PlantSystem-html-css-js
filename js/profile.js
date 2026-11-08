document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuth();
    
    // Load user data
    loadUserData();
    loadUserStats();
    
    // Initialize event listeners
    initEventListeners();
});

// Check authentication
function checkAuth() {
    const user = localStorage.getItem('plantGuardUser');
    if (!user) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Load user data from localStorage
function loadUserData() {
    const user = JSON.parse(localStorage.getItem('plantGuardUser'));
    const users = JSON.parse(localStorage.getItem('plantGuardUsers')) || [];
    
    if (user) {
        // Find full user data
        const userData = users.find(u => u.email === user.email) || user;
        
        // Display user info
        document.getElementById('userName').textContent = userData.name || 'User';
        document.getElementById('profileName').textContent = userData.name || 'User';
        document.getElementById('profileEmail').textContent = userData.email || '';
        
        // Fill form fields
        document.getElementById('fullName').value = userData.name || '';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('phone').value = userData.phone || '';
        document.getElementById('location').value = userData.location || '';
        document.getElementById('bio').value = userData.bio || '';
        
        // Load profile picture
        if (userData.profilePic) {
            document.getElementById('profilePic').src = userData.profilePic;
        }
        
        // Load preferences
        if (userData.notifyResults) {
            document.getElementById('notifyResults').checked = userData.notifyResults;
        }
        if (userData.notifyTips) {
            document.getElementById('notifyTips').checked = userData.notifyTips;
        }
        if (userData.notifyNewsletter) {
            document.getElementById('notifyNewsletter').checked = userData.notifyNewsletter;
        }
        if (userData.language) {
            document.getElementById('language').value = userData.language;
        }
    }
}

// Load user statistics
function loadUserStats() {
    const history = JSON.parse(localStorage.getItem('detectionHistory')) || [];
    document.getElementById('totalScans').textContent = history.length;
    
    // Member since (from user data)
    const user = JSON.parse(localStorage.getItem('plantGuardUser'));
    if (user && user.createdAt) {
        const date = new Date(user.createdAt);
        document.getElementById('memberSince').textContent = date.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
        });
    } else {
        document.getElementById('memberSince').textContent = '2024';
    }
}

// Initialize all event listeners
function initEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Profile picture change
    document.getElementById('changePicBtn').addEventListener('click', function() {
        document.getElementById('profilePicInput').click();
    });
    
    document.getElementById('profilePicInput').addEventListener('change', handleProfilePicChange);
    
    // Save personal info
    document.getElementById('personalInfoForm').addEventListener('submit', handleSavePersonalInfo);
    
    // Change password
    document.getElementById('securityForm').addEventListener('submit', handleChangePassword);
    
    // Save preferences
    document.getElementById('preferencesForm').addEventListener('submit', handleSavePreferences);
    
    // Theme selection
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', handleThemeSelect);
    });
    
    // Delete account
    document.getElementById('deleteAccountBtn').addEventListener('click', handleDeleteAccount);
}

// Handle profile picture change
function handleProfilePicChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
        showToast('Image too large. Max 2MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('profilePic').src = e.target.result;
        
        // Save to user data
        saveProfilePic(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Save profile picture
function saveProfilePic(imageData) {
    const user = JSON.parse(localStorage.getItem('plantGuardUser'));
    const users = JSON.parse(localStorage.getItem('plantGuardUsers')) || [];
    
    const userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
        users[userIndex].profilePic = imageData;
        localStorage.setItem('plantGuardUsers', JSON.stringify(users));
        
        // Update current user
        user.profilePic = imageData;
        localStorage.setItem('plantGuardUser', JSON.stringify(user));
        
        showToast('Profile picture updated!', 'success');
    }
}

// Handle save personal info
function handleSavePersonalInfo(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('plantGuardUser'));
    const users = JSON.parse(localStorage.getItem('plantGuardUsers')) || [];
    
    const userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
        // Update user data
        users[userIndex] = {
            ...users[userIndex],
            name: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            bio: document.getElementById('bio').value
        };
        
        localStorage.setItem('plantGuardUsers', JSON.stringify(users));
        
        // Update current user
        user.name = document.getElementById('fullName').value;
        localStorage.setItem('plantGuardUser', JSON.stringify(user));
        
        // Update display
        document.getElementById('userName').textContent = user.name;
        document.getElementById('profileName').textContent = user.name;
        
        showToast('Profile updated successfully!', 'success');
    }
}

// Handle change password
function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('plantGuardUser'));
    const users = JSON.parse(localStorage.getItem('plantGuardUsers')) || [];
    
    const userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
        // Verify current password
        if (users[userIndex].password !== currentPassword) {
            showToast('Current password is incorrect', 'error');
            return;
        }
        
        // Update password
        users[userIndex].password = newPassword;
        localStorage.setItem('plantGuardUsers', JSON.stringify(users));
        
        // Clear form
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        showToast('Password changed successfully!', 'success');
    }
}

// Handle save preferences
function handleSavePreferences(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('plantGuardUser'));
    const users = JSON.parse(localStorage.getItem('plantGuardUsers')) || [];
    
    const userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
        users[userIndex] = {
            ...users[userIndex],
            notifyResults: document.getElementById('notifyResults').checked,
            notifyTips: document.getElementById('notifyTips').checked,
            notifyNewsletter: document.getElementById('notifyNewsletter').checked,
            language: document.getElementById('language').value
        };
        
        localStorage.setItem('plantGuardUsers', JSON.stringify(users));
        showToast('Preferences saved!', 'success');
    }
}

// Handle theme selection
function handleThemeSelect(e) {
    const option = e.currentTarget;
    const theme = option.dataset.theme;
    
    // Remove active class from all options
    document.querySelectorAll('.theme-option').forEach(opt => {
        opt.classList.remove('active');
    });
    
    // Add active class to selected
    option.classList.add('active');
    
    // Apply theme (you can implement dark mode here)
    console.log('Theme selected:', theme);
    showToast('Theme preference saved', 'success');
}

// Handle delete account
function handleDeleteAccount() {
    if (confirm('⚠️ Are you sure you want to delete your account? This action cannot be undone!')) {
        const user = JSON.parse(localStorage.getItem('plantGuardUser'));
        const users = JSON.parse(localStorage.getItem('plantGuardUsers')) || [];
        
        // Remove user from users list
        const updatedUsers = users.filter(u => u.email !== user.email);
        localStorage.setItem('plantGuardUsers', JSON.stringify(updatedUsers));
        
        // Clear user session
        localStorage.removeItem('plantGuardUser');
        
        // Clear history
        localStorage.removeItem('detectionHistory');
        
        showToast('Account deleted successfully', 'success');
        
        // Redirect to home
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('plantGuardUser');
    window.location.href = 'index.html';
}

// Toast function
function showToast(message, type = 'success') {
    // Check if toast container exists
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toastId = 'toast-' + Date.now();
    const bgColor = type === 'success' ? 'bg-success' : 
                   type === 'error' ? 'bg-danger' : 'bg-warning';
    const icon = type === 'success' ? 'check-circle' : 
                type === 'error' ? 'exclamation-circle' : 'exclamation-triangle';
    
    toastContainer.insertAdjacentHTML('beforeend', `
        <div id="${toastId}" class="toast align-items-center text-white ${bgColor} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${icon} me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
}