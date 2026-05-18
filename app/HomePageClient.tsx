'use client'

import { useEffect } from 'react'


export default function HomePageClient() {
  useEffect(() => {
    const navbar = document.getElementById('navbar')
    const navToggle = document.getElementById('navToggle')
    const mobileMenu = document.getElementById('mobileMenu')
    const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav-link, .mobile-link'))
    const faqItems = Array.from(document.querySelectorAll<HTMLElement>('.faq-item'))
    const cleanup: Array<() => void> = []

    if (!navbar || !navToggle || !mobileMenu) return undefined

    function updateNavbarStyle() {
      if (!navbar) return
      if (window.scrollY > 100) {
        navbar.classList.add('scrolled')
        navbar.style.background = 'rgba(255, 255, 255, 0.95)'
        navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
        navbar.style.border = '1px solid rgba(0, 0, 0, 0.05)'
      } else {
        navbar.classList.remove('scrolled')
        navbar.style.background = 'rgba(255, 255, 255, 0.15)'
        navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.2)'
        navbar.style.border = '1px solid rgba(255, 255, 255, 0.18)'
      }
    }

    function toggleMobileMenu() {
      if (!navbar || !navToggle || !mobileMenu) return
      navToggle.classList.toggle('active')
      mobileMenu.classList.toggle('active')
      const isOpen = mobileMenu.classList.contains('active')
      document.body.style.overflow = isOpen ? 'hidden' : ''

      if (isOpen) {
        navbar.classList.add('scrolled')
        navbar.style.background = 'rgba(255,255,255,0.95)'
        navbar.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'
        navbar.style.border = '1px solid rgba(0,0,0,0.05)'
      } else {
        updateNavbarStyle()
      }
    }

    function updateActiveNav() {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id]'))
      const scrollPosition = window.scrollY + 100

      sections.forEach((section) => {
        const sectionTop = section.offsetTop
        const sectionHeight = section.offsetHeight
        const sectionId = section.getAttribute('id')

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          navLinks.forEach((link) => {
            link.classList.remove('active')
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active')
            }
          })
        }
      })
    }

    const onToggleClick = (event: Event) => {
      event.stopPropagation()
      toggleMobileMenu()
    }
    navToggle.addEventListener('click', onToggleClick)
    cleanup.push(() => navToggle.removeEventListener('click', onToggleClick))

    const onMobileMenuClick = (event: Event) => {
      if (!(event.target as Element).closest('.mobile-menu-content')) {
        toggleMobileMenu()
      }
    }
    mobileMenu.addEventListener('click', onMobileMenuClick)
    cleanup.push(() => mobileMenu.removeEventListener('click', onMobileMenuClick))

    document.querySelectorAll<HTMLAnchorElement>('.mobile-link').forEach((link) => {
      const handler = () => {
        if (mobileMenu.classList.contains('active')) toggleMobileMenu()
      }
      link.addEventListener('click', handler)
      cleanup.push(() => link.removeEventListener('click', handler))
    })

    navLinks.forEach((link) => {
      const handler = (event: Event) => {
        const href = link.getAttribute('href') || ''
        if (href.startsWith('#')) {
          event.preventDefault()
          const target = document.querySelector<HTMLElement>(href)
          if (target) {
            const navHeight = navbar.offsetHeight
            const targetPosition = target.offsetTop - navHeight - 20
            window.scrollTo({ top: targetPosition, behavior: 'smooth' })
          }
        }
      }
      link.addEventListener('click', handler)
      cleanup.push(() => link.removeEventListener('click', handler))
    })

    const onScrollActive = () => updateActiveNav()
    const onScrollNavbar = () => updateNavbarStyle()
    window.addEventListener('scroll', onScrollActive)
    window.addEventListener('scroll', onScrollNavbar)
    cleanup.push(() => window.removeEventListener('scroll', onScrollActive))
    cleanup.push(() => window.removeEventListener('scroll', onScrollNavbar))

    faqItems.forEach((item) => {
      const question = item.querySelector<HTMLButtonElement>('.faq-question')
      if (!question) return

      const handler = () => {
        const isActive = item.classList.contains('active')

        faqItems.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove('active')
            otherItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false')
          }
        })

        item.classList.toggle('active')
        question.setAttribute('aria-expanded', String(!isActive))
      }
      question.addEventListener('click', handler)
      cleanup.push(() => question.removeEventListener('click', handler))
    })

    function initHeroSlider() {
      const slides = Array.from(document.querySelectorAll<HTMLElement>('.hero-slide'))
      const indicators = Array.from(document.querySelectorAll<HTMLElement>('.hero-indicator'))
      const hero = document.querySelector<HTMLElement>('.hero')
      if (!slides.length || !indicators.length || !hero) return
      let currentSlide = 0
      let slideInterval: ReturnType<typeof setInterval> | undefined

      function goToSlide(index: number) {
        slides[currentSlide]?.classList.remove('active')
        indicators[currentSlide]?.classList.remove('active')
        currentSlide = index
        slides[currentSlide]?.classList.add('active')
        indicators[currentSlide]?.classList.add('active')
      }

      function nextSlide() {
        const next = (currentSlide + 1) % slides.length
        goToSlide(next)
      }

      function startSlider() {
        slideInterval = setInterval(nextSlide, 3000)
      }

      function stopSlider() {
        if (slideInterval) clearInterval(slideInterval)
      }

      indicators.forEach((indicator, index) => {
        const handler = () => {
          stopSlider()
          goToSlide(index)
          startSlider()
        }
        indicator.addEventListener('click', handler)
        cleanup.push(() => indicator.removeEventListener('click', handler))
      })

      hero.addEventListener('mouseenter', stopSlider)
      hero.addEventListener('mouseleave', startSlider)
      cleanup.push(() => hero.removeEventListener('mouseenter', stopSlider))
      cleanup.push(() => hero.removeEventListener('mouseleave', startSlider))
      cleanup.push(stopSlider)
      startSlider()
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement
          target.style.opacity = '1'
          target.style.transform = 'translateY(0)'
        }
      })
    }, { root: null, rootMargin: '0px', threshold: 0.1 })

    document.querySelectorAll<HTMLElement>('.about-content, .about-image, .transformation-card, .service-card, .faq-item, .appointment-card, .map-wrapper, .instagram-profile-card, .instagram-profile-highlights').forEach((element) => {
      element.style.opacity = '0'
      element.style.transform = 'translateY(20px)'
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
      observer.observe(element)
    })
    cleanup.push(() => observer.disconnect())

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenu.classList.contains('active')) {
        toggleMobileMenu()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    cleanup.push(() => document.removeEventListener('keydown', onKeyDown))

    document.querySelectorAll<HTMLElement>('[data-slider]').forEach((slider) => {
      const handle = slider.querySelector<HTMLElement>('.slider-handle')
      const beforeImg = slider.querySelector<HTMLElement>('.before-img')
      if (!handle || !beforeImg) return
      let isDragging = false

      function updateSlider(clientX: number) {
        const rect = slider.getBoundingClientRect()
        let percentage = ((clientX - rect.left) / rect.width) * 100
        percentage = Math.max(0, Math.min(100, percentage))
        handle.style.left = percentage + '%'
        beforeImg.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`
      }

      function startDrag(event: MouseEvent | TouchEvent) {
        isDragging = true
        slider.style.cursor = 'grabbing'
        event.preventDefault()
      }

      function stopDrag() {
        isDragging = false
        slider.style.cursor = 'ew-resize'
      }

      function onMove(event: MouseEvent | TouchEvent) {
        if (!isDragging) return
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
        updateSlider(clientX)
      }

      const onSliderMouseDown = (event: MouseEvent) => {
        startDrag(event)
        updateSlider(event.clientX)
      }
      const onSliderTouchStart = (event: TouchEvent) => {
        startDrag(event)
        updateSlider(event.touches[0].clientX)
      }

      handle.addEventListener('mousedown', startDrag)
      slider.addEventListener('mousedown', onSliderMouseDown)
      document.addEventListener('mouseup', stopDrag)
      document.addEventListener('mousemove', onMove)
      handle.addEventListener('touchstart', startDrag, { passive: false })
      slider.addEventListener('touchstart', onSliderTouchStart, { passive: false })
      document.addEventListener('touchend', stopDrag)
      document.addEventListener('touchmove', onMove, { passive: false })

      cleanup.push(() => handle.removeEventListener('mousedown', startDrag))
      cleanup.push(() => slider.removeEventListener('mousedown', onSliderMouseDown))
      cleanup.push(() => document.removeEventListener('mouseup', stopDrag))
      cleanup.push(() => document.removeEventListener('mousemove', onMove))
      cleanup.push(() => handle.removeEventListener('touchstart', startDrag))
      cleanup.push(() => slider.removeEventListener('touchstart', onSliderTouchStart))
      cleanup.push(() => document.removeEventListener('touchend', stopDrag))
      cleanup.push(() => document.removeEventListener('touchmove', onMove))
    })

    const form = document.getElementById('contactForm') as HTMLFormElement | null
    const successMsg = document.getElementById('formSuccessMsg')
    const submitBtn = document.getElementById('contactFormSubmit') as HTMLButtonElement | null

    if (form && successMsg && submitBtn) {
      const inputs = Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('.form-input'))

      function validateField(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
        let valid = true
        if (!input.value.trim()) {
          valid = false
        } else if (input instanceof HTMLInputElement && input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
          valid = false
        } else if (input instanceof HTMLInputElement && input.type === 'tel' && !/^[\d\s\+\-\(\)]{7,15}$/.test(input.value.trim())) {
          valid = false
        }
        input.classList.toggle('error', !valid)
        return valid
      }

      inputs.forEach((input) => {
        const blurHandler = () => validateField(input)
        const inputHandler = () => {
          if (input.classList.contains('error')) validateField(input)
        }
        input.addEventListener('blur', blurHandler)
        input.addEventListener('input', inputHandler)
        cleanup.push(() => input.removeEventListener('blur', blurHandler))
        cleanup.push(() => input.removeEventListener('input', inputHandler))
      })

      const submitHandler = (event: SubmitEvent) => {
        event.preventDefault()
        let allValid = true
        inputs.forEach((input) => {
          if (!validateField(input)) allValid = false
        })
        if (!allValid) return

        submitBtn.disabled = true
        const submitText = submitBtn.querySelector('.btn-submit-text')
        if (submitText) submitText.textContent = 'Sending…'

        const formData = new FormData(form)
        const payload = {
          ...Object.fromEntries(formData.entries()),
          _subject: 'New Contact Form Enquiry - Smile Stories',
          _captcha: 'false',
          _template: 'table',
          _url: window.location.href,
        }

        fetch('https://formsubmit.co/ajax/smilestoriesjalandhar@gmail.com', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
          .then(async (response) => {
            const text = await response.text()
            let data: { message?: string; success?: string | boolean } = {}

            try {
              data = text ? JSON.parse(text) : {}
            } catch {
              throw new Error(text || 'FormSubmit returned a non-JSON response.')
            }

            if (!response.ok || data.success === false) {
              throw new Error(data.message || 'FormSubmit rejected the submission.')
            }

            return data
          })
          .then(() => {
            form.reset()
            inputs.forEach((input) => input.classList.remove('error'))
            successMsg.style.color = 'var(--color-primary)'
            successMsg.textContent = "✓ Message sent! We'll be in touch soon."
            submitBtn.disabled = false
            if (submitText) submitText.textContent = 'Send Message'
            setTimeout(() => { successMsg.textContent = '' }, 5000)
          })
          .catch((error) => {
            console.error('FormSubmit error:', error)
            successMsg.style.color = '#e05353'
            successMsg.textContent = error instanceof Error && error.message
              ? error.message
              : 'Oops! Something went wrong. Please try again.'
            submitBtn.disabled = false
            if (submitText) submitText.textContent = 'Send Message'
          })
      }

      form.addEventListener('submit', submitHandler)
      cleanup.push(() => form.removeEventListener('submit', submitHandler))
    }

    updateNavbarStyle()
    updateActiveNav()
    initHeroSlider()

    return () => {
      cleanup.forEach((remove) => remove())
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <>
      
        {/* Navbar */}
        <nav className="navbar" id="navbar">
          <div className="nav-container">
            <a href="#" className="nav-brand">Smile Stories</a>
      
            <div className="nav-social">
              <a href="https://www.instagram.com/dr.pallavigarg?igsh=MWV0dXh4cTdhaTFreQ==" target="_blank" rel="noopener"
                aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://wa.me/916284114338" target="_blank" rel="noopener" aria-label="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z">
                  </path>
                </svg>
              </a>
            </div>
      
            <div className="nav-links" id="navLinks">
      
              <a href="#about" className="nav-link">About</a>
              <a href="#transformations" className="nav-link active">Transformations</a>
              <a href="#services" className="nav-link">Services</a>
              <a href="#faq" className="nav-link">FAQ</a>
              <a href="/blog" className="nav-link">Blogs</a>
              <a href="#contact" className="nav-link">Contact</a>
            </div>
      
            <button className="nav-toggle" id="navToggle" aria-label="Toggle navigation">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>
      
        {/* Mobile Menu */}
        <div className="mobile-menu" id="mobileMenu">
          <div className="mobile-menu-content">
      
            <a href="#about" className="mobile-link">About</a>
            <a href="#transformations" className="mobile-link">Transformations</a>
            <a href="#services" className="mobile-link">Services</a>
            <a href="#faq" className="mobile-link">FAQ</a>
            <a href="/blog" className="mobile-link">Blogs</a>
            <a href="#contact" className="mobile-link">Contact</a>
            <div className="mobile-social">
              <a href="https://www.instagram.com/dr.pallavigarg?igsh=MWV0dXh4cTdhaTFreQ==" target="_blank" rel="noopener"
                aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://wa.me/916284114338" target="_blank" rel="noopener" aria-label="WhatsApp">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z">
                  </path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      
        {/* Hero Section */}
        <section className="hero" id="home">
          <div className="hero-bg">
            <div className="hero-slider">
              <div className="hero-slide active">
                <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920&h=1080&fit=crop&q=80"
                  alt="Modern dental clinic" loading="eager" />
              </div>
              <div className="hero-slide">
                <img src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1920&h=1080&fit=crop&q=80"
                  alt="Happy patient smile" loading="eager" />
              </div>
              <div className="hero-slide">
                <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1920&h=1080&fit=crop&q=80"
                  alt="Dental care" loading="eager" />
              </div>
              <div className="hero-slide">
                <img src="https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=1920&h=1080&fit=crop&q=80"
                  alt="Orthodontic treatment" loading="eager" />
              </div>
              <div className="hero-slide">
                <img src="https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=1920&h=1080&fit=crop&q=80"
                  alt="Beautiful smile" loading="eager" />
              </div>
            </div>
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content">
            <h1 className="hero-title">Your Perfect Smile Starts Here</h1>
            <p className="hero-subtitle">Premium orthodontic care with a gentle, personalized approach. Transform your smile with
              Jalandhar's trusted orthodontist.</p>
            <div className="hero-buttons">
              <a href="#contact" className="btn btn-primary">Book Appointment</a>
              <a href="https://www.instagram.com/dr.pallavigarg?igsh=MWV0dXh4cTdhaTFreQ==" target="_blank" rel="noopener"
                className="btn btn-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                Follow Us
              </a>
            </div>
          </div>
          <div className="hero-indicators">
            <button className="hero-indicator active" data-slide="0" aria-label="Slide 1"></button>
            <button className="hero-indicator" data-slide="1" aria-label="Slide 2"></button>
            <button className="hero-indicator" data-slide="2" aria-label="Slide 3"></button>
            <button className="hero-indicator" data-slide="3" aria-label="Slide 4"></button>
            <button className="hero-indicator" data-slide="4" aria-label="Slide 5"></button>
          </div>
        </section>
      
        {/* About Section */}
        <section className="about" id="about">
          <div className="container">
            <div className="about-grid">
              <div className="about-image">
                <img src="./images/PHOTO-2026-04-23-16-11-38.jpg" alt="Dr. Pallavi Garg - Orthodontist" loading="lazy" />
              </div>
              <div className="about-content">
                <span className="section-label">About the Doctor</span>
                <h2 className="section-title">Dr. Pallavi Garg</h2>
                <p className="about-intro">With over <strong style={{ color: 'black' }}>6 years of experience in orthodontics</strong>
                  and <strong style={{ color: 'black' }}>12 years of experience in Dentistry</strong>, Dr. Pallavi Garg as a
                  <span><strong style={{ color: 'black' }}>Gold medalist</strong></span> MDS orthodontist has transformed thousands
                  of smiles across Punjab. Her gentle approach and attention to detail make her one of <strong style={{ color: 'black' }}>the most trusted
                  orthodontists in Jalandhar</strong>.
                </p>
      
                <div className="about-achievements">
                  <div className="achievement">
                    <span className="achievement-number">12+</span>
                    <span className="achievement-label">Years Experience</span>
                  </div>
                  <div className="achievement">
                    <span className="achievement-number">5000+</span>
                    <span className="achievement-label">Happy Patients</span>
                  </div>
                  <div className="achievement">
                    <span className="achievement-number">15+</span>
                    <span className="achievement-label">Awards</span>
                  </div>
                </div>
      
                <ul className="about-credentials">
                  <li>BDS from Post Graduate Institute, Rohtak.</li>
                  <li>MDS in Orthodontics from BFUHS, Faridkot.</li>
                  <li>Certified Aligner Provider</li>
                  <li>Fellow, Indian Orthodontic Society</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      
        {/* Before & After Section */}
        <section className="transformations" id="transformations">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Results</span>
              <h2 className="section-title">Smile Transformations</h2>
              <p className="section-desc">Real results from our patients. Slide to see the before and after.</p>
            </div>
      
            <div className="transformations-grid">
              <div className="transformation-card">
                <div className="transformation-slider" data-slider>
                  <img src="images/IMG_7136.jpg" alt="Before treatment" className="before-img" />
                  <img src="images/IMG_7137.jpg" alt="After treatment" className="after-img" />
                  <div className="slider-handle"></div>
                  <div className="transformation-labels">
                    <span className="transformation-label">Before</span>
                    <span className="transformation-label">After</span>
                  </div>
                </div>
                <div className="transformation-info">
                  <h4 className="transformation-title">Gap Closure</h4>
                  <p className="transformation-treatment">Got gap between teeth - No problem!</p>
                </div>
              </div>
      
              <div className="transformation-card">
                <div className="transformation-slider" data-slider>
                  <img src="./images/IMG_7138.jpg?w=600&h=450&fit=crop" alt="Before treatment" className="before-img" />
                  <img src="./images/IMG_7139.jpg?w=600&h=450&fit=crop" alt="After treatment" className="after-img" />
                  <div className="slider-handle"></div>
                  <div className="transformation-labels">
                    <span className="transformation-label">Before</span>
                    <span className="transformation-label">After</span>
                  </div>
                </div>
                <div className="transformation-info">
                  <h4 className="transformation-title">Crowding Correction</h4>
                  <p className="transformation-treatment">Crowded Teeth? We are here to help.</p>
                </div>
              </div>
      
              <div className="transformation-card">
                <div className="transformation-slider" data-slider>
                  <img src="./images/IMG_7140.jpg?w=600&h=450&fit=crop" alt="Before treatment" className="before-img" />
                  <img src="./images/IMG_7141.jpg?w=600&h=450&fit=crop" alt="After treatment" className="after-img" />
                  <div className="slider-handle"></div>
                  <div className="transformation-labels">
                    <span className="transformation-label">Before</span>
                    <span className="transformation-label">After</span>
                  </div>
                </div>
                <div className="transformation-info">
                  <h4 className="transformation-title">Gummy Smile Correction</h4>
                  <p className="transformation-treatment">Is smile your insecurity? Not anymore!</p>
                </div>
              </div>
      
              <div className="transformation-card">
                <div className="transformation-slider" data-slider>
                  <img src="./images/IMG_7142.jpg?w=600&h=450&fit=crop"
                    alt="Before treatment" className="before-img" />
                  <img src="./images/IMG_7143.jpg?w=600&h=450&fit=crop"
                    alt="After treatment" className="after-img" />
                  <div className="slider-handle"></div>
                  <div className="transformation-labels">
                    <span className="transformation-label">Before</span>
                    <span className="transformation-label">After</span>
                  </div>
                </div>
                <div className="transformation-info">
                  <h4 className="transformation-title">Overbite Correction</h4>
                  <p className="transformation-treatment">Nothings permanent - like Overbite.</p>
                </div>
              </div>
      
              <div className="transformation-card">
                <div className="transformation-slider" data-slider>
                  <img src="./images/IMG_7144.jpg"
                    alt="Before treatment" className="before-img" />
                  <img src="./images/IMG_7145.jpg"
                    alt="After treatment" className="after-img" />
                  <div className="slider-handle"></div>
                  <div className="transformation-labels">
                    <span className="transformation-label">Before</span>
                    <span className="transformation-label">After</span>
                  </div>
                </div>
                <div className="transformation-info">
                  <h4 className="transformation-title">Functional Jaw Correction</h4>
                  <p className="transformation-treatment">functional jaw correction.</p>
                </div>
              </div>
      
              <div className="transformation-card">
                <div className="transformation-slider" data-slider>
                  <img src="./images/IMG_7146.jpg?w=600&h=450&fit=crop"
                    alt="Before treatment" className="before-img" />
                  <img src="./images/IMG_7147.jpg?w=600&h=450&fit=crop"
                    alt="After treatment" className="after-img" />
                  <div className="slider-handle"></div>
                  <div className="transformation-labels">
                    <span className="transformation-label">Before</span>
                    <span className="transformation-label">After</span>
                  </div>
                </div>
                <div className="transformation-info">
                  <h4 className="transformation-title">Asymmetry Correction</h4>
                  <p className="transformation-treatment">Asymmetric jaw correction</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      
        {/* Services Section */}
        <section className="services" id="services">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Our Services</span>
              <h2 className="section-title">Comprehensive Orthodontic Care</h2>
              <p className="section-desc">We offer a range of treatments tailored to your unique needs</p>
            </div>
      
            <div className="services-grid">
              <div className="service-card featured">
                <div className="service-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"></path>
                    <path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2"></path>
                  </svg>
                </div>
                <span className="service-badge">Speciality</span>
                <h3 className="service-title">Clear Aligners</h3>
                <p className="service-desc">Invisible, removable aligners for a discreet treatment. Perfect for adults and teens
                  who want to straighten their teeth without traditional braces.</p>
                <a href="#contact" className="service-link">Learn More →</a>
              </div>
      
              <div className="service-card">
                <div className="service-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                </div>
                <h3 className="service-title">Metal Braces</h3>
                <p className="service-desc">Traditional metal braces remain the most effective solution for complex orthodontic
                  cases. Modern designs are smaller and more comfortable than ever.</p>
                <a href="#contact" className="service-link">Learn More →</a>
              </div>
      
              <div className="service-card">
                <div className="service-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z">
                    </path>
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z">
                    </path>
                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                  </svg>
                </div>
                <h3 className="service-title">Cleaning & Oral Care</h3>
                <p className="service-desc">Professional dental cleaning and preventive care to maintain your oral health. Regular
                  check-ups help prevent cavities and gum disease.</p>
                <a href="#contact" className="service-link">Learn More →</a>
              </div>
            </div>
          </div>
        </section>
      
        {/* FAQ Section */}
        <section className="faq" id="faq">
          <div className="container">
            <div className="section-header">
              <span className="section-label">FAQ</span>
              <h2 className="section-title">Frequently Asked Questions</h2>
            </div>
      
            <div className="faq-list">
              <div className="faq-item">
                <button className="faq-question" aria-expanded="false">
                  <span>How long does orthodontic treatment take?</span>
                  <svg className="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <div className="faq-answer">
                  <p>Treatment duration varies based on individual cases. Most treatments range from 12 to 24 months. During
                    your consultation, Dr. Garg will provide a personalized treatment timeline based on your specific needs.
                  </p>
                </div>
              </div>
      
              <div className="faq-item">
                <button className="faq-question" aria-expanded="false">
                  <span>Are clear aligners as effective as traditional braces?</span>
                  <svg className="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <div className="faq-answer">
                  <p>Yes! Clear aligners are highly effective for most orthodontic cases. They work best for mild to moderate
                    alignment issues. For more complex cases, traditional braces may be recommended for optimal results.</p>
                </div>
              </div>
      
              <div className="faq-item">
                <button className="faq-question" aria-expanded="false">
                  <span>What is the cost of orthodontic treatment?</span>
                  <svg className="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <div className="faq-answer">
                  <p>Treatment costs depend on the type of treatment and complexity of your case. We offer flexible payment
                    plans to make orthodontic care accessible. Schedule a consultation for a detailed quote.</p>
                </div>
              </div>
      
              <div className="faq-item">
                <button className="faq-question" aria-expanded="false">
                  <span>How often do I need to visit during treatment?</span>
                  <svg className="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <div className="faq-answer">
                  <p>For braces, visits are typically scheduled every 4-6 weeks. Clear aligner patients usually visit every
                    6-8 weeks. We also offer virtual check-ins for select patients.</p>
                </div>
              </div>
      
              <div className="faq-item">
                <button className="faq-question" aria-expanded="false">
                  <span>Is orthodontic treatment painful?</span>
                  <svg className="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <div className="faq-answer">
                  <p>Some mild discomfort is normal when starting treatment or after adjustments, but it typically subsides
                    within a few days. Dr. Garg uses gentle techniques to minimize any discomfort throughout your treatment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      
        {/* Book Appointment Section */}
        <section className="appointment" id="contact">
          <div className="container">
            <div className="appointment-card">
              <div className="appointment-content">
                <span className="section-label">Book Now</span>
                <h2 className="section-title">Ready to Transform Your Smile?</h2>
                <p className="appointment-desc">Schedule your consultation today and take the first step towards the smile you've
                  always wanted.</p>
      
                <div className="appointment-buttons">
                  <a href="https://wa.me/916284114338?text=Hello! I would like to book an appointment." target="_blank"
                    rel="noopener" className="btn btn-whatsapp">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path
                        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z">
                      </path>
                    </svg>
                    Book via WhatsApp
                  </a>
                  <a href="https://www.instagram.com/dr.pallavigarg?igsh=MWV0dXh4cTdhaTFreQ==" target="_blank" rel="noopener"
                    className="btn btn-instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    DM on Instagram
                  </a>
                </div>
              </div>
      
              <div className="appointment-info">
                <div className="info-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <div>
                    <strong>Location</strong>
                    <p>21-B Deol Nagar, near ekta gas agency, Jalandhar</p>
                  </div>
                </div>
                <div className="info-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <div>
                    <strong>Clinic Hours</strong>
                    <p>Mon - Sat: 10:00 AM - 8:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      
        {/* Contact Form Section */}
        <section className="contact-form-section" id="enquiry">
          {/* Decorative blobs */}
          <div className="cf-blob cf-blob-1" aria-hidden="true"></div>
          <div className="cf-blob cf-blob-2" aria-hidden="true"></div>
      
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div className="section-header">
              <span className="section-label">Get In Touch</span>
              <h2 className="section-title">Send Us a Message</h2>
              <div className="cf-accent-rule" aria-hidden="true"></div>
              <p className="section-desc">Have a question or want to book a consultation? Fill in the form and we'll get back to
                you.</p>
            </div>
      
            <div className="cf-layout">
      
              {/* Left: Clinic Info */}
              <div className="cf-info-panel">
                <h3 className="cf-info-title">Visit Our Clinic</h3>
                <p className="cf-info-subtitle">Our friendly team is available Monday–Saturday, 10 AM to 8 PM. Drop by or send us
                  a message!</p>
      
                <div className="cf-info-items">
                  <div className="cf-info-item">
                    <div className="cf-info-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div>
                      <strong>Address</strong>
                      <p>21-B Deol Nagar, near Ekta Gas Agency<br />Jalandhar, Punjab 144001</p>
                    </div>
                  </div>
                  <div className="cf-info-item">
                    <div className="cf-info-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path
                          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.59 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8A16 16 0 0 0 16 16.09l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <div>
                      <strong>Phone</strong>
                      <p>+91 62841 14338</p>
                    </div>
                  </div>
                  <div className="cf-info-item">
                    <div className="cf-info-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <div>
                      <strong>Email</strong>
                      <p>Smilestoriesjalandhar@gmail.com</p>
                    </div>
                  </div>
                  <div className="cf-info-item">
                    <div className="cf-info-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div>
                      <strong>Clinic Hours</strong>
                      <p>Mon – Sat: 10:00 AM – 8:00 PM<br />Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
      
              {/* Right: Form Card */}
              <div className="cf-form-panel">
                <form className="contact-form" id="contactForm" action="https://formsubmit.co/ajax/smilestoriesjalandhar@gmail.com" method="POST" noValidate>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cf-name" className="form-label">Full Name <span className="form-required">*</span></label>
                      <input type="text" id="cf-name" name="name" className="form-input" placeholder="e.g. Rishabh Raghav" required
                        autoComplete="name" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cf-phone" className="form-label">Phone Number <span className="form-required">*</span></label>
                      <input type="tel" id="cf-phone" name="phone" className="form-input" placeholder="+91 98765 43210" required
                        autoComplete="tel" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="cf-email" className="form-label">Email Address <span className="form-required">*</span></label>
                    <input type="email" id="cf-email" name="email" className="form-input" placeholder="you@example.com" required
                      autoComplete="email" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cf-service" className="form-label">Enquiry Type</label>
                    <select id="cf-service" name="Enquiry Type" className="form-input form-select">
                      <option value="">— Select —</option>
                      <option value="Clear Aligners">Clear Aligners</option>
                      <option value="Metal Braces">Metal Braces</option>
                      <option value="Teeth Whitening">Teeth Whitening</option>
                      <option value="Dental Cleaning">Dental Cleaning</option>
                      <option value="Consultation">General Consultation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="cf-query" className="form-label">Your Message <span className="form-required">*</span></label>
                    <textarea id="cf-query" name="query" className="form-input form-textarea"
                      placeholder="Tell us how we can help…" required rows={5} />
                  </div>
                  <div className="form-submit-row">
                    <button type="submit" className="btn btn-form-submit" id="contactFormSubmit">
                      <span className="btn-submit-text">Send Message</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                    <p className="form-success-msg" id="formSuccessMsg" aria-live="polite"></p>
                  </div>
                </form>
              </div>
      
            </div>
          </div>
        </section>
      
      
        {/* https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920&h=1080&fit=crop&q=80 */}
      
        {/* Instagram Profile Section */}
        <section className="instagram-profile" id="instagram-profile">
          <div className="instagram-profile-bg">
            <img src="./images/Screenshot 2026-04-22 at 4.56.08 AM.png" alt="Dental clinic background" loading="lazy" />
            <div className="instagram-profile-overlay"></div>
          </div>
          <div className="instagram-profile-content">
            <div className="instagram-profile-card">
              <div className="profile-avatar">
                <img src="./images/PHOTO-2026-04-23-16-11-38.jpg" alt="Dr. Pallavi Garg profile" />
                <div className="profile-avatar-ring"></div>
              </div>
              <div className="profile-info">
                <div className="profile-header">
                  <h3 className="profile-username">@smilestories</h3>
                  <span className="profile-verified">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </span>
                </div>
                <p className="profile-name">Smile Stories | Dr. Pallavi Garg</p>
                <p className="profile-bio">Premium Orthodontic Care in Jalandhar</p>
                <p className="profile-bio-detail">Transforming smiles with Clear Aligners & Braces</p>
                <div className="profile-stats">
                  <div className="profile-stat">
                    <span className="stat-number">300+</span>
                    <span className="stat-label">Posts</span>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-number">9K+</span>
                    <span className="stat-label">Followers</span>
                  </div>
                  <div className="profile-stat">
                    <span className="stat-number">5000+</span>
                    <span className="stat-label">Patients served</span>
                  </div>
                </div>
                <a href="https://www.instagram.com/dr.pallavigarg?igsh=MWV0dXh4cTdhaTFreQ==" target="_blank" rel="noopener"
                  className="btn btn-instagram profile-follow-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  Visit Instagram
                </a>
              </div>
            </div>
          </div>
        </section>
      
        {/* Map Section */}
        <section className="map-section" id="location">
          <div className="container">
            <div className="section-header">
              <span className="section-label">Find Us</span>
              <h2 className="section-title">Visit Our Clinic</h2>
            </div>
      
            <div className="map-wrapper">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4398.991641946881!2d75.55609417635515!3d31.300772457957468!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a5bd09d985baf%3A0x77a5ba8ae0e32e2d!2sSmile%20Stories%20by%20Dr.Pallavi%20Garg!5e1!3m2!1sen!2sin!4v1776904331564!5m2!1sen!2sin"
                width="600" height="450" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="Smile Stories Clinic Location">
              </iframe>
              <div className="map-overlay">
                <h4 className="map-overlay-title">Smile Stories</h4>
                <p className="map-overlay-address">21-B deol Nagar, jalandhar<br />Punjab, India 144003</p>
                <a href="https://maps.google.com/?q=Model+Town+Jalandhar+Punjab" target="_blank" rel="noopener"
                  className="map-overlay-link">
                  Get Directions
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      
        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-grid">
              <div className="footer-brand">
                <a href="#" className="footer-logo">Smile Stories</a>
                <p className="footer-tagline">Creating beautiful smiles with care and precision.</p>
                <div className="footer-social">
                  <a href="https://www.instagram.com/dr.pallavigarg?igsh=MWV0dXh4cTdhaTFreQ==" target="_blank" rel="noopener"
                    aria-label="Instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="https://wa.me/916284114338" target="_blank" rel="noopener" aria-label="WhatsApp">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path
                        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z">
                      </path>
                    </svg>
                  </a>
                </div>
              </div>
      
              <div className="footer-links">
                <h4>Quick Links</h4>
                <a href="#home">Home</a>
                <a href="#about">About</a>
                <a href="#services">Services</a>
                <a href="#faq">FAQ</a>
                <a href="/blog">Blogs</a>
              </div>
      
              <div className="footer-links">
                <h4>Services</h4>
                <a href="#services">Clear Aligners</a>
                <a href="#services">Metal Braces</a>
                <a href="#services">Dental Cleaning</a>
                <a href="#contact">Consultation</a>
              </div>
      
              <div className="footer-contact">
                <h4>Contact</h4>
                <p>21-B Deol Nagar, Jalandhar<br />Punjab, India</p>
                <p>+916284114338</p>
                <p>Smilestoriesjalandhar@gmail.com</p>
              </div>
            </div>
      
            <div className="footer-bottom">
              <p>&copy; 2026 Smile Stories. All rights reserved.</p>
            </div>
          </div>
        </footer>
      
        
    </>
  )
}
