const scaleFactor = 8

/***
 * IMPORTANT: Only adjust game balance via this object
 * ***/
const GAMESETTINGS = {
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
        initialY: 60 * scaleFactor,
        webOverhead: 10 * scaleFactor
    },
    gravity: {
        x: 0,
        y: 0.15 * scaleFactor
    },
    controlSensitivity: 0.00015 * scaleFactor,
    debug: true
};

export default GAMESETTINGS;
