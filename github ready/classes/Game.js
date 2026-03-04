/*
this file contains the main gameplay logic.

the Game class handles everything that happens during the playable
portion of the program. it spawns fruit spheres, updates physics,
tracks score and misses, handles player clicks, and draws the
3D scene using the WebGL renderer.

now because WebGL helpfully uses a different coordinate system from the UI,
i disabled depth testing on this class due to obvious difficulties with that.

once the player misses too many spheres (5), end sequence is triggered 
to the end screen, as well as attempting to tidy up all of the 3d plane stuff
*/

class Game {

  // this sets up the gameplay system and prepares all variables
  constructor(renderer) {

    // new epic renderer passed in from sketch.js
    this.renderer = renderer;
    this.gl = renderer.GL;


    this.initialised = false;
    this.spheres = [];
    this.spawnTimer = 0;
    this.gameSound = gameSound;


    this.streakPops = [];

    this.sparkles = [];


    this.popups = [];


    this.missed = 0;
    this.maxMisses = 5; // yeah 5 misses is max (made it 1 when testing)

    
    this.sphereLifetime = 2.0; // as in 2 seconds

    this.missSound = missSound;

    // score counter
    this.score = 0;

  
    this.gameOver = false;
    this.endAt = null;

    // cannon spawn points for spheres
    this.cannons = [
      createVector(-220, -200, -600),
      createVector(0, -200, -600),
      createVector(220, -200, -600),
    ];

    // initialises the circles
    this.softCircles = [];

    for (let i = 0; i < 14; i++) {

      this.softCircles.push({
        x: random(width),
        y: random(height),
        r: random(80, 180),
        vx: random(-0.08, 0.08),
        vy: random(-0.04, 0.04),

        col: [
          color(255, 120, 180, 45),
          color(120, 180, 255, 45),
          color(120, 255, 160, 45),
          color(255, 200, 120, 45),
        ][i % 4],
      });

    }
  }


  update() {

    // start looping game music once, otherwise game would be eerily silent after a bit
    if (!this.playedIntro && this.gameSound) {
      this.gameSound.loop();
      this.playedIntro = true;
    }

    if (!this.initialised) this.initialised = true;

    const dt = deltaTime / 1000;

    // this stops updating gameplay if the game has finished
    if (this.gameOver) {
      return;
    }


    // this is the sphere spawning timer
    this.spawnTimer -= dt;

    if (this.spawnTimer <= 0) {
      this.spawnTimer = random(1.2, 2.0);
      this.spawnSphere();
    }


    // circles again!
    for (let c of this.softCircles) {

      c.x += c.vx * (dt * 60);
      c.y += c.vy * (dt * 60);

      if (c.x < -c.r) c.x = width + c.r;
      if (c.x > width + c.r) c.x = -c.r;
      if (c.y < -c.r) c.y = height + c.r;
      if (c.y > height + c.r) c.y = -c.r;

    }


    // this updates the sphere physics
    for (let s of this.spheres) s.update(dt);


    // detect missed spheres based on lifetime (didnt want to mess with boundaries on a 2d - 3d plane)
    for (let s of this.spheres) {

      if (
        !s.hitRegistered &&
        millis() - s.bornTime > this.sphereLifetime * 1000
      ) {

        this.missed++;

        if (this.missSound) this.missSound.play();


        // red X popup (at the bottom of the screen)
        this.popups.push({
          x: width / 2,
          y: height - 120,
          label: "✖",
          alpha: 255,
          scale: 2.2,
          col: color(255, 60, 60),
        });


        // is the MISS text popup
        this.popups.push({
          x: width / 2,
          y: height - 70,
          label: "MISS!",
          alpha: 255,
          scale: 1.0,
          col: color(255),
        });

        s.alive = false;

        // if too many misses occur, end the game (5)
        if (this.missed >= this.maxMisses) {
          this.finishGame();
        }
      }
    }


    // this remove spheres marked as "dead", otherwise the browser wouldnt be able to handle them objects
    this.spheres = this.spheres.filter((s) => s.alive);


    // this updates the  combo streak popups
    for (let p of this.streakPops) {

      p.lifetime -= dt;
      p.y -= 20 * dt;

      p.alpha = map(p.lifetime, 0, 1, 0, 255);
      p.scale = lerp(p.scale, 1.0, 10 * dt);

    }

    this.streakPops = this.streakPops.filter((p) => p.lifetime > 0);


    // this updates those sparkles after "DIVINE!"
    for (let s of this.sparkles) {

      s.lifetime -= dt;

      s.x += s.vx * (dt * 60);
      s.y += s.vy * (dt * 60);

      s.alpha = map(s.lifetime, 0, s.maxLife, 0, s.startAlpha);

      s.rot += s.rotSpeed * dt;

    }

    this.sparkles = this.sparkles.filter((s) => s.lifetime > 0);


    // update general popups like combos
    for (let p of this.popups) {

      if (p.type === "finish") {

        // controls the fadein animation for finished banner
        p.alpha += 12;
        if (p.alpha > 255) p.alpha = 255;

      } else {

        p.y -= 0.4;
        p.alpha -= 4;
        p.scale += 0.003;

      }
    }

    this.popups = this.popups.filter((p) => p.alpha > 0);
  }


  // this spawns a new sphere from one of the cannons
  spawnSphere() {

    if (this.gameOver) return;

    const base = random(this.cannons);

    const camPos = createVector(0, 0, 420);
    const dir = p5.Vector.sub(camPos, base).normalize();

    const sideways = createVector(random(-1, 1), 0, 0).normalize();
    sideways.mult(random(0.2, 0.6));

    dir.add(sideways).normalize();

    const speed = random(260, 340);

    const vx = dir.x * speed;
    const vy = dir.y * speed * 0.4;
    const vz = dir.z * speed;

    let radius, decal;

    if (random() < 0.5) {
      radius = 28;
      decal = orange_decal;
    } else {
      radius = 48;
      decal = watermelon_decal;
    }

    const s = new Sphere( // this part is the blueprint for a sphere, pretty self explanatory
      base.x,
      base.y,
      base.z,
      vx,
      vy,
      vz,
      radius,
      color(255),
      decal
    );

    s.bornTime = millis();
    s.hitRegistered = false;

    this.spheres.push(s);
  }


 
  draw() { // this draws the gameplay scene w/ the grav. asw 

    // background gradient
    this.setGradientBackground();

    // circles . . .
    this.drawSoftCircles();


    // adds a little bit of sway i suppose, doesnt really show that well though
    const sway = sin(frameCount * 0.01) * 8;
    const bob = cos(frameCount * 0.013) * 4;

    perspective();
    camera(sway, bob, 420, 0, 0, 0, 0, 1, 0);


    // this controls the lighting i added, looked very weird earlier
    ambientLight(120);
    directionalLight(200, 220, 255, 0.3, -0.5, -1);
    directionalLight(180, 200, 255, -0.2, 0.4, -0.8);



    for (let s of this.spheres) this.drawShadowForSphere(s);



    for (let s of this.spheres) s.draw();


    this.drawHUD();
  }


 
  handleClick(mx, my) {  // thispart was easier than i anticipated, this handles player clicks on spheres, nothing bad at all

    if (this.gameOver) return;

    const camZ = 420;

    for (let s of this.spheres) {

      const relZ = camZ - s.pos.z;

      if (relZ <= 0) continue;

      const scale = camZ / relZ;

      const sx = width / 2 + s.pos.x * scale;
      const sy = height / 2 + s.pos.y * scale;

      const screenR = s.radius * scale * 1.2;

      if (dist(mx, my, sx, sy) < screenR) {

        s.returning = true;           // the next few lines surround the physics and projectile motion I had to write
        s.vel.z = -abs(s.vel.z) * 1.3;
        s.vel.y = random(-150, -100);
        s.vel.x *= -0.5;

        s.scaleX = 1.25;
        s.scaleY = 0.8;
        s.scaleZ = 1.15;

        if (!s.hitCount) s.hitCount = 0;

        s.hitCount++;
        if (s.hitCount > 5) s.hitCount = 5;

        const rewardTable = [0, 10000, 20000, 30000, 40000, 50000];

        const reward = rewardTable[s.hitCount];

        this.score += reward;


        this.popups.push({
          x: sx,
          y: sy,
          label: "+" + reward,
          alpha: 255,
          scale: 1.15,
          col: color(255),
        });

        s.hitRegistered = true;

        if (streakSounds[s.hitCount]) {
          streakSounds[s.hitCount].play();
        }

        this.spawnStreakPopup(s, sx, sy, s.hitCount);

        if (s.hitCount === 5) {
          this.spawnSparkles(sx, sy);
        }

        return;
      }
    }
  }



  finishGame() { // this part just plays cleanup crew, stops all current stuff and preps for change in canvas

    if (this.gameOver) return;

    this.gameOver = true;

   
    this.endAt = millis() + 1500;

    
    for (let s of this.spheres) s.alive = false; // this stops the spheres

    this.spawnTimer = 999999;


    
    if (this.gameSound && this.gameSound.isPlaying()) { // this stops game music
      this.gameSound.stop();
    }


    
    if (typeof whistleSound !== "undefined" && whistleSound) { // plays whistle sound
      whistleSound.play();
    }


    // finished banner popup
    this.popups.push({
      type: "finish",
      x: width / 2,
      y: height / 2 - 20,
      w: 350,
      h: (finishImg.height / finishImg.width) * 350,
      alpha: 0,
      scale: 1.0,
    });


    
    this.spawnSparkles(width / 2, height / 2 + 80); // just adds sparkles around the banner
  }

}