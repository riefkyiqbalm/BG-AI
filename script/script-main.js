let scene, camera, renderer, model; // Keep global variables for Three.js elements

// Window load handler
window.onload = () => {
    initThreeJS();
    animate();
    setupEventListeners();
    // Assuming setupForm is a simple function that might also be defined
    // setupForm(); 
};

// Initializes Three.js scene, camera, renderer, and a basic model
function initThreeJS() {
    const container = document.getElementById('three-canvas');
    if (!container) {
        console.error("Three.js container not found!");
        return;
    }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe1e7d8);

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
        scene.add(model);
    } catch (error) {
        console.error('Error loading model:', error);
        loadFallbackModel();
    }

    window.addEventListener('resize', onWindowResize);
}

// Loads a fallback model if the primary model fails
const loadFallbackModel = () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x20B2AA });
    model = new THREE.Mesh(geometry, material);
    scene.add(model);
};

// Animation loop for Three.js model
const animate = () => {
    requestAnimationFrame(animate);
    model && ((model.rotation.x += 0.005), (model.rotation.y += 0.005));
    renderer.render(scene, camera);
};

// Handles window resize for Three.js canvas
const onWindowResize = () => {
    const container = document.getElementById('three-canvas');
    container && camera && renderer && (
        (camera.aspect = container.clientWidth / container.clientHeight),
        camera.updateProjectionMatrix(),
        renderer.setSize(container.clientWidth, container.clientHeight)
    );
};

// // Sets up the consultation modal functionality
// function setupModal() {
//     const modal = document.getElementById("consultationModal");
//     const btn = document.getElementById("consultationBtn");
//     const span = document.getElementsByClassName("close-modal")[0];

//     if (!modal || !btn) return;

//     btn.addEventListener('click', () => {
//         modal.style.display = "block";
//         document.body.style.overflow = "hidden";
//     });

//     span?.addEventListener('click', () => { // Optional chaining for 'span'
//         modal.style.display = "none";
//         document.body.style.overflow = "auto";
//     });

//     window.addEventListener('click', (event) => {
//         event.target === modal && (
//             (modal.style.display = "none"),
//             (document.body.style.overflow = "auto")
//         );
//     });

//     document.addEventListener('keydown', (event) => {
//         event.key === "Escape" && modal.style.display === "block" && (
//             (modal.style.display = "none"),
//             (document.body.style.overflow = "auto")
//         );
//     });
// }

// Sets up event listeners for Three.js model interaction (dragging)
function setupEventListeners() {
    const container = document.getElementById('three-canvas');
    if (!container) return;

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    container.addEventListener('mousedown', (event) => {
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    container.addEventListener('mousemove', (event) => {
        if (!isDragging || !model) return;
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        model.rotation.y += deltaX * 0.01;
        model.rotation.x += deltaY * 0.01;
        previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    container.addEventListener('mouseup', () => (isDragging = false));
    container.addEventListener('mouseleave', () => (isDragging = false));

    container.addEventListener('touchstart', (event) => {
        isDragging = true;
        const touch = event.touches[0];
        previousMousePosition = { x: touch.clientX, y: touch.clientY };
        event.preventDefault();
    }, { passive: false });

    container.addEventListener('touchmove', (event) => {
        if (!isDragging || !model) return;
        const touch = event.touches[0];
        const deltaX = touch.clientX - previousMousePosition.x;
        const deltaY = touch.clientY - previousMousePosition.y;
        model.rotation.y += deltaX * 0.01;
        model.rotation.x += deltaY * 0.01;
        previousMousePosition = { x: touch.clientX, y: touch.clientY };
        event.preventDefault();
    }, { passive: false });

    container.addEventListener('touchend', () => (isDragging = false));
}

// Applies system theme (dark/light mode)
const applySystemTheme = () => {
    window.matchMedia('(prefers-color-scheme: dark)').matches
        ? document.documentElement.classList.add('dark')
        : document.documentElement.classList.remove('dark');
};
applySystemTheme(); // Apply on initial load
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySystemTheme);

// Sets up the back-to-top button functionality
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) {
        console.error("Back to Top button not found!");
        return;
    }

    const toggleButtonVisibility = () => {
        window.pageYOffset > 300
            ? (backToTopBtn.classList.remove('opacity-0', 'invisible'), backToTopBtn.classList.add('opacity-100', 'visible'))
            : (backToTopBtn.classList.add('opacity-0', 'invisible'), backToTopBtn.classList.remove('opacity-100', 'visible'));
    };

    window.addEventListener('scroll', toggleButtonVisibility);

    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Modern way to scroll
        backToTopBtn.blur(); // Remove focus
    });

    backToTopBtn.addEventListener('keydown', (e) => {
        (e.key === "Enter" || e.key === " ") && (
            e.preventDefault(),
            window.scrollTo({ top: 0, behavior: 'smooth' })
        );
    });

    // Initial check for visibility on load
    toggleButtonVisibility();
}

// Placeholder for setupForm function (if it exists elsewhere)
function setupForm() {
    // Your form setup logic here, if any
}

// DOMContentLoaded handler for general setups
document.addEventListener('DOMContentLoaded', () => {
    const pageForm = document.getElementById('pageForm');
    pageForm && (pageForm.action = 'https://6vcmvf08i3.execute-api.ap-southeast-1.amazonaws.com/default/aotamata-formhandler'); // Ternary for assignment

    const contactForm = document.getElementById('contactForm');
    contactForm && (contactForm.action = 'https://formspree.io/f/xeokwljn'); // Ternary for assignment

    setupBackToTop();

    // Permission banner logic
    const permissionBanner = document.getElementById('permissionBanner');
    const acceptPermissionBanner = document.getElementById('acceptPermissionBanner');
    const declinePermissionBanner = document.getElementById('declinePermissionBanner');

    if (permissionBanner && acceptPermissionBanner && declinePermissionBanner) {
        !localStorage.getItem('permissionAccepted') && (permissionBanner.style.display = 'flex');

        acceptPermissionBanner.addEventListener('click', () => {
            localStorage.setItem('permissionAccepted', 'true');
            permissionBanner.style.display = 'none';
        });

        declinePermissionBanner.addEventListener('click', () => {
            localStorage.setItem('permissionAccepted', 'declined');
            permissionBanner.style.display = 'none';
        });
    }
});

// Example usage: showLoadingPage() before a heavy operation or navigation
const showLoadingPage = () => {
    window.location.href = 'loading.html';
};


// --- Permission Banner Logic ---
const permissionBanner = document.getElementById('permissionBanner');
const acceptPermissionBanner = document.getElementById('acceptPermissionBanner');
const declinePermissionBanner = document.getElementById('declinePermissionBanner');
const cacheReminderBanner = document.getElementById('cacheReminderBanner');
const dismissCacheReminder = document.getElementById('dismissCacheReminder');

// Function to hide both banners
const hideAllBanners = () => {
    permissionBanner && (permissionBanner.style.display = 'none');
    cacheReminderBanner && (cacheReminderBanner.style.display = 'none');
};

if (permissionBanner && acceptPermissionBanner && declinePermissionBanner && cacheReminderBanner && dismissCacheReminder) {
    const permissionStatus = localStorage.getItem('permissionAccepted');

    if (!permissionStatus) { // No status, show main banner
        permissionBanner.style.display = 'flex';
    } else if (permissionStatus === 'declined') { // Declined previously, show small reminder
        cacheReminderBanner.style.display = 'flex';
    }

    acceptPermissionBanner.addEventListener('click', () => {
        localStorage.setItem('permissionAccepted', 'true');
        hideAllBanners();
    });

    declinePermissionBanner.addEventListener('click', () => {
        localStorage.setItem('permissionAccepted', 'declined');
        hideAllBanners();
        cacheReminderBanner.style.display = 'flex'; // Show small reminder
    });

    dismissCacheReminder.addEventListener('click', () => {
        // User dismissed the reminder, so we won't show it again unless they clear local storage
        localStorage.setItem('cacheReminderDismissed', 'true');
        cacheReminderBanner.style.display = 'none';
    });

    // If reminder was dismissed previously, don't show it again
    if (localStorage.getItem('cacheReminderDismissed') === 'true') {
        cacheReminderBanner.style.display = 'none';
    }
}
// --- End Permission Banner Logic ---

document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    // --- Hamburger menu toggle logic ---
    hamburger?.addEventListener('click', () => {
        // Toggle hamburger icon animation (this part should work fine)
        hamburger.classList.toggle('active');

        // Toggle menu visibility and height for smooth transition
        if (navMenu.classList.contains('hidden')) {
            // SHOW THE MENU
            navMenu.classList.remove('hidden'); // Make it visible (display:block/flex)
            // Force reflow to ensure hidden is removed before transition starts
            navMenu.offsetHeight; // eslint-disable-line no-unused-expressions
            navMenu.classList.remove('max-h-0');
            navMenu.classList.add('max-h-screen'); // Trigger expand transition

        } else {
            // HIDE THE MENU
            navMenu.classList.remove('max-h-screen');
            navMenu.classList.add('max-h-0'); // Trigger collapse transition

            // Listen for the end of the transition to hide it completely
            // This ensures the transition finishes before display:none is applied
            const transitionEndHandler = () => {
                navMenu.classList.add('hidden'); // Hide completely after collapse
                navMenu.removeEventListener('transitionend', transitionEndHandler); // Clean up listener
            };
            navMenu.addEventListener('transitionend', transitionEndHandler);
        }
    });

    // Optional: Close menu when a link is clicked (useful for single-page apps)
    navMenu?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            // Only close on small screens where the menu is toggled
            if (window.innerWidth < 768) { // Tailwind's 'md' breakpoint is 768px
                hamburger.classList.remove('active');
                navMenu.classList.remove('max-h-screen');
                navMenu.classList.add('max-h-0');

                const transitionEndHandler = () => {
                    navMenu.classList.add('hidden');
                    navMenu.removeEventListener('transitionend', transitionEndHandler);
                };
                navMenu.addEventListener('transitionend', transitionEndHandler);
            }
        });
    });
    // Directly set up the consultation button to redirect
    const consultationBtn = document.getElementById("consultationBtn");
    if (consultationBtn) {
        consultationBtn.addEventListener('click', () => {
            window.location.href = 'form.html'; // Redirect to form.html
        });
    }
});

const form = document.getElementById('pageForm');
const formStatus = document.getElementById('formStatus');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Tentukan kelas dan pesan berdasarkan respons
        const isSuccess = response.ok;
        const statusClass = isSuccess ? 'success' : 'error';
        const initialMessage = 'Pesan Anda telah berhasil dikirim! Mengarahkan Anda...';

        // Hapus kelas yang berlawanan dan tambahkan kelas yang benar
        formStatus.classList.remove(isSuccess ? 'error' : 'success');
        formStatus.classList.add(statusClass);
        formStatus.style.display = 'block'; // Pastikan pesan ditampilkan

        if (isSuccess) {
            formStatus.textContent = initialMessage;
            // Bagian redirect tetap di sini karena ini adalah efek samping
            setTimeout(() => {
                window.location.href = '/form-success.html';
            }, 2000);
        } else {
            const errorData = await response.json();
            formStatus.textContent = errorData.message || 'Terjadi kesalahan saat mengirim pesan.';
        }

    } catch (networkError) {
        console.error('Network or CORS error:', networkError);
        formStatus.classList.remove('success');
        formStatus.classList.add('error');
        formStatus.textContent = 'Tidak dapat terhubung ke server. Periksa koneksi Anda atau coba lagi nanti.';
        formStatus.style.display = 'block';
    }
});

