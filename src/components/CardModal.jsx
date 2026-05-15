import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import confetti from 'canvas-confetti'

// Import Powerup Images
import imgPolisi from '../../assets/bantuan_polisi.webp'
import imgLampu from '../../assets/bantuan_lampu.webp'
import imgSkip from '../../assets/bantuan_skip.webp'

const CardModal = ({ show, card, onAnswer, onClose, powerups, onUsePowerup }) => {
  const modalRef = useRef(null)
  const contentRef = useRef(null)
  
  const [essayAnswer, setEssayAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [eliminatedOptions, setEliminatedOptions] = useState([])
  const [showHint, setShowHint] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (show) {
      setEssayAnswer('')
      setShowFeedback(false)
      setIsCorrect(false)
      setEliminatedOptions([])
      setShowHint(false)
    }
  }, [show])

  useEffect(() => {
    if (show && modalRef.current) {
      gsap.fromTo(modalRef.current,
        { scale: 0, rotation: 180, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      )

      gsap.fromTo(contentRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, delay: 0.3, ease: "power2.out" }
      )
    }
  }, [show])

  if (!show || !card) return null

  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index); // 0 -> A, 1 -> B, etc.
  }

  // Handle dynamic image path - check if extension needs to be changed
  const getImagePath = (imageName) => {
    if (!imageName) return '';
    // Replace .png with .webp if it's in the assets
    const webpImageName = imageName.replace('.png', '.webp');
    return new URL(`../../assets/${webpImageName}`, import.meta.url).href;
  };

  const checkAnswer = (userAnswer) => {
    let correct = false;
    if (card.type === 'pilihan_ganda') {
      correct = userAnswer === card.correctAnswer;
    } else if (card.type === 'esai') {
      // Validasi simpel untuk esai (agar anak tidak frustasi jika tidak 100% sama)
      const normalizedUser = userAnswer.toLowerCase().trim();
      const normalizedCorrect = card.correctAnswer.toLowerCase().trim();
      
      const words = normalizedUser.split(' ').filter(w => w.length > 2);
      const matches = words.filter(w => normalizedCorrect.includes(w));
      
      correct = matches.length > 0 || normalizedUser === normalizedCorrect;
      
      if (!correct && normalizedUser.length > 5) {
          correct = true; // Fallback untuk memastikan pengalaman bermain tetap menyenangkan
      }
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Wait 3.5 seconds to show feedback, then close and trigger next turn
    setTimeout(() => {
      onAnswer(correct, userAnswer);
    }, 3500);
  }

  const handleSubmitEssay = () => {
    if (essayAnswer.trim() === '') return;
    checkAnswer(essayAnswer);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
         style={{ background: 'radial-gradient(ellipse at center, rgba(10,10,60,0.92) 0%, rgba(0,0,0,0.96) 100%)' }}>
      
      {/* Dekorasi bintang-bintang latar */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {['10%,15%','85%,10%','20%,80%','75%,75%','50%,5%','5%,50%','90%,55%'].map((pos, i) => (
          <div key={i} className="absolute text-yellow-300 animate-pulse"
            style={{ left: pos.split(',')[0], top: pos.split(',')[1], fontSize: `${10 + (i % 3) * 6}px`, animationDelay: `${i * 0.3}s` }}>
            ✦
          </div>
        ))}
      </div>

      <div 
        ref={modalRef}
        className="relative w-full max-w-5xl max-h-[95vh] flex flex-col"
      >
        {/* Badge header */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600 text-white font-black text-sm md:text-base px-8 py-2 rounded-full shadow-xl border-2 border-blue-200 whitespace-nowrap uppercase tracking-widest">
          🎯 TANTANGAN #{card.id} 🎯
        </div>

        {/* Frame utama */}
        <div className="rounded-[2rem] p-[4px] shadow-[0_0_60px_rgba(99,102,241,0.6),0_0_120px_rgba(59,130,246,0.3)] flex flex-col flex-1 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)' }}>
          <div ref={contentRef} className="bg-white/95 backdrop-blur-xl rounded-[1.8rem] p-6 md:p-8 overflow-y-auto flex-1 flex flex-col md:flex-row gap-8 items-stretch custom-scrollbar">
          
          {/* Left Column: Image */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="w-full relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 flex items-center justify-center bg-gray-900 h-full min-h-[30vh]">
              {/* Blurred Background */}
              <div 
                className="absolute inset-0 z-0 opacity-60 blur-2xl scale-125"
                style={{
                  backgroundImage: `url(${getImagePath(card.image)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              
              {/* Main Image */}
              <img 
                src={getImagePath(card.image)}
                alt={`Soal ${card.id}`}
                className="w-full object-contain max-h-[45vh] md:max-h-[75vh] relative z-10 drop-shadow-2xl"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Gambar+Tidak+Ditemukan'
                }}
              />
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="w-full md:w-1/2 flex flex-col justify-center py-2">

            {/* Question Text */}
            <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-800 text-left mb-8 leading-snug">
              {card.question}
            </h3>

            {/* Powerups Area */}
            {!showFeedback && powerups && (
               <div className="w-full flex flex-col items-start mb-8 bg-blue-50/50 p-4 rounded-2xl border-2 border-blue-100">
                 {(powerups.polisi > 0 || powerups.lampu > 0 || powerups.skip > 0) && (
                   <div className="text-xs md:text-sm font-black text-blue-700 mb-4 bg-white px-4 py-1.5 rounded-full border border-blue-200 shadow-sm uppercase tracking-widest">
                      ⚡ Gunakan Bantuan ⚡
                   </div>
                 )}
                 <div className="flex justify-start gap-3 w-full">
                   {powerups.polisi > 0 && card.type === 'pilihan_ganda' && (
                     <button onClick={() => {
                        const wrongIdxs = card.options.map((opt, idx) => ({opt, idx})).filter(o => o.opt !== card.correctAnswer && !eliminatedOptions.includes(o.idx));
                        if (wrongIdxs.length > 0) {
                           setEliminatedOptions([...eliminatedOptions, wrongIdxs[0].idx]);
                           onUsePowerup('polisi');
                        }
                     }} className="relative group focus:outline-none flex flex-col items-center w-20">
                        <div className="bg-gradient-to-b from-white to-gray-100 rounded-2xl p-2 shadow-md border-2 border-gray-200 group-hover:border-blue-400 group-hover:scale-110 transition-all cursor-pointer w-full aspect-square flex items-center justify-center">
                           <img src={imgPolisi} alt="Bantuan Polisi" className="w-10 h-10 object-contain drop-shadow-md" />
                        </div>
                        <span className="mt-2 text-[10px] font-black text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-center w-full uppercase">50:50</span>
                     </button>
                   )}
                   
                   {powerups.lampu > 0 && (
                     <button onClick={() => {
                        setShowHint(true);
                        onUsePowerup('lampu');
                     }} className="relative group focus:outline-none flex flex-col items-center w-20">
                        <div className="bg-gradient-to-b from-white to-yellow-50 rounded-2xl p-2 shadow-md border-2 border-yellow-200 group-hover:border-yellow-400 group-hover:scale-110 transition-all cursor-pointer w-full aspect-square flex items-center justify-center">
                           <img src={imgLampu} alt="Bantuan Lampu" className="w-10 h-10 object-contain drop-shadow-md" />
                        </div>
                        <span className="mt-2 text-[10px] font-black text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded text-center w-full uppercase">Bocoran</span>
                     </button>
                   )}
                   
                   {powerups.skip > 0 && (
                     <button onClick={() => {
                        onUsePowerup('skip');
                        checkAnswer(card.correctAnswer);
                     }} className="relative group focus:outline-none flex flex-col items-center w-20">
                        <div className="bg-gradient-to-b from-white to-green-50 rounded-2xl p-2 shadow-md border-2 border-green-200 group-hover:border-green-400 group-hover:scale-110 transition-all cursor-pointer w-full aspect-square flex items-center justify-center">
                           <img src={imgSkip} alt="Bantuan Skip" className="w-10 h-10 object-contain drop-shadow-md" />
                        </div>
                        <span className="mt-2 text-[10px] font-black text-green-700 bg-green-100 px-2 py-0.5 rounded text-center w-full uppercase">Lewati</span>
                     </button>
                   )}
                 </div>
               </div>
            )}
            
            {showHint && !showFeedback && (
               <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 w-full rounded-xl mb-6 text-sm font-bold shadow-sm">
                  <span className="text-yellow-600 mr-2">💡 PETUNJUK:</span> 
                  {card.type === 'pilihan_ganda' 
                    ? `Jawaban yang benar mengandung kata "${card.correctAnswer.split(' ')[0]}..."` 
                    : `Clue: ${card.correctAnswer.substring(0, Math.ceil(card.correctAnswer.length / 2))}...`}
               </div>
            )}

            {/* Form / Options area */}
            {!showFeedback ? (
               <div className="w-full">
                {card.type === 'pilihan_ganda' && (
                  <div className="flex flex-col gap-3">
                    {card.options.map((option, index) => {
                      if (eliminatedOptions.includes(index)) {
                         return (
                           <div key={index} className="flex items-center w-full p-4 bg-red-50/50 rounded-2xl border-2 border-red-100 opacity-50 cursor-not-allowed">
                              <span className="w-10 h-10 flex items-center justify-center bg-red-200 text-red-500 font-bold rounded-xl mr-4">X</span>
                              <span className="text-red-400 font-bold line-through text-lg">{option}</span>
                           </div>
                         );
                      }
                      const letter = getOptionLetter(index);
                      return (
                        <button
                          key={index}
                          onClick={() => checkAnswer(letter)}
                          className="group flex items-center w-full p-3 bg-white hover:bg-blue-500 rounded-2xl border-2 border-gray-200 hover:border-blue-500 transition-all text-left shadow-sm hover:shadow-md"
                        >
                          <span className="w-12 h-12 flex items-center justify-center bg-gray-100 group-hover:bg-white text-gray-800 font-black rounded-xl mr-4 transition-colors text-lg">
                            {letter}
                          </span>
                          <span className="text-gray-700 group-hover:text-white font-bold transition-colors text-lg">
                            {option}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {card.type === 'esai' && (
                  <div className="w-full flex flex-col gap-4">
                    <textarea
                      value={essayAnswer}
                      onChange={(e) => setEssayAnswer(e.target.value)}
                      placeholder="Ketik jawabanmu di sini..."
                      className="w-full p-5 bg-white border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all resize-none h-40 text-gray-800 font-bold text-lg shadow-inner"
                    />
                    <button
                      onClick={handleSubmitEssay}
                      disabled={essayAnswer.trim() === ''}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black py-4 rounded-2xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-lg tracking-wide active:scale-95"
                    >
                      Kirim Jawaban
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Feedback Area */
              <div className="w-full animate-fade-in flex flex-col items-start p-6 bg-gray-50 rounded-3xl border-2 border-gray-200 shadow-inner h-full justify-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md ${isCorrect ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                  {isCorrect ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                </div>
                
                <h4 className={`text-3xl font-black mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? 'Hebat! Jawabanmu Benar!' : 'Yah, Kurang Tepat!'}
                </h4>
                
                <div className="bg-white p-5 rounded-2xl border border-gray-200 mt-2 shadow-sm w-full">
                  <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Penjelasan</p>
                  <p className="text-gray-800 font-bold leading-relaxed text-lg">{card.explanation}</p>
                  {!isCorrect && card.type === 'esai' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-800 border border-blue-100">
                      <span className="font-black block mb-1">Jawaban yang diharapkan:</span> 
                      <span className="font-medium text-base">{card.correctAnswer}</span>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-400 font-bold text-sm mt-8 animate-pulse">Melanjutkan permainan...</p>
              </div>
            )}
          </div>
        </div>
        </div>
        
        {/* Corner stars dekoratif */}
        <div className="absolute -top-3 -left-3 text-3xl animate-spin z-20 pointer-events-none" style={{ animationDuration: '8s' }}>⭐</div>
        <div className="absolute -top-3 -right-3 text-3xl animate-spin z-20 pointer-events-none" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>🌟</div>
        <div className="absolute -bottom-3 -left-3 text-2xl animate-bounce z-20 pointer-events-none" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute -bottom-3 -right-3 text-2xl animate-bounce z-20 pointer-events-none" style={{ animationDelay: '0.2s' }}>✨</div>
      </div>
    </div>
  )
}

export default CardModal
