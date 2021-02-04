export const Direction = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
}
Object.freeze(Direction);

export const oppositeDirection = (dir) => {
    const dirInt = parseInt(dir)
    switch (dirInt) {
        case Direction.UP:
            return Direction.DOWN;
        case Direction.RIGHT:
            return Direction.LEFT;
        case Direction.DOWN:
            return Direction.UP;
        case Direction.LEFT:
            return Direction.RIGHT;
        default:
            throw new Error('Unknown direction provided');
    }
};
