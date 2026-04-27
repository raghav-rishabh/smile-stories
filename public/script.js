
// ===== DOM Elements =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const navLinks = document.querySelectorAll('.nav-link, .mobile-link');
const faqItems = document.querySelectorAll('.faq-item');

// ===== Mobile Menu Toggle =====
// function toggleMobileMenu() {
//   navToggle.classList.toggle('active');
//   mobileMenu.classList.toggle('active');
//   document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
// }

// navToggle.addEventListener('click', toggleMobileMenu);

// // Close mobile menu when clicking a link
// document.querySelectorAll('.mobile-link').forEach(link => {
//   link.addEventListener('click', () => {
//     if (mobileMenu.classList.contains('active')) {
//       toggleMobileMenu();
//     }
//   });
// });



// function toggleMobileMenu() {
//   navToggle.classList.toggle('active');
//   mobileMenu.classList.toggle('active');
//   document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
// }

function toggleMobileMenu() {
  navToggle.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  const isOpen = mobileMenu.classList.contains('active');
  document.body.style.overflow = isOpen ? 'hidden' : '';


 if (isOpen) {
    navbar.classList.add('scrolled');
    navbar.style.background = 'rgba(255,255,255,0.95)';
    navbar.style.boxShadow  = '0 8px 32px rgba(0,0,0,0.1)';
    navbar.style.border     = '1px solid rgba(0,0,0,0.05)';
  } else {
    updateNavbarStyle();
  }

}

// stopPropagation so the toggle click doesn't bubble and immediately re-close
navToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleMobileMenu();
});

// Click anywhere on the overlay (outside the content panel) closes the menu
mobileMenu.addEventListener('click', (e) => {
  if (!e.target.closest('.mobile-menu-content')) {
    toggleMobileMenu();
  }
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    if (mobileMenu.classList.contains('active')) toggleMobileMenu();
  });
});




// ===== Smooth Scroll for Navigation Links =====
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    
    // Only handle hash links
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        const navHeight = navbar.offsetHeight;
        const targetPosition = target.offsetTop - navHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }
  });
});

// ===== Active Navigation Link on Scroll =====
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPosition = window.scrollY + 100;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', updateActiveNav);

// ===== FAQ Accordion =====
faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  
  question.addEventListener('click', () => {
    const isActive = item.classList.contains('active');
    
    // Close all other FAQ items
    faqItems.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      }
    });
    
    // Toggle current item
    item.classList.toggle('active');
    question.setAttribute('aria-expanded', !isActive);
  });
});

// ===== Navbar Background on Scroll =====
function updateNavbarStyle() {
  const isBlogPage = window.location.pathname.includes('blog.html');
  if (window.scrollY > 100 || isBlogPage) {
    navbar.classList.add('scrolled');
    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
    navbar.style.border = '1px solid rgba(0, 0, 0, 0.05)';
  } else {
    navbar.classList.remove('scrolled');
    navbar.style.background = 'rgba(255, 255, 255, 0.15)';
    navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.2)';
    navbar.style.border = '1px solid rgba(255, 255, 255, 0.18)';
  }
}

window.addEventListener('scroll', updateNavbarStyle);

// ===== Hero Slider =====
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const indicators = document.querySelectorAll('.hero-indicator');
  let currentSlide = 0;
  let slideInterval;
  
  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    indicators[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
  }
  
  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    goToSlide(next);
  }
  
  function startSlider() {
    slideInterval = setInterval(nextSlide, 3000);
  }
  
  function stopSlider() {
    clearInterval(slideInterval);
  }
  
  // Click handlers for indicators
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      stopSlider();
      goToSlide(index);
      startSlider();
    });
  });
  
  // Start auto-sliding
  startSlider();
  
  // Pause on hover (optional for mobile-friendly UX)
  const hero = document.querySelector('.hero');
  hero.addEventListener('mouseenter', stopSlider);
  hero.addEventListener('mouseleave', startSlider);
}

// ===== Intersection Observer for Animations =====
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.about-content, .about-image, .transformation-card, .service-card, .faq-item, .appointment-card, .map-wrapper, .instagram-profile-card, .instagram-profile-highlights').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ===== Keyboard Navigation =====
document.addEventListener('keydown', (e) => {
  // Close mobile menu with Escape key
  if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
    toggleMobileMenu();
  }
});

// ===== Before/After Slider =====
function initializeSliders() {
  const sliders = document.querySelectorAll('[data-slider]');
  
  sliders.forEach(slider => {
    const handle = slider.querySelector('.slider-handle');
    const beforeImg = slider.querySelector('.before-img');
    let isDragging = false;
    
    function updateSlider(clientX) {
      const rect = slider.getBoundingClientRect();
      let percentage = ((clientX - rect.left) / rect.width) * 100;
      percentage = Math.max(0, Math.min(100, percentage));
      
      handle.style.left = percentage + '%';
      beforeImg.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
    }
    
    function startDrag(e) {
      isDragging = true;
      slider.style.cursor = 'grabbing';
      e.preventDefault();
    }
    
    function stopDrag() {
      isDragging = false;
      slider.style.cursor = 'ew-resize';
    }
    
    function onMove(e) {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      updateSlider(clientX);
    }
    
    // Mouse events
    handle.addEventListener('mousedown', startDrag);
    slider.addEventListener('mousedown', (e) => {
      startDrag(e);
      const clientX = e.clientX;
      updateSlider(clientX);
    });
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('mousemove', onMove);
    
    // Touch events
    handle.addEventListener('touchstart', startDrag, { passive: false });
    slider.addEventListener('touchstart', (e) => {
      startDrag(e);
      const clientX = e.touches[0].clientX;
      updateSlider(clientX);
    }, { passive: false });
    document.addEventListener('touchend', stopDrag);
    document.addEventListener('touchmove', onMove, { passive: false });
  });
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
  updateNavbarStyle();
  updateActiveNav();
  initializeSliders();
  initHeroSlider();
});
