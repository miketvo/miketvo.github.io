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
        this.loadBackground();
        this.loadEnvironment();
        this.loadPlayer();
        this.loadFX();
        this.loadPostProcessingFX();
        this.loadSFX();
        this.loadSoundtrack();
    }

    create() {
        this.createAnimations();
        this.scene.start('startScreen');
    }


    /*
    ************************************
    * ----------CUSTOM METHODS-------- *
    ************************************
     */
    loadBackground() {
        if (GAMESETTINGS.debug) {
            this.load.image('background', 'assets/sprites/background/debug-bg.png');
        } else {
            this.load.spritesheet('background', 'assets/sprites/background/background.png', {
                frameWidth: 160,
                frameHeight: 90,
                startFrame: 0,
                endFrame: 3
            });
        }
    }

    loadEnvironment() {
        this.load.image('bound', 'assets/sprites/environment/bound.png');
        this.load.image('bound-left', 'assets/sprites/environment/bound-left.png');
        this.load.image('obstacle', 'assets/sprites/environment/obstacle.png');
        this.load.image('bomb', 'assets/sprites/environment/bomb.png');
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

    loadFX() {
        this.load.spritesheet('explosion', 'assets/sprites/fx/explosion.png', {
            frameWidth: 15,
            frameHeight: 15,
            startFrame: 0,
            endFrame: 5
        });
    }

    loadPostProcessingFX() {
        this.load.spritesheet('vignette', 'assets/sprites/post-processing/vignette.png', {
            frameWidth: 192,
            frameHeight: 192,
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
        if (!GAMESETTINGS.debug) {
            this.anims.create({
                key: 'background-anim',
                frames: this.anims.generateFrameNumbers('background', {
                    start: 0,
                    end: 3
                }),
                frameRate: 1,
                repeat: -1,
            });
        }
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
            key: 'explosion-anim',
            frames: this.anims.generateFrameNumbers('explosion', {
                start: 0,
                end: 5
            }),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true
        });
        this.anims.create({
            key: 'vignette-anim',
            frames: this.anims.generateFrameNumbers('vignette', {
                start: 0,
                end: 4
            }),
            frameRate: 2,
            repeat: -1,
        });
    }
    /* End of custom methods */
}
