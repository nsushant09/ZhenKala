import React, { useState } from 'react';
import { FiChevronDown, FiPlus, FiMinus } from 'react-icons/fi';

const AccordionItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className="border-b border-gray-100 last:border-none">
            <button
                className="w-full py-6 flex items-center justify-between text-left group transition-all"
                onClick={onClick}
                aria-expanded={isOpen}
            >
                <span className={`text-lg md:text-xl font-medium transition-colors duration-300 ${isOpen ? 'text-secondary' : 'text-on-background group-hover:text-secondary'}`}>
                    {question}
                </span>
                <span className={`shrink-0 ml-4 p-1 rounded-full transition-all duration-300 ${isOpen ? 'bg-secondary text-white rotate-180' : 'bg-primary/30 text-secondary'}`}>
                    <FiChevronDown size={20} />
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100 pb-8' : 'max-h-0 opacity-0'}`}
            >
                <div className="text-gray-600 leading-relaxed prose prose-sm md:prose-base max-w-none prose-p:my-2 prose-li:my-1">
                    {answer}
                </div>
            </div>
        </div>
    );
};

const FAQPage = () => {
    const [openIndex, setOpenIndex] = useState(0); // Open first one by default

    const faqCategories = [
        {
            title: "Singing Bowls",
            subtitle: "Sacred Harmonics & Purity",
            items: [
                {
                    question: "How do I awake the voice of my singing bowl?",
                    answer: "Resonating a singing bowl is a mindfulness practice in itself. Generally, bowls are played with wooden or leather-wrapped mallets. The size of the mallet is carefully chosen to match the bowl's diameter for optimal resonance. You can let the bowl rest upon its silk cushion or hold it gently in your palm. To release its voice, slowly glide the mallet along the outer rim with steady pressure, allowing the vibrations to build into a pure, harmonic tone."
                },
                {
                    question: "How do I preserve the purity of my bowl?",
                    answer: "Your singing bowl should be treated with the same reverence as a sacred relic. Keep it in a dry, stable environment to prevent dust buildup and accidental damage. Avoid all harsh chemicals, bleaches, or acidic cleansers. For daily care, simply wipe with a soft, lint-free cloth. To remove fingerprints, a slightly dampened cloth or paper is sufficient. For a deeper cleanse, you may briefly soak the bowl in warm water with a touch of mild detergent or a drop of fresh lime juice, followed by a thorough drying."
                },
                {
                    question: "What is included in my Singing Bowl set?",
                    answer: (
                        <ul className="list-disc pl-5">
                            <li>1 x Hand-selected Singing Bowl</li>
                            <li>1 x Hand-sewn Silk Cushion</li>
                            <li>1 x Custom-sized Wooden or Leather Mallet</li>
                            <li>1 x Specialized Felt Mallet (included with premium and larger selections)</li>
                        </ul>
                    )
                },
                {
                    question: "What are the spiritual benefits of Singing Bowls?",
                    answer: "Singing bowls are windows to deep relaxation and healing. Regular practice can reduce stress, clear the mind of anxiety, and harmonize the body's chakras. The frequencies generated interact with the brain's theta waves, fostering clarity, intuition, and improved circulation."
                }
            ]
        },
        {
            title: "Thangka Art",
            subtitle: "Sacred Lineage & Preservation",
            items: [
                {
                    question: "What is the significance of acquiring a Thangka?",
                    answer: "A Thangka is far more than a painting; it is a sacred scroll created on cotton canvas through a meditative and labor-intensive process. Each piece is hand-painted by master artisans who possess deep knowledge of Buddhist lineage, rituals, and history. We use authentic pigments—including real gold powder, mineral dust, and floral extracts—ensuring each Thangka is a timeless piece of spiritual art."
                },
                {
                    question: "What determines the value of a Thangka?",
                    answer: "The value of a Thangka is rooted in the skill of the master artist and the intricacy of the detail rather than its physical size. A smaller piece with microscopic detail can often be more precious than a larger one. Factors include the purity of the gold used, the complexity of the deity’s iconometry, and the years of experience held by the artisan."
                },
                {
                    question: "Where is this sacred art created?",
                    answer: "All our Thangkas are born in the heart of Nepal. Our workshop has a rich heritage, having produced monumental Thangkas for monasteries worldwide. Our artisans range from dedicated apprentices to grandmasters with over 50 years of experience."
                },
                {
                    question: "Can I request a Traditional Silk Brocade frame?",
                    answer: "Yes. We offer traditional silk mounting (Brocade) for those seeking an authentic Himalayan aesthetic. This process involves building frames from the outside in (outer, inner, and innermost frames) along with specialized curtains and ribbons. This traditional mounting is often more affordable and portable than glass framing, and it protects the painting's integrity. Please contact our curators at info@zhenkala.com to discuss your custom silk preferences."
                },
                {
                    question: "How do I care for my Thangka painting?",
                    answer: (
                        <div className="space-y-4">
                            <p>Thangkas are made of organic materials sensitive to the environment:</p>
                            <ul className="list-disc pl-5">
                                <li><strong>Storage:</strong> Never fold a Thangka; always roll it loosely if it is not framed.</li>
                                <li><strong>Environment:</strong> Keep your art away from moisture, direct sunlight, and open flames.</li>
                                <li><strong>Handling:</strong> Avoid frequent rolling and unrolling to prevent pigment flaking and ground separation.</li>
                            </ul>
                        </div>
                    )
                }
            ]
        },
        {
            title: "Global Passage",
            subtitle: "Logistics & Fulfillment",
            items: [
                {
                    question: "Which carriers do you use for shipping?",
                    answer: "We partner with premier global logistics providers including DHL Express, FedEx, SF Express, and Aramex to ensure your items reach you safely and swiftly."
                },
                {
                    question: "How does the fulfillment process work?",
                    answer: "Upon completing your acquisition, you will receive a confirmation email. Once our curators have prepared and dispatched your order, a secondary notification containing your tracking details will follow. Please note that shipping fees are non-refundable in the event of a return."
                },
                {
                    question: "Do you offer international delivery?",
                    answer: "Indeed, ZhenKala serves collectors worldwide. Shipping costs are calculated based on your location and will be added during the checkout process."
                }
            ]
        }
    ];

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <div className="bg-background pb-24">
            {/* Hero Section */}
            <section className="h-[40vh] bg-secondary flex items-center justify-center relative overflow-hidden text-white">
                <div
                    className="absolute inset-0 bg-[url('/faq.jpg')] bg-cover bg-center"
                    aria-hidden="true"
                ></div>

                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>

                <div className="relative z-10 text-center reveal active">
                    <h1 className="font-secondary text-4xl md:text-5xl lg:text-6xl mb-2 garamond">Frequently Asked Questions</h1>
                    <p className="text-sm md:text-base opacity-90 tracking-widest uppercase px-4">Explore our guide to the artisan techniques, spiritual histories,<br /> and curatorial care of our collection.</p>
                </div>
            </section>

            <div className="container max-w-4xl mx-auto px-4 mt-24">
                <div className="">
                    {faqCategories.map((category, catIndex) => (
                        <section key={catIndex} className="reveal">
                            <div className="mb-8 pl-4 border-l-2 border-secondary/20 mt-16">
                                <h3 className="text-2xl md:text-3xl font-secondary text-secondary garamond">{category.title}</h3>
                                <p className="text-xs uppercase tracking-[3px] text-gray-400 mt-1">{category.subtitle}</p>
                            </div>

                            <div className="bg-white rounded-sm border border-gray-100 shadow-sm px-6 md:px-10">
                                {category.items.map((item, itemIndex) => {
                                    const globalIndex = `${catIndex}-${itemIndex}`;
                                    return (
                                        <AccordionItem
                                            key={itemIndex}
                                            question={item.question}
                                            answer={item.answer}
                                            isOpen={openIndex === globalIndex}
                                            onClick={() => toggleAccordion(globalIndex)}
                                        />
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default FAQPage;
