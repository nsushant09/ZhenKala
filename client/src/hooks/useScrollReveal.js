import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollReveal = () => {
    const location = useLocation();

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const handleIntersect = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else {
                    entry.target.classList.remove('active');
                }
            });
        };

        // Delay execution slightly to ensure DOM has updated after navigation
        const timer = setTimeout(() => {
            const observer = new IntersectionObserver(handleIntersect, observerOptions);
            const revealElements = document.querySelectorAll('.reveal');

            revealElements.forEach(el => {
                // Ensure initial state is clean for new pages
                el.classList.remove('active');
                observer.observe(el);
            });

            return () => {
                revealElements.forEach(el => observer.unobserve(el));
                observer.disconnect();
            };
        }, 100);

        return () => clearTimeout(timer);
    }, [location.pathname]); // Re-run when the path changes
};

export default useScrollReveal;
