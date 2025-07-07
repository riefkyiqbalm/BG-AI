// Three.js Variables
let scene, camera, renderer, model;

// Initialize everything when page loads
window.onload = function() {
    initThreeJS();
    animate();
    setupModal();
    setupEventListeners();
    setupDarkMode();
    setupForm();
    setupBackToTop(); // Added this line to initialize the back to top button
};

// Three.js Initialization
function initThreeJS() {
    const container = document.getElementById('three-canvas');
    if (!container) {
        console.error("Three.js container not found!");
        return;
    }

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe1e7d8);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    // Create renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Load model
    try {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x047857,
            metalness: 0.5,
            roughness: 0.1
        });
        model = new THREE.Mesh(geometry, material);
        scene.add(model);
    } catch (error) {
        console.error('Error loading model:', error);
        loadFallbackModel();
    }

    window.addEventListener('resize', onWindowResize);
}

function loadFallbackModel() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x20B2AA });
    model = new THREE.Mesh(geometry, material);
    scene.add(model);
}

function animate() {
    requestAnimationFrame(animate);
    if (model) {
        model.rotation.x += 0.005;
        model.rotation.y += 0.005;
    }
    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('three-canvas');
    if (container && camera && renderer) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
}

// Modal Management
function setupModal() {
    const modal = document.getElementById("consultationModal");
    const btn = document.getElementById("consultationBtn");
    const span = document.getElementsByClassName("close-modal")[0];

    if (!modal || !btn) return;

    btn.addEventListener('click', function() {
        modal.style.display = "block";
        document.body.style.overflow = "hidden";
    });

    if (span) {
        span.addEventListener('click', function() {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && modal.style.display === "block") {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    });
}

// Event Listeners for Model Interaction
function setupEventListeners() {
    const container = document.getElementById('three-canvas');
    if (!container) return;

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    container.addEventListener('mousedown', (event) => {
        isDragging = true;
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    });

    container.addEventListener('mousemove', (event) => {
        if (!isDragging || !model) return;

        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        model.rotation.y += deltaX * 0.01;
        model.rotation.x += deltaY * 0.01;

        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    });

    container.addEventListener('mouseup', () => {
        isDragging = false;
    });

    container.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    // Touch events for mobile
    container.addEventListener('touchstart', (event) => {
        isDragging = true;
        const touch = event.touches[0];
        previousMousePosition = {
            x: touch.clientX,
            y: touch.clientY
        };
        event.preventDefault();
    }, { passive: false });

    container.addEventListener('touchmove', (event) => {
        if (!isDragging || !model) return;
        const touch = event.touches[0];
        const deltaX = touch.clientX - previousMousePosition.x;
        const deltaY = touch.clientY - previousMousePosition.y;

        model.rotation.y += deltaX * 0.01;
        model.rotation.x += deltaY * 0.01;

        previousMousePosition = {
            x: touch.clientX,
            y: touch.clientY
        };
        event.preventDefault();
    }, { passive: false });

    container.addEventListener('touchend', () => {
        isDragging = false;
    });
}

// Dark Mode Toggle
function setupDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');

    // Check for saved user preference or system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedMode = localStorage.getItem('darkMode');

    // Set initial mode
    if (savedMode === 'dark' || (!savedMode && prefersDark)) {
        document.documentElement.classList.add('dark');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }

    // Toggle dark mode
    darkModeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        sunIcon.classList.toggle('hidden');
        moonIcon.classList.toggle('hidden');

        // Save preference
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', isDark ? 'dark' : 'light');
    });
}

// // Form Submission Handling
// function setupForm() {
//     const contactForm = document.getElementById('contactForm');
//     if (!contactForm) return;

//     contactForm.addEventListener('submit', function(event) {
//         event.preventDefault();

//         const submitBtn = contactForm.querySelector('button[type="submit"]');
//         const originalText = submitBtn.textContent;
//         submitBtn.textContent = 'Sending...';
//         submitBtn.disabled = true;

//         // Simulate form submission (replace with actual form handling)
//         setTimeout(() => {
//             alert('Form submitted successfully!');
//             contactForm.reset();
//             submitBtn.textContent = originalText;
//             submitBtn.disabled = false;
//         }, 1500);
//     });
// }

// // Form Submission Handling
// function setupForm2() {
//     const contactForm = document.getElementById('modalForm');
//     if (!contactForm) return;

//     contactForm.addEventListener('submit', function(event) {
//         event.preventDefault();

//         const submitBtn = contactForm.querySelector('button[type="submit"]');
//         const originalText = submitBtn.textContent;
//         submitBtn.textContent = 'Sending...';
//         submitBtn.disabled = true;

//         // Simulate form submission (replace with actual form handling)
//         setTimeout(() => {
//             alert('Form submitted successfully!');
//             contactForm.reset();
//             submitBtn.textContent = originalText;
//             submitBtn.disabled = false;
//         }, 1500);
//     });
// }

// Back to Top Button
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');

    if (!backToTopBtn) {
        console.error("Back to Top button not found!");
        return;
    }

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) { // Show button after scrolling 300px
            backToTopBtn.classList.remove('opacity-0', 'invisible');
            backToTopBtn.classList.add('opacity-100', 'visible');
        } else {
            backToTopBtn.classList.add('opacity-0', 'invisible');
            backToTopBtn.classList.remove('opacity-100', 'visible');
        }
    });

    // Smooth scroll to top when clicked
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Initialize visibility on page load in case the user reloads while scrolled down
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.remove('opacity-0', 'invisible');
        backToTopBtn.classList.add('opacity-100', 'visible');
    }
}