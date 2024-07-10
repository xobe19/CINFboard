import React, { useRef, useEffect, useReducer } from "react";
import { Shape } from "../constants/Shape";
import { extractPathFromSVGFile } from "../helpers/pathExtractor";
import { svgs } from "../constants/shape_data";
import { imageGen } from "../helpers/imageGen";
const drawables = Object.values(Shape);
export function ToolBox({ selectedDrawable }) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const residualRef = useRef<number | null>(null);
  useEffect(() => {
    divRef.current.classList.add("visible");
    ["mousedown", "mouseup", "contextmenu", "mousemove"].forEach(
      (eventString) => {
        divRef.current.addEventListener(eventString, (ev: MouseEvent) => {
          ev.stopPropagation();
        });
      }
    );
    console.log("haha: " + residualRef.current);
    residualRef.current =
      (divRef.current.clientHeight - drawables.length * 30) / drawables.length;
    forceUpdate();
  }, []);

  const selectedDrawableIndex = drawables.findIndex(
    (e) => e === selectedDrawable.current
  );

  return (
    <div id="toolbox">
      <input
        type="file"
        id="custom_svg_upload"
        style={{ display: "none" }}
        ref={inputFileRef}
        onChange={() => {
          console.log("CDN: exec??");
          let file = inputFileRef.current.files[0];
          console.log("CDN: " + file);
          while (file === undefined) {
            console.log("CDN: file" + JSON.stringify(file));
            file = inputFileRef.current.files[0];
          }
          const reader = new FileReader();
          reader.onload = (ev) => {
            const file_content = ev.target.result;
            svgs["custom"] = extractPathFromSVGFile(file_content);
            console.log("CDN: ev l" + svgs["custom"]);
          };
          reader.readAsText(file, "UTF-8");

          selectedDrawable.current = "custom";
          forceUpdate();
        }}
      ></input>
      <div id="toolbox-shadow">
        <div
          className="shadow bg-white"
          style={{
            top: `${
              selectedDrawableIndex * (residualRef.current + 30) +
              residualRef.current / 2
            }px`,
          }}
        ></div>
      </div>
      <div id="toolbox-foreground" ref={divRef}>
        {drawables.map((drawable) => {
          return drawable === "custom" ? (
            <label htmlFor="custom_svg_upload">
              <a>
                <img
                  src={`./assets/${drawable}.svg`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = imageGen(
                      svgs[drawable]
                    );
                    // e.target.error = null;
                  }}
                  width={20}
                  height={20}
                ></img>
              </a>
            </label>
          ) : (
            <a
              onClick={() => {
                selectedDrawable.current = drawable;
                forceUpdate();
              }}
            >
              <img
                src={`./assets/${drawable}.svg`}
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src = imageGen(svgs[drawable]);
                  // e.target.error = null;
                }}
                width={20}
                height={20}
              ></img>
            </a>
          );
        })}
      </div>
    </div>
  );
}
