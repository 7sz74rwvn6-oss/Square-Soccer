const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Oyuncular
let p1 = { x:150, y:360, size:30, dy:0, onGround:true, charging:false, jumpCharge:0, maxJump:14 };
let p2 = { x:720, y:360, size:30, dy:0, onGround:true, charging:false, jumpCharge:0, maxJump:14 };

// Top
let ball = { x:canvas.width/2, y:canvas.height/2, r:12, vx:3, vy:0 };

// Kaleler
const goalWidth = 20;
const goalHeight = 120;
const leftGoal  = { x:0, y:canvas.height-goalHeight };
const rightGoal = { x:canvas.width-goalWidth, y:canvas.height-goalHeight };

// Skor & süre
let score1 = 0;
let score2 = 0;
let matchTime = 90;
let frameCounter = 0;

// Yerçekimi & round
let normalGravity = 0.4;
let lowGravity = 0.15;
let gravity = normalGravity;
let roundTimer = 0;
let roundText = "";

// Tuşlar
const btnP1 = document.getElementById("btnP1");
const btnP2 = document.getElementById("btnP2");

// Güç doldurma
function chargeJump() {
  if (p1.charging && p1.jumpCharge < p1.maxJump) p1.jumpCharge += 0.4;
  if (p2.charging && p2.jumpCharge < p2.maxJump) p2.jumpCharge += 0.4;
}

// Kontroller
btnP1.addEventListener("touchstart", e=>{
  e.preventDefault();
  if(p1.onGround){ p1.charging=true; p1.jumpCharge=0; }
});
btnP1.addEventListener("touchend", e=>{
  e.preventDefault();
  if(p1.onGround){
    p1.dy = -p1.jumpCharge;
    p1.onGround=false;
    p1.charging=false;
  }
});

btnP2.addEventListener("touchstart", e=>{
  e.preventDefault();
  if(p2.onGround){ p2.charging=true; p2.jumpCharge=0; }
});
btnP2.addEventListener("touchend", e=>{
  e.preventDefault();
  if(p2.onGround){
    p2.dy = -p2.jumpCharge;
    p2.onGround=false;
    p2.charging=false;
  }
});

// Gol sonrası reset
function resetBall(){
  ball.x = canvas.width/2;
  ball.y = canvas.height/2;
  ball.vx = Math.random()>0.5?3:-3;
  ball.vy = Math.random()*4-2;

  if(Math.random()<0.4){
    gravity = lowGravity;
    roundTimer = 600;
    roundText = "LOW GRAVITY";
  } else {
    gravity = normalGravity;
    roundText = "";
  }
}

// Update
function update(){
  frameCounter++;
  if(frameCounter%60===0 && matchTime>0) matchTime--;

  if(roundTimer>0){
    roundTimer--;
    if(roundTimer===0){ gravity=normalGravity; roundText=""; }
  }

  chargeJump();

  [p1,p2].forEach(p=>{
    p.dy += gravity;
    p.y += p.dy;
    if(p.y + p.size >= canvas.height){
      p.y = canvas.height - p.size;
      p.dy = 0;
      p.onGround = true;
    }
  });

  ball.x += ball.vx;
  ball.y += ball.vy;
  if(ball.y-ball.r<0 || ball.y+ball.r>canvas.height) ball.vy*=-1;

  [p1,p2].forEach(p=>{
    if(
      Math.abs(ball.x-(p.x+p.size/2)) < p.size/2+ball.r &&
      Math.abs(ball.y-(p.y+p.size/2)) < p.size/2+ball.r
    ){
      ball.vx *= -1.2;
      ball.vy -= 2;
    }
  });

  // Goller
  if(ball.x-ball.r < goalWidth && ball.y>leftGoal.y && ball.y<leftGoal.y+goalHeight){
    score2++; resetBall();
  }
  if(ball.x+ball.r > rightGoal.x && ball.y>rightGoal.y && ball.y<rightGoal.y+goalHeight){
    score1++; resetBall();
  }

  draw();
  requestAnimationFrame(update);
}

// Oyuncu çizimi
function drawPlayer(p,color){
  ctx.fillStyle=color;
  ctx.fillRect(p.x,p.y,p.size,p.size);

  const legSwing = Math.sin(Date.now()*0.01)*8;
  ctx.strokeStyle=color;
  ctx.lineWidth=4;

  ctx.beginPath();
  ctx.moveTo(p.x+8,p.y+p.size);
  ctx.lineTo(p.x+4+legSwing,p.y+p.size+18);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(p.x+p.size-8,p.y+p.size);
  ctx.lineTo(p.x+p.size-4-legSwing,p.y+p.size+18);
  ctx.stroke();
}

// Draw
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Skor tablosu
  ctx.fillStyle="#00aaff";
  ctx.fillRect(canvas.width/2-160,0,320,50);
  ctx.fillStyle="#0077cc";
  ctx.fillRect(canvas.width/2-50,0,100,50);

  ctx.fillStyle="white";
  ctx.font="24px Arial";
  ctx.textAlign="center";
  ctx.fillText(`${score1} - ${score2}`,canvas.width/2,32);
  ctx.font="18px Arial";
  ctx.fillText(`01:${matchTime.toString().padStart(2,"0")}`,canvas.width/2,18);

  // Kaleler
  ctx.fillStyle="#dddddd";
  ctx.fillRect(leftGoal.x,leftGoal.y,goalWidth,goalHeight);
  ctx.fillRect(rightGoal.x,rightGoal.y,goalWidth,goalHeight);

  drawPlayer(p1,"red");
  drawPlayer(p2,"blue");

  ctx.fillStyle="white";
  ctx.beginPath();
  ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);
  ctx.fill();

  if(roundText){
    ctx.font="36px Arial";
    ctx.fillText(roundText,canvas.width/2,90);
  }
}

update();
