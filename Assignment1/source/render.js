export default class Render
{
    constructor()
    {
        this.canvas = document.createElement("canvas");
        //this.canvas.width = 500;
        //this.canvas.height = 500;
        document.querySelector("body").appendChild(this.canvas);
        const gl  = this.canvas.getContext("webgl");
        if(!gl)
        {
            throw new Error("WebGL is not supported");
        }
        //gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl = gl;
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    webGlContext()
	{
		return this.gl;
	}

    getCanvas()
    {
        return this.canvas;
    }

    mouseToClipCoord(mouseX,mouseY) {

		// convert the position from pixels to 0.0 to 1.0
		mouseX = mouseX / this.canvas.width;
		mouseY = mouseY / this.canvas.height;

		// convert from 0->1 to 0->2
		mouseX = mouseX * 2;
		mouseY = mouseY * 2;

		// convert from 0->1 to 0->2
		mouseX = mouseX - 1;
		mouseY = mouseY - 1;

		// flip the axis	
		mouseY = -mouseY; // Coordinates in clip space

		return [mouseX, mouseY]
	}

    resizeCanvas()
    {
        //console.log(this.canvas.width);
        this.canvas.width = Math.min(window.innerWidth, window.innerHeight);
        this.canvas.height = this.canvas.width;
        //console.log(this.canvas.width);
        //console.log(this.gl.canvas.width);
        //console.log(this.canvas.height);
        //console.log(this.gl.canvas.height);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    clear()
    {
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
}