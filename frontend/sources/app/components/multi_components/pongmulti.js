'use client';

import { useEffect, useRef, useState } from 'react';
import useWebSocket from 'react-use-websocket';
// import { useRouter } from 'next/router';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/authContext';
import { GameWsURL } from '@/public/urls';

const CANVAS_WIDTH = 930;
const CANVAS_HEIGHT = 480;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
// const AVATAR_SIZE = 60; // Size for the avatar display
// const wsGame      = 'ws://127.0.0.1:8000/ws/game';


export default function Home({ selectedBoard, onGameReset }) {

  const { setUser } = useAuth();
  const router = useRouter();
  const score = useRef([0, 0]);
  const canvasRef = useRef(null);
  const backgroundImageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [playerNumber, setPlayerNumber] = useState('');
  const [gameStatus, setGameStatus] = useState('idle');
  const [message, setMessage] = useState(null);
  const [isWinner, setIsWinner] = useState(null);
  const keysPressed = useRef({});
  const animationFrameId = useRef(null);
  const [socketUrl, setSocketUrl] = useState(null);
  const [playerInfo, setPlayerInfo] = useState({
  
    player1: { avatar: null, username: '' },
    player2: { avatar: null, username: '' }
  });

  const room_name = useSearchParams().get('room_name');


  useEffect(() => {
    if (selectedBoard !== undefined && selectedBoard !== null) {
      console.log('Loading image for board:', selectedBoard);
      
      const img = new Image();
      const imagePath = `/boards/${selectedBoard}.png`;
      
      img.onload = () => {
        backgroundImageRef.current = img;
        setImageLoaded(true);
      };
      
      img.onerror = () => {
        console.error(`Failed to load background image for board ${selectedBoard}`);
        setImageLoaded(false);
      };
      
      img.src = imagePath;
    } else {
      // Reset image loaded state if no board is selected
      setImageLoaded(false);
      backgroundImageRef.current = null;
    }
  
    return () => {
      setImageLoaded(false);
      backgroundImageRef.current = null;
    };
  }, [selectedBoard]);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    onClose: () => {
      console.log('WebSocket connection closed');
      setGameStatus('disconnected');
    },
    onError: () => {
      setGameStatus('error');
      setMessage('An error occurred with the game connection.');
    },
  });

  useEffect(() => {
    const gameLoop = () => {
      if (gameStatus === 'playing') {
        if (keysPressed.current['ArrowUp']) {
          sendMessage(JSON.stringify({ action: 'move', direction: 'ArrowUp' }));
        } else if (keysPressed.current['ArrowDown']) {
          sendMessage(JSON.stringify({ action: 'move', direction: 'ArrowDown' }));
        }
      }
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [sendMessage, gameStatus]);

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.player_name) {
          setPlayerNumber(data.player_name);
        }
        if (data.type === 'unauthorized') {
          setUser(null);
        }
        if (data.type === 'not_room'){
          router.push('/game');
        }
        if (data.type === 'game_start') {
          setPlayerInfo({
            player1: {
              avatar: data.game_state?.player1Avatar || null,
              username: data.game_state?.player1Username || 'Unknown'
            },
            player2: {
              avatar: data.game_state?.player2Avatar || null,
              username: data.game_state?.player2Username || 'Unknown'
            }
          });
        }
        switch (data.type) {
          case 'waiting':
            setGameStatus('waiting');
            setMessage(data.message);
            break;
          case 'game_start':
            setGameStatus('playing');
            setMessage(null);
            break;
          case 'game_state':
            setGameState(data.game_state);
            break;
          case 'game_over':
            handleGameOver(data);
            break;
          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        setMessage('An error occurred while processing game data.');
        setGameStatus('error');
      }
    }
  }, [lastMessage, playerNumber]);

const handleGameOver = (data) => {

  setTimeout(() => {
    setGameStatus('game_over');
    score.current = data.score;
    if (data.game_state) {
      setGameState(data.game_state);
    }
  }, 50);
  
  if ('is_winner' in data) {
    setIsWinner(data.is_winner);
    setMessage(data.is_winner ? 'You win!' : 'You lose!');
  }
  if (room_name){
    setTimeout(()=> {
      router.push('/profile');
    }, 3000);
  }
};

  useEffect(() => {
    if (gameState && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Draw background only if image is successfully loaded
      if (imageLoaded && backgroundImageRef.current) {
        try {
          ctx.drawImage(backgroundImageRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        } catch (error) {
          console.error('Error drawing background image:', error);
        }
      }
      
      drawGameElements(ctx, gameState);
    }
  }, [gameState, imageLoaded]);

  const drawGameElements = (ctx, state) => {
    // Draw paddles
    if (typeof state.player1Y === 'number' && typeof state.player2Y === 'number') {
      if (selectedBoard == 0 || selectedBoard == 2|| selectedBoard == 4){
        ctx.fillStyle = 'white';
      }
      else{
        ctx.fillStyle = '#C8D7D2';
      }
      
      ctx.fillRect(5, state.player1Y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH - 5, state.player2Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    }

    // Draw ball
    if (typeof state.ballX === 'number' && typeof state.ballY === 'number') {

      ctx.beginPath();
      ctx.arc(state.ballX, state.ballY, BALL_RADIUS, 0, Math.PI * 2);
      if (selectedBoard == 0 || selectedBoard == 2|| selectedBoard == 4){
        ctx.fillStyle = 'white';
      }
      else{
        ctx.fillStyle = '#C8D7D2';
      }
      ctx.fill();
      ctx.closePath();
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        keysPressed.current[e.key] = true;
      }
    };

    const handleKeyRelease = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        keysPressed.current[e.key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyRelease);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyRelease);
    };
  }, []);

  const handleNewGame = () => {
    // Close the WebSocket connection if it's open
    if (readyState === 1) {
      sendMessage(JSON.stringify({ action: 'close' }));
    }
    
    // Reset all game-related states
    setGameStatus('idle');
    setMessage(null);
    setGameState(null);
    setSocketUrl(null);
    setImageLoaded(false);
    setPlayerNumber('');
    setIsWinner(null);
    score.current = [0, 0];
    
    // Call the parent component's reset function
    onGameReset();
  };

  const handleJoinGame = () => {
    setGameStatus('connecting');
    setMessage('Waiting for an opponent...');
    setGameState(null);
    const token = localStorage.getItem('token');
    const url =  room_name ? `${GameWsURL}?r=${room_name}&t=${token}` : `${GameWsURL}?t=${token}`;
    // redirect to first game page
    setSocketUrl(url);
  };

  return (
    <div id="Game" className='flex items-center flex-col justify-center'>
      {gameStatus === 'idle' && (
        <button onClick={handleJoinGame} className='bg-white p-5 text-center font-bold rounded-xl'>
          Join Game
        </button>
      )}
      {gameStatus === 'waiting' && (
        <div className="text-white text-xl font-semibold animate-pulse">
          {message}
        </div>
      )}
      {gameStatus === 'playing' && gameState && gameState.score && (
        <div className="relative al flex flex-col items-center justify-center">
          <div id="score" className="score mb-2">{gameState.score[0]} - {gameState.score[1]}</div>
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
          
          {/* Player Avatars with Usernames */}
          <div className="absolute bottom-[-70px] w-full flex justify-between px-4">
            <div className="flex flex-col items-center">
              <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-2 border-white">
                <img 
                  src={playerInfo.player1.avatar || '/api/placeholder/60/60'} 
                  alt={playerInfo.player1.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-white mt-1 font-semibold max-w-[100px]">
                {playerInfo.player1.username}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-[60px] h-[60px] rounded-full overflow-hidden border-2 border-white">
                <img 
                  src={playerInfo.player2.avatar || '/api/placeholder/60/60'} 
                  alt={playerInfo.player2.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-white mt-1 font-semibold max-w-[100px]">
                {playerInfo.player2.username}
              </span>
            </div>
          </div>
        </div>
      )}
      {gameStatus === 'game_over' && gameState && gameState.score && (
        <div className='flex flex-col items-center justify-center'>
          <p className={`text-4xl font-bold mb-4 ${
            isWinner ? 'text-green-400 animate-bounce' : 'text-red-400 animate-shake'
          }`}>
            {message}
          </p>
          <div id="score" className="score">{score.current[0]} - {score.current[1]}</div>
          {!room_name && <button onClick={handleNewGame} className='bg-white px-6 py-3 rounded-xl text-center text-lg font-semibold hover:bg-gray-200 transition-colors duration-300'>
            New Game
          </button>
          }
        </div>
      )}
    </div>
  );
}
