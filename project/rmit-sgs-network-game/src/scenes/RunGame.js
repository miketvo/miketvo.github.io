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
    /** @type {string} **/
    debugText;
    /** @type {Phaser.GameObjects.Text} **/
    debugTextObj;
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
    /** @type {Phaser.Input.Pointer} **/
    pointer;
    /** @type {Phaser.Cameras.Scene2D.Camera} **/
    cam;
    /* End of custom properties */


    init() {
        this.debugText = "";
        this.matter.set60Hz();
        this.score = 0;
    }

    create() {
        this.createBackground();
        this.ceiling = this.createCeilingAnchors();
        this.player = this.createPlayer(GAMESETTINGS.player.initialX, GAMESETTINGS.player.initialY);
        this.web = this.playerShootWeb(GAMESETTINGS.player.initialX);

        this.cursor = this.input.keyboard.createCursorKeys();  // Enable player control via keyboard

        this.setupCamera();

        if (GAMESETTINGS.debug) { this.createDebugInfo(); }
    }

    update(time, delta) {
        super.update(time, delta);  // Default code suggestion, don't know why it works yet, maybe consult Phaser documentation?
        this.updatePlayer();
        this.renderPlayerWeb();

        if (GAMESETTINGS.debug) { this.updateDebugInfo(); }
    }


    /*
    ************************************
    * ----------CUSTOM METHODS-------- *
    ************************************/
    /***
     * Create the background
     * @returns {Phaser.GameObjects.Image}
     */
    createBackground() {
        return this.add.image(this.game.scale.width / 2, this.game.scale.height / 2, 'background')
            .setScale(GAMESETTINGS.scaleFactor)
            .setScrollFactor(1, 1);
    }

    /***
     * Create a player sprite at the specified xy coordinates
     * @param {number} x
     * @param {number} y
     * @returns {Phaser.Physics.Matter.Sprite}
     */
    createPlayer(x, y) {
        let player = this.matter.add.sprite(x, y, 'player')
            .setScale(GAMESETTINGS.scaleFactor)
            .setOrigin(0.5, 0)
            .setMass(GAMESETTINGS.player.mass);
        player.body.force = GAMESETTINGS.player.initialForce;

        // Readjust collision box yOffset
        for (let i = 0; i < player.body.vertices.length; i++) {
            player.body.vertices[i].y += player.displayHeight / 2;
        }

        // Exclude legs from collision box
        player.body.vertices[0].x += 3 * GAMESETTINGS.scaleFactor;
        player.body.vertices[1].x -= 3 * GAMESETTINGS.scaleFactor;
        player.body.vertices[2].x -= 3 * GAMESETTINGS.scaleFactor;
        player.body.vertices[3].x += 3 * GAMESETTINGS.scaleFactor;

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
            let anchor = this.matter.add.rectangle(
                i, -GAMESETTINGS.scaleFactor / 2, GAMESETTINGS.scaleFactor, GAMESETTINGS.scaleFactor
            );
            anchor.ignoreGravity = true;
            anchor.isStatic = true;
            anchors.push(anchor);
        }
        return anchors;
    }

    /***
     * Configure the viewport to follow the player's character
     */
    setupCamera() {
        let offsetX = -GAMESETTINGS.player.initialX;  // TODO: Only works for initialX = 40
        let offsetY = GAMESETTINGS.player.initialY / 4;  // TODO: Only works for initialY = 60

        this.cam = this.cameras.main;
        this.cam.startFollow(
            this.player,
            true,
            1, 0,
            offsetX, offsetY
        );
    }

    /***
     * Create a player web (type MatterJS constraint) between the player character and a specified point on the ceiling
     * @param {number} targetAnchorIdx
     * @returns {MatterJS.ConstraintType}
     */
    playerShootWeb(targetAnchorIdx) {
        this.webExist = true;
        return this.matter.add.constraint(this.player.body, this.ceiling[targetAnchorIdx]);
    }

    /***
     * Destroy the specified player web (type MatterJS constraint)
     * @param {MatterJS.ConstraintType} playerWebObject
     * @returns {Phaser.Physics.Matter.World}
     */
    playerCutWeb(playerWebObject) {
        this.webExist = false;
        return this.matter.world.removeConstraint(playerWebObject, true);
    }

    /***
     * Show the web on screen if it exists
     */
    renderPlayerWeb() {
        if (!this.graphics) {
            this.graphics = this.add.graphics();
        }
        this.graphics.clear();

        if (this.webExist) {
            let lineThickness = GAMESETTINGS.scaleFactor
            this.matter.world.renderConstraint(
                this.web, this.graphics,
                -1, 1, lineThickness, 0, -1, 0
        );
        }
    }

    /***
     * Update the player character's properties according to player input
     */
    updatePlayer() {
        let control = {
            left: false,
            right: false,
            toggleWeb: false
        };

        // -------------------------------- Categorize inputs -------------------------------- //
        if (
            this.cursor.left.isDown && this.webExist
        ) { control.left = true; }
        if (
            this.cursor.right.isDown && this.webExist
        ) { control.right = true; }
        if (
            Phaser.Input.Keyboard.JustDown(this.cursor.space)
        ) { control.toggleWeb = true; }

        // -------------------------------- Apply input to player character -------------------------------- //
        if (control.left) {  // Left movement
            this.matter.applyForce(this.player.body, { x: -GAMESETTINGS.controlSensitivity, y: 0 });
        }
        if (control.right) {  // Right movement
            this.matter.applyForce(this.player.body, { x: GAMESETTINGS.controlSensitivity, y: 0 });
        }
        if (control.toggleWeb && this.webExist) {  // Cut web
            this.playerCutWeb(this.web);
        } else if (control.toggleWeb && !this.webExist) {  // Shoot web
            let playerX = Math.floor(this.player.x);
            let targetAnchorIdx;  // Set at undefined to catch errors when targetAnchorIdx is not set

            if (this.player.body.velocity.x > 0) {
                targetAnchorIdx = playerX + GAMESETTINGS.player.webOverhead;
            } else if (this.player.body.velocity.x < 0) {
                targetAnchorIdx = playerX - GAMESETTINGS.player.webOverhead;
            } else {
                targetAnchorIdx = playerX;
            }

            try {
                this.web = this.playerShootWeb(targetAnchorIdx);
            } catch (TypeError) {
                console.log("Can't find ceiling anchors! Restarting")
                this.scene.start('runGame');
            }  // Restart game
        }
    }


    // =========================================== FOR DEBUGGING PURPOSES =========================================== //

    createDebugInfo() {
        this.debugTextObj = this.add.text(
            GAMESETTINGS.scaleFactor, GAMESETTINGS.scaleFactor, this.debugText, { color: "#0f0" }
        ).setScrollFactor(0);
    }

    updateDebugInfo() {
        this.debugText = "STATS FOR NERDS\n\n"
            + `player.x = ${this.player.x}\n`
            + `player.y = ${this.player.y}\n`
            + `webExist = ${this.webExist}\n`
            + '\n'
            + `viewport.scrollX ${this.cam.scrollX}\n`
            + `viewport.scrollY ${this.cam.scrollY}\n`
        ;
        this.debugTextObj.text = this.debugText;
    }
    /* End of custom methods */
}
