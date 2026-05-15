import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import imgPolisi from '../../assets/bantuan_polisi.webp';
import imgLampu from '../../assets/bantuan_lampu.webp';
import imgSkip from '../../assets/bantuan_skip.webp';

const HelpDeckModal = ({ show, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (show && modalRef.current) {
      gsap.fromTo(modalRef.current,
        { scale: 0, opacity: 0, rotation: -10 },
        { scale: 1, opacity: 1, rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" }
      );
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4"
         style={{ background: 'radial-gradient(ellipse at center, rgba(10,30,20,0.92) 0%, rgba(0,0,0,0.96) 100%)' }}
         onClick={onClose}>
      
      {/* Dekorasi bintang-bintang latar */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['10%,15%','85%,10%','20%,80%','75%,75%','50%,5%','5%,50%','90%,55%'].map((pos, i) => (
          <div key={i} className="absolute text-green-300 animate-pulse"
            style={{ left: pos.split(',')[0], top: pos.split(',')[1], fontSize: `${10 + (i % 3) * 6}px`, animationDelay: `${i * 0.3}s` }}>
            ✦
          </div>
        ))}
      </div>

      <div ref={modalRef} onClick={e => e.stopPropagation()} className="relative w-full max-w-3xl max-h-[90vh] flex flex-col">
        
        {/* Badge header */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 text-green-900 font-black text-sm px-8 py-2 rounded-full shadow-xl border-2 border-green-200 whitespace-nowrap">
          🛡️ KARTU BANTUAN 🛡️
        </div>

        {/* Frame utama */}
        <div className="rounded-[2rem] p-[3px] shadow-[0_0_60px_rgba(16,185,129,0.6),0_0_120px_rgba(5,150,105,0.3)] flex flex-col flex-1 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #34d399, #10b981, #059669, #34d399)' }}>
          <div className="rounded-[1.85rem] overflow-hidden flex flex-col flex-1 p-6 md:p-8"
            style={{ background: 'linear-gradient(160deg, #022c22 0%, #064e3b 50%, #022c22 100%)' }}>
            
            <p className="text-center font-bold text-green-200 mb-6 drop-shadow-md text-lg">
               Gunakan bantuan ini saat menghadapi soal yang sulit!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
               <div className="bg-emerald-900/60 rounded-2xl p-4 border-2 border-emerald-500/30 flex flex-col items-center text-center shadow-lg transform hover:scale-105 transition-all">
                  <div className="w-24 h-24 mb-4 bg-emerald-800/80 rounded-xl shadow-inner flex items-center justify-center p-2 border border-emerald-600">
                     <img src={imgPolisi} alt="Bantuan Polisi" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="font-bold text-emerald-300 text-lg mb-2">Polisi (50:50)</h3>
                  <p className="text-sm text-emerald-100/70 font-medium">Pak Polisi membantu menghilangkan 1 jawaban salah pada pilihan ganda.</p>
               </div>
               
               <div className="bg-emerald-900/60 rounded-2xl p-4 border-2 border-emerald-500/30 flex flex-col items-center text-center shadow-lg transform hover:scale-105 transition-all">
                  <div className="w-24 h-24 mb-4 bg-emerald-800/80 rounded-xl shadow-inner flex items-center justify-center p-2 border border-emerald-600">
                     <img src={imgLampu} alt="Bantuan Lampu" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="font-bold text-emerald-300 text-lg mb-2">Lampu Petunjuk</h3>
                  <p className="text-sm text-emerald-100/70 font-medium">Lampu hijau! Memberikan petunjuk untuk menjawab soal.</p>
               </div>
               
               <div className="bg-emerald-900/60 rounded-2xl p-4 border-2 border-emerald-500/30 flex flex-col items-center text-center shadow-lg transform hover:scale-105 transition-all">
                  <div className="w-24 h-24 mb-4 bg-emerald-800/80 rounded-xl shadow-inner flex items-center justify-center p-2 border border-emerald-600">
                     <img src={imgSkip} alt="Bantuan Skip" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="font-bold text-emerald-300 text-lg mb-2">Lewati Soal</h3>
                  <p className="text-sm text-emerald-100/70 font-medium">Lewati pertanyaan yang sulit dan langsung dapatkan jawaban yang benar secara otomatis!</p>
               </div>
            </div>

            <button 
              onClick={onClose}
              className="mt-6 w-full font-black text-base py-3.5 rounded-2xl transition-all active:scale-95 shadow-xl border-2 border-white/20 tracking-wide flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #10b981 100%)',
                color: 'white',
                textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                boxShadow: '0 4px 20px rgba(16,185,129,0.5)'
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

export default HelpDeckModal;
