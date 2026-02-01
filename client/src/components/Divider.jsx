import React from 'react';
import MandalaDivider from '../assets/mandala-divider.png';
import './Divider.css';

const Divider = () => {
    return (
        <div className="w-full h-[48px] bg-secondary-light flex items-center overflow-hidden my-[32px] reveal pop-up-scroll"
            style={{ backgroundColor: "var(--color-secondary-light)" }}>
            <div
                className="w-full h-[32px] mandala-scroll"
                style={{
                    backgroundImage: `url(${MandalaDivider})`,
                    backgroundRepeat: 'repeat-x',
                    backgroundSize: 'auto 100%'
                }}
                aria-hidden="true"
            ></div>
        </div>
    );
};

export default Divider;
