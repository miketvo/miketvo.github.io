import GAMESETTINGS from "../settings.js";


/***
 * Gameplay class
 */
export default class RunGame extends Phaser.Scene {
    constructor() {
        super("runGame");
    }


    /*
    *************************************
    * ---------CUSTOM PROPERTIES------- *
    *************************************
     */
    /** @type {number} **/
    score;
    /** @type {[{MatterJS.BodyType}]} **/
    ceiling;
    /** @type {Phaser.Physics.Matter.Sprite} **/
    player;
    /** @type {MatterJS.ConstraintType} **/
    web;
    /** @type {boolean} **/
    webExist;
    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} **/
    cursor;
    /* End of custom properties */


    init() {
        this.matter.set60Hz();
        this.score = 0;
        this.webExist = true;
    }

    create() {
        // this.debugCreate();  // For debugging purposes only
        this.createBackground();
        this.ceiling = this.createCeilingAnchors();
        this.player = this.createPlayer(this.game.scale.width / 3, this.game.scale.height / 2);
        this.web = this.playerShootWeb();

        this.cursor = this.input.keyboard.createCursorKeys();  // Enable player control
    }

    update(time, delta) {
        super.update(time, delta);  // Default code suggestion, don't know why it works yet, maybe consult Phaser documentation?
        this.renderPlayerWeb();
        this.updatePlayer();
    }


    /*
    ************************************
    * ----------CUSTOM METHODS-------- *
    ************************************
     */
    // /***
    //  * For debugging purposes only
    //  */
    // debugCreate() {
    //     this.add.sprite(this.game.scale.width / 2, this.game.scale.height / 2, 'background')
    //         .setScrollFactor(0, 0);
    //     this.add.sprite(25, 45, 'ui-health', 0);
    //     this.add.sprite(50, 45, 'ui-health', 1);
    //     this.add.sprite(75, 45, 'player');
    //     this.add.sprite(100, 45, 'player-dead').play('player-dead-anim');
    //     this.add.sprite(125, 45, 'booster-health').play('booster-health-anim');
    // }

    createBackground() {
        return this.add.image(this.game.scale.width / 2, this.game.scale.height / 2, 'background')
            .setScrollFactor(0, 0);
    }

    /***
     * Create a player sprite at the specified xy coordinates
     * @param {number} x
     * @param {number} y
     * @returns {Phaser.Physics.Matter.Sprite}
     */
    createPlayer(x, y) {
        let player = this.matter.add.sprite(x, y, 'player')
            .setOrigin(0.5, 0)
            .setMass(GAMESETTINGS.player.mass);
        player.body.force = GAMESETTINGS.player.initialForce;

        // Readjust collision box yOffset
        for (let i = 0; i < player.body.vertices.length; i++) {
            player.body.vertices[i].y += player.displayHeight / 2;
        }

        // Exclude legs from collision box
        player.body.vertices[0].x += 3;
        player.body.vertices[1].x -= 3;
        player.body.vertices[2].x -= 3;
        player.body.vertices[3].x += 3;

        return player;
    }

    /***
     * Create and return an array of the ceiling anchors
     * @returns {[{MatterJS.BodyType}]}
     */
    createCeilingAnchors() {
        let anchors = [];
        for (let i = 0; i < this.game.scale.width; i++) {
            /** @type {MatterJS.BodyType} **/
            let anchor = this.matter.add.rectangle(i, -1, 1, 2);
            anchor.ignoreGravity = true;
            anchor.isStatic = true;
            anchors.push(anchor);
        }
        return anchors;
    }

    playerShootWeb() {
        let targetAnchorIdx = Math.floor(this.game.scale.width / 2);
        return this.matter.add.constraint(this.player.body, this.ceiling[targetAnchorIdx]);
    }

    playerCutWeb(playerWebObject) {
        this.matter.world.removeConstraint(playerWebObject, true);
    }

    renderPlayerWeb() {
        if (!this.graphics) {
            this.graphics = this.add.graphics();
        }
        this.graphics.clear();

        if (this.webExist) {
            this.matter.world.renderConstraint(this.web, this.graphics, -1, 1, 1, 0, -1, 0);
        }
    }

    updatePlayer() {
        if (this.cursor.left.isDown && this.webExist) {  // Left key
            this.matter.applyForce(this.player.body, { x: -GAMESETTINGS.controlSensitivity, y: 0 });
        }
        if (this.cursor.right.isDown && this.webExist) {  // Right key
            this.matter.applyForce(this.player.body, { x: GAMESETTINGS.controlSensitivity, y: 0 });
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursor.space) && this.webExist) {  // Spacebar to cut web
            this.playerCutWeb(this.web);
            this.webExist = false;
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursor.space) && !this.webExist) {  // Spacebar to shoot web
            this.web = this.playerShootWeb();
            this.webExist = true;
        }
    }
    /* End of custom methods */
}
