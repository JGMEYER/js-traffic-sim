import { Direction } from '../../util/Direction';

const CLEAR_TIME_DURATION = 1000; // ms
const WAIT_TIME_DURATION = 1000; // ms

/**
 * An Intersection construct that determines how Vehicles pass between
 * intersection TravelNodes in the TravelGraph.
 *
 * Behaves as if all segment directions have a stop sign.
 */
export class Intersection {
    /**
     * Constructor
     */
    constructor() {
        this.vehicles = {}
        this.vehicles[Direction.UP] = null;
        this.vehicles[Direction.RIGHT] = null;
        this.vehicles[Direction.DOWN] = null;
        this.vehicles[Direction.LEFT] = null;

        this.waitTimersMillisec = {}
        this.waitTimersMillisec[Direction.UP] = 0;
        this.waitTimersMillisec[Direction.RIGHT] = 0;
        this.waitTimersMillisec[Direction.DOWN] = 0;
        this.waitTimersMillisec[Direction.LEFT] = 0;

        // Array for tracking which direction to dequeue next.
        this._dequeueOrder = [
            Direction.UP,
            Direction.RIGHT,
            Direction.DOWN,
            Direction.LEFT,
        ]

        // Timer to give vehicle in the middle of the intersection time to
        // leave the intersection before dequeuing the next vehicle in the
        // intersection.
        this._clearTimer = 0
    }

    static get CLEAR_TIME_DURATION() {
        return CLEAR_TIME_DURATION;
    }

    static get WAIT_TIME_DURATION() {
        return WAIT_TIME_DURATION;
    }

    /**
     * Add Vehicle to direction queue.
     * @param {Vehicle} vehicle
     * @param {Direction} direction
     */
    enqueue(vehicle, direction) {
        this.waitTimersMillisec[direction] = Intersection.WAIT_TIME_DURATION;
        this.vehicles[direction] = vehicle;
    }

    /**
     * Remove Vehicle from Direction queue.
     * @param {Direction} direction
     */
    _dequeue(direction) {
        const dequeuedVehicle = this.vehicles[direction];
        this.vehicles[direction] = null;
        return dequeuedVehicle;
    }

    /**
     * Release Vehicles from the queue, when possible.
     * @param {number} tickMillisec
     * @returns {Vehicle} if one dequeued, else null
     */
    step(tickMillisec) {
        for (let direction in this.waitTimersMillisec) {
            const timer = this.waitTimersMillisec[direction];
            this.waitTimersMillisec[direction] = Math.max(timer - tickMillisec, 0)
        }

        this._clearTimer = Math.max(this._clearTimer - tickMillisec, 0);
        if (this._clearTimer > 0) {
            return null;
        }

        // Vehicles should enter the intersection in a clockwise rotation.
        // Determine order of directions to let out by rotating our list.
        //     Example: RIGHT let out last, dequeue DOWN
        //       [DOWN, LEFT, UP, RIGHT] -> [LEFT, UP, RIGHT, DOWN]
        //     Example: UP let out last, dequeue RIGHT
        //       [RIGHT, DOWN, LEFT, UP] -> [DOWN, LEFT, UP, RIGHT]
        for (let i = 0; i < this._dequeueOrder.length; i++) {
            // Rotate order
            let direction = this._dequeueOrder.shift();
            this._dequeueOrder.push(direction);

            if (this.waitTimersMillisec[direction] > 0) {
                continue;
            }

            if (this.vehicles[direction]) {
                this._clearTimer = Intersection.CLEAR_TIME_DURATION;
                return this._dequeue(direction);
            }
        }
        return null;
    }
}