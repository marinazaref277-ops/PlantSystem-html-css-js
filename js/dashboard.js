document.addEventListener('DOMContentLoaded', function() {
    // Set welcome name
    const user = JSON.parse(localStorage.getItem('plantGuardUser') || '{}');
    if (user.name) {
        document.getElementById('welcomeName').textContent = user.name.split(' ')[0];
    }
    
    loadDashboardData();
});

function loadDashboardData() {
    const history = JSON.parse(localStorage.getItem('detectionHistory')) || [];
    
    // Update stats
    const total = history.length;
    const healthy = history.filter(h => h.diseaseName?.toLowerCase().includes('healthy')).length;
    const diseased = total - healthy;
    const thisMonth = history.filter(h => {
        const date = new Date(h.date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    
    document.getElementById('totalScans').textContent = total;
    document.getElementById('healthyPlants').textContent = healthy;
    document.getElementById('diseasedPlants').textContent = diseased;
    document.getElementById('thisMonth').textContent = thisMonth;
    
    // Load recent activity
    loadRecentActivity(history);
    
    // Initialize charts
    initializeCharts(history, healthy, diseased);
}

function loadRecentActivity(history) {
    const recent = history.slice(-5).reverse();
    const container = document.getElementById('recentActivity');
    
    if (recent.length === 0) {
        container.innerHTML = '<p class="text-secondary text-center py-4">No recent activity</p>';
        return;
    }
    
    let html = '';
    recent.forEach(item => {
        html += `
            <div class="activity-item">
                <div class="d-flex align-items-center">
                    <div class="me-3">
                        <i class="fas fa-${item.diseaseName?.toLowerCase().includes('healthy') ? 'check-circle text-success' : 'exclamation-triangle text-warning'}"></i>
                    </div>
                    <div class="flex-grow-1">
                        <strong>${item.diseaseName || 'Unknown'}</strong>
                        <br>
                        <small class="text-secondary">${new Date(item.date).toLocaleDateString()}</small>
                    </div>
                    <span class="badge bg-success bg-opacity-10 text-success">${item.confidence || '90%'}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function initializeCharts(history, healthy, diseased) {
    // Trend Chart
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    
    const scansPerDay = last7Days.map((_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        return history.filter(h => new Date(h.date).toDateString() === date.toDateString()).length;
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                data: scansPerDay,
                borderColor: '#198754',
                backgroundColor: 'rgba(25, 135, 84, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
    
    // Health Chart
    const ctx2 = document.getElementById('healthChart').getContext('2d');
    new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['Healthy', 'Diseased'],
            datasets: [{
                data: [healthy, diseased],
                backgroundColor: ['#198754', '#ffc107'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            cutout: '70%'
        }
    });
}