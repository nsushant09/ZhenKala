import React from 'react';

const PrivacyPolicyPage = () => {
    return (
        <div className="bg-background pb-24">
            {/* Hero Section */}
            <section className="h-[40vh] bg-secondary flex items-center justify-center relative overflow-hidden text-white">
                <div
                    className="absolute inset-0 bg-[url('/privacy.jpg')] bg-cover bg-center"
                    aria-hidden="true"
                ></div>

                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>

                <div className="relative z-10 text-center reveal active">
                    <h1 className="font-secondary text-4xl md:text-5xl lg:text-6xl mb-2 garamond">Privacy Statement</h1>
                    <p className="text-sm md:text-base opacity-90 tracking-widest uppercase px-4">Your Trust, Our Responsibility</p>
                </div>
            </section>

            <div className="container max-w-4xl">
                <div className="prose prose-lg max-w-none text-gray-700 reveal">
                    <p className="my-8 border-l-4 border-primary pl-6 py-2 bg-primary/30">
                        At ZhenKala, we are committed to safeguarding the digital sanctuary of our collectors.
                        This statement outlines how your personal information is treated with the same reverence
                        as the sacred art we provide.
                    </p>

                    <section className="mb-12">
                        <h2 className="font-secondary text-3xl text-secondary mb-6 garamond pb-2 border-b border-gray-100">Section 1 - Collection of Information</h2>
                        <p className="mb-4">
                            When you acquire a piece from our collection, we collect the personal information essential to
                            the fulfillment process, such as your name, delivery address, and email address.
                        </p>
                        <p>
                            While browsing our digital gallery, we automatically receive your computer’s internet protocol (IP)
                            address. This data helps us understand your technological environment (browser and operating system)
                            to ensure our artisan details are rendered perfectly for your screen.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="font-secondary text-3xl text-secondary mb-6 garamond pb-2 border-b border-gray-100">Section 2 - Informed Consent</h2>
                        <h3 className="text-xl font-semibold mb-3 uppercase tracking-wide text-sm">How is consent obtained?</h3>
                        <p className="mb-6">
                            When you provide information to complete a transaction, verify a payment method, or arrange for
                            a sacred art delivery, we imply that you consent to our collecting and using it for that
                            specific purpose only.
                        </p>
                        <h3 className="text-xl font-semibold mb-3 text-on-background uppercase tracking-wide text-sm">Withdrawing Consent</h3>
                        <p>
                            Should you change your mind after opting in, you may withdraw your consent for us to contact you
                            or for the continued collection of your information at any time. Please contact our
                            Privacy Compliance Officer at <a href="mailto:info@zhenkala.com" className="text-secondary underline underline-offset-4">info@zhenkala.com</a>.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="font-secondary text-3xl text-secondary mb-6 garamond pb-2 border-b border-gray-100">Section 3 - Disclosure</h2>
                        <p>
                            We treat your information as a private trust. We may only disclose your personal information if
                            required by global law to do so or if our Terms of Service are fundamentally violated.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="font-secondary text-3xl text-secondary mb-6 garamond pb-2 border-b border-gray-100">Section 4 - Our Infrastructure</h2>
                        <p className="mb-4">
                            The ZhenKala platform is built on a custom, secure infrastructure designed for high-performance
                            and data integrity. Your data is stored within our encrypted databases, protected by industry-standard
                            firewalls and security protocols.
                        </p>
                        <h3 className="text-xl font-semibold mb-3 text-on-background uppercase tracking-wide text-sm">Payment Security</h3>
                        <p>
                            All direct payment gateways utilized by ZhenKala adhere to the standards set by PCI-DSS as
                            managed by the PCI Security Standards Council—a joint effort of global brands like Visa,
                            MasterCard, and American Express. These requirements ensure the secure handling of sensitive
                            payment data by our store and its service providers.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="font-secondary text-3xl text-secondary mb-6 garamond pb-2 border-b border-gray-100">Section 5 - Third-Party Partnerships</h2>
                        <p className="mb-4">
                            In general, our trusted third-party partners (such as logistics and payment processors)
                            will only collect and use your information to the extent necessary to perform the services
                            they provide to us.
                        </p>
                        <p>
                            However, these providers have their own independent privacy policies. We recommend reading
                            their documentation to understand how your personal information will be handled during
                            cross-border transactions or specialized clearings.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="font-secondary text-3xl text-secondary mb-6 garamond pb-2 border-b border-gray-100">Section 6 - Security Commitment</h2>
                        <p>
                            To protect your data, we take rigorous precautions and follow international best practices.
                            Sensitive information, such as payment details, is encrypted using secure socket layer
                            technology (SSL) and stored with AES-256 encryption.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="font-secondary text-3xl text-secondary mb-6 garamond pb-2 border-b border-gray-100">Section 7 - Digital Cookies</h2>
                        <p className="mb-4">
                            ZhenKala uses essential cookies to enhance your experience, manage your artisan cart,
                            and analyze gallery performance. These small data files allow our system to remember
                            your preferences during your visit to our workshop.
                        </p>
                        <p>You may choose to opt-out of cookies through your browser settings, though this may impact
                            the functionality of certain interactive features in our gallery.</p>
                    </section>

                    {/* Questions & Contact Section - Standardized with About Us aesthetic */}
                    <section className="py-16 mt-16 border-t border-gray-100 reveal active">
                        <div className="text-center mb-12">
                            <h2 className="font-secondary text-3xl md:text-4xl text-on-background relative inline-block pb-3 garamond">
                                Questions & Contact
                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-secondary"></span>
                            </h2>
                            <p className="text-gray-600 mt-4">Our curators are at your service for any privacy inquiries.</p>
                        </div>

                        <div className="max-w-xl mx-auto p-10 rounded-sm bg-primary/30 text-center border border-primary">
                            <p className="font-bold text-secondary uppercase tracking-[2px] text-xs mb-4">Privacy Compliance Officer</p>
                            <p className="text-xl text-on-background mb-2 garamond">ZhenKala</p>
                            <a href="mailto:info@zhenkala.com" className="text-2xl text-secondary hover:underline transition-all garamond  font-medium">info@zhenkala.com</a>

                            <div className="mt-8 pt-8 border-t border-secondary/10 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                Effective February 2026
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
