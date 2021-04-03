function Geometry (faces) {
    this.faces = faces || []
  }
  
  // Parses an OBJ file, passed as a string
  /*Geometry.parseOBJ = function (src) {
    var POSITION = /^v\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/
    var NORMAL = /^vn\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/
    var FACE = /^f\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)(?:\s+(-?\d+)\/\/(-?\d+))?/
    var FACE1 = /^f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/
    var FACE2 = /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/

    lines = src.split('\n')
    var indices = []
    var positions = []
    var positions1 = []
    var uvs = []
    var normals = []
    var faces = []
    lines.forEach(function (line) {
      // Match each line of the file against various RegEx-es
      var result
      if ((result = POSITION.exec(line)) != null) {
        // Add new vertex position
        //  console.log(result)
        positions.push(new Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])))
        positions1.push(parseFloat(result[1]))
        positions1.push(parseFloat(result[2]))
        positions1.push(parseFloat(result[3]))
        //console.log(positions)
      } else if ((result = NORMAL.exec(line)) != null) {
        // Add new vertex normal
        //console.log(result)
        //normals.push(new Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])))
        normals.push(parseFloat(result[1]))
        normals.push(parseFloat(result[2]))
        normals.push(parseFloat(result[3]))
        //console.log(normals)
      } 
      else if ((result = FACE.exec(line)) != null) {
        // Add new face
        //console.log("HERE")
        var vertices = []
        // Create three vertices from the passed one-indexed indices
        //console.log(result)
        //console.log(result.slice(1, 4))
        for (var i = 1; i < 7; i += 2) {
          var part = result.slice(i, i + 2)
          //console.log(part)
          var position = positions[parseInt(part[0]) - 1]
          var normal = normals[parseInt(part[1]) - 1]
          //console.log(position)
          indices.push(parseInt(part[0]) - 1)
          //console.log(normal)
          vertices.push(new Vertex(position, normal))
        }
        //console.log(vertices)
        faces.push(new Face(vertices))
        //console.log(faces)
      }
      else if((result = FACE1.exec(line)) != null)
      {
          indices.push(parseInt(result[1])-1)
          indices.push(parseInt(result[2])-1)
          indices.push(parseInt(result[3])-1)
      }
      else if((result = FACE2.exec(line)) != null)
      {
          indices.push(parseInt(result[1])-1)
          indices.push(parseInt(result[4])-1)
          indices.push(parseInt(result[7])-1)
      }
    })
    //console.log("In geometry")
    //console.log(faces)
    //return new Geometry(faces)
    //console.log(positions1)
    //console.log(indices)
    return {
        position: positions1,
        normals : normals,
        indices: indices,
      };
  }*/
  
  Geometry.parseOBJ = function (src) {
    var POSITION = /^v\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/
    var NORMAL = /^vn\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/
    var UV = /^vt\s+([\d\.\+\-eE]+)\s+([\d\.\+\-eE]+)/
    var FACE = /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/
  
    lines = src.split('\n')
    var positions = []
    var uvs = []
    var normals = []
    var faces = []
    lines.forEach(function (line) {
      // Match each line of the file against various RegEx-es
      var result
      if ((result = POSITION.exec(line)) != null) {
        // Add new vertex position
        positions.push(new Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])))
      } else if ((result = NORMAL.exec(line)) != null) {
        // Add new vertex normal
        normals.push(new Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])))
      } else if ((result = UV.exec(line)) != null) {
        // Add new texture mapping point
        uvs.push(new Vector2(parseFloat(result[1]), 1 - parseFloat(result[2])))
      } else if ((result = FACE.exec(line)) != null) {
        // Add new face
        var vertices = []
        // Create three vertices from the passed one-indexed indices
        for (var i = 1; i < 10; i += 3) {
          var part = result.slice(i, i + 3)
          var position = positions[parseInt(part[0]) - 1]
          var uv = uvs[parseInt(part[1]) - 1]
          var normal = normals[parseInt(part[2]) - 1]
          vertices.push(new Vertex(position, normal, uv))
        }
        faces.push(new Face(vertices))
      }
    })
    
    return new Geometry(faces)
  }



  Geometry.loadurls = function (urls){
    var objs = []
    
    urls.forEach((url, index) => {
        objs.push(Geometry.loadOBJ(url))
    })
    var p = Promise.all(objs)
    return p
    //return objs
  }
  // Loads an OBJ file from the given URL, and returns it as a promise
  Geometry.loadOBJ = function (url) {
    return new Promise(function (resolve) {
      var xhr = new XMLHttpRequest()
      xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
          resolve(Geometry.parseOBJ(xhr.responseText))
        }
      }
      xhr.open('GET', url, true)
      xhr.send(null)
    })
  }
  
  function Face (vertices) {
    this.vertices = vertices || []
  }
  
  function Vertex (position, normal) {
    this.position = position || new Vector3()
    this.normal = normal || new Vector3()
  }
  
  function Vector3 (x, y, z) {
    this.x = Number(x) || 0
    this.y = Number(y) || 0
    this.z = Number(z) || 0
  }
  
  function Vector2 (x, y) {
    this.x = Number(x) || 0
    this.y = Number(y) || 0
  }
  
  Geometry.prototype.vertexCount = function () {
    return this.faces.length * 3
  }
  
  Geometry.prototype.positions = function () {
    var answer = []
    this.faces.forEach(function (face) {
      face.vertices.forEach(function (vertex) {
        var v = vertex.position
        answer.push(v.x, v.y, v.z)
      })
    })
    return answer
  }
  
  Geometry.prototype.normals = function () {
    var answer = []
    this.faces.forEach(function (face) {
      face.vertices.forEach(function (vertex) {
        var v = vertex.normal
        answer.push(v.x, v.y, v.z)
      })
    })
    return answer
  }
  
  Geometry.prototype.uvs = function () {
    var answer = []
    this.faces.forEach(function (face) {
      face.vertices.forEach(function (vertex) {
        var v = vertex.uv
        answer.push(v.x, v.y)
      })
    })
    return answer
  }
  


