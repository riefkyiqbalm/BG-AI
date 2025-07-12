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


