import GAMESETTINGS from "./settings.js";
import PreloadGame from "./scenes/PreloadGame.js";
import StartScreen from "./scenes/StartScreen.js";
import RunGame from "./scenes/RunGame.js";
import GameOver from "./scenes/GameOver.js";


let debug = false;
if (GAMESETTINGS.debug) {
    debug = {
        showVelocity: true,
        showCollisions: true
    }
}


let customFonts = [
    'Kenney Blocks',
    'Kenney Future',
    'Kenney Future Narrow',
    'Kenney High',
    'Kenney High Square',
    'Kenney Mini',
    'Kenney Mini Square',
    'Kenney Pixel',
    'Kenney Pixel Square',
    'Kenney Rocket',
    'Kenney Rocket Square'
];


const config = {
    backgroundColor: GAMESETTINGS.backgroundColor,
    pixelArt: true,
    type: Phaser.AUTO,
    scale: {
        parent: 'game-wrapper',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        width: GAMESETTINGS.nativeWidth * GAMESETTINGS.scaleFactor,
        height: GAMESETTINGS.nativeHeight * GAMESETTINGS.scaleFactor
    },
    physics: {
        default: "matter",
        matter: {
            gravity: { x: GAMESETTINGS.gravity.x * GAMESETTINGS.scaleFactor, y: GAMESETTINGS.gravity.y * GAMESETTINGS.scaleFactor },
            debug: debug
        }
    },
    scene: [
        PreloadGame, StartScreen, RunGame, GameOver
    ]
};

// Scale the game accordingly in horizontal and vertical mode
let game;
if (screen.availWidth > screen.availHeight) {  // Horizontal mode
    game = new Phaser.Game(config);
} else {  // Vertical mode
    game = new Phaser.Game(config);
    document.querySelector('.portrait-mode-message').setAttribute('style', 'display: block; margin-left: 0; margin-right: 0;');
    document.querySelector('footer').setAttribute('style', 'display: none;');
    document.querySelector('body').setAttribute('style', 'margin: 0 2rem;');
    document.querySelector('#game-wrapper').setAttribute('style', 'margin: 0 2rem;');
}


export default {
    game,
    config,
    customFonts
};
