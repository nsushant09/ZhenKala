import React from 'react';

const Statistics = () => {
    const stats = [
        {
            number: "30+",
            content: "A dedicated collective of highly skilled painters and craftsmen, each trained in the rigorous iconometrics of traditional Nepalese art."
        },
        {
            number: "500+",
            content: "A curated legacy of over 500 unique Thangkas and handicrafts that now grace homes, altars, and galleries worldwide."
        },
        {
            number: "15+",
            content: "From grinding mineral pigments to 24K gold application, we preserve the traditional methods passed down through generations of master artisans."
        },
        {
            number: "100%",
            content: "Every piece is a labor of patience and meditation, ensuring that the spiritual essence of Nepal is captured in every brushstroke."
        }
    ];

    return (
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 mt-[32px]">
            {stats.map((stat, index) => (
                <React.Fragment key={index}>
                    <div className="flex-1 px-6 text-center md:text-left">
                        <h2 className="garamond text-7xl md:text-8xl text-secondary mb-4 leading-none">
                            {stat.number}
                        </h2>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed font-medium">
                            {stat.content}
                        </p>
                    </div>
                    {index < stats.length - 1 && (
                        <div className="hidden md:block w-[1px] bg-gray-300 self-center h-24 opacity-60"></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Statistics;
