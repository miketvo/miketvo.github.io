import game from "../game.js";


/***
 * Game Over screen
 */
export default class GameOver extends Phaser.Scene {
    constructor() {
        super("gameOver");
    }

    /** @type {Phaser.GameObjects.Text} **/
    restart;

    /***
     *
     * @param {Object} data
     */
    create(data) {
        let clickSFX = this.sound.add('shoot-sfx');
        this.sound.add('game-over-audio').play();

        WebFont.load({
            custom: {
                families: game.customFonts
            },
            active: () => {
                this.add.text(50, 20, `Game Over\nScore: ${data.score}`, {
                    fontSize: 120, fontFamily: 'Kenney High Square, Arial, sans-serif', color: '#000', fontStyle: 'bold'
                });
                this.restart = this.add.text(50, this.game.scale.height - 160, 'Restart', {
                    fontSize: 120, fontFamily: 'Kenney High Square, Arial, sans-serif', backgroundColor: '#000', fontStyle: 'bold', padding: {
                        left: 20,
                        right: 10,
                        top: 0,
                        bottom: 10
                    }
                }).setInteractive();
            }
        });

        this.input.on('gameobjectdown', () => {
            clickSFX.play();
            this.scene.start('runGame')
        }, this);
    }
}
