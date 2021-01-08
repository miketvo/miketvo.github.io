const scaleFactor = 8

/***
 * IMPORTANT: Only adjust game balance via this object
 * ***/
const GAMESETTINGS = {
    backgroundColor: '#c2c2c2',
    nativeWidth: 160,
    nativeHeight: 90,
    scaleFactor: scaleFactor,
    player: {
        mass: 0.15 * scaleFactor,
        initialForce: {
            x: 0,
            y: 0
        },
        initialX: 40 * scaleFactor,
        initialY: 50 * scaleFactor,
        webOverhead: 10 * scaleFactor,
        webColor: 0xffffff  // White
    },
    gameplay: {
        scoreFactor: 500,
        startingHealth: 3
    },
    gravity: {
        x: 0,
        y: 0.15 * scaleFactor
    },
    controlSensitivity: 0.00015 * scaleFactor,
    gameOverDelay: 500,
    debug: false
};

export default GAMESETTINGS;
