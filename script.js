/** @format */

var canvas = document.querySelector(".simulator");
var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
if (!gl) {
	alert("Your browser does not support WebGL");
}

// Function to update the canvas size and redraw the circle
function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Calculate the new aspect ratio
	var aspectRatio = canvas.width / canvas.height;

	// Set the viewport to cover the entire canvas, but make sure the aspect ratio is preserved
	if (canvas.width > canvas.height) {
		var newWidth = canvas.height * aspectRatio;
		gl.viewport((canvas.width - newWidth) / 2, 0, newWidth, canvas.height);
	} else {
		var newHeight = canvas.width / aspectRatio;
		gl.viewport(0, (canvas.height - newHeight) / 2, canvas.width, newHeight);
	}

	// Redraw the circle with the updated aspect ratio
	drawCircle(aspectRatio);
}

// Function to draw the circle
function drawCircle(aspectRatio) {
	gl.viewport(0, 0, canvas.width, canvas.height);

	var radius = 0.1 * Math.min(1, aspectRatio);

	// Define the vertices for the circle
	var vertices = [];
	var numSegments = 100;
	var centerX = 0.0;
	var centerY = 0.0;

	for (var i = 0; i <= numSegments; i++) {
		var theta = (i / numSegments) * Math.PI * 2;
		var x = centerX + radius * Math.cos(theta);
		var y = centerY + radius * Math.sin(theta);
		vertices.push(x, y);
	}

	// Create a buffer to store the vertex data
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	// Create a vertex shader
	var vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexShaderSource);
	gl.compileShader(vertexShader);

	// Create a fragment shader
	var fragmentShaderSource = `
        precision mediump float;
        void main() {
            gl_FragColor = vec4(0.75, 0.85, 0.8, 1.0); // Red color
        }
    `;
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentShaderSource);
	gl.compileShader(fragmentShader);

	// Create a shader program
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.useProgram(program);

	// Bind the vertex buffer to the attribute variable
	var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
	gl.enableVertexAttribArray(positionAttributeLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

	// Draw the circle
	gl.drawArrays(gl.TRIANGLE_FAN, 0, numSegments + 1);
}

// Initial setup and drawing
resizeCanvas();

// Listen for window resize events and update the canvas
window.addEventListener("resize", resizeCanvas);
