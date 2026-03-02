import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Info, Phone, MapPin, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STREAM_URL = "https://stream.radioparadise.com/aac-320";
const WHATSAPP_NUMBER = "5577981082004";
const PHONE_DISPLAY = "+55 77 98108-2004";

const Marquee = ({ text, className }: { text: string, className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && measureRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = measureRef.current.offsetWidth;
        setIsOverflowing(textWidth > containerWidth);
      }
    };
    
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  return (
    <div ref={containerRef} className={`w-full overflow-hidden flex items-center justify-center relative ${className}`}>
      {/* Hidden measurement element */}
      <span 
        ref={measureRef} 
        className="absolute opacity-0 pointer-events-none whitespace-nowrap px-4"
        aria-hidden="true"
      >
        {text}
      </span>

      {isOverflowing ? (
        <div className="w-full flex justify-start">
          <motion.div
            className="flex w-max"
            animate={{ x: "-50%" }}
            transition={{ 
              repeat: Infinity, 
              ease: "linear", 
              duration: Math.max(10, text.length * 0.5) 
            }}
          >
            <span className="whitespace-nowrap px-8">{text}</span>
            <span className="whitespace-nowrap px-8">{text}</span>
          </motion.div>
        </div>
      ) : (
        <span className="truncate px-4 block w-full text-center">
          {text}
        </span>
      )}
    </div>
  );
};

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [metadata, setMetadata] = useState({
    title: "Programação Ao Vivo",
    artist: "A rádio que mais toca você!",
    cover: "https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?q=80&w=1000&auto=format&fit=crop"
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showSlogan, setShowSlogan] = useState(false);
  
  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && !showInfo) {
      setShowInfo(true);
    }
    
    if (isRightSwipe && showInfo) {
      setShowInfo(false);
    }
  };

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sloganTimer = setInterval(() => {
      setShowSlogan(prev => !prev);
    }, 5000);
    return () => clearInterval(sloganTimer);
  }, []);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Use local proxy to avoid CORS issues
        const response = await fetch('/api/now-playing');
        const data = await response.json();
        if (data && data.title) {
          setMetadata({
            title: data.title,
            artist: data.artist,
            cover: data.cover || "https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?q=80&w=1000&auto=format&fit=crop"
          });
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };

    fetchMetadata();
    const interval = setInterval(fetchMetadata, 10000);
    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    }
  };

  useEffect(() => {
    // Attempt to auto-play if permitted, but usually requires interaction
    // audioRef.current?.play().catch(() => setIsPlaying(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 lg:flex lg:items-center lg:justify-center lg:p-4 overflow-hidden relative">
      {/* Background Elements for atmosphere */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <audio ref={audioRef} src={STREAM_URL} preload="none" />

      <div 
        className="fixed inset-0 w-full h-full lg:relative lg:inset-auto lg:w-auto lg:h-full lg:aspect-[9/19.5] lg:max-h-[95vh] bg-slate-900/80 backdrop-blur-xl lg:border lg:border-white/10 lg:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        
        {/* Status Bar Mockup */}
        <div className="flex justify-between items-center px-6 py-4 md:px-8 md:py-6 text-2xl font-medium text-white/60 shrink-0 z-20">
          <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowInfo(false)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-current transition-all duration-300 ${!showInfo ? 'bg-white scale-110' : 'bg-transparent hover:bg-white/20'}`}
              aria-label="Ir para Player"
            />
            <button 
              onClick={() => setShowInfo(true)}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-current transition-all duration-300 ${showInfo ? 'bg-white scale-110' : 'bg-transparent hover:bg-white/20'}`}
              aria-label="Ir para Informações"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showInfo ? (
            <motion.div 
              key="player"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center w-full px-4 pb-8 pt-2 md:px-8 md:pb-12"
            >
              {/* Header */}
              <div className="text-center shrink-0 w-full flex flex-col items-center justify-center py-2">
                <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight">Alternativa</h1>
                <div className="relative w-full flex items-center justify-center mt-3 h-20 md:h-24">
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={showSlogan ? "slogan" : "frequency"}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.5 }}
                      className={`absolute w-full text-center text-emerald-400 font-medium uppercase opacity-80 tracking-widest px-2 ${
                        showSlogan 
                          ? "text-2xl md:text-4xl leading-tight" 
                          : "text-5xl md:text-7xl"
                      }`}
                    >
                      {showSlogan ? "A rádio que mais toca você!" : "104,9 FM"}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* Visualizer / Logo Area - Dynamic Size */}
              <div className="relative w-full flex-1 flex items-center justify-center min-h-0 py-4">
                <div className="relative h-full max-h-[30vh] aspect-square flex items-center justify-center">
                  {/* Animated Rings */}
                  {isPlaying && (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-[ping_3s_linear_infinite]" />
                      <div className="absolute inset-4 rounded-full border-2 border-emerald-500/50 animate-[ping_3s_linear_infinite_1s]" />
                    </>
                  )}
                  
                  {/* Main Circle */}
                  <div className="relative w-full h-full rounded-full bg-gradient-to-b from-slate-800 to-slate-950 bg-no-repeat bg-center border-4 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)] flex items-center justify-center overflow-hidden group">
                    <img 
                      src={metadata.cover}
                      alt="Capa do Álbum"
                      className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay transition-all duration-1000 pointer-events-none select-none"
                    />
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <span className="text-6xl font-black text-white/90 tracking-tighter"></span>
                      <span className="text-emerald-400 font-bold text-sm uppercase tracking-widest mt-1"></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section Wrapper */}
              <div className="w-full flex flex-col items-center gap-6 md:gap-8 shrink-0 mt-auto">
                
                {/* Now Playing Info */}
                <div className="text-center w-full overflow-hidden px-2">
                  <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xl md:text-2xl font-bold uppercase tracking-wider mb-4">
                    <span className={`w-5 h-5 rounded-full bg-emerald-500 ${isPlaying ? 'animate-pulse' : ''}`} />
                    {isPlaying ? 'No Ar Agora' : 'Aperte o Play'}
                  </div>
                  <Marquee text={metadata.title} className="text-5xl md:text-7xl font-semibold text-white mb-3" />
                  <Marquee text={metadata.artist} className="text-slate-400 text-3xl md:text-4xl" />
                </div>

                {/* Volume Control */}
                <div className="w-full max-w-[340px] md:max-w-[320px] flex items-center gap-6 text-slate-400">
                  <button onClick={toggleMute} className="hover:text-white transition-colors p-2">
                    {isMuted || volume === 0 ? <VolumeX size={48} /> : <Volume2 size={48} />}
                  </button>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-4 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
                  />
                </div>

                {/* Main Controls Pill */}
                <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-4 flex items-center justify-between gap-4 mb-6">
                  <button 
                    onClick={() => setShowInfo(true)}
                    className="w-24 h-24 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Info size={48} />
                  </button>

                  <button 
                    onClick={togglePlay}
                    className="w-36 h-36 rounded-full bg-white text-emerald-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10 -my-10 z-10"
                  >
                    {isPlaying ? <Pause size={72} fill="currentColor" /> : <Play size={72} fill="currentColor" className="ml-2" />}
                  </button>

                  <a 
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-24 h-24 rounded-full flex items-center justify-center text-slate-300 hover:text-[#25D366] hover:bg-white/10 transition-all"
                  >
                    <MessageCircle size={48} />
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="info"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col px-6 pb-8 pt-2 md:px-8 md:pb-12 h-full overflow-hidden"
            >
              {/* Header */}
              <div className="text-center mb-8 md:mb-10 shrink-0">
                <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">Sobre Nós</h1>
                <p className="text-emerald-400 font-medium text-2xl md:text-3xl tracking-widest uppercase opacity-80 mt-2">Alternativa FM</p>
              </div>

              {/* Logo Small */}
              <div className="flex justify-center mb-8 md:mb-10 shrink-0">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 bg-no-repeat bg-center border-2 border-emerald-500/20 flex items-center justify-center">
                  <span className="text-4xl md:text-5xl font-black text-white">104,9</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar space-y-8 md:space-y-10 text-slate-300 text-3xl leading-relaxed">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/5">
                  <p>
                    A rádio do povo para o povo! A Alternativa 104,9 FM é a sua companhia diária com muita música, informação e alegria. Estamos sempre conectados com você.
                  </p>
                </div>

                <div className="space-y-10">
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                      <MapPin size={40} />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-2 text-3xl">Localização</h3>
                      <p className="text-slate-400 text-2xl">Candiba, Bahia, Brasil</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                      <MessageCircle size={40} />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-2 text-3xl">WhatsApp</h3>
                      <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="text-slate-400 hover:text-emerald-400 transition-colors text-2xl">
                        {PHONE_DISPLAY}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                      <Phone size={40} />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-2 text-3xl">Telefone</h3>
                      <a href={`tel:+${WHATSAPP_NUMBER}`} className="text-slate-400 hover:text-emerald-400 transition-colors text-2xl">
                        {PHONE_DISPLAY}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-6 flex items-center justify-center shrink-0 mt-8">
                <button 
                  onClick={() => setShowInfo(false)}
                  className="w-28 h-28 rounded-full flex items-center justify-center text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20"
                >
                  <Play size={56} className="rotate-180" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
