
var common = require("./common.js");

/*******************************
	static methods
*******************************/

function static() {
	
	let Brightness = 255;

	this.ShowColor = function(args, strip) {
		console.log("Starting Static Color");
		let staticColor = parseInt("0x" + args.Color);
		strip.Mode = "ShowColor";
		strip.SetBrightness(Brightness)
		strip.SetStripColor(staticColor)
		//this.StaticTick(strip, staticColor)
	}

	/**
	 * Updates the brightness of the strip while in static mode
	 */
	this.SetBrightness = function (args, strip) {
		var brightness = parseInt(args.Brightness);
		//console.log(brightness)
		if (typeof brightness !== "number") {
			brightness = 255;
		}

		// Force to be between 1 and 255
		brightness = Math.max(brightness, 1);
		brightness = Math.min(brightness, 255);

		Brightness = brightness;
		strip.SetBrightness(Brightness);
	};
}

module.exports = new static();
