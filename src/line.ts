export class Line {
  // ax + by + c = 0
  a: number;
  b: number;
  c: number;
  constructor(slope: number, point: { x: number; y: number }) {
    let m = slope;
    if (m == Infinity || m == -Infinity) {
      this.b = 0;
      this.a = 1;
      this.c = -point.x;
    } else {
      let c = point.y - m * point.x;
      this.b = 1;
      this.a = -m;
      this.c = -c;
    }
  }
  findIntersection(sec: Line) {
    return {
      x: (this.b * sec.c - sec.b * this.c) / (this.a * sec.b - sec.a * this.b),
      y: (this.c * sec.a - sec.c * this.a) / (this.a * sec.b - sec.a * this.b),
    };
  }
}

export function slope(p1, p2) {
  console.log("slope: between: " + JSON.stringify(p1) + JSON.stringify(p2));
  return (p2.y - p1.y) / (p2.x - p1.x);
}
