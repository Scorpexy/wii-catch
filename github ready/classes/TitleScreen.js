/*
this file handles the title screen you see when the game first loads.

it draws the logo, start button, and the drifting background circles.
it also manages the intro music and the animation when the player
clicks start.

once the player clicks (or presses B on the wiimote if inclined), the screen fades out while the intro music
fades away, and then the state machine in sketch moves the game
to the instruction screen.
*/

class TitleScreen {

  // this does the initial setup for the title screen
  constructor(logoImg, startButtonImg, introSound, startSound) {

    // state movealong!
    this.start = false;

    // bunch of assets
    this.logo = logoImg;
    this.startButton = startButtonImg;
    this.introSound = introSound;
    this.startSound = startSound;

    // this stops the intro music from looping multiple times (had this big near the start!)
    this.playedIntro = false;

    // this creates the drifting background circles (reused this a lot!!)
    this.circles = [];
    for (let i = 0; i < 6; i++) {
      this.circles.push(new SoftCircle());
    }

    this.fade = 0;       // these are a bunch of misc. variables
    this.scale = 0.9;
    this.hoverOffset = 0;


    this.exiting = false;
    this.exitFade = 0;


    this.fadeDuration = this.startSound.duration();
    this.fadeTimer = 0;
  }


  // this handles the click on the start button, allows game to move on
  mousePressed() {

    if (!this.exiting) {

      // play the start sound
      if (this.startSound && !this.startSound.isPlaying()) {
        this.startSound.play();
      }

      // trigger the fade transition
      this.exiting = true;
      this.fadeTimer = 0;
    }
  }


  // more stuff which runs every frame!
  update() {

    // starts the intro music!
    if (!this.playedIntro && this.introSound) {
      this.introSound.loop();
      this.playedIntro = true;
    }

    // fadein for the start
    if (this.fade < 255) this.fade += 4;


    if (this.scale < 1.0) this.scale += 0.004;

    
    this.hoverOffset = sin(frameCount * 0.03) * 5; // this lets the start butto hover

    // this block runs once the player clicks start
    if (this.exiting) {

      
      this.fadeTimer += deltaTime / 1000;

      let t = constrain(this.fadeTimer / this.fadeDuration, 0, 1);

      // fade out the intro music relatively slowly
      if (this.introSound && this.introSound.isPlaying()) {
        this.introSound.setVolume(lerp(1.0, 0.0, t));
      }

      // fades the screen to white
      this.exitFade = lerp(0, 255, t);

      // once fade completes, allow state machine to continue to the instructions!
      if (t >= 1) {
        this.start = true;
      }
    }
  }


  
  draw() {

    background(255);

    // draws the background circles
    for (let c of this.circles) {
      c.update();
      c.draw();
    }

    imageMode(CENTER);
    tint(255, this.fade);

    // this draws the logo
    push();
    scale(this.scale);

    image(
      this.logo,
      width / 2 / this.scale,
      (height / 2 - 40) / this.scale,
      this.logo.width * 0.5,
      this.logo.height * 0.5
    );

    pop();

    // draw the start button with slight floating animation (discussed earlier)
    const buttonY = height * 0.72 + this.hoverOffset;

    image(
      this.startButton,
      width / 2,
      buttonY,
      this.startButton.width * 0.3,
      this.startButton.height * 0.3
    );

    // draws a slight white fade upon exit.
    if (this.exiting) {

      noStroke();
      fill(255, this.exitFade);

      rect(0, 0, width, height);
    }
  }
}