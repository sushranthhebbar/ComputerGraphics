import Transform from './transform.js'
import Util from './util.js'

export default class Axis{
    constructor(gl, axis)
    {
        this.gl = gl
        if(axis==0)
        {
            this.faceColors = [[1.0, 0.0, 0.0, 1.0]]
        }
        else if(axis==1)
        {
            this.faceColors = [[0.0, 1.0, 0.0, 1.0]]
        }
        else if(axis==2)
        {
            this.faceColors = [[0.0, 0.0, 1.0, 1.0]]
        }
        this.transform = new Transform(this.gl)
        //this.transform.t_vector = [1.5, 0, 0]
        this.transform.s_vector = [0.2, 0.2, 0.2]
        //this.transform.modelRotation = [0.0, 0.0 ,-1.5705]
        this.buffers = null
        this.id = 3
        this.util = new Util(this.gl)
        this.selectColors = this.util.createColor(this.id)
        this.colorId = 0
        this.faceColorId = 0
        this.colors = null
        this.faces = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                      
        //console.log(this.selectColors, this.faceColors)
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
            for (var j = 0; j < 7; ++j) {
                const c = this.faceColors[this.colorId];
                colors = colors.concat(c, c);
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
        //console.log(this.colors)
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
        var pos = data.position
        var indi = data.indices
        
        //console.log(pos.length)

        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(pos), this.gl.STATIC_DRAW);
        
        
        var selectColors = [];
      
        const colorBuffer = this.updateColorBuffer()

        for (var j = 0; j < 7; ++j) {
            const sc = this.selectColors;
            // Repeat each color four times for the four vertices of the face
            for(var k = 0; k<2;k++)
            {
                for(var i =0; i<4; i++)
                {
                    selectColors.push(sc[i]);
                }
            }
          }


        //const sc = this.selectColors;
        //console.log(selectColors)
        //console.log(colors)
        //console.log(selectColors);
        
        //console.log(selectColors.length)

        const selectColorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, selectColorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(selectColors), this.gl.STATIC_DRAW);
    
        const indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indi), this.gl.STATIC_DRAW);
      
        //console.log(positionBuffer, colorBuffer, indexBuffer)
        
        const faceBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, faceBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(this.faces), this.gl.STATIC_DRAW);

        this.buffers = {
          position: positionBuffer,
          color: colorBuffer,
          selectColor: selectColorBuffer,
          faces: faceBuffer,
          indices: indexBuffer
        };
        //console.log("HERE")
    }

    getBuffers()
    {
        return this.buffers
    }

    draw(programInfo, projectionMatrix, select, face=0)
    {
        //console.log("HERE")
        {
            const numComponents = 3;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
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
        
          // Tell WebGL how to pull out the colors from the color buffer
          // into the vertexColor attribute.
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
          }


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
          }

        
          // Tell WebGL which indices to use to index the vertices
          this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
        
          // Tell WebGL to use our program when drawing
        
          this.gl.useProgram(programInfo.program);
        
          // Set the shader uniforms
          //console.log("Inside draw")
         // console.log(programInfo.pickedface)
          if(face==0)
          {
              this.gl.uniform1i(programInfo.uniformLocations.pickedface,-1);
          }

          this.gl.uniformMatrix4fv(
              programInfo.uniformLocations.projectionMatrix,
              false,
              projectionMatrix);
          this.gl.uniformMatrix4fv(
              programInfo.uniformLocations.modelViewMatrix,
              false,
              this.transform.getModelViewMatrix());
        
          {
            const vertexCount = 54;
            const type = this.gl.UNSIGNED_SHORT;
            const offset = 0;
            this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
          }
    }
}