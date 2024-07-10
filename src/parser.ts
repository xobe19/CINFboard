// let test_str =
//   "M5 6.2489C5.5 4.61929 6.61929 3.5 8 3.5H12C16.7225 3.5 20.5 7.55843 20.5 12.5C20.5 14.3559 19.969 16.0837 19.0565 17.5193C18.5336 18.3421 18.1666 19.2028 18.1666 20.0823V21C18.1666 21.2761 17.9428 21.5 17.6666 21.5C17.3905 21.5 17.1666 21.2761 17.1666 21V20.0823C17.1666 18.9287 17.6449 17.876 18.2126 16.9829C19.0243 15.7058 19.5 14.1637 19.5 12.5C19.5 12.332 19.4952 12.1653 19.4856 12H10.5625L10.719 13.2519C10.8682 14.4456 9.93743 15.5 8.73444 15.5H6.5V16.5C6.5 17.8807 7.61929 19 9 19H9.5C9.77614 19 10 19.2239 10 19.5C10 19.7761 9.77614 20 9.5 20H9C7.067 20 5.5 18.433 5.5 16.5V15.5H5C3.89543 15.5 3 14.6046 3 13.5V9.5C3 8.39543 3.89543 7.5 5 7.5H5.5V6ZM8.73444 14.5C9.33593 14.5 9.80132 13.9728 9.72671 13.376L9.53873 11.8721C9.50784 11.625 9.50784 11.375 9.53873 11.1279L9.72671 9.62403C9.80132 9.02718 9.33593 8.5 8.73444 8.5H5C4.44772 8.5 4 8.94772 4 9.5V13.5C4 14.0523 4.44772 14.5 5 14.5H8.73444ZM12 4.5C15.6392 4.5 18.7087 7.27998 19.3688 11H10.5625L10.719 9.74807C10.8682 8.55436 9.93743 7.5 8.73444 7.5H6.5V6C6.5 5.17157 7.17157 4.5 8 4.5H12Z";

import { replaceArcToBezier } from "./arcToBezier";
import { dist } from "./line";

let MatrixProd = (A, B) =>
  A.map((row, i) =>
    B[0].map((_, j) => row.reduce((acc, _, n) => acc + A[i][n] * B[n][j], 0))
  );

function rotate(x, y, rad) {
  const transMatrix = [
    [Math.cos(rad), -Math.sin(rad)],
    [Math.sin(rad), Math.cos(rad)],
  ];

  return MatrixProd(transMatrix, [[x], [y]]).flat();
}
function scaleX(x, y, fac) {
  // return x;
  const transMatrix = [
    [fac, 0],
    [0, 1],
  ];
  return MatrixProd(transMatrix, [[x], [y]]).flat();
}
function scaleY(x, y, fac) {
  // return x;
  const transMatrix = [
    [1, 0],
    [0, fac],
  ];

  return MatrixProd(transMatrix, [[x], [y]]).flat();
}

export class SVGParseReparse {
  static move_regex = /^M([-\d\.]+)[\s,]([-\d\.]+)/;
  static line_regex = /^L([-\d\.]+)[\s,]([-\d\.]+)/;
  static bezier_regex =
    /^C([-\d\.]+)[\s,]([-\d\.]+)[\s,]([-\d\.]+)[\s,]([-\d\.]+)[\s,]([-\d\.]+)[\s,]([-\d\.]+)/;
  static smooth_regex =
    /^S([-\d\.]+)[\s,]([-\d\.]+)[\s,]([-\d\.]+)[\s,]([-\d\.]+)/;
  static hori_regex = /^H([-\d\.]+)/;
  static z_regex = /^Z/;
  static vert_regex = /^V([-\d\.]+)/;
  static arc_regex =
    /^A([-\d\.]+)[\s,]([-\d\.]+)[\s,]([-\d\.]+)[\s,]([-\d\.]+)[\s,]([-\d\.]+)[\s,]([-\d\.]+)[\s,]([-\d\.]+)/;
  static point_cnt = {
    M: 2,
    C: 6,
    S: 4,
    H: 1,
    Z: 0,
    V: 1,
    L: 2,
  };
  static x_indexes = {
    M: [0],
    C: [0, 2, 4],
    S: [0, 2],
    H: [0],
    Z: [],
    V: [],
    L: [0],
  };
  steps = [];
  minx = Number.MAX_SAFE_INTEGER;
  miny = Number.MAX_SAFE_INTEGER;
  maxx = Number.MIN_SAFE_INTEGER;
  maxy = Number.MIN_SAFE_INTEGER;
  public width = 0;
  public height = 0;
  constructor(svg_path) {
    let test_str = svg_path;
    const curr = { x: 0, y: 0 };
    let path_begin = null;
    while (test_str.length) {
      console.log(test_str[0]);
      let matcher;
      console.log(matcher);

      if (test_str[0] === "A") {
        let arc_matcher = test_str.match(SVGParseReparse.arc_regex);
        let arc_string = arc_matcher[0];
        let curves_string = replaceArcToBezier(curr, arc_string);
        test_str = curves_string + test_str.slice(arc_string.length);
        continue;
      }

      switch (test_str[0]) {
        case "M":
          matcher = test_str.match(SVGParseReparse.move_regex);
          console.log("pehle bhi" + matcher + test_str);
          break;
        case "C":
          matcher = test_str.match(SVGParseReparse.bezier_regex);
          break;
        case "S":
          matcher = test_str.match(SVGParseReparse.smooth_regex);
          break;
        case "V":
          matcher = test_str.match(SVGParseReparse.vert_regex);
          break;
        case "H":
          matcher = test_str.match(SVGParseReparse.hori_regex);
          break;
        case "Z":
          matcher = test_str.match(SVGParseReparse.z_regex);
          break;
        case "L":
          matcher = test_str.match(SVGParseReparse.line_regex);
          break;
      }
      let all_points;
      try {
        all_points = matcher
          .slice(1, 1 + SVGParseReparse.point_cnt[test_str[0]])
          .map((e) => Number(e));
      } catch (err) {
        console.log(
          "pehle bhi mai" +
            JSON.stringify(test_str[0]) +
            JSON.stringify(matcher)
        );
      }

      const points_x = all_points.filter((_, indx) =>
        SVGParseReparse.x_indexes[test_str[0]].includes(indx)
      );
      const points_y = all_points.filter(
        (_, indx) => !SVGParseReparse.x_indexes[test_str[0]].includes(indx)
      );

      if (test_str[0] === "H") {
        points_y.push(curr.y);
        curr.x = points_x[0];
      } else if (test_str[0] === "V") {
        points_x.push(curr.x);
        curr.y = points_y[0];
      } else if (test_str[0] === "M") {
        // if (path_begin === null) {
        path_begin = { x: points_x[0], y: points_y[0] };
        // }

        curr.x = points_x[0];
        curr.y = points_y[0];
      } else if (test_str[0] === "Z") {
        curr.x = path_begin.x;
        curr.y = path_begin.y;
        points_x.push(curr.x);
        points_y.push(curr.y);
      } else if (
        test_str[0] === "C" ||
        test_str[0] === "L" ||
        test_str[0] === "S"
      ) {
        curr.x = points_x[points_x.length - 1];
        curr.y = points_y[points_y.length - 1];
      }

      this.steps.push({
        type:
          test_str[0] === "H" || test_str[0] === "Z"
            ? "L"
            : test_str[0] === "V"
            ? "L"
            : test_str[0],
        points_x: points_x,
        points_y: points_y,
      });

      test_str = test_str.slice(matcher[0].length);
    }

    this.steps.forEach((step) => {
      step.points_x.forEach((point) => {
        this.minx = Math.min(this.minx, point);
        this.maxx = Math.max(this.maxx, point);
      });
      step.points_y.forEach((point) => {
        this.miny = Math.min(this.miny, point);
        this.maxy = Math.max(this.maxy, point);
      });
    });

    let midx = (this.minx + this.maxx) / 2;
    let midy = (this.miny + this.maxy) / 2;
    this.width = this.maxx - this.minx;
    this.height = this.maxy - this.miny;
    this.steps.forEach((step) => {
      step.points_x = step.points_x.map((point) => point - midx);
      step.points_y = step.points_y.map((point) => point - midy);
    });
    console.log("bite my tongue" + JSON.stringify(this.steps));
  }

  fitWithin(bounds, rotation, tx, ty) {
    console.log("bite my tongue" + JSON.stringify(bounds));
    const toScaleX = dist(bounds[0], bounds[3]) / this.width;
    const toScaleY = dist(bounds[0], bounds[1]) / this.height;
    // console.log(
    //   "scale: x:" +
    //     toScaleX +
    //     " : " +
    //     toScaleY +
    //     " " +
    //     JSON.stringify(canvasBounds.current[index]) +
    //     " " +
    //     obj.originalWidth
    // );
    const xsum = bounds.reduce((acc, point) => acc + point.x, 0);
    const ysum = bounds.reduce((acc, point) => acc + point.y, 0);
    const mid = { x: xsum / 4, y: ysum / 4 };

    const new_steps = this.steps.map((step) => {
      const points_x = [];
      const points_y = [];

      let len = step.points_x.length;
      for (let i = 0; i < len; i++) {
        let np = scaleX(step.points_x[i], step.points_y[i], toScaleX);
        np = scaleY(np[0], np[1], toScaleY);
        np = rotate(np[0], np[1], rotation);
        points_x.push(np[0] + mid.x + tx);
        points_y.push(np[1] + mid.y + ty);
      }

      return {
        type: step.type,
        points_x,
        points_y,
      };
    });

    let final_path = "";

    for (let step of new_steps) {
      final_path += `${step.type}`;
      let len = step.points_x.length;
      for (let i = 0; i < len; i++) {
        final_path += ` ${step.points_x[i]}`;
        final_path += ` ${step.points_y[i]}`;
      }
    }
    console.log("bite my tongue: " + JSON.stringify(final_path));
    return new Path2D(final_path);
  }
}
