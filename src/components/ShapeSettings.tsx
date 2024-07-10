import React, { useRef, useEffect, useReducer, useState } from "react";
import { Shape } from "../constants/Shape";
import { extractPathFromSVGFile } from "../helpers/pathExtractor";
import { svgs } from "../constants/shape_data";
import { imageGen } from "../helpers/imageGen";
import { rotate } from "../transformation_helpers/rotation_helper";
export function ShapeSettings({
  canvasContext,
  setShapeIndexRef,
  canvasBounds,
  canvasObjects,
  rotations,
}) {
  const [shapeIndex, setShapeIndex] = useState(-1);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  setShapeIndexRef.current = setShapeIndex;
  const divRef = useRef<HTMLDivElement | null>(null);
  // doesn't need cleanup cuz it's never unmounted
  useEffect(() => {
    divRef.current.classList.add("visible");
    ["mousedown", "mouseup", "contextmenu", "mousemove"].forEach(
      (eventString) => {
        divRef.current.addEventListener(eventString, (ev: MouseEvent) => {
          ev.stopPropagation();
        });
      }
    );
  });
  useEffect(() => {
    if (shapeIndex === -1) {
      divRef.current.classList.remove("visible");
    } else {
      divRef.current.classList.add("visible");
    }
  }, [shapeIndex]);
  return (
    <div id="shape_settings" ref={divRef}>
      <button
        id="left"
        onClick={() => {
          const selectedBounds = canvasBounds.current[shapeIndex];
          console.log(
            "rot: bounds:" + JSON.stringify(canvasBounds.current[shapeIndex])
          );
          const xsum = selectedBounds.reduce((acc, point) => acc + point.x, 0);
          const ysum = selectedBounds.reduce((acc, point) => acc + point.y, 0);
          console.log("rot: xsum: " + xsum);
          console.log("rot: ysum: " + ysum);
          const mid = { x: xsum / 4, y: ysum / 4 };
          const rotated = selectedBounds.map((point) => {
            const rp = rotate(point.x - mid.x, point.y - mid.y, -0.2);
            return { x: rp[0] + mid.x, y: rp[1] + mid.y };
          });
          canvasBounds.current[shapeIndex] = rotated;

          // const objRotated = canvasObjects.current[shapeIndex].points.map(
          //   (point) => {
          //     const rp = rotate(point.x, point.y, -0.2);
          //     return { x: rp[0], y: rp[1] };
          //   }
          // );
          // canvasObjects.current[shapeIndex].points = objRotated;
          rotations.current[shapeIndex] -= 0.2;
        }}
      >
        left
      </button>
      <button
        id="right"
        onClick={() => {
          const selectedBounds = canvasBounds.current[shapeIndex];
          console.log(
            "rot: bounds:" + JSON.stringify(canvasBounds.current[shapeIndex])
          );
          const xsum = selectedBounds.reduce((acc, point) => acc + point.x, 0);
          const ysum = selectedBounds.reduce((acc, point) => acc + point.y, 0);
          console.log("rot: xsum: " + xsum);
          console.log("rot: ysum: " + ysum);
          const mid = { x: xsum / 4, y: ysum / 4 };
          const rotated = selectedBounds.map((point) => {
            const rp = rotate(point.x - mid.x, point.y - mid.y, 0.2);
            return { x: rp[0] + mid.x, y: rp[1] + mid.y };
          });
          canvasBounds.current[shapeIndex] = rotated;

          // const objRotated = canvasObjects.current[shapeIndex].points.map(
          //   (point) => {
          //     const rp = rotate(point.x, point.y, -0.2);
          //     return { x: rp[0], y: rp[1] };
          //   }
          // );
          // canvasObjects.current[shapeIndex].points = objRotated;
          rotations.current[shapeIndex] += 0.2;
        }}
      >
        right
      </button>

      {canvasObjects.current[shapeIndex]?.type === Shape.rect ? (
        <div>rect</div>
      ) : (
        <div> not rect </div>
      )}

      {shapeIndex}
    </div>
  );
}
