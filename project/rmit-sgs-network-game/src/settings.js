/***
 * IMPORTANT: Only adjust game balance via this object
 * ***/
const GAMESETTINGS = {
    nativeWidth: 160,
    nativeHeight: 90,
    // TODO: Add scaling for smoother graphics
    player: {
        mass: 0.15,
        initialForce: {
            x: 0.0005,
            y: 0.0001
        }
    },
    gravity: {
        x: 0,
        y: 0.15
    },
    controlSensitivity: 0.000015,
    debug: false
};

export default GAMESETTINGS;
