export default class Shader
{
    constructor(gl, vertexsrc, fragmentsrc )
    {
        this.gl = gl;
        this.vertexsrc = vertexsrc;
        this.fragmentsrc = fragmentsrc;
        //console.log(gl.VERTEX_SHADER);
        //console.log(gl.FRAGMENT_SHADER);
        this.program = this.link(this.compile(gl.VERTEX_SHADER, this.vertexsrc), this.compile(gl.FRAGMENT_SHADER, this.fragmentsrc)); 
    }

    compile(type, shadersrc)
    {
        //console.log(type);
        let shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, shadersrc);
        this.gl.compileShader(shader);
        let success = this.gl.getShaderParameter(shader,this.gl.COMPILE_STATUS);
        if(success)
        {
            //console.log("COMPILATION SUCCESSFUL");
            return shader;
        }
        console.log(this.gl.getShaderInfoLog(shader));
        this.gl.deleteShader(shader);
    }

    link(vertexShader, fragmentShader)
    {
        let program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        let success = this.gl.getProgramParameter(program,this.gl.LINK_STATUS);
        if(success)
        {
            //console.log("LINKING SUCCESSFUL");
            return program;
        }
        console.log(this.gl.getProgramInfoLog(program));
        this.gl.deleteProgram(program);
    }

    attribute(attributeName)
	{
        //console.log(attributeName);
		return this.gl.getAttribLocation(this.program, attributeName);
	}

    uniform(uniformName)
	{
		return this.gl.getUniformLocation(this.program, uniformName);
	}

	setUniform3f(uniformLocation, vec3)
	{
		this.gl.uniform3f(uniformLocation, ...vec3);
	}

    setUniformMatrix4fv(uniformLocation, mat4)
	{
        //console.log("Inside shader");
        this.gl.uniformMatrix4fv(uniformLocation, false, mat4);
        //console.log(mat4);
	}

    use()
	{
		this.gl.useProgram(this.program);
	}

	delete()
	{
		this.gl.deleteProgram(this.program);
	}

}