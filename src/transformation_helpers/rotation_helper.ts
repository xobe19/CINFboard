import { MatrixProd } from "../helpers/matrixProd";
export function rotate(x, y, rad) {
  const transMatrix = [
    [Math.cos(rad), -Math.sin(rad)],
    [Math.sin(rad), Math.cos(rad)],
  ];
  return MatrixProd(transMatrix, [[x], [y]]).flat();
}