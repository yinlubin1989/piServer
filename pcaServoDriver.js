const i2cBus = require("i2c-bus");
const Pca9685Driver = require("pca9685").Pca9685Driver;

const main = () => {
    const options = {
        i2c: i2cBus.openSync(1),
        address: 0x40,
        frequency: 50,
        debug: false
    };

    pwm = new Pca9685Driver(options, function(err) {
        if (err) {
            console.error("Error initializing PCA9685");
            process.exit(-1);
        }
        console.log("Initialization done");
    
        // pwm.setPulseRange(1, 42, 255, function() {
        //     if (err) {
        //         console.error("Error setting pulse range.");
        //     } else {
        //         console.log("Pulse range set.");
        //     }
        // });

        const test = () => {
             pwm.setPulseLength(0, 42);
            setTimeout(() => {
                 pwm.setPulseLength(0, 255);
                test();
            }, 1000)
        }
        test();
    
        // Set the pulse length to 1500 microseconds for channel 2
        // pwm.setPulseLength(2, 1500);
    
        // Set the duty cycle to 25% for channel 8
        // pwm.setDutyCycle(8, 0.25);
    
        // Turn off all power to channel 6
        // (with optional callback)
        // pwm.channelOff(6, function() {
        //     if (err) {
        //         console.error("Error turning off channel.");
        //     } else {
        //         console.log("Channel 6 is off.");
        //     }
        // });
    
        // Turn on channel 3 (100% power)
        // pwm.channelOn(3);
    });
}

module.exports = main;
