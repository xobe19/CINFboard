export const extractPathFromSVGFile = (file_content) => {
  console.log("CDN: " + file_content);
  const regex = /path d="([^"]+)"/;
  const match = file_content.match(regex)[1];
  console.log("CDN: " + match);
  return match;
};

