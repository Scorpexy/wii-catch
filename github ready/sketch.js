/*
this is basically the main "bit" for the whole game

this file is the root of all, in a way, it manages the necessary bits like preloading
and drawing the main sketch, both relatively important. but most of all, 
it manages the state machine! this is code i ripped from my last project,
which allows me to switch "scenes", akin to a play. order is this:

safety -> titlescreen -> instructions -> countdown -> transition (2d to 3d) -> game -> transition2 (3d to 2d) -> end

each state of this process has its own class to keep itself to itself (some would say encapsulate!), this just makes debugging way tidier and easier for me to read

the game runs in two states i suppose, the astute among you reading may notice transitions, these are required because i need to manually remake the canvas everytime I switch from 2D to 3D, with 3D requiring a completely different renderer (WebGL)

so i suppose a good way to explain is this file is one big traffic controller for the entire
program. as its switching states, creating screens when needed, and making
sure the correct rendering layers are used
*/

// this section stores the assets i use, screens and are shared all throughout the program

let logoImg;
let startButtonImg;
let introSound;
let startSound;
let watermelon_decal;
let orange_decal;
let trail;
let titleScreen;
let instructionScreen;
let game;
let cursorLayer;
let safetyTimer = 0;
let safetyFade = 0;
let wiiFont;
let countdown;
let instructionAudio;
let countdownSound;
let streakSounds = [];
let state = "safety";
let missSound;

let finishImg;
let whistleSound;
let endMusic;

let endScreen;

function preload() { // said assets
  countdownSound = loadSound("assets/countdown.mp3");
  instructionAudio = loadSound("assets/instruction_screen.mp3");
  wiiFont = loadFont("assets/contm.ttf");
  cursorImg = loadImage("assets/wii_cursor.png");
  logoImg = loadImage("assets/gamelogo.png");
  startButtonImg = loadImage("assets/start_button.png");
  introSound = loadSound("assets/intro.mp3");
  startSound = loadSound("assets/start_sound.mp3");
  gameSound = loadSound("assets/game_audio.mp3");
  safetyImg = loadImage("assets/wii_safety.png");
  watermelon_decal = loadImage("assets/watermelon_decal.png");
  orange_decal = loadImage("assets/orange_decal.png");
  instruction_hand = loadImage("assets/instruction_hand.png");
  streakSounds[1] = loadSound("assets/1.mp3");
  streakSounds[2] = loadSound("assets/2.mp3");
  streakSounds[3] = loadSound("assets/3.mp3");
  streakSounds[4] = loadSound("assets/4.mp3");
  streakSounds[5] = loadSound("assets/5.mp3");
  missSound = loadSound("assets/miss.mp3");
  finishImg = loadImage("assets/finished_text.png");
  whistleSound = loadSound("assets/whistle.mp3");
  endMusic = loadSound("assets/end.mp3");
}

function setup() { // setup primarily sets up the program and all the grim layers of 2D and 3D horror
  
  createCanvas(725, 600); // the initial canvas

  
  cursorLayer = createGraphics(725, 600); // the second canvas, for ui and cursor
  cursorLayer.pixelDensity(1);
  cursorLayer.textFont(wiiFont);

  uiLayer = createGraphics(725, 600);
  uiLayer.pixelDensity(1);
  uiLayer.textFont(wiiFont);

  finalEndLayer = createGraphics(725, 600); // another layer! self explanatory
  finalEndLayer.pixelDensity(1);
  finalEndLayer.textFont(wiiFont);

  countdown = new CountdownScreen(this); // initialising a bunch of stuff

  titleScreen = new TitleScreen(
    logoImg,
    startButtonImg,
    introSound,
    startSound
  );

  instructionScreen = new InstructionScreen(this);

  trail = new CursorTrail(cursorImg, 63);
}

function draw() { // the main part of the state machine!
  if (state === "safety") { // that ridiculous image you see at the start, filled with a bunch of timing stuff
    background(255);

    if (safetyTimer < 2.5) {
      safetyFade = lerp(safetyFade, 255, 0.25);
    }

    push();
    tint(255, safetyFade);
    imageMode(CENTER);

    let targetW = width * 0.95;
    let targetH = (safetyImg.height / safetyImg.width) * targetW;

    image(safetyImg, width / 2, height / 2, targetW, targetH);
    pop();

    safetyTimer += deltaTime / 1000;

    if (safetyTimer > 4.75) {
      safetyFade -= 1.95;
      if (safetyFade <= 0) {
        state = "title";
      }
    }

    return;
  }

  
  if (state === "title") { // this draws the titlescreen, barebone because all the styling is in its respective file
    background(255);

    titleScreen.update();
    titleScreen.draw();

    trail.update(mouseX, mouseY);
    trail.draw(mouseX, mouseY);

    if (titleScreen.start) {
      state = "instructions";
      instructionScreen.startAudio();
    }

    return;
  }


  if (state === "instructions") { // draws the instruction screen
    background(255);

    instructionScreen.update();
    instructionScreen.draw();

    trail.update(mouseX, mouseY);
    trail.draw(mouseX, mouseY);

    return;
  }


  if (state === "countdown") { // this draws that jank countdown
    background(255);

    countdown.update();
    countdown.draw();

    return;
  }


  if (state === "transition") { // the grim part, 2D to 3D is no joke. this took HOURS upon HOURS to crack, (although ot this part, uses WebGL)
    background(255);

    if (!this._transitionHold) {
      this._transitionHold = 1;
      return;
    }

    const renderer = createCanvas(725, 600, WEBGL);

    cursorLayer = createGraphics(725, 600);
    cursorLayer.pixelDensity(1);
    cursorLayer.textFont(wiiFont);

    game = new Game(renderer);
    trail = new CursorTrail(cursorImg, 33);

    state = "game";
    return;
  }


  if (state === "game") { // this is what transition was preparing for, This is easily the part ive had the most trouble with this whole project, ive spent at LEAST 10 hours in this section
    cursorLayer.textFont(wiiFont);
    trail.update(mouseX, mouseY);

    // draws the grim 3d part
    game.update();
    game.draw();

    // this rebuilds the cursor
    cursorLayer.clear();
    cursorLayer.textFont(wiiFont);

    // gets ready for the combo popups!
    cursorLayer.textAlign(CENTER, CENTER);
    cursorLayer.textSize(26);

    for (let p of game.streakPops) {
      let baseCol;
      if (p.count === 1) baseCol = color(120, 180, 255, p.alpha);
      else if (p.count === 2) baseCol = color(120, 255, 160, p.alpha);
      else if (p.count === 3) baseCol = color(255, 150, 120, p.alpha);
      else if (p.count === 4) baseCol = color(255, 220, 90, p.alpha);
      else baseCol = color(190, 120, 255, p.alpha);

      cursorLayer.push();
      cursorLayer.translate(p.x, p.y);
      cursorLayer.scale(p.scale);

      cursorLayer.noStroke();
      cursorLayer.fill(
        red(baseCol),
        green(baseCol),
        blue(baseCol),
        p.alpha * 0.4
      );
      cursorLayer.text(p.label, 0, 2);

      cursorLayer.stroke(255, p.alpha);
      cursorLayer.strokeWeight(4);
      cursorLayer.fill(baseCol);
      cursorLayer.text(p.label, 0, 0);

      cursorLayer.pop();
    }

    // this block controls the popups, (i dont actually think this works!)
    cursorLayer.textSize(24);
    cursorLayer.textAlign(CENTER, CENTER);

    for (let pop of game.popups) {
      cursorLayer.push();
      cursorLayer.translate(pop.x, pop.y);
      cursorLayer.scale(pop.scale || 1);

      if (pop.type === "finish") {
        cursorLayer.imageMode(CENTER);
        cursorLayer.tint(255, pop.alpha);
        cursorLayer.image(finishImg, 0, 0, pop.w, pop.h);
        cursorLayer.noTint();
      } else {
        const baseCol = pop.col || color(255);
        cursorLayer.fill(
          red(baseCol),
          green(baseCol),
          blue(baseCol),
          pop.alpha
        );
        cursorLayer.noStroke();
        cursorLayer.text(pop.label, 0, 0);
      }

      cursorLayer.pop();
    }

    // this part controls the sparkles you see once a full combo has been hit
    for (let s of game.sparkles) {
      cursorLayer.push();
      cursorLayer.translate(s.x, s.y);
      cursorLayer.rotate(s.rot);
      cursorLayer.fill(255, 255, 220, s.alpha);
      cursorLayer.noStroke();
      cursorLayer.rect(-5, -1, 10, 2);
      cursorLayer.rect(-1, -5, 2, 10);
      cursorLayer.pop();
    }

    // more cursor trail stuff, believe me you'll see this a lot
    cursorLayer.push();
    cursorLayer.imageMode(CENTER);

    for (let g of trail.ghosts) {
      cursorLayer.tint(0, 120, 255, g.alpha);
      cursorLayer.image(cursorImg, g.x, g.y, trail.size, trail.size);
    }

    cursorLayer.noTint();
    cursorLayer.image(cursorImg, mouseX, mouseY, trail.size, trail.size);
    cursorLayer.pop();

    // these 5 lines are the worst part, juggling 2D and 3D planes WITH debugging is not for the weak, but this just "destroys" the 3D plane
    game.gl.disable(game.gl.DEPTH_TEST);
    resetMatrix();
    translate(-width / 2, -height / 2);
    image(cursorLayer, 0, 0);
    game.gl.enable(game.gl.DEPTH_TEST);

    // once 5 balls have been missed, its time for the endscreen!
    if (game.gameOver && game.endAt && millis() >= game.endAt) {
      game.endAt = null;
      endScreen = new EndScreen(game.score, game.missed);
      if (endMusic && !endMusic.isPlaying()) {
        endMusic.loop();
      }
      state = "end";
      return;
    }

    return;
  }


  if (state === "end") { // more just cleaning up the mess left by WebGL, debugged this many times
    endScreen.update(mouseX, mouseY);

    endScreen.draw(finalEndLayer);


    resetMatrix();
    translate(-width / 2, -height / 2);
    image(finalEndLayer, 0, 0);

    image(cursorImg, mouseX, mouseY, 40, 40);
    return;
  }
}

// general function, just allows the state machine to handle clicks
function mousePressed() {
  if (state === "title") {
    titleScreen.mousePressed();
  }
  if (state === "instructions") {
    instructionScreen.mousePressed();
  }
  if (state === "game" && game) {
    game.handleClick(mouseX, mouseY);
  }
  if (state === "end" && endScreen) {
    endScreen.mousePressed(mouseX, mouseY);
  }
}
