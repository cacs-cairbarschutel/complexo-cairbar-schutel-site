document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a[href^="#"]');
    const header = document.querySelector('.site-header');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');

            if (href === '#') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    const headerOffset = header ? header.offsetHeight : 0;
                    const elementPosition = targetSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    // Custom smooth scroll function
                    const startPosition = window.pageYOffset;
                    const distance = offsetPosition - startPosition;
                    const duration = 1000; // Duration in milliseconds (1 second)
                    let start = null;

                    window.requestAnimationFrame(step);

                    function step(timestamp) {
                        if (!start) start = timestamp;
                        const progress = timestamp - start;

                        // Ease-in-out function
                        const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

                        // Calculate new position
                        const percentage = Math.min(progress / duration, 1);
                        const newPosition = startPosition + (distance * ease(percentage));

                        window.scrollTo(0, newPosition);

                        if (progress < duration) {
                            window.requestAnimationFrame(step);
                        }
                    }
                }
            }
        });
    });

    // Carousel Logic
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlide = 0;
    const slideInterval = 2000; // 2 seconds

    if (slides.length > 0) {
        setInterval(() => {
            // Remove active class from current slide
            slides[currentSlide].classList.remove('active');

            // Move to next slide
            currentSlide = (currentSlide + 1) % slides.length;

            // Add active class to new slide
            slides[currentSlide].classList.add('active');
        }, slideInterval);
    }

    // Intersection Observer for Stats Animation
    const impactSection = document.querySelector('#impacto');
    if (impactSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    impactSection.classList.add('visible');
                    observer.unobserve(entry.target); // Run only once
                }
            });
        }, { threshold: 0.3 }); // Trigger when 30% of the section is visible
        observer.observe(impactSection);
    }
});
