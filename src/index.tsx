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
import { Line, dist, slope } from "./line.ts";
import { TODOFindABetterName } from "./parser.ts";
const root = createRoot(document.getElementById("root")!);
enum Shape {
  rect = "rect",
  circle = "circle",
  triangle = "triangle",
  man_svg = "man_svg",
  heart_svg = "heart_svg",
  hexagon = "hexagon",
  star = "star",
  pentagon = "pentagon",
  ninja_star = "ninja_star",
  health = "health",
  cylinder = "cylinder",
  cube = "cube",
  man_pushing = "man_pushing",
  diamond = "diamond",
  custom = "custom",

  // heart_svg = "heart_svg",
  // tree_svg = "tree_svg",
  // svg = "svg",
}
const arrow_cursor = `data:image/svg+xml,base64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI%2FPg0KPCEtLSBVcGxvYWRlZCB0bzogU1ZHIFJlcG8sIHd3dy5zdmdyZXBvLmNvbSwgR2VuZXJhdG9yOiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI%2BDQo8c3ZnIGZpbGw9IiMwMDAwMDAiIGhlaWdodD0iMzJweCIgd2lkdGg9IjMycHgiIHZlcnNpb249IjEuMSIgaWQ9IkNhcGFfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgDQoJIHZpZXdCb3g9IjAgMCAyMDkuMTM1IDIwOS4xMzUiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHBhdGggZD0iTTQxLjYxNSw3Ny43OTF2NTMuNTUySDBWNzcuNzkxSDQxLjYxNXogTTU2Ljc1LDc3Ljc5MXY1My41NTJoNDEuNjE1Vjc3Ljc5MUg1Ni43NXogTTE2NC44NTcsNjAuMjg5TDE1NC4yNSw3MC44OTcNCglsNi44OTUsNi44OTVsMCwwbDI2Ljc3NywyNi43NzZsLTMzLjY3MiwzMy42NzFsMTAuNjA3LDEwLjYwN2w0NC4yNzctNDQuMjc4TDE2NC44NTcsNjAuMjg5eiBNMTQzLjY0NCwxMjcuNjMybDIzLjA2NS0yMy4wNjQNCglsLTIzLjA2NS0yMy4wNjRsLTMuNzEyLTMuNzEySDExMy41djUzLjU1MmgyNi40MzJMMTQzLjY0NCwxMjcuNjMyeiIvPg0KPC9zdmc%2B`;

const imageGen = (svgPathString) =>
  `data:image/svg+xml, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="${svgPathString}" /></svg>`;

const extractPathFromSVGFile = (file_content) => {
  console.log("CDN: " + file_content);
  const regex = /path d="([^"]+)"/;
  const match = file_content.match(regex)[1];
  console.log("CDN: " + match);
  return match;
};

const svgs = {
  heart_svg:
    "M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z",
  man_svg:
    "M75,73H64.152771C64.37146,72.6793823,64.5,72.2923584,64.5,71.875V63.2568359C64.5,54.173828099999994,60.9628906,45.634765599999994,54.5400391,39.211914L51.7982788,36.4701537C51.9255981,35.7901001,52,35.0914917,52,34.375C52,28.1025391,46.8969727,23,40.625,23S29.25,28.1025391,29.25,34.375S34.3530273,45.75,40.625,45.75C44.635376,45.75,48.1600952,43.658569299999996,50.1861572,40.5142822L50.8366699,41.1647949L45.4335938,57.375H28.125C27.5745239,57.375,27.0762939,57.5977783,26.7146606,57.9576416C26.713562,57.9586792,26.7120361,57.9588623,26.7109375,57.959960900000006L25.7949219,58.87597650000001C23.9926758,60.6787109,23,63.0761719,23,65.625C23,66.7294922,23.8955078,67.625,25,67.625S27,66.7294922,27,65.625C27,64.1445312,27.5766602,62.7519531,28.6235352,61.7050781L28.9537964,61.375H32.742981C32.3910523,61.8860474,32.2771607,62.5308838,32.4775391,63.1328125L40.9750977,88.625H37.5C36.3955078,88.625,35.5,89.5205078,35.5,90.625S36.3955078,92.625,37.5,92.625H43.75C44.3930664,92.625,44.996582000000004,92.3164062,45.3725586,91.7939453C45.7485352,91.2724609,45.8505859,90.60253900000001,45.6474609,89.9921875L37.5371093,65.66210939999999L59.550354,73H50C48.8955078,73,48,73.8955078,48,75V90.625C48,91.7294922,48.8955078,92.625,50,92.625H75C76.1044922,92.625,77,91.7294922,77,90.625V75C77,73.8955078,76.1044922,73,75,73ZM40.625,41.75C36.5585937,41.75,33.25,38.4414062,33.25,34.375S36.5585938,27,40.625,27S48,30.3085938,48,34.375S44.6914063,41.75,40.625,41.75ZM37.324707,61.375H46.875C47.7358398,61.375,48.5,60.8242187,48.7724609,60.0078125L53.9328003,44.5267944C58.1851807,49.8273926,60.5,56.3629761,60.5,63.2568359V69.1000976L37.324707,61.375ZM73,88.625H52V77H73V88.625Z",
  hexagon:
    "M5.3378906,2L0.671875,10L5.3378906,18L14.662109,18L19.328125,10L14.662109,2L5.3378906,2ZM5.9121094,3L14.087891,3L18.171875,10L14.087891,17L5.9121094,17L1.828125,10L5.9121094,3Z",
  star: "M11.2691,4.41115C11.5006,3.89177,11.6164,3.63208,11.7776,3.55211C11.9176,3.48263,12.082,3.48263,12.222,3.55211C12.3832,3.63208,12.499,3.89177,12.7305,4.41115L14.5745,8.54808C14.643,8.70162,14.6772,8.77839,14.7302,8.83718C14.777,8.8892,14.8343,8.93081,14.8982,8.95929C14.9705,8.99149,15.0541,9.00031,15.2213,9.01795L19.7256,9.49336C20.2911,9.55304,20.5738,9.58288,20.6997,9.71147C20.809,9.82316,20.8598,9.97956,20.837,10.1342C20.8108,10.3122,20.5996,10.5025,20.1772,10.8832L16.8125,13.9154C16.6877,14.0279,16.6252,14.0842,16.5857,14.1527C16.5507,14.2134,16.5288,14.2807,16.5215,14.3503C16.5132,14.429,16.5306,14.5112,16.5655,14.6757L17.5053,19.1064C17.6233,19.6627,17.6823,19.9408,17.5989,20.1002C17.5264,20.2388,17.3934,20.3354,17.2393,20.3615C17.0619,20.3915,16.8156,20.2495,16.323,19.9654L12.3995,17.7024C12.2539,17.6184,12.1811,17.5765,12.1037,17.56C12.0352,17.5455,11.9644,17.5455,11.8959,17.56C11.8185,17.5765,11.7457,17.6184,11.6001,17.7024L7.67662,19.9654C7.18404,20.2495,6.93775,20.3915,6.76034,20.3615C6.60623,20.3354,6.47319,20.2388,6.40075,20.1002C6.31736,19.9408,6.37635,19.6627,6.49434,19.1064L7.4341,14.6757C7.46898,14.5112,7.48642,14.429,7.47814,14.3503C7.47081,14.2807,7.44894,14.2134,7.41394,14.1527C7.37439,14.0842,7.31195,14.0279,7.18708,13.9154L3.82246,10.8832C3.40005,10.5025,3.18884,10.3122,3.16258,10.1342C3.13978,9.97956,3.19059,9.82316,3.29993,9.71147C3.42581,9.58288,3.70856,9.55304,4.27406,9.49336L8.77835,9.01795C8.94553,9.00031,9.02911,8.99149,9.10139,8.95929C9.16534,8.93081,9.2226,8.8892,9.26946,8.83718C9.32241,8.77839,9.35663,8.70162,9.42508,8.54808L11.2691,4.41115Z",
  pentagon:
    "M10,1.8789062L1.5664062,8.0878906L4.7871094,18H15.212891L18.433594,8.0878906ZM10,3.1210938L17.259766,8.4648438L14.486328,17H5.5136719L2.7402344,8.4648438Z",
  cube: "M10.005859,0.5A0.50083746,0.50083746,0,0,0,9.7539062,0.56445312L1.7539062,5.0644531A0.50083746,0.50083746,0,0,0,1.5,5.5L1.5,14.5A0.50083746,0.50083746,0,0,0,1.7539062,14.935547L9.7539062,19.435547A0.50083746,0.50083746,0,0,0,10.246094,19.435547L18.246094,14.935547A0.50083746,0.50083746,0,0,0,18.5,14.5L18.5,5.5A0.50083746,0.50083746,0,0,0,18.246094,5.0644531L10.246094,0.56445312A0.50083746,0.50083746,0,0,0,10.005859,0.5ZM10,1.5742188L16.978516,5.5L10,9.4257812L3.0214844,5.5L10,1.5742188ZM2.5,6.3554688L9.5,10.292969L9.5,18.144531L2.5,14.207031L2.5,6.3554688ZM17.5,6.3554688L17.5,14.207031L10.5,18.144531L10.5,10.292969L17.5,6.3554688Z",
  ninja_star:
    "M10,1L6.8183594,6.8183594L1,10L6.8183594,13.181641L10,19L13.181641,13.181641L19,10L13.181641,6.8183594L10,1ZM10,3.0839844L12.445312,7.5546875L16.916016,10L12.445312,12.445312L10,16.916016L7.5546875,12.445312L3.0839844,10L7.5546875,7.5546875L10,3.0839844Z",
  health:
    "M7,1L7,7L1,7L1,13L7,13L7,19L13,19L13,13L19,13L19,7L13,7L13,1L7,1ZM8,2L12,2L12,8L18,8L18,12L12,12L12,18L8,18L8,12L2,12L2,8L8,8L8,2Z",
  cylinder:
    "M13.482422,2.6582031C13.133056,2.6636057,12.795111,2.7495075,12.5,2.9199219A0.50083746,0.50083746,0,0,0,12.476562,2.9335938L12.402344,2.984375L12.390625,2.9902344L2.6269531,8.3613281C2.584747,8.3817481,2.5412616,8.3960995,2.5,8.4199219C2.4748121,8.4344641,2.4539509,8.4532609,2.4296875,8.46875L2.4023438,8.484375L2.4042969,8.4863281C1.6685363,8.9728358,1.3624224,9.8914061,1.3789062,10.886719C1.3961192,11.926084,1.7435478,13.108932,2.4023438,14.25C3.0611398,15.391068,3.9112245,16.28377,4.8027344,16.818359C5.6495626,17.326156,6.5896788,17.520074,7.375,17.138672L7.3847656,17.15625L17.384766,11.65625L17.375,11.638672L17.460938,11.599609A0.50083746,0.50083746,0,0,0,17.5,11.580078C18.308526,11.11297,18.638451,10.152709,18.621094,9.1132812C18.603737,8.0738535,18.25656,6.8910133,17.597656,5.75C16.550872,3.9370865,15.007834,2.6344963,13.482422,2.6582031ZM13.498047,3.6582031C14.368659,3.6446731,15.804495,4.6463157,16.730469,6.25C17.314191,7.2608235,17.607347,8.3056724,17.621094,9.1289062C17.634826,9.9512607,17.385929,10.487134,17,10.710938C17,10.710938,17,10.712891,17,10.712891L16.921875,10.748047A0.50083746,0.50083746,0,0,0,16.744141,10.867188L8.5683594,15.363281C8.6087091,15.122127,8.627306,14.870458,8.6230469,14.613281C8.6058338,13.573916,8.2564522,12.391068,7.5976562,11.25C6.9388602,10.108932,6.0887755,9.21623,5.1972656,8.6816406C5.0107639,8.5698057,4.8180846,8.4834407,4.625,8.4042969L12.822266,3.8964844L12.826172,3.8945312A0.50083746,0.50083746,0,0,0,12.916016,3.84375L13.003906,3.7851562C13.141765,3.7063342,13.301413,3.6612439,13.498047,3.6582031ZM3.328125,9.171875C3.6901328,9.1125255,4.154064,9.2234856,4.6835938,9.5410156C5.3896328,9.9643882,6.1468413,10.739128,6.7304688,11.75C7.3140957,12.760872,7.6074614,13.807724,7.6210938,14.630859C7.6347258,15.453993,7.3867006,15.98963,7,16.212891C6.6132994,16.436153,6.0243986,16.38431,5.3183594,15.960938C4.6123197,15.537563,3.8531583,14.758919,3.2695312,13.748047C2.6859038,12.737175,2.392538,11.694228,2.3789062,10.871094C2.3657244,10.075159,2.5998817,9.5523171,2.9648438,9.3164062L3.0546875,9.2675781C3.1387135,9.2259252,3.2276047,9.1883548,3.328125,9.171875Z",
  man_pushing:
    "M92.625,40.625C92.625,39.5205078,91.7294922,38.625,90.625,38.625S88.625,39.5205078,88.625,40.625C88.625,42.96875,86.71875,44.875,84.375,44.875H63.7432861C67.8532715,43.1588135,70.75,39.1000977,70.75,34.375C70.75,28.1025391,65.6474609,23,59.375,23S48,28.1025391,48,34.375C48,38.3856812,50.091430700000004,41.9102173,53.2356567,43.9362183L36.0872192,61.0846558C36.0864257,61.0854493,36.0854492,61.0864258,36.0846557,61.0872193L11.0859375,86.0859375C10.6953125,86.4765625,10.5,86.9882813,10.5,87.5V90.625C10.5,93.4511719,12.7988281,95.75,15.625,95.75C16.7294922,95.75,17.625,94.8544922,17.625,93.75S16.7294922,91.75,15.625,91.75C15.0048828,91.75,14.5,91.2451172,14.5,90.625V88.328125L35.5,67.328125V80.421875L23.5872192,92.3346558C23.2245483,92.6966553,23,93.1970825,23,93.75C23,94.8544922,23.8955078,95.75,25,95.75H31.25C32.3544922,95.75,33.25,94.8544922,33.25,93.75S32.3544922,91.75,31.25,91.75H29.828125L38.9140625,82.6640625C39.2890625,82.2890625,39.5,81.7802734,39.5,81.25V63.328125L53.1883545,49.6397705C57.3895874,53.1875,62.6512451,55.125,68.2138672,55.125H84.375C85.4794922,55.125,86.375,54.2294922,86.375,53.125S85.4794922,51.125,84.375,51.125H68.2138672C64.9986572,51.125,61.90417479999999,50.3439941,59.144470199999994,48.875H84.375C88.9238281,48.875,92.625,45.1738281,92.625,40.625ZM59.375,27C63.4414063,27,66.75,30.3085938,66.75,34.375S63.4414062,41.75,59.375,41.75S52,38.4414063,52,34.375S55.3085938,27,59.375,27Z",
  diamond:
    "M10,0.099609375L0.099609375,10L10,19.900391L19.900391,10L10,0.099609375ZM10,1.515625L18.484375,10L10,18.484375L1.515625,10L10,1.515625Z",
};

const drawables = Object.values(Shape);

console.log("draw: " + drawables);
enum Mode {
  Default,
  CreateShape,
  Pan,
  DrawArrow,
}

let MatrixProd = (A, B) =>
  A.map((row, i) =>
    B[0].map((_, j) => row.reduce((acc, _, n) => acc + A[i][n] * B[n][j], 0))
  );

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
function scaleX(x, y, fac) {
  // return x;
  const transMatrix = [
    [fac, 0],
    [0, 1],
  ];
  return MatrixProd(transMatrix, [[x], [y]]).flat();
}
function scaleXY(y, fac) {
  // return y;
  const transMatrix = [
    [fac, 0],
    [0, 1],
  ];
  return MatrixProd(transMatrix, [[0], [y]])[1][0];
}
function scaleY(x, y, fac) {
  // return x;
  const transMatrix = [
    [1, 0],
    [0, fac],
  ];

  return MatrixProd(transMatrix, [[x], [y]]).flat();
}
function scaleYY(y, fac) {
  // return y;
  const transMatrix = [
    [1, 0],
    [0, fac],
  ];

  return MatrixProd(transMatrix, [[0], [y]])[1][0];
}

function rotate(x, y, rad) {
  const transMatrix = [
    [Math.cos(rad), -Math.sin(rad)],
    [Math.sin(rad), Math.cos(rad)],
  ];
  return MatrixProd(transMatrix, [[x], [y]]).flat();
}

// function rotateY(y, rad) {
//   const transMatrix = [
//     [Math.cos(rad), -Math.sin(rad)],
//     [Math.sin(rad), Math.cos(rad)],
//   ];

//   return MatrixProd(transMatrix, [[0], [y]])[1][0];
// }

function ToolBox({ selectedDrawable }) {
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

function ShapeSettings({
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
        let todo: TODOFindABetterName = obj.todo;
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
        const todo = new TODOFindABetterName(
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
