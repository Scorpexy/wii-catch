/*
this file controls the countdown screen between the instructions and gamr

it displays the standard 321 go countdown while a bunch of 
circles drift around the background. the colours of the circles and
the text change each second to correspond to the current number.

once the countdown finishes, this class tells the state machine
in sketch to move into the transition state, which prepares the
webgl 3d stuff gameplay renderer.
*/
class CountdownScreen {
  constructor(p) {
    this.p = p;
    this.timer = 0;
    this.finished = false;

    // this holds the reused pastel colours i think fit
    this.colors = {
      3: this.p.color(255, 120, 180), // pink
      2: this.p.color(120, 255, 160), // green
      1: this.p.color(120, 180, 255), // blue
      go: this.p.color(255, 150, 150), // redish
    };

    // circles again
    this.circles = [];
    for (let i = 0; i < 14; i++) {
      this.circles.push(this.makeCircle());
    }

    this.lastPhase = -1;
    this.currentTint = this.colors[3];
  }

  makeCircle() {
    return {
      x: this.p.random(this.p.width),
      y: this.p.random(this.p.height),
      r: this.p.random(60, 180),
      vx: this.p.random(-0.3, 0.3),
      vy: this.p.random(-0.3, 0.3),
    };
  }

  update() {
    this.timer += deltaTime / 1000;
    for (let c of this.circles) {
      c.x += c.vx;
      c.y += c.vy;

      if (c.x < -c.r) c.x = this.p.width + c.r;
      if (c.x > this.p.width + c.r) c.x = -c.r;
      if (c.y < -c.r) c.y = this.p.height + c.r;
      if (c.y > this.p.height + c.r) c.y = -c.r;
    }

    // this is the actual countdown, synced with the audio
    if (this.timer >= 3.8 && !this.finished) {
      this.finished = true;
      if (countdownSound.isPlaying()) countdownSound.stop();
      state = "transition";
    }
  }

  draw() {
    const p = this.p;
    p.background(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textFont(wiiFont);

    let t = this.timer;
    let phase, textToShow;

    // this part just determines which number has what colour, and what colour the surroudning circles turn
    if (t < 1) {
      phase = 3;
      textToShow = "3";
    } else if (t < 2) {
      phase = 2;
      textToShow = "2";
    } else if (t < 3) {
      phase = 1;
      textToShow = "1";
    } else {
      phase = 0;
      textToShow = "GO!";
    }

    // this part updates the circle colour
    if (phase !== this.lastPhase) {
      this.lastPhase = phase;
      this.currentTint = this.colors[phase === 0 ? "go" : phase];
    }

    // very slightly different circle drawing now, just contros colours
    p.noFill();
    for (let c of this.circles) {
      let col = p.color(
        p.red(this.currentTint),
        p.green(this.currentTint),
        p.blue(this.currentTint),
        45
      );
      p.stroke(col);
      p.strokeWeight(3);
      p.circle(c.x, c.y, c.r);
    }

    // draws the fun go which inverts itself (its not a bug, its a feature!)
    let fade;

    if (phase >= 1 && phase <= 3) {
      fade = t % 1 < 0.7 ? 1 : p.map(t % 1, 0.7, 1, 1, 0);
    } else {
      fade = p.map(t, 3, 3.3, 1, 0);
    }

    p.fill(this.currentTint);
    p.textSize(textToShow === "GO!" ? 150 : 180);

    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.scale(fade);
    p.text(textToShow, 0, 0);
    p.pop();
  }
}
