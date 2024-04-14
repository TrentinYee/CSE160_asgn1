// HelloPoint1.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' + // attribute variable
  'uniform float u_PointSize; \n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_PointSize;\n' +
  '}\n'; 

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' + // Set the point color
  '}\n';

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//Global Variables
let canvas;
let gl;
let a_Position;
let u_PointSize;
let u_FragColor;

// Global UI element related variables
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10;
let g_selectedType=POINT;
let g_selectedSegment=10;

// all the UI interaction
function addActionsForHtmlUI() {
  // Color Sliders
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100});
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100});
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100});

  // Selecting the shape
  document.getElementById('pointButton').onclick = function() { g_selectedType=POINT};
  document.getElementById('triButton').onclick = function() { g_selectedType=TRIANGLE};
  document.getElementById('circleButton').onclick = function() { g_selectedType=CIRCLE};

  // Selecting the size through a slider
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value});

  // Selecting the number of circle segments
  document.getElementById('circleSlide').addEventListener('mouseup', function() { g_selectedSegment = this.value});
}

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of uniform variables
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (u_FragColor < 0) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of attribute variables
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
  if (u_PointSize < 0) {
    console.log('Failed to get the storage location of a_PointSize');
    return;
  }
}

// THE MAIN FUNCTION
function main() {

  // sets up canvas and gl
  setupWebGL();

  // set up shader programs and glsl variables
  connectVariablesToGLSL();
  
  // set up the actions for all the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw a point
  //gl.drawArrays(gl.POINTS, 0, 1);
}

var g_shapesList = [];

//var g_points = []; // The array for the position of a mouse press
//var g_colors = []; // The array for all the colors of the shapes stored
//var g_sizes = []; // The array for all the sizes of the shapes stored

function clearCanvas() {
  g_shapesList = [];
  renderAllShapes();
}

function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  // Create and store a new point object
  let point;
  if (g_selectedType==POINT){
    point = new Point();
  } else if (g_selectedType==TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments=g_selectedSegment;
  }

  point.position=[x, y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  g_shapesList.push(point);

  // Store the coordinates to g_points array
  //g_points.push([x, y]);

  // Store the color to g_colors arry
  //g_colors.push(g_selectedColor.slice());

  //g_sizes.push(g_selectedSize);

  renderAllShapes();
}

// converts the coordiantes of the event to the coordinates needed
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

// renders all stored shapes
function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i += 1) {
    g_shapesList[i].render();
  }
}

