export default class Camera{
    constructor(gl)
    {
        this.gl = gl;
        this.cameraRotation = [0.0, 0.0, 0.0]
        this.fieldOfView = 45 * Math.PI / 180;   // in radians
        this.aspect = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
        this.zNear = 0.1;
        this.zFar = 100.0;
        this.ViewMatrix = mat4.create()
        this.projectionMatrix = mat4.create();
        this.setPerspective();
    }

    setPerspective()
    {
        mat4.perspective(this.projectionMatrix,this.fieldOfView,this.aspect,this.zNear,this.zFar);
    }

    getPerspective()
    {
        return this.projectionMatrix;
    }

    getViewMatrix()
    {
        return this.ViewMatrix;
    }

    setViewMatrix()
    {
        this.ViewMatrix = mat4.create()   
        mat4.rotate(this.ViewMatrix, this.ViewMatrix, this.cameraRotation[0], [1, 0, 0])
        mat4.rotate(this.ViewMatrix, this.ViewMatrix, this.cameraRotation[1], [0, 1, 0])
        mat4.rotate(this.ViewMatrix, this.ViewMatrix, this.cameraRotation[2], [0, 0, 1])
        mat4.translate(this.ViewMatrix, this.ViewMatrix, [0.0, 0.0, 6.0])
        mat4.invert(this.ViewMatrix, this.ViewMatrix)
    }

    setCameraRotation(idx, val)
    {
        this.cameraRotation[idx]-=val;
    }
}