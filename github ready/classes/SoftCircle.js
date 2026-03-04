// so this moreorless controls those outgoing circles you see in the intro screen


class SoftCircle {
  constructor() {
    this.reset();
  }

  reset() {
    const colours = [
      color(140, 220, 90, 80),    
      color(255, 200, 50, 80),    
      color(255, 150, 200, 80),   
      color(120, 180, 255, 80)    
    ];

    this.col = random(colours);

    this.x = random(width);
    this.y = random(height);

    this.size = random(20, 60);
    this.growth = random(0.3, 1.2);

    this.alpha = 80;
  }

  update() {
    this.size += this.growth;
    this.alpha -= 0.4;

    if (this.alpha <= 0) {
      this.reset();
    }
  }

  draw() {
    noFill();
    stroke(this.col);
    strokeWeight(3);

    push();
    stroke(red(this.col), green(this.col), blue(this.col), this.alpha);
    ellipse(this.x, this.y, this.size);
    pop();
  }
}
