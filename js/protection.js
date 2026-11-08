// js/protection.js
const PlantGuardAuth = {
    currentUser: null,
    protectedPages: ['detector.html', 'history.html', 'dashboard.html', 'profile.html'],


    init: function() {
        this.checkUser();
        this.protectCurrentPage();
        this.updateUI();
        this.setupEventListeners();
    },
    
    checkUser: function() {
        const userData = localStorage.getItem('plantGuardUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            return true;
        }
        return false;
    },
    
    getCurrentPage: function() {
        return window.location.pathname.split('/').pop() || 'index.html';
    },
    
    protectCurrentPage: function() {
        const currentPage = this.getCurrentPage();
        const isLoggedIn = this.checkUser();
        
        if (this.protectedPages.includes(currentPage) && !isLoggedIn) {
            localStorage.setItem('redirectAfterLogin', currentPage);
            window.location.href = 'index.html?auth=required';
            return false;
        }
        return true;
    },
    
    updateUI: function() {
        const isLoggedIn = this.checkUser();
        const userNameDisplay = document.getElementById('userNameDisplay');
        const userDropdownMenu = document.getElementById('userDropdownMenu');
        
        if (!userNameDisplay || !userDropdownMenu) return;
        
        if (isLoggedIn && this.currentUser) {
            userNameDisplay.textContent = this.currentUser.name || 'User';
            userDropdownMenu.innerHTML = `
                <li><a class="dropdown-item" href="dashboard.html"><i class="fas fa-tachometer-alt me-2"></i>Dashboard</a></li>
                <li><a class="dropdown-item" href="history.html"><i class="fas fa-history me-2"></i>My History</a></li>
                <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user-cog me-2"></i>Profile</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="#" id="logoutBtn"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
            `;
            document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        } else {
            userNameDisplay.textContent = 'Guest';
            userDropdownMenu.innerHTML = `
                <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#loginModal"><i class="fas fa-sign-in-alt me-2"></i>Login</a></li>
                <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#signupModal"><i class="fas fa-user-plus me-2"></i>Sign Up</a></li>
            `;
        }
    },
    
    logout: function() {
        localStorage.removeItem('plantGuardUser');
        this.currentUser = null;
        window.location.href = 'index.html';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    PlantGuardAuth.init();
});

window.PlantGuardAuth = PlantGuardAuth;