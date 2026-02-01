import React from 'react';
import AboutHeroImg from '/about-us-header.jpg';
const StoryImg = '/about-us-story.jpg';
import Divider from '../components/Divider';

const AboutPage = () => {
  const team = [
    {
      name: "Avisekh Dhakal",
      role: "CEO & Creative Director",
      image: "file:///Users/home/.gemini/antigravity/brain/04afb0b5-842d-4de2-8bce-02b1f4f73a66/team_member_1_utsab_png_1769947798411.png"
    },
    {
      name: "Aman Mahato",
      role: "Technical Lead",
      image: "file:///Users/home/.gemini/antigravity/brain/04afb0b5-842d-4de2-8bce-02b1f4f73a66/team_member_2_sushant_png_1769947814123.png"
    },
    {
      name: "Sushant Neupane",
      role: "Lead Artisan",
      image: "file:///Users/home/.gemini/antigravity/brain/04afb0b5-842d-4de2-8bce-02b1f4f73a66/team_member_3_artisan_png_1769947830642.png"
    },
    {
      name: "Utsab Sapkota",
      role: "Operations Manager",
      image: "https://ui-avatars.com/api/?name=Tashi+Dorje&background=A52A2A&color=fff&size=400"
    }
  ];

  return (
    <div className="bg-background pb-24">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-secondary">
        <img
          src={AboutHeroImg}
          alt="Sacred Thangka Art"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50"></div>
        <div className="relative z-10 text-center text-white reveal active">
          <h1 className="font-secondary text-5xl md:text-7xl lg:text-8xl mb-2 garamond">Our Journey</h1>
          <p className="text-primary text-lg tracking-widest uppercase opacity-90">Ancient Wisdom for a Modern World</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-primary text-center" id="mission">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto reveal">
            <span className="text-secondary uppercase tracking-[2px] font-bold text-sm mb-4 block">Our Mission</span>
            <h2 className="font-secondary text-3xl md:text-5xl leading-tight text-on-background mb-8 garamond">
              Bridging the gap between ancient Himalayan heritage and modern aesthetic consciousness.
            </h2>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed md:px-12">
              At ZhenKala, our mission is to preserve and promote the sacred arts of the Himalayas.
              We believe that these centuries-old traditions hold timeless beauty and spiritual
              significance that can enrich our modern lives. By collaborating directly with master
              artisans, we ensure that every piece tells a story of devotion, precision, and
              cultural identity.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      {/* Story Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 md:gap-24 items-center">
            <div className="relative rounded-xl overflow-hidden shadow-2xl reveal">
              <img src={StoryImg} alt="Artisan at work" className="w-full h-auto block" />
            </div>
            <div className="reveal">
              <span className="text-secondary uppercase tracking-[2px] font-bold text-sm mb-4 block">Who We Are</span>
              <h2 className="font-secondary text-4xl text-secondary mb-6 garamond">A Vision Born in the Heart of the Himalayas</h2>
              <div className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  We are a young group of guys driven by a shared passion for the rich cultural
                  tapestry of Nepal and the surrounding Himalayan regions. What started as a
                  simple appreciation for Thangka painting and metalwork grew into a movement
                  to safeguard these declining art forms.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Our team blends traditional respect with innovative thinking. We travel
                  directly to remote workshops, sit with the artisans, and work hand-in-hand
                  to bring these limited-edition masterpieces to a global audience. For us,
                  ZhenKala is more than a business—it's a spiritual commitment to the
                  hands that create beauty.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-primary">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 reveal">
            <h2 className="font-secondary text-4xl md:text-5xl text-on-background relative inline-block pb-3 garamond">
              Meet Our Team
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-secondary mb-2"></span>
            </h2>
            <p className="text-gray-600 mt-4">The visionaries behind ZhenKala</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {team.map((member, index) => (
              <div key={index} className={`text-center transition-all duration-300 hover:scale-105 p-4 reveal reveal-delay-${index + 1}`}>
                <div className="w-full aspect-[4/5] rounded-sm mb-6 overflow-hidden border border-gray-200 p-2 bg-white shadow-sm">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover rounded-[2px]" />
                </div>
                <h3 className="font-primary text-2xl font-medium text-on-background mb-1">{member.name}</h3>
                <p className="text-secondary font-medium text-[13px] uppercase tracking-[1.5px]">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
