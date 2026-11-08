// Initialize AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Check login state on page load
document.addEventListener('DOMContentLoaded', function() {
    checkLoginState();
    setupEventListeners();
});

// Check if user is logged in
function checkLoginState() {
    const userData = localStorage.getItem('plantGuardUser');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    
    if (userData && userNameDisplay && userDropdownMenu) {
        const user = JSON.parse(userData);
        userNameDisplay.textContent = user.name || 'User';
        
        // Update dropdown for logged in user
        userDropdownMenu.innerHTML = `
            <li><a class="dropdown-item" href="dashboard.html">Dashboard</a></li>
            <li><a class="dropdown-item" href="history.html">My History</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">Logout</a></li>
        `;
        
        // Add logout handler
        document.getElementById('logoutBtn')?.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Navbar Detector Link
    document.getElementById('navbarDetectorLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        handleDetectorAccess();
    });
    
    // Hero "Try It Now" Button
    document.getElementById('heroTryNowBtn')?.addEventListener('click', function() {
        handleDetectorAccess();
    });
    
    // CTA "Go to Disease Detector" Button
    document.getElementById('ctaDetectorBtn')?.addEventListener('click', function() {
        handleDetectorAccess();
    });
    
    // Login Form
    document.getElementById('loginForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // Signup Form
    document.getElementById('signupForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleSignup();
    });
}

// Handle detector access (checks if logged in)
function handleDetectorAccess() {
    const userData = localStorage.getItem('plantGuardUser');
    
    if (userData) {
        // Already logged in - go to detector
        window.location.href = 'detector.html';
    } else {
        // Not logged in - show login modal
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
        showToast('Please login to access the detector', 'info');
    }
}

// Handle login
function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('plantGuardUsers')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Save logged in user
        localStorage.setItem('plantGuardUser', JSON.stringify({
            name: user.name,
            email: user.email
        }));
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
        
        // Show success
        showToast('Login successful! Redirecting...', 'success');
        
        // Redirect to detector
        setTimeout(() => {
            window.location.href = 'detector.html';
        }, 1500);
    } else {
        showToast('Invalid email or password', 'error');
    }
}

// Handle signup
function handleSignup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    // Validate
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (!document.getElementById('termsCheck').checked) {
        showToast('Please accept the terms', 'error');
        return;
    }
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('plantGuardUsers')) || [];
    
    // Check if email exists
    if (users.some(u => u.email === email)) {
        showToast('Email already registered', 'error');
        return;
    }
    
    // Add new user
    users.push({ name, email, password });
    localStorage.setItem('plantGuardUsers', JSON.stringify(users));
    
    // Auto login
    localStorage.setItem('plantGuardUser', JSON.stringify({ name, email }));
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('signupModal')).hide();
    
    // Show success
    showToast('Account created! Redirecting...', 'success');
    
    // Redirect to detector
    setTimeout(() => {
        window.location.href = 'detector.html';
    }, 1500);
}

// Logout function
function logout() {
    localStorage.removeItem('plantGuardUser');
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

// Toast function
function showToast(message, type = 'success') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    const bgColor = type === 'success' ? 'bg-success' : 
                   type === 'info' ? 'bg-info' : 'bg-danger';
    const icon = type === 'success' ? 'check-circle' : 
                type === 'info' ? 'info-circle' : 'exclamation-circle';
    
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