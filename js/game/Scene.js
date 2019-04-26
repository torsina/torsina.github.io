import Goomba from "./Goomba.js";
import Item from "./Item.js";
import Player from "./Player.js";

export default class Scene extends Phaser.Scene {
    preload() {
        // player spritesheet
        this.load.spritesheet(
            "player",
            "./assets/spritesheets/0x72-industrial-player-32px-extruded.png",
            {
                frameWidth: 32,
                frameHeight: 32,
                margin: 1,
                spacing: 2
            }
        );
        // spritesheet of the tiles used for the moving blocks
        this.load.spritesheet("tiles-sheet", "./assets/spritesheets/world.png", {
            frameWidth: 16,
            frameHeight: 16,
            margin: 0,
            spacing: 0
        });
        // items spritesheet
        this.load.spritesheet("items", "./assets/spritesheets/items.png", {
            frameWidth: 16,
            frameHeight: 16,
            margin: 0,
            spacing: 0
        });
        // goomba animation spritesheet
        this.load.spritesheet("goomba", "./assets/spritesheets/goomba.png", {
            frameWidth: 16,
            frameHeight: 16,
            margin: 0,
            spacing: 0
        });
        // tileset for the tilemap
        this.load.image("tiles", "./assets/tilesets/tileset.png");
        // tilemap
        this.load.tilemapTiledJSON("map", "./assets/tilemaps/1-1.json");
    }

    create() {
        this.itemBlockCollision = (sprite, tile) => {
            if(tile.properties.used) return;
            const tileX = tile.x;
            const tileY = tile.y;
            const tileWidth = tile.width;
            const tileHeight = tile.height;
            const movingBlock = this.physics.add.sprite((tileX + 0.5) * tileWidth, (tileY + 0.5) * tileHeight, "tiles-sheet", tile.index - 1);
            movingBlock.body.setAllowGravity(false);
            movingBlock.setVelocityY(-250);
            tile.visible = false;
            const condition = tile.properties.item !== undefined && tile.properties.item.length > 0 && !tile.properties.used;
            if (condition) {
                const item = new Item(this, (tileX + 0.5) * tileWidth, (tileY - 1.5) * tileHeight, tile.properties.item);
            }
            tile.properties.used = true;
            switch(tile.index) {
                case 25: {
                    tile.index = 28;
                    break;
                }
            }
            if (sprite.player.health > 1 && tile.index !== 28) {
                setTimeout(() => {
                    movingBlock.destroy();
                    this.interactiveLayer.removeTileAt(tileX, tileY);
                }, 50)
            } else {
                setTimeout(() => {
                    movingBlock.setVelocityY(250);
                    setTimeout(() => {
                        movingBlock.destroy();
                        tile.visible = true;
                    }, 50)
                }, 50);
            }
        };
        this.cameras.main.roundPixels = true;

        const map = this.make.tilemap({key: "map"});
        this.map = map;
        this.tileset = map.addTilesetImage("world", "tiles");

        map.createDynamicLayer("background", this.tileset);
        this.groundLayer = map.createDynamicLayer("ground", this.tileset);
        map.createDynamicLayer("foreground", this.tileset);
        this.interactiveLayer = map.createDynamicLayer("interactive", this.tileset);
        this.interactiveObjects = map.getObjectLayer("tileProperties").objects;
        // Instantiate a player instance at the location of the "Spawn Point" object in the Tiled map
        const spawnPoint = map.findObject("Objects", obj => obj.name === "spawn");
        this.player = new Player(this, spawnPoint.x, spawnPoint.y - 100);
        this.enemyObjects = map.getObjectLayer("enemy").objects;
        this.enemies = [];
        // add the properties from the points to the tiles
        this.interactiveObjects.forEach((point) => {
            const {x, y} = point;
            const item = point.properties.filter(property => property.name === "item")[0];
            const itemValue = item.value;
            const itemTile = this.interactiveLayer.getTileAtWorldXY(x, y);
            itemTile.properties.item = itemValue;
        });
        this.enemyObjects.forEach((point) => {
            const {x, y} = point;
            const enemy = point.properties.filter(property => property.name === "enemy")[0];
            const enemyType = enemy.value;
            switch (enemyType) {
                case "goomba":
                    const goomba = new Goomba(this, x, y);
                    this.enemies.push(goomba);
                    this.physics.world.addCollider(goomba.sprite, this.groundLayer);
                    this.physics.world.addCollider(goomba.sprite, this.interactiveLayer);
                    this.physics.world.addCollider(goomba.sprite, this.player.sprite, (_goomba, _player) => {
                        // prevent undefined on enemy death
                        if (_goomba.body && _goomba.body.touching) {
                            if (_player.player.star) {
                                _goomba.goomba.die();
                            } else if (_player.body.touching.down
                                && !_player.body.touching.left
                                && !_player.body.touching.right
                                && _goomba.body.touching.up) {
                                _player.setVelocityY(-200);
                                _goomba.goomba.die()
                            } else if ((_player.body.touching.left || _player.body.touching.right)
                                && (_goomba.body.touching.left || _goomba.body.touching.right)) {
                                _player.player.damage();
                            }
                        }
                    });
                    break;
            }
        });

        // Collide the player against the ground layer - here we are grabbing the sprite property from
        // the player (since the Player class is not a Phaser.Sprite).
        this.groundLayer.setCollisionByProperty({collides: true});
        this.interactiveLayer.setCollisionByProperty({collides: true});
        this.physics.world.addCollider(this.player.sprite, this.groundLayer);
        const scene = this;
        this.physics.world.addCollider(this.player.sprite, this.interactiveLayer, (sprite, tile) => {
            if (sprite.body.blocked.up) sprite.setVelocityY(0);
            switch (this.player.health) {
                case 1: {
                    // normal small mario
                    if (sprite.body.blocked.up && !sprite.body.blocked.down) {
                        scene.itemBlockCollision(sprite, tile);
                    }
                    break;
                }
                case 2: {
                    // mario with shroom
                    if (sprite.body.blocked.up && !sprite.body.blocked.down) {
                        scene.itemBlockCollision(sprite, tile);
                    }
                    break;
                }
                case 3: {
                    // giant mario, destroys everything destructible
                    break;
                }
            }
        });

        this.cameras.main.startFollow(this.player.sprite);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);


        // Help text that has a "fixed" position on the screen
        this.add
            .text(16, 16, "Arrow/ZQSD to move & jump", {
                font: "18px monospace",
                fill: "#000000",
                padding: {x: 20, y: 10},
                backgroundColor: "#ffffff"
            })
            .setScrollFactor(0);
    }

    update(time, delta) {
        this.player.update();
        this.enemies.forEach(enemy => enemy.update());
        // check if in win area
        if(this.player.sprite.x >= 3400) {
            this.player.freeze();
            this.enemies.forEach(enemy => enemy.freeze());
            this.add
                .text(300, 300, "You win!", {
                    font: "50px monospace",
                    fill: "#000000",
                    padding: {x: 20, y: 10},
                    backgroundColor: "#ffffff"
                })
                .setScrollFactor(0);
        }
    }

}

