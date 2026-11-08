// Authentication State
let currentUser = null;

// Check if user is logged in (from localStorage)
function checkAuth() {
    const user = localStorage.getItem('plantGuardUser');
    if (user) {
        currentUser = JSON.parse(user);
        updateUIForLoggedInUser();
        return true;
    }
    return false;
}

// Update UI based on login state
function updateUIForLoggedInUser() {
    if (currentUser) {
        // Update user name in navbar
        const userNameSpan = document.getElementById('userName');
        if (userNameSpan) {
            userNameSpan.textContent = currentUser.name;
        }
        
        // Hide login/signup modals if open
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (loginModal) loginModal.hide();
    }
}

// Login function
function login(email, password) {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('plantGuardUsers')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = { name: user.name, email: user.email };
        localStorage.setItem('plantGuardUser', JSON.stringify(currentUser));
        updateUIForLoggedInUser();
        
        // Show success message
        showToast('Login successful!', 'success');
        
        // Redirect to detector if on landing page
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            window.location.href = 'detector.html';
        }
        
        return true;
    } else {
        showToast('Invalid email or password', 'error');
        return false;
    }
}

// Sign up function
function signup(name, email, password) {
    const users = JSON.parse(localStorage.getItem('plantGuardUsers')) || [];
    
    // Check if user already exists
    if (users.some(u => u.email === email)) {
        showToast('Email already registered', 'error');
        return false;
    }
    
    // Add new user
    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('plantGuardUsers', JSON.stringify(users));
    
    // Auto login
    currentUser = { name, email };
    localStorage.setItem('plantGuardUser', JSON.stringify(currentUser));
    updateUIForLoggedInUser();
    
    showToast('Account created successfully!', 'success');
    window.location.href = 'detector.html';
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('plantGuardUser');
    currentUser = null;
    
    // Show toast
    showToast('Logged out successfully', 'success');
    
    // Redirect to home page
    if (!window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html';
    } else {
        // Update UI for guest
        const userNameSpan = document.getElementById('userName');
        if (userNameSpan) {
            userNameSpan.textContent = 'Guest';
        }
    }
}

// Show toast message
function showToast(message, type = 'success') {
    // Create toast container if not exists
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    // Remove toast after hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Protect page - redirect to home if not logged in
function protectPage() {
    const protectedPages = ['detector.html', 'history.html', 'dashboard.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !checkAuth()) {
        // Show auth modal or redirect
        if (document.getElementById('authRequiredModal')) {
            const authModal = new bootstrap.Modal(document.getElementById('authRequiredModal'));
            authModal.show();
        } else {
            window.location.href = 'index.html#login';
        }
        return false;
    }
    return true;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth();
    protectPage();
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            login(email, password);
        });
    }
    
    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = this.querySelector('input[placeholder*="name"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[placeholder*="Create password"]').value;
            const confirmPassword = this.querySelector('input[placeholder*="Confirm"]').value;
            
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            if (!document.getElementById('termsCheck').checked) {
                showToast('Please accept the terms', 'error');
                return;
            }
            
            signup(name, email, password);
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});