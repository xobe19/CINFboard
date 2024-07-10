// p1 and p2 are opp to each other


import { Line, dist, slope } from "./line.ts";

export function findNewOtherTwo(p1, p2, slope) {
  const recSlope = -1 / slope;
  console.log("slope: " + slope + "rec: " + recSlope);
  const l1 = new Line(slope, p1);
  const l2 = new Line(recSlope, p1);
  const l3 = new Line(slope, p2);
  const l4 = new Line(recSlope, p2);
  console.log("slope: " + JSON.stringify(l1.a + " " + l1.b + " " + l1.c));
  console.log("slope: " + JSON.stringify(l2.a + " " + l2.b + " " + l2.c));
  console.log("slope: " + JSON.stringify(l3.a + " " + l3.b + " " + l3.c));
  console.log("slope: " + JSON.stringify(l4.a + " " + l4.b + " " + l4.c));

  return [l1.findIntersection(l4), l2.findIntersection(l3)];
}