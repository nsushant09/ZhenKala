import React, { useState } from 'react';
import { FiMail, FiMapPin, FiPhone, FiCheckCircle } from 'react-icons/fi';
import ThangkaImage from '/contact-us-left.jpg';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            console.log('Sending message to: nsushant21@tbc.edu.np', formData);
            setIsSubmitting(false);
            setSubmitted(true);
            setFormData({ firstName: '', lastName: '', email: '', message: '' });
        }, 1500);
    };

    return (
        <div className="bg-background">
            {/* Split Screen Section using shared CSS theme */}
            <div className="split-screen-container">
                <div className="split-image-side">
                    <img src={ThangkaImage} alt="Sacred Himalayan Art" />
                    <div className="split-image-overlay"></div>
                </div>

                <div className="split-form-side">
                    <div className="form-card-container reveal active">
                        {submitted ? (
                            <div className="success-feedback-centered">
                                <FiCheckCircle />
                                <h2 className="garamond">Message Sent</h2>
                                <p>Thank you for reaching out. We've received your inquiry and will get back to you shortly.</p>
                                <button className="text-secondary font-semibold underline mt-4" onClick={() => setSubmitted(false)}>
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="form-header">
                                    <h1 className="garamond">Contact Us.</h1>
                                    <p>Connect with our curators for inquiries and custom pieces.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="auth-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="firstName">First Name</label>
                                            <input
                                                type="text"
                                                id="firstName"
                                                name="firstName"
                                                className="form-control"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                required
                                                placeholder="John"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="lastName">Last Name</label>
                                            <input
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                className="form-control"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                required
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className="form-control"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="john@example.com"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="message">Message</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            className="form-control"
                                            rows="5"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            placeholder="How can we assist you today?"
                                            style={{ minHeight: '120px', resize: 'vertical' }}
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn-form-primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Find Us Section */}
            <section className="py-24 bg-primary border-t border-secondary/10">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <div className="reveal active">
                            <h2 className="font-secondary text-4xl text-on-background mb-12 garamond">Find Our Showroom</h2>

                            <div className="space-y-12">
                                <div className="flex gap-6">
                                    <FiMapPin className="text-2xl text-secondary shrink-0 mt-1" />
                                    <div className="info-text">
                                        <h4 className="font-semibold text-base text-on-background mb-1 uppercase tracking-wide">Workshop Location</h4>
                                        <p className="text-gray-700 leading-relaxed">Artisans Workshop, Boudhanath Stupa Area</p>
                                        <p className="text-gray-700 leading-relaxed">Kathmandu, Nepal</p>
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <FiMail className="text-2xl text-secondary shrink-0 mt-1" />
                                    <div className="info-text">
                                        <h4 className="font-semibold text-base text-on-background mb-1 uppercase tracking-wide">Email Support</h4>
                                        <a href="mailto:nsushant21@tbc.edu.np" className="text-gray-700 hover:text-secondary transition-colors">nsushant21@tbc.edu.np</a>
                                        <p className="text-gray-700 leading-relaxed">Inquiries & Custom Commissions</p>
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <FiPhone className="text-2xl text-secondary shrink-0 mt-1" />
                                    <div className="info-text">
                                        <h4 className="font-semibold text-base text-on-background mb-1 uppercase tracking-wide">Call or WhatsApp</h4>
                                        <p className="text-gray-700 leading-relaxed">+977 123456789 (Local Workshop)</p>
                                        <p className="text-gray-700 leading-relaxed">+61 400 000 000 (Operations Support)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="reveal active h-[400px] rounded-xl overflow-hidden shadow-xl border-4 border-white lg:sticky lg:top-24">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.0833215233157!2d85.3582490150619!3d27.7215174827877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1bda4415ad9b%3A0x19a00762fa22776c!2sBoudhanath%20Stupa!5e0!3m2!1sen!2snp!4v1650000000000!5m2!1sen!2snp"
                                style={{ border: 0 }}
                                className="w-full h-full grayscale-[0.2] sepia-[0.2]"
                                allowFullScreen=""
                                loading="lazy"
                                title="Boudhanath Stupa Area, Kathmandu"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactPage;
