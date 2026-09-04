"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import LandingNavbar from "@/components/user/home/LandingNavbar";
import HeroSection from "@/components/user/home/HeroSection";
import AboutSection from "@/components/user/home/AboutSection";
import EverythingSection from "@/components/user/home/EverythingSection";
import TestimonialsSection from "@/components/user/home/TestimonialsSection";
import PricingSection from "@/components/user/home/PricingSection";
import ContactSection from "@/components/user/home/ContactSection";
import LandingFooter from "@/components/user/home/LandingFooter";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = {
    hero: useRef<HTMLDivElement>(null),
    about: useRef<HTMLDivElement>(null),
    everything: useRef<HTMLDivElement>(null),
    testimonials: useRef<HTMLDivElement>(null),
    pricing: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    // Helper for robust batch animations
    const animateBatch = (selector: string | NodeListOf<Element> | HTMLCollection | Element[], vars: gsap.TweenVars) => {
      const items = typeof selector === "string" ? document.querySelectorAll(selector) : selector;
      if (items.length === 0) return;

      // Set initial state explicitly
      gsap.set(items, { opacity: 0, y: 50, ...vars.from });

      ScrollTrigger.batch(items, {
        start: "top 85%",
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            rotationX: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power3.out",
            overwrite: true, // IMPORTANT: Prevent conflicts
          });
        },
        onLeave: (batch) => {
          // Optional: Fade out if scrolling WAY past? Usually not needed.
        },
        onEnterBack: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            rotationX: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "power3.out",
            overwrite: true
          });
        },
        onLeaveBack: (batch) => {
          // The "Reverse Animation" the user wants when moving footer -> nav
          gsap.to(batch, {
            opacity: 0,
            y: 50, // Move back down
            ...vars.from, // Reset other props (x, scale)
            stagger: 0.05,
            duration: 0.6,
            ease: "power2.in",
            overwrite: true
          });
        }
      });
    };

    const ctx = gsap.context(() => {
      // 1. Hero (Keep simple)
      gsap.fromTo(".hero-text > *",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out", delay: 0.1 }
      );

      // 2. About Cards
      animateBatch(".gsap-about-card", {
        from: { y: 30 } // Clean slide up
      });

      // 3. Everything Section - 3D Effect
      animateBatch(".gsap-everything-item", {
        from: { y: 40, scale: 0.9 }
      });

      // 4. Testimonials
      animateBatch(".gsap-testimonial-card", {
        from: { y: 60, scale: 0.9 }
      });

      // 5. Pricing Cards
      animateBatch(".gsap-pricing-card", {
        from: { y: 60, scale: 0.95 }
      });

      // 6. Contact Section
      if (sectionRefs.contact.current) {
        // Batch the children
        animateBatch(sectionRefs.contact.current.children, {
          from: { y: 30 }
        });
      }

    }); // End context

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      <LandingNavbar />
      <main>
        <HeroSection ref={sectionRefs.hero} />
        <AboutSection ref={sectionRefs.about} />
        <EverythingSection ref={sectionRefs.everything} />
        <TestimonialsSection ref={sectionRefs.testimonials} />
        <PricingSection ref={sectionRefs.pricing} />
        <section id="contact" ref={sectionRefs.contact} className="py-28 bg-white">
          <ContactSection />
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
