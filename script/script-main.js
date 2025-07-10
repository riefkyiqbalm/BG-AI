let scene, camera, renderer, model;
window.onload = function() {
    initThreeJS();
    animate();
    setupModal();
    setupEventListeners();
    setupForm()
};

function initThreeJS() {
    const container = document.getElementById('three-canvas');
    if (!container) {
        console.error("Three.js container not found!");
        return
    }
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe1e7d8);
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    renderer = new THREE.WebGLRenderer({
        antialias: !0,
        alpha: !0
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    try {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x047857,
            metalness: 0.5,
            roughness: 0.1
        });
        model = new THREE.Mesh(geometry, material);
        scene.add(model)
    } catch (error) {
        console.error('Error loading model:', error);
        loadFallbackModel()
    }
    window.addEventListener('resize', onWindowResize)
}

function loadFallbackModel() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
        color: 0x20B2AA
    });
    model = new THREE.Mesh(geometry, material);
    scene.add(model)
}

function animate() {
    requestAnimationFrame(animate);
    if (model) {
        model.rotation.x += 0.005;
        model.rotation.y += 0.005
    }
    renderer.render(scene, camera)
}

function onWindowResize() {
    const container = document.getElementById('three-canvas');
    if (container && camera && renderer) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight)
    }
}

function setupModal() {
    const modal = document.getElementById("consultationModal");
    const btn = document.getElementById("consultationBtn");
    const span = document.getElementsByClassName("close-modal")[0];
    if (!modal || !btn) return;
    btn.addEventListener('click', function() {
        modal.style.display = "block";
        document.body.style.overflow = "hidden"
    });
    if (span) {
        span.addEventListener('click', function() {
            modal.style.display = "none";
            document.body.style.overflow = "auto"
        })
    }
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
            document.body.style.overflow = "auto"
        }
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && modal.style.display === "block") {
            modal.style.display = "none";
            document.body.style.overflow = "auto"
        }
    })
}

function setupEventListeners() {
    const container = document.getElementById('three-canvas');
    if (!container) return;
    let isDragging = !1;
    let previousMousePosition = {
        x: 0,
        y: 0
    };
    container.addEventListener('mousedown', (event) => {
        isDragging = !0;
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        }
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
        }
    });
    container.addEventListener('mouseup', () => {
        isDragging = !1
    });
    container.addEventListener('mouseleave', () => {
        isDragging = !1
    });
    container.addEventListener('touchstart', (event) => {
        isDragging = !0;
        const touch = event.touches[0];
        previousMousePosition = {
            x: touch.clientX,
            y: touch.clientY
        };
        event.preventDefault()
    }, {
        passive: !1
    });
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
        event.preventDefault()
    }, {
        passive: !1
    });
    container.addEventListener('touchend', () => {
        isDragging = !1
    })
}

function applySystemTheme() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}
applySystemTheme();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySystemTheme);

function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) {
        console.error("Back to Top button not found!");
        return
    }
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.remove('opacity-0', 'invisible');
            backToTopBtn.classList.add('opacity-100', 'visible')
        } else {
            backToTopBtn.classList.add('opacity-0', 'invisible');
            backToTopBtn.classList.remove('opacity-100', 'visible')
        }
    });
     backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Robust scroll to top for all browsers
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, Opera
        document.body.scrollTop = 0;            // For Safari
        // Fallback for smooth scroll
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Remove focus to hide outline
        backToTopBtn.blur();
    });
    backToTopBtn.addEventListener('keydown', function(e) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        }
    });
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.remove('opacity-0', 'invisible');
        backToTopBtn.classList.add('opacity-100', 'visible')
    }
}
document.addEventListener('DOMContentLoaded', function() {
    var modalForm = document.getElementById('modalForm');
    if (modalForm) modalForm.action = 'https://formspree.io/f/xvgrneno';
    var contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.action = 'https://formspree.io/f/xeokwljn';
    setupBackToTop();

    // Permission banner logic
    const permissionBanner = document.getElementById('permissionBanner');
    const acceptPermissionBanner = document.getElementById('acceptPermissionBanner');
    if (permissionBanner && acceptPermissionBanner) {
        if (!localStorage.getItem('permissionAccepted')) {
            permissionBanner.style.display = 'flex';
        }
        acceptPermissionBanner.addEventListener('click', function() {
            localStorage.setItem('permissionAccepted', 'true');
            permissionBanner.style.display = 'none';
        });
    }
});