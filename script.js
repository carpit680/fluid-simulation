var init_sim = function(){
    console.log("Simulation starting");
    var canvas = document.querySelector(".simulator");
    var ctx = canvas.getContext("webgl");
    if (!ctx) {
        ctx = canvas.getContext("experimental-webgl");
    }
    if (!ctx) {
        alert("Your browser does not support WebGL");
    }

    canvas.clientWidth = window.innerWidth;
    canvas.clientHeight = window.innerHeight;

    ctx.canvas.width = canvas.clientWidth;
    ctx.canvas.height = canvas.clientHeight;

    var gl = ctx;

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
}