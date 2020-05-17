var common = require("./common.js");

function dance() {
	var name = "dance.js";

	// Keep this number low for a cool, fast dancing effect
	// This might tank your pi's performance :)
	var DanceSpeed = 1;
	var ledIndex = 0;
	var iterationIndex = 0;
	var maxIterations = 256 * 5;

	this.GoDance = function (args, strip) {
		strip.Mode = name + "dance";
		console.log("Going dance mode.");
		this.DanceTick(args, strip);
	};

	this.DanceTick = function (args, strip) {
		var _this = this;

		if (iterationIndex < maxIterations) {
			if (ledIndex < strip.NUM_LEDS) {
				strip.Lights[ledIndex] = common.colorWheel(
					((ledIndex * 256) / strip.NUM_LEDS + iterationIndex) & 255
				);

				ledIndex++;
			} else {
				ledIndex = 0;
				iterationIndex++;
			}
		} else {
			ledIndex = 0;
			iterationIndex = 0;
		}

		strip.Render();

		setTimeout(function () {
			if (strip.Mode == name + "dance") {
				_this.DanceTick(args, strip);
			}
		}, DanceSpeed);
	};
}

// colorWipe( 0xff3b00 , DanceSpeed); // Red
// theaterChase( 0xf8f9de , DanceSpeed); // White
// colorWipe( 0x0043ff , DanceSpeed); // Blue
// colorWipe( 0x1eff0a , DanceSpeed); // Green
// theaterChase( 0xff3b00 , DanceSpeed); // Red
// theaterChase( 0x0043ff , DanceSpeed); // Blue

module.exports = new dance();
