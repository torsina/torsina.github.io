export default class Item {
    constructor(scene, x, y, itemName) {
        this.sprite = scene.physics.add.sprite(x, y, "items", this.itemNameToId(itemName));
        this.scene = scene;
        const anims = this.scene.anims;
        anims.create({
            key: "star",
            frames: anims.generateFrameNumbers("items", {start: 108, end: 109}),
            frameRate: 8,
            repeat: -1
        });
        this.itemName = itemName;
        this.applyAnimation();
        this.sprite.body.setBounceX(1);
        this.sprite.body.setVelocityX(100);
        scene.physics.world.addCollider(scene.player.sprite, this.sprite, (playerSprite, item) => {
            playerSprite.player.applyItem(this.itemName);
            this.destroy();
        });
        scene.physics.world.addCollider(scene.groundLayer, this.sprite);
    }

    update(time, delta) {

    }

    itemNameToId(itemName) {
        switch (itemName) {
            case "mushroom": {
                return 0;
            }
            case "levelUp": {
                return 1;
            }
            case "fireFlower": {
                return 107;
            }
            case "superMushroom": {
                return 2;
            }
            case "star": {
                return 108;
            }
        }
    }

    applyAnimation() {
        switch (this.itemName) {
            case "mushroom": {
                return 0;
            }
            case "levelUp": {
                return 1;
            }
            case "fireFlower": {
                return 107;
            }
            case "superMushroom": {
                return 2;
            }
            case "star": {
                this.sprite.anims.play("star");
            }
        }
    }

    destroy() {
        this.sprite.destroy();
    }

}

