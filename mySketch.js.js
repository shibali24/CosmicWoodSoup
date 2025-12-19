// Cosmic Wood Soup
// by Shibali Mishra

let started = false;

// images
let sunImg;
let planetImgs = [];

// for intro + pickup/release ticks
let sndTap, sndKnock, sndImpact;

// planets + sun
let bodies = [];
let sun;

// starfield
let stars = [];

// StarFluid-ish visual system
let FLOW_COLS = 140;
let FLOW_ROWS = 90;
let flow;
let dye;
let particles = [];
let MAX_PARTICLES = 14000;

// chaos knobs
const BG_FADE_ALPHA = 14;
const DYE_DECAY = 0.988;
const FLOW_DECAY = 0.988;
const FLOW_DIFFUSE = 0.03;
const BASE_EMIT = 55;
const BURST_EMIT = 900;
const BURST_DYE = 0.85;

// trail knobs
const TRAIL_LIFE = 115;
const TRAIL_FADE = 3.0;
const TRAIL_POINTS_MAX = 110;
const TRAIL_ALPHA_MAX = 42;
const TRAIL_WEIGHT_MAX = 4.8;
const TRAIL_GLITTER_RATE = 7;

/* ---------
   Classes  
   --------- */

class Star {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.b = random(35, 100);
    this.s = random(1, 2.6);
  }
  update() {
    this.b += random(-1.2, 1.2);
    this.b = constrain(this.b, 30, 100);
  }
  display() {
    fill(210, 30, this.b, 50);
    ellipse(this.pos.x, this.pos.y, this.s);
  }
}

class FlowParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.life = random(40, 220);
    this.hue = random(170, 320);
    this.size = random(0.9, 2.6);
  }

  step() {
    let i = floor(map(this.pos.x, 0, width, 0, FLOW_COLS));
    let j = floor(map(this.pos.y, 0, height, 0, FLOW_ROWS));

    if (i >= 0 && j >= 0 && i < FLOW_COLS && j < FLOW_ROWS) {
      let idx = i + j * FLOW_COLS;
      let v = flow[idx];

      this.vel.add(v.x * 1.35, v.y * 1.35);

      this.vel.add(
        (noise(this.pos.x * 0.004, this.pos.y * 0.004, frameCount * 0.012) - 0.5) * 0.22,
        (noise(this.pos.x * 0.004 + 50, this.pos.y * 0.004 + 50, frameCount * 0.012) - 0.5) * 0.22
      );

      this.vel.mult(0.915);
      this.vel.limit(4.2);
    }

    this.pos.add(this.vel);
    this.life -= 1;

    if (this.pos.x < 0) this.pos.x += width;
    if (this.pos.x > width) this.pos.x -= width;
    if (this.pos.y < 0) this.pos.y += height;
    if (this.pos.y > height) this.pos.y -= height;

    if (this.life <= 0) {
      this.pos.set(random(width), random(height));
      this.vel.set(0, 0);
      this.life = random(40, 220);
      this.hue = random(170, 320);
      this.size = random(0.9, 2.6);
    }
  }

  render() {
    let a = map(this.life, 0, 220, 0, 60, true);
    fill(this.hue, 25, 100, a);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
}

class Sun {
  constructor(x, y, r) {
    this.pos = createVector(x, y);
    this.radius = r;
    this.pulse = 0;
  }

  hit(mx, my) {
    return dist(mx, my, this.pos.x, this.pos.y) < this.radius * 0.55;
  }

  burst() {
    // short impact tick, not a long sample playback
    playOneShotClip(sndImpact, 0.12, random(0.95, 1.15), 0, 0.14);

    let centerHue = random(8, 28);
    for (let k = 0; k < 120; k++) {
      let ang = random(TWO_PI);
      let rad = random(this.radius * 0.1, this.radius * 0.9);
      let x = this.pos.x + cos(ang) * rad;
      let y = this.pos.y + sin(ang) * rad;
      let vx = cos(ang) * random(0.25, 0.85);
      let vy = sin(ang) * random(0.25, 0.85);
      injectAt(x, y, vx, vy, centerHue, BURST_DYE * random(0.4, 1.0), 0);
    }

    for (let i = 0; i < BURST_EMIT; i++) {
      if (particles.length < MAX_PARTICLES) {
        let ang = random(TWO_PI);
        let rad = random(this.radius * 0.1, this.radius * 1.2);
        particles.push(
          new FlowParticle(
            this.pos.x + cos(ang) * rad,
            this.pos.y + sin(ang) * rad
          )
        );
      }
    }

    this.pulse = 80;
  }

  display() {
    push();
    imageMode(CENTER);

    blendMode(ADD);
    noStroke();

    let aura = this.radius * (2.2 + 0.15 * sin(frameCount * 0.02));

    fill(18, 90, 100, 10);
    ellipse(this.pos.x, this.pos.y, aura);

    fill(10, 90, 100, 6);
    ellipse(this.pos.x, this.pos.y, aura * 1.25);

    if (this.pulse > 0) {
      fill(12, 100, 100, this.pulse * 0.22);
      ellipse(this.pos.x, this.pos.y, aura * 1.45);
      this.pulse *= 0.92;
      if (this.pulse < 0.5) this.pulse = 0;
    }
	// draw the PNG last so it sits on top of the halo
	blendMode(BLEND);
	
	tint(0, 0, 100, 100);
	image(sunImg, this.pos.x, this.pos.y, this.radius * 1.15, this.radius * 1.15);
	
	blendMode(ADD);

    blendMode(BLEND);
    pop();
  }
}

class Planet {
  constructor(x, y, img) {
    this.pos = createVector(x, y);
    this.prev = this.pos.copy();
    this.vel = createVector();

    this.img = img;

    // planets size
    this.size = random(58, 92) * 2.5;
    this.hue = random(160, 320);

    this.dragging = false;
    this.dragTime = 0;

    // local volume target; audio uses amp() ramps
    this.targetVol = 0;

    // each planet owns its own loop, only allowed to run while dragging
    let choice = int(random(3));
    if (choice === 0) this.sound = new p5.SoundFile("wood_tap.wav");
    else if (choice === 1) this.sound = new p5.SoundFile("wood_knock.wav");
    else this.sound = new p5.SoundFile("wood_impact.wav");

    this.sound.setLoop(true);
    this.sound.amp(0);

    // stop after fade 
    this._stopTimer = null;

    this.trail = [];

    // Weavesilk inspo
    this.symmetry = int(random([4, 6, 8, 10, 12]));
    this.strands = 4;
    this.strandSpread = random(1.2, 2.3);
    this.phase = random(TWO_PI);

	this.orbitAngle = random(TWO_PI);
	this.orbitRadius = min(width, height) * 0.28;
	this.orbitSpeed = random(0.002, 0.006);

  }

  update() {
    this.vel = p5.Vector.sub(this.pos, this.prev);
    this.prev = this.pos.copy();

    // enforce only while dragging audio:
    // if not dragging, fade to zero and stop shortly after
    if (!this.dragging) {
      this.targetVol = 0;

      if (this.sound.isPlaying()) {
        this.sound.amp(0, 0.12);

        if (!this._stopTimer) {
          this._stopTimer = setTimeout(() => {
            this.sound.stop();
            this._stopTimer = null;
          }, 140);
        }
      }
    } else {
      // dragging: cancel any pending stop and keep the loop alive
      if (this._stopTimer) {
        clearTimeout(this._stopTimer);
        this._stopTimer = null;
      }

      if (!this.sound.isPlaying()) this.sound.loop();

      this.sound.amp(this.targetVol, 0.08);

      this.dragTime++;

      let speed = this.vel.mag();

      // inject flow/dye
      let fx = constrain((this.vel.x / width) * 130, -0.85, 0.85);
      let fy = constrain((this.vel.y / height) * 130, -0.85, 0.85);
      injectAt(this.pos.x, this.pos.y, fx, fy, this.hue, map(speed, 0, 24, 0.05, 0.22, true), BASE_EMIT);

      // micro bursts when fast
      if (speed > 14 && frameCount % 4 === 0) {
        injectAt(
          this.pos.x + random(-8, 8),
          this.pos.y + random(-8, 8),
          fx * random(0.6, 1.2),
          fy * random(0.6, 1.2),
          (this.hue + random(-20, 20) + 360) % 360,
          0.22,
          40
        );
      }

      // trail
      if (this.dragTime > 12 && frameCount % 2 === 0) {
        this.trail.push({ pos: this.pos.copy(), life: TRAIL_LIFE });
        if (this.trail.length > TRAIL_POINTS_MAX) this.trail.shift();
      }
    }

    for (let t of this.trail) t.life -= TRAIL_FADE;
    this.trail = this.trail.filter(t => t.life > 0);
  }

  display() {
    push();
    imageMode(CENTER);
    tint(0, 0, 100, 100);
    image(this.img, this.pos.x, this.pos.y, this.size, this.size);
    pop();
  }

  displaySilk() {
    if (this.trail.length < 4) return;

    push();
    translate(width / 2, height / 2);

    for (let k = 0; k < this.symmetry; k++) {
      rotate(TWO_PI / this.symmetry);
      for (let s = 0; s < this.strands; s++) this.drawRibbon(s);
    }

    pop();
  }

  drawRibbon(strandIndex) {
    let strandPhase = this.phase + strandIndex * 1.9;
    let offsetMag = (strandIndex - (this.strands - 1) / 2) * this.strandSpread;

    noFill();
    beginShape();

    for (let i = 0; i < this.trail.length; i++) {
      let t = this.trail[i];
      let age = t.life / TRAIL_LIFE;

      let sustain = constrain(this.dragTime / 140.0, 0, 1);

      let alpha = map(age, 0, 1, 0, TRAIL_ALPHA_MAX) * (0.6 + 0.8 * sustain);
      let weight = map(age, 0, 1, 0.55, TRAIL_WEIGHT_MAX) * (0.65 + 0.95 * sustain);

      stroke((this.hue + i * 1.2 + strandIndex * 14) % 360, 70, 100, alpha);
      strokeWeight(weight);

      let px = t.pos.x - width / 2;
      let py = t.pos.y - height / 2;

      let nx = (noise(i * 0.16, frameCount * 0.03 + strandPhase) - 0.5) * 6.5;
      let ny = (noise(i * 0.16 + 100, frameCount * 0.03 + strandPhase) - 0.5) * 6.5;

      let wobble = sin(i * 0.28 + frameCount * 0.05 + strandPhase) * offsetMag;

      let dx = 0,
        dy = 0;
      if (i > 0) {
        let prev = this.trail[i - 1].pos;
        dx = t.pos.x - prev.x;
        dy = t.pos.y - prev.y;
      }
      let len = sqrt(dx * dx + dy * dy) + 0.0001;
      let pxp = -dy / len;
      let pyp = dx / len;

      curveVertex(px + nx + pxp * wobble, py + ny + pyp * wobble);

      if (i % TRAIL_GLITTER_RATE === 0 && age > 0.15) {
        let beadA = alpha * 1.2;

        noStroke();
        fill((this.hue + i * 2) % 360, 20, 100, beadA);
        ellipse(px + nx + pxp * wobble, py + ny + pyp * wobble, map(age, 0, 1, 1.0, 3.2));
        noFill();

        stroke((this.hue + i * 2) % 360, 10, 100, beadA * 0.7);
        strokeWeight(1);
        let sx = px + nx + pxp * wobble;
        let sy = py + ny + pyp * wobble;
        line(sx - 3, sy, sx + 3, sy);
        line(sx, sy - 3, sx, sy + 3);
      }
    }

    endShape();
  }

  pressed() {
    if (dist(mouseX, mouseY, this.pos.x, this.pos.y) < this.size * 0.5) {
      this.dragging = true;
      this.dragTime = 0;

      // start quiet and dragged() raises based on motion
      this.targetVol = 0.05;

      if (!this.sound.isPlaying()) this.sound.loop();

      // short tick on pickup, not a full sample playback
      playOneShotClip(
        sndTap,
        0.08,
        random(0.9, 1.1),
        map(this.pos.x, 0, width, -0.7, 0.7),
        0.10
      );
      return true;
    }
    return false;
  }

  dragged() {
    if (this.dragging) {
      this.pos.set(mouseX, mouseY);

      let speed = this.vel.mag();

      // quieter while dragging
      this.targetVol = map(speed, 0, 24, 0.01, 0.09, true);
    }
  }

  released() {
    if (this.dragging) {
      this.dragging = false;
      this.targetVol = 0;

      // short tick on release, not a full sample playback
      playOneShotClip(
        sndKnock,
        0.06,
        random(0.95, 1.1),
        map(this.pos.x, 0, width, -0.7, 0.7),
        0.12
      );
    }
  }
}

/* -------------------
   Sketch functions
   -------------------- */

function preload() {
  sunImg = loadImage("sun.png");
  for (let i = 1; i <= 8; i++) planetImgs.push(loadImage(`planet${i}.png`));

  sndTap = loadSound("wood_tap.wav");
  sndKnock = loadSound("wood_knock.wav");
  sndImpact = loadSound("wood_impact.wav");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noStroke();

  textFont("fantasy");

  initField();

  for (let i = 0; i < 280; i++) stars.push(new Star());

  sun = new Sun(width / 2, height / 2, min(width, height) * 0.16);

	let ringR = min(width, height) * 0.45;     // ring radius
	
	for (let i = 0; i < 8; i++) {
	  let ang = (TWO_PI * i) / 8;
	  let x = sun.pos.x + cos(ang) * ringR 
	  let y = sun.pos.y + sin(ang) * ringR 
	
	  bodies.push(new Planet(x, y, planetImgs[i]));
	}


  for (let i = 0; i < 3500; i++) particles.push(new FlowParticle(random(width), random(height)));
}

function draw() {
  if (!started) {
    drawIntro();
    return;
  }

  fill(230, 50, 6, BG_FADE_ALPHA);
  rect(0, 0, width, height);

  for (let s of stars) {
    s.update();
    s.display();
  }

  fieldStep();

  blendMode(ADD);
  drawDye();
  updateParticles();
  drawParticles();
  blendMode(BLEND);

  for (let p of bodies) p.update();

  blendMode(ADD);
  for (let p of bodies) p.displaySilk();
  blendMode(BLEND);

  sun.display();
  for (let p of bodies) p.display();

  drawHUD();
}

function drawIntro() {
  fill(230, 50, 6, 45);
  rect(0, 0, width, height);

  blendMode(ADD);
  for (let s of stars) {
    s.update();
    s.display();
  }
  blendMode(BLEND);

  push();
  textAlign(CENTER, CENTER);
  noStroke();

  fill(0, 0, 100, 92);
  textSize(min(width, height) * 0.06);
  text("go on a space adventure", width / 2, height * 0.40);

  fill(0, 0, 100, 70);
  textSize(min(width, height) * 0.028);
  text("click to begin", width / 2, height * 0.52);

  fill(0, 0, 100, 45);
  textSize(min(width, height) * 0.02);
  text("drag planets to play • click the sun • press F for fullscreen", width / 2, height * 0.60);
  pop();

  let pulse = 35 + 20 * sin(frameCount * 0.03);
  blendMode(ADD);
  noStroke();
  fill(35, 80, 100, pulse * 0.25);
  ellipse(width / 2, height * 0.52, min(width, height) * 0.12);
  blendMode(BLEND);
}

function drawHUD() {
  push();
  noStroke();
  fill(0, 0, 100, 25);
  textSize(14);
  textAlign(LEFT, BOTTOM);
  text("drag planets • click sun • F fullscreen", 14, height - 12);
  pop();
}

function mousePressed() {
  userStartAudio();

  if (!started) {
    started = true;
    playSpaceFanfare();
    return;
  }

  // priority: planets first, then the sun
  for (let i = bodies.length - 1; i >= 0; i--) {
    if (bodies[i].pressed()) {
      let grabbed = bodies.splice(i, 1)[0];
      bodies.push(grabbed);
      return;
    }
  }

  if (sun.hit(mouseX, mouseY)) {
    sun.burst();
    return;
  }
}

function mouseDragged() {
  if (!started) return;
  for (let p of bodies) p.dragged();
}

function mouseReleased() {
  if (!started) return;
  for (let p of bodies) p.released();
}

function keyPressed() {
  if (key === "f" || key === "F") fullscreen(!fullscreen());
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (sun) {
    sun.pos.set(width / 2, height / 2);
    sun.radius = min(width, height) * 0.15;
  }
}

// intro hits should be short clips, not full sample playback
function playSpaceFanfare() {
  playOneShotClip(sndKnock, 0.12, 0.85, -0.2, 0.14);
  setTimeout(() => playOneShotClip(sndTap, 0.10, 1.05, 0.2, 0.10), 140);
  setTimeout(() => playOneShotClip(sndKnock, 0.11, 0.95, 0.0, 0.14), 280);
  setTimeout(() => playOneShotClip(sndImpact, 0.08, 0.80, -0.1, 0.14), 520);
  setTimeout(() => playOneShotClip(sndTap, 0.07, 1.20, 0.1, 0.10), 660);
}

function initField() {
  flow = new Array(FLOW_COLS * FLOW_ROWS);
  dye = new Array(FLOW_COLS * FLOW_ROWS);
  for (let j = 0; j < FLOW_ROWS; j++) {
    for (let i = 0; i < FLOW_COLS; i++) {
      let idx = i + j * FLOW_COLS;
      flow[idx] = createVector(0, 0);
      dye[idx] = { a: 0, h: 220 };
    }
  }
}

function fieldStep() {
  for (let j = 0; j < FLOW_ROWS; j++) {
    for (let i = 0; i < FLOW_COLS; i++) {
      let idx = i + j * FLOW_COLS;
      flow[idx].mult(FLOW_DECAY);
      dye[idx].a *= DYE_DECAY;

      let v = flow[idx];
      let acc = createVector(0, 0);
      let count = 0;

      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          if (ox === 0 && oy === 0) continue;
          let ni = i + ox,
            nj = j + oy;
          if (ni < 0 || nj < 0 || ni >= FLOW_COLS || nj >= FLOW_ROWS) continue;
          let nidx = ni + nj * FLOW_COLS;
          acc.add(flow[nidx]);
          count++;
        }
      }
      if (count > 0) {
        acc.div(count);
        v.lerp(acc, FLOW_DIFFUSE);
      }
    }
  }
}

function drawDye() {
  let cw = width / FLOW_COLS;
  let ch = height / FLOW_ROWS;

  noStroke();
  for (let j = 0; j < FLOW_ROWS; j++) {
    for (let i = 0; i < FLOW_COLS; i++) {
      let idx = i + j * FLOW_COLS;
      let a = dye[idx].a;
      if (a < 0.01) continue;

      fill(dye[idx].h, 85, 100, a * 42);
      rect(i * cw, j * ch, cw, ch);

      fill(dye[idx].h, 55, 100, a * 18);
      rect(i * cw - cw * 0.3, j * ch - ch * 0.3, cw * 1.6, ch * 1.6);
    }
  }
}

function updateParticles() {
  for (let p of particles) p.step();
}

function drawParticles() {
  noStroke();
  for (let p of particles) p.render();
}

function injectAt(x, y, vx, vy, hue, amount, emitCount = BASE_EMIT) {
  let i = floor(map(x, 0, width, 0, FLOW_COLS));
  let j = floor(map(y, 0, height, 0, FLOW_ROWS));
  if (i < 0 || j < 0 || i >= FLOW_COLS || j >= FLOW_ROWS) return;

  let idx = i + j * FLOW_COLS;

  flow[idx].add(vx, vy);
  dye[idx].a = min(1.0, dye[idx].a + amount);
  dye[idx].h = lerpHue(dye[idx].h, hue, 0.35);

  for (let k = 0; k < emitCount; k++) {
    if (particles.length < MAX_PARTICLES) {
      particles.push(new FlowParticle(x + random(-16, 16), y + random(-16, 16)));
    }
  }
}

function lerpHue(h1, h2, t) {
  let d = ((h2 - h1 + 540) % 360) - 180;
  return (h1 + d * t + 360) % 360;
}

/* ----------------
   Sound helpers
   -----------------*/

function playOneShot(snd, amp, rate, pan) {
  snd.rate(rate);
  snd.pan(pan);
  snd.setVolume(amp);
  snd.play();
}

function playOneShotClip(snd, amp, rate, pan, durationSec) {
  snd.rate(rate);
  snd.pan(pan);
  snd.setVolume(amp);

  snd.play(0, rate, amp, 2.0, durationSec);
}
