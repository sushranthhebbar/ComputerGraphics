export default class Transform{
    constructor(gl)
    {
        this.gl = gl
        this.t_vector = [0.0, 0.0, 0.0]
        this.file_to_orig = [-0.5, -0.5, -0.5]
        this.camera = [0.0, 0.0, -6.0]
        this.orig = [0.0, 0.0, 6.0]
        this.modelRotation = [0.0, 0.0, 0.0]
        this.s_vector = [1.0, 1.0, 1.0]
        this.v = 0.5
        this.s = 0.25
        this.theta = 0.1
        this.modelMatrix = mat4.create();
        this.modelViewMatrix = mat4.create();
    }

    setFileToOrig(x,y,z)
    {
        this.file_to_orig[0]=x
        this.file_to_orig[1]=y
        this.file_to_orig[2]=z
    }

    getModelViewMatrix()
    {
        return this.modelViewMatrix;
    }

    setModelViewMatrix(ViewMatrix)
    {
        this.setModelMatrix();
        //this.setViewMatrix();
        this.modelViewMatrix = mat4.create();
        mat4.multiply(this.modelViewMatrix, ViewMatrix, this.modelMatrix);
    }    
    /*
    setModelViewMatrix1(ViewMatrix, modelMatrix)
    {
        //this.setModelMatrix();
        //this.setViewMatrix();
        mat4.multiply(this.modelViewMatrix, ViewMatrix, modelMatrix);
    }*/

    setModelMatrix()
    {
        this.modelMatrix = mat4.create();
        mat4.translate(this.modelMatrix,this.modelMatrix,this.t_vector);
        mat4.rotateX(this.modelMatrix, this.modelMatrix, this.modelRotation[0]);
        mat4.rotateY(this.modelMatrix, this.modelMatrix, this.modelRotation[1]);
        mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.modelRotation[2]);
        mat4.scale(this.modelMatrix, this.modelMatrix, this.s_vector);
        mat4.translate(this.modelMatrix,this.modelMatrix,this.file_to_orig);
    }

    setModelRotation(idx, sign)
    {
        this.modelRotation[idx] = this.modelRotation[idx]+sign*this.theta;
    }

    setModelScale(idx,sign)
    {
        this.s_vector[idx] = this.s_vector[idx] + sign*this.s
    }

    setModelTranslation(idx,sign)
    {
        this.t_vector[idx] = this.t_vector[idx] + sign*this.v
    }
}