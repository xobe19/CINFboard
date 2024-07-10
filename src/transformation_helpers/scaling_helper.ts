import { MatrixProd } from "../helpers/matrixProd";

export function scaleX(x, y, fac) {
  // return x;
  const transMatrix = [
    [fac, 0],
    [0, 1],
  ];
  return MatrixProd(transMatrix, [[x], [y]]).flat();
}
export function scaleXY(y, fac) {
  // return y;
  const transMatrix = [
    [fac, 0],
    [0, 1],
  ];
  return MatrixProd(transMatrix, [[0], [y]])[1][0];
}
export function scaleY(x, y, fac) {
  // return x;
  const transMatrix = [
    [1, 0],
    [0, fac],
  ];

  return MatrixProd(transMatrix, [[x], [y]]).flat();
}
export function scaleYY(y, fac) {
  // return y;
  const transMatrix = [
    [1, 0],
    [0, fac],
  ];

  return MatrixProd(transMatrix, [[0], [y]])[1][0];
}