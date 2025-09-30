/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */

"use client";

import { useEffect, useRef } from "react";
import { FiCalendar, FiHeart, FiUsers, FiClock, FiAward, FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import gsap from "gsap";

export default function LandingPage() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const setSectionRef = (index: number) => (el: HTMLElement | null) => {
    sectionsRef.current[index] = el;
  };

  useEffect(() => {
    gsap.fromTo(
      sectionsRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.3,
        ease: "power3.out",
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl mr-3">
                <FiHeart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  HealthPal
                </h1>
                <p className="text-sm text-gray-600">Your Health, Our Priority</p>
              </div>
            </div>
            <div className="hidden md:flex gap-8 text-gray-700 font-medium">
              <a href="#services" className="hover:text-blue-600 transition-colors duration-200">
                Services
              </a>
              <a href="#doctors" className="hover:text-blue-600 transition-colors duration-200">
                Doctors
              </a>
              <a href="#facilities" className="hover:text-blue-600 transition-colors duration-200">
                Facilities
              </a>
              <a href="#testimonials" className="hover:text-blue-600 transition-colors duration-200">
                Testimonials
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/login" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                Login
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={setSectionRef(0)}
        className="relative py-24 overflow-hidden"
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2089&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-600/90"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 fade-in">
              Welcome to <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">HealthPal</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 fade-in stagger-1 max-w-3xl mx-auto">
              Experience world-class healthcare with our state-of-the-art facilities and expert medical professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section
        id="services"
        ref={setSectionRef(1)}
        className="py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Our Healthcare Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive medical care with cutting-edge technology and compassionate professionals
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: <FiUsers size={40} />, 
                title: "Patient Management", 
                description: "Comprehensive patient care coordination with personalized treatment plans and seamless appointment scheduling.",
                image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
              },
              { 
                icon: <FiCalendar size={40} />, 
                title: "Smart Appointments", 
                description: "AI-powered scheduling system that optimizes your time and ensures you get the care you need when you need it.",
                image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"                
              },
              { 
                icon: <FiHeart size={40} />, 
                title: "Quality Care", 
                description: "Evidence-based medicine delivered with compassion by our team of board-certified specialists and caregivers.",
                image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",                
              },
              
            ].map((service, i) => (
              <div
                key={i}
                className={`group card p-8 hover:shadow-2xl transition-all duration-300 animate-card fade-in stagger-${(i % 3) + 1}`}
              >
                <div className="relative mb-6 overflow-hidden rounded-xl">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent"></div>
                </div>
                <div className="flex items-center justify-center mb-4 text-blue-600">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section id="doctors" ref={setSectionRef(2)} className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Meet Our Expert Doctors
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Board-certified physicians dedicated to providing exceptional care with years of experience and specialized training
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Sarah Johnson",
                specialty: "Cardiology",
                experience: "15+ years",
                image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                description: "Leading cardiologist specializing in interventional procedures and heart disease prevention."
              },
              {
                name: "Dr. Michael Chen",
                specialty: "Neurology",
                experience: "12+ years", 
                image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                description: "Expert neurologist focusing on stroke treatment and neurological rehabilitation."
              },
              {
                name: "Dr. Emily Rodriguez",
                specialty: "Pediatrics",
                experience: "10+ years",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                description: "Dedicated pediatrician providing comprehensive care for children and adolescents."
              }
            ].map((doctor, index) => (
              <div
                key={index}
                className={`group card p-8 hover:shadow-2xl transition-all duration-300 animate-card fade-in stagger-${index + 1}`}
              >
                <div className="relative mb-6 overflow-hidden rounded-xl">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent"></div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{doctor.name}</h3>
                  <div className="flex items-center justify-center mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 mr-2">
                      {doctor.specialty}
                    </span>
                    <span className="text-sm text-gray-500">{doctor.experience}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{doctor.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section ref={setSectionRef(4)} className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Healthcare Excellence in Numbers
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Trusted by thousands of patients and families for exceptional medical care
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "20+", label: "Doctors", icon: <FiUsers size={32} /> },
              { number: "25+", label: "Medical Specialists", icon: <FiHeart size={32} /> },
              { number: "24/7", label: "Emergency Care", icon: <FiClock size={32} /> },
              { number: "25", label: "Record Capacity", icon: <FiAward size={32} /> }
            ].map((stat, index) => (
              <div
                key={index}
                className={`text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 fade-in stagger-${index + 1}`}
              >
                <div className="flex justify-center mb-4 text-white">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
            {/* Testimonials */}
      <section id="testimonials" ref={setSectionRef(5)} className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              What Our Patients Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from real patients who trust us with their health and well-being
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                feedback: "The care I received was exceptional. The doctors were thorough, compassionate, and explained everything clearly. I felt truly cared for during my entire treatment.",
                patient: "Sarah Mitchell",
                treatment: "Cardiac Surgery",
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b105?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                rating: 5
              },
              {
                feedback: "From the moment I walked in, the staff made me feel comfortable. The facilities are modern and clean, and the medical team is incredibly professional.",
                patient: "James Rodriguez",
                treatment: "Orthopedic Care",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                rating: 5
              },
              {
                feedback: "As a parent, finding the right care for my child was crucial. The pediatric team here is amazing - they made my daughter feel safe and comfortable throughout her treatment.",
                patient: "Maria Garcia",
                treatment: "Pediatric Care",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className={`card p-8 hover:shadow-2xl transition-all duration-300 animate-card fade-in stagger-${index + 1}`}
              >
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.patient}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.patient}</h3>
                    <p className="text-sm text-gray-600">{testimonial.treatment}</p>
                    <div className="flex mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 italic leading-relaxed">
                  "                  &ldquo;{testimonial.feedback}&rdquo;"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

  

      {/* Contact Section */}
      <section ref={setSectionRef(6)} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to experience exceptional healthcare? Contact us today to schedule your appointment
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8 fade-in stagger-1">
              <div className="card p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mr-4">
                      <FiPhone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Emergency Hotline</p>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mr-4">
                      <FiMail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <p className="text-gray-600">info@healthpal.com</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl mr-4">
                      <FiMapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Address</p>
                      <p className="text-gray-600">123 Healthcare Ave, Medical District, MD 12345</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="fade-in stagger-2">
              <div className="card p-8 text-center">
                <div className="mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                    alt="Medical team"
                    className="w-full h-48 object-cover rounded-xl mb-6"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-8">
                  Join thousands of patients who trust HealthPal for their healthcare needs. 
                  Schedule your appointment today and experience the difference.
                </p>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl mr-3">
                  <FiHeart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">HealthPal</h3>
              </div>
              <p className="text-gray-400">
                Your trusted healthcare partner, providing exceptional medical care with compassion and excellence.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#doctors" className="hover:text-white transition-colors">Doctors</a></li>
                <li><a href="#facilities" className="hover:text-white transition-colors">Facilities</a></li>
                <li><a href="/login" className="hover:text-white transition-colors">Patient Portal</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Emergency Care</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Diagnostic Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Specialty Care</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preventive Medicine</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Emergency: +1 (555) 123-4567</li>
                <li>info@healthpal.com</li>
                <li>123 Healthcare Ave</li>
                <li>Medical District, MD 12345</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">© 2025 HealthPal Hospital. All rights reserved. Version - 2.0.2</p>
            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
