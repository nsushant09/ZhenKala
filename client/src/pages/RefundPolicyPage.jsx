import React from 'react';

const RefundPolicyPage = () => {
    return (
        <div className="bg-background pb-24">
            {/* Hero Section */}
            <section className="h-[40vh] bg-secondary flex items-center justify-center relative overflow-hidden text-white">
                <div
                    className="absolute inset-0 bg-[url('/return-refund.jpg')] bg-cover bg-center"
                    aria-hidden="true"
                ></div>

                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>

                <div className="relative z-10 text-center reveal active">
                    <h1 className="font-secondary text-4xl md:text-5xl lg:text-6xl mb-2 garamond">Refund & Return Policy</h1>
                    <p className="text-sm md:text-base opacity-90 tracking-widest uppercase px-4">Our Commitment to Your Satisfaction</p>
                </div>
            </section>

            <div className="container max-w-4xl px-4 mx-auto">
                <div className="prose prose-lg max-w-none text-gray-700 reveal pt-12">
                    <p className="my-8 border-l-4 border-primary pl-6 py-2 bg-primary/30">
                        Our ultimate goal is your complete fulfillment and resonance with the sacred art you acquire.
                        Should your piece not align with your expectations, we welcome your valuable feedback
                        to help us serve our community of collectors better.
                    </p>

                    <section className="mb-12">
                        <h2 className="font-secondary text-3xl text-secondary mb-6 garamond pb-2 border-b border-gray-100">Sacred Returns & Harmonious Exchanges</h2>
                        <p className="mb-6">
                            Returns will be gracefully accepted, and credit or refunds provided, only when the following conditions are met:
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold">1</div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-1 text-on-background">Pristine Condition</h3>
                                    <p className="text-gray-600">Items must be returned in the exact original condition in which they were dispatched from our workshop.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold">2</div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-1 text-on-background">Timely Notification</h3>
                                    <p className="text-gray-600">Please notify our curators of your intention to return within <span className="font-bold underline decoration-primary decoration-2 underline-offset-4">48 hours</span> of receiving your delivery.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold">3</div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-1 text-on-background">Return Window</h3>
                                    <p className="text-gray-600">Returned items must be received at our workshop within <span className="font-bold underline decoration-primary decoration-2 underline-offset-4">12 days</span> of the original delivery date.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold">4</div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-1 text-on-background">Collector Responsibility</h3>
                                    <p className="text-gray-600 mb-2">
                                        The collector is responsible for all shipping and handling charges and assumes full responsibility
                                        for the item's safe return. We recommend professional packing and insurance as essential precautions
                                        for these sacred artifacts.
                                    </p>
                                    <p className="text-gray-600 font-semibold border-l-2 border-primary pl-3 bg-primary/10 py-1">
                                        Please note: Original shipping costs are non-refundable and will be deducted from your total refund amount.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-gray-50 border-l-4 border-gray-200 italic text-sm text-gray-500">
                            Note: If a returned item does not meet the criteria outlined above, it will be returned to you at your expense.
                        </div>
                    </section>

                    <section className="mb-12">
                        <h2 className="font-secondary text-3xl text-secondary mb-6 garamond pb-2 border-b border-gray-100">Refund Pathway & Compensation</h2>
                        <p className="mb-6">
                            Before initiating a return, please connect with our curators via email at
                            <a href="mailto:contact.zhenkala@gmail.com" className="text-secondary font-semibold hover:underline ml-1">contact.zhenkala@gmail.com</a>.
                        </p>

                        <div className="bg-primary/10 p-8 rounded-sm border border-primary/20">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4">Refund Compensation Policy</h3>
                            <ul className="space-y-4 text-gray-700">
                                <li className="flex gap-3">
                                    <span className="text-secondary font-bold">•</span>
                                    <span><strong>Shipping Fees:</strong> For orders where a $15 shipping fee was paid, this amount is non-refundable as it covers the original dispatch logistics.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-secondary font-bold">•</span>
                                    <span><strong>Free Delivery Compensation:</strong> If your order was eligible for free shipping, a flat rate of <strong>$30</strong> will be deducted from the original purchase price to compensate for the initial logistics and handling costs incurred by ZhenKala.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-secondary font-bold">•</span>
                                    <span><strong>Return Postage:</strong> For non-faulty goods, the cost of return postage and tracking remains the sole responsibility of the collector.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-secondary font-bold">•</span>
                                    <span><strong>Processing Time:</strong> Upon receiving and inspecting the goods at our workshop, your refund (minus applicable shipping deductions) will be processed via your original payment method within <span className="font-bold whitespace-nowrap">14 working days</span>.</span>
                                </li>
                            </ul>
                        </div>
                    </section>


                </div>
            </div>
        </div>
    );
};

export default RefundPolicyPage;
