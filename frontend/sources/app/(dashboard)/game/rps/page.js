'use client';

import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import useSound from 'use-sound';
import { WEBSOCKETURL } from '@/public/urls';
import { useAuth } from '@/app/contexts/authContext';

const WINNING_SCORE = 3;
// const token = localStorage.getItem("token");

export default function Home() {
  // const router = useRouter();
  const { setUser } = useAuth();
  const [room, setRoom] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [gameStatus, setGameStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [socketUrl, setSocketUrl] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [score, setScore] = useState([0, 0]);
  const [canMakeChoice, setCanMakeChoice] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [currentImageSet, setCurrentImageSet] = useState('custom');

  const imageSets = {
    default: {
      rock: '/rps/rock.png',
      paper: '/rps/paper.png',
      scissors: '/rps/scissors.png'
    },
    custom: {
      rock: '/rps/rock2.png',
      paper: '/rps/paper2.png',
      scissors: '/rps/scissors2.png'
    }
  };

  const toggleImageSet = () => {
    setCurrentImageSet(prev => prev === 'default' ? 'custom' : 'default');
  };

  const getImageSource = (choice) => {
    return imageSets[currentImageSet][choice];
  };

  const [playBackground] = useSound('/rps/background.mp3', { volume: 0.5, loop: true});
  const [playCountdown] = useSound('/rps/countdown.mp3', { volume: 0.5 });
  const [playChoice] = useSound('/rps/choice.mp3', { volume: 0.5 });
  const [playWin] = useSound('/rps/win.mp3', { volume: 0.5 });
  const [playLose] = useSound('/rps/win.mp3', { volume: 0.5 });
  const [playDraw] = useSound('/rps/draw.mp3', { volume: 0.5 });

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => {
      console.log('WebSocket Connected');
    },
    onClose: () => {
      console.log('WebSocket Disconnected');
      setGameStatus('disconnected');
      setErrorMessage('Connection to server lost. Please try again.');
    },
    onError: (event) => {
      console.error('WebSocket error:', event);
      setGameStatus('error');
      setErrorMessage('An error occurred with the game connection.');
    },
  });

  useEffect(() => {
    if (gameStatus === 'playing' && isSoundEnabled) {
      playBackground();
    }
  }, [gameStatus, isSoundEnabled, playBackground]);

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.type === 'unauthorized')
          setUser(null);
        switch (data.type) {
          case 'waiting':
            setGameStatus('waiting');
            break;
          case 'game_start':
            setPlayerName(data.player_name);
            setRoom(data.room_name);
            setGameStatus('playing');
            setErrorMessage(null);
            startCountdown();
            break;
          case 'game_state':
            setGameState(data.game_state);
            if (data.game_state.score) {
              updateScore(data.game_state.score);
            }
            if (data.game_state.choices) {
              const choices = data.game_state.choices;
              const opponentChoice = Object.values(choices).find(
                choice => choice !== choices[playerName]
              );
              setOpponentChoice(opponentChoice);
            }
            break;
          case 'round_result':
            setRoundResult(data.result);
            if (data.score) {
              setScore(data.score);
            }
            setTimeout(() => {
              setPlayerChoice(null);
              setOpponentChoice(null);
              setRoundResult(null);
              if (Math.max(...data.score) < WINNING_SCORE) {
                startCountdown();
              }
            }, 2000);
            setCanMakeChoice(false);
            break;
          case 'game_over':
            setGameStatus('game_over');
            setGameState(data.game_state);
            if (data.game_state.score) {
              setScore(data.game_state.score);
            }
            setWinner(data.winner);
            break;
          case 'error':
            setErrorMessage(data.message);
            break;
        }
      } catch (error) {
        console.error('Error processing message:', error);
        setErrorMessage('An error occurred while processing game data.');
        setGameStatus('error');
      }
    }
  }, [lastMessage, playerName]);

  useEffect(() => {
    if (roundResult && isSoundEnabled) {
      if (roundResult.includes('Win')) {
        playWin();
      } else if (roundResult.includes('Lose')) {
        playLose();
      } else {
        playDraw();
      }
    }
  }, [roundResult, isSoundEnabled, playWin, playLose, playDraw]);

  const startCountdown = () => {
    setCountdown(3);
    setCanMakeChoice(false);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanMakeChoice(true);
          return null;
        }
        if (isSoundEnabled) {
          playCountdown();
        }
        return prev - 1;
      });
    }, 500);
  };

  const updateScore = (newScore) => {
    if (newScore) {
      setScore(newScore);
      if (Math.max(...newScore) >= WINNING_SCORE) {
        setGameStatus('game_over');
      }
    }
  };

  const handleJoinGame = () => {
    setGameStatus('connecting');
    setErrorMessage(null);
    setGameState(null);
    setRoom(null);
    const token = localStorage.getItem('token');
    setSocketUrl(`${WEBSOCKETURL}rps?t=${token}`);
  };

  const handleNewGame = () => {
    setGameStatus('idle');
    setErrorMessage(null);
    setGameState(null);
    setRoom(null);
    setSocketUrl(null);
    setPlayerChoice(null);
    setOpponentChoice(null);
    setScore([0, 0]);
    setCanMakeChoice(false);
    setWinner(null);
    setPlayerName('');

    if (readyState === 1) {
      sendMessage(JSON.stringify({ action: 'leave' }));
    }

    setTimeout(() => {
      handleJoinGame();
    }, 1000);
  };

  const handlePlayerChoice = (choice) => {
    if (canMakeChoice) {
      setPlayerChoice(choice);
      sendMessage(JSON.stringify({ choice: choice }));
      setCanMakeChoice(false);
      if (isSoundEnabled) {
        playChoice();
      }
    }
  };

  return (
    <div className="rps w-[80%] h-[55vh] flex justify-center items-center relative">
      {gameStatus === 'playing' && (
        <div className="absolute top-0 right-0 flex gap-2 p-2">
          <motion.button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isSoundEnabled ? '🔊' : '🔇'}
          </motion.button>

          <motion.button
            onClick={toggleImageSet}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm md:text-base"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Switch Style
          </motion.button>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {gameStatus === 'idle' && (
          <motion.div 
            className="flex flex-col items-center justify-center min-h-[50vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.button
              onClick={handleJoinGame}
              className="px-8 py-3 text-xl bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Play Game
            </motion.button>
          </motion.div>
        )}

        {gameStatus === 'waiting' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="text-white text-xl mb-4">Finding opponent...</div>
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
          </div>
        )}

        {gameStatus === 'playing' && (
          <motion.div 
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-white/10 rounded-lg p-3 mb-4 text-center">
              <p className="text-white text-lg">Score: {score[0]} - {score[1]}</p>
            </div>

            <div className="h-[200px] bg-white/5 rounded-lg border border-white/10 shadow-xl overflow-hidden">
              <div className="flex justify-between items-center h-full px-8">
                <motion.div 
                  className="text-center flex-1"
                  animate={playerChoice ? { scale: [1, 1.1, 1] } : {}}
                >
                  <div className="w-24 h-24 mx-auto">
                    {playerChoice && (
                      <motion.div
                        key={currentImageSet}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Image
                          src={getImageSource(playerChoice)}
                          alt={playerChoice}
                          width={80}
                          height={80}
                          priority
                          className="w-full h-full object-contain"
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                <div className="text-white text-xl font-medium mx-8">
                  {canMakeChoice && !playerChoice && "Your Turn!"}
                  {!canMakeChoice && !playerChoice && "Wait..."}
                  {playerChoice && "Waiting for opponent..."}
                </div>

                <motion.div 
                  className="text-center flex-1"
                  animate={opponentChoice ? { scale: [1, 1.1, 1] } : {}}
                >
                  <div className="w-24 h-24 mx-auto">
                    {opponentChoice && (
                      <motion.div
                        key={currentImageSet}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Image
                          src={getImageSource(opponentChoice)}
                          alt={opponentChoice}
                          width={96}
                          height={96}
                          priority
                          className="w-full h-full object-contain"
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>

              <AnimatePresence>
                {countdown !== null && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="text-6xl font-bold text-white"
                      initial={{ scale: 2 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      {countdown}
                    </motion.div>
                  </motion.div>
                )}
                {roundResult && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="text-3xl font-bold text-white px-6 py-3 rounded-lg bg-white/10"
                      initial={{ y: -20 }}
                      animate={{ y: 0 }}
                      exit={{ y: 20 }}
                    >
                      {roundResult}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 bg-white/5 flex justify-center gap-4">
              {['rock', 'paper', 'scissors'].map((choice) => (
                <motion.button
                  key={choice}
                  onClick={() => handlePlayerChoice(choice)}
                  disabled={!canMakeChoice || playerChoice !== null}
                  className={`rounded-xl relative w-20 h-20 overflow-hidden ${
                    canMakeChoice && playerChoice === null 
                      ? 'hover:shadow-lg hover:shadow-blue-500/25' 
                      : 'opacity-50 cursor-not-allowed'
                  } ${currentImageSet === 'custom' ? "" : ""} `}
                  whileHover={canMakeChoice && playerChoice === null ? { scale: 1.05 } : {}}
                  whileTap={canMakeChoice && playerChoice === null ? { scale: 0.95 } : {}}
                >
                  <motion.div
                    key={currentImageSet}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={getImageSource(choice)}
                      alt={choice}
                      width={80}
                      height={80}
                      priority
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {gameStatus === 'game_over' && (
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
            <p className="text-xl text-white mb-6">
              Final Score: {score[0]} - {score[1]}
            </p>
            <motion.button
              onClick={handleNewGame}
              className="px-6 py-3 text-lg bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Play Again
            </motion.button>
          </motion.div>
        )}

        {errorMessage && (
          <div className="mt-4 text-center">
            <p className="text-yellow-300 bg-yellow-900/20 px-4 py-2 rounded-lg inline-block">
              {errorMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}