/*******************************
	WS2812 LED Control
		A tiny, primitive app for controlling WS2812 LEDs.

	Austin Brown - 2020
	http://luxdvie.github.io
	austinbrown2500@gmail.com
*******************************/

/* Common Libraries & Setup */
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var path = require("path");
var os = require('os');

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* The port the server will listen on */
var HTTP_PORT = 8080;

/* Global reference to the LED strip */
var strip = require("./strip.js");

/*  Animation Libraries */
var xmas = require("./animations/xmas.js");
var fade = require("./animations/fade.js");
var static = require("./animations/static.js");
var rainbow = require("./animations/rainbow.js");
var control = require("./animations/control.js");
var dance = require("./animations/dance.js");
var twinkle = require("./animations/twinkle.js");
const { brightness } = require("./strip.js");

// Find the first local, ipv4 address
// This is a 'best guess' that the web server can be accessed
// via this address. Your mileage may vary!
// https://stackoverflow.com/questions/10750303/how-can-i-get-the-local-ip-address-in-node-js
// https://nodejs.org/api/os.html#os_os_networkinterfaces
var interfaces = os.networkInterfaces();
var localAddress = "";
for (var k in interfaces) {
	for (var k2 in interfaces[k]) {
		var address = interfaces[k][k2];
		if (address.family === 'IPv4' && !address.internal) {
			localAddress = address.address;
			break;
		}
	}
}

/*****************
	Web Methods
*****************/

/**
 * Generic handler for an animation request.
 * 	All requests should be in the format
 * 		lib => name of animation package you're referencing
 * 		method => name of method in package you're calling
 * 		args => object containing any arguments you want to pass to the animation method
 */
app.post("/AnimationRequest", function (request, response) {
	response.header("Access-Control-Allow-Origin", "*");

	var lib = request.body.hasOwnProperty("lib") ? request.body.lib : "";
	var instance = GetLibraryInstance(lib);
	if (instance === null || typeof instance === "undefined") {
		response.send("Library not found.");
		return;
	}

	var method = request.body.hasOwnProperty("method")
		? request.body.method
		: null;
	if (method === null) {
		response.send("Method not found.");
		return;
	}

	var args = request.body.hasOwnProperty("args") ? request.body.args : "";

	if (typeof instance[method] === "function") {
		var rsp = instance[method](args, strip);
		response.send(rsp);
	} else {
		response.send("Function not found");
	}
});

/**
 * Home
 */
app.get("/", function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.sendFile(path.join(__dirname + "/app.html"));
});

/*****************
	Admin
*****************/

app.get("/admin/reboot", function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.send("Issuing shutdown command.");
	require('child_process').exec('sudo reboot', function (msg) { console.log("Issuing reboot command.") });
});

app.get("/admin/poweroff", function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.send("Issuing shutdown command.");
	require('child_process').exec('sudo poweroff', function (msg) { console.log("Issuing shutdown command.") });
});

/*****************
	API
*****************/

/**
 * Turn on LED Strip
 */
app.get("/api/v1/on", function (req, res) {
	// switch led on
	res.header("Access-Control-Allow-Origin", "*");
	strip.On()
	res.send("1")
});

/**
 * Turn off LED-Strip
 */
app.get("/api/v1/off", function (req, res) {
	// switch led off
	res.header("Access-Control-Allow-Origin", "*");
	strip.Off()
	res.send("0")

});

/**
 * Get status of LED-Strip
 * @returns 0 if off
 * @returns 1 if on
 * 
 */
app.get("/api/v1/status", function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.send(`${strip.GetStripStatus()}`)
});

/**
 * Get Brightness of LED-Strip as float value between 0 and 1
 * 0 is off 
 * 1 is 100% on
 * @returns float value with brightness between 0 and 1 
 */
app.get("/api/v1/brightness", function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	let stripBrightness = strip.GetBrightness()
	let calc = stripBrightness / 2.55
	calc = Math.floor(calc)
	res.send(`${calc}`)
});

/**
 * Set Brightness of LED-Strip value 
 * @valueOfBrightness value between 0 and 100
 * @returns float between 0 and 1
 */
app.get("/api/v1/brightness/:valueOfBrightness", function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	let reqBrightness = req.params.valueOfBrightness
	if (reqBrightness === "0") {
		strip.Off()
		res.send("0")
	} else {
		let brightness_255 = Math.ceil(reqBrightness * 2.55)
		//let brightness_response = (reqBrightness / 100)
		strip.SetBrightness(brightness_255)
		res.send(`${reqBrightness}`)
	}
});

app.get("/api/v1/color", function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	let color = strip.color
	res.send(`${color}`)
});

app.get("/api/v1/color/:valueOfColor", function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	let color = req.params.valueOfColor
	let dec_color = parseInt(color, 16)
	strip.SetStripColor(dec_color)
	res.send(`${color}`)
});

/*****************
	Common
*****************/

/**
 * Find the correct reference to a specific library name;
 * @param {string} key The name of the library to find
 */
function GetLibraryInstance(key) {
	var lib = null;
	switch (key) {
		case "static":
			lib = static;
			break;
		case "xmas":
			lib = xmas;
			break;
		case "fade":
			lib = fade;
			break;
		case "rainbow":
			lib = rainbow;
			break;
		case "control":
			lib = control;
			break;
		case "dance":
			lib = dance;
			break;
		case "twinkle":
			lib = twinkle;
			break;
	}

	return lib;
}

/*****************
	Startup
*****************/

var server = app.listen(HTTP_PORT, function () {
	console.log("***************************");
	console.log(" WS2812 CONTROLLER STARTUP ");
	console.log(" Web Server listening at the location below, or by host name and port. ");
	console.log(" http://" + localAddress + ":" + HTTP_PORT);
	console.log("***************************");

	//Run the 'Rainbow' routing on startup
	var rainbowInstance = GetLibraryInstance("rainbow");
	if (rainbowInstance) {
		rainbowInstance.GoRainbow("", strip);
	}
});
