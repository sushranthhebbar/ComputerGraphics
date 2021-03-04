const vertexSrc = `
    attribute vec4 a_position;
    uniform mat4 uModelTransformMatrix;
    void main()
    {
        gl_Position = uModelTransformMatrix * a_position;
        gl_PointSize = 5.0;
    }
`;

export default vertexSrc;
