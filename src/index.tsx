import { createRoot } from "react-dom/client";
import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import "./index.css";
const root = createRoot(document.getElementById("root")!);

enum Mode {
  Default,
  CreateShape,
}

function MyCanvas(props) {
  const canvasRef: React.MutableRefObject<HTMLCanvasElement | null> =
    useRef(null);
  const canvasContext = useRef<CanvasRenderingContext2D | null>(null);
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const canvasObjects = useRef<any>([]);
  const currentMode = useRef(Mode.Default);
  const lastMouseEvent = useRef<null | MouseEvent>(null);
  const tempRectangle = useRef<null | {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
  }>(null);

  function startDrawingLoop() {
    requestAnimationFrame(startDrawingLoop);
    canvasContext.current?.clearRect(0, 0, width, height);
    if (tempRectangle.current != null) {
      canvasContext.current?.strokeRect(
        tempRectangle.current.x1,
        tempRectangle.current.y1,
        tempRectangle.current.x2 - tempRectangle.current.x1,
        tempRectangle.current.y2 - tempRectangle.current.y1
      );
    }

    for (const obj of canvasObjects.current) {
      canvasContext.current?.strokeRect(
        obj.x1,
        obj.y1,
        obj.x2 - obj.x1,
        obj.y2 - obj.y1
      );
    }
  }

  function handleLeftDown(ev: MouseEvent) {
    if (currentMode.current === Mode.Default) {
      currentMode.current = Mode.CreateShape;
      document.body.style.cursor = "crosshair";
    }
    console.log(ev);
    lastMouseEvent.current = ev;
  }

  function handleLeftUp(ev: MouseEvent) {
    if (currentMode.current === Mode.CreateShape) {
      canvasObjects.current.push(tempRectangle.current!);
      currentMode.current = Mode.Default;
      tempRectangle.current = null;
    }
    lastMouseEvent.current = ev;
  }

  function handleMouseMove(ev: MouseEvent) {
    if (currentMode.current === Mode.CreateShape) {
      tempRectangle.current = {
        x1: lastMouseEvent.current!.clientX,
        y1: lastMouseEvent.current!.clientY,
        x2: ev.clientX,
        y2: ev.clientY,
      };
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
    document.addEventListener("mousedown", handleLeftDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleLeftUp);
    return () => window.removeEventListener("resize", update);
  });

  return <canvas ref={canvasRef} width={width} height={height}></canvas>;
}

root.render(<MyCanvas />);
