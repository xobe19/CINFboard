import { createRoot } from "react-dom/client";
import React, {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  MutableRefObject,
  useMemo,
  SyntheticEvent,
  BaseSyntheticEvent,
  useReducer,
} from "react";
import "./index.css";
import { Line, dist, slope } from "./line";
import { SVGParseReparse } from "./parser";
const root = createRoot(document.getElementById("root")!);
import { Shape } from "./constants/Shape";
import { imageGen } from "./helpers/imageGen";
import { extractPathFromSVGFile } from "./helpers/pathExtractor";
import { svgs } from "./constants/shape_data";
import { Mode } from "./constants/canvasModes";
import { MatrixProd } from "./helpers/matrixProd";
import { scaleX, scaleY } from "./transformation_helpers/scaling_helper";
import { findNewOtherTwo } from "./transformation_helpers/reshaping_helper";
import { rotate } from "./transformation_helpers/rotation_helper";
import { ShapeSettings } from "./components/ShapeSettings";

import { ToolBox } from "./components/Toolbox";

// function rotateY(y, rad) {
//   const transMatrix = [
//     [Math.cos(rad), -Math.sin(rad)],
//     [Math.sin(rad), Math.cos(rad)],
//   ];

//   return MatrixProd(transMatrix, [[0], [y]])[1][0];
// }
function MyCanvas() {
  const shapeSettingsDivRef = useRef(null);
  const canvasRef: MutableRefObject<HTMLCanvasElement | null> = useRef(null);
  const canvasContext = useRef<CanvasRenderingContext2D | null>(null);
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const canvasObjects = useRef<any>([]);
  const arrowDotPoints = useRef<any>([]);
  const canvasObjectPaths = useRef<any>([]);
  const canvasBounds = useRef<any>([]);
  // const canvasBounds = useRef<any>(
  //   new Proxy([], {
  //     set: function (target, prop, val) {
  //       return true;
  //     },
  //   })
  // );
  const rotations = useRef<any>([]);
  const selectedDrawable = useRef<Shape>(Shape.rect);
  const currentMode = useRef(Mode.Default);
  const lastMouseEvent = useRef<null | MouseEvent>(null);
  const dotPaths = useRef<any>([]);
  const dotPoints = useRef<any>([]);
  const arrowDotPaths = useRef<any>([]);

  const tempRectangle = useRef<null | {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
  }>(null);
  const translate = useRef({ x: 0, y: 0 });
  const zoom = useRef(1);
  const tempTranslate = useRef({ x: 0, y: 0 });
  const selectedSShapeIndex = useRef(-1);
  const setShapeIndexChild = useRef(null);
  const setShapeIndex = useRef((newShapeIndex) => {
    selectedSShapeIndex.current = newShapeIndex;
    setShapeIndexChild.current(newShapeIndex);
  });
  const selectedDotIndex = useRef(-1);
  const selectedArrowDotIndex = useRef(-1);
  const selectedDotOpp = useRef({ x: 0, y: 0 });
  const tempArrowStart = useRef(-1);
  const tempArrowEnd = useRef({ x: 0, y: 0 });
  const arrows = useRef<any[]>([]);
  const shapeTranslate = useRef({ x: 0, y: 0 });
  function getDotIndex(ev: MouseEvent) {
    console.log(dotPaths.current.length);
    for (const [index, path] of dotPaths.current.entries()) {
      if (canvasContext.current?.isPointInPath(path, ev.clientX, ev.clientY)) {
        return index;
      }
    }
    return -1;
  }

  function getNearestArrowDot(ev: MouseEvent) {
    for (let i = 0; i < arrowDotPoints.current.length; i++) {
      if (
        dist({ x: ev.clientX, y: ev.clientY }, arrowDotPoints.current[i]) <= 20
      ) {
        return i;
      }
    }
    return -1;
  }

  function getArrowDotIndex(ev: MouseEvent) {
    for (let i = 0; i < arrowDotPaths.current.length; i++) {
      if (
        canvasContext.current!.isPointInPath(
          arrowDotPaths.current[i],
          ev.clientX,
          ev.clientY
        )
      ) {
        return i;
      }
    }
    return -1;
  }

  function getShapeIndex(ev: MouseEvent) {
    for (let i = 0; i < canvasBounds.current.length; i++) {
      const obj = canvasBounds.current[i];
      console.log("bounds : " + JSON.stringify(obj));
      const minx =
        Math.min(...obj.map((point) => point.x)) +
        translate.current.x +
        tempTranslate.current.x;
      const maxx =
        Math.max(...obj.map((point) => point.x)) +
        translate.current.x +
        tempTranslate.current.x;
      const miny =
        Math.min(...obj.map((point) => point.y)) +
        translate.current.y +
        tempTranslate.current.y;
      const maxy =
        Math.max(...obj.map((point) => point.y)) +
        translate.current.y +
        tempTranslate.current.y;
      console.log([minx, maxx, miny, maxy]);
      // const x1 = obj.x1 + translate.current.x + tempTranslate.current.x;
      // const y1 = obj.y1 + translate.current.y + tempTranslate.current.y;
      // const x2 = obj.x2 + translate.current.x + tempTranslate.current.x;
      // const y2 = obj.y2 + translate.current.y + tempTranslate.current.y;
      if (
        ev.clientX >= minx &&
        ev.clientX <= maxx &&
        ev.clientY >= miny &&
        ev.clientY <= maxy
      ) {
        return i;
      }
    }
    return -1;

    // for (let i = 0; i < canvasObjectPaths.current.length; i++) {
    //   if (
    //     canvasContext.current.isPointInPath(
    //       canvasObjectPaths.current[i],
    //       ev.clientX,
    //       ev.clientY
    //     )
    //   )
    //     return i;
    // }
    // return -1;
  }

  function startDrawingLoop() {
    requestAnimationFrame(startDrawingLoop);
    // console.log(canvasObjects.current.length + canvasBounds.current.length);
    console.log(dotPoints.current);
    canvasContext.current?.clearRect(0, 0, width, height);
    dotPaths.current = [];
    dotPoints.current = [];
    arrowDotPaths.current = [];
    arrowDotPoints.current = [];
    canvasObjectPaths.current = [];
    if (tempRectangle.current != null) {
      canvasContext.current!.fillStyle = "grey";
      canvasContext.current?.fillRect(
        tempRectangle.current.x1,
        tempRectangle.current.y1,
        tempRectangle.current.x2 - tempRectangle.current.x1,
        tempRectangle.current.y2 - tempRectangle.current.y1
      );
      canvasContext.current!.fillStyle = "";
    }
    let stc = 0;

    for (const [index, cb] of canvasBounds.current.entries()) {
      const points = cb.map((point) => ({
        x:
          point.x +
          translate.current.x +
          tempTranslate.current.x +
          (index === selectedSShapeIndex.current
            ? shapeTranslate.current.x
            : 0),
        y:
          point.y +
          translate.current.y +
          tempTranslate.current.y +
          (index === selectedSShapeIndex.current
            ? shapeTranslate.current.y
            : 0),
      }));
      for (let i = 0; i < cb.length; i++) {
        arrowDotPoints.current.push({
          x: (points[i].x + points[(i + 1) % cb.length].x) / 2,
          y: (points[i].y + points[(i + 1) % cb.length].y) / 2,
        });
      }
    }

    console.log(`arrow dots length: ${arrowDotPoints.current.length}`);
    console.log(`arrow dots length: ${JSON.stringify(canvasBounds.current)}`);
    console.log(`arrow dots length: ${JSON.stringify(arrowDotPoints.current)}`);

    for (const [index, obj] of canvasObjects.current.entries()) {
      let shapeTranslateX = 0;
      let shapeTranslateY = 0;

      if (selectedSShapeIndex.current === index) {
        shapeTranslateX = shapeTranslate.current.x;
        shapeTranslateY = shapeTranslate.current.y;
      }

      let objPath = new Path2D();
      if ([Shape.circle, Shape.rect, Shape.triangle].indexOf(obj.type) > -1) {
        const points = obj.points;
        const controlPoints = obj.controlPoints;
        console.log(canvasBounds.current[index]);

        const toScaleX =
          dist(canvasBounds.current[index][0], canvasBounds.current[index][3]) /
          obj.originalWidth;
        const toScaleY =
          dist(canvasBounds.current[index][0], canvasBounds.current[index][1]) /
          obj.originalHeight;
        console.log(
          "scale: x:" +
            toScaleX +
            " : " +
            toScaleY +
            " " +
            JSON.stringify(canvasBounds.current[index]) +
            " " +
            obj.originalWidth
        );
        const xsum = canvasBounds.current[index].reduce(
          (acc, point) => acc + point.x,
          0
        );
        const ysum = canvasBounds.current[index].reduce(
          (acc, point) => acc + point.y,
          0
        );
        const mid = { x: xsum / 4, y: ysum / 4 };
        const screenPoints = points.map((point) => {
          let np = scaleX(point.x, point.y, toScaleX);
          np = scaleY(np[0], np[1], toScaleY);
          np = rotate(np[0], np[1], rotations.current[index]);
          // const objRotated = canvasObjects.current[shapeIndex].points.map(
          //   (point) => {
          //     const rp = rotate(point.x, point.y, -0.2);
          //     return { x: rp[0], y: rp[1] };
          //   }
          // );
          // canvasObjects.current[shapeIndex].points = objRotated;
          return {
            x:
              np[0] +
              mid.x +
              shapeTranslateX +
              translate.current.x +
              tempTranslate.current.x,
            y:
              np[1] +
              mid.y +
              shapeTranslateY +
              translate.current.y +
              tempTranslate.current.y,
          };
          // x:
          //   mid.x +
          //   shapeTranslateX +
          //   translate.current.x +
          //   tempTranslate.current.x +
          //   scaleYX(scaleXX(point.x, toScaleX), toScaleY),
          // y:
          //   mid.y +
          //   shapeTranslateY +
          //   translate.current.y +
          //   tempTranslate.current.y +
          //   scaleYY(scaleXY(point.y, toScaleX), toScaleY),
        });

        // .map((point) => {
        //   const np = rotate(point.x, point.y, -0.1);
        //   return { x: np[0] + mid.x, y: np[1] + mid.y };
        // });

        const screenControlPonts = controlPoints?.map((point) => {
          let np = scaleX(point.x, point.y, toScaleX);
          np = scaleY(np[0], np[1], toScaleY);
          np = rotate(np[0], np[1], rotations.current[index]);

          // const objRotated = canvasObjects.current[shapeIndex].points.map(
          //   (point) => {
          //     const rp = rotate(point.x, point.y, -0.2);
          //     return { x: rp[0], y: rp[1] };
          //   }
          // );
          // canvasObjects.current[shapeIndex].points = objRotated;
          return {
            x:
              np[0] +
              mid.x +
              shapeTranslateX +
              translate.current.x +
              tempTranslate.current.x,
            y:
              np[1] +
              mid.y +
              shapeTranslateY +
              translate.current.y +
              tempTranslate.current.y,
          };
          // x:
          //   mid.x +
          //   shapeTranslateX +
          //   translate.current.x +
          //   tempTranslate.current.x +
          //   scaleYX(scaleXX(point.x, toScaleX), toScaleY),
          // y:
          //   mid.y +
          //   shapeTranslateY +
          //   translate.current.y +
          //   tempTranslate.current.y +
          //   scaleYY(scaleXY(point.y, toScaleX), toScaleY),
        });

        if (obj.type === Shape.rect || obj.type === Shape.triangle) {
          objPath!.moveTo(screenPoints[0].x, screenPoints[0].y);
          for (let i = 1; i < points.length; i++) {
            objPath.lineTo(
              screenPoints[i].x,

              screenPoints[i].y
            );
          }

          objPath!.lineTo(screenPoints[0].x, screenPoints[0].y);
          stc++;

          objPath.closePath();
          canvasContext.current.stroke(objPath);
        } else if (obj.type === Shape.circle) {
          objPath.moveTo(screenPoints[0].x, screenPoints[0].y);
          const center = {
            x: (screenPoints[0].x + screenPoints[2].y) / 2,
            y: (screenPoints[0].y + screenPoints[2].y) / 2,
          };

          for (let i = 1; i < points.length; i++) {
            objPath.bezierCurveTo(
              screenControlPonts[(i - 1) * 2].x,
              screenControlPonts[2 * (i - 1)].y,
              screenControlPonts[2 * i - 1].x,
              screenControlPonts[2 * i - 1].y,
              screenPoints[i].x,
              screenPoints[i].y
            );
            // context.lineTo(points[i].x, points[i].y);
          }
          objPath.bezierCurveTo(
            screenControlPonts[6].x,
            screenControlPonts[6].y,
            screenControlPonts[7].x,
            screenControlPonts[7].y,
            screenPoints[0].x,
            screenPoints[0].y
          );
          //context.lineTo(points[0].x, points[0].y);
          canvasContext.current.stroke(objPath);
        }
      } else {
        let todo: SVGParseReparse = obj.todo;
        objPath = todo.fitWithin(
          canvasBounds.current[index],
          rotations.current[index],
          shapeTranslateX + translate.current.x + tempTranslate.current.x,
          shapeTranslateY + translate.current.y + tempTranslate.current.y
        );

        canvasContext.current.stroke(objPath);
      }
      canvasObjectPaths.current.push(objPath);

      if (index === selectedSShapeIndex.current) {
        const points = canvasBounds.current[index].map((point) => ({
          x:
            point.x +
            translate.current.x +
            tempTranslate.current.x +
            shapeTranslateX,
          y:
            point.y +
            translate.current.y +
            tempTranslate.current.y +
            shapeTranslateY,
        }));
        // console.log("arrow + " + JSON.stringify(points));

        canvasContext.current!.strokeStyle = "purple";
        canvasContext.current!.beginPath();
        canvasContext.current!.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
          canvasContext.current.lineTo(
            points[i].x,

            points[i].y
          );
        }

        canvasContext.current!.lineTo(points[0].x, points[0].y);
        canvasContext.current!.stroke();
        canvasContext.current!.strokeStyle = "black";
        // const points = [
        //   {
        //     x:
        //       canvasBounds.current[index].x1 +
        //       translate.current.x +
        //       tempTranslate.current.x +
        //       shapeTranslateX,
        //     y:
        //       canvasBounds.current[index].y1 +
        //       translate.current.y +
        //       tempTranslate.current.y +
        //       shapeTranslateY,
        //   },
        //   {
        //     x:
        //       canvasBounds.current[index].x1 +
        //       translate.current.x +
        //       tempTranslate.current.x +
        //       shapeTranslateX,
        //     y:
        //       canvasBounds.current[index].y2 +
        //       translate.current.y +
        //       tempTranslate.current.y +
        //       shapeTranslateY,
        //   },
        //   {
        //     x:
        //       canvasBounds.current[index].x2 +
        //       translate.current.x +
        //       tempTranslate.current.x +
        //       shapeTranslateX,
        //     y:
        //       canvasBounds.current[index].y1 +
        //       translate.current.y +
        //       tempTranslate.current.y +
        //       shapeTranslateY,
        //   },
        //   {
        //     x:
        //       canvasBounds.current[index].x2 +
        //       translate.current.x +
        //       tempTranslate.current.x +
        //       shapeTranslateX,
        //     y:
        //       canvasBounds.current[index].y2 +
        //       translate.current.y +
        //       tempTranslate.current.y +
        //       shapeTranslateY,
        //   },
        // ];
        canvasContext.current!.fillStyle = "white";
        for (const point of points) {
          const currPath = new Path2D();
          const highSensitivityPath = new Path2D();
          currPath.rect(point.x - 5, point.y - 5, 10, 10);
          // currPath.arc(point.x, point.y, 5, 0, 2 * Math.PI);
          highSensitivityPath.arc(point.x, point.y, 20, 0, 2 * Math.PI);
          canvasContext.current!.stroke(currPath);
          canvasContext.current!.fill(currPath);
          dotPaths.current.push(highSensitivityPath);
          dotPoints.current.push({
            x:
              point.x -
              (translate.current.x + tempTranslate.current.x + shapeTranslateX),
            y:
              point.y -
              (translate.current.y + tempTranslate.current.y + shapeTranslateY),
          });
        }
        canvasContext.current!.strokeStyle = "black";
      }

      // if (arrowDotPaths.current.length === 0) {
      //   // console.log("mfao: " + JSON.stringify(arrowDotPaths.current.length));
      // }
    }
    if (selectedSShapeIndex.current !== -1) {
      for (const [index, point] of arrowDotPoints.current.entries()) {
        // console.log("tum ho: " + index);
        // console.log("tum ho (selected): " + selectedSShapeIndex.current);

        const currPath = new Path2D();
        const highSensitivityPath = new Path2D();
        // currPath.rect(point.x - 5, point.y - 5, 10, 10);
        currPath.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        highSensitivityPath.arc(point.x, point.y, 20, 0, 2 * Math.PI);
        if (selectedSShapeIndex.current === Math.floor(index / 4)) {
          canvasContext.current!.stroke(currPath);
          canvasContext.current!.fill(currPath);
        }
        arrowDotPaths.current.push(highSensitivityPath);
      }
    }

    if (tempArrowStart.current !== -1) {
      canvasContext.current.beginPath();
      canvasContext.current.setLineDash([5, 15]);
      canvasContext.current.moveTo(
        arrowDotPoints.current[tempArrowStart.current].x,
        arrowDotPoints.current[tempArrowStart.current].y
      );
      canvasContext.current.lineTo(
        tempArrowEnd.current.x,
        tempArrowEnd.current.y
      );
      canvasContext.current.stroke();
      canvasContext.current.setLineDash([]);
    }

    for (const arrow of arrows.current) {
      canvasContext.current.beginPath();
      canvasContext.current.moveTo(
        arrowDotPoints.current[arrow.startIndex].x,
        arrowDotPoints.current[arrow.startIndex].y
      );
      canvasContext.current.lineTo(
        arrowDotPoints.current[arrow.endIndex].x,
        arrowDotPoints.current[arrow.endIndex].y
      );
      canvasContext.current.stroke();
    }
    console.log("mfao: " + JSON.stringify(arrows.current.length));
  }

  function handleLeftDown(ev: MouseEvent) {
    let indx = getShapeIndex(ev);
    if (indx !== -1) {
    }
    console.log("shape indx: " + indx);
    const indxDot = getDotIndex(ev);
    let indxArrowDot = getArrowDotIndex(ev);
    const lastSelectedIndex = selectedSShapeIndex.current;
    if ((indxDot !== -1 || indxArrowDot !== -1) && indx === -1) {
      indx = lastSelectedIndex;
    }
    if (indxDot !== -1 && indxArrowDot !== -1) {
      indxArrowDot = -1;
    }

    setShapeIndex.current(indx);
    selectedDotIndex.current = indxDot;
    selectedArrowDotIndex.current = indxArrowDot;
    if (indxDot !== -1) {
      const obj = canvasBounds.current[selectedSShapeIndex.current];
      let opp = { x: 0, y: 0 };
      const pointType = selectedDotIndex.current % 4;
      if (pointType == 0) {
        opp = { x: obj.x2, y: obj.y2 };
      } else if (pointType == 1) {
        opp = { x: obj.x2, y: obj.y1 };
      } else if (pointType == 2) {
        opp = { x: obj.x1, y: obj.y2 };
      } else {
        opp = { x: obj.x1, y: obj.y1 };
      }

      selectedDotOpp.current = opp;
    }

    if (indxArrowDot !== -1) {
      tempArrowStart.current = indxArrowDot;
      tempArrowEnd.current = { x: ev.clientX, y: ev.clientY };
    }

    if (
      indx === -1 &&
      indxDot === -1 &&
      indxArrowDot == -1 &&
      currentMode.current === Mode.Default
    ) {
      currentMode.current = Mode.CreateShape;
      document.body.style.cursor = "crosshair";
    }
    console.log(ev);
    lastMouseEvent.current = ev;
  }

  function handleLeftUp(ev: MouseEvent) {
    if (currentMode.current === Mode.CreateShape) {
      currentMode.current = Mode.Default;
      document.body.style.cursor = "default";
      if (tempRectangle.current === null) return;
      const originalWidth = Math.abs(
        tempRectangle.current!.x1 - tempRectangle.current!.x2
      );
      const originalHeight = Math.abs(
        tempRectangle.current!.y1 - tempRectangle.current!.y2
      );
      if (selectedDrawable.current === Shape.rect) {
        canvasObjects.current.push({
          type: Shape.rect,
          originalWidth,
          originalHeight,
          points: [
            {
              x: -originalWidth / 2,
              y: -originalHeight / 2,
            },
            {
              x: originalWidth / 2,
              y: -originalHeight / 2,
            },
            {
              x: originalWidth / 2,
              y: originalHeight / 2,
            },
            {
              x: -originalWidth / 2,
              y: originalHeight / 2,
            },
          ],
        });
      } else if (selectedDrawable.current === Shape.circle) {
        const xr = originalWidth / 2;
        const yr = originalHeight / 2;
        canvasObjects.current.push({
          type: Shape.circle,
          originalWidth,
          originalHeight,
          points: [
            {
              x: -xr,
              y: 0,
            },
            {
              x: 0,
              y: +yr,
            },
            {
              x: xr,
              y: 0,
            },
            {
              x: 0,
              y: -yr,
            },
          ],
          controlPoints: [
            { x: -xr, y: +0.552 * yr },
            { x: -0.552 * xr, y: yr },
            { x: (1 - 0.552) * xr, y: yr },
            { x: xr, y: 0.552 * yr },
            { x: xr, y: -0.552 * yr },
            { x: 0.552 * xr, y: -yr },
            { x: -0.552 * xr, y: -yr },
            { x: -xr, y: -0.552 * yr },
          ],
        });
      } else if (selectedDrawable.current === Shape.triangle) {
        canvasObjects.current.push({
          type: Shape.triangle,
          originalWidth,
          originalHeight,
          points: [
            {
              x: -originalWidth / 2,
              y: originalHeight / 2,
            },
            {
              x: originalWidth / 2,
              y: originalHeight / 2,
            },
            {
              x: 0,
              y: -originalHeight / 2,
            },
          ],
        });
      } else {
        console.log("CDN: " + JSON.stringify(selectedDrawable.current));
        console.log("CDN: " + svgs["custom"]);
        const todo = new SVGParseReparse(
          svgs[selectedDrawable.current]
          // viewBox[selectedDrawable.current][0],
          // viewBox[selectedDrawable.current][1]
        );
        canvasObjects.current.push({
          type: selectedDrawable.current,

          todo,
        });
      }
      canvasBounds.current.push([
        {
          x: tempRectangle.current!.x1 - translate.current.x,
          y: tempRectangle.current!.y1 - translate.current.y,
        },
        {
          x: tempRectangle.current!.x1 - translate.current.x,
          y: tempRectangle.current!.y2 - translate.current.y,
        },
        {
          x: tempRectangle.current!.x2 - translate.current.x,
          y: tempRectangle.current!.y2 - translate.current.y,
        },
        {
          x: tempRectangle.current!.x2 - translate.current.x,
          y: tempRectangle.current!.y1 - translate.current.y,
        },
      ]);
      rotations.current.push(0);
      tempRectangle.current = null;
    } else if (
      currentMode.current === Mode.Default &&
      tempArrowStart.current != -1
    ) {
      const np = getNearestArrowDot(ev);
      if (np != -1) {
        arrows.current.push({
          startIndex: tempArrowStart.current,
          endIndex: np,
        });
      }
      tempArrowStart.current = -1;
    } else if (
      currentMode.current === Mode.Default &&
      selectedSShapeIndex.current != -1
    ) {
      canvasBounds.current[selectedSShapeIndex.current].forEach((point) => {
        point.x += shapeTranslate.current.x;
        point.y += shapeTranslate.current.y;
      });

      // canvasBounds.current[selectedSShapeIndex.current].x1 +=
      //   shapeTranslate.current.x;
      // canvasBounds.current[selectedSShapeIndex.current].x2 +=
      //   shapeTranslate.current.x;
      // canvasBounds.current[selectedSShapeIndex.current].y1 +=
      //   shapeTranslate.current.y;
      // canvasBounds.current[selectedSShapeIndex.current].y2 +=
      //   shapeTranslate.current.y;
      shapeTranslate.current.x = 0;
      shapeTranslate.current.y = 0;
    }
    lastMouseEvent.current = ev;
  }

  function handleMouseMove(ev: MouseEvent) {
    if (ev.buttons === 0) {
      if (getDotIndex(ev) != -1) {
        document.body.style.cursor = "move";
      } else if (getArrowDotIndex(ev) != -1) {
        // console.log("hahah: yeah");
        document.body.classList.add("cursor");
        // document.body.style.cursor = "pointer";
      } else {
        document.body.classList.remove("cursor");
        document.body.style.cursor = "default";
      }
    } else if (currentMode.current === Mode.CreateShape) {
      tempRectangle.current = {
        x1: lastMouseEvent.current!.clientX,
        y1: lastMouseEvent.current!.clientY,
        x2: ev.clientX,
        y2: ev.clientY,
      };
    } else if (currentMode.current === Mode.Pan) {
      tempTranslate.current.x = ev.clientX - lastMouseEvent.current!.clientX;
      tempTranslate.current.y = ev.clientY - lastMouseEvent.current!.clientY;
    } else if (
      currentMode.current === Mode.Default &&
      selectedDotIndex.current !== -1
    ) {
      const p1 = {
        x: ev.clientX - tempTranslate.current.x - translate.current.x,
        y: ev.clientY - tempTranslate.current.y - translate.current.y,
      };
      // canvasObjects.current[selectedSShapeIndex.current] = {
      //   type: Shape.rect,
      //   points: [
      //     {
      //       x: p1.x,
      //       y: p1.y,
      //     },
      //     {
      //       x: p1.x,
      //       y: selectedDotOpp.current.y,
      //     },

      //     { x: selectedDotOpp.current.x, y: selectedDotOpp.current.y },
      //     { x: selectedDotOpp.current.x, y: p1.y },
      //   ],
      // };
      let otherTwo = [];
      let otherTwoIndices = [];
      let oppTwoIndices = [];
      let dotIndex = selectedDotIndex.current;
      let mod = dotIndex % 4;
      let base = dotIndex - mod;
      console.log(
        "slope: " +
          JSON.stringify(dotPoints.current) +
          " : " +
          base +
          " : " +
          mod
      );
      let oppIndex = 0;

      if (mod == 0) {
        otherTwoIndices = [base + 1, base + 3];
        oppTwoIndices = [base, base + 2];
        oppIndex = base + 2;
      } else if (mod == 1) {
        otherTwoIndices = [base + 2, base];
        oppTwoIndices = [base + 1, base + 3];
        oppIndex = base + 3;
      } else if (mod == 2) {
        otherTwoIndices = [base + 3, base + 1];
        oppTwoIndices = [base + 2, base];
        oppIndex = base;
      } else {
        otherTwoIndices = [base, base + 2];
        oppTwoIndices = [base + 3, base + 1];
        oppIndex = base + 1;
      }

      // if (
      //   dotPoints.current[oppIndex].x ===
      //     dotPoints.current[otherTwoIndices[0]].x &&
      //   dotPoints.current[oppIndex].y ===
      //     dotPoints.current[otherTwoIndices[0]].y
      // ) {
      //   return;
      // }

      const not = findNewOtherTwo(
        dotPoints.current[oppIndex],
        p1,
        // dotPoints.current[oppTwoIndices[1]],
        slope(
          dotPoints.current[oppIndex],
          dotPoints.current[otherTwoIndices[0]]
        )
      );
      console.log("slope: not : \n" + JSON.stringify(not));

      if (
        (not[0].x == p1.x && not[0].y == p1.y) ||
        (not[1].x == p1.x && not[1].y == p1.y)
      ) {
        return;
      }

      canvasBounds.current[selectedSShapeIndex.current][
        otherTwoIndices[0] % 4
      ] = {
        x: not[0].x,
        y: not[0].y,
      };

      canvasBounds.current[selectedSShapeIndex.current][
        otherTwoIndices[1] % 4
      ] = {
        x: not[1].x,
        y: not[1].y,
      };
      canvasBounds.current[selectedSShapeIndex.current][
        selectedDotIndex.current % 4
      ] = {
        x: p1.x,
        y: p1.y,
      };
    } else if (
      currentMode.current === Mode.Default &&
      selectedArrowDotIndex.current != -1
    ) {
      tempArrowEnd.current = { x: ev.clientX, y: ev.clientY };
    } else if (
      currentMode.current === Mode.Default &&
      selectedSShapeIndex.current != -1
    ) {
      shapeTranslate.current.x = ev.clientX - lastMouseEvent.current!.clientX;
      shapeTranslate.current.y = ev.clientY - lastMouseEvent.current!.clientY;
    }
  }

  function handleRightDown(ev: MouseEvent) {
    if (currentMode.current === Mode.Default) {
      currentMode.current = Mode.Pan;
      document.body.style.cursor = "grab";
    }
    lastMouseEvent.current = ev;
  }

  function handleRightUp(ev: MouseEvent) {
    if (currentMode.current === Mode.Pan) {
      currentMode.current = Mode.Default;
      document.body.style.cursor = "default";
      translate.current.x += tempTranslate.current.x;
      translate.current.y += tempTranslate.current.y;
      tempTranslate.current = { x: 0, y: 0 };
    }
  }

  useEffect(() => {
    canvasContext.current = canvasRef.current!.getContext("2d")!;
    startDrawingLoop();
  });

  useLayoutEffect(() => {
    function update() {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    }
    window.addEventListener("resize", update);
    document.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      return false;
    });
    document.addEventListener("mousedown", (ev: MouseEvent) => {
      if (ev.button === 0) {
        handleLeftDown(ev);
      } else if (ev.button === 2) {
        handleRightDown(ev);
      }
    });
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", (ev: MouseEvent) => {
      if (ev.button === 0) {
        handleLeftUp(ev);
      } else if (ev.button === 2) {
        handleRightUp(ev);
      }
    });

    return () => window.removeEventListener("resize", update);
  });

  return (
    <div id="root">
      <canvas
        id="main_canvas"
        ref={canvasRef}
        width={width}
        height={height}
      ></canvas>
      <ShapeSettings
        canvasContext={canvasContext}
        setShapeIndexRef={setShapeIndexChild}
        canvasBounds={canvasBounds}
        canvasObjects={canvasObjects}
        rotations={rotations}
      />
      <ToolBox selectedDrawable={selectedDrawable} />
    </div>
  );
}

root.render(<MyCanvas />);
