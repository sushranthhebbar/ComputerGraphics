export default class Light{
    constructor(gl)
    {
        this.gl = gl;
        this.ambientColor = vec3.create();
        this.diffuseColor = vec3.create();
        this.specularColor = vec3.create();
        this.a = 1;
        this.b = 1;
        this.c = 1;
        vec3.set(this.ambientColor, 0.2, 0.2, 0.2);
        vec3.set(this.diffuseColor, 0.85, 0.85, 0.85);
        vec3.set(this.specularColor, 1.0, 1.0, 1.0);
    }
}