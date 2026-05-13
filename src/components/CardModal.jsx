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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white/90 backdrop-blur-md border-2 border-white/50 rounded-3xl p-6 max-w-xl w-full max-h-[95vh] overflow-y-auto shadow-2xl"
      >
        <div ref={contentRef} className="flex flex-col items-center">
          
          {/* Header Title */}
          <div className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold mb-4 shadow-md">
             Tantangan #{card.id}
          </div>

          {/* Image Container with Blurred Background */}
          <div className="w-full relative rounded-xl overflow-hidden shadow-lg border-4 border-white mb-4 flex items-center justify-center bg-gray-800">
            {/* Blurred Background */}
            <div 
              className="absolute inset-0 z-0 opacity-50 blur-xl scale-125"
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
              className="w-full h-auto object-contain max-h-48 md:max-h-56 relative z-10 drop-shadow-2xl"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300?text=Gambar+Tidak+Ditemukan'
              }}
            />
          </div>

          {/* Question Text */}
          <h3 className="text-lg md:text-xl font-extrabold text-gray-800 text-center mb-4 leading-relaxed">
            {card.question}
          </h3>

          {/* Powerups Area */}
          {!showFeedback && powerups && (
             <div className="w-full flex flex-col items-center mb-6">
               {(powerups.polisi > 0 || powerups.lampu > 0 || powerups.skip > 0) && (
                 <div className="text-xs md:text-sm font-black text-blue-700 mb-3 animate-bounce bg-blue-100 px-4 py-1.5 rounded-full border-2 border-blue-400 shadow-sm uppercase tracking-widest">
                    ⚡ Bingung? Gunakan Bantuan! ⚡
                 </div>
               )}
               <div className="flex justify-center gap-4 md:gap-6 w-full">
                 {powerups.polisi > 0 && card.type === 'pilihan_ganda' && (
                   <button onClick={() => {
                      const wrongIdxs = card.options.map((opt, idx) => ({opt, idx})).filter(o => o.opt !== card.correctAnswer && !eliminatedOptions.includes(o.idx));
                      if (wrongIdxs.length > 0) {
                         // Eliminate 1 wrong option
                         setEliminatedOptions([...eliminatedOptions, wrongIdxs[0].idx]);
                         onUsePowerup('polisi');
                      }
                   }} className="relative group focus:outline-none flex-1 max-w-[100px] flex flex-col items-center">
                      <div className="bg-gradient-to-b from-white to-gray-100 rounded-2xl p-2 shadow-lg border-2 border-gray-200 group-hover:border-blue-400 group-hover:scale-110 transition-all cursor-pointer w-full aspect-square flex items-center justify-center">
                         <img src={imgPolisi} alt="Bantuan Polisi" className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-md" />
                      </div>
                      <span className="mt-2 text-[10px] md:text-xs font-black text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-center w-full leading-tight uppercase">50:50</span>
                   </button>
                 )}
                 
                 {powerups.lampu > 0 && (
                   <button onClick={() => {
                      setShowHint(true);
                      onUsePowerup('lampu');
                   }} className="relative group focus:outline-none flex-1 max-w-[100px] flex flex-col items-center">
                      <div className="bg-gradient-to-b from-white to-yellow-50 rounded-2xl p-2 shadow-lg border-2 border-yellow-200 group-hover:border-yellow-400 group-hover:scale-110 transition-all cursor-pointer w-full aspect-square flex items-center justify-center">
                         <img src={imgLampu} alt="Bantuan Lampu" className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-md" />
                      </div>
                      <span className="mt-2 text-[10px] md:text-xs font-black text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md text-center w-full leading-tight uppercase">Bocoran</span>
                   </button>
                 )}
                 
                 {powerups.skip > 0 && (
                   <button onClick={() => {
                      onUsePowerup('skip');
                      // Automatically mark as correct
                      checkAnswer(card.correctAnswer);
                   }} className="relative group focus:outline-none flex-1 max-w-[100px] flex flex-col items-center">
                      <div className="bg-gradient-to-b from-white to-green-50 rounded-2xl p-2 shadow-lg border-2 border-green-200 group-hover:border-green-400 group-hover:scale-110 transition-all cursor-pointer w-full aspect-square flex items-center justify-center">
                         <img src={imgSkip} alt="Bantuan Skip" className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-md" />
                      </div>
                      <span className="mt-2 text-[10px] md:text-xs font-black text-green-700 bg-green-100 px-2 py-1 rounded-md text-center w-full leading-tight uppercase">Lewati</span>
                   </button>
                 )}
               </div>
             </div>
          )}
          
          {showHint && !showFeedback && (
             <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 w-full rounded-xl mb-4 text-sm font-bold shadow-inner">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {card.options.map((option, index) => {
                    if (eliminatedOptions.includes(index)) {
                       return (
                         <div key={index} className="flex items-center w-full p-3 bg-red-50 rounded-xl border-2 border-red-200 opacity-50 cursor-not-allowed">
                            <span className="w-10 h-10 flex items-center justify-center bg-red-200 text-red-500 font-bold rounded-lg mr-4">X</span>
                            <span className="text-red-400 font-semibold line-through">{option}</span>
                         </div>
                       );
                    }
                    const letter = getOptionLetter(index);
                    return (
                      <button
                        key={index}
                        onClick={() => checkAnswer(letter)}
                        className="group flex items-center w-full p-3 bg-gray-50 hover:bg-blue-500 rounded-xl border-2 border-gray-200 hover:border-blue-500 transition-all text-left"
                      >
                        <span className="w-10 h-10 flex items-center justify-center bg-gray-200 group-hover:bg-white text-gray-800 font-bold rounded-lg mr-4 transition-colors">
                          {letter}
                        </span>
                        <span className="text-gray-700 group-hover:text-white font-semibold transition-colors">
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
                    className="w-full p-4 bg-gray-50 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all resize-none h-32 text-gray-800 font-medium"
                  />
                  <button
                    onClick={handleSubmitEssay}
                    disabled={essayAnswer.trim() === ''}
                    className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                  >
                    Kirim Jawaban
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Feedback Area */
            <div className="w-full animate-fade-in flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl border-2 border-gray-200">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isCorrect ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                {isCorrect ? (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
              </div>
              
              <h4 className={`text-2xl font-black mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? 'Hebat! Jawabanmu Benar' : 'Yah, Jawabanmu Kurang Tepat!'}
              </h4>
              
              <div className="bg-white p-4 rounded-xl border border-gray-200 mt-4 shadow-inner text-left w-full">
                <p className="text-gray-500 text-sm font-bold uppercase mb-1">Penjelasan:</p>
                <p className="text-gray-800 font-medium leading-relaxed">{card.explanation}</p>
                {!isCorrect && card.type === 'esai' && (
                  <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                    <span className="font-bold">Jawaban yang diharapkan:</span> {card.correctAnswer}
                  </div>
                )}
              </div>
              
              <p className="text-gray-400 text-sm mt-6 animate-pulse">Menutup otomatis...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CardModal
