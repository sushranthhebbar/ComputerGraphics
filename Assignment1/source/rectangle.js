import Transform from "./transform.js";

export default class Rectangle
{
    constructor(gl, centerX, centerY, color)
    {
        //console.log("Inside Rectangle");
        this.gl = gl;
        this.buffer = this.gl.createBuffer();
        this.unit = 0.1;
        this.width = this.unit;
        this.height = 2*this.width;
        this.centerX = centerX;
        this.centerY = centerY;
        this.vertexData = new Float32Array([
            centerX+this.width, centerY+this.height, 0.0,
            centerX+this.width, centerY-this.height, 0.0,
            centerX-this.width, centerY-this.height, 0.0,
            centerX+this.width, centerY+this.height, 0.0,
            centerX-this.width, centerY+this.height, 0.0,		
            centerX-this.width, centerY-this.height, 0.0,
        ]);
        this.color = color;
        this.transform = new Transform(this.centerX, this.centerY);
        if (!this.buffer)
		{
			throw new Error("Buffer could not be allocated");
		}
    }

    draw(shader)
    {
        const uModelTransformMatrix = shader.uniform("uModelTransformMatrix");
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexData, this.gl.DYNAMIC_DRAW);

        const aPositionLocation = shader.attribute("a_position");

        let point = 3;
        let numitems = this.vertexData.length/point;

        this.gl.enableVertexAttribArray(aPositionLocation);
        this.gl.vertexAttribPointer(aPositionLocation, point, this.gl.FLOAT, false, 0, 0);
        //this.gl.drawArrays(this.gl.POINTS, 0, 3);

        const uPrimitiveColor = shader.uniform("uPrimitiveColor");		
		shader.setUniform3f(uPrimitiveColor, this.color);

        shader.setUniformMatrix4fv(uModelTransformMatrix, this.transform.getMVPMatrix());

        this.gl.drawArrays(this.gl.TRIANGLES, 0, numitems);
        //console.log("INSIDE DRAW");
    }
}