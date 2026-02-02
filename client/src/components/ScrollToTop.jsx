import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [pathname]);

    useEffect(() => {
        const handleLinkClick = (e) => {
            const link = e.target.closest('a');
            if (link && link.pathname === window.location.pathname && !link.hash) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        };

        window.addEventListener('click', handleLinkClick);
        return () => window.removeEventListener('click', handleLinkClick);
    }, []);

    return null;
};

export default ScrollToTop;
