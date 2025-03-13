"use client"

import React, { useRef, useEffect, useState } from 'react';

const Pong_local = ({ selectedBoard }) => {
  const canvasRef = useRef(null);
  const [userScore, setUserScore] = useState(0);
  const [comScore, setComScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');


    // Game objects
    let user = {
      x: 5,
      y: canvas.height / 2 - 50,
      width: 10,
      height: 100,
      color: "#C8D7D2",
      score: 0
    };

    let com = {
      x: canvas.width - 15,
      y: canvas.height / 2 - 50,
      width: 10,
      height: 100,
      color: "#C8D7D2",
      score: 0
    };

    let ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 10,
      speed: 5,
      velocityX: 5,
      velocityY: 0,
      color: "#C8D7D2"
    };

                        
    const backgroundImage = new Image();
    backgroundImage.src = `/boards/${selectedBoard}.png`;

    // Helper functions
    function drawRect(x, y, w, h, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    }

    function drawCircle(x, y, r, color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
    }

    function collision(b, p) {
      return (
        b.x - b.radius < p.x + p.width &&
        b.x + b.radius > p.x &&
        b.y - b.radius < p.y + p.height &&
        b.y + b.radius > p.y
      );
    }

    function resetBall() {
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.speed = 5;
      ball.velocityX = ball.velocityX > 0 ? -ball.speed : ball.speed;
      ball.velocityY = 0;
    }

    function update() {


      if (selectedBoard == -1) {
        selectedBoard = 0;
        ball.color = "WHITE";
        user.color = "WHITE";
        com.color = "WHITE";
      }
      ball.x += ball.velocityX;
      ball.y += ball.velocityY;

      // AI
      // let comLevel = 0.1;
      // com.y += (ball.y - (com.y + com.height / 2)) * comLevel;

      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.velocityY = -ball.velocityY;
    } else if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.velocityY = -ball.velocityY;
    }

      let player = ball.x < canvas.width / 2 ? user : com;

      if (collision(ball, player)) {
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint /= player.height / 2;
        let angle = (Math.PI / 4) * collidePoint;
        let direction = ball.x < canvas.width / 2 ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angle);
        ball.velocityY = ball.speed * Math.sin(angle);
        if (ball.speed < 15){
            ball.speed += 0.1;
        }
      }

      if (ball.x - ball.radius < 0) {
        com.score++;
        setComScore(com.score);
        resetBall();
      } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        setUserScore(user.score);
        resetBall();
      }
    }

    function render() {
      // Clear canvas

      // Draw background
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

      // set the scrore to 0 if someone get to 5

      if (user.score == 5 || com.score == 5){
        user.score = 0;
        com.score = 0;
        setUserScore(user.score);
        setComScore(com.score);
      }

      // Draw paddles
      drawRect(user.x, user.y, user.width, user.height, user.color);
      drawRect(com.x, com.y, com.width, com.height, com.color);

      if (selectedBoard == 0 || selectedBoard == 2|| selectedBoard == 4){
        ball.color = "WHITE";
        user.color = "WHITE";
        com.color = "WHITE";
    }
    else{
        ball.color = "#C8D7D2";
        user.color = "#C8D7D2";
        com.color = "#C8D7D2";
    }

      drawCircle(ball.x, ball.y, ball.radius, ball.color);

    }

    function game() {
      movePaddleWithKeyboard2();
      movePaddleWithKeyboard();
      update();
      render();
    }

    let upPressed = false;
    let downPressed = false;

    let upPressed2 = false;
    let downPressed2 = false;
    
    // Functions to handle keydown and keyup events
    function keyDownHandler(event) {
        if (event.key === "ArrowUp") {
            upPressed = true;
        } else if (event.key === "ArrowDown") {
            downPressed = true;
        }
    }
    
    function keyUpHandler(event) {
        if (event.key === "ArrowUp") {
            upPressed = false;
        } else if (event.key === "ArrowDown") {
            downPressed = false;
        }
    }
    
    function keyDownHandler2(event) {
        if (event.key === "w") {
            upPressed2 = true;
        } else if (event.key === "s") {
            downPressed2 = true;
        }
    }

    function keyUpHandler2(event) {
        if (event.key === "w") {
            upPressed2 = false;
        } else if (event.key === "s") {
            downPressed2 = false;
        }
    }



    // Update the user paddle's position based on keyboard input
    function movePaddleWithKeyboard() {
        if (upPressed && com.y > 0) {
            com.y -= 7;
        } else if (downPressed && com.y < canvas.height - com.height) {
            com.y += 7;
        }
    }

    function movePaddleWithKeyboard2() {
        if (upPressed2 && user.y > 0) {
            user.y -= 7;
        } else if (downPressed2 && user.y < canvas.height - user.height) {
            user.y += 7;
        }
    }
    
    // Add event listener for keyboard input
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
    document.addEventListener("keydown", keyDownHandler2);
    document.addEventListener("keyup", keyUpHandler2);



    // Game loop
    const gameLoop = setInterval(game, 1000 / 60);

    // Cleanup
    return () => {
      clearInterval(gameLoop);
    };
  }, [selectedBoard]);

  return (
    <div className='flex justify-center items-center flex-col'>
      <div id="score" className="score">{userScore} - {comScore}</div>
      <canvas ref={canvasRef} width="930" height="480"></canvas>
    </div>
  );
};

export default Pong_local;