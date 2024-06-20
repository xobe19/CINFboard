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
    for (let i = 0; i < canvasObjects.current.length; i++) {
      const obj = canvasBounds.current[i];
      // const minx = Math.min(...obj.points.map((point) => point.x));
      // const maxx = Math.max(...obj.points.map((point) => point.x));
      // const miny = Math.max(...obj.points.map((point) => point.y));
      // const maxy = Math.max(...obj.points.map((point) => point.y));
      const x1 = obj.x1 + translate.current.x + tempTranslate.current.x;
      const y1 = obj.y1 + translate.current.y + tempTranslate.current.y;
      const x2 = obj.x2 + translate.current.x + tempTranslate.current.x;
      const y2 = obj.y2 + translate.current.y + tempTranslate.current.y;
      if (
        ev.clientX >= Math.min(x1, x2) &&
        ev.clientX <= Math.max(x1, x2) &&
        ev.clientY >= Math.min(y1, y2) &&
        ev.clientY <= Math.max(y1, y2)
      ) {
        return i;
      }
    }
    return -1;
  }

  function startDrawingLoop() {
    requestAnimationFrame(startDrawingLoop);
    console.log(canvasObjects.current.length + canvasBounds.current.length);

    canvasContext.current?.clearRect(0, 0, width, height);
    dotPaths.current = [];
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
      canvasContext.current.beginPath();
      canvasContext.current!.moveTo(
        points[0].x +
          shapeTranslateX +
          translate.current.x +
          tempTranslate.current.x,
        points[0].y +
          shapeTranslateY +
          translate.current.y +
          tempTranslate.current.y
      );
      for (let i = 1; i < points.length; i++) {
        console.log("obj type: " + obj.type);
        const command = commands[obj.type][i];
        if (command === "L") {
          canvasContext.current.lineTo(
            points[i].x +
              shapeTranslateX +
              translate.current.x +
              tempTranslate.current.x,
            points[i].y +
              shapeTranslateY +
              translate.current.y +
              tempTranslate.current.y
          );
        }
      }
      canvasContext.current.lineTo(
        points[0].x +
          shapeTranslateX +
          translate.current.x +
          tempTranslate.current.x,
        points[0].y +
          shapeTranslateY +
          translate.current.y +
          tempTranslate.current.y
      );
      stc++;

      canvasContext.current.closePath();
      canvasContext.current.stroke();
      if (index === selectedSShapeIndex.current) {
        canvasContext.current!.strokeStyle = "purple";
        stc++;
        canvasContext.current?.strokeRect(
          canvasBounds.current[index].x1 +
            translate.current.x +
            tempTranslate.current.x +
            shapeTranslateX,
          canvasBounds.current[index].y1 +
            translate.current.y +
            tempTranslate.current.y +
            shapeTranslateY,
          canvasBounds.current[index].x2 - canvasBounds.current[index].x1,
          canvasBounds.current[index].y2 - canvasBounds.current[index].y1
        );
        canvasContext.current!.strokeStyle = "black";
        const points = [
          {
            x:
              canvasBounds.current[index].x1 +
              translate.current.x +
              tempTranslate.current.x +
              shapeTranslateX,
            y:
              canvasBounds.current[index].y1 +
              translate.current.y +
              tempTranslate.current.y +
              shapeTranslateY,
          },
          {
            x:
              canvasBounds.current[index].x1 +
              translate.current.x +
              tempTranslate.current.x +
              shapeTranslateX,
            y:
              canvasBounds.current[index].y2 +
              translate.current.y +
              tempTranslate.current.y +
              shapeTranslateY,
          },
          {
            x:
              canvasBounds.current[index].x2 +
              translate.current.x +
              tempTranslate.current.x +
              shapeTranslateX,
            y:
              canvasBounds.current[index].y1 +
              translate.current.y +
              tempTranslate.current.y +
              shapeTranslateY,
          },
          {
            x:
              canvasBounds.current[index].x2 +
              translate.current.x +
              tempTranslate.current.x +
              shapeTranslateX,
            y:
              canvasBounds.current[index].y2 +
              translate.current.y +
              tempTranslate.current.y +
              shapeTranslateY,
          },
        ];
        canvasContext.current!.fillStyle = "white";
        for (const point of points) {
          const currPath = new Path2D();
          const highSensitivityPath = new Path2D();
          currPath.arc(point.x, point.y, 5, 0, 2 * Math.PI);
          highSensitivityPath.arc(point.x, point.y, 20, 0, 2 * Math.PI);
          canvasContext.current!.stroke(currPath);
          canvasContext.current!.fill(currPath);
          dotPaths.current.push(highSensitivityPath);
        }
        canvasContext.current!.strokeStyle = "black";
      }
    }
    console.log("stc: " + stc);
  }

  function handleLeftDown(ev: MouseEvent) {
    let indx = getShapeIndex(ev);
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
      canvasObjects.current.push({
        type: Shape.rect,
        points: [
          {
            x: tempRectangle.current!.x1 - translate.current.x,
            y: tempRectangle.current!.y1 - translate.current.y,
          },
          {
            x: tempRectangle.current!.x2 - translate.current.x,
            y: tempRectangle.current!.y1 - translate.current.y,
          },
          {
            x: tempRectangle.current!.x2 - translate.current.x,
            y: tempRectangle.current!.y2 - translate.current.y,
          },
          {
            x: tempRectangle.current!.x1 - translate.current.x,
            y: tempRectangle.current!.y2 - translate.current.y,
          },
        ],
      });
      canvasBounds.current.push({
        x1: tempRectangle.current!.x1 - translate.current.x,
        y1: tempRectangle.current!.y1 - translate.current.y,
        x2: tempRectangle.current!.x2 - translate.current.x,
        y2: tempRectangle.current!.y2 - translate.current.y,
      });
      tempRectangle.current = null;
    } else if (
      currentMode.current === Mode.Default &&
      selectedSShapeIndex.current != -1
    ) {
      canvasObjects.current[selectedSShapeIndex.current].points.forEach(
        (point) => {
          point.x += shapeTranslate.current.x;
          point.y += shapeTranslate.current.y;
        }
      );

      canvasBounds.current[selectedSShapeIndex.current].x1 +=
        shapeTranslate.current.x;
      canvasBounds.current[selectedSShapeIndex.current].x2 +=
        shapeTranslate.current.x;
      canvasBounds.current[selectedSShapeIndex.current].y1 +=
        shapeTranslate.current.y;
      canvasBounds.current[selectedSShapeIndex.current].y2 +=
        shapeTranslate.current.y;
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
      canvasObjects.current[selectedSShapeIndex.current] = {
        type: Shape.rect,
        points: [
          {
            x: p1.x,
            y: p1.y,
          },
          {
            x: p1.x,
            y: selectedDotOpp.current.y,
          },

          { x: selectedDotOpp.current.x, y: selectedDotOpp.current.y },
          { x: selectedDotOpp.current.x, y: p1.y },
        ],
      };
      canvasBounds.current[selectedSShapeIndex.current] = {
        x1: p1.x,
        y1: p1.y,
        x2: selectedDotOpp.current.x,
        y2: selectedDotOpp.current.y,
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
