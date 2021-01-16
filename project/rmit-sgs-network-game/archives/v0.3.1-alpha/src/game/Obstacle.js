import GAMESETTINGS from "../settings.js";


export default class Obstacle extends Phaser.Physics.Matter.Image {
    /***
     * Create an obstacle at the specified position already scaled according to settings.js.
     * @param {Phaser.Physics.Matter.World} world
     * @param {number} x
     * @param {number} y
     * @param {boolean} dynamic
     * @return {Obstacle}
     */
    constructor(world, x, y, dynamic) {
        super(world, x, y, 'obstacle');
        this.setScale(GAMESETTINGS.scaleFactor, GAMESETTINGS.scaleFactor);
        this.setStatic(true);
        this.scene.add.existing(this);
        this.dynamic = dynamic;
        return this;
    }

    /** @type {boolean} **/
    dynamic;

    /** @type {number} **/
    velocity = 0;

    /***
     * Dynamic obstacle logic
     * @param {number} velocity
     */
    updateDynamic(velocity=this.velocity) {
        if (this.dynamic) {
            this.setY(this.y + velocity);
            return this;
        }
        return undefined;
    }
}
