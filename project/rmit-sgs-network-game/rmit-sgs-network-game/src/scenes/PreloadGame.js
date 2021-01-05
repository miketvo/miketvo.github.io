/***
 * Assets management class
 */
export default class PreloadGame extends Phaser.Scene {
    constructor() {
        super("preloadGame");
    }

    preload() {
        this.loadUserInterface();
        this.loadBackground();
        this.loadEnvironment();
        this.loadPlayer();
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
        this.load.image('background', 'assets/sprites/background/debug-bg.png');
    }

    loadEnvironment() {
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
    }

    loadSFX() {
        // To be implemented
    }

    loadSoundtrack() {
        // To be implemented
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
