'use client';

import { useEffect, useRef, useState, useContext } from 'react';
import useWebSocket from 'react-use-websocket';
import { useRouter } from 'next/navigation';
import { GameWsURL } from '@/public/urls';
import { useAuth } from '@/app/contexts/authContext';

const CANVAS_WIDTH = 930;
const CANVAS_HEIGHT = 480;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
// const AVATAR_SIZE = 60;

export default function TournamentGame({ selectedBoard, onGameEnd, tournamentId }) {

  const { user, setUser } = useAuth();
  const [ended, setEnded] = useState(false);

  const score = useRef([0, 0]);
  const canvasRef = useRef(null);
  const backgroundImageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [playerNumber, setPlayerNumber] = useState('');
  const [gameStatus, setGameStatus] = useState('connecting');
  const [message, setMessage] = useState('Connecting to tournament game...');
  const [isWinner, setIsWinner] = useState(null);
  const keysPressed = useRef({});
  const animationFrameId = useRef(null);
  const [socketUrl, setSocketUrl] = useState(null);
  const [isLost, setLost] = useState(false);
  const router = useRouter();
  const token = localStorage.getItem('token');

  const [playerInfo, setPlayerInfo] = useState({
    player1: { avatar: null, username: '' },
    player2: { avatar: null, username: '' }
  });
  const [tournamentInfo, setTournamentInfo] = useState({
    round: 0,
    totalRounds: 0,
  });

  useEffect(() => {
    if (token && tournamentId) {
      setSocketUrl(`${GameWsURL}?tr_id=${tournamentId}&token=${token}&tr=true`);
    }
  }, [tournamentId]);

  useEffect(() => {
    if (selectedBoard !== undefined && selectedBoard !== null) {
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
      setImageLoaded(false);
      backgroundImageRef.current = null;
    }
  
    return () => {
      setImageLoaded(false);
      backgroundImageRef.current = null;
    };
  }, [selectedBoard]);

  const { sendMessage, lastMessage } = useWebSocket(socketUrl, {
    onOpen: () => {
      console.log('Tournament WebSocket Connected');
      setGameStatus('waiting');
      setMessage('Waiting for tournament game to start...');
    },
    onClose: () => {
      console.log('Tournament WebSocket Disconnected');
      setGameStatus('disconnected');
    },
    onError: (event) => {
      console.error('Tournament WebSocket error:', event);
      setGameStatus('error');
      setMessage('An error occurred with the tournament game connection.');
    },
  }, socketUrl !== null);

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
        if (data.type === 'unauthorized'){
          setUser(null);
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
          setTournamentInfo({
            round: data.round || 0,
            totalRounds: data.totalRounds || 0,
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
          case 'tournament_over':
            handleTournamentOver(data);
            break;
          case 'round_2':
            setGameStatus('round_2');
            setMessage(data.message);
            break;
          // case 't':

          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing message:', error);
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
    if (data?.winner && data.winner === user.username) {
      setIsWinner(data.winner);
      setTimeout(()=> {
        router.push(`/game/pingpong/tournament/bracket?id=${tournamentId}`);
      }, 2000);
    }else {
      setLost(true);  
      setTimeout(()=> {
        router.push('/game');
      }, 2000);
    }
    setMessage(data.winner === user.username ? 'You win this round!' : 'You lose this round!');
  };

  const handleTournamentOver = (data) => {
    setGameStatus('tournament_over');
    setMessage(data.winner  ? 'You won the tournament!' : 'You\'ve been eliminated from the tournament.');
    onGameEnd(data.winner);
    setEnded(true);
  };

  useEffect(() => {
    if (gameState && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
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
      ctx.fillStyle = selectedBoard == 0 || selectedBoard == 2 || selectedBoard == 4 ? 'white' : '#C8D7D2';
      ctx.fillRect(5, state.player1Y, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH - 5, state.player2Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    }
    // Draw particles
    if (state.particles && Array.isArray(state.particles)) {
      state.particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.life / 20})`;
        ctx.fill();
        ctx.closePath();
      });
    }
    // Draw ball
    if (typeof state.ballX === 'number' && typeof state.ballY === 'number') {
      ctx.beginPath();
      ctx.arc(state.ballX, state.ballY, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = selectedBoard == 0 || selectedBoard == 2 || selectedBoard == 4 ? 'white' : '#C8D7D2';
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

  return (
    <div id="TournamentGame" className='flex items-center flex-col justify-center'>
      {(gameStatus === 'waiting' || gameStatus === 'round_2') && (
        <div className="text-white text-xl font-semibold animate-pulse">
          {message}
        </div>
      )}
      {gameStatus === 'playing' && gameState && gameState.score && (
        <div className="relative flex flex-col items-center justify-center">
          <div className="tournament-info text-white mb-2">
            Round {tournamentInfo.round} of {tournamentInfo.totalRounds}
          </div>
          <div id="score" className="score mb-2">{gameState.score[0]} - {gameState.score[1]}</div>
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
          
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
      {(gameStatus === 'game_over' || gameStatus === 'tournament_over') && (
        <div className='flex flex-col items-center justify-center'>
          <p className={`text-4xl font-bold mb-4 ${
            isWinner ? 'text-green-400 animate-bounce' : 'text-red-400 animate-shake'
          }`}>
            {message}
          </p>
          {gameStatus === 'game_over' && (
            <div id="score" className="score mb-4">{score.current[0]} - {score.current[1]}</div>
          )}
          {gameStatus === 'game_over' && !ended &&  !isLost && (
            <p className="text-white text-xl">Waiting for the next round...</p>
      
            // <p>{ended}</p>
            // <p className="text-white text-xl">Waiting for the next round...</p>
          )}
        </div>
      )}
    </div>
  );
}