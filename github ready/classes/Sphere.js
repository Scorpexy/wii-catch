/*
this file defines the Sphere class, which represents the fruit objects
that get launched towards the player during the game.

each sphere stores its own position, velocity, size and appearance.
the class also handles physics such as gravity, movement and the
visual drawing of the object in the 3D WebGL scene.

spheres can either move towards the player (normal gameplay) or be
launched backwards when hit. this class also handles small visual
effects like squash-and-stretch animation and depth fading.
*/

class Sphere {

  // this sets up the sphere's position, velocity and appearance
  constructor(x, y, z, vx, vy, vz, radius, col, decalImg) {

    // position and velocity in 3D space
    this.pos = createVector(x, y, z);
    this.vel = createVector(vx, vy, vz);

    // size of the sphere
    this.radius = radius;

    // visual settings
    this.col = col;
    this.decalImg = decalImg;

    // gameplay state flags
    this.returning = false;
    this.alive = true;

    // gravity strength used for movement
    this.gravity = 280;

    // wobble animation values (used when sphere is hit)
    this.wobbleMag = 0;
    this.wobbleFreq = 0;

    // squash & stretch scaling values
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.scaleZ = 1.0;
  }


  // this launches the sphere backwards after being hit
  // (currently not used in the main game, but kept for future expansion)
  launchBack() {

    this.returning = true;

    // random launch angles and speeds
    const angle = random(-PI * 0.4, PI * 0.4);
    const horizontalSpeed = random(350, 520);
    const backwardSpeed = random(-420, -260);
    const upwardSpeed = random(-460, -280);

    const dir = createVector(sin(angle), 0, -cos(angle)).normalize();

    // apply launch velocities
    this.vel.x = dir.x * horizontalSpeed;
    this.vel.z = backwardSpeed;
    this.vel.y = upwardSpeed;

    // wobble animation settings
    this.wobbleMag = random(30, 60);
    this.wobbleFreq = random(4, 7);

    // large squash effect when launched
    this.scaleX = 1.3;
    this.scaleY = 0.75;
    this.scaleZ = 1.15;
  }


  // this updates the physics and movement of the sphere each frame
  update(dt) {

    // limit maximum velocity so spheres don't go crazy
    this.vel.limit(600);

    // apply gravity
    this.vel.y += this.gravity * dt;

    // update position using velocity
    this.pos.add(p5.Vector.mult(this.vel, dt));

    // gradually return squash/stretch back to normal
    this.scaleX = lerp(this.scaleX, 1.0, 6 * dt);
    this.scaleY = lerp(this.scaleY, 1.0, 6 * dt);
    this.scaleZ = lerp(this.scaleZ, 1.0, 6 * dt);

    // normal forward movement mode
    if (!this.returning) {

      // remove sphere once it passes the player or falls too low
      if (this.pos.z > 450 || this.pos.y > height / 2 + 200