import GAMESETTINGS from "../settings.js";


/***
 * Assets management class
 */
export default class PreloadGame extends Phaser.Scene {
    constructor() {
        super("preloadGame");
    }

    preload() {
        this.load.script('webFont', 'src/lib/webfont.js');  // Enable custom fonts handling
        this.loadUserInterface();
        this.loadBackground();
        this.loadEnvironment();
        this.loadPlayer();
        this.loadSFX();
        this.loadSoundtrack();
    }

    create() {
        this.createAnimations();
        this.scene.start('runGame');
    }


    /*
    ************************************
    * ----------CUSTOM METHODS-------- *
    ************************************
     */
    loadUserInterface() {
        this.load.spritesheet('ui-health', 'assets/sprites/ui/ui-health.png', {
            frameWidth: 4,
            frameHeight: 4,
            startFrame: 0,
            endFrame: 1
        });
    }

    loadBackground() {
        if (GAMESETTINGS.debug) {
            this.load.image('background', 'assets/sprites/background/debug-bg.png');
        } else {
            this.load.image('background', 'assets/sprites/background/background.png');
        }
    }

    loadEnvironment() {
        this.load.image('bound', 'assets/sprites/environment/bound.png');
        this.load.image('bound-left', 'assets/sprites/environment/bound-left.png');
        this.load.image('obstacle', 'assets/sprites/environment/obstacle.png');
        this.load.spritesheet('booster-health', 'assets/sprites/environment/booster-health.png', {
            frameWidth: 8,
            frameHeight: 10,
            startFrame: 0,
            endFrame: 11
        });
    }

    loadPlayer() {
        this.load.image('player', 'assets/sprites/player/player.png');
        this.load.spritesheet('player-dead', 'assets/sprites/player/player-dead.png', {
            frameWidth: 17,
            frameHeight: 16,
            startFrame: 0,
            endFrame: 4
        });
        this.load.spritesheet('player-hurt', 'assets/sprites/player/player-hurt.png', {
            frameWidth: 13,
            frameHeight: 10,
            startFrame: 0,
            endFrame: 4
        });
    }

    loadSFX() {  // TODO: convert these files to .mp3 for compatibility with iOS and MacOS
        this.load.audio('dead-sfx', 'assets/sfx/dead.ogg');
        this.load.audio('shoot-sfx', 'assets/sfx/shoot.ogg');
    }

    loadSoundtrack() {
        this.load.audio('game-over-audio', 'assets/ost/lose.mp3');
    }

    createAnimations() {
        this.anims.create({
            key: 'player-dead-anim',
            frames: this.anims.generateFrameNumbers('player-dead', {
                start: 0,
                end: 4
            }),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true
        });
        this.anims.create({
            key: 'player-hurt-anim',
            frames: this.anims.generateFrameNumbers('player-hurt', {
                start: 0,
                end: 4
            }),
            frameRate: 20,
            repeat: 0,
        });
        this.anims.create({
            key: 'booster-health-anim',
            frames: this.anims.generateFrameNumbers('booster-health', {
                start: 0,
                end: 10
            }),
            frameRate: 10,
            repeat: -1,
        });
    }
    /* End of custom methods */
}
