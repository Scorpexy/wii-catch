/*
this file handles the final results screen shown after the game finishes.
it draws the results panel, ambience, and restart button on a
separate 2D plane so it doesn't interfere with the 3d plane made by webgl. class also manages a bunch of stylistic stuff, such as button styles and all.
*/

class EndScreen {

  // this does the initial setup for the results screen
  constructor(score, missed) {

    this.score = score;
    this.missed = missed;

    this.cx = width / 2;
    this.cy = height / 2;

    this.panelW = 500;
    this.panelH = 330;

    this.btnW = 260;
    this.btnH = 75;
    this.btnX = this.cx;
    this.btnY = this.cy + 100;

    this.hover = false;
    this.appearT = 0;

    // so this generates the circles that drift around (loads of these around game)
    this.circles = [];

    for (let i = 0; i < 14; i++) {
      this.circles.push({
        x: random(width),
        y: random(height),
        r: random(70, 180),
        speed: random(0.2, 0.45),
        col: color(
          random(120, 200),
          random(150, 210),
          random(255),
          random(18, 40)
        )
      });
    }
  }


  // this is just stuff which loops every frame
  update(mx, my) {

    // this is a smooth animation which brings in the screen
    this.appearT = min(this.appearT + 0.06, 1);

    // this checks if the cursor is hovering over restart button
    this.hover =
      mx > this.btnX - this.btnW / 2 &&
      mx < this.btnX + this.btnW / 2 &&
      my > this.btnY - this.btnH / 2 &&
      my < this.btnY + this.btnH / 2;
  }


  // this draws the entire end screen UI, this required me to pass in "layer" due to a problem with the 2D and 3D planes
  draw(layer) {

    layer.clear();
    layer.push();
    layer.rectMode(CENTER);
    layer.textAlign(CENTER, CENTER);
    layer.noStroke();


    // this actually draws the floating background circles
    for (let c of this.circles) {

      let drift = sin(frameCount * 0.01 * c.speed) * 14 * this.appearT;

      layer.fill(
        red(c.col),
        green(c.col),
        blue(c.col),
        alpha(c.col)
      );

      layer.ellipse(
        c.x + drift,
        c.y + drift * 0.5,
        c.r,
        c.r
      );
    }


    // so this fades the whole screen in smoothly
    layer.fill(255, 200 * this.appearT);
    layer.rect(width / 2, height / 2, width, height);


    // this dims the background behind the results panel
    layer.fill(0, 120 * this.appearT);
    layer.rect(width / 2, height / 2, width + 60, height + 60);


    
    let yOffset = lerp(80, 0, this.appearT);

    layer.fill(0, 45 * this.appearT);
    layer.rect(
      this.cx,
      this.cy + yOffset + 12,
      this.panelW * 0.96,
      this.panelH * 0.96,
      50
    );


    // silver gradient wooooo
    let grad = layer.drawingContext.createLinearGradient(
      this.cx,
      this.cy - this.panelH / 2,
      this.cx,
      this.cy + this.panelH / 2
    );

    grad.addColorStop(0, "rgb(255,255,255)");
    grad.addColorStop(1, "rgb(232,232,232)");

    layer.drawingContext.fillStyle = grad;

    layer.rect(
      this.cx,
      this.cy + yOffset,
      this.panelW,
      this.panelH,
      45
    );


    // more stying (specificaly highlights)
    layer.fill(255, 70 * this.appearT);

    layer.rect(
      this.cx,
      this.cy + yOffset - this.panelH * 0.27,
      this.panelW * 0.85,
      this.panelH * 0.18,
      35
    );


    // this but just draws the text for the results, nothing fancy
    layer.fill(20, 255 * this.appearT);

    layer.textSize(44);
    layer.text(
      "Results",
      this.cx,
      this.cy + yOffset - 95
    );

    layer.textSize(30);

    layer.text(
      `Score: ${this.score}`,
      this.cx,
      this.cy + yOffset - 20
    );

    layer.text(
      `Missed: ${this.missed} / 5`,
      this.cx,
      this.cy + yOffset + 25
    );


    // the restart button
    let btnY = this.btnY + yOffset;
    let btnColor = this.hover ? "#37c4ff" : "#2196f3";


    
    let glowAlpha = this.hover ? 85 : 55;

    layer.fill(0, glowAlpha * this.appearT);

    layer.ellipse(
      this.btnX,
      btnY + 4,
      this.btnW * 1.05,
      this.btnH * 0.55
    );


    // this creates a gradient around the button
    let bgrad = layer.drawingContext.createLinearGradient(
      this.btnX,
      btnY - this.btnH / 2,
      this.btnX,
      btnY + this.btnH / 2
    );

    bgrad.addColorStop(0, "#9ee9ff");
    bgrad.addColorStop(1, btnColor);

    layer.drawingContext.fillStyle = bgrad;

    layer.rect(
      this.btnX,
      btnY,
      this.btnW,
      this.btnH,
      32
    );


    // this adds the shiny look across the button
    layer.fill(255, 110 * this.appearT);

    layer.rect(
      this.btnX,
      btnY - this.btnH / 3.3,
      this.btnW * 0.7,
      this.btnH * 0.35,
      20
    );


    // more text! this time the button txt
    layer.fill(255);

    layer.textSize(33);
    layer.text(
      "Restart",
      this.btnX,
      btnY + 2
    );

    layer.pop();
  }


  // click handling, seen this millions of times
  mousePressed(mx, my) {

    if (this.hover) {

      if (endMusic && endMusic.isPlaying()) {
        endMusic.stop();
      }

      // tells state machine to switch back to "transition"
      game = null;
      state = "transition";
    }
  }
}