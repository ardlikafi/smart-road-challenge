import { useState, useCallback } from 'react'

export const useGameLogic = (initialMode = 'single') => {
    const [currentPlayer, setCurrentPlayer] = useState(1)
    const [player1Position, setPlayer1Position] = useState(0)
    const [player2Position, setPlayer2Position] = useState(0)
    const [player1Score, setPlayer1Score] = useState(0)
    const [player2Score, setPlayer2Score] = useState(0)
    const [isRolling, setIsRolling] = useState(false)
    const [diceValue, setDiceValue] = useState(1)
    const [showCard, setShowCard] = useState(false)
    const [currentCard, setCurrentCard] = useState(null)
    const [gameMode, setGameMode] = useState(initialMode)
    const [gameOver, setGameOver] = useState(false)

    // Koordinat tile untuk papan permainan
    const tileCoordinates = [
        { x: 100, y: 400 }, // Start (Rumah)
        { x: 200, y: 380 },
        { x: 300, y: 360 },
        { x: 400, y: 340 },
        { x: 500, y: 320 },
        { x: 600, y: 300 },
        { x: 700, y: 280 },
        { x: 800, y: 260 },
        { x: 900, y: 240 },
        { x: 1000, y: 220 },
        { x: 1100, y: 200 },
        { x: 1200, y: 180 },
        { x: 1300, y: 160 },
        { x: 1400, y: 140 },
        { x: 1500, y: 120 },
        { x: 1600, y: 100 },
        { x: 1700, y: 80 },
        { x: 1800, y: 60 },
        { x: 1900, y: 40 },
        { x: 2000, y: 20 }, // Finish (Sekolah)
    ]

    // Kartu pertanyaan lalu lintas
    const trafficCards = [{
            type: 'learning',
            question: 'Apa arti lampu lalu lintas warna merah?',
            answer: 'Berhenti',
            points: 10
        },
        {
            type: 'challenge',
            question: 'Kalau mau menyeberang jalan, harus melihat ke mana?',
            answer: 'Kiri, kanan, kiri lagi',
            points: 15
        },
        {
            type: 'help',
            question: 'Siapa yang membantu kita menyeberang jalan?',
            answer: 'Pak polisi atau penyeberangan',
            points: 10
        },
        {
            type: 'step',
            question: 'Berapa langkahkah yang aman di zebra cross?',
            answer: 'Jalan pelan-pelan saja',
            points: 5
        },
        {
            type: 'learning',
            question: 'Apa arti lampu lalu lintas warna hijau?',
            answer: 'Jalan',
            points: 10
        },
        {
            type: 'challenge',
            question: 'Kalau mau menyeberang, pakai apa?',
            answer: 'Zebra cross',
            points: 15
        }
    ]

    const rollDice = useCallback(() => {
        if (isRolling || gameOver) return

        setIsRolling(true)

        // Simulasi rolling animation
        setTimeout(() => {
            const randomValue = Math.floor(Math.random() * 6) + 1
            setDiceValue(randomValue)
            setIsRolling(false)

            // Auto move player after rolling
            setTimeout(() => {
                movePlayer(randomValue)
            }, 500)

            return randomValue
        }, 1500)
    }, [isRolling, gameOver, movePlayer])

    const movePlayer = useCallback((steps) => {
        const currentPos = currentPlayer === 1 ? player1Position : player2Position
        const targetPos = Math.min(currentPos + steps, tileCoordinates.length - 1)

        // Update position
        if (currentPlayer === 1) {
            setPlayer1Position(targetPos)
        } else {
            setPlayer2Position(targetPos)
        }

        // Check for game over
        if (targetPos >= tileCoordinates.length - 1) {
            setGameOver(true)
            return true
        }

        // Check for special tiles
        const specialTiles = [3, 7, 11, 15]
        if (specialTiles.includes(targetPos)) {
            const randomCard = trafficCards[Math.floor(Math.random() * trafficCards.length)]
            setCurrentCard(randomCard)
            setShowCard(true)
        }

        // Switch turn
        setTimeout(() => {
            setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
        }, 1000)

        return false
    }, [currentPlayer, player1Position, player2Position, tileCoordinates.length, trafficCards])

    const handleCardAnswer = useCallback((isCorrect) => {
        if (isCorrect && currentCard) {
            if (currentPlayer === 1) {
                setPlayer1Score(prev => prev + currentCard.points)
            } else {
                setPlayer2Score(prev => prev + currentCard.points)
            }
        }

        setShowCard(false)
        setCurrentCard(null)
    }, [currentCard, currentPlayer, setPlayer1Score, setPlayer2Score])

    const resetGame = useCallback(() => {
        setCurrentPlayer(1)
        setPlayer1Position(0)
        setPlayer2Position(0)
        setPlayer1Score(0)
        setPlayer2Score(0)
        setIsRolling(false)
        setDiceValue(1)
        setShowCard(false)
        setCurrentCard(null)
        setGameOver(false)
    }, [])

    const switchTurn = useCallback(() => {
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
    }, [currentPlayer])

    return {
        // State
        currentPlayer,
        player1Position,
        player2Position,
        player1Score,
        player2Score,
        isRolling,
        diceValue,
        showCard,
        currentCard,
        gameMode,
        gameOver,
        tileCoordinates,
        trafficCards,

        // Actions
        setCurrentPlayer,
        setPlayer1Position,
        setPlayer2Position,
        setPlayer1Score,
        setPlayer2Score,
        setIsRolling,
        setDiceValue,
        setShowCard,
        setCurrentCard,
        setGameMode,
        setGameOver,

        // Methods
        rollDice,
        movePlayer,
        handleCardAnswer,
        resetGame,
        switchTurn
    }
}