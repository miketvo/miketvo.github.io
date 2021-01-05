import GAMESETTINGS from "./settings.js";
import PreloadGame from "./scenes/PreloadGame.js";
import RunGame from "./scenes/RunGame.js";


let config = {
    backgroundColor: "#ffffff",
    pixelArt: true,
    type: Phaser.AUTO,
    scale: {
        parent: 'game-wrapper',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAMESETTINGS.nativeWidth * GAMESETTINGS.scaleFactor,
        height: GAMESETTINGS.nativeHeight * GAMESETTINGS.scaleFactor
    },
    physics: {
        default: "matter",
        matter: {
            gravity: { x: GAMESETTINGS.gravity.x, y: GAMESETTINGS.gravity.y },
            debug: true
        }
    },
    scene: [
        PreloadGame, RunGame
    ]
}

let game = new Phaser.Game(config);


export default {
    game,
    config,
};
