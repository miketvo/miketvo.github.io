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
    firstPlayerInput;

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

    /** @type {number} **/
    bufferZone;

    /** @type {MatterJS.BodyType} **/
    ceilingAnchor;

    /** @type {Phaser.Physics.Matter.Image[]}[] **/
    obstacles;

    /** @type {number} **/
    minimumGap;

    /** @type {number} **/
    maximumGap;

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
        this.bufferZone = GAMESETTINGS.player.initialX * GAMESETTINGS.scaleFactor * 1.5;
        this.obstacles = [];
        this.minimumGap = GAMESETTINGS.gameplay.maximumGap;
        this.maximumGap = GAMESETTINGS.gameplay.maximumGap - GAMESETTINGS.gameplay.scalingDifficultyFactor;
        this.justStarted = true;
        this.firstPlayerInput = true;
        this.gameOver = false;
        this.score = 0;
        this.health = GAMESETTINGS.gameplay.startingHealth;
        this.matter.set60Hz();
    }

    create() {
        this.createSFX();
        this.createSoundtrack();
        this.createBackground();
        this.createObstacles();

        this.graphics = this.add.graphics();  // For primitive rendering

        this.worldBounds = this.createWorldBounds();
        this.ceilingAnchor = this.createCeilingAnchor();

        this.player = this.createPlayer(GAMESETTINGS.player.initialX * GAMESETTINGS.scaleFactor, GAMESETTINGS.player.initialY * GAMESETTINGS.scaleFactor);
        this.playerPivot = this.createPlayerPivot(this.player);
        this.web = this.playerShootWeb(0);
        this.player.setOnCollide(pair => { this.playerCollideHandler(pair); });

        this.createFilterFX();

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
        this.updateObstacles();
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
    /***
     * Create the SFX
     */
    createSFX() {
        this.SFX.dead = this.sound.add('dead-sfx');
        this.SFX.shoot = this.sound.add('shoot-sfx');
    }

    /***
     * Create the soundtrack
     */
    createSoundtrack() {
        // TODO: Compose soundtrack for main game
    }

    /***
     * Create the background
     * @returns {Phaser.GameObjects.Image}
     */
    createBackground() {
        return this.add.image(0, 0, 'background')
            .setScale(GAMESETTINGS.scaleFactor)
            .setScrollFactor(1, 1)
            .setOrigin(0, 0);
    }

    /***
     * Generate a random pair of Y coordinates for use of Obstacles generation
     * @param {number} minGap
     * @param {number} maxGap
     * @return {{y1: number, y2: number}}
     */
    genRandomObstacleY(minGap, maxGap) {
        let result = {
            y1: 0,
            y2: 0
        }
        result.y1 = Phaser.Math.Between(0, GAMESETTINGS.nativeHeight - minGap);
        result.y2 = result.y1 + Phaser.Math.Between(minGap, maxGap);

        return result;
    }

    /***
     * Create the obstacles
     */
    createObstacles() {
        for (let i = 0; i < GAMESETTINGS.gameplay.obstacleOverhead; i++) {
            // Generate random height and gap according to settings.js
            let randomObstacleY = this.genRandomObstacleY(this.minimumGap, this.maximumGap);

            // Generate 2 obstacle objects and place them at the generated random height and gap
            /** @type {Phaser.Physics.Matter.Image && Phaser.GameObjects.GameObject} **/
            let obstacle1 = this.matter.add.image(  // Upper obstacle
                (GAMESETTINGS.gameplay.initialSafeZone + i * GAMESETTINGS.gameplay.distanceBetweenObstacles) * GAMESETTINGS.scaleFactor,
                randomObstacleY.y1 * GAMESETTINGS.scaleFactor,
                'obstacle')
                .setScale(GAMESETTINGS.scaleFactor, GAMESETTINGS.scaleFactor)
                .setStatic(true);
            /** @type {Phaser.Physics.Matter.Image && Phaser.GameObjects.GameObject} **/
            let obstacle2 = this.matter.add.image(  // Lower obstacle
                obstacle1.x,
                randomObstacleY.y2 * GAMESETTINGS.scaleFactor,
                'obstacle')
                .setScale(GAMESETTINGS.scaleFactor, GAMESETTINGS.scaleFactor)
                .setStatic(true);

            // Adjust center offset
            obstacle1.setPosition(obstacle1.x + obstacle1.displayWidth / 2, obstacle1.y - obstacle1.displayHeight / 2);
            obstacle2.setPosition(obstacle2.x + obstacle2.displayWidth / 2, obstacle2.y + obstacle2.displayHeight / 2);

            // Append them to the obstacles arrays
            this.obstacles.push([obstacle1, obstacle2]);
        }
    }

    /***
     * Create a player sprite at the specified xy coordinates
     * @param {number} x
     * @param {number} y
     * @returns {Phaser.Physics.Matter.Sprite || Phaser.GameObjects.GameObject}
     */
    createPlayer(x, y) {
        let player = this.matter.add.sprite(x, y, 'player')
            .setScale(GAMESETTINGS.scaleFactor)
            .setOrigin(0.5, 0)
            .setVelocity(0, 0)
            .setMass(GAMESETTINGS.player.mass * GAMESETTINGS.scaleFactor);
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
        let floorX = ceilingX;
        let floorY = this.game.scale.height - ceilingY;
        let floorWidth = ceilingWidth;
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

    createFilterFX() {
        return this.add.sprite(
            GAMESETTINGS.nativeWidth / 2 * GAMESETTINGS.scaleFactor,
            GAMESETTINGS.nativeHeight / 2 * GAMESETTINGS.scaleFactor,
            'vignette')
            .setScale(GAMESETTINGS.scaleFactor)
            .setAlpha(0.05)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setScrollFactor(0, 0)
            .play('vignette-anim');
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
        let offsetX = -(this.game.scale.width / 2) + GAMESETTINGS.player.initialX * GAMESETTINGS.scaleFactor;
        let offsetY = -(this.game.scale.height / 2) + GAMESETTINGS.player.initialY * GAMESETTINGS.scaleFactor;

        this.viewport = this.cameras.main;
        this.viewport.startFollow(
            this.player,
            true,
            1, 0,
            offsetX, offsetY
        );
    }

    /***
     * Create a player web (type MatterJS constraint) between the player character and a specified x offset on the ceiling
     * @param {number} xOffset
     * @returns {MatterJS.ConstraintType}
     */
    playerShootWeb(xOffset) {
        // Sound effect
        if (this.justStarted) {
            this.justStarted = false;
        } else {
            this.SFX.shoot.play();
        }

        // Set up variables and constants for calculations
        const playerX = Math.floor(this.player.x);
        let anchorOffsetX;
        let anchorOffsetY = 0;
        let obstacleAbovePlayer;

        // Calculate targetAnchorOffsetX and targetAnchorOffsetY
        anchorOffsetX = playerX + xOffset;
        obstacleAbovePlayer = this.getObstacleAbovePlayer(GAMESETTINGS.player.webOverhead * GAMESETTINGS.scaleFactor);
        if (obstacleAbovePlayer !== undefined) {
            anchorOffsetY = obstacleAbovePlayer.body.vertices[3].y + GAMESETTINGS.scaleFactor * 3;  // TODO: find out why this works
        }

        // Shoot the web
        this.webExist = true;
        let webLength = Math.sqrt(xOffset ** 2 + (this.player.y - anchorOffsetY) ** 2);
        let webObj = this.matter.add.constraint(this.playerPivot, this.ceilingAnchor, webLength);
        webObj.pointB = {
            x: anchorOffsetX,
            y: anchorOffsetY
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
        let score = Math.floor((this.player.x - GAMESETTINGS.player.initialX * GAMESETTINGS.scaleFactor) / GAMESETTINGS.gameplay.scoreFactor);
        if (this.score < score) {
            this.score = score;
            this.scoreText.text = `${this.score}`;

            // Update scaling difficulty
            if (this.minimumGap > GAMESETTINGS.gameplay.minimumGap) {
                this.minimumGap -= GAMESETTINGS.gameplay.scalingDifficultyFactor;
                if (this.minimumGap < GAMESETTINGS.gameplay.minimumGap) {
                    this.minimumGap = GAMESETTINGS.gameplay.minimumGap;
                }
            }
        }
    }

    /***
     * Update the health UI
     */
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

        for (let i = 0; i < this.worldBounds.length; i++) {
            if (targetX > this.worldBounds[i].x + this.bufferZone) {
                this.worldBounds[i].setPosition(
                    targetX,
                    this.worldBounds[i].y
                );
            }
        }
    }

    /***
     * Endless obstacles generation
     */
    updateObstacles() {
        for (let i = 0; i < this.obstacles.length; i++) {
            if (this.obstacles[i][0].body.vertices[0].x + this.bufferZone < this.viewport.scrollX) {
                // Find the rightmost obstacle
                /** @type {Phaser.Physics.Matter.Image} **/
                let rightmostObstacle = this.obstacles[0][0];
                for (let j = 0; j < this.obstacles.length; j++) {
                    if (this.obstacles[j][0].x > rightmostObstacle.x) {
                        rightmostObstacle = this.obstacles[j][0];
                    }
                }

                // Move the unused obstacle to the front and set its Y values to random according to game settings
                let randomObstacleY = this.genRandomObstacleY(this.minimumGap, this.maximumGap);
                this.obstacles[i][0].setPosition(
                    rightmostObstacle.x + GAMESETTINGS.gameplay.distanceBetweenObstacles * GAMESETTINGS.scaleFactor,
                    randomObstacleY.y1 * GAMESETTINGS.scaleFactor - this.obstacles[i][0].displayHeight / 2
                );
                this.obstacles[i][1].setPosition(
                    rightmostObstacle.x + GAMESETTINGS.gameplay.distanceBetweenObstacles * GAMESETTINGS.scaleFactor,
                    randomObstacleY.y2 * GAMESETTINGS.scaleFactor + this.obstacles[i][0].displayHeight / 2
                );
            }
        }
    }

    getObstaclesInfo() {
        let obstaclesInfo = [];
        for (let i = 0; i < this.obstacles.length; i++) {
            let singleObstacleInfo = {
                x: this.obstacles[i][0].body.vertices[0].x,
                index: i
            }
            obstaclesInfo.push(singleObstacleInfo);
        }
        return obstaclesInfo
    }

    sortObstaclesInfo(obstaclesInfo) {  // Insertion sort
        for (let i = 0; i < obstaclesInfo.length; i++) {
            while (i > 0 && obstaclesInfo[i].x < obstaclesInfo[i - 1].x) {
                // Swap using JS destructure assignment
                [
                    obstaclesInfo[i], obstaclesInfo[i - 1]
                ] = [
                    obstaclesInfo[i - 1], obstaclesInfo[i]
                ];
                i--;
            }
        }
        return obstaclesInfo;
    }

    /***
     * Return the ceiling obstacle above the player with specified x offset
     * @param xOffset
     * @return {Phaser.Physics.Matter.Image}
     */
    getObstacleAbovePlayer(xOffset) {
        let obstaclesInfo = this.getObstaclesInfo();
        obstaclesInfo = this.sortObstaclesInfo(obstaclesInfo);

        let resultObstacleIdx;
        for (let i = 0; i < obstaclesInfo.length; i++) {
            if (obstaclesInfo[i].x <= this.player.x + xOffset) {
                resultObstacleIdx = obstaclesInfo[i].index;
            }
        }
        return this.obstacles[resultObstacleIdx][0];
    }

    /***
     * Update the player character's properties according to player input
     */
    updatePlayer() {
        // -------------------------------- Categorize inputs -------------------------------- //
        let control = {
            left: this.cursor.left.isDown,
            right: this.cursor.right.isDown,
        };

        // -------------------------------- Apply input to player character -------------------------------- //
        if (control.left && !control.right) {  // Left movement (with scaling difficulty)
            if (this.firstPlayerInput) {
                this.firstPlayerInput = false;
            }
            this.matter.applyForce(this.player.body, { x: -(GAMESETTINGS.controlSensitivity * GAMESETTINGS.scaleFactor ** 2 / 8) * (this.score / 20 + 1), y: 0 });  // This formula produces consistent force scaling with scaleFactor
            if (!this.webExist) {
                this.web = this.playerShootWeb(-GAMESETTINGS.player.webOverhead * GAMESETTINGS.scaleFactor);
            }
        } else if (control.right && !control.left) {  // Right movement (with scaling difficulty)
            if (this.firstPlayerInput) {
                this.firstPlayerInput = false;
            }
            this.matter.applyForce(this.player.body, { x: (GAMESETTINGS.controlSensitivity * GAMESETTINGS.scaleFactor ** 2 / 8) * (this.score / 20 + 1), y: 0 });  // This formula produces consistent force scaling with scaleFactor
            if (!this.webExist) {
                this.web = this.playerShootWeb(GAMESETTINGS.player.webOverhead * GAMESETTINGS.scaleFactor);
            }
        } else if (!control.left && !control.right && this.webExist && !this.firstPlayerInput) {  // Cut web
            this.playerCutWeb(this.web);
        }
    }

    // =========================================== FOR DEBUGGING PURPOSES =========================================== //
    createDebugInfo() {
        this.debugTextObj = this.add.text(
            GAMESETTINGS.scaleFactor, GAMESETTINGS.scaleFactor, this.debugText, {
                color: "#cf00c4",
                fontSize: 2 * GAMESETTINGS.scaleFactor
            }
        ).setScrollFactor(0);
    }

    updateDebugInfo() {
        this.debugText = "STATS FOR NERDS\n\n"
            + `gameOver = ${this.gameOver}\n`
            + `score = ${this.score}\n`
            + `minimumGap = ${this.minimumGap}\n`
            + `maximumGap = ${this.maximumGap}\n`
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
