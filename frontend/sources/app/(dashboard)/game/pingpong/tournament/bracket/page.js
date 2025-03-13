'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Crown, Loader2 } from 'lucide-react';
import '../../../../../app_css/tournament.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/authContext';
import { useNoti } from '@/app/contexts/notiContext';
import { useAxios } from '@/public/AxiosInstance';

// const API_BASE_URL = 'http://localhost:8000/api/tournament';

const MatchCard = ({ player1, player2, stage, creatorName }) => (
  <motion.div
    className={`bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-xl border-2 ${
      stage === 'final' ? 'border-yellow-400' : 'border-gray-700'
    } flex flex-col justify-center min-h-[180px]`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex flex-col space-y-4">
      <div className={`text-blue-400 text-lg ${stage === 'final' ? 'font-bold' : ''} flex items-center`}>
        {player1 || 'TBD'}
        {player1 === creatorName && (
          <Crown className="ml-2 w-5 h-5 text-yellow-400" />
        )}
      </div>
      <div className="text-gray-400 text-sm">vs</div>
      <div className={`text-red-400 text-lg ${stage === 'final' ? 'font-bold' : ''} flex items-center`}>
        {player2 || 'TBD'}
        {player2 === creatorName && (
          <Crown className="ml-2 w-5 h-5 text-yellow-400" />
        )}
      </div>
    </div>
  </motion.div>
);

const BracketLine = ({ direction }) => (
  <motion.div
    className={`hidden lg:block absolute ${direction === 'right' ? 'left-full' : 'right-full'} top-1/2 w-12 h-1 bg-indigo-500`}
    initial={{ scaleX: 0 }}
    animate={{ scaleX: 1 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  />
);

const AnimatedLoader = () => (
  <div className="flex justify-center items-center">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 className="h-16 w-16 text-indigo-500" />
    </motion.div>
  </div>
);

const SpinningLoader = () => (
  <div className="inline-block">
    <svg className="animate-spin h-16 w-16" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
);

export default function TournamentBracket() {
  const [bracket, setBracket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tournamentStarted, setTournamentStarted] = useState("WAITING");
  const [playerCount, setPlayerCount] = useState(0);
  const [creatorName, setCreatorName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [tournamentName, setTournamentName] = useState('');
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get('id');
  const router = useRouter();
  const { lastMessage } = useNoti();
  const { user } = useAuth();
  const api= useAxios();

  useEffect(() => {
    const data =  lastMessage?.data ? JSON.parse(lastMessage.data).data : null;

    if (data && data?.type === 'TR' && tournamentId == data?.data?.id) {
      setTournamentStarted(data.data.status.toUpperCase());
      setBracket(data.data.bracket);
      const players = [
        ...(data.data.bracket.round_1?.group_1 || []),
        ...(data.data.bracket.round_1?.group_2 || [])
      ].filter(player => player && player !== '');
      setPlayerCount(players.length);
    }
  }, [lastMessage]);

  const fetchBracket = useCallback(async () => {
    if (!tournamentId) {
      toast.error('No tournament ID provided');
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await api.get(`tournament/bracket/${tournamentId}/`);
      const tournamentData = response.data.data;
      setBracket(tournamentData.bracket);
      setCreatorName(tournamentData.creator_name);
      setTournamentStarted(tournamentData.status.toUpperCase());
      setTournamentName(tournamentData.name || 'Unnamed Tournament');
      
      const players = [
        ...(tournamentData.bracket.round_1?.group_1 || []),
        ...(tournamentData.bracket.round_1?.group_2 || [])
      ].filter(player => player && player !== '');
      setPlayerCount(players.length);
    } catch (err) {
      // if (err.response === 404){
        console.log("error to fetch");
        router.push('/game');
      // }
      console.error(`Error fetching tournament bracket: ${err.response?.data?.detail || err.message}`);
      toast.error(`Failed to fetch bracket: ${err.response?.data?.detail || err.message}`);
    } finally {
      setIsLoading(false);
      setIsUpdating(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchBracket();
  }, [fetchBracket]);

  const startTournament = async () => {
    if (playerCount !== 4) {
      toast.error('Tournament can only start with exactly 4 players');
      return;
    }

    try {
      const response = await api.get(`tournament/start/${tournamentId}/`);
      toast.success(response.data.detail);
      setTournamentStarted("START");
      router.push(`tournament_game?id=${tournamentId}`);
    } catch (err) {
      if (err.response.status === 404)
        router.push('/game');
      toast.error(`Error starting tournament: ${err.response?.data?.detail || err.message}`);
    }
  };

  // Rest of the component remains the same...
  // (Including renderBracket and return statement)

  const renderBracket = () => (
    <motion.div 
      className="w-full max-w-6xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2 
        className="text-3xl sm:text-4xl font-bold text-indigo-300 mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {tournamentName}
      </motion.h2>
      <div className="flex flex-col lg:flex-row justify-between items-center lg:items-stretch space-y-12 lg:space-y-0 lg:space-x-8">
        <div className="w-full lg:w-1/3 space-y-12">
          <h2 className="text-indigo-300 text-2xl font-semibold mb-6 text-center">Semifinals</h2>
          <div className="relative">
            <MatchCard 
              player1={bracket.round_1?.group_1?.[0]}
              player2={bracket.round_1?.group_1?.[1]}
              stage="semifinal"
              creatorName={creatorName}
            />
            <BracketLine direction="right" />
          </div>
          <div className="relative">
            <MatchCard 
              player1={bracket.round_1?.group_2?.[0]}
              player2={bracket.round_1?.group_2?.[1]}
              stage="semifinal"
              creatorName={creatorName}
            />
            <BracketLine direction="right" />
          </div>
        </div>

        <div className="w-full lg:w-1/3 flex flex-col justify-center items-center">
          <AnimatePresence>
            {isUpdating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedLoader />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full lg:w-1/3 flex items-center justify-center">
          <div className="w-full">
            <h2 className="text-indigo-300 text-2xl font-semibold mb-6 text-center">Final</h2>
            <div className="relative">
              <MatchCard 
                player1={bracket.round_2?.group_3?.[0]}
                player2={bracket.round_2?.group_3?.[1]}
                stage="final"
                creatorName={creatorName}
              />
              <BracketLine direction="left" />
            </div>
          </div>
        </div>
      </div>

      {(!bracket.round_1 && (!bracket.round_2 || !bracket.round_2.group_3)) && (
        <motion.div
          className="text-white text-xl text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          No bracket data available for this tournament.
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen from-gray-900 via-blue-900 to-gray-900 flex flex-col items-center justify-center py-16 px-4 tournament relative">
      <div className="w-full max-w-6xl mt-8 sm:mt-12 md:mt-16">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        <motion.h1 
          className="text-4xl sm:text-5xl font-bold text-white mb-6 sm:mb-8 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Tournament Bracket
        </motion.h1>

        <motion.div
          className="flex justify-center mb-6 sm:mb-8 space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {tournamentStarted === "WAITING" && (
            <button
              className={`font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-full transition duration-300 ease-in-out shadow-lg text-base sm:text-lg
                ${playerCount === 4 && user.username === creatorName
                  ? 'bg-blue-600 hover:bg-indigo-700 text-white cursor-pointer'
                  : 'bg-blue-400 text-white cursor-not-allowed opacity-70'
                }`}
              onClick={startTournament}
              disabled={playerCount !== 4 || user.username !== creatorName}
            >
              Start Tournament {playerCount !== 4 && `(${playerCount}/4 players)`}
            </button>
          )}
          {tournamentStarted === "START" && (
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-full transition duration-300 ease-in-out shadow-lg text-base sm:text-lg flex items-center justify-center"
              onClick={() => {router.push(`tournament_game?id=${tournamentId}`)}}
            >
              Join Now
            </button>
          )}
        </motion.div>

        <AnimatePresence>
          {isLoading ? (
            <motion.div
              className="flex flex-col items-center justify-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatedLoader />
              <div className="text-white text-xl sm:text-2xl text-center">
                Loading Tournament Bracket...
              </div>
            </motion.div>
          ) : bracket ? (
            renderBracket()
          ) : (
            <motion.div
              className="text-white text-xl sm:text-2xl text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              No bracket data found for this tournament.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className="absolute bottom-8 left-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Link href="/game/pingpong/tournament" passHref>
          <button className="bg-blue-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-full transition duration-300 ease-in-out shadow-lg flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back to Tournaments</span>
          </button>
        </Link>
      </motion.div>
    </div>
  );
}