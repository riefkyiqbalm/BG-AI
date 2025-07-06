// Three.js Variables
let scene, camera, renderer, model;

// Initialize everything when page loads
window.onload = function() {
    initThreeJS();
    animate();
    setupModal();
    setupEventListeners();
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
        // const geometry = new THREE.BoxGeometry(1, 1, 1);
        // const material = new THREE.MeshStandardMaterial({ 
        //     color: 0x047857,
        //     metalness: 0.5,
        //     roughness: 0.1
        // });
        // model = new THREE.Mesh(geometry, material);
        // scene.add(model);
        
        // For actual model, use:
        const loader = new THREE.GLTFLoader();
        loader.load('assets/models/ferrari.glb', function(gltf) {
            model = gltf.scene;
            scene.add(model);
        });
        
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
