import React from 'react';
import { FiTruck, FiGlobe, FiFastForward, FiBox } from 'react-icons/fi';
import Divider from '../components/Divider';

const DeliveryPage = () => {
    return (
        <div className="bg-background pb-24">
            {/* Hero Section */}
            <section className="h-[40vh] bg-secondary flex items-center justify-center relative overflow-hidden text-white">
                <div
                    className="absolute inset-0 bg-[url('/delivery-page.jpg')] bg-cover bg-center"
                    aria-hidden="true"
                ></div>

                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>

                <div className="relative z-10 text-center reveal active">
                    <h1 className="garamond text-4xl md:text-5xl lg:text-7xl mb-2">Safe & Sacred Passage</h1>
                    <p className="text-lg md:text-xl opacity-90 tracking-widest px-4">Global Fulfillment from the Heart of the Himalayas</p>
                </div>

            </section>

            {/* Philosophy Section */}
            <section className="py-16 md:py-24 text-center bg-primary">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto reveal">
                        <h2 className="font-primary text-3xl md:text-4xl text-secondary mb-6 garamond">Our Commitment to Your Piece</h2>
                        <p className="text-md md:text-lg text-gray-700 leading-relaxed">
                            As a premier destination for authentic Himalayan sacred art, ZhenKala ensures that every
                            handcrafted item—from delicate silk brocades to masterfully painted Thangkas—is treated
                            with the utmost reverence. We maintain a curated, ready-to-ship inventory, allowing us
                            to offer boutique artisan pieces at direct-to-consumer value without the long wait.
                            Our team oversees every step of the journey, ensuring a swift and secure passage from
                            our workshop to your doorstep.
                        </p>
                    </div>
                </div>
            </section>

            <Divider />

            {/* Logistics Section */}
            <section className="mt-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 md:gap-12">
                        {/* Shipping Intelligence Card */}
                        <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center reveal">
                            <div className="space-y-8">
                                <div className="flex gap-4 md:gap-6">
                                    <FiFastForward className="text-2xl md:text-3xl text-secondary shrink-0 mt-1" />
                                    <div className="method-text">
                                        <h4 className="font-semibold text-lg mb-1 text-on-background">Express Courier (Small & Medium Items)</h4>
                                        <p className="text-gray-600 text-[15px] leading-relaxed">For single items and smaller artifacts, we prioritize premium courier services to ensure rapid delivery and end-to-end tracking.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 md:gap-6">
                                    <FiBox className="text-2xl md:text-3xl text-secondary shrink-0 mt-1" />
                                    <div className="method-text">
                                        <h4 className="font-semibold text-lg mb-1 text-on-background">Specialized Cargo (Collector & Large Orders)</h4>
                                        <p className="text-gray-600 text-[15px] leading-relaxed">For larger sculptures or wholesale quantities, we coordinate specialized Air Cargo or Sea/Ocean container shipments for maximum security.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 md:gap-6">
                                    <FiGlobe className="text-2xl md:text-3xl text-secondary shrink-0 mt-1" />
                                    <div className="method-text">
                                        <h4 className="font-semibold text-lg mb-1 text-on-background">Global Logistics Oversight</h4>
                                        <p className="text-gray-600 text-[15px] leading-relaxed">Upon receipt of payment, our logistics team initiates the dispatch protocol, choosing the most efficient route based on your location and the art's fragile nature.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing Card */}
                        <div className="bg-secondary text-white p-8 md:p-12 rounded-xl flex flex-col justify-center text-center shadow-xl reveal reveal-delay-2">
                            <FiTruck className="text-5xl md:text-6xl mb-6 mx-auto opacity-90" />
                            <h3 className="font-secondary text-2xl md:text-3xl mb-4">Worldwide Shipping</h3>
                            <div className="my-6">
                                <span className="text-5xl md:text-6xl font-medium garamond">$15.00</span>
                                <span className="block text-sm opacity-80 uppercase tracking-widest mt-2">Standard Global Flat Rate</span>
                            </div>
                            <p className="text-sm opacity-80 mb-8 max-w-xs mx-auto">Applicable for sacred art acquisitions between <br /> $1.00 – $100.00</p>

                            <div className="bg-white/10 border border-dashed border-white/40 p-6 rounded-lg">
                                <p className="font-semibold text-lg mb-1 uppercase tracking-wider">Complimentary Passage</p>
                                <p className="text-sm opacity-90">Free Shipping on all orders over $100 USD Worldwide</p>
                            </div>
                        </div>
                    </div>

                    {/* Courier Partners */}
                    <div className="mt-24 text-center reveal">
                        <h4 className="uppercase tracking-[3px] text-xs font-bold  mb-4">Trusted Logistics Partners</h4>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            <span className="font-bold text-md md:text-lg tracking-tighter">DHL Express</span>
                            <span className="font-bold text-md md:text-lg tracking-tighter">ARAMEX</span>
                            <span className="font-bold text-md md:text-lg tracking-tighter">UPS</span>
                            <span className="font-bold text-md md:text-lg tracking-tighter">NEPAL POST</span>
                            <span className="font-bold text-md md:text-lg tracking-tighter">AU POST</span>
                            <span className="font-bold text-md md:text-lg tracking-tighter">SF EXPRESS</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DeliveryPage;
