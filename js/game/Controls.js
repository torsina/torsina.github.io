export class Controls {
    constructor(scene) {
        const { LEFT, RIGHT, UP, Q, Z, D, SPACE } = Phaser.Input.Keyboard.KeyCodes;
        this._keys = scene.input.keyboard.addKeys({
            left: LEFT,
            right: RIGHT,
            up: UP,
            space: SPACE,
            q: Q,
            z: Z,
            d: D
        });
    }
    get left() {
        return this._keys.left.isDown || this._keys.q.isDown;
    }
    get right() {
        return this._keys.right.isDown || this._keys.d.isDown;
    }
    get jump() {
        return this._keys.up.isDown || this._keys.z.isDown || this._keys.space.isDown;
    }
}
