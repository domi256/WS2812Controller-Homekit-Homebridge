/**
 * Put your number of LED's here
 */
var NUM_LEDS = 296;
var ws281x = require("rpi-ws281x-native");
var pixelData = new Uint32Array(NUM_LEDS);
var Lights = [];

ws281x.init(NUM_LEDS);

function strip() {
	this.NUM_LEDS = NUM_LEDS;
	this.Mode = "";
	this.Lights = [];
	this.brightness = 255
	this.color = "0xffffff"

	this.Clear = function () {
		ws281x.reset();
	};

	/**
	 * Clear all LED's back to 0x00000 and render
	 */
	this.Off = function () {
		this.SetStripColor(0);
		this.Mode = "STOP";
	};

	/**
	 * Get Stirp Status for Homekit
	 */
	this.GetStripStatus = function () {
		if (this.Mode === "STOP") {
			return 0
		} else {
			return 1
		}
	}

	/**
	 * Turn Strip on with last value.
	 */
	this.On = function () {
		this.Mode = "On"
		// if (this.brightness === 0) {
		// 	this.brightness = 100;
		// }
		// ws281x.setBrightness(this.brightness)
		this.SetStripColor(this.color)
	};

	/**
	 * Assign the brightness of the whole strip.
	 */
	this.SetBrightness = function (brightness) {
		this.brightness = brightness
		ws281x.setBrightness(brightness);
	};


	/**
	 * get brightness.
	 */
	this.GetBrightness = function () {
		return this.brightness
	};

	/**
	 * Set a single color for all LED's
	 */
	this.SetStripColor = function (color) {
		this.color = color
		for (var i = 0; i < NUM_LEDS; i++) {
			this.Lights[i] = color;
		}
		this.Render();
	};

	/**
	 * Render the current state of the LED strip
	 */
	this.Render = function () {
		var tmp = [];
		for (var i = 0; i < NUM_LEDS; i++) {
			if (i > NUM_LEDS) break;
			tmp[i] = this.Lights[i];
		}

		ws281x.render(tmp);
	};
}

module.exports = new strip();
