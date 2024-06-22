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
import { Line, slope } from "./line.ts";
const root = createRoot(document.getElementById("root")!);
enum Shape {
  rect,
}
enum Mode {
  Default,
  CreateShape,
  Pan,
  DrawArrow,
}

const commands = {
  [Shape.rect]: "LLLL",
};

let MatrixProd = (A, B) =>
  A.map((row, i) =>
    B[0].map((_, j) => row.reduce((acc, _, n) => acc + A[i][n] * B[n][j], 0))
  );
function scaleXX(x, fac) {
  // return x;
  const transMatrix = [
    [fac, 0],
    [0, 1],
  ];
  return MatrixProd(transMatrix, [[x], [0]])[0][0];
}
// p1 and p2 are opp to each other

function findNewOtherTwo(p1, p2, slope) {
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

function scaleXY(y, fac) {
  // return y;
  const transMatrix = [
    [fac, 0],
    [0, 1],
  ];
  return MatrixProd(transMatrix, [[0], [y]])[1][0];
}
function scaleYX(x, fac) {
  // return x;
  const transMatrix = [
    [1, 0],
    [0, fac],
  ];

  return MatrixProd(transMatrix, [[x], [0]])[0][0];
}
function scaleYY(y, fac) {
  // return y;
  const transMatrix = [
    [1, 0],
    [0, fac],
  ];

  return MatrixProd(transMatrix, [[0], [y]])[1][0];
}
function ShapeSettings({ canvasContext, rotations, setShapeIndexRef }) {
  const [shapeIndex, setShapeIndex] = useState(-1);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  setShapeIndexRef.current = setShapeIndex;
  const divRef = useRef<HTMLDivElement | null>(null);

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
      <input
        type="range"
        step={1}
        min={-180}
        max={180}
        value={
          rotations.current.has(shapeIndex)
            ? rotations.current.get(shapeIndex)
            : 0
        }
        onInput={(v: BaseSyntheticEvent) => {
          rotations.current.set(shapeIndex, v.target.value);
          forceUpdate();
        }}
      ></input>
      {shapeIndex}
    </div>
  );
}

function MyCanvas() {
  const shapeSettingsDivRef = useRef(null);
  const canvasRef: MutableRefObject<HTMLCanvasElement | null> = useRef(null);
  const canvasContext = useRef<CanvasRenderingContext2D | null>(null);
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const canvasObjects = useRef<any>([]);
  const canvasBounds = useRef<any>([]);
  const rotations = useRef<Map<number, number>>(new Map());

  const currentMode = useRef(Mode.Default);
  const lastMouseEvent = useRef<null | MouseEvent>(null);
  const dotPaths = useRef<any>([]);
  const dotPoints = useRef<any>([]);
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
  const selectedDotOpp = useRef({ x: 0, y: 0 });
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
  }

  function startDrawingLoop() {
    requestAnimationFrame(startDrawingLoop);
    // console.log(canvasObjects.current.length + canvasBounds.current.length);
    console.log(dotPoints.current);
    canvasContext.current?.clearRect(0, 0, width, height);
    dotPaths.current = [];
    dotPoints.current = [];
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
    for (const [index, obj] of canvasObjects.current.entries()) {
      let shapeTranslateX = 0;
      let shapeTranslateY = 0;

      if (selectedSShapeIndex.current === index) {
        shapeTranslateX = shapeTranslate.current.x;
        shapeTranslateY = shapeTranslate.current.y;
      }

      const points = obj.points;
      console.log(canvasBounds.current[index]);
      const topLeftBoundX = Math.min(
        ...canvasBounds.current[index].map((point) => point.x)
      );
      const topLeftBoundY = Math.min(
        ...canvasBounds.current[index].map((point) => point.y)
      );

      const maxx = Math.max(
        ...canvasBounds.current[index].map((point) => point.x)
      );

      const maxy = Math.max(
        ...canvasBounds.current[index].map((point) => point.y)
      );
      const toScaleX = Math.abs(maxx - topLeftBoundX) / obj.originalWidth;
      const toScaleY = Math.abs(maxy - topLeftBoundY) / obj.originalHeight;
      const screenPoints = points.map((point) => ({
        x:
          topLeftBoundX +
          shapeTranslateX +
          translate.current.x +
          tempTranslate.current.x +
          scaleYX(scaleXX(point.x, toScaleX), toScaleY),
        y:
          topLeftBoundY +
          shapeTranslateY +
          translate.current.y +
          tempTranslate.current.y +
          scaleYY(scaleXY(point.y, toScaleX), toScaleY),
      }));

      canvasContext.current.beginPath();
      canvasContext.current!.moveTo(screenPoints[0].x, screenPoints[0].y);
      for (let i = 1; i < points.length; i++) {
        const command = commands[obj.type][i];
        if (command === "L") {
          canvasContext.current.lineTo(
            screenPoints[i].x,

            screenPoints[i].y
          );
        }
      }

      canvasContext.current!.lineTo(screenPoints[0].x, screenPoints[0].y);
      stc++;

      canvasContext.current.closePath();
      canvasContext.current.stroke();
      if (index === selectedSShapeIndex.current) {
        canvasContext.current!.strokeStyle = "purple";
        stc++;
        canvasContext.current?.strokeRect(
          topLeftBoundX +
            translate.current.x +
            tempTranslate.current.x +
            shapeTranslateX,
          topLeftBoundY +
            translate.current.y +
            tempTranslate.current.y +
            shapeTranslateY,
          maxx - topLeftBoundX,
          maxy - topLeftBoundY
        );
        canvasContext.current!.strokeStyle = "black";
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
          currPath.arc(point.x, point.y, 5, 0, 2 * Math.PI);
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
    }
  }

  function handleLeftDown(ev: MouseEvent) {
    let indx = getShapeIndex(ev);
    console.log("shape indx: " + indx);
    const indxDot = getDotIndex(ev);
    const lastSelectedIndex = selectedSShapeIndex.current;
    if (indxDot !== -1 && indx === -1) {
      indx = lastSelectedIndex;
    }

    setShapeIndex.current(indx);
    selectedDotIndex.current = indxDot;
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

    if (indx === -1 && indxDot === -1 && currentMode.current === Mode.Default) {
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
      canvasObjects.current.push({
        type: Shape.rect,
        originalWidth,
        originalHeight,
        points: [
          {
            x: 0,
            y: 0,
          },
          {
            x: originalWidth,
            y: 0,
          },
          {
            x: originalWidth,
            y: originalHeight,
          },
          {
            x: 0,
            y: originalHeight,
          },
        ],
      });
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
      tempRectangle.current = null;
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
      } else {
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
        rotations={rotations}
        setShapeIndexRef={setShapeIndexChild}
      />
    </div>
  );
}

root.render(<MyCanvas />);
