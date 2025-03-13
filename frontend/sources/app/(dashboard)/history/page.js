'use client'


import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RefreshCw, Trophy, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/app/contexts/authContext';
import { useAxios } from '@/public/AxiosInstance';

const GameHistoryCard = ({ game, index }) => {
  const cardBackgroundColor = game.result === 'Win'
    ? 'bg-gradient-to-b from-green-900 to-clay-500'
    : 'bg-gradient-to-b from-red-900 to-clay-500';

  return (
    <motion.li
      key={game.id}
      className={`${cardBackgroundColor} rounded-2xl shadow-lg p-6 text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-102 border border-gray-700`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.1 }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <img src={game.opponent_avatar} alt={game.opponent} className="w-16 h-16 rounded-full border-2 border-white shadow-md" />
          <div>
            <h2 className="text-2xl font-bold">{game.opponent}</h2>
            <p className="text-gray-300 text-sm mt-1">Opponent</p>
          </div>
        </div>
        <div className="flex flex-col items-center sm:items-end space-y-2">
          <div className="flex items-center space-x-3">
            {game.result === 'Win' ? (
              <Trophy className="w-8 h-8 text-yellow-400" />
            ) : (
              <XCircle className="w-8 h-8 text-red-400" />
            )}
            <span className={`text-xl font-semibold ${game.result === 'Win' ? 'text-green-400' : 'text-red-400'}`}>
              {game.result}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <Clock className="w-4 h-4" />
            <p className="text-sm">
              {new Date(game.start_time).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </motion.li>
  );
};

export default function GameHistory() {

  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [gameType, setGameType] = useState('pong');
  const { user } = useAuth();

  const api= useAxios();

  const fetchGameHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`game/history?type=${gameType}&dest=${user.id}`);
      setGames(response.data);
    } catch (err) {
      toast.error(`Error fetching game history: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsLoading(false);
    }

  }, [gameType]);

  useEffect(() => {
    fetchGameHistory();
  }, [fetchGameHistory]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchGameHistory();
    setIsRefreshing(false);
  };

  const handleGameTypeChange = (type) => {
    setGameType(type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-start py-12 pt-20 s relative px-4 sm:px-0">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} />
      <motion.h1 
        className="text-3xl sm:text-5xl font-bold text-white mb-8 sm:mb-12 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Game History
      </motion.h1>
      
      <motion.div 
        className="w-full max-w-4xl bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg p-4 sm:p-8 mb-8 sm:mb-12 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">Select Game Type</h2>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <motion.button
            onClick={() => handleGameTypeChange('pong')}
            className={`py-2 px-6 rounded-full font-semibold text-white shadow-lg ${
              gameType === 'pong' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            } w-full sm:w-auto`}
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            Pong
          </motion.button>
          <motion.button
            onClick={() => handleGameTypeChange('rps')}
            className={`py-2 px-6 rounded-full font-semibold text-white shadow-lg ${
              gameType === 'rps' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            } w-full sm:w-auto`}
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            Rock Paper Scissors
          </motion.button>
        </div>
      </motion.div>

      {isLoading ? (
        <motion.div 
          className="text-white text-xl sm:text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading game history...
        </motion.div>
      ) : (
        <AnimatePresence>
          {games.length > 0 ? (
            <motion.ul 
              className="w-full max-w-4xl space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {games.map((game, index) => (
                <GameHistoryCard 
                  key={game.id} 
                  game={game} 
                  index={index}
                />
              ))}
            </motion.ul>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-white text-lg sm:text-xl text-center"
            >
              No game history available. Play some games to see your history!
            </motion.p>
          )}
        </AnimatePresence>
      )}

      <motion.button
        onClick={handleRefresh}
        className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 py-2 px-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-colors duration-300 shadow-lg flex items-center justify-center z-10"
        whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)" }}
        whileTap={{ scale: 0.95 }}
        disabled={isRefreshing}
      >
        <RefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </motion.button>
    </div>
  );
}