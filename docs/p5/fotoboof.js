/*
Process 17

A rectangular surface filled with instances of Element 5, each with a different size and gray value. Draw a transparent circle at the midpoint of each Element. Increase a circle?s size and opacity while its Element is touching another Element and decrease while it is not.

E5: F2 + B1 + B5 + B6 + B7

F2: Line

B1: Move in a straight line
B5: Enter from the opposite edge after moving off the surface
B6: Orient toward the direction of an Element that is touching
B7: Deviate from the current direction
*/

let elements = [];
let numElements = 128;

let MAX_SPEED = 1;

let DEVIATE_MAGNITUDE = 0.01;
let STEER_MAGNITUDE = 0.01;

function setup() {
 const canvas = createCanvas(640, 640);
 canvas.parent("sketch-container");
 const w = canvas.parent().clientWidth;
 resizeCanvas(w, w);

  for (let i = 0; i < numElements; i++) {
    let pos = createVector(random(width), random(height));
    let vel = createVector(random(-MAX_SPEED, MAX_SPEED), random(-MAX_SPEED, MAX_SPEED));
    let len = random(32, 64);

    elements[i] = new Element(pos, vel, len);
  }

  background(255);
}

function draw() {
  // background(0);

  for (let i = 0; i < numElements; i++) {
    elements[i].update();
    elements[i].draw();
    elements[i].changeDirection();
    
    // elements[i].display();
    
    let connectedCount = 0;

    for (let j = i + 1; j < numElements; j++) {
  
      let dir1 = elements[i].vel.copy();
      dir1.normalize();
      dir1.mult(elements[i].len);

      let x1 = elements[i].pos.x - dir1.x/2;
      let y1 = elements[i].pos.y - dir1.y/2;
      
      let x2 = elements[i].pos.x + dir1.x/2;
      let y2 = elements[i].pos.y + dir1.y/2;
      
      let dir2 = elements[j].vel.copy();
      dir2.normalize();
      dir2.mult(elements[j].len);

      let x3 = elements[j].pos.x - dir2.x/2;
      let y3 = elements[j].pos.y - dir2.y/2;
      
      let x4 = elements[j].pos.x + dir2.x/2;
      let y4 = elements[j].pos.y + dir2.y/2;

      if (intersects(x1, y1, x2, y2, x3, y3, x4, y4)) {
        elements[i].copyDirection(elements[j]);
        
        connectedCount++;
      }
    }
    
    if (connectedCount > 0) {
      elements[i].alpha++;
      elements[i].circleSize += 0.1;
    } else {
      elements[i].alpha--;
      elements[i].circleSize -= 0.1;
    }
  }
}

// returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
// https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
function intersects(a, b, c, d, p, q, r, s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
};

function mouseClicked() {
  let pos = createVector(mouseX, mouseY);
  let vel = createVector(random(-MAX_SPEED, MAX_SPEED), random(-MAX_SPEED, MAX_SPEED));
  let len = random(16, 64);

  elements.push(new Element(pos, vel, len));
  numElements = elements.length;
}

class Element {
  constructor(pos, vel, len) {
    this.pos = pos.copy();
    this.vel = vel;
    this.len = len;
    
    this.color = random(255);
    this.alpha = 0;
    
    this.circleSize = 0;

    this.acc = createVector(0, 0);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(MAX_SPEED);

    this.pos.add(this.vel);

    this.constrainToSurface();

    this.acc.mult(0);
    
    if (this.alpha < 0) this.alpha = 0;
    if (this.alpha > 25) this.alpha = 25;
    
    if (this.circleSize < 0) this.circleSize = 0;
    if (this.circleSize > 16) this.circleSize = 16;
  }

  display() {
    push();
    noFill();
    stroke(255);

    let direction = this.vel.copy();
    direction.normalize();
    direction.mult(this.len);

    line(this.pos.x - direction.x / 2, this.pos.y - direction.y / 2, this.pos.x + direction.x / 2, this.pos.y + direction.y / 2);

    pop();
  }
  
  draw() {
    push();
    noStroke();
    fill(this.color, this.alpha);
    ellipse(this.pos.x, this.pos.y, this.circleSize, this.circleSize);
    pop();
  }

  constrainToSurface() {
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;
  }

  changeDirection() {
    let turn = createVector(random(-1, 1), random(-1, 1));
    turn.setMag(DEVIATE_MAGNITUDE);
    this.acc.add(turn);
  }
  
  copyDirection(element) {
    let force = p5.Vector.sub(element.vel, this.vel);
    force.setMag(STEER_MAGNITUDE);

    this.acc.add(force);
  }
}