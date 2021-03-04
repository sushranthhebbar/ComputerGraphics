import Transform from "./transform.js";

export default class Circle
{
    constructor(gl, centerX, centerY, color)
    {
        //console.log("Inside Rectangle");
        this.gl = gl;
        this.buffer = this.gl.createBuffer();
        this.unit = 0.1;
        var points = [];
        this.centerX = centerX;
        this.centerY = centerY;
        for(let i = 0;i<200;i++)
        {
            points.push(centerX);
            points.push(centerY);
            points.push(0.0);
            points.push( centerX + this.unit*Math.cos(i*2*Math.PI/200));
            points.push( centerY + this.unit*Math.sin(i*2*Math.PI/200));
            points.push(0.0);
            points.push( centerX + this.unit*Math.cos((i+1)*2*Math.PI/200));
            points.push( centerY + this.unit*Math.sin((i+1)*2*Math.PI/200));
            points.push(0.0);
        }
        this.vertexData = new Float32Array(points);
        this.color = color;
        this.transform  = new Transform(centerX, centerY);
        if (!this.buffer)
		{
			throw new Error("Buffer could not be allocated");
		}
    }

    push(val)
    {
        //console.log("Inside")
        let l = this.vertexData.length;
        this.vertexData[l]=val;
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