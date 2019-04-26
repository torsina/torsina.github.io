export default class Goomba {
    constructor(scene, x, y) {
        this.scene = scene;
        const anims = scene.anims;
        anims.create({
            key: "goomba-walk",
            frames: anims.generateFrameNumbers("goomba", {start: 0, end: 1}),
            frameRate: 2,
            repeat: -1
        });
        anims.create({
            key: "goomba-dead",
            frames: anims.generateFrameNumbers("goomba", {start: 2, end: 2}),
            frameRate: 1,
            repeat: -1
        });

        this.sprite = scene.physics.add
            .sprite(x, y, "goomba", 0)
            .setSize(16, 16);
        this.sprite.goomba = this;
        this.sprite.setOrigin(0.5, 1);
        this.direction = "right";
        this.sprite.anims.play("goomba-walk", true);
    }

    freeze() {
        if(this.sprite && this.sprite.body) {
            this.sprite.body.moves = false;
        }
    }

    update() {
        if(this.sprite && this.sprite.body) {
            if(this.direction === "right" && !this.sprite.body.blocked.right) this.sprite.setVelocityX(50);
            else if(this.direction === "left" && !this.sprite.body.blocked.left) this.sprite.setVelocityX(-50);
            else if(this.direction === "right" && this.sprite.body.blocked.right) {
                this.sprite.setVelocityX(-50);
                this.direction = "left";
            }
            else if(this.direction === "left" && this.sprite.body.blocked.left) {
                this.sprite.setVelocityX(50);
                this.direction = "right";
            }
        }
    }

    destroy() {
        this.sprite.destroy();
    }

    die() {
        this.freeze();
        this.sprite.anims.play("goomba-dead");
        setTimeout(() => {
            this.destroy();
        }, 100)
    }
}
