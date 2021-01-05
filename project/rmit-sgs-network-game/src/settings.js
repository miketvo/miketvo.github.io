const scaleFactor = 10

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
        }
    },
    gravity: {
        x: 0,
        y: 0.15 * scaleFactor
    },
    controlSensitivity: 0.00015 * scaleFactor,
};

export default GAMESETTINGS;
