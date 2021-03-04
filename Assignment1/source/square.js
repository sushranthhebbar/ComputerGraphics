import Transform from "./transform.js";

export default class Square
{
    constructor(gl, centerX, centerY, color)
    {
        this.gl = gl;
        this.buffer = this.gl.createBuffer();
        this.centerX = centerX;
        this.centerY = centerY;
        this.unit = 0.1;
        this.vertexData = new Float32Array([
            centerX+this.unit, centerY+this.unit, 0.0,
            centerX+this.unit, centerY-this.unit, 0.0,
            centerX-this.unit, centerY-this.unit, 0.0,
            centerX+this.unit, centerY+this.unit, 0.0,
            centerX-this.unit, centerY-this.unit, 0.0,		
            centerX-this.unit, centerY+this.unit, 0.0,
        ]);
        this.color = color;
        if (!this.buffer)
		{
			throw new Error("Buffer could not be allocated");
        }
        this.transform = new Transform(centerX, centerY);
    }

    draw(shader)
    {
        const uModelTransformMatrix = shader.uniform("uModelTransformMatrix");
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexData, this.gl.DYNAMIC_DRAW);
        
        //console.log("INSIDE DRAW");
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
    }
}