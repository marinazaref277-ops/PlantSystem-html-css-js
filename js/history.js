document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
});

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('detectionHistory')) || [];
    
    updateStatistics(history);
    
    if (history.length === 0) {
        showEmptyState();
        return;
    }
    
    displayHistory(history);
}

function updateStatistics(history) {
    const total = history.length;
    const healthy = history.filter(h => h.diseaseName?.toLowerCase().includes('healthy')).length;
    const diseased = total - healthy;
    const uniquePlants = new Set(history.map(h => h.diseaseName?.split(' ')[0])).size;
    
    document.getElementById('totalDiagnoses').textContent = total;
    document.getElementById('healthyCount').textContent = healthy;
    document.getElementById('diseasedCount').textContent = diseased;
    document.getElementById('uniquePlants').textContent = uniquePlants || 0;
}

function showEmptyState() {
    document.getElementById('historyList').innerHTML = `
        <div class="empty-history">
            <i class="fas fa-history fa-4x text-secondary opacity-50 mb-3"></i>
            <h4>No Detection History Yet</h4>
            <p class="text-secondary mb-4">Start by diagnosing your first plant disease</p>
            <a href="detector.html" class="btn btn-success btn-lg rounded-pill px-5">
                <i class="fas fa-camera me-2"></i>Go to Detector
            </a>
        </div>
    `;
}

function displayHistory(history) {
    const groupedHistory = groupByDate(history);
    let html = '';
    
    for (const [date, items] of Object.entries(groupedHistory)) {
        html += `
            <div class="date-group">
                <h6><i class="fas fa-calendar-alt me-2"></i>${date}</h6>
        `;
        
        items.forEach(item => {
            const isHealthy = item.diseaseName?.toLowerCase().includes('healthy');
            html += `
                <div class="history-item ${isHealthy ? '' : 'diseased'}">
                    <div class="row align-items-center">
                        <div class="col-md-2 col-3">
                            <img src="${item.image || 'images/placeholder.jpg'}" alt="Plant" class="history-thumbnail">
                        </div>
                        <div class="col-md-7 col-6">
                            <h5 class="fw-bold mb-1">${item.diseaseName || 'Unknown'}</h5>
                            <small class="text-secondary">
                                <i class="fas fa-clock me-1"></i>${new Date(item.date).toLocaleString()}
                            </small>
                        </div>
                        <div class="col-md-3 col-3 text-end">
                            <span class="confidence-badge mb-2">${item.confidence || '90%'}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
    }
    
    document.getElementById('historyList').innerHTML = html;
}

function groupByDate(history) {
    const groups = {};
    history.forEach(item => {
        const date = new Date(item.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(item);
    });
    return groups;
}