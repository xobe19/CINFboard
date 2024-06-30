import arcToBezier from "svg-arc-to-cubic-bezier";

const previousPoint = { x: 100, y: 100 };
//M228,184A4,4,0,0,1,220,184
export function replaceArcToBezier(curr_point, arc_string) {
  const arc_regex =
    /^A([-\d\.]+)[\s,]([-\d\.]+)[\s,]([-\d\.]+)[\s,]([-\d\.]+)[\s,]([-\d\.]+)[\s,]([-\d\.]+)[\s,]([-\d\.]+)/;

  const matcher = arc_string.match(arc_regex);
  const [rx, ry, rotation, largeArcFlag, sweepFlag, x, y] = matcher
    .slice(1, 1 + 7)
    .map((e) => Number(e));

  const beziers = arcToBezier({
    px: curr_point.x,
    py: curr_point.y,
    cx: x,
    cy: y,
    rx: rx,
    ry: ry,
    xAxisRotation: rotation,
    largeArcFlag,
    sweepFlag,
  });
  console.log(beziers);

  let finString = "";
  beziers.forEach((bezier) => {
    finString += `C${bezier.x1} ${bezier.y1} ${bezier.x2} ${bezier.y2} ${bezier.x} ${bezier.y}`;
  });
  return finString;
}

// replaceArcToBezier({ x: 228, y: 184 }, "A4,4,0,0,1,220,184");
