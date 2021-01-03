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
        width: GAMESETTINGS.nativeWidth,
        height: GAMESETTINGS.nativeHeight
    },
    physics: {
        default: "matter",
        matter: {
            gravity: { x: GAMESETTINGS.gravity.x, y: GAMESETTINGS.gravity.y },
            debug: GAMESETTINGS.debug
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
