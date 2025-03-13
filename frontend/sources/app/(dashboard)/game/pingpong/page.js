'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import '../../../app_css/game-modes.css';

export default function GameModes() {
  return (
    <div className='w-[90%] max-w-6xl xl:max-w-[1300px]  '>
    <div className=' flex flex-col h-[600px] items-center justify-center   rounded-xl bg-gradient-to-b from-gray-800 via-gray-950 to-gray-800 shadow-lg lg:gap-24 gap-5 md:gap-20'>
          <h1 className='heading text-2xl sm:text-3xl md:text-4xl mb-8 text-center'>
            Choose Game Mode
          </h1>

          <div className='grid grid-cols-2 md:gap-5 gap-7 sm:grid-cols-2 md:grid-cols-4'>
            {[
              { href: "/game/pingpong/multiplayer", src: "/gameassets/remote.png", alt: "Multiplayer Mode", gradient: "from-gray-900 to-gray-950", text: "Multiplayer Mode" },
              { href: "/game/pingpong/single-mode", src: "/gameassets/bot.png", alt: "Single Mode", gradient: "from-green-950 to-gray-950", text: "Single Mode" },
              { href: "/game/pingpong/tournament", src: "/gameassets/tournament.png", alt: "Tournament Mode", gradient: "from-blue-950  to-gray-950", text: "Tournament Mode" },
              { href: "/game/pingpong/local-mode", src: "/gameassets/local.png", alt: "Local Mode", gradient: "from-purple-950 to-gray-900", text: "Local Mode" }
            ].map((mode, index) => (
              <Link key={index} href={mode.href} passHref>
                <div className='flex flex-col items-center'>
                  <motion.div
                    className={`bg-gradient-to-br ${mode.gradient} xl:w-[260px] xl:h-[260px] lg:w-[210px] lg:h-[210px] h-[150px] w-[150px] p-4 rounded-3xl flex items-center justify-center cursor-pointer hover:border-2 hover:border-white`}
                    whileHover={{ scale: 1.05, boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.3)' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Image
                      src={mode.src}
                      alt={mode.alt}
                      width={64}
                      height={64}
                      className="w-3/4 h-3/4 object-contain"
                      loading="lazy"

                    />
                  </motion.div>
                  <p className='mt-2 text-white text-sm lg:text-xl sm:text-base text text-center'>{mode.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
  );
}