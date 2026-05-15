import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const getImagePath = (id) => {
  if (id === 7) return new URL('../../assets/kartu_belajar7.webp', import.meta.url).href;
  return new URL(`../../assets/kartu_belajar${id}.png`, import.meta.url).href;
}

const LearningDeckModal = ({ show, onClose, discoveredCards }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (show && modalRef.current) {
      gsap.fromTo(modalRef.current,
        { scale: 0, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" }
      );
    }
  }, [show]);

  if (!show) return null;

  const totalCards = 7;
  const cards = Array.from({ length: totalCards }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
         style={{ background: 'radial-gradient(ellipse at center, rgba(10,10,60,0.92) 0%, rgba(0,0,0,0.96) 100%)' }}
         onClick={onClose}>
      
      {/* Dekorasi bintang-bintang latar */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['10%,15%','85%,10%','20%,80%','75%,75%','50%,5%','5%,50%','90%,55%'].map((pos, i) => (
          <div key={i} className="absolute text-yellow-300 animate-pulse"
            style={{ left: pos.split(',')[0], top: pos.split(',')[1], fontSize: `${10 + (i % 3) * 6}px`, animationDelay: `${i * 0.3}s` }}>
            ✦
          </div>
        ))}
      </div>

      <div ref={modalRef} onClick={e => e.stopPropagation()} className="relative w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Badge header */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-yellow-900 font-black text-sm px-8 py-2 rounded-full shadow-xl border-2 border-yellow-200 whitespace-nowrap">
          ⭐ KARTU BELAJAR ⭐
        </div>

        {/* Frame utama */}
        <div className="rounded-[2rem] p-[3px] shadow-[0_0_60px_rgba(99,102,241,0.6),0_0_120px_rgba(59,130,246,0.3)] flex flex-col flex-1 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #fbbf24, #818cf8, #3b82f6, #fbbf24)' }}>
          <div className="rounded-[1.85rem] overflow-hidden flex flex-col flex-1 p-6 md:p-8"
            style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #1e3a8a 50%, #1e1b4b 100%)' }}>
            
            <p className="text-center font-bold text-yellow-300 mb-6 drop-shadow-md text-lg">
               Terkumpul: {discoveredCards.length} / {totalCards}
            </p>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-4">
                  {cards.map(id => {
                    const isDiscovered = discoveredCards.includes(id);
                    return (
                      <div key={id} className={`relative aspect-[3/4] rounded-2xl overflow-hidden border-4 shadow-lg transition-transform hover:scale-105 flex items-center justify-center
                         ${isDiscovered ? 'border-yellow-400 bg-blue-50' : 'border-blue-800 bg-blue-900/50'}
                      `}>
                        {isDiscovered ? (
                           <img src={getImagePath(id)} alt={`Kartu Belajar ${id}`} className="w-full h-full object-contain p-2" />
                        ) : (
                           <div className="flex flex-col items-center">
                              <span className="text-6xl font-black text-blue-800/80 drop-shadow-md">?</span>
                              <span className="text-sm font-bold text-blue-300 mt-2 text-center leading-tight">Belum<br/>Ditemukan</span>
                           </div>
                        )}
                      </div>
                    );
                  })}
               </div>
            </div>

            <button 
              onClick={onClose}
              className="mt-6 w-full font-black text-base py-3.5 rounded-2xl transition-all active:scale-95 shadow-xl border-2 border-white/20 tracking-wide flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #f59e0b 100%)',
                color: 'white',
                textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                boxShadow: '0 4px 20px rgba(239,68,68,0.5)'
              }}
            >
              Tutup &amp; Lanjut 🚀
            </button>
          </div>
        </div>

        {/* Corner stars dekoratif */}
        <div className="absolute -top-3 -left-3 text-3xl animate-spin z-20 pointer-events-none" style={{ animationDuration: '8s' }}>⭐</div>
        <div className="absolute -top-3 -right-3 text-3xl animate-spin z-20 pointer-events-none" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>🌟</div>
        <div className="absolute -bottom-3 -left-3 text-2xl animate-bounce z-20 pointer-events-none" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute -bottom-3 -right-3 text-2xl animate-bounce z-20 pointer-events-none" style={{ animationDelay: '0.2s' }}>✨</div>
      </div>
    </div>
  );
};

export default LearningDeckModal;
