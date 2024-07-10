export const imageGen = (svgPathString) =>
  `data:image/svg+xml, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="${svgPathString}" /></svg>`;
