import React from 'react';
import HeroBanner from '/hero-banner.jpg';
import ThangkaLeft from '../assets/thangka-left.png';
import ThangkaRight from '../assets/thangka-right.png';
import Divider from '../components/Divider';
import ProductCards from '../components/ProductCards';
import Testimonials from '../components/Testimonials';
import Statistics from '../components/Statistics';

const HomePage = () => {
  const sampleProducts = [
    { id: 1, name: "Reduk Wheel of Life", price: 500, discount: 50, badge: "Out of Stock" },
    { id: 2, name: "Infinite Compassion Mandala", price: 350, discount: 15, badge: "Sale" },
    { id: 3, name: "Golden Tara Thangka", price: 1200, badge: "Limited" },
    { id: 4, name: "Medicine Buddha Healing Scroll", price: 450, discount: 10 },
    { id: 5, name: "White Mahakala Abundance", price: 800, badge: "New" },
    { id: 6, name: "Chenrezig Four-Armed Wisdom Hello World", price: 600, discount: 20, badge: "Sale" },
    { id: 7, name: "Chenrezig Four-Armed Wisdom Hello World", price: 600, discount: 20, badge: "Sale" },
    { id: 8, name: "Chenrezig Four-Armed Wisdom Hello World", price: 600, discount: 20, badge: "Sale" },
  ];

  const sampleTestimonials = [
    {
      quote: "I was worried about international shipping, but the packaging was superb. Seamless experience to London.",
      name: "Su sha",
      address: "Tibet, China"
    },
    {
      quote: "The quality of the Thangka is breathtaking. Truly a piece of art that brings peace to my meditation space.",
      name: "Emma Wright",
      address: "New York, USA"
    },
    {
      quote: "Deeply impressed by the colors and the detail. It's more than just a painting; it's a window into spiritual peace.",
      name: "Hiroshi Tanaka",
      address: "Kyoto, Japan"
    }
  ];

  return (
    <div className="bg-background flex flex-col gap-[32px]">
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
          <div className="flex flex-col md:flex-row items-center md:gap-24 mb-[32px] mt-[32px]">
            <div className="w-full md:w-1/2">
              <img
                src={ThangkaLeft}
                alt="Thangka Detail Deity"
                className="w-full h-auto object-cover shadow-2xl border-4 border-white/10"
              />
            </div>
            <div className="w-full md:w-1/2">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-light">
                The history of Thangka painting is a journey of spiritual devotion that spans over a millennium, originating in the high-altitude monasteries of the Himalayas. Emerging around the 7th to 11th centuries, this art form was a fusion of Indian, Nepalese, and Chinese aesthetic traditions. Originally developed as a nomadic teaching tool, Thangkas were designed as "scroll paintings" that could be easily rolled up and transported by traveling monks or nomadic tribes. This portability allowed the complex iconographies of the Buddha and various deities to be spread across the vast Tibetan Plateau and into the neighboring regions of the Silk Road.
              </p>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-light mt-4">
                As the tradition matured between the 14th and 18th centuries, distinct schools of Thangka art began to flourish, most notably the Menri, Khyenri, and Karma Gadri styles. These schools refined the use of pigments derived from ground precious minerals—such as lapis lazuli for blues, cinnabar for reds, and 24-carat gold for the divine radiance of the deities. The creation of a Thangka became a meditative ritual in itself; artists were required to follow strict proportions outlined in sacred texts (iconometry), ensuring that every line and curve held mathematical and spiritual significance. During this period, the influence of Chinese landscape painting became more evident, introducing ethereal clouds, flowing water, and mist-covered mountains into the background of the sacred figures.            </p>
            </div>
          </div>

          {/* Content Section 2: Text Left, Image Right */}
          <div className="flex flex-col-reverse md:flex-row items-center md:gap-24">
            <div className="w-full md:w-1/2">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-light">
                In the modern era, Thangkas have transitioned from strictly monastic tools to highly sought-after pieces of fine art, particularly within the Chinese and international collector communities. While the cultural revolution in the mid-20th century posed a significant threat to the preservation of these works, the tradition survived through dedicated lineages of masters in Nepal, India, and Bhutan. Today, Thangka art is recognized as a "living heritage," where ancient techniques are preserved to create windows into the divine. For a brand like Zhenkala, this history serves as the foundation, transforming a simple piece of fabric into a "precious treasure" that carries the weight of centuries of Buddhist philosophy and artistic mastery.            </p>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-light mt-4">
                In the modern era, Thangkas have transitioned from strictly monastic tools to highly sought-after pieces of fine art, particularly within the Chinese and international collector communities. While the cultural revolution in the mid-20th century posed a significant threat to the preservation of these works, the tradition survived through dedicated lineages of masters in Nepal, India, and Bhutan. Today, Thangka art is recognized as a "living heritage," where ancient techniques are preserved to create windows into the divine. For a brand like Zhenkala, this history serves as the foundation, transforming a simple piece of fabric into a "precious treasure" that carries the weight of centuries of Buddhist philosophy and artistic mastery.            </p>
            </div>
            <div className="w-full md:w-1/2">
              <img
                src={ThangkaRight}
                alt="Thangka Detail Landscape"
                className="w-full h-auto object-cover shadow-2xl border-4 border-white/10"
              />
            </div>
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

          <ProductCards products={sampleProducts} />
        </div>
      </div>
      <Divider />
      <div className="container bg-background reveal pop-up-scroll">
        <div>
          <h1
            className="text-center text-2xl md:text-4xl font-medium"
          >Happy Clients</h1>

          <Testimonials testimonials={sampleTestimonials} />

          <div className="flex flex-row justify-center text-primary items-center gap-2 bg-secondary py-[8px] px-[16px] rounded-md w-fit mx-auto cursor-pointer hover:bg-red-900 transition-all hover:scale-105 active:scale-95 duration-300">
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

      <div className="relative w-full overflow-hidden reveal pop-up-scroll">
        <img src="homepage-sillouete.png" alt="ZhenKala Silhouette" className="w-full h-auto object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20 flex items-center justify-center">
          <div className="w-[85%] md:w-[75%] mx-auto garamond text-white text-center text-4xl md:text-6xl font-medium leading-tight">
            "Turning sacred intention into hand-painted reality. The essence of Himalayan art."
          </div>
        </div>
      </div>

      <div className="container bg-primary flex flex-col md:flex-row items-center bg-white overflow-hidden reveal pop-up-scroll">
        <div className="w-full md:w-1/2">
          <img
            src="/homepage-silk-brocade.png"
            alt="Traditional Himalayan Silk Brocade"
            className="w-[70%] h-auto object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col items-center justify-center text-center space-y-8">
          <h2 className="text-2xl md:text-4xl text-[#333333] font-medium leading-[1.2]">
            Frame your Thangka with <br className="hidden md:block" /> Silk Brocade
          </h2>

          <p className="text-gray-400 text-md md:text-xl font-medium leading-relaxed max-w-lg">
            Complete your masterpiece with traditional Himalayan silk brocade. More than a frame, it is a gateway that elevates the artwork and honors its sacred lineage.
          </p>

          <div className="flex flex-row justify-center text-primary items-center gap-2 bg-secondary py-[12px] px-[24px] rounded-md w-fit cursor-pointer hover:bg-red-900 transition-all hover:scale-105 active:scale-95 duration-300 shadow-sm mt-4">
            <span className="font-medium">Explore Silk Options</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
