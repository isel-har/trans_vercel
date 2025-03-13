'use client'

import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
// import { getCookie } from 'cookies-next';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import { Crown, RefreshCw } from 'lucide-react';
import '../../../../app_css/game-modes.css';
import '../../../../app_css/tournament.css';
import { useAxios } from '@/public/AxiosInstance';
import { useAuth } from '@/app/contexts/authContext';

const TournamentCard = ({ tour, index, handleJoinTournament, handleLeaveTournament, isJoining, isLeaving }) => {
  const isFull = tour.players.length >= 4;
  const isStarted = tour.status === "Start";
  return (
    <motion.li
      key={tour.id}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.1 }}
    >
      <h2 className="text-2xl text-white font-bold mb-4">{tour.name}</h2>
      <p className="text-gray-400 mb-4">Players: {tour.players.length}/4</p>
      <div className="text-left mb-6">
        <h3 className="text-white font-semibold mb-3">Joined Players:</h3>
        <ul className="list-none space-y-2">
          {tour.players.map((player, playerIndex) => (
            <motion.li 
              key={playerIndex} 
              className={`flex items-center ${
                player.username === tour.creator_name 
                  ? 'text-yellow-400 font-semibold' 
                  : 'text-gray-300'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: playerIndex * 0.1 }}
            >
              {player.username === tour.creator_name && (
                <Crown className="inline-block mr-2 w-5 h-5 text-yellow-400" />
              )}
              <span>{player.username}</span>
              {player.status === 'ready' && (
                <span className="ml-2 text-sm bg-green-500 text-white px-2 py-1 rounded-full">
                  Ready
                </span>
              )}
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col space-y-3">
        {!tour.is_joined ? (
          <motion.button
            onClick={() => handleJoinTournament(tour.id)}
            className={`py-2 px-6 rounded-full font-semibold text-white shadow-lg ${
              !isFull 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
                : 'bg-gray-600 cursor-not-allowed'
            }`}
            whileHover={!isFull ? { scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" } : {}}
            whileTap={!isFull ? { scale: 0.95 } : {}}
            disabled={isFull || isJoining}
          >
            {isFull ? 'Tournament Full' : isJoining ? 'Joining...' : 'Join Tournament'}
          </motion.button>
        ) : (
          <motion.button
            onClick={() => handleLeaveTournament(tour.id)}
            className="py-2 px-6 rounded-full font-semibold text-white shadow-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(239, 68, 68, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            disabled={isLeaving || isStarted}
          >
            {isLeaving ? 'Leaving...' : 'Leave Tournament'}
          </motion.button>
        )}

        <Link href={`/game/pingpong/tournament/bracket?id=${tour.id}`} passHref>
          <motion.button
            className="py-2 px-6 rounded-full font-semibold text-white shadow-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            View Bracket
          </motion.button>
        </Link>
      </div>
    </motion.li>
  );
};

export default function Tournament() {
  const [tournaments, setTournaments] = useState([]);
  const [newTournament, setNewTournament] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const api= useAxios();

  const fetchTournaments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`tournament/list/`);
      setTournaments(response.data.data);
      const isStarted = response.data.status === "start";
    } catch (err) {
      toast.error(`Error fetching tournaments: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [user.acess]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const handleCreateTournament = async () => {
    if (!newTournament.trim()) {
      toast.error('Please provide a tournament name.');
      return;
    }
    try {
      const response = await api.post(`tournament/create/`, { name: newTournament });
      toast.success(response.data.detail);
      setNewTournament('');
      fetchTournaments();
    } catch (err) {
      toast.error(`Error creating tournament: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleJoinTournament = async (tournamentId) => {
    setIsJoining(true);
    try {
      const response = await api.get(`tournament/${tournamentId}/`);
      toast.success(response.data.detail || "Successfully joined the tournament");
      fetchTournaments();
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || "An error occurred while joining the tournament");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveTournament = async (tournamentId) => {
    setIsLeaving(true);
    try {
      const response = await api.delete(`tournament/${tournamentId}/`);
      toast.info(response.data.detail || "Successfully left the tournament");
      fetchTournaments();
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || "An error occurred while leaving the tournament");
    } finally {
      setIsLeaving(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchTournaments();
    setIsRefreshing(false);
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center py-12  tournament relative">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} />
      <motion.h1 
        className="text-5xl font-bold text-white mb-12 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Ping Pong Tournaments
      </motion.h1>
      
      <motion.div 
        className="w-full max-w-4xl bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-8 mb-12 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold text-white mb-6">Create a New Tournament</h2>
        <div className="flex">
          <input
            type="text"
            value={newTournament}
            onChange={(e) => setNewTournament(e.target.value)}
            placeholder="Enter tournament name"
            className="flex-grow py-3 px-4 rounded-l-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <motion.button
            onClick={handleCreateTournament}
            className="py-3 px-8 rounded-r-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-colors duration-300 shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            Create
          </motion.button>
        </div>
      </motion.div>

      {isLoading ? (
        <motion.div 
          className="text-white text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading tournaments...
        </motion.div>
      ) : (
        <AnimatePresence>
          {tournaments.length > 0 ? (
            <motion.ul 
              className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {tournaments.map((tour, index) => (
                <TournamentCard 
                  key={tour.id} 
                  tour={tour} 
                  index={index}
                  handleJoinTournament={handleJoinTournament}
                  handleLeaveTournament={handleLeaveTournament}
                  isJoining={isJoining}
                  isLeaving={isLeaving}
                />
              ))}
            </motion.ul>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-white text-xl"
            >
              No tournaments available. Create one to get started!
            </motion.p>
          )}
        </AnimatePresence>
      )}

      <motion.button
        onClick={handleRefresh}
        className="fixed bottom-8 left-8 py-2 px-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-colors duration-300 shadow-lg flex items-center z-10"
        whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)" }}
        whileTap={{ scale: 0.95 }}
        disabled={isRefreshing}
      >
        <RefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh Tournaments'}
      </motion.button>
    </div>
  );
}