export default class Util{
    constructor(gl)
    {
        this.gl = gl;
        this.red_bits   = gl.getParameter(gl.RED_BITS);
        this.green_bits = gl.getParameter(gl.GREEN_BITS);
        this.blue_bits  = gl.getParameter(gl.BLUE_BITS);
        this.alpha_bits = gl.getParameter(gl.ALPHA_BITS);
        this.total_bits = this.red_bits + this.green_bits + this.blue_bits + this.alpha_bits;
      
        this.red_max   = Math.pow(2,this.red_bits) - 1;
        this.green_max = Math.pow(2,this.green_bits) - 1;
        this.blue_max  = Math.pow(2,this.blue_bits) - 1;
        this.alpha_max = Math.pow(2,this.alpha_bits) - 1;
      
        this.red_shift   = this.green_bits + this.blue_bits + this.alpha_bits;
        this.green_shift = this.blue_bits + this.alpha_bits;
        this.blue_shift  = this.alpha_bits;
    }
    createColor(id)
    {
        var red, green, blue, alpha;

        red   = ((id >> this.red_shift)   & this.red_max)   / this.red_max;
        green = ((id >> this.green_shift) & this.green_max) / this.green_max;
        blue  = ((id >> this.blue_shift)  & this.blue_max)  / this.blue_max;
        alpha = (id                 & this.alpha_max) / this.alpha_max;
      
        return new Float32Array([ red, green, blue, alpha ]);
    }
    getId(red, green, blue, alpha)
    {
        return ( (red   << this.red_shift)
        + (green << this.green_shift)
        + (blue  << this.blue_shift)
        + alpha );
    }
}