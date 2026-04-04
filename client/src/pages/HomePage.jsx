import React, { useState, useEffect } from 'react';
import HeroBanner from '/hero-banner.jpg';
import ThangkaLeft from '../assets/thangka-left.png';
import ThangkaRight from '../assets/thangka-right.png';
import Divider from '../components/Divider';
import ProductCards from '../components/ProductCards';
import Testimonials from '../components/Testimonials';
import Statistics from '../components/Statistics';
import api from '../services/api';

import { useShop } from '../context/ShopContext';

const HomePage = () => {
  const { artisanProducts } = useShop();
  // No local fetch needed, Context handles caching.

  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data } = await api.get('/testimonials?limit=3');
        setTestimonials(data);
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <div className="bg-background flex flex-col gap-[32px] mb-8">
      <div className="container bg-background min-h-screen flex flex-wrap flex-col gap-[32px] reveal pop-up-scroll">
        {/* Hero Banner */}
        <div className="w-full relative overflow-hidden mt-[16px]">
          <img
            src={HeroBanner}
            alt="Thangka Art Banner"
            className="w-full h-[60vh] object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="gap-[32px]">
          {/* Title Section */}
          <div>
            <h1
              className="text-center garamond text-3xl md:text-5xl  mb-6"
            >"A Millennium in Motion:</h1>
            <h1
              className="text-center garamond text-3xl md:text-5xl  mb-6"
            >The Living History of Thangka"</h1>
          </div>

          {/* Content Section 1: Image Left, Text Right */}
          <div className="mb-[32px] mt-[32px] overflow-hidden">
            <div className="w-full md:w-1/2 md:float-left md:mr-12 mb-8 md:mb-4">
              <img
                src={ThangkaLeft}
                alt="Thangka Detail Deity"
                className="w-full h-auto md:h-[500px] object-cover  border-4 border-white/10"
              />
            </div>
            <p className="text-md md:text-lg text-gray-700 leading-relaxed">
              The history of Thangka painting began over a millennium ago in the high-altitude monasteries of the Himalayas, emerging between the 7th and 11th centuries. This art form was born from a unique fusion of Indian, Nepalese, and Chinese aesthetic traditions, specifically designed to serve as a nomadic teaching tool for the spread of Buddhism. Because they were crafted as "scroll paintings" on silk or cotton, Thangkas could be easily rolled up and transported by traveling monks across the rugged Tibetan Plateau. This inherent portability allowed complex iconographies of the Buddha and various deities to reach remote regions along the Silk Road, turning every campsite into a temporary sanctuary for spiritual reflection and education.
            </p>
            <p className="text-md md:text-lg text-gray-700 leading-relaxed mt-4">
              As the tradition matured between the 14th and 18th centuries, it evolved into a highly sophisticated discipline with the rise of distinct schools like the Menri, Khyenri, and Karma Gadri styles. During this golden age, artists refined the use of pigments derived from ground precious minerals, including lapis lazuli for deep blues and cinnabar for vibrant reds, often accented with 24-carat gold. The creation process was treated as a meditative ritual governed by "iconometry," a system of strict mathematical proportions outlined in sacred texts. This era also saw the introduction of Chinese landscape elements, where ethereal clouds and mist-covered mountains began to frame the central divine figures in a harmonious blend of styles.
            </p>
          </div>

          {/* Content Section 2: Text Left, Image Right */}
          <div className="mb-[32px] overflow-hidden">
            <div className="w-full md:w-1/2 md:float-right md:ml-12 mb-8 md:mb-4">
              <img
                src={ThangkaRight}
                alt="Thangka Detail Landscape"
                className="w-full h-auto md:h-[500px] object-cover  border-4 border-white/10"
              />
            </div>
            <p className="text-md md:text-lg text-gray-700 leading-relaxed">
              The mid-20th century brought significant challenges to the preservation of Thangka art, as political shifts and the Cultural Revolution threatened many traditional monastic practices. However, the lineage of these sacred works survived through the dedication of master artists who migrated to and settled within Nepal, India, and Bhutan. These practitioners ensured that the oral instructions and technical secrets of the craft were not lost to time, maintaining the spiritual integrity of the art form during a period of great upheaval. By protecting these ancient methods, they allowed Thangka painting to remain a "living heritage" that bridges the gap between historical Buddhist philosophy and the modern world.
            </p>
            <p className="text-md md:text-lg text-gray-700 leading-relaxed mt-4">
              In the modern era, Thangkas have transitioned from strictly monastic tools into highly sought-after pieces of fine art valued by international collectors and spiritual seekers alike. While they are now displayed in galleries and private homes, they retain their status as "precious treasures" that embody centuries of artistic mastery and devotion. Brands today often draw upon this deep historical foundation to ensure that every contemporary piece respects the traditional techniques of the past. By honoring the weight of Buddhist history, modern Thangka painting continues to function as a window into the divine, transforming simple fabric into a profound vessel for ancient wisdom and timeless beauty.
            </p>
          </div>

        </div>

      </div>
      <Divider />
      <div className="container bg-background reveal pop-up-scroll">
        <div>
          <h1
            className="text-center text-2xl md:text-4xl mb-4 font-medium text-secondary"
          >The Artisan's Selection</h1>
          <h1
            className="text-center text-lg md:text-2xl font-medium"
          >Limited-Time Studio Offerings</h1>

          <ProductCards products={artisanProducts || []} />
        </div>
      </div>
      <Divider />
      <div className="container bg-background reveal pop-up-scroll">
        <div>
          <h1
            className="text-center text-2xl md:text-4xl font-medium"
          >Happy Clients</h1>

          <Testimonials testimonials={testimonials} />

          <div
            onClick={() => window.location.href = '/reviews'}
            className="flex flex-row justify-center text-primary items-center gap-2 bg-secondary py-[8px] px-[16px] rounded-md w-fit mx-auto cursor-pointer hover:bg-red-900 transition-all hover:scale-105 active:scale-95 duration-300"
          >
            <span>View all Reviews</span>
            <span><img src="/ArrowRight.svg" width={16} height={16} alt="" className="brightness-0 invert" /></span>
          </div>

        </div>
      </div>
      <div className="container bg-background py-16 reveal pop-up-scroll">
        <h1
          className="text-center text-2xl md:text-4xl font-medium w-[70%] md:w-[50%] mx-auto leading-relaxed"
        >We are here to translate your spiritual aspirations into authentic, hand-painted masterpieces.</h1>

        <Statistics />

      </div>

      <div className="relative h-[350px] w-full overflow-hidden reveal pop-up-scroll">
        <img src="homepage-sillouete.png" alt="ZhenKala Silhouette" className="w-full h-full object-contain object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20 flex items-center justify-center">
          <div className="w-[85%] md:w-[75%] mx-auto garamond text-white text-center text-4xl md:text-6xl font-medium leading-tight">
            "Turning sacred intention into hand-painted reality. The essence of Himalayan art."
          </div>
        </div>
      </div>

      <div class="container flex flex-col md:flex-row bg-primary overflow-hidden reveal pop-up-scroll justify-center items-center">

        
        <div class="w-full md:w-1/2 flex justify-center items-center">
          <img
            src="/homepage-silk-brocade.png"
            alt="Traditional Himalayan Silk Brocade"
            class="w-[70%] h-auto object-cover"
          />
        </div>

        
        <div class="w-full md:w-1/2  flex flex-col justify-center items-center text-center p-8 md:p-16 space-y-8">

          <h2 class="text-2xl  md:text-4xl text-[#333333] font-medium leading-[1.2]">
            Frame your Thangka with <br class="hidden md:block"/>
              Silk Brocade
          </h2>

          <p class="text-gray-400  text-md md:text-xl font-medium leading-relaxed max-w-lg">
            Complete your masterpiece with traditional Himalayan silk brocade.
            More than a frame, it is a gateway that elevates the artwork and
            honors its sacred lineage.
          </p>

          <div class="flex items-center  gap-2 bg-secondary py-[12px] px-[24px] rounded-md w-fit cursor-pointer hover:bg-red-900 transition-all hover:scale-105 active:scale-95 duration-300 shadow-sm mt-4">
            <span class="font-medium text-primary">Explore Silk Options</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default HomePage;
