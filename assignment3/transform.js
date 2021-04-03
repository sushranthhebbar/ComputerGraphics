export default class Transform{
    constructor(gl)
    {
        this.gl = gl
        this.t_vector = [0.0, 0.0, 0.0]
        //this.file_to_orig = [-0.5, -0.5, -0.5]
        this.file_to_orig = [0.0, 0.0, 0.0]
        //this.camera = [0.0, 0.0, -6.0]
        //this.orig = [0.0, 0.0, 6.0]
        this.modelRotation = [0.0, 0.0, 0.0]
        this.s_vector = [1.0, 1.0, 1.0]
        this.l_vector = [0.625, 0.625, 0.625]
        this.v = 0.5
        this.s = 0.25
        this.l = 0.1
        this.theta = 0.1
        this.rotationMatrix = mat4.create();
        this.modelMatrix = mat4.create();
        this.modelViewMatrix = mat4.create();
        this.modelMatrixInverseTranspose = mat4.create();
        this.lightModelMatrix = mat4.create();
    }

    setFileToOrig(x,y,z)
    {
        this.file_to_orig[0]=x
        this.file_to_orig[1]=y
        this.file_to_orig[2]=z
    }

    setModelMatrixInverseTranspose()
    {
        this.modelMatrixInverseTranspose = mat4.clone(this.modelMatrix);
        mat4.invert(this.modelMatrixInverseTranspose, this.modelMatrixInverseTranspose);
        mat4.transpose(this.modelMatrixInverseTranspose, this.modelMatrixInverseTranspose);
    }

    getModeMatrixInverseTranspose()
    {

        return this.modelMatrixInverseTranspose;
    }

    getModelMatrix()
    {
        return this.modelMatrix;
    }

    getModelViewMatrix()
    {
        return this.modelViewMatrix;
    }

    setModelViewMatrix(ViewMatrix)
    {
        this.setModelMatrix();
        this.setModelMatrixInverseTranspose();
        this.setLightModelMatrix();
        //this.setViewMatrix();
        this.modelViewMatrix = mat4.create();
        mat4.multiply(this.modelViewMatrix, ViewMatrix, this.modelMatrix);
        //mat4.multiply(this.modelViewMatrix, this.modelViewMatrix, this.modelMatrix);
    }    
    /*
    setModelViewMatrix1(ViewMatrix, modelMatrix)
    {
        //this.setModelMatrix();
        //this.setViewMatrix();
        mat4.multiply(this.modelViewMatrix, ViewMatrix, modelMatrix);
    }*/

    setRotationMatrix(rotationMatrix)
    {
        this.rotationMatrix = rotationMatrix;
    }    

    setModelMatrix()
    {
        this.modelMatrix = mat4.create();
        mat4.translate(this.modelMatrix,this.modelMatrix,this.t_vector);
        //mat4.rotateX(this.modelMatrix, this.modelMatrix, this.modelRotation[0]);
        //mat4.rotateY(this.modelMatrix, this.modelMatrix, this.modelRotation[1]);
        //mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.modelRotation[2]);
        mat4.multiply(this.modelMatrix, this.modelMatrix, this.rotationMatrix)
        mat4.scale(this.modelMatrix, this.modelMatrix, this.s_vector);
        mat4.translate(this.modelMatrix,this.modelMatrix,this.file_to_orig);
    }

    getLightModelMatrix()
    {
        return this.lightModelMatrix;
    }

    setLightModelMatrix()
    {
        this.lightModelMatrix = mat4.create();
        mat4.translate(this.lightModelMatrix,this.lightModelMatrix,this.l_vector);
        mat4.translate(this.lightModelMatrix,this.lightModelMatrix,this.t_vector);
        //mat4.scale(this.lightModelMatrix, this.lightModelMatrix, this.s_vector);
    }

    setTranslationVector(t)
    {
        this.t_vector[0] += t[0];
        this.t_vector[1] += t[1];
        this.t_vector[2] += t[2];
    }

    setLightVector(idx, sign)
    {
        this.l_vector[idx] += sign * this.l;
        if(this.l_vector[idx]<(-0.625))
        {
            this.l_vector[idx] = -0.625;
        }
        if(this.l_vector[idx]>(0.625))
        {
            this.l_vector[idx] = 0.625;
        }
        console.log(this.l_vector);
    }

    setScaleVector(s)
    {
        this.s_vector[0]+=s;
        this.s_vector[1]+=s;
        this.s_vector[2]+=s;
        for(let i=0;i<3;i++)
        {
            if(this.s_vector[i]<(0))
            {
                this.s_vector[i] = 0.1;
            }
            if(this.s_vector[i]>(1.25))
            {
                this.s_vector[i] = 1.25;
            }
        }
        //console.log(this.s_vector, this.l_vector);
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