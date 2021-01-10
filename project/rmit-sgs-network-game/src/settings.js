/***
 * IMPORTANT: Only adjust game balance via this object
 * ***/
const GAMESETTINGS = {
    backgroundColor: '#c2c2c2',
    nativeWidth: 160,
    nativeHeight: 90,
    scaleFactor: 10,  // Scale the pixel art sprites up for smoother graphics
    player: {
        mass: 0.15,
        initialForce: {
            x: 0,
            y: 0
        },
        initialX: 40,
        initialY: 50,
        webOverhead: 10,  // Spider web shooting distance (Set 0 to shoot at the anchor directly above the player)
        webColor: 0xffffff  // Color of the spider web
    },
    gameplay: {
        scoreFactor: 1000,
        scalingDifficultyFactor: 2,  // Cannot be larger than maximumGap
        startingHealth: 3,
        initialSafeZone: 0,  // The initial zone where no obstacles will be generated
        obstacleOverhead: 10,  // Number of obstacles rendered ahead of time. Heavily affect performance
        distanceBetweenObstacles: 32,  // 32 is the width of the obstacle sprite TODO: more scalable approach?
        minimumGap: 64,
        maximumGap: 90
    },
    gravity: {
        x: 0,
        y: 0.15
    },
    controlSensitivity: 0.00015,
    gameOverDelay: 500,  // Delay before displaying game over screen
    debug: false
};

export default GAMESETTINGS;
