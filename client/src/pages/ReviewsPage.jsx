import React, { useState, useEffect } from 'react';
import Testimonials from '../components/Testimonials';
import Divider from '../components/Divider';
import api from '../services/api';

const ReviewsPage = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const { data } = await api.get('/testimonials');
                setTestimonials(data);
            } catch (error) {
                console.error('Failed to fetch testimonials:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonials();
    }, []);

    return (
        <div className="bg-background min-h-screen pb-12">
            {/* Hero Section */}
            <section className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-secondary mb-12">
                <img
                    src="/about-us-header.jpg"
                    alt="Client Reviews"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
                <div className="relative z-10 text-center text-white reveal active">
                    <h1 className="font-secondary text-5xl md:text-7xl lg:text-8xl mb-2 garamond">Client Reviews</h1>
                    <p className="text-primary text-lg tracking-widest uppercase opacity-90">Voices of our Community</p>
                </div>
            </section>

            <div className="container mx-auto px-4">
                <div className="text-center mb-12 hidden">
                    <h1 className="text-3xl md:text-5xl garamond font-medium mb-6">
                        Client Reviews
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Hear from our collectors and practitioners about their experience with Zhenkala thangkas and ritual items.
                    </p>
                </div>

                <Divider />

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
                    </div>
                ) : (
                    <div className="">
                        {testimonials.length > 0 ? (
                            <Testimonials testimonials={testimonials} />
                        ) : (
                            <p className="text-center text-gray-500 py-12">No reviews yet.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewsPage;
