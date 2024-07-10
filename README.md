
# Cinfboard

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

A simple whiteboard that can draw shapes, perform transformations and has truly infinite space :)


## Description

Ever wondered how infinite whiteboard sites like draw.io or Miro work on your browser and how they are able to handle complex shapes, animations on a simple HTML5 canvas?

This project was made to demystify the complexity of infinite whiteboards by building one such whtieboard with

* All the major features of existing whiteboards
* Simple + Minimal code
* **NO EXTERNAL LIBRARIES** (just pure React.js and Webpack + Babel )

## Demo

### Creating New Shapes

![create shape](https://github.com/xobe19/infinite_whiteboard/assets/79440952/f94cac86-1c81-4e7c-8fd7-0fabe15bf33f)

* Supports creation of a wide variety of Shapes
* The shape catalog can be easily extended by the devs since we're using SVG Absolute D-Paths as shapes
* Shapes on the board are stored in-memory as a React Ref 

### Resizing Shapes

![resize shape](https://github.com/xobe19/infinite_whiteboard/assets/79440952/30a97d17-40e7-4776-b7b5-9119322a4696)

* Internally using Affine Transformations to resize any SVG Shape
* Shape resizing for complex SVG Shapes is performed by first parsing the SVG Path string, performing transformations and then generating a new SVG Path String
* Supports resizing through any corner and at any rotation angle
* Since HTML Canvas doesn't support hover/click/drag detection of any of the objects on the screen, manual hover/click/drag detection was setup that works based on mouse co-ordintes

### Rotating Shapes

![rotate shape](https://github.com/xobe19/infinite_whiteboard/assets/79440952/c8fece12-05fc-4076-95f3-401cb21c8284)

* Rotates a shape about the center
* Uses simple matrix multiplication as a linear transformation to rotate any complex shape
* SVG Shapes are rotated in a similar fashion as resizing shape

### Arrows between shapes

![draw arrow lines](https://github.com/xobe19/infinite_whiteboard/assets/79440952/e8487950-521e-4e8f-a6b2-4a8a7cfaa5f6)

* Each shape has 4 Arrow sensitive points that are manually detected for hover/click/drag events
* Supports Multiple arrows between multiple shapes
* Arrow creation is only done when the drop-off point of the preview arrow is close to the sensitive point of the second shape, otherwise the arrow is dropped.

### Panning the whiteboard

![pan](https://github.com/xobe19/infinite_whiteboard/assets/79440952/021ddd5b-cac9-4868-8443-7db615137520)

* Whiteboard is panned by using right-click, internally this does not move all the co-ordinates, instead it creates a pseudo-origin (virtual origin) that represents the current perspective of the viewer

### Creating Custom SVG Shape

![custom_svg](https://github.com/xobe19/infinite_whiteboard/assets/79440952/f40ba476-c225-466a-ac03-9d4be9d9213b)

* If our shape catalog does not contain the shape you like, feel free to upload any SVG file and use it as a shape :)

# Running Locally

* Build the project using webpack
* Bundle is created in the "dist/" folder
* Include the created bundle in the "index.html" file by using a `<script>` tag

# Roadmap / New Features:

* Integrate with a websocket server to support real-time collaboration on whiteboard
* Add text support inside shapes
* Improve UI













