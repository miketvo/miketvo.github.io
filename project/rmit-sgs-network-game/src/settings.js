// Enable adaptive scaling on multiple screen sizes
let aspectRatio = window.innerHeight / window.innerWidth;
if (aspectRatio > 0.75) {
    aspectRatio = 0.75;  // Default aspect ratio 4:3 for horizontal mode
}
if (screen.availWidth < screen.availHeight) {
    aspectRatio = 0.5625;  // Default aspect ratio 16:9 for horizontal mode
}


/***
 * IMPORTANT: Only adjust game balance via this object
 * ***/
const GAMESETTINGS = {
    backgroundColor: '#cdcdcd',
    nativeWidth: 160,
    nativeHeight: 160 * aspectRatio,
    scaleFactor: 10,  // Scale the pixel art sprites up for smoother graphics
    player: {
        mass: 0.15,
        bounce: 0.1,
        initialForce: {
            x: 0,
            y: 0
        },
        initialX: 40,
        initialY: 160 * aspectRatio * 0.55,
        webOverhead: 10,  // Spider web shooting distance (Set 0 to shoot at the anchor directly above the player)
        webColor: 0x999999,  // Color of the spider web
        webStiffness: 0.15
    },
    gameplay: {
        scoreFactor: 1000,
        scalingDifficultyFactor: 2,  // Cannot be larger than maximumGap
        startingHealth: 3,
        initialSafeZone: 0,  // The initial zone where no obstacles will be generated
        obstacleOverhead: 10,  // Number of obstacles rendered ahead of time. Heavily affect performance
        distanceBetweenObstacles: 32,  // 32 is the width of the obstacle sprite TODO: more scalable approach?
        minimumGap: 68,
        maximumGap: 80,
        obstaclesYDeviation: 160 * aspectRatio * 0.1,  // TODO: 0.1 is not scalable in multiple aspect ratios. Find a better formula.
        dynamicObstacleVelocity: 0.1,
        dynamicObstacleChance: 1 / 20,
        bombChance: 1 / 30
    },
    UI: {
        scoreColor: '#cdcdcd',
        scoreStroke: '#6f6f6f',
        healthColor: '#e60028'
    },
    gravity: {
        x: 0,
        y: 0.15
    },
    controlSensitivity: 0.0002,
    gameOverDelay: 500,  // Delay before displaying game over screen
    controlDelayOnStart: 175,
    debug: false
};

export default GAMESETTINGS;
