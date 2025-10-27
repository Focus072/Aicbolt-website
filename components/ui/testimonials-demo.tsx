'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TestimonialCard } from './testimonial-card';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO",
    company: "TechFlow",
    content: "AICBOLT transformed our customer support. Response times dropped by 80% and customer satisfaction increased dramatically. The AI handles complex queries with human-like understanding.",
    avatar: "",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Sales Director",
    company: "GrowthCorp",
    content: "Our sales team productivity increased by 300% after implementing AICBOLT's sales assistant. It qualifies leads perfectly and never misses an opportunity.",
    avatar: "",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Operations Manager",
    company: "ServicePro",
    content: "The automation capabilities are incredible. What used to take our team hours now happens in minutes. AICBOLT is a game-changer for any business.",
    avatar: "",
    rating: 5,
  },
  {
    name: "David Park",
    role: "Founder",
    company: "StartupXYZ",
    content: "As a small business, we couldn't afford a full support team. AICBOLT gave us enterprise-level customer service at a fraction of the cost.",
    avatar: "",
    rating: 5,
  },
  {
    name: "Lisa Thompson",
    role: "Marketing Director",
    company: "BrandBoost",
    content: "The AI agents understand our brand voice perfectly. Customers can't tell they're talking to AI. It's like having a team of experts available 24/7.",
    avatar: "",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "CTO",
    company: "InnovateLab",
    content: "Integration was seamless. The API is well-documented and the support team is fantastic. We had everything running in under a day.",
    avatar: "",
    rating: 5,
  },
];

export const TestimonialsSectionDemo: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000); // Slightly longer interval for better readability
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    // Restart auto-play after manual navigation
    stopAutoPlay();
    setTimeout(() => startAutoPlay(), 2000);
  };

  // Calculate which testimonials to show (3 at a time)
  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      visible.push({
        ...testimonials[index],
        index,
        isCenter: i === 1,
      });
    }
    return visible;
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 
          className="font-bold leading-[1.1] tracking-tight mx-auto mb-6 text-center
            text-[clamp(2.5rem,5vw+0.5rem,4rem)] 
            max-w-[90vw] sm:max-w-[28ch] md:max-w-[26ch] lg:max-w-[28ch]
            [text-wrap:balance]
            animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
          style={{ 
            fontFamily: "Satoshi, sans-serif", 
            fontWeight: 700,
            animationDelay: '100ms',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6)) drop-shadow(0 4px 16px rgba(0,0,0,0.4))'
          }}
        >
          What Our{' '}
          <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 bg-clip-text text-transparent font-extrabold drop-shadow-[0_2px_8px_rgba(251,146,60,0.3)]">
            Customers
          </span>
          {' '}Say
        </h2>
        <p 
          className="text-lg sm:text-xl lg:text-[1.375rem] 
                     leading-relaxed 
                     max-w-[46rem] mx-auto font-normal tracking-[-0.01em]"
          style={{
            lineHeight: '1.6',
            color: 'rgba(248, 250, 252, 0.9)',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          Join thousands of businesses that have transformed their operations with{' '}
          <span style={{ color: 'rgba(248, 250, 252, 1)' }}>AICBOLT's intelligent automation.</span>
        </p>
      </div>

      {/* Testimonials Carousel */}
      <div className="relative">
        {/* Testimonials Container */}
        <div className="flex items-center justify-center gap-6 px-16">
          {visibleTestimonials.map((testimonial, i) => (
            <div
              key={testimonial.index}
              className={`transition-all duration-700 ease-in-out ${
                testimonial.isCenter
                  ? 'scale-100 opacity-100 z-20'
                  : 'scale-90 opacity-70 z-10'
              }`}
              style={{
                transform: testimonial.isCenter ? 'none' : 'translateY(20px)',
              }}
            >
              <TestimonialCard {...testimonial} />
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-orange-400 scale-125'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};


