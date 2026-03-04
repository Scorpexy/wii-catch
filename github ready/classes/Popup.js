/*
this file isn't used much, but is responsible for displaying
temporary animated text notifications during gameplay, i.e. the combos and all

these popups are used for things like score rewards, combo labels,
and miss indicators. each popup has its own unique set of colours and other attributes

this class is heavily reused throughout the program, esp. in game.js
*/

class Popup {
  constructor(layer, x, y, text, options = {}) {

    this.layer = layer; // this initialises the graphics layer


    this.x = x;
    this.y = y;

    this.text = text;


    this.col = options.col || color(255); // these
    this.outline = options.outline || null;


    this.size = options.size || 28;
    this.alpha = options.alpha || 255;


    this.vy = options.vy || -0.5;

    this.decay = options.decay || 3;


    this.scale = options.scale || 1.0;
    this.scaleSpeed = options.scaleSpeed || 0.003;


    this.done = false; // this just marks when the popup is done
  }


  update() {

    // moves the pop, up!
    this.y += this.vy;

  
    this.alpha -= this.decay;


    this.scale += this.scaleSpeed;

    // removes once transparency 0
    if (this.alpha <= 0) this.done = true;
  }


  // this controls the drawing of the popups etc
  draw() {

    this.layer.push();

    
    this.layer.translate(this.x, this.y); // this part cleverly moves the centre to where the popup needs to be drawn, making drawing way easier

    
    this.layer.scale(this.scale); // this appllies a scale animation

    // this forces the text to render in the centre
    this.layer.textAlign(CENTER, CENTER);
    this.layer.textSize(this.size);

    
    if (this.outline) {
      this.layer.stroke(this.outline);
      this.layer.strokeWeight(4);
    } 
    else {
      this.layer.noStroke();
    }

    // this makes sure the drawn text fades carefully
    this.layer.fill(
      red(this.col),
      green(this.col),
      blue(this.col),
      this.alpha
    );

    // actually render the popup text
    this.layer.text(this.text, 0, 0);

    this.layer.pop();
  }
}