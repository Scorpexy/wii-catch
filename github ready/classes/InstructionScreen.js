/*
this file controls the instruction screen that appears before gameplay starts.

it briefly explains the controls to the player and shows the instruction graphic (took a bit to make!),
while also running the soft background circle animation used across the game.

when the player clicks the start button, the screen performs a transition akin to a "whiteboard
wipe" which clears the screen from left to right. once the wipe
finishes, the state machine in sketch (yes this again) moves the program into the countdown
state which begins gameplay. (and the move to 3d!)
*/

class InstructionScreen {

  // this sets up the instruction screen and prepares animations
  constructor(p) {

    this.p = p;


    this.alpha = 0;
    this.fadeInSpeed = 12;

    // the image with the wiimote and hand
    this.instructionImg = instruction_hand;

    // more circles!
    this.circles = [];

    for (let i = 0; i < 20; i++) {

      this.circles.push(
        new SoftCircle(
          this.p.random(this.p.width),
          this.p.random(this.p.height),
          this.p.random(40, 120),
          this.p.color(255, 150)
        )
      );

    }

    
    this.buttonFade = 0; // misc vars
    this.buttonScale = 0.9;
    this.buttonHover = 0;

    
    this.swiping = false;
    this.swipeX = 0;
    this.swipeSpeed = 40;
  }


  // this starts the looping instruction audio (believe this is actuallt the menu music)
  startAudio() {

    if (!instructionAudio.isPlaying()) {
      instructionAudio.loop();
    }

  }


  // this just tidies up and stops the music once the scene is transitione
  stopAudio() {

    if (instructionAudio.isPlaying()) {
      instructionAudio.stop();
    }

  }



  update() {

    const p = this.p;

    // smooth fadein again
    this.alpha = p.lerp(this.alpha, 255, 0.1);

    // a few button animation effects
    if (this.buttonFade < 255) this.buttonFade += 4;
    if (this.buttonScale < 1.0) this.buttonScale += 0.004;

    // the button floats again, same code
    this.buttonHover = Math.sin(frameCount * 0.03) * 5;


    for (let c of this.circles) c.update();


    // this part controls the whiteboard wipe transition
    if (this.swiping) {

      this.swipeX += this.swipeSpeed;

      // stops the "wipe" from going off the screen (wipe being a sold white rectangle)
      if (this.swipeX >= p.width) {

        this.swipeX = p.width;

        this._wipeHoldFrames = this._wipeHoldFrames ?? 2;
        this._wipeHoldFrames--;

        if (this._wipeHoldFrames <= 0) {

          // tells state machine to move on to the countdown
          this.stopAudio();
          state = "countdown";
          countdownSound.play();

        }
      }
    }
  }



  draw() {

    const p = this.p;

    p.textFont(wiiFont);


    p.background(255);

  
    for (let c of this.circles) c.draw();


    // draws the blue title bar up top, used to be grey!
    p.fill(50, 130, 255);
    p.noStroke();
    p.rectMode(p.CENTER);
    p.rect(p.width / 2, 70, 380, 55, 16);

    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(28);

    p.text("Stage 1", p.width / 2, 58);


    
    const panelX = p.width / 2 - 300;
    const panelY = 110;
    const panelW = 600;
    const panelH = 240;

    p.rectMode(p.CORNER);
    p.fill(240);
    p.rect(panelX, panelY, panelW, panelH, 16);


    // this draws the panel which holds the image asset
    const imgCardW = 200;
    const imgCardH = 200;
    const imgCardX = panelX + 25;
    const imgCardY = panelY + (panelH / 2 - imgCardH / 2);

    p.fill(255);
    p.rect(imgCardX, imgCardY, imgCardW, imgCardH, 14);



    if (this.instructionImg) {

      p.image(
        this.instructionImg,
        imgCardX + 95,
        imgCardY + 100,
        185,
        185
      );

    }


    // section with the actual instructions
    const textX = imgCardX + imgCardW + 40;
    const textY = imgCardY + 5;

    p.fill(40);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(18);

    p.text(
      "Catch the fruit by pointing at the screen.\n" +
      "Press B with your Wii Remote.(OR LMB)\n\n" +
      "Catch as many as you can.\n" +
      "Combo catches earn bonus points!",
      textX,
      textY
    );


    // another start button, will never get sick of these
    if (startButtonImg) {

      const btnW = 140;
      const btnH = 55;

      const boxBottom = panelY + panelH;
      const midY = (boxBottom + p.height) / 2;

      const btnX = p.width / 2;
      const btnY = midY + this.buttonHover;

      p.push();

      p.imageMode(p.CENTER);
      p.tint(255, this.buttonFade);
      p.scale(this.buttonScale);

      p.image(
        startButtonImg,
        btnX / this.buttonScale,
        btnY / this.buttonScale,
        btnW,
        btnH
      );

      p.pop();
    }


    // more transition control, nothing special
    if (this.swiping) {

      p.noStroke();
      p.fill(255);

      p.rectMode(p.CORNER);
      p.rect(0, 0, this.swipeX, p.height);

    }
  }


  // means the transition starts upon click (or b on wiimote)
  mousePressed() {

    if (!this.swiping) {

      this.swiping = true;
      this.swipeX = 0;

    }

  }

}