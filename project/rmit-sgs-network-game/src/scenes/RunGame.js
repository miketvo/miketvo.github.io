import GAMESETTINGS from "../settings.js";
import game from "../game.js";
import Obstacles from "../game/Obstacles.js";
import Bomb from "../game/Bomb.js";


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

    /** @type {number} **/
    highScore;

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

    /** @type {Obstacles} **/
    obstacles;

    /** @type {Bomb} **/
    bomb;

    /** @type {number} **/
    obstaclesYDeviation;

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

    /** @type {Phaser.Input.Pointer} **/
    touch;

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
        this.bomb = undefined;
        this.obstacles = undefined;
        this.obstaclesYDeviation = 0;
        this.minimumGap = GAMESETTINGS.gameplay.maximumGap;
        this.maximumGap = GAMESETTINGS.gameplay.maximumGap;
        this.justStarted = true;
        this.firstPlayerInput = true;
        this.gameOver = false;
        this.score = 0;
        this.highScore = localStorage['highscore'];
        if (!this.highScore) { this.highScore = 0 }
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
        this.player.setOnCollide(pair => { this.playerCollisionHandler(pair); });

        this.createFilterFX();

        // UI
        this.createUI();

        // Enable control via keyboard
        this.cursor = this.input.keyboard.createCursorKeys();

        // Enable control via mouseclick
        this.pointer = this.input.activePointer;

        // Enable touch control
        this.touch = this.input.pointer1;

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
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage['highscore'] = this.highScore;
            }

            this.cleanUp();

            this.scene.start('gameOver', {
                score: this.score, highScore: this.highScore
            });
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
     * @returns {Phaser.GameObjects.Sprite}
     */
    createBackground() {
        let background = this.add.sprite(0, this.scale.height / 2, 'background')
            .setScale(GAMESETTINGS.scaleFactor)
            .setScrollFactor(1, 1)
            .setOrigin(0, 0.5);
        if (!GAMESETTINGS.debug) { background.play('background-anim'); }
        background.setAlpha(0.25);
        return background;
    }

    /***
     * Create the obstacles
     */
    createObstacles() {
        this.obstacles = new Obstacles(
            this.matter.world,
            GAMESETTINGS.gameplay.obstacleOverhead,
            this.minimumGap,
            this.maximumGap,
            this.obstaclesYDeviation
        );
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
        player.body.restitution = GAMESETTINGS.player.bounce;  // Enable bouncing

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
    playerCollisionHandler(pair) {
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

        return pair;  // Provide streamlining of collision data. Read more about pair in MatterJS documentation.
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

    /***
     * Image post-processing effects
     * @return {Phaser.GameObjects.Sprite}
     */
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
                        color: GAMESETTINGS.UI.scoreColor,
                        stroke: GAMESETTINGS.UI.scoreStroke,
                        strokeThickness: 12,
                        fontFamily: 'Kenney Mini Square, Arial, sans-serif',
                        fontStyle: 'normal',
                        fontSize: GAMESETTINGS.scaleFactor * 10
                    }
                )
                    .setScrollFactor(0, 0)
                    .setBlendMode(Phaser.BlendModes.NORMAL);

                this.healthText = this.add.text(
                    GAMESETTINGS.scaleFactor * 8,
                    this.game.scale.height - GAMESETTINGS.scaleFactor * 12,
                    '',
                    {
                        color: GAMESETTINGS.UI.healthColor,
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
        obstacleAbovePlayer = this.obstacles.getObstacleAbove(this.player, xOffset);
        if (obstacleAbovePlayer !== undefined) {
            anchorOffsetY = obstacleAbovePlayer.body.vertices[3].y + GAMESETTINGS.scaleFactor * 3;  // TODO: find out why this works
        }

        // Shoot the web
        this.webExist = true;
        let webLength = Math.sqrt(xOffset ** 2 + (this.player.y - anchorOffsetY) ** 2);
        let webObj = this.matter.add.constraint(this.playerPivot, this.ceilingAnchor, webLength, GAMESETTINGS.player.webStiffness);
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
            if (this.score > this.highScore) {
                this.scoreText.text += ' HI';
            }

            // Update scaling difficulty
            if (this.minimumGap > GAMESETTINGS.gameplay.minimumGap) {
                this.minimumGap -= score / GAMESETTINGS.gameplay.scalingDifficultyFactor;
                if (this.minimumGap < GAMESETTINGS.gameplay.minimumGap) {
                    this.minimumGap = GAMESETTINGS.gameplay.minimumGap;
                }
            } else {
                this.minimumGap = GAMESETTINGS.gameplay.minimumGap;
            }
            if (this.obstaclesYDeviation < GAMESETTINGS.gameplay.obstaclesYDeviation) {
                this.obstaclesYDeviation += score / GAMESETTINGS.gameplay.scalingDifficultyFactor;
            } else {
                this.obstaclesYDeviation = GAMESETTINGS.gameplay.obstaclesYDeviation;
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
            let currentObstacle = this.obstacles[i];

            // Update dynamic obstacles
            if (currentObstacle.ceilingObstacle.dynamic) {
                currentObstacle.ceilingObstacle.updateDynamic();
                currentObstacle.floorObstacle.updateDynamic();

                // Update moving direction
                if (
                    currentObstacle.ceilingObstacle.body.vertices[0].y > 0 ||
                    currentObstacle.floorObstacle.body.vertices[3].y < this.game.scale.height
                ) {
                    currentObstacle.ceilingObstacle.velocity *= -1;
                    currentObstacle.floorObstacle.velocity *= -1;
                }

                // Update this.web anchor yOffset according to current obstacle
                if (
                    currentObstacle.ceilingObstacle.body.vertices[3].x <= this.web.pointB.x &&
                    this.web.pointB.x <= currentObstacle.ceilingObstacle.body.vertices[2].x
                ) {
                    this.web.pointB.y = currentObstacle.ceilingObstacle.body.vertices[3].y;
                }
            }

            // Obstacle generation
            if (currentObstacle.ceilingObstacle.body.vertices[0].x + this.bufferZone < this.viewport.scrollX) {
                // Find the rightmost obstacle
                /** @type {Phaser.Physics.Matter.Image} **/
                let rightmostObstacle = this.obstacles[0].ceilingObstacle;
                for (let j = 0; j < this.obstacles.length; j++) {
                    if (this.obstacles[j].ceilingObstacle.x > rightmostObstacle.x) {
                        rightmostObstacle = this.obstacles[j].ceilingObstacle;
                    }
                }

                // Move the unused obstacle to the front and set its Y values to random according to game settings
                let currentObstacleYDeviation = Phaser.Math.Between(-this.obstaclesYDeviation, this.obstaclesYDeviation) * GAMESETTINGS.scaleFactor;
                let randomObstacleY = this.obstacles.genRandomObstacleY(this.minimumGap, this.maximumGap);
                currentObstacle.ceilingObstacle.setPosition(
                    rightmostObstacle.x + GAMESETTINGS.gameplay.distanceBetweenObstacles * GAMESETTINGS.scaleFactor,
                    randomObstacleY.y1 * GAMESETTINGS.scaleFactor - currentObstacle.ceilingObstacle.displayHeight / 2 + currentObstacleYDeviation
                );
                currentObstacle.floorObstacle.setPosition(
                    rightmostObstacle.x + GAMESETTINGS.gameplay.distanceBetweenObstacles * GAMESETTINGS.scaleFactor,
                    randomObstacleY.y2 * GAMESETTINGS.scaleFactor + currentObstacle.ceilingObstacle.displayHeight / 2 + currentObstacleYDeviation
                );

                //  Randomly generate dynamic obstacle with random direction of y movement, chance of generation specified in settings.js as dynamicObstacleChance
                if (Phaser.Math.Between(1, 1 / GAMESETTINGS.gameplay.dynamicObstacleChance) === 1) {
                    let direction = Phaser.Math.Between(0, 1)
                    if (direction) {
                        direction = -1;
                    } else {
                        direction = 1;
                    }
                    currentObstacle.ceilingObstacle.velocity = GAMESETTINGS.gameplay.dynamicObstacleVelocity * GAMESETTINGS.scaleFactor * direction;
                    currentObstacle.floorObstacle.velocity = GAMESETTINGS.gameplay.dynamicObstacleVelocity * GAMESETTINGS.scaleFactor * direction;
                    currentObstacle.ceilingObstacle.dynamic = true;
                    currentObstacle.floorObstacle.dynamic = true;
                }

                // Randomly generate bomb. Generation chance: bombChance in settings.js
                if (Phaser.Math.Between(1, 1 / GAMESETTINGS.gameplay.bombChance) === 1 && !currentObstacle.ceilingObstacle.dynamic) {
                    if (this.bomb !== undefined) {
                        if (this.bomb.exploded) { this.bomb.reset(); }
                        this.bomb.setPosition(
                            currentObstacle.ceilingObstacle.x,
                            (currentObstacle.ceilingObstacle.y + currentObstacle.floorObstacle.y) / 2
                        );
                    } else {
                        this.bomb = new Bomb(
                            this.matter.world,
                            currentObstacle.ceilingObstacle.x,
                            (currentObstacle.ceilingObstacle.y + currentObstacle.floorObstacle.y) / 2
                        );
                        this.bomb.setOnCollide(pair => { this.bomb.collisionHandler(pair); });
                    }
                }
            }
        }
    }

    /***
     * Update the player character's properties according to player input
     */
    updatePlayer() {
        // -------------------------------- Categorize inputs -------------------------------- //
        const control = {
            left:
                this.cursor.left.isDown ||
                (this.pointer.isDown && this.pointer.x < this.scale.width / 2) ||
                (this.touch.isDown && this.touch.x < this.scale.width / 2),
            right:
                this.cursor.right.isDown ||
                (this.pointer.isDown && this.pointer.x > this.scale.width / 2) ||
                (this.touch.isDown && this.touch.x > this.scale.width / 2),
        };

        // -------------------------------- Apply input to player character -------------------------------- //
        if (control.left && !control.right) {  // Left movement (with scaling difficulty)
            this.matter.applyForce(this.player.body, { x: -(GAMESETTINGS.controlSensitivity * GAMESETTINGS.scaleFactor ** 2 / 8) * (this.score / 20 + 1), y: 0 });  // This formula produces consistent force scaling with scaleFactor
            if (!this.webExist) {
                this.web = this.playerShootWeb(-GAMESETTINGS.player.webOverhead * GAMESETTINGS.scaleFactor);
            }
        } else if (control.right && !control.left) {  // Right movement (with scaling difficulty)
            this.matter.applyForce(this.player.body, { x: (GAMESETTINGS.controlSensitivity * GAMESETTINGS.scaleFactor ** 2 / 8) * (this.score / 20 + 1), y: 0 });  // This formula produces consistent force scaling with scaleFactor
            if (!this.webExist) {
                this.web = this.playerShootWeb(GAMESETTINGS.player.webOverhead * GAMESETTINGS.scaleFactor);
            }
        } else if (!control.left && !control.right && this.webExist && !this.firstPlayerInput) {  // Cut web
            this.playerCutWeb(this.web);
        }

        // Check if this is the first player interaction with the game
        if (this.firstPlayerInput && (this.cursor.left.isDown || this.cursor.right.isDown || this.pointer.isDown || this.touch.isDown)) {
            this.firstPlayerInput = false;
        }
    }

    /***
     * Clear the physics junks
     */
    cleanUp() {
        this.matter.world.remove(this.player, true);
        this.matter.world.removeConstraint(this.web, true);
        if (this.bomb !== undefined) {
            this.matter.world.remove(this.bomb);
        }
        for (let i = 0; i < this.obstacles.length; i++) {
            this.matter.world.remove(this.obstacles[i].ceilingObstacle);
            this.matter.world.remove(this.obstacles[i].floorObstacle);
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
            + `highScore = ${this.highScore}\n`
            + `minimumGap = ${this.minimumGap}\n`
            + `maximumGap = ${this.maximumGap}\n`
            + `health = ${this.health}\n`
            + '\n'
            + `cursor.left.isDown = ${this.cursor.left.isDown}\n`
            + `cursor.right.isDown = ${this.cursor.right.isDown}\n`
            + `pointer.x = ${this.pointer.x}\n`
            + `pointer.isDown = ${this.pointer.isDown}\n`
            + `touch.x = ${this.touch.x}\n`
            + `touch.isDown = ${this.touch.isDown}\n`
            + '\n'
            + `player.x = ${this.player.x}\n`
            + `player.y = ${this.player.y}\n`
            + `player.velocity.x = ${this.player.body.velocity.x}\n`
            + `player.velocity.y = ${this.player.body.velocity.y}\n`
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
            + '\n'
            + `obstaclesYDeviation = ${this.obstaclesYDeviation}\n`
            + `minimumGap = ${this.minimumGap}\n`
            + `maximumGap = ${this.maximumGap}\n`
        ;
        this.debugTextObj.text = this.debugText;
    }
    /* End of custom methods */
}
