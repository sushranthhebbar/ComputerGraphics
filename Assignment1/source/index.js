//console.log("START");
//window.open('http://127.0.0.1:5500/demo/');
//window.close();

import { vec3, mat4 } from 'https://cdn.skypack.dev/gl-matrix';
import Shader from './shader.js';

import vertexSrc from './vertex.js';
import fragmentSrc from './fragment.js';

import Render from './render.js';
//import Mesh from './mesh.js'
import Square from './square.js'
import Rectangle from './rectangle.js'
import Circle from './circle.js';

//console.log("After Import");

var control_key = -1;
var shapeKey;
var selectedPrimitive = -1;

const renderer = new Render();
const gl = renderer.webGlContext();


const shader = new Shader(gl, vertexSrc, fragmentSrc);
shader.use();
//const mesh = new Mesh(gl);

var primitives = [];


var m = 0.1;
var s = 0.1;
var r = 0.1;
//var r = vec3.fromValues(.5,0,0);
//var d = vec3.fromValues(.5,0,0);

//console.log("After initialization");

//Draw loop

window.addEventListener("keyup", (event) =>
{
	if(event.code=="KeyM")
	{
		//console.log(event.code);
		control_key = control_key +1;
		control_key = control_key % 3;
		console.log(control_key);
	}
	if(control_key == 0)
	{
		shapeKey = event.code;

		primitives.forEach((primitive, index) => {
			primitive.transform.setRotate(0.0);
			primitive.transform.updateMVPMatrix();
		});

		console.log(shapeKey);
	}
	else if(control_key == 1)
	{
		//console.log(event.code);
		if(selectedPrimitive>=0)
		{
			if(event.code=="KeyX")
			{
				primitives.splice(selectedPrimitive,1);
				selectedPrimitive = -1;
			}
			//console.log(selectedPrimitive);
			//console.log(primitive.centerX);
			//console.log(primitive.centerY);
			else
			{
				var primitive = primitives[selectedPrimitive];
				var translate = primitive.transform.getTranslate();
				var scale = primitive.transform.getScale();
				if(event.code=="ArrowRight")
				{
					translate[0]+=m;
					primitive.transform.setTranslate(translate);
					//console.log(primitive.transform.getMVPMatrix());
					//console.log(primitive.centerX);
					//console.log(primitive.centerY);
				}
				else if(event.code=="ArrowUp")
				{
					translate[1]+=m;
					primitive.transform.setTranslate(translate);
				}
				else if(event.code=="ArrowDown")
				{
					translate[1]-=m;
					primitive.transform.setTranslate(translate);
				}
				else if(event.code=="ArrowLeft")
				{
					translate[0]-=m;
					primitive.transform.setTranslate(translate);
				}
				else if(event.code=="NumpadAdd")
				{
					scale[0]+=s;
					scale[1]+=s;
					primitive.transform.setScale(scale);
				}
				else if(event.code=="NumpadSubtract")
				{
					scale[0]-=s;
					scale[1]-=s;
					primitive.transform.setScale(scale);
				}
				primitive.transform.updateMVPMatrix();
			}
		}
	}
	else if(control_key==2)
	{
		if(event.code=="Escape")
		{
				//document.getElementById("canvas").style.visibility="hidden";
				//window.close();
				//document.close();
				//renderer.getCanvas.getElementById("canvas").style.visibility="hidden";
				//window.opener = self;
				window.close(); 
		}
		var xmin=1e9, xmax=-1e9, ymin=1e9, ymax=-1e9;
		primitives.forEach((primitive,index) => {

			var x = primitive.transform.translate[0]+primitive.centerX;
			var y = primitive.transform.translate[1]+primitive.centerY;
			var width, height;
			width = ((primitive.unit)*primitive.transform.scale[0]);
			height = width;
			if(primitive instanceof Rectangle)
			{
				//console.log("Rectangle");
				height += width;
			}
			xmax = Math.max(xmax, x+width);
			xmin = Math.min(xmin, x-width);
			ymax = Math.max(ymax, y+height);
			ymin = Math.min(ymax, y-height);
		});
		var rect_x = (xmax+xmin)/2.0;
		var rect_y = (ymax+ymin)/2.0;

		//console.log(rect_x);
		//console.log(rect_y);

		primitives.forEach((primitive,index) => {
			var primitive = primitives[index];
			var angle = primitive.transform.getRotateAngle();
			var x = primitive.transform.translate[0]+primitive.centerX;
			var y = primitive.transform.translate[1]+primitive.centerY;
			//console.log(angle);
			if(event.code=="ArrowLeft")
			{
				angle+=r;
			}
			else if(event.code=="ArrowRight")
			{
				angle-=r;
			}
			//console.log(angle);
			primitive.transform.setRotate(angle);
			primitive.transform.updateAroundPoint(rect_x, rect_y, x - rect_x, y - rect_y);
		});
	}
});


renderer.getCanvas().addEventListener('click', (event) =>
{
	let mouse_coord = renderer.mouseToClipCoord(event.clientX,event.clientY);
	if(control_key==0)
	{
		if(shapeKey=="KeyS")
		{
			const square = new Square(gl,mouse_coord[0],mouse_coord[1], vec3.fromValues(1.0, 0.0, 1.0));
			primitives.push(square);
		}
		else if(shapeKey=="KeyR")
		{
			//console.log("HERE in rectangle");
			const rectangle = new Rectangle(gl,mouse_coord[0],mouse_coord[1], vec3.fromValues(1.0, 0.0, 0.0));
			primitives.push(rectangle);
		}
		else if(shapeKey=="KeyC")
		{
			const circle = new Circle(gl, mouse_coord[0], mouse_coord[1], vec3.fromValues(0.0, 0.0, 1.0));
			primitives.push(circle);
		}
	}
	else if(control_key==1)
	{
		var distanceToCentroid = 1e9;
		primitives.forEach((primitive,index) =>
		{
			var x = primitive.transform.translate[0]+primitive.centerX;
			var y = primitive.transform.translate[1]+primitive.centerY;
			var x1 = mouse_coord[0];
			var y1 = mouse_coord[1];

			var temp = ((x-x1)*(x-x1) + (y-y1)*(y-y1));
			if(temp<distanceToCentroid)
			{
				distanceToCentroid = temp;
				selectedPrimitive = index;
			}
		});
		//console.log(selectedPrimitive);
		//var primitive = primitives[selectedPrimitive];
		//console.log(primitive.centerX);
		//console.log(primitive.centerY);

	}
});

function animate()
{
	renderer.clear();
	//square.draw(shader);
	primitives.forEach((primitive, index) =>
	{
		primitive.draw(shader);
		//console.log("Inside square");
	});
	window.requestAnimationFrame(animate);
}

animate();
shader.delete();
//rectangleShader.delete();