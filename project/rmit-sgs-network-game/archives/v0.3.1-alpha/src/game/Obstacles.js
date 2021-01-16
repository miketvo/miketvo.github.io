import GAMESETTINGS from "../settings.js";
import Obstacle from "./Obstacle.js";


export default class Obstacles extends Array {
    /***
     * Create a specified number of obstacles according to parameters and settings.js specifications.
     * @param {Phaser.Physics.Matter.World} world
     * @param {number} obstaclesNumber
     * @param {number} minimumGap
     * @param {number} maximumGap
     * @param {number} yDeviation
     * @return {Obstacles}
     */
    constructor(world, obstaclesNumber, minimumGap, maximumGap, yDeviation) {
        super(0);
        for (let i = 0; i < obstaclesNumber; i++) {
            // Generate random height and gap according to settings.js
            let randomObstacleY = this.genRandomObstacleY(
                minimumGap,
                maximumGap,
            );
            let currentYDeviation = Phaser.Math.Between(-yDeviation, yDeviation) * GAMESETTINGS.scaleFactor;

            // Generate 2 obstacle objects and place them at the generated random height and gap
            /** @type {Obstacle} **/
            let obstacle1 = new Obstacle(  // Upper obstacle
                world,
                (GAMESETTINGS.gameplay.initialSafeZone + i * GAMESETTINGS.gameplay.distanceBetweenObstacles) * GAMESETTINGS.scaleFactor,
                randomObstacleY.y1 * GAMESETTINGS.scaleFactor + currentYDeviation,
                false
            );
            /** @type {Obstacle} **/
            let obstacle2 = new Obstacle(  // Lower obstacle
                world,
                obstacle1.x,
                randomObstacleY.y2 * GAMESETTINGS.scaleFactor + currentYDeviation,
                false
            );

            // Adjust center offset
            obstacle1.setPosition(obstacle1.x + obstacle1.displayWidth / 2, obstacle1.y - obstacle1.displayHeight / 2);
            obstacle2.setPosition(obstacle2.x + obstacle2.displayWidth / 2, obstacle2.y + obstacle2.displayHeight / 2);

            // Append them to the obstacles arrays
            this.push({
                ceilingObstacle: obstacle1,
                floorObstacle: obstacle2
            });
        }
        return this;
    }

    /***
     * Return the ceiling obstacle above the player with specified x offset.
     * @param {Phaser.Physics.Matter.Sprite} sprite
     * @param {number} xOffset
     * @return {Phaser.Physics.Matter.Image}
     */
    getObstacleAbove(sprite, xOffset) {
        let obstaclesInfo = this.getObstaclesInfo();
        obstaclesInfo = this.sortObstaclesInfo(obstaclesInfo);

        let resultObstacleIdx;
        for (let i = 0; i < obstaclesInfo.length; i++) {
            if (obstaclesInfo[i].x <= sprite.x + xOffset) {
                resultObstacleIdx = obstaclesInfo[i].index;
            }
        }
        if (this[resultObstacleIdx] === undefined) {
            return undefined;
        }
        return this[resultObstacleIdx].ceilingObstacle;
    }

    /***
     * Calculate the information regarding this obstacles' index and x position.
     * @return {[]}
     */
    getObstaclesInfo() {
        let obstaclesInfo = [];
        for (let i = 0; i < this.length; i++) {
            let singleObstacleInfo = {
                x: this[i].ceilingObstacle.body.vertices[0].x,
                index: i
            }
            obstaclesInfo.push(singleObstacleInfo);
        }
        return obstaclesInfo
    }

    /***
     * Insertion sort.
     * @param obstaclesInfo
     * @return {[]}
     */
    sortObstaclesInfo(obstaclesInfo) {
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
     * Generate random y coordinates to aid with obstacle creation and update.
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
}
