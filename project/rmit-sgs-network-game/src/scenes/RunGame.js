import GAMESETTINGS from "../settings.js";
import game from "../game.js";


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
    /** @type {Object}{Phaser.Sound.BaseSound} **/
    SFX;

    /** @type {Phaser.GameObjects.Graphics} **/
    graphics;

    /** @type {string} **/
    debugText;

    /** @type {Phaser.GameObjects.Text} **/
    debugTextObj;

    /** @type {Boolean} **/
    justStarted;

    /** @type {Boolean} **/
    gameOver;

    /** @type {number} **/
    score;

    /** @type {Phaser.GameObjects.Text} **/
    scoreText;

    /** @type {number} **/
    health;

    /** @type {Phaser.GameObjects.Text} **/
    healthText;

    /** @type {[{Phaser.Physics.Matter.Sprite}]} **/
    worldBounds;

    /** @type {MatterJS.BodyType} **/
    ceilingAnchor;

    /** @type {Phaser.Physics.Matter.Sprite} **/
    player;

    /** @type {MatterJS.BodyType} **/
    playerPivot;

    /** @type {MatterJS.ConstraintType} **/
    web;

    /** @type {boolean} **/
    webExist;

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} **/
    cursor;

    /** @type {Phaser.Input.Pointer} **/
    pointer;

    /** @type {Phaser.Cameras.Scene2D.Camera} **/
    viewport;
    /* End of custom properties */


    init() {
        this.SFX = {
            dead: undefined,
            shot: undefined
        };
        this.debugText = "";
        this.justStarted = true;
        this.gameOver = false;
        this.score = 0;
        this.health = GAMESETTINGS.gameplay.startingHealth;
        this.matter.set60Hz();
    }

    create() {
        this.createSFX();
        this.createSoundtrack();
        this.createBackground();

        this.graphics = this.add.graphics();  // For primitive rendering

        this.worldBounds = this.createWorldBounds();
        this.ceilingAnchor = this.createCeilingAnchor();

        this.player = this.createPlayer(GAMESETTINGS.player.initialX, GAMESETTINGS.player.initialY);
        this.playerPivot = this.createPlayerPivot(this.player);
        this.web = this.playerShootWeb(GAMESETTINGS.player.initialX);
        this.player.setOnCollide(pair => { this.playerCollideHandler(pair); });

        // UI
        this.createUI();

        // Enable control via keyboard
        this.cursor = this.input.keyboard.createCursorKeys();

        // Enable camera following
        this.setupCamera();

        // Create and render debug info if specified in game settings object
        if (GAMESETTINGS.debug) { this.createDebugInfo(); }
    }

    update(time, delta) {
        super.update(time, delta);  // Default code suggestion, don't know why it works yet, maybe consult Phaser documentation?
        this.updateScore();
        this.updateWorldBounds();
        this.updatePlayer();
        this.renderPlayerWeb();
        this.updateHealth();

        // Check for game over
        if (this.gameOver) {
            this.scene.start('gameOver', { score: this.score });
        }

        // Update debug information if specified in game settings object
        if (GAMESETTINGS.debug) { this.updateDebugInfo(); }
    }


    /*
    ************************************
    * ----------CUSTOM METHODS-------- *
    ************************************/
    createSFX() {
        this.SFX.dead = this.sound.add('dead-sfx');
        this.SFX.shoot = this.sound.add('shoot-sfx');
    }

    createSoundtrack() {
        // TODO: Compose soundtrack for main game
    }

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
     * @returns {Phaser.Physics.Matter.Sprite && Phaser.GameObjects.GameObject}
     */
    createPlayer(x, y) {
        let player = this.matter.add.sprite(x, y, 'player')
            .setScale(GAMESETTINGS.scaleFactor)
            .setOrigin(0.5, 0)
            .setMass(GAMESETTINGS.player.mass);
        player.body.force = GAMESETTINGS.player.initialForce;
        player.body.restitution = 1;  // Enable bouncing

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
     * Player collision logic
     * @param {Phaser.Physics.Matter.Matter.Pair} pair
     * @return {Phaser.Physics.Matter.Matter.Pair}
     */
    playerCollideHandler(pair) {
        this.SFX.dead.play();

        if (this.webExist) {
            this.playerCutWeb(this.web);
        }

        if (--this.health < 1) {
            this.matter.pause();
            this.player.play('player-dead-anim');
            this.player.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.time.delayedCall(GAMESETTINGS.gameOverDelay, () => { this.gameOver = true });
            }, this);
        } else {
            this.player.play('player-hurt-anim');
            this.player.setTexture('player');
        }

        return pair;  // Provide streamlining of data. Read more about pair in MatterJS documentation.
    }

    /***
     * Create a pivot where the player sprite will shoot the spider web from
     * @param {Phaser.Physics.Matter.Sprite} playerObj
     * @returns {MatterJS.BodyType}
     */
    createPlayerPivot(playerObj) {
        let pivot = this.matter.add.circle(playerObj.x, playerObj.y, GAMESETTINGS.scaleFactor);
        let joint = this.matter.add.joint(playerObj, pivot, 0, 0.7);
        joint.pointA = {
            x: 0,
            y: -GAMESETTINGS.scaleFactor
        };

        // Turn off collision between player and pivot
        pivot.collisionFilter = { group: -1 };
        playerObj.collisionFilter = { group: -1 };

        return pivot;
    }

    /***
     * Create the ceiling collision box
     * @returns {[{Phaser.Physics.Matter.Sprite}]}
     */
    createWorldBounds() {
        let bounds = []

        // Set up the ceiling
        let ceilingX = 0;
        let ceilingY = -GAMESETTINGS.scaleFactor * 3;
        let ceilingWidth = this.game.scale.width * 10;  // For indefinite scrolling implementation. See function: updateCeilingCollision()
        let ceilingHeight = GAMESETTINGS.scaleFactor;

        /** @type {Phaser.Physics.Matter.Sprite} **/
        let ceiling = this.matter.add.sprite(ceilingX, ceilingY, 'bound');
        ceiling.setScale(ceilingWidth, ceilingHeight);
        ceiling.body.ignoreGravity = true;
        ceiling.body.isStatic = true;

        // Set up the floor
        let floorX = ceilingX
        let floorY = this.game.scale.height - ceilingY;
        let floorWidth = ceilingWidth
        let floorHeight = ceilingHeight;

        /** @type {Phaser.Physics.Matter.Sprite} **/
        let floor = this.matter.add.sprite(floorX, floorY, 'bound');
        floor.setScale(floorWidth, floorHeight);
        floor.body.ignoreGravity = true;
        floor.body.isStatic = true;

        // Set up the left wall
        let wallLeftX = -this.game.scale.width / 2;
        let wallLeftY = this.game.scale.height / 2;
        let wallLeftWidth = GAMESETTINGS.scaleFactor;
        let wallLeftHeight = GAMESETTINGS.scaleFactor;

        /** @type {Phaser.Physics.Matter.Sprite} **/
        let wallLeft = this.matter.add.sprite(wallLeftX, wallLeftY, 'bound-left');
        wallLeft.setScale(wallLeftWidth, wallLeftHeight);
        wallLeft.body.ignoreGravity = true;
        wallLeft.body.isStatic = true;

        // Return an array of sprites
        bounds.push(ceiling);
        bounds.push(floor);
        bounds.push(wallLeft);
        return bounds;
    }

    /***
     * Create and return a ceiling anchor
     * @returns {MatterJS.BodyType}
     */
    createCeilingAnchor() {
        /** @type {MatterJS.BodyType} **/
        let anchor = this.matter.add.rectangle(
            0, -GAMESETTINGS.scaleFactor * 3, GAMESETTINGS.scaleFactor, GAMESETTINGS.scaleFactor
        );
        anchor.ignoreGravity = true;
        anchor.isStatic = true;

        return anchor;
    }

    /***
     * Create the user interface to display current score and health
     */
    createUI() {
        WebFont.load({
            custom: {
                families: game.customFonts
            },
            active: () => {
                this.scoreText = this.add.text(
                    GAMESETTINGS.scaleFactor * 8,
                    GAMESETTINGS.scaleFactor * 4,
                    `${this.score}`,
                    {
                        color: '#919191',
                        fontFamily: 'Kenney Mini Square, Arial, sans-serif',
                        fontStyle: 'bold',
                        fontSize: GAMESETTINGS.scaleFactor * 10
                    }
                )
                    .setScrollFactor(0, 0)
                    .setBlendMode(Phaser.BlendModes.ADD);

                this.healthText = this.add.text(
                    GAMESETTINGS.scaleFactor * 8,
                    this.game.scale.height - GAMESETTINGS.scaleFactor * 12,
                    '',
                    {
                        color: '#b30000',
                        fontFamily: 'Kenney Mini Square, Arial, sans-serif',
                        fontStyle: 'bold',
                        fontSize: GAMESETTINGS.scaleFactor * 10,
                    }
                )
                    .setScrollFactor(0, 0)
                    .setBlendMode(Phaser.BlendModes.NORMAL);
            }
        });
    }

    /***
     * Configure the viewport to follow the player's character
     */
    setupCamera() {
        let offsetX = -(this.game.scale.width / 2) + GAMESETTINGS.player.initialX;
        let offsetY = -(this.game.scale.height / 2) + GAMESETTINGS.player.initialY;

        this.viewport = this.cameras.main;
        this.viewport.startFollow(
            this.player,
            true,
            1, 0,
            offsetX, offsetY
        );
    }

    /***
     * Create a player web (type MatterJS constraint) between the player character and a specified point on the ceiling
     * @param {number} anchorOffset
     * @returns {MatterJS.ConstraintType}
     */
    playerShootWeb(anchorOffset) {
        if (this.justStarted) {
            this.justStarted = false;
        } else {
            this.SFX.shoot.play();
        }

        this.webExist = true;
        let webLength = Math.sqrt(GAMESETTINGS.player.webOverhead ** 2 + this.player.y ** 2);
        let webObj = this.matter.add.constraint(this.playerPivot, this.ceilingAnchor, webLength);
        webObj.pointB = {
            x: anchorOffset,
            y: 0
        };
        return webObj;
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
        this.graphics.clear();

        if (this.webExist) {
            let lineThickness = GAMESETTINGS.scaleFactor
            let lineColor = GAMESETTINGS.player.webColor;

            this.graphics.lineStyle(lineThickness, lineColor, 1);
            this.graphics.lineBetween(
                this.web.pointB.x, this.web.pointB.y - GAMESETTINGS.scaleFactor * 3,
                this.player.x, this.player.y
            );
        }
    }

    /***
     * Update the current score (keep the highest score if the player swings backward)
     */
    updateScore() {
        let score = Math.floor((this.player.x - GAMESETTINGS.player.initialX) / GAMESETTINGS.gameplay.scoreFactor);
        if (this.score < score) {
            this.score = score;
            this.scoreText.text = `${this.score}`;
        }
    }

    updateHealth() {
        let healthTextValue = '';
        for (let i = 0; i < this.health; i++) {
            healthTextValue += '*';
        }

        if (this.healthText !== undefined) {
            try {
                this.healthText.text = healthTextValue;
            } catch (TypeError) {}
        }
    }

    /***
     * Update the world bounds collision boxes for indefinite scrolling (from left to right)
     */
    updateWorldBounds() {
        let targetX = this.viewport.scrollX - this.game.scale.width / 2;
        let bufferZone = GAMESETTINGS.player.initialX * 1.5;

        for (let i = 0; i < this.worldBounds.length; i++) {
            if (targetX > this.worldBounds[i].x + bufferZone) {
                this.worldBounds[i].setPosition(
                    targetX,
                    this.worldBounds[i].y
                );
            }
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
        if (control.left) {  // Left movement (with scaling difficulty)
            this.matter.applyForce(this.player.body, { x: -GAMESETTINGS.controlSensitivity * (this.score / 20 + 1), y: 0 });
        }
        if (control.right) {  // Right movement (with scaling difficulty)
            this.matter.applyForce(this.player.body, { x: GAMESETTINGS.controlSensitivity * (this.score / 20 + 1), y: 0 });
        }
        if (control.toggleWeb && this.webExist) {  // Cut web
            this.playerCutWeb(this.web);
        } else if (control.toggleWeb && !this.webExist) {  // Shoot web
            let playerX = Math.floor(this.player.x);
            let targetAnchorOffset;  // Set at undefined to catch errors when targetAnchorIdx is not set

            if (this.player.body.velocity.x > 0) {
                targetAnchorOffset = playerX + GAMESETTINGS.player.webOverhead;
            } else if (this.player.body.velocity.x < 0) {
                targetAnchorOffset = playerX - GAMESETTINGS.player.webOverhead;
            } else {
                targetAnchorOffset = playerX;
            }

            this.web = this.playerShootWeb(targetAnchorOffset);
        }
    }

    // =========================================== FOR DEBUGGING PURPOSES =========================================== //
    createDebugInfo() {
        this.debugTextObj = this.add.text(
            GAMESETTINGS.scaleFactor, GAMESETTINGS.scaleFactor, this.debugText, { color: "#cf00c4" }
        ).setScrollFactor(0);
    }

    updateDebugInfo() {
        this.debugText = "STATS FOR NERDS\n\n"
            + `gameOver = ${this.gameOver}\n`
            + `score = ${this.score}\n`
            + `health = ${this.health}\n`
            + '\n'
            + `player.x = ${this.player.x}\n`
            + `player.y = ${this.player.y}\n`
            + `webExist = ${this.webExist}\n`
            + `webLength = ${this.web.length}\n`
            + `ceilingAnchorOffset = ${this.web.pointB.x}\n`
            + '\n'
            + `viewport.scrollX = ${this.viewport.scrollX}\n`
            + `viewport.scrollY = ${this.viewport.scrollY}\n`
            + '\n'
            + `worldBounds[0].x = ${this.worldBounds[0].x}\n`
            + `worldBounds[0].y = ${this.worldBounds[0].y}\n`
            + `worldBounds[1].x = ${this.worldBounds[1].x}\n`
            + `worldBounds[1].y = ${this.worldBounds[1].y}\n`
            + `worldBounds[2].x = ${this.worldBounds[2].x}\n`
            + `worldBounds[2].y = ${this.worldBounds[2].y}\n`
        ;
        this.debugTextObj.text = this.debugText;
    }
    /* End of custom methods */
}
