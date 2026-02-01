import React from 'react';
import Testimonial from './Testimonial';

const Testimonials = ({ testimonials = [] }) => {
    if (!testimonials || testimonials.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-8 justify-center py-12">
            {testimonials.map((t, index) => (
                <Testimonial
                    key={index}
                    quote={t.quote}
                    name={t.name}
                    address={t.address}
                />
            ))}
        </div>
    );
};

export default Testimonials;
