import GAMESETTINGS from "../settings.js";
import game from "../game.js";


/***
 * Start screen class
 */
export default class StartScreen extends Phaser.Scene {
    constructor() {
        super("startScreen");
    }


    /*
    *************************************
    * ---------CUSTOM PROPERTIES------- *
    *************************************
     */
    /** @type {MatterJS.BodyType} **/
    ceilingAnchor;

    /** @type {Phaser.Physics.Matter.Sprite} **/
    player;

    /** @type {MatterJS.BodyType} **/
    playerPivot;

    /** @type {MatterJS.ConstraintType} **/
    web;

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} **/
    cursor;
    /* End of custom properties */


    init() {
        this.justStarted = true;
        this.firstPlayerInput = true;
    }

    create() {
        let portraitMode = screen.availHeight > screen.availWidth;

        this.graphics = this.add.graphics();  // For primitive rendering

        this.ceilingAnchor = this.matter.add.rectangle(
            0, -GAMESETTINGS.scaleFactor * 3, GAMESETTINGS.scaleFactor, GAMESETTINGS.scaleFactor
        );
        this.ceilingAnchor.ignoreGravity = true;
        this.ceilingAnchor.isStatic = true;

        if (portraitMode) {
            this.player = this.matter.add.sprite(this.game.scale.width / 2, 0, 'player');
        } else {
            this.addMessage();
            this.player = this.matter.add.sprite(
                GAMESETTINGS.player.initialX * GAMESETTINGS.scaleFactor,
                GAMESETTINGS.player.initialY,
                'player');
        }

        this.player
            .setInteractive()
            .setScale(GAMESETTINGS.scaleFactor)
            .setOrigin(0.5, 0)
            .setVelocity(0, 0)
            .setMass(GAMESETTINGS.player.mass * GAMESETTINGS.scaleFactor);
        this.player.collisionFilter = { group: -1 };

        this.playerPivot = this.matter.add.circle(this.player.x, this.player.y, GAMESETTINGS.scaleFactor);
        this.playerPivot.collisionFilter = { group: -1 };

        let joint = this.matter.add.joint(this.player, this.playerPivot, 0, 0.7);
        joint.pointA = {
            x: 0,
            y: -GAMESETTINGS.scaleFactor
        };

        this.web = this.matter.add.constraint(this.playerPivot, this.ceilingAnchor, 0);

        if (portraitMode) {
            this.player.setY(this.game.scale.height - this.player.displayHeight * 2);
            this.web.pointB = {
                x: this.scale.width / 2,
                y: 0
            };
        } else {
            this.player.setPosition(
                GAMESETTINGS.player.initialX * GAMESETTINGS.scaleFactor,
                GAMESETTINGS.player.initialY * GAMESETTINGS.scaleFactor
            );
            this.web.pointB = {
                x: this.player.x,
                y: 0
            };
        }
        this.web.length = this.player.y;

        //  Start game when user clicks/touches the spider
        this.input.on('gameobjectup', () => {
            this.startGame();
        }, this);

        // Enable keyboard input to start game
        this.cursor = this.input.keyboard.createCursorKeys();
    }

    update(time, delta) {
        super.update(time, delta);
        this.renderPlayerWeb();
        if (this.cursor.left.isDown || this.cursor.right.isDown) { this.startGame(); }
    }


    /*
    ************************************
    * ----------CUSTOM METHODS-------- *
    ************************************/
    /***
     * Add the connection error message
     */
    addMessage() {
        WebFont.load({
            custom: {
                families: game.customFonts
            },
            active: () => {
                let h1Style = {
                    color: '#6f6f6f',
                    fontFamily: "Kenney Blocks",
                    fontSize: 9 * GAMESETTINGS.scaleFactor,
                };
                let pStyle = {
                    color: '#999999',
                    fontFamily: "Kenney Pixel",
                    fontSize: 7 * GAMESETTINGS.scaleFactor,
                };

                let h1 = this.add.text(0, 0, "OOPS!", h1Style);
                let p = this.add.text(0, 0, "We have a bug\nError: CONNECTION_TIMED_OUT", pStyle);

                h1.setPosition(this.game.scale.width / 3, 12 * GAMESETTINGS.scaleFactor);
                p.setPosition(this.game.scale.width / 3, 30 * GAMESETTINGS.scaleFactor);

            }
        });
    }

    /***
     * Render the web on screen. This needs to be done manually.
     */
    renderPlayerWeb() {
        this.graphics.clear();

        let lineThickness = GAMESETTINGS.scaleFactor
        let lineColor = GAMESETTINGS.player.webColor;

        this.graphics.lineStyle(lineThickness, lineColor, 1);
        this.graphics.lineBetween(
            this.web.pointB.x, this.web.pointB.y - GAMESETTINGS.scaleFactor * 3,
            this.player.x, this.player.y
        );
    }

    startGame() {
        this.scene.start('runGame');
    }
    /* End of custom methods */
}
