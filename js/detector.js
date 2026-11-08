// detector.js - PURE JAVASCRIPT, NO JQUERY
document.addEventListener("DOMContentLoaded", function() {
    // Check if user is logged in
    var user = localStorage.getItem('plantGuardUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Display username
    try {
        var userData = JSON.parse(user);
        var userNameEl = document.getElementById("userName");
        if (userNameEl) userNameEl.textContent = userData.name || 'User';
    } catch (e) {
        console.log('Error parsing user data');
    }

    // Get DOM elements
    var fileInput = document.getElementById("fileInput");
    var browseBtn = document.getElementById("browseBtn");
    var cameraBtn = document.getElementById("cameraBtn");
    var captureBtn = document.getElementById("captureBtn");
    var closeCameraBtn = document.getElementById("closeCameraBtn");
    var video = document.getElementById("video");
    var cameraContainer = document.getElementById("cameraContainer");
    var previewContainer = document.getElementById("previewContainer");
    var previewImage = document.getElementById("previewImage");
    var uploadContent = document.getElementById("uploadContent");
    var removeBtn = document.getElementById("removeBtn");
    var analyzeBtn = document.getElementById("analyzeBtn");
    var emptyState = document.getElementById("emptyState");
    var resultsContent = document.getElementById("resultsContent");
    var saveResultBtn = document.getElementById("saveResultBtn");
    var logoutBtn = document.getElementById("logoutBtn");
    var uploadArea = document.getElementById("uploadArea");

    var stream = null;
    var currentImage = null;
    var currentResult = null;

    /* ===============================
       BROWSE FILE
    =================================*/
    if (browseBtn) {
        browseBtn.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            fileInput.click();
        });
    }

    if (fileInput) {
        fileInput.addEventListener("change", function(e) {
            var file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith("image/")) {
                alert("Please select an image file.");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert("File too large. Maximum size is 5MB.");
                return;
            }

            var reader = new FileReader();
            reader.onload = function(event) {
                previewImage.src = event.target.result;
                showPreview();
            };
            reader.readAsDataURL(file);

            currentImage = file;
        });
    }

    /* ===============================
       OPEN LAPTOP CAMERA
    =================================*/
    if (cameraBtn) {
        cameraBtn.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();

            try {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(function(s) {
                        stream = s;
                        video.srcObject = stream;
                        uploadContent.style.display = "none";
                        cameraContainer.style.display = "block";
                    })
                    .catch(function(error) {
                        alert("Camera not available or permission denied.");
                    });
            } catch (error) {
                alert("Camera not available or permission denied.");
            }
        });
    }

    /* ===============================
       CAPTURE PHOTO
    =================================*/
    if (captureBtn) {
        captureBtn.addEventListener("click", function() {
            if (!video.videoWidth) return;

            var canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            var ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0);

            canvas.toBlob(function(blob) {
                var file = new File([blob], "camera-capture.png", { type: "image/png" });
                currentImage = file;

                previewImage.src = URL.createObjectURL(blob);
                showPreview();
            });

            stopCamera();
        });
    }

    /* ===============================
       CLOSE CAMERA
    =================================*/
    if (closeCameraBtn) {
        closeCameraBtn.addEventListener("click", function() {
            stopCamera();
            uploadContent.style.display = "block";
        });
    }

    /* ===============================
       UPLOAD AREA CLICK
    =================================*/
    if (uploadArea) {
        uploadArea.addEventListener("click", function(e) {
            // Don't trigger if clicking on buttons
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            fileInput.click();
        });
    }

    /* ===============================
       DRAG AND DROP
    =================================*/
    if (uploadArea) {
        uploadArea.addEventListener("dragover", function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });

        uploadArea.addEventListener("dragleave", function() {
            this.classList.remove('dragover');
        });

        uploadArea.addEventListener("drop", function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            var file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                if (file.size > 5 * 1024 * 1024) {
                    alert("File too large. Maximum size is 5MB.");
                    return;
                }
                
                var reader = new FileReader();
                reader.onload = function(event) {
                    previewImage.src = event.target.result;
                    showPreview();
                };
                reader.readAsDataURL(file);
                currentImage = file;
            } else {
                alert('Please drop an image file');
            }
        });
    }

    /* ===============================
       SHOW PREVIEW
    =================================*/
    function showPreview() {
        cameraContainer.style.display = "none";
        uploadContent.style.display = "none";
        previewContainer.style.display = "block";
        if (analyzeBtn) analyzeBtn.disabled = false;
    }

    /* ===============================
       REMOVE IMAGE
    =================================*/
    if (removeBtn) {
        removeBtn.addEventListener("click", function() {
            previewContainer.style.display = "none";
            uploadContent.style.display = "block";
            if (analyzeBtn) analyzeBtn.disabled = true;
            currentImage = null;
            
            // Hide results if showing
            if (resultsContent) resultsContent.style.display = "none";
            if (emptyState) emptyState.style.display = "block";
            
            // Clear file inputs
            if (fileInput) fileInput.value = '';
        });
    }

    /* ===============================
       STOP CAMERA
    =================================*/
    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(function(track) {
                track.stop();
            });
            stream = null;
        }
        cameraContainer.style.display = "none";
    }

    /* ===============================
       ANALYZE BUTTON
    =================================*/
    if (analyzeBtn) {
        analyzeBtn.addEventListener("click", function() {
            if (!currentImage) return;

            // Show loading
            if (emptyState) emptyState.style.display = "none";
            if (resultsContent) resultsContent.style.display = "none";
            
            // Create loading spinner
            var resultBox = document.getElementById("resultBox");
            if (resultBox) {
                resultBox.innerHTML = `
                    <div class="text-center py-5">
                        <div class="spinner-border text-success mb-3" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <h5>Analyzing Image...</h5>
                        <p class="text-secondary small">Our AI is processing your image</p>
                    </div>
                `;
            }

            // Simulate AI analysis (2 seconds)
            setTimeout(function() {
                showRandomResult();
            }, 2000);
        });
    }

    /* ===============================
       SHOW RANDOM RESULT (DEMO)
    =================================*/
    function showRandomResult() {
        var diseases = [
            {
                name: 'Tomato Late Blight',
                confidence: 92,
                description: 'Late blight is a destructive disease that appears as pale green or water-soaked spots on leaves that rapidly enlarge and turn brown.',
                treatment: [
                    'Apply copper-based fungicide immediately',
                    'Remove and destroy infected leaves',
                    'Improve air circulation around plants',
                    'Avoid overhead watering'
                ],
                prevention: [
                    'Plant resistant varieties',
                    'Space plants properly for air flow',
                    'Rotate crops each season',
                    'Water at base of plants'
                ]
            },
            {
                name: 'Apple Cedar Rust',
                confidence: 88,
                description: 'Cedar-apple rust appears as bright orange-yellow spots on leaves. It requires both apple and cedar trees to complete its life cycle.',
                treatment: [
                    'Apply sulfur-based fungicide',
                    'Remove galls from nearby cedar trees',
                    'Prune affected branches',
                    'Clean up fallen leaves'
                ],
                prevention: [
                    'Plant resistant apple varieties',
                    'Remove nearby cedar trees if possible',
                    'Apply preventative fungicides in spring',
                    'Maintain good air circulation'
                ]
            },
            {
                name: 'Healthy Leaf',
                confidence: 97,
                description: 'Your plant appears healthy! No signs of disease detected. Continue with regular maintenance and monitoring.',
                treatment: [
                    'Continue regular watering schedule',
                    'Maintain proper fertilization',
                    'Monitor for any changes weekly'
                ],
                prevention: [
                    'Regular inspection of plants',
                    'Proper spacing for air flow',
                    'Clean gardening tools',
                    'Remove dead leaves promptly'
                ]
            }
        ];

        var random = diseases[Math.floor(Math.random() * diseases.length)];
        
        // Restore result box with proper structure
        var resultBox = document.getElementById("resultBox");
        if (resultBox) {
            resultBox.innerHTML = `
                <div id="emptyState" style="display: none;"></div>
                <div id="resultsContent">
                    <div class="text-center mb-4">
                        <span class="badge bg-success bg-opacity-10 text-success p-3" id="resultTag">${random.name === 'Healthy Leaf' ? '✓ Healthy Plant' : '⚕️ Disease Detected'}</span>
                        <h3 class="mt-3" id="diseaseName">${random.name}</h3>
                    </div>
                    <div class="mb-4">
                        <div class="d-flex justify-content-between mb-2">
                            <strong>Confidence Score</strong>
                            <strong class="text-success" id="confidenceScore">${random.confidence}%</strong>
                        </div>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar bg-success" id="confidenceBar" style="width: ${random.confidence}%"></div>
                        </div>
                    </div>
                    <ul class="nav nav-tabs nav-fill mb-4" id="myTab" role="tablist">
                        <li class="nav-item">
                            <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#desc">Description</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#treatment">Treatment</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#prev">Prevention</button>
                        </li>
                    </ul>
                    <div class="tab-content">
                        <div class="tab-pane fade show active" id="desc">
                            <p id="descText" class="small">${random.description}</p>
                        </div>
                        <div class="tab-pane fade" id="treatment">
                            <ul id="treatmentList" class="list-unstyled"></ul>
                        </div>
                        <div class="tab-pane fade" id="prev">
                            <ul id="preventionList" class="list-unstyled"></ul>
                        </div>
                    </div>
                    <button class="btn btn-outline-success w-100 mt-4" id="saveResultBtn">
                        <i class="fas fa-bookmark me-2"></i>Save to History
                    </button>
                </div>
            `;
            
            // Re-attach event listeners
            var newSaveBtn = document.getElementById("saveResultBtn");
            if (newSaveBtn) {
                newSaveBtn.addEventListener("click", function() {
                    if (!currentResult) {
                        alert('No result to save');
                        return;
                    }
                    
                    var history = [];
                    try {
                        history = JSON.parse(localStorage.getItem('detectionHistory')) || [];
                    } catch (e) {
                        history = [];
                    }
                    
                    history.push(currentResult);
                    localStorage.setItem('detectionHistory', JSON.stringify(history));
                    
                    alert('✅ Result saved to history!');
                });
            }
            
            // Initialize Bootstrap tabs
            var triggerTabList = [].slice.call(document.querySelectorAll('#myTab button'));
            triggerTabList.forEach(function(triggerEl) {
                triggerEl.addEventListener('click', function(event) {
                    event.preventDefault();
                    
                    // Remove active class from all tabs
                    var allTabs = document.querySelectorAll('#myTab button');
                    allTabs.forEach(function(tab) {
                        tab.classList.remove('active');
                    });
                    
                    // Add active class to clicked tab
                    this.classList.add('active');
                    
                    // Hide all tab panes
                    var allPanes = document.querySelectorAll('.tab-pane');
                    allPanes.forEach(function(pane) {
                        pane.classList.remove('show', 'active');
                    });
                    
                    // Show selected tab pane
                    var target = this.getAttribute('data-bs-target');
                    var targetPane = document.querySelector(target);
                    if (targetPane) {
                        targetPane.classList.add('show', 'active');
                    }
                });
            });
        }

        // Populate lists
        var treatmentList = document.getElementById("treatmentList");
        if (treatmentList) {
            treatmentList.innerHTML = '';
            for (var i = 0; i < random.treatment.length; i++) {
                var li = document.createElement('li');
                li.innerHTML = '<i class="fas fa-check-circle text-success me-2"></i>' + random.treatment[i];
                treatmentList.appendChild(li);
            }
        }

        var preventionList = document.getElementById("preventionList");
        if (preventionList) {
            preventionList.innerHTML = '';
            for (var i = 0; i < random.prevention.length; i++) {
                var li = document.createElement('li');
                li.innerHTML = '<i class="fas fa-check-circle text-success me-2"></i>' + random.prevention[i];
                preventionList.appendChild(li);
            }
        }

        // Store result for saving
        currentResult = {
            name: random.name,
            confidence: random.confidence + '%',
            description: random.description,
            treatment: random.treatment,
            prevention: random.prevention,
            image: previewImage ? previewImage.src : '',
            date: new Date().toISOString()
        };
    }

    /* ===============================
       LOGOUT
    =================================*/
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(e) {
            e.preventDefault();
            localStorage.removeItem('plantGuardUser');
            window.location.href = 'index.html';
        });
    }
});