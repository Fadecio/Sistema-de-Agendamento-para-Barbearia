export function initAnimations() {
  const gsap = window.gsap;
  if (!gsap) return;

  const reduzirMovimento = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reduzirMovimento) {
    return;
  }

  const ScrollTrigger = window.ScrollTrigger;
  if (ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  gsap.from(".site-header", {
    y: -80,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
  });

  gsap.from(".hero .eyebrow", {
    y: 24,
    opacity: 0,
    duration: 0.7,
    delay: 0.2,
    ease: "power3.out",
  });

  gsap.from(".hero h1", {
    y: 40,
    opacity: 0,
    duration: 0.9,
    delay: 0.35,
    ease: "power3.out",
  });

  gsap.from(".hero-description", {
    y: 30,
    opacity: 0,
    duration: 0.8,
    delay: 0.5,
    ease: "power3.out",
  });

  gsap.from(".hero .button", {
    y: 24,
    opacity: 0,
    scale: 0.95,
    duration: 0.7,
    delay: 0.65,
    ease: "back.out(1.7)",
  });

  gsap.from(".barber-card", {
    scrollTrigger: {
      trigger: ".barbers",
      start: "top 75%",
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.18,
    ease: "power3.out",
  });

  gsap.from(".about-content", {
    scrollTrigger: {
      trigger: ".about",
      start: "top 75%",
    },
    x: -50,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out",
  });

  gsap.from(".about-image-card", {
    scrollTrigger: {
      trigger: ".about",
      start: "top 75%",
    },
    x: 50,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out",
  });

  gsap.from(".booking-copy", {
    scrollTrigger: {
      trigger: ".booking",
      start: "top 75%",
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
  });

  gsap.from(".booking-form", {
    scrollTrigger: {
      trigger: ".booking",
      start: "top 70%",
    },
    y: 50,
    opacity: 0,
    scale: 0.97,
    duration: 0.9,
    ease: "power3.out",
  });

  gsap.from(".appointments .section-heading", {
    scrollTrigger: {
      trigger: ".appointments",
      start: "top 80%",
    },
    y: 35,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out",
  });
}
