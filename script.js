/** @format */

// Reset animation on reset button click
document.getElementById("reset").addEventListener("click", () => {
	window.location.reload();
});

// Pause animation on pause button click
var isPaused = false;

// Function to toggle the animation state
function toggleAnimationState() {
    isPaused = !isPaused;
    if (!isPaused) {
        // Resume the animation
		requestAnimationFrame(drawCircle);
		document.getElementById("pause").innerHTML = "Pause";
	}
	else
		document.getElementById("pause").innerHTML = "Resume";
}

var canvas = document.querySelector(".simulator");
var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
if (!gl) {
	alert("Your browser does not support WebGL");
}

// Declare variables for position, velocity, and other settings
var particle = {
	x: 0,
	y: 0,
	vel_x: 0.06,
	vel_y: 0.03,
};
var grid_size = 5; // Square root of total number of particles
var numSegments = 50; // The number of segments (Particle mesh quality)
var gravity = -0.004; // The gravitational force 
var surface_adhesion = 0.025; // Times the velocity of the particle when it is in contact with the surface(Ideally 0 IG)
var canvas_limit = 1; // The limit of the canvas width and height +/- this value

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
	if (isPaused) {
		// If animation is paused, do not continue the animation loop
		return;
	}
	gl.viewport(0, 0, canvas.width, canvas.height);
	var canvasHeight = canvas.height;
	var radius = 0.1 * Math.min(1, aspectRatio) / grid_size;

	// Define the vertices for the circle
	var vertices = [];
	var centerX = 0.0;
	var centerY = 0.0;
	// Update the velocity by applying gravity
	particle.vel_y += gravity;

	// Check if the circle is going out of bounds and adjust its velocity
	if (particle.y >= canvas_limit - radius) {
		particle.y = canvas_limit - radius;
		particle.vel_y = 0;
		particle.vel_x = particle.vel_x * surface_adhesion;
	}
	else if (particle.y <= -canvas_limit + radius) {
		particle.y = -canvas_limit + radius;
		particle.vel_y = 0;
		particle.vel_x = particle.vel_x * surface_adhesion;
	}
	if (particle.x >= canvas_limit - radius) {
		particle.x = canvas_limit - radius;
		particle.vel_x = 0;
		particle.vel_y = particle.vel_y * surface_adhesion;
	}
	else if (particle.x <= -canvas_limit + radius) {
		particle.x = -canvas_limit + radius;
		particle.vel_x = 0;
		particle.vel_y = particle.vel_y * surface_adhesion;
	}

	// Update the Y coordinate to create a downward movement
	particle.y += particle.vel_y;
	particle.x += particle.vel_x;

	// Get the canvas dimensions
	var canvasWidth = canvas.width;
	var canvasHeight = canvas.height;


	gl.viewport(0, 0, canvasWidth, canvasHeight);

	// Set the circle's position in the vertex data
	vertices = [];
	for (var i = 0; i <= numSegments; i++) {
		var theta = (i / numSegments) * Math.PI * 2;
		var x = centerX + radius * Math.cos(theta) + particle.x;
		var y = centerY + radius * Math.sin(theta) + particle.y;
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

	requestAnimationFrame(drawCircle);
}

// Initial setup and drawing
resizeCanvas();

// Start the animation loop
requestAnimationFrame(drawCircle);

// Listen for window resize events and update the canvas
window.addEventListener("resize", resizeCanvas);

// Get a reference to the "pause" button element in your HTML
var pauseButton = document.querySelector("#pause");

// Add a click event listener to the "pause" button
pauseButton.addEventListener("click", toggleAnimationState);