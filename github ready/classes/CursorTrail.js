/*
this file defines the CursorTrail class, which is responsible for
drawing the game cursor along with a smooth trailing effect.

instead of the cursor instantly snapping to the mouse position,
a few "ghost" cursors follow behind it using interpolation.
this creates a smoother and more polished gui feel similar to
the pointer effect seen in wii menus.
*/

class CursorTrail {
  constructor(img, size = 64) {
    this.img = img;
    this.size = size;

    this.initialised = false;

    // this part controls the ghost trail
    this.ghosts = [
      { x: 0, y: 0, lerpAmt: 0.45, alpha: 95 },  // closest & brightest
      { x: 0, y: 0, lerpAmt: 0.30, alpha: 70 },  // mid
      { x: 0, y: 0, lerpAmt: 0.18, alpha: 45 }   // soft outer
    ];
  }

  update(mx, my) {
    
    if (!this.initialised) { // refreshes the trail every frame
      for (let g of this.ghosts) {
        g.x = mx;
        g.y = my;
      }
      this.initialised = true;
    }

    
    for (let g of this.ghosts) { // makes sure the trail follows cursor
      g.x = lerp(g.x, mx, g.lerpAmt);
      g.y = lerp(g.y, my, g.lerpAmt);
    }
  }

  draw(mx, my) {
    
    if (!this.img || !this.img.width || !this.img.height) return; 

    
    const ghosts = this.ghosts.slice().reverse(); // this draws the ghost trails
    for (let g of ghosts) {
      tint(0, 120, 255, g.alpha);
      image(this.img, g.x, g.y, this.size, this.size);
    }

    // Main cursor
    noTint();
    image(this.img, mx, my, this.size, this.size);
  }
}
