import {Controls} from "./Controls.js";

export default class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Create the animations we need from the player spritesheet
        const anims = scene.anims;
        anims.create({
            key: "player-idle",
            frames: anims.generateFrameNumbers("player", {start: 0, end: 3}),
            frameRate: 3,
            repeat: -1
        });
        anims.create({
            key: "player-run",
            frames: anims.generateFrameNumbers("player", {start: 8, end: 15}),
            frameRate: 12,
            repeat: -1
        });
        anims.create({
            key: "player-dead",
            frames: anims.generateFrameNumbers("player")
        })

        // Create the physics-based sprite that we will move around and animate
        this.sprite = scene.physics.add
            .sprite(x, y, "player", 0)
            .setDrag(600, 0)
            .setMaxVelocity(300, 500)
            .setSize(16, 16)
            .setOffset(8, 16);
        this.sprite.player = this;
        this.keys = new Controls(this.scene);
        this.sprite.setOrigin(0.5, 1);
        this.health = 1;
        this.invulnerable = false;
        this.star = false;
    }

    freeze() {
        this.sprite.body.moves = false;
    }

    update() {
        const {keys, sprite} = this;
        const onGround = sprite.body.blocked.down;
        const velocity = onGround ? 200 : 150;
        // Apply horizontal acceleration when left/a or right/d are applied
        if (keys.left) {
            sprite.setVelocityX(-velocity);
            // flip the texture
            sprite.setFlipX(true);
        } else if (keys.right) {
            sprite.setVelocityX(velocity);
            sprite.setFlipX(false);
        } else {
            // reset the x acceleration if no key pressed
            sprite.setVelocityX(0);
        }
        // Only allow the player to jump if they are on the ground
        if (onGround && keys.jump) {
            sprite.setVelocityY(-390);
        }

        // Update the animation/texture based on the state of the player
        if (onGround) {
            if (sprite.body.velocity.x !== 0) sprite.anims.play("player-run", true);
            else sprite.anims.play("player-idle", true);
        } else {
            sprite.anims.stop();
            sprite.setTexture("player", 10);
        }
    }

    destroy() {
        this.sprite.destroy();
    }

    applyItem(itemName) {
        switch (itemName) {
            case "mushroom": {
                this.health = 2;
                break;
            }
            case "lifeUp": {
                return 1;
            }
            case "fireFlower": {
                return 107;
            }
            case "superMushroom": {
                return 2;
            }
            case "star": {
                this.health = 2;
                this.sprite.tint = 0xe6ff0c;
                this.invulnerable = true;
                this.star = true;
                setTimeout(() => {
                    this.sprite.tint = 0xffffff;
                    this.star = false;
                    this.invulnerable = false;
                }, 10000)
            }
        }
        this.applyHealthState();
    }

    applyHealthState() {
        switch(this.health) {
            case 1: {
                this.sprite.setScale(1);
                break;
            }
            case 2: {
                this.sprite.setScale(1.3);
            }
        }
    }

    damage() {
        if(!this.invulnerable) {
            this.health--;
            if(this.health <= 0) {
                this.freeze();
                const sceneManager = new Phaser.Scenes.ScenePlugin(this.scene);
                sceneManager.restart();
            }
            // trigger invulnerability frames
            this.invulnerable = true;
            setTimeout(() => {
                this.invulnerable = false;
            }, 3000)
        }
    }
}
