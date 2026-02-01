import React from 'react';

const Testimonial = ({ quote, name, address }) => {
    return (
        <div className="bg-[#FCF9EC] w-[400px] h-[300px] p-8 flex flex-col justify-between rounded-md transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-default">
            {/* Quote Icon */}
            <div>
                <img src="/QuoteBox.png" width={32} height={32} alt="Quote" />
            </div>

            {/* Description / Quote Text */}
            <div className="flex-grow flex items-center">
                <p className="text-md md:text-lg text-gray-700  leading-relaxed">
                    {quote}
                </p>
            </div>

            {/* Author Info */}
            <div className="mt-4">
                <h4 className="garamond text-xl text-gray-900 font-medium leading-none">{name}</h4>
                <p className="text-gray-400 text-sm mt-1">{address}</p>
            </div>
        </div>
    );
};

export default Testimonial;
