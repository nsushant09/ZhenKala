import React from 'react';
import MandalaDivider from '../assets/mandala-divider.png';
import './Divider.css';

const Divider = () => {
    return (
        <div className="w-full h-[36px] bg-secondary-light flex items-center overflow-hidden my-[16px] reveal pop-up-scroll"
            style={{ backgroundColor: "var(--color-secondary-light)" }}>
            <div
                className="w-full h-[24px] mandala-scroll"
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
