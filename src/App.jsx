import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Lenis from '@studio-freight/lenis';
import { t } from './translations';

// --- Smooth Scroll Setup ---
const SmoothScroll = ({ children }) => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)), 
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false, // optimize for mobile
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);
  return children;
};

// --- Animations ---
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } 
  }
};

const maskReveal = {
  hidden: { clipPath: "inset(100% 0 0 0)" },
  visible: { 
    clipPath: "inset(0% 0 0 0)", 
    transition: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } 
  }
};

const AnimatedText = ({ text, className }) => {
  const words = text.split(" ");
  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      className={`flex flex-wrap justify-center overflow-hidden ${className}`}
    >
      {words.map((word, index) => (
        <span key={index} className="overflow-hidden pb-2 mr-[1.5%]">
          <motion.span 
            variants={{
              hidden: { y: "120%", rotateZ: 2 },
              visible: { y: 0, rotateZ: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }} 
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.div>
  );
};

// --- Magnetic Button ---
const MagneticButton = ({ children, className }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

function App() {
  const [lang, setLang] = useState('en');
  const txt = t[lang];
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const sliderRef = useRef(null);

  const baseUrl = import.meta.env.BASE_URL;
  const videos = [`${baseUrl}pexels.mp4`];
  const [currentVideo, setCurrentVideo] = useState(0);
  const [activeService, setActiveService] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <SmoothScroll>
      <div className="font-sans text-brand-dark bg-brand-bg relative selection:bg-brand-gold selection:text-white">
        
        {/* Header */}
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="absolute top-0 left-0 w-full pt-8 px-8 md:px-16 flex justify-between items-center z-50 mix-blend-difference text-white"
        >
          <div className="text-2xl font-sans font-bold tracking-widest uppercase">TKR</div>
          
          <nav className="hidden lg:flex space-x-12 text-[10px] font-medium tracking-[0.15em] uppercase text-white/90">
            {txt.nav.map((item, idx) => (
              <a key={item} href={`#${['servicios', 'portafolio', 'proceso', 'garantia', 'contacto'][idx]}`} className="hover:text-white transition-colors cursor-pointer">
                {item}
              </a>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              className="text-[10px] font-bold tracking-[0.15em] uppercase hover:text-brand-gold transition-colors"
            >
              {lang === 'en' ? 'ES' : 'EN'}
            </button>
            <button className="hidden md:flex bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 px-8 py-3 text-[10px] font-medium uppercase tracking-[0.15em] items-center gap-3 transition-all duration-300">
              {txt.quote} <span className="text-[14px] leading-none mb-[2px]">↗</span>
            </button>
          </div>
        </motion.header>

        {/* Hero Section - LAVILLA 1:1 */}
        <section className="relative h-screen min-h-[700px] w-full overflow-hidden">
          {/* Background Video Slideshow */}
          <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 bg-brand-dark overflow-hidden">
            <AnimatePresence initial={false}>
              <motion.video 
                key={currentVideo}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                src={videos[currentVideo]}
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover opacity-90"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10"></div>
          </motion.div>
          
          {/* Bottom Content Area */}
          <div className="absolute bottom-12 left-0 w-full px-8 md:px-16 z-10 flex flex-col xl:flex-row xl:items-end justify-between text-white">
            
            {/* Left: Massive Title */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col mb-12 xl:mb-0"
            >
              <h1 className="font-sans text-[4rem] md:text-[6rem] 2xl:text-[7.5rem] font-bold leading-[0.85] tracking-tight uppercase text-white shadow-black/50 drop-shadow-lg" dangerouslySetInnerHTML={{__html: txt.heroTitle}}></h1>
              <p className="font-sans text-lg md:text-2xl font-light mt-4 tracking-wide text-white/90 drop-shadow-md">
                {txt.heroSub}
              </p>
            </motion.div>

            {/* Right: Stats Row & Line */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-full xl:w-[45%] flex flex-col"
            >
              <div className="flex justify-between items-end mb-4">
                <div className="flex flex-col">
                  <span className="font-sans text-4xl md:text-5xl 2xl:text-6xl font-light tracking-tight">20+</span>
                  <span className="font-sans text-[10px] md:text-xs font-light tracking-widest text-white/70 mt-2 uppercase">{txt.stats.exp}</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline gap-1">
                    <span className="font-sans text-4xl md:text-5xl 2xl:text-6xl font-light tracking-tight">100</span>
                    <span className="font-sans text-xl font-light text-white/80">%</span>
                  </div>
                  <span className="font-sans text-[10px] md:text-xs font-light tracking-widest text-white/70 mt-2 uppercase">{txt.stats.qual}</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="font-sans text-4xl md:text-5xl 2xl:text-6xl font-light tracking-tight">30</span>
                  <span className="font-sans text-[10px] md:text-xs font-light tracking-widest text-white/70 mt-2 uppercase">{txt.stats.days}</span>
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full h-[1px] bg-white/30 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
                  className="absolute top-0 left-0 h-full bg-brand-gold"
                ></motion.div>
              </div>
            </motion.div>
          </div>
          
          {/* Subtle gold gradient over the video for luxury feel */}
          <div className="absolute inset-0 bg-brand-gold/10 mix-blend-overlay pointer-events-none z-10"></div>
        </section>

        {/* About Section */}
        <section id="sobre-nosotros" className="py-32 px-8 max-w-7xl mx-auto overflow-hidden">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10%" }}
              variants={maskReveal}
              className="relative h-[600px] group overflow-hidden shadow-2xl"
            >
              <motion.img 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                src={`${baseUrl}luxury_kitchen_hero_1789399050729.jpg`} 
                alt="Luxury kitchen design" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10%" }}
              variants={staggerContainer}
            >
              <motion.h2 variants={fadeUp} className="font-sans font-bold text-5xl md:text-6xl mb-8 text-brand-dark tracking-tighter uppercase">{txt.aboutTitle}</motion.h2>
              <div className="text-brand-gray font-light text-lg leading-relaxed space-y-6 mb-12">
                <motion.p variants={fadeUp}>{txt.aboutP1}</motion.p>
                <motion.p variants={fadeUp}>{txt.aboutP2}</motion.p>
              </div>
              <motion.div variants={fadeUp}>
                <MagneticButton className="bg-brand-dark hover:bg-black text-white text-[11px] font-semibold uppercase tracking-[0.15em] py-4 px-10 transition-colors">
                  NUESTRO EQUIPO
                </MagneticButton>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Services Section - Sticky Content Switch */}
        <section id="servicios" className="bg-white relative">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row relative items-start">
            
            {/* Left Side: Sticky Text */}
            <div className="w-full md:w-1/2 sticky top-0 h-auto min-h-[40vh] md:h-screen flex flex-col justify-center px-8 z-10 bg-white md:bg-transparent pt-12 pb-8 md:pt-0 border-b border-gray-100 md:border-none shadow-sm md:shadow-none">
              <motion.h2 
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="font-sans font-bold text-5xl md:text-6xl mb-8 md:mb-12 tracking-tighter uppercase text-brand-dark"
              >
                {txt.servicesTitle}
              </motion.h2>
              <div className="relative min-h-[16rem] md:h-40 w-full flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeService}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <h3 className="font-serif text-2xl md:text-3xl mb-4 text-brand-gold">
                      {txt.services[activeService].title}
                    </h3>
                    <p className="text-brand-gray text-base md:text-lg font-light leading-relaxed">
                      {txt.services[activeService].desc}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Right Side: Scrolling Images */}
            <div className="w-full md:w-1/2 flex flex-col pb-[10vh] md:pb-[20vh] pt-0">
              {[
                `${baseUrl}tkr_kitchen_1789402302768.jpg`,
                `${baseUrl}tkr_bathroom_1789402326467.jpg`,
                `${baseUrl}tkr_cabinets_1789402377926.jpg`,
                `${baseUrl}tkr_design_1789402410806.jpg`
              ].map((img, idx) => (
                <motion.div
                  key={idx}
                  className="h-[65vh] md:h-screen flex items-center justify-center px-8 mb-10 md:mb-0"
                  onViewportEnter={() => setActiveService(idx)}
                  viewport={{ amount: 0.4, margin: "-30% 0px -30% 0px" }}
                >
                  <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden shadow-2xl">
                    <img src={img} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" alt={`Especialidad ${idx}`} />
                  </div>
                </motion.div>
              ))}
            </div>
            
          </div>
        </section>

        {/* Portfolio Section */}
        <section id="portafolio" className="py-32 px-8 bg-brand-bg relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            variants={staggerContainer}
            className="max-w-7xl mx-auto"
          >
            <motion.h2 variants={fadeUp} className="font-sans font-bold text-5xl md:text-6xl text-center mb-16 tracking-tighter uppercase text-brand-dark">{txt.portfolioTitle}</motion.h2>
            
            <motion.div variants={fadeUp} className="flex justify-between text-[11px] font-bold uppercase tracking-[0.2em] mb-6 px-4 text-brand-gray">
              <span>{txt.portfolioBefore}</span>
              <span>{txt.portfolioAfter}</span>
            </motion.div>
            
            <motion.div variants={fadeUp} className="relative h-[70vh] min-h-[500px] shadow-2xl overflow-hidden rounded-sm" id="ba-slider" ref={sliderRef}>
              <img src="https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2074&auto=format&fit=crop" alt="Before Remodel" className="absolute inset-0 w-full h-full object-cover grayscale-[50%]" />
              <motion.div 
                className="absolute inset-0 overflow-hidden border-l-2 border-white"
                style={{ width: '50%' }}
                id="slider-after-container"
              >
                <img src={`${baseUrl}luxury_kitchen_hero_1789399050729.jpg`} alt="After Remodel" className="absolute top-0 left-0 h-full object-cover" style={{ width: '100vw', maxWidth: 'none' }} id="slider-after-img" />
              </motion.div>
              <motion.div 
                className="slider-handle group" 
                id="slider-handle"
                drag="x"
                dragConstraints={sliderRef}
                dragElastic={0}
                dragMomentum={false}
                style={{ left: '50%', x: '-50%' }}
                onDrag={(e, info) => {
                  if(!sliderRef.current) return;
                  const rect = sliderRef.current.getBoundingClientRect();
                  let percentage = ((info.point.x - rect.left) / rect.width) * 100;
                  percentage = Math.max(0, Math.min(percentage, 100));
                  
                  const handle = document.getElementById('slider-handle');
                  const container = document.getElementById('slider-after-container');
                  if(handle) handle.style.left = `${percentage}%`;
                  if(container) container.style.width = `${percentage}%`;
                }}
              >
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg text-brand-dark transform transition-transform group-hover:scale-110 group-active:scale-95">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6M9 18l6-6-6-6"/></svg>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Testimonials */}
        <section id="testimonios" className="py-32 px-8 bg-white text-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.h2 variants={fadeUp} className="font-sans font-bold text-5xl md:text-6xl mb-12 tracking-tighter uppercase text-brand-dark">{txt.testimonialsTitle}</motion.h2>
            
            <motion.div variants={fadeUp} className="text-brand-gold mb-8">
              <svg className="w-16 h-16 mx-auto opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
            </motion.div>
            
            <motion.p variants={fadeUp} className="font-serif text-2xl md:text-3xl italic leading-relaxed text-brand-dark mb-20 px-4">
              {txt.testimonialQuote}
            </motion.p>
            
            <motion.div variants={staggerContainer} className="flex justify-center items-center gap-8 md:gap-20">
              {[
                { name: 'Familia Gómez', img: '11', main: false },
                { name: 'Roberto & Ana', img: '47', main: true },
                { name: 'Carlos R.', img: '12', main: false }
              ].map((person, i) => (
                <motion.div 
                  key={i} 
                  variants={fadeUp} 
                  className={`text-center transition-all duration-500 cursor-pointer ${person.main ? 'scale-110' : 'opacity-50 hover:opacity-100 hover:scale-100'}`}
                >
                  <img src={`https://i.pravatar.cc/150?img=${person.img}`} alt={person.name} className={`rounded-full mx-auto mb-4 object-cover ${person.main ? 'w-24 h-24 border-2 border-brand-gold p-1 shadow-xl' : 'w-16 h-16'}`} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-dark">{person.name}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Contact Section */}
        <section id="contacto" className="py-32 px-8 bg-brand-bg">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20"
          >
            <motion.div variants={fadeUp}>
              <h2 className="font-sans font-bold text-5xl md:text-6xl mb-8 tracking-tighter uppercase text-brand-dark">{txt.contactTitle}</h2>
              <p className="text-brand-gray font-light text-lg">{txt.contactSub}</p>
            </motion.div>
            
            <motion.form variants={fadeUp} className="space-y-10 bg-white p-12 shadow-2xl">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gray mb-3">{txt.formName}</label>
                  <input type="text" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-brand-gold bg-transparent transition-colors text-sm" placeholder={txt.formName} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gray mb-3">{txt.formType}</label>
                  <select className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-brand-gold bg-transparent text-gray-500 transition-colors text-sm">
                      <option>{txt.formTypeOptions[0]}</option>
                      <option>{txt.formTypeOptions[1]}</option>
                      <option>{txt.formTypeOptions[2]}</option>
                      <option>{txt.formTypeOptions[3]}</option>
                    </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gray mb-3">{txt.formZip}</label>
                <input type="text" className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-brand-gold bg-transparent transition-colors text-sm" placeholder={txt.formZip} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-brand-gray mb-3">{txt.formMsg}</label>
                <textarea className="w-full border-b border-gray-200 py-3 focus:outline-none focus:border-brand-gold bg-transparent h-24 resize-none transition-colors text-sm" placeholder={txt.formMsg}></textarea>
              </div>
              <MagneticButton className="bg-brand-dark hover:bg-black text-white text-[11px] font-semibold uppercase tracking-[0.15em] py-5 px-10 w-full mt-4 transition-colors">
                {txt.formSubmit}
              </MagneticButton>
              <a href="https://wa.me/13056886595" target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white text-[11px] font-semibold uppercase tracking-[0.15em] py-5 px-10 w-full transition-colors rounded-none">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {txt.formWhatsapp}
              </a>
            </motion.form>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="bg-brand-dark text-white py-24 px-8 relative overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            <div className="col-span-1">
              <div className="text-4xl font-sans font-bold tracking-widest uppercase mb-4">TKR</div>
              <p className="text-white/60 font-light text-sm mt-8">{txt.footerBio}</p>
              <p className="text-white/40 text-[11px] mt-16 uppercase tracking-widest">&copy; 2026 TKR Kitchen Remodeling LLC.<br/>{txt.footerRights}</p>
            </div>
            <div className="col-span-1">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-8 text-white/50">{txt.footerNav}</h4>
              <ul className="space-y-4 font-light text-sm text-white/80">
                <li><a href="#sobre-nosotros" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                <li><a href="#servicios" className="hover:text-white transition-colors">Especialidades</a></li>
                <li><a href="#portafolio" className="hover:text-white transition-colors">Portafolio</a></li>
              </ul>
            </div>
            <div className="col-span-1">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-8 text-white/50">{txt.footerContact}</h4>
              <ul className="space-y-4 font-light text-sm text-white/80">
                <li>Hialeah, FL</li>
                <li>Tel: (305) 688-6595</li>
                <li>info@tkrkitchenremodeling.com</li>
              </ul>
            </div>
            <div className="col-span-1">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-8 text-white/50">{txt.footerSocial}</h4>
              <div className="flex space-x-6">
                <a href="https://www.facebook.com/people/TKR-Kitchen-Remodeling-LLC/61586359961092/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          {/* Subtle gold accent in footer */}
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[100px]"></div>
        </footer>
      </div>
      </SmoothScroll>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/13056886595" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-8 right-8 z-[100] bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </>
  );
}

export default App;
