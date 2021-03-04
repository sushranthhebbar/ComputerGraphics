import { vec3, mat4 } from 'https://cdn.skypack.dev/gl-matrix';

export default class Transform
{
	constructor(centerX, centerY)
	{
		this.translate = vec3.fromValues( 0, 0, 0);
		this.centerX = centerX;
		this.centerY = centerY;
		this.origin = vec3.fromValues(-centerX, -centerY, 0);
		this.invOrigin = vec3.fromValues(centerX, centerY, 0);;
		//console.log(this.origin);
		this.scale = vec3.fromValues( 1, 1, 1);
		this.rotationAngle = 0;
		this.rotationAxis = vec3.fromValues( 0, 0, 1);

		this.modelTransformMatrix = mat4.create();
		mat4.identity(this.modelTransformMatrix);

		this.mvpMatrix = this.modelTransformMatrix;

		this.updateMVPMatrix();
	}

	getMVPMatrix()
	{
		return this.modelTransformMatrix;
	}

	updateMVPMatrix()
	{
		//console.log((-1)*this.origin);
		mat4.identity(this.modelTransformMatrix);
		mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix, this.translate);
		//mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, this.rotationAngle, this.rotationAxis);
		mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix, this.invOrigin);
		mat4.scale(this.modelTransformMatrix, this.modelTransformMatrix, this.scale);
		mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix, this.origin);
		//console.log(this.translate);
	}

	updateAroundPoint(xPoint, yPoint, xdPoint, ydPoint)
	{
		var diff = vec3.fromValues(xdPoint,ydPoint,0.0);
		//console.log(diff);
		var centroid = vec3.fromValues(xPoint, yPoint, 0.0);
		mat4.identity(this.modelTransformMatrix);
		mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix, centroid);
		mat4.rotate(this.modelTransformMatrix, this.modelTransformMatrix, this.rotationAngle, this.rotationAxis);	
		mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix, diff);
		mat4.scale(this.modelTransformMatrix, this.modelTransformMatrix, this.scale);
		mat4.translate(this.modelTransformMatrix, this.modelTransformMatrix, this.origin);
	}

	setTranslate(translationVec)
	{
		this.translate = translationVec;
	}

	getTranslate()
	{
		return this.translate;
	}

	setScale(scalingVec)
	{
		this.scale = scalingVec;
	}

	getScale()
	{
		return this.scale;
	}

	setRotate(rotationAngle)
	{
		this.rotationAngle = rotationAngle;
		//this.rotationAxis = rotationAxis;
	}

	getRotateAngle()
	{
		return this.rotationAngle;
	}
}