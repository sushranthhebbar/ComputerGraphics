import Light from './light.js'
import Transform from './transform.js'
import Util from './util.js'

export default class Cube{
    constructor(gl)
    {
        this.gl = gl
        /*this.faceColors = [[0.25, 0.50, 0.75, 1.0], 
                           [0.25, 0.75, 0.50, 1.0],
                            [0.50, 0.25, 0.75, 1.0],
                            [0.50, 0.75, 0.25, 1.0],
                            [0.75, 0.25, 0.50, 1.0],
                            [0.75, 0.50, 0.25, 1.0]]*/
        this.transform = new Transform(this.gl)
        this.buffers = null
        this.id = 3
        this.util = new Util(this.gl)
        this.selectColors = this.util.createColor(this.id);
        //this.setSize();
        //this.colorId = 0
        //this.faceColorId = 0
        this.materialColor = [0.16, 0.0, 0.16, 1.0];
        this.ambientReflectance = vec3.create();
        this.diffuseReflectance = vec3.create();
        this.specularReflectance = vec3.create();
        this.shine = 32.0;
        vec3.set(this.ambientReflectance,0.8, 0.0, 0.8);
        vec3.set(this.diffuseReflectance,0.8, 0.0, 0.8);
        vec3.set(this.specularReflectance,0.75, 0.75, 0.75);

        this.light = new Light();
        /*this.faces = [1, 1, 1, 1,
                      2, 2, 2, 2,
                      3, 3, 3, 3,
                      4, 4, 4, 4,
                      5, 5, 5, 5,
                      6, 6, 6, 6 ]*/
        //console.log(this.selectColors, this.faceColors)
    }

    setSize()
    {
        this.transform.setModelScale(0, -1)
        this.transform.setModelScale(1, -1)
        this.transform.setModelScale(2, -1)
        this.transform.setModelScale(0, -1)
        this.transform.setModelScale(1, -1)
        this.transform.setModelScale(2, -1)
    }

    setPickedFace(programInfo,val)
    {
        //console.log(val)
        //console.log(programInfo.uniformLocations.pickedface)
        this.gl.uniform1i(programInfo.uniformLocations.pickedface,val);
    }


    updateColorId()
    {
        this.colorId = (this.colorId+1)%(this.faceColors.length)
    }

    updateFaceColorId()
    {
        this.faceColorId = (this.faceColorId+1)%(this.faceColors.length)
    }

    updateColorBuffer(mode=0, id = -1)
    {
        var colors = [];
        if(mode==0)
        {
            const c = [0.8, 0.0, 0.8, 1.0];
            for (var j = 0; j < 6; ++j) {
                //const c = this.faceColors[this.colorId];
                colors = colors.concat(c, c, c, c);
              }
        }
        else
        {
            colors = this.colors
            var i = (id-1)*16;
            var k = 0;
            console.log(i)
            for(; k<4;k++)
            {
                for(var j = 0;j<4;j++, i++)
                {
                   colors[i] = this.faceColors[this.faceColorId][j];
                }
            }
            console.log(i)
        }
        this.colors = colors
        
        const colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.colors), this.gl.STATIC_DRAW);

        return colorBuffer
    }

    updateBuffer(colorBuffer)
    {
        this.buffers.color = colorBuffer
    }

    setBuffers(data)
    {

        //console.log(data)

        var pos = data.positions()
        //var indi = data.indices
        var normals = data.normals()

        const vertexCount = data.vertexCount();

        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(pos), this.gl.STATIC_DRAW);
        
        //console.log(positionBuffer)
        const normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);
        
        //var selectColors = [];
      
        //const colorBuffer = this.updateColorBuffer()
        //console.log(this.selectColors);
        /*for (var j = 0; j < 6; ++j) {
            const sc = this.selectColors;
            // Repeat each color four times for the four vertices of the face
            for(var k = 0; k<4;k++)
            {
                for(var i =0; i<4; i++)
                {
                    selectColors.push(sc[i]);
                }
            }
          }*/


        //const sc = this.selectColors;
        //console.log(selectColors)
        //console.log(colors)
        //console.log(selectColors);
        
        //console.log(selectColors.length)

        //const selectColorBuffer = this.gl.createBuffer();
        //this.gl.bindBuffer(this.gl.ARRAY_BUFFER, selectColorBuffer);
        //this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(selectColors), this.gl.STATIC_DRAW);
        
        //const indexBuffer = this.gl.createBuffer();
        //this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        //this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indi), this.gl.STATIC_DRAW);
      
        //console.log(positionBuffer, colorBuffer, indexBuffer)
        /*
        const faceBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, faceBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(this.faces), this.gl.STATIC_DRAW);*/

        /*this.buffers = {
          position: positionBuffer,
          color: colorBuffer,
          selectColor: selectColorBuffer,
          faces: faceBuffer,
          indices: indexBuffer
        };*/
        /*this.buffers = {
            position: positionBuffer,
            indices: indexBuffer,
            color: colorBuffer,
            selectColor: selectColorBuffer,
            normal: normalBuffer
          };*/
        this.buffers = {
            position: positionBuffer,
            //indices: indexBuffer,
            vertexCount: vertexCount,
            normal: normalBuffer
        }
          //console.log(this.buffers)
        //console.log("HERE")
    }

    getBuffers()
    {
        return this.buffers
    }

    draw(programInfo, projectionMatrix, select, lightSwitches, primitives)
    {
        
        {
            const numComponents = 3;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            //console.log("DRAW")
            //console.log(this.buffers)
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
            //console.log(programInfo)
            this.gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            this.gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexPosition);
          }
        
          {
            const numComponents = 3;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            //console.log("DRAW")
            //console.log(this.buffers)
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.normal);
            //console.log(programInfo)
            this.gl.vertexAttribPointer(
                programInfo.attribLocations.normalPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            this.gl.enableVertexAttribArray(
                programInfo.attribLocations.normalPosition);
          }

          // Tell WebGL how to pull out the colors from the color buffer
          // into the vertexColor attribute.
          /*
          var colorVBO;
          if(select==1)
          {
            colorVBO = this.buffers.selectColor
            //console.log("HERE")
          }
          else
          {
            colorVBO = this.buffers.color
          }
          {
            const numComponents = 4;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorVBO);
            this.gl.vertexAttribPointer(
                programInfo.attribLocations.vertexColor,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            this.gl.enableVertexAttribArray(
                programInfo.attribLocations.vertexColor);
          }*/

          /*
          {
            const numComponents = 1;
            const type = this.gl.UNSIGNED_BYTE;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.faces);
            //console.log(programInfo)
            //console.log(programInfo.attribLocations.vertexPosition)
            this.gl.vertexAttribPointer(
                programInfo.attribLocations.face,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            this.gl.enableVertexAttribArray(
                programInfo.attribLocations.face);
          }*/

        
          // Tell WebGL which indices to use to index the vertices
          //this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
        
          // Tell WebGL to use our program when drawing
        
          this.gl.useProgram(programInfo.program);
        
          // Set the shader uniforms
          //console.log("Inside draw")
         // console.log(programInfo.pickedface)
         /*
          if(face==0)
          {
              this.gl.uniform1i(programInfo.uniformLocations.pickedface,-1);
          }*/

          this.gl.uniformMatrix4fv(
              programInfo.uniformLocations.projectionMatrix,
              false,
              projectionMatrix);

          this.gl.uniformMatrix4fv(
              programInfo.uniformLocations.modelViewMatrix,
              false,
              this.transform.getModelViewMatrix());

          this.gl.uniformMatrix4fv(
          programInfo.uniformLocations.modelMatrixInverseTranspose, 
          false, 
          this.transform.getModeMatrixInverseTranspose());

          this.gl.uniformMatrix4fv(
          programInfo.uniformLocations.modelMatrix,
          false,
          this.transform.getModelMatrix());

          var w = vec3.create();  
          vec3.set(w, 0, 0, 6);

          this.gl.uniform3fv(programInfo.uniformLocations.ViewWorldPosition, w);

          this.gl.uniform1f(programInfo.uniformLocations.Shine, this.shine);
        
          this.gl.uniform3fv(programInfo.uniformLocations.ka, this.ambientReflectance);
          this.gl.uniform3fv(programInfo.uniformLocations.kd, this.diffuseReflectance);
          this.gl.uniform3fv(programInfo.uniformLocations.ks, this.specularReflectance);
        
          var v = vec3.create();
          vec3.set(v, 0.0, 0.0, 0.0);
          //vec3.normalize(v,v);

           primitives.forEach((primitive, index) =>{
                var i = index.toString();

                //console.log(programInfo.shaderProgram)

                this.gl.uniform3fv(this.gl.getUniformLocation(programInfo.program, 'pointlights['+i+'].uLightWorldPosition'), v);

                this.gl.uniformMatrix4fv(
                    this.gl.getUniformLocation(programInfo.program, 'pointlights['+i+'].uLightModelMatrix'), 
                    false, 
                    primitive.transform.getLightModelMatrix());

                this.gl.uniform3fv(this.gl.getUniformLocation(programInfo.program, 'pointlights['+i+'].ambientColor'), primitive.light.ambientColor);
                this.gl.uniform3fv(this.gl.getUniformLocation(programInfo.program, 'pointlights['+i+'].diffuseColor'), primitive.light.diffuseColor);
                this.gl.uniform3fv(this.gl.getUniformLocation(programInfo.program, 'pointlights['+i+'].specularColor'), primitive.light.specularColor);
      
                this.gl.uniform1f(this.gl.getUniformLocation(programInfo.program, 'pointlights['+i+'].a'), primitive.light.a);
                this.gl.uniform1f(this.gl.getUniformLocation(programInfo.program, 'pointlights['+i+'].b'), primitive.light.b);
                this.gl.uniform1f(this.gl.getUniformLocation(programInfo.program, 'pointlights['+i+'].c'), primitive.light.c);    

                this.gl.uniform1i(this.gl.getUniformLocation(programInfo.program, 'pointlights['+i+'].lightON'), lightSwitches[index]);

           })
          
        /*
          this.gl.uniform3fv(programInfo.uniformLocations.ambientColor, this.light.ambientColor);
          this.gl.uniform3fv(programInfo.uniformLocations.diffuseColor, this.light.diffuseColor);
          this.gl.uniform3fv(programInfo.uniformLocations.specularColor, this.light.specularColor);

          this.gl.uniform1f(programInfo.uniformLocations.a, this.light.a);
          this.gl.uniform1f(programInfo.uniformLocations.b, this.light.b);
          this.gl.uniform1f(programInfo.uniformLocations.c, this.light.c);*/

          if(select==1)
          {
              //this.gl.uniform1i(programInfo.uniformLocations.lightON, 0);
              this.gl.uniform4fv(programInfo.uniformLocations.color, this.selectColors);
          }
          else
          {
            this.gl.uniform4fv(programInfo.uniformLocations.color, this.materialColor);
          }
          /*
          if(light==1)
          {
            this.gl.uniform1i(programInfo.uniformLocations.lightON, 1);
          }
          else if(light==0)
          {
            this.gl.uniform1i(programInfo.uniformLocations.lightON, 0);
            this.gl.uniform4fv(programInfo.uniformLocations.color, this.materialColor);
          }*/

          /*{
            const vertexCount = 36;
            const type = this.gl.UNSIGNED_SHORT;
            const offset = 0;
            this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
          }*/
          this.gl.drawArrays(this.gl.TRIANGLES, 0, this.buffers.vertexCount);
    }
}