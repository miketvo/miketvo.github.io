import GAMESETTINGS from "../settings.js";


export default class Bomb extends Phaser.Physics.Matter.Sprite {
    /***
     * Create a health pack at the specified position already scaled according to settings.js.
     * @param {Phaser.Physics.Matter.World} world
     * @param {number} x
     * @param {number} y
     * @return {Bomb}
     */
    constructor(world, x, y) {
        super(world, x, y, 'bomb');
        this.setScale(GAMESETTINGS.scaleFactor, GAMESETTINGS.scaleFactor);
        this.setSensor(true);
        this.setIgnoreGravity(true);
        this.setDepth(-1);
        this.scene.add.existing(this);
        return this;
    }

    /** @type {boolean} **/
    exploded = false;

    /***
     * Reset bomb state
     */
    reset() {
        this.exploded = false;
        this.setCollisionCategory(1);
        this.setTexture('bomb');
        this.visible = true;
    }

    /***
     * Collision logic
     * @param {Phaser.Physics.Matter.Matter.Pair} pair
     * @return {Phaser.Physics.Matter.Matter.Pair}
     */
    collisionHandler(pair) {
        this.exploded = true;
        this.play('explosion-anim');
        this.setCollisionCategory(0);
        return pair;
    }
}