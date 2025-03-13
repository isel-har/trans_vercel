'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';


export default function GameSelection() {
  const [hoveredGame, setHoveredGame] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    hover: { 
      scale: 1.05,
      boxShadow: '0px 0px 40px rgba(0,0,0,0.5)',
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.98 }
  };

  const games = [
    { name: 'Ping Pong', emoji: '🏓', href: '/game/pingpong', color: 'via-blue-900' },
    { name: 'New Game', emoji: '🎮', href: '/game/rps', color: 'via-indigo-950' },
  ];

  return (
    <motion.div 
      className='h-[50vh]'
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 
        className='text-4xl md:text-5xl lg:text-6xl text-white mb-15 py-3 text-center font-bold '
        variants={itemVariants}
      >
        Choose Your Game
      </motion.h1>

      <div className='flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16'>
        {games.map((game, index) => (
          <Link key={index} href={game.href} passHref>
            <motion.div
              className={`relative flex flex-col items-center justify-center w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br ${game.color} rounded-3xl text-white cursor-pointer transition-all duration-300 shadow-lg overflow-hidden`}
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
              onMouseEnter={() => setHoveredGame(game.name)}
              onMouseLeave={() => setHoveredGame(null)}
            >
              <motion.div
                className="absolute inset-0 bg-black opacity-0 transition-opacity duration-300"
                animate={{ opacity: hoveredGame === game.name ? 0.2 : 0 }}
              />
              <motion.div
                className="w-full h-full flex flex-col items-center justify-center"
              >
                <motion.span 
                  className='text-9xl md:text-10xl mb-6'
                  animate={{ 
                    rotate: hoveredGame === game.name ? [0, -5, 5, -5, 5, 0] : 0,
                    scale: hoveredGame === game.name ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {game.emoji}
                </motion.span>
                <span className='text-3xl md:text-4xl font-semibold text-center px-4'>{game.name}</span>
              </motion.div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
