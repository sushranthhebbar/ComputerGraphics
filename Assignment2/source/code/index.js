import Cube from './cube.js'
import Camera from './camera.js'
import Util from './util.js'
import Pyramid from './pyramid.js';
import Diamond from './diamond.js';
import Axis from './axis.js';

var drag = false;
var old_x, old_y;
var dX = 0, dY = 0;
var mode = -1
var axismode = -1
var selectedPrimitive = -1
var primitives = []

main();

function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  var camera = new Camera(gl);
  var cube = new Cube(gl);
  var pyramid = new Pyramid(gl)
  var diamond = new Diamond(gl)
  var xaxis = new Axis(gl, 0)
  var yaxis = new Axis(gl, 1)
  var zaxis = new Axis(gl, 2)
  var util = new Util(gl);
  primitives.push(cube)
  primitives.push(pyramid)
  primitives.push(diamond)
  primitives.push(xaxis)
  primitives.push(yaxis)
  primitives.push(zaxis)

  xaxis.transform.modelRotation = [0.0, 0.0, -1.5705]
  xaxis.transform.t_vector = [1.25, 0.0, 0.0]
  //xaxis.faceColors = [[1.0, 0.0, 0.0, 0.0]]
  //xaxis.updateColorBuffer()
  yaxis.transform.t_vector = [0.0, 1.35, 0.0]


  zaxis.transform.modelRotation = [1.5705, 0.0, 0.0]
  zaxis.transform.t_vector = [0.0, 0.0, 1.25]
  //zaxis.faceColors = [[0.0, 0.0, 1.0, 0.0]]

  const vsSource = `
  attribute vec4 aVertexPosition;
  attribute vec4 aVertexColor;
  attribute float aface;

  uniform int uPickedFace;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying lowp vec4 vColor;

  void main(void) {

    vec3 color = aVertexColor.rgb;
    
    if (uPickedFace == 0)
    {
      vColor = vec4(aVertexColor.rgb, aface/255.0);
    }
    else
    {
      vColor = aVertexColor;
    }
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
`;



  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
      face: gl.getAttribLocation(shaderProgram, 'aface')
    },
    uniformLocations: {
      pickedface: gl.getUniformLocation(shaderProgram, 'uPickedFace'),
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    }
  };
  //console.log(programInfo.uniformLocations.pickedface)

  //console.log("HERE")

 var mouseDown = function(e) {

  const rect = canvas.getBoundingClientRect();
  var mouseX = e.clientX - rect.left;
  var mouseY = e.clientY - rect.top;
  mouseY = canvas.clientHeight - mouseY;

  if(mode==0 || mode==2)
  {
    var projectionMatrix = camera.getPerspective()
    drawScene(gl, programInfo, primitives, camera, projectionMatrix, 1)
    var pixel = new Uint8Array(4);
    gl.readPixels(mouseX, mouseY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    //console.log(pixel)
    selectedPrimitive = util.getId(pixel[0], pixel[1], pixel[2], pixel[3]);
    if(mode==2)
    {
        if(selectedPrimitive>=0 && selectedPrimitive<=2)
        {
          console.log(selectedPrimitive)
          primitives[selectedPrimitive].updateColorId()
          var colorBuffer = primitives[selectedPrimitive].updateColorBuffer()
          primitives[selectedPrimitive].updateBuffer(colorBuffer)
        }
    }
    drawScene(gl, programInfo, primitives, camera, projectionMatrix, 0);
    //console.log(selectedPrimitive)
  }
  
  if(mode==3)
  {
    var projectionMatrix = camera.getPerspective()
    drawScene(gl, programInfo, primitives, camera, projectionMatrix, 1)
    var pixel = new Uint8Array(4);
    gl.readPixels(mouseX, mouseY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    //console.log(pixel)
    selectedPrimitive = util.getId(pixel[0], pixel[1], pixel[2], pixel[3]);
    if(selectedPrimitive>=0 && selectedPrimitive<=2)
    {
        var primitive = primitives[selectedPrimitive]
        primitive.setPickedFace(programInfo, 0)
        gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to white, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
      
        // Clear the canvas before we start drawing on it.
      
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        primitive.draw(programInfo, projectionMatrix, 0, 1)
        pixel = new Uint8Array(4);
        gl.readPixels(mouseX, mouseY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        var face = pixel[3]
        console.log(face)

        primitive.setPickedFace(programInfo, -1)
        primitive.updateFaceColorId()
        var colorBuffer = primitive.updateColorBuffer(1, face)
        primitive.updateBuffer(colorBuffer)
    }
    drawScene(gl, programInfo, primitives, camera, projectionMatrix, 0);
  }

  drag = true;
  old_x = e.pageX, old_y = e.pageY;
  e.preventDefault();

  return false;
};

 var mouseUp = function(e){
    drag = false;
 };

 var mouseMove = function(e) {
    if(mode!=1) return false;
    if (!drag) return false;
    dX = (e.pageX-old_x)*2*Math.PI/canvas.width
    
    if(axismode>=0)
    {
      camera.setCameraRotation(axismode, dX)
    }
    
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
 };

 canvas.addEventListener("mousedown", mouseDown, false);
 canvas.addEventListener("mouseup", mouseUp, false);
 canvas.addEventListener("mouseout", mouseUp, false);
 canvas.addEventListener("mousemove", mouseMove, false);
  

  window.addEventListener('keyup', (event) =>{
    if(event.code=="KeyM")
    {
      mode=(mode+1)%4;
      console.log(mode)
    }
    if(event.code=="KeyA")
    {
      axismode = (axismode+1)%3
    }
    if(mode==0)
    {
      if(selectedPrimitive>=0 && selectedPrimitive<=2)
      {
        if(event.code=="KeyI")
        {
          //t_vector[2]+=v
          primitives[selectedPrimitive].transform.setModelTranslation(2,1)
        }
        else if(event.code=="KeyO")
        {
          //t_vector[2]-=v
          primitives[selectedPrimitive].transform.setModelTranslation(2,-1)
        }
        else if(event.code=="ArrowRight")
        {
          //t_vector[0]+=v
          primitives[selectedPrimitive].transform.setModelTranslation(0,1)
        }
        else if(event.code=="ArrowLeft")
        {
          //t_vector[0]-=v
          primitives[selectedPrimitive].transform.setModelTranslation(0,-1)
        }
        else if(event.code=="ArrowUp")
        {
          //t_vector[1]+=v
          primitives[selectedPrimitive].transform.setModelTranslation(1,1)
        }
        else if(event.code=="ArrowDown")
        {
          //t_vector[1]-=v
          primitives[selectedPrimitive].transform.setModelTranslation(1,-1)
        }
        else if(event.code=="NumpadAdd")
        {
          /*
          s_vector[0]+=s
          s_vector[1]+=s
          s_vector[2]+=s
          */
         primitives[selectedPrimitive].transform.setModelScale(0,1)
         primitives[selectedPrimitive].transform.setModelScale(1,1)
         primitives[selectedPrimitive].transform.setModelScale(2,1)
        }
        else if(event.code=="NumpadSubtract")
        {
         primitives[selectedPrimitive].transform.setModelScale(0,-1)
         primitives[selectedPrimitive].transform.setModelScale(1,-1)
         primitives[selectedPrimitive].transform.setModelScale(2,-1)
        }
        else if(event.code=="Numpad8")
        {
          primitives[selectedPrimitive].transform.setModelRotation(axismode, 1)
        }
        else if(event.code=="Numpad2")
        {
          primitives[selectedPrimitive].transform.setModelRotation(axismode, -1)
        }
      }
      }
      
    //console.log(event.code)
    //console.log(t_vector)
    //console.log(s_vector)
  }
  )

  initBuffers(gl, programInfo, primitives, camera);
}

function initBuffers(gl, programInfo, primitives, camera) {

  //var p = Geometry.loadurls(['../obj/cube.obj','../obj/pyramid.obj','../obj/diamond.obj'])
  // Create a buffer for the cube's vertex positions.
  var p1 = Geometry.loadurls(['../obj/axis1.obj'])
  p1.then(function(data)
  {
    primitives.forEach((primitive,index) =>{
      if(index>=3)
      {
        primitive.setBuffers(data[0])
      }
    })
    var p = Geometry.loadurls(['../obj/cube1.obj','../obj/pyramid1.obj','../obj/diamond1.obj'])
    p.then(function (data) {
      //objects.push(new Mesh(gl, data))
      //after(gl, data, programInfo)
      //console.log(data)
      //console.log(primitives[0])
      //console.log(data.length)
      primitives.forEach((primitive,index) =>{
        if(index<3)
        {
          primitive.setBuffers(data[index])
        }
      });
      // Draw the scene repeatedly
      //console.log(camera.getPerspective())
      var projectionMatrix = camera.getPerspective()
      function render() {
        drawScene(gl, programInfo, primitives, camera, projectionMatrix, 0);
    
        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);
  
    })
  })
  
}

function drawScene(gl, programInfo, primitives, camera, projectionMatrix, select) {
  gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to white, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  

//const modelMatrix = mat4.create();
//const ViewMatrix = mat4.create();
camera.setViewMatrix()
var ViewMatrix = camera.getViewMatrix()



primitives.forEach((primitive,index) => {

  primitive.transform.setModelViewMatrix(ViewMatrix)
  primitive.draw(programInfo, projectionMatrix, select)

})
}


function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

 
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}


function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);

  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

