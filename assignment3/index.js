import Cube from './cube.js'
import Ico from './ico.js'
import Camera from './camera.js'
import Sphere from './sphere.js'
import Util from './util.js'

var primitives = [];
var shaders = [];
var shaderNames = [];
var lightSwitches = [];
var illuminationtoggle = 1;
var selectedPrimitive = 2;
var mouseQuat = quat.create();
var prev_rot = vec3.create();
var prev_tran = [0, 0, 0];
var drag = false;
var mouseButton;
var key;

function pInfo(shaderProgram, gl){
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      normalPosition: gl.getAttribLocation(shaderProgram, 'aNormal'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      modelMatrixInverseTranspose: gl.getUniformLocation(shaderProgram, 'uModelMatrixInverseTranspose'),
      modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
      //lightModelMatrix: gl.getUniformLocation(shaderProgram, 'uLightModelMatrix'),
      //lightworldPosition: gl.getUniformLocation(shaderProgram, 'uLightWorldPosition'),
      ViewWorldPosition: gl.getUniformLocation(shaderProgram, 'uViewWorldPosition'),
      ka: gl.getUniformLocation(shaderProgram, 'ka'),
      kd: gl.getUniformLocation(shaderProgram, 'kd'),
      ks: gl.getUniformLocation(shaderProgram, 'ks'),
      Shine: gl.getUniformLocation(shaderProgram, 'ushine'),
      //ambientColor: gl.getUniformLocation(shaderProgram, 'ambientColor'),
      //diffuseColor:  gl.getUniformLocation(shaderProgram, 'diffuseColor'),
      //specularColor: gl.getUniformLocation(shaderProgram, 'specularColor'),
      //lightON: gl.getUniformLocation(shaderProgram, 'lightON'),
      color: gl.getUniformLocation(shaderProgram, 'color'),
      //a: gl.getUniformLocation(shaderProgram, 'a'),
      //b: gl.getUniformLocation(shaderProgram, 'b'),
      //c: gl.getUniformLocation(shaderProgram, 'c'),
    }
  };

  return programInfo;
}


function trackBall(x, y, canvas){
  x = (2*x - canvas.clientWidth)/(canvas.clientWidth)
  y = (2*y - canvas.clientHeight)/(canvas.clientHeight)
  z = 0

  var v = vec3.create()
  vec3.set(v, x, y, z)
  var len = vec3.length(v)
  var len = (len<1.0) ? len : 1.0;
  var z = Math.sqrt(1 - (len*len))
  vec3.set(v, x, y, z)
  vec3.normalize(v, v)
  return v;
}

function rotate(x, y, canvas){
  var now = trackBall(x, y, canvas)
  var axis = vec3.create()
  vec3.cross(axis, now, prev_rot)
  vec3.normalize(axis, axis)
  var diff = vec3.create()
  vec3.subtract(diff ,now ,prev_rot)
  var dis = -2*vec3.length(diff) * 0.9
  var curQuat = quat.create()
  quat.setAxisAngle(curQuat, axis, dis)
  quat.multiply(mouseQuat, curQuat, mouseQuat)
  prev_rot = now
}

window.addEventListener('keyup', (event) =>{
  //console.log(event.code);
  if(event.code=="KeyM")
  {
    key = 0;
  }
  else if(event.code=="KeyS")
  {
    key = 1;
    if(selectedPrimitive>=3)
    {
      shaders[selectedPrimitive-3] ^= 1;
      //console.log(selectedPrimitive);
      //console.log(shaders[selectedPrimitive-3]);
    }
  }
  else if(event.code=="KeyI")
  {
    key = 2;
  }
  else if(event.code=="Numpad0" && key==2)
  {
      //console.log("HERE");
      illuminationtoggle = 0;
      if(selectedPrimitive>=3)
      {
        lightSwitches[selectedPrimitive-3] = illuminationtoggle;
      }
  }
  else if(event.code=="Numpad1" && key==2)
  {
      illuminationtoggle = 1;
      if(selectedPrimitive>=3)
      {
        lightSwitches[selectedPrimitive-3] = illuminationtoggle;
      }
  }
  else if(event.code=="Numpad2" && key==2)
  {
    if(selectedPrimitive>=3)
    {
      primitives[selectedPrimitive-3].transform.setLightVector(1, -1);
    }
  }
  else if(event.code=="Numpad8" && key==2)
  {
    if(selectedPrimitive>=3)
    {
      primitives[selectedPrimitive-3].transform.setLightVector(1, 1);
    }
  }
  else if(event.code=="Numpad4" && key==2)
  {
    if(selectedPrimitive>=3)
    {
      primitives[selectedPrimitive-3].transform.setLightVector(0, -1);
    }
  }
  else if(event.code=="Numpad6" && key==2)
  {
    if(selectedPrimitive>=3)
    {
      primitives[selectedPrimitive-3].transform.setLightVector(0, 1);
    }
  }
  else if(event.code=="NumpadSubtract" && key==2)
  {
    if(selectedPrimitive>=3)
    {
      primitives[selectedPrimitive-3].transform.setLightVector(2, -1);
    }
  }
  else if(event.code=="NumpadAdd" && key==2)
  {
    if(selectedPrimitive>=3)
    {
      primitives[selectedPrimitive-3].transform.setLightVector(2, 1);
    }
  }
});


main();

function main()
{
    const canvas = document.querySelector('#glcanvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
    if (!gl) {
      alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
    }

    var cube = new Cube(gl);
    var camera = new Camera(gl);
    var util = new Util(gl);
    var ico = new Ico(gl);
    var sphere = new Sphere(gl);

    primitives.push(cube);
    primitives.push(ico);
    primitives.push(sphere);
    shaders.push(0, 0, 0);
    lightSwitches.push(1, 1, 1);

    const phongvsSource = `
    attribute vec4 aVertexPosition;
    attribute vec3 aNormal;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uModelMatrixInverseTranspose;
    uniform mat4 uModelMatrix;

    varying lowp vec3 vnormal;
    varying lowp vec3 vsurfaceWorldPosition;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      //gl_Position = uModelViewMatrix * aVertexPosition;

      vnormal = mat3(uModelMatrixInverseTranspose) * aNormal;

      vsurfaceWorldPosition = (uModelMatrix * aVertexPosition).xyz;

    }
  `;

    const phongfsSource = `

      precision mediump float;

      uniform mat4 uLightModelMatrix;

      uniform float ushine;
      uniform vec3 ka;
      uniform vec3 kd;
      uniform vec3 ks;

      uniform vec3 ambientColor;
      uniform vec3 diffuseColor;
      uniform vec3 specularColor;

      uniform vec3 uLightWorldPosition;
      uniform vec3 uViewWorldPosition;

      uniform float a;
      uniform float b;
      uniform float c;

      uniform int lightON;
      uniform vec4 color;

      varying lowp vec3 vsurfaceWorldPosition;
      varying lowp vec3 vnormal;

      void main(void) {

        if(lightON==1)
        {
          vec3 modifiedLightWorldPosition = (uLightModelMatrix * vec4(uLightWorldPosition, 1.0)).xyz;
          vec3 SurfacetoLight = modifiedLightWorldPosition - vsurfaceWorldPosition;
          vec3 SurfacetoView = uViewWorldPosition - vsurfaceWorldPosition;

          float dist = sqrt(dot(SurfacetoLight, SurfacetoLight));
          float attenuation = 1.0/(a*1.0 + b*dist + c*dist*dist);

          vec3 normal = normalize(vnormal);
          vec3 SurfacetoLightDirection = normalize(SurfacetoLight);
          vec3 SurfacetoViewDirection = normalize(SurfacetoView);
          vec3 halfvector = normalize(SurfacetoLightDirection + SurfacetoViewDirection);
  
          float lambertian = max(dot(normal, SurfacetoLightDirection), 0.0);
          vec3 diffuseComponent = kd * lambertian * diffuseColor * attenuation;
          
          float specular = 0.0;
          if(lambertian>0.0)
          {
            specular = pow(max(dot(normal, halfvector),0.0), ushine);
          }
          
          vec3 specularComponent = ks * specular * specularColor * attenuation;
  
          vec3 ambientComponent = ka * ambientColor;
  
          gl_FragColor = vec4(ambientComponent + diffuseComponent + specularComponent, 1.0);
        }

        else
        {
          gl_FragColor = color;
        }

        //gl_FragColor = vColor;
        //gl_FragColor.rgb*=light;
        //gl_FragColor.rgb+=specular;
      }
    `;

    const gouradvsSource = `
      attribute vec4 aVertexPosition;
      attribute vec3 aNormal;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uModelMatrixInverseTranspose;
      uniform mat4 uModelMatrix;
      uniform mat4 uLightModelMatrix;

      uniform float ushine;
      uniform vec3 ka;
      uniform vec3 kd;
      uniform vec3 ks;

      uniform vec3 ambientColor;
      uniform vec3 diffuseColor;
      uniform vec3 specularColor;

      uniform vec3 uLightWorldPosition;
      uniform vec3 uViewWorldPosition;

      uniform float a;
      uniform float b;
      uniform float c;

      uniform int lightON;
      uniform vec4 color;

      varying lowp vec4 vColor;

      void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        //gl_Position = uModelViewMatrix * aVertexPosition;

        vec3 normal = mat3(uModelMatrixInverseTranspose) * aNormal;

        vec3 surfaceWorldPositon = (uModelMatrix * aVertexPosition).xyz;

        if(lightON==1)
        {
          vec3 modifiedLightWorldPosition = (uLightModelMatrix * vec4(uLightWorldPosition, 1.0)).xyz;
          vec3 SurfacetoLight = modifiedLightWorldPosition - surfaceWorldPositon;
          vec3 SurfacetoView = uViewWorldPosition - surfaceWorldPositon;

          float dist = sqrt(dot(SurfacetoLight, SurfacetoLight));
          float attenuation = 1.0/(a*1.0 + b*dist + c*dist*dist);

          vec3 normal = normalize(normal);
          vec3 SurfacetoLightDirection = normalize(SurfacetoLight);
          vec3 SurfacetoViewDirection = normalize(SurfacetoView);
          vec3 halfvector = normalize(SurfacetoLightDirection + SurfacetoViewDirection);
  
          float lambertian = max(dot(normal, SurfacetoLightDirection), 0.0);
          vec3 diffuseComponent = kd * lambertian * diffuseColor * attenuation;
          
          float specular = 0.0;
          if(lambertian>0.0)
          {
            specular = pow(max(dot(normal, halfvector),0.0), ushine);
          }
          
          vec3 specularComponent = ks * specular * specularColor * attenuation;
  
          vec3 ambientComponent = ka * ambientColor;
  
          vColor = vec4(ambientComponent + diffuseComponent + specularComponent, 1.0);
        }

        else
        {
          vColor = color;
        }

      }  
    
    `;

    const gouradfsSource = `
     precision mediump float;
     varying lowp vec4 vColor;

      void main(){
        gl_FragColor = vColor;
      }
    
    `;

    const gouradmvsSource = `

        attribute vec4 aVertexPosition;
        attribute vec3 aNormal;

        struct Pointlight{
          vec3 uLightWorldPosition;
          mat4 uLightModelMatrix;
          
          int lightON;          

          float a;
          float b;
          float c;

          vec3 ambientColor;
          vec3 diffuseColor;
          vec3 specularColor;
        };

        #define NR_POINT_LIGHTS 3

        uniform Pointlight pointlights[NR_POINT_LIGHTS];
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uModelMatrixInverseTranspose;
        uniform mat4 uModelMatrix;

        uniform vec3 uViewWorldPosition;

        uniform float ushine;
        uniform vec3 ka;
        uniform vec3 kd;
        uniform vec3 ks;
        uniform vec4 color;

        varying lowp vec4 vColor;

        vec3 CalcPointLight(Pointlight light, vec3 normal, vec3 surfaceWorldPosition);

        void main(void){
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
          //gl_Position = uModelViewMatrix * aVertexPosition;
          vec3 normal = mat3(uModelMatrixInverseTranspose) * aNormal;
  
          vec3 surfaceWorldPosition = (uModelMatrix * aVertexPosition).xyz;

          int flag = 0;
          vec3 result = vec3(0.0);

          for(int i = 0; i < NR_POINT_LIGHTS; i++)
          {
            if(pointlights[i].lightON == 1)
            {
               flag = 1;
               result = result + CalcPointLight(pointlights[i], normal, surfaceWorldPosition);
            }
          }
          if(flag == 0)
          {
            vColor = color;
          }
          else
          {
            vColor = vec4(result , 1.0);
          }
        }

        vec3 CalcPointLight(Pointlight light, vec3 normal, vec3 surfaceWorldPosition)
        {
          vec3 modifiedLightWorldPosition = (light.uLightModelMatrix * vec4(light.uLightWorldPosition, 1.0)).xyz;
          vec3 SurfacetoLight = modifiedLightWorldPosition - surfaceWorldPosition;
          vec3 SurfacetoView = uViewWorldPosition - surfaceWorldPosition;

          float dist = sqrt(dot(SurfacetoLight, SurfacetoLight));
          float attenuation = 1.0/(light.a*1.0 + light.b*dist + light.c*dist*dist);

          normal = normalize(normal);
          vec3 SurfacetoLightDirection = normalize(SurfacetoLight);
          vec3 SurfacetoViewDirection = normalize(SurfacetoView);
          vec3 halfvector = normalize(SurfacetoLightDirection + SurfacetoViewDirection);
  
          float lambertian = max(dot(normal, SurfacetoLightDirection), 0.0);
          vec3 diffuseComponent = kd * lambertian * light.diffuseColor * attenuation;
          
          float specular = 0.0;
          if(lambertian>0.0)
          {
            specular = pow(max(dot(normal, halfvector),0.0), ushine);
          }
          
          vec3 specularComponent = ks * specular * light.specularColor * attenuation;
  
          vec3 ambientComponent = ka * light.ambientColor;
  
          return ambientComponent + diffuseComponent + specularComponent ;
        }`;

    const phongmfsSource = `

        precision mediump float;

        struct Pointlight{
          vec3 uLightWorldPosition;
          mat4 uLightModelMatrix;
          
          int lightON;          

          float a;
          float b;
          float c;

          vec3 ambientColor;
          vec3 diffuseColor;
          vec3 specularColor;
        };

        #define NR_POINT_LIGHTS 3

        uniform Pointlight pointlights[NR_POINT_LIGHTS];
        uniform vec3 uViewWorldPosition;

        uniform float ushine;
        uniform vec3 ka;
        uniform vec3 kd;
        uniform vec3 ks;
        uniform vec4 color;

        varying lowp vec3 vsurfaceWorldPosition;
        varying lowp vec3 vnormal;

        vec3 CalcPointLight(Pointlight light, vec3 normal, vec3 surfaceWorldPosition);

        void main(void){

          int flag = 0;
          vec3 result = vec3(0.0);

          for(int i = 0; i < NR_POINT_LIGHTS; i++)
          {
            if(pointlights[i].lightON == 1)
            {
              flag = 1;
              result = result + CalcPointLight(pointlights[i], vnormal, vsurfaceWorldPosition);
            }
          }
          if(flag == 0)
          {
            gl_FragColor = color;
          }
          else
          {
            gl_FragColor = vec4(result , 1.0);
          }
        }

        vec3 CalcPointLight(Pointlight light, vec3 normal, vec3 surfaceWorldPosition)
        {
          vec3 modifiedLightWorldPosition = (light.uLightModelMatrix * vec4(light.uLightWorldPosition, 1.0)).xyz;
          vec3 SurfacetoLight = modifiedLightWorldPosition - surfaceWorldPosition;
          vec3 SurfacetoView = uViewWorldPosition - surfaceWorldPosition;

          float dist = sqrt(dot(SurfacetoLight, SurfacetoLight));
          float attenuation = 1.0/(light.a*1.0 + light.b*dist + light.c*dist*dist);

          normal = normalize(normal);
          vec3 SurfacetoLightDirection = normalize(SurfacetoLight);
          vec3 SurfacetoViewDirection = normalize(SurfacetoView);
          vec3 halfvector = normalize(SurfacetoLightDirection + SurfacetoViewDirection);

          float lambertian = max(dot(normal, SurfacetoLightDirection), 0.0);
          vec3 diffuseComponent = kd * lambertian * light.diffuseColor * attenuation;
          
          float specular = 0.0;
          if(lambertian>0.0)
          {
            specular = pow(max(dot(normal, halfvector),0.0), ushine);
          }
          
          vec3 specularComponent = ks * specular * light.specularColor * attenuation;

          vec3 ambientComponent = ka * light.ambientColor;

          return ambientComponent + diffuseComponent + specularComponent ;
        }
    `;  

    const gouradshaderProgram = initShaderProgram(gl, gouradvsSource, gouradfsSource);

    const phongshaderProgram = initShaderProgram(gl, phongvsSource, phongfsSource);

    const gouradmshaderProgram = initShaderProgram(gl, gouradmvsSource, gouradfsSource); 

    const phongmshaderProgram = initShaderProgram(gl, phongvsSource, phongmfsSource);

    shaderNames.push(gouradmshaderProgram);
    //shaderNames.push(gouradshaderProgram);
    shaderNames.push(phongmshaderProgram);

    var mouseDown = function(e){
      drag = true;
      const rect = canvas.getBoundingClientRect();
      var mouseX = e.clientX - rect.left;
      var mouseY = e.clientY - rect.top;

      drawSelectScene(gl, primitives, camera)
      var pixel = new Uint8Array(4);
      gl.readPixels(mouseX, canvas.clientHeight - mouseY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      //console.log(pixel)
      selectedPrimitive = util.getId(pixel[0], pixel[1], pixel[2], pixel[3]);
      //selectedPrimitive = pixel[3];
      drawScene(gl, primitives, camera)
      //console.log(selectedPrimitive);

      if((selectedPrimitive - 3) < 0)
      {
        selectedPrimitive = 2;
      }

      mouseButton = e.which;
      //console.log(mouseButton)
      
      if(mouseButton==1 && key==0)
      {
        mouseY = canvas.clientHeight - mouseY;
        prev_rot = trackBall(mouseX, mouseY, canvas);
      }
      else if(mouseButton==3 && key==0)
      {
        prev_tran = [mouseX, mouseY, 0.0]
      }
      e.preventDefault();
    }

    var mouseMove = function(e){
      if(!drag) return false;
      //var mouseButton = e.which;
      const rect = canvas.getBoundingClientRect();
      var mouseX = e.clientX - rect.left;
      var mouseY = e.clientY - rect.top;
      //console.log(mouseButton)
      //console.log(selectedPrimitive);
      if((selectedPrimitive -3)>=0 && key==0)
      {
        if(mouseButton==1)
        {
          mouseY = canvas.clientHeight - mouseY;
          rotate(mouseX, mouseY, canvas);
          var m = mat4.create()
          mat4.fromQuat(m, mouseQuat)
          primitives[selectedPrimitive - 3].transform.setRotationMatrix(m)
        }
        else if(mouseButton==3)
        {
          //console.log(mouseX, prev_tran[0])
          //console.log(mouseY, prev_tran[1])
          //console.log(selectedPrimitive - 3);
          var diff_tran = [4*(mouseX - prev_tran[0])/(canvas.width) , 4*(-1.0*mouseY + prev_tran[1])/(canvas.height), 0.0]
          primitives[selectedPrimitive - 3].transform.setTranslationVector(diff_tran)
          prev_tran = [mouseX, mouseY, 0.0] 
        }
      }
      e.preventDefault();
    }

    var mouseUp = function(event){
      drag = false
    }

    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mouseup",mouseUp, false);
    canvas.addEventListener("mouseout", mouseUp, false);
    canvas.addEventListener("mousemove", mouseMove, false);

    window.addEventListener('contextmenu', function (e) { 
      // do something here... 
      e.preventDefault(); 
    }, false);

    window.addEventListener("wheel", function(event) {

      if((selectedPrimitive - 3)>=0 && key==0)
      {
        var pace = 0.0

        if(navigator.userAgent.indexOf("Chrome")!=-1)
        {
          pace = 0.001
        }
        else if(navigator.userAgent.indexOf("Firefox")!=-1)
        {
          pace = 0.01
        }
        var dir = Math.sign(event.deltaY);
        //console.log(dir,e.deltaY);
  
        event.preventDefault(); 
        var zoom = (event.deltaY) * pace; 
        //console.log(event.deltaY, pace)
        zoom = dir * Math.min(Math.max(.125, zoom), 0.15);
        primitives[selectedPrimitive - 3].transform.setScaleVector(zoom);
      }      

    }, {passive : false});

    initBuffers(gl, primitives, camera);
}

function initBuffers(gl, primitives, camera){

    var p = Geometry.loadurls(['./obj/cube1.obj', './obj/ico.obj', './obj/sphere.obj'])
    //var p = Geometry.loadurls(['./obj/cube1.obj', './obj/ico.obj'])
    p.then(function(data){
        primitives.forEach((primitive,index) =>{
            //console.log(data[index])
             primitive.setBuffers(data[index])
             //console.log(primitive.buffers)
          });

          function render() {
            drawScene(gl, primitives, camera);
        
            requestAnimationFrame(render);
          }
          requestAnimationFrame(render);
    })
    

}

function drawSelectScene(gl, primitives, camera){
    gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to white, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    camera.setViewMatrix()
    var ViewMatrix = camera.getViewMatrix()

    var shaderProgram = shaderNames[0];
    var programInfo = pInfo(shaderProgram, gl);

    primitives.forEach((primitive,index) => {
      primitive.transform.setModelViewMatrix(ViewMatrix)
     // console.log(shaders[index]);
      primitive.draw(programInfo, camera.getPerspective(), 1, [0, 0, 0], primitives);
    })
}

function drawScene(gl, primitives, camera){
    gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to white, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  
    // Clear the canvas before we start drawing on it.
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    camera.setViewMatrix()
    var ViewMatrix = camera.getViewMatrix()

    primitives.forEach((primitive,index) => {
        primitive.transform.setModelViewMatrix(ViewMatrix)
       // console.log(shaders[index]);
        var shaderProgram = shaderNames[shaders[index]];
        var programInfo = pInfo(shaderProgram, gl);
        primitive.draw(programInfo, camera.getPerspective(), 0, lightSwitches, primitives)
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