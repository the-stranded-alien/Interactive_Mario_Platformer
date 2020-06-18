let config = {
    
    type: Phaser.AUTO,
    
    scale: {
        mode: Phaser.Scale.FIT,
        width: 1250,
        height: 600
    },
    
    backgroundColor: 0xffff11,
    
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y:1000
            },
            // debug: true
        }
    },
    
    scene: {
        preload: preload,
        create: create,
        update: update
    }

};

let game = new Phaser.Game(config);

let player_config = {
    player_speed: 150,
    player_jumpspeed: -650
}

function preload(){
    this.load.image("ground", "Assets/topground.png");
    this.load.image("sky", "Assets/background.png");
    this.load.image("apple", "Assets/apple.png");
    this.load.spritesheet("dude", "Assets/dude.png",{frameWidth:32, frameHeight:48});
    this.load.image("ray","Assets/ray.png");
}

function create(){
    W = game.config.width;
    H = game.config.height;
    
    // Add Tile_Sprites
    let ground = this.add.tileSprite(0, H-128, W, 128, "ground");
    ground.setOrigin(0,0);
    
    // Create A Background
    let background = this.add.sprite(0, 0, "sky");
    background.setOrigin(0,0);
    background.displayWidth = W;
    background.displayHeight = H;
    background.depth = -2;
    
    // Create Rays On Top Of The Background
    let rays = [];
    
    for(let i=-10; i<=10; i++){
        let ray = this.add.sprite(W/2, H-120, "ray");
        ray.displayHeight = 1.5*H;
        ray.setOrigin(0.5,1);
        ray.alpha = 0.2;
        ray.angle = i*20;
        ray.depth = -1;
        rays.push(ray);
    }
    
    // Tween
    this.tweens.add({
       targets: rays,
        props: {
            angle:{
                value: "+=20" 
            }
        },
        duration: 6000,
        repeat: -1
    });
    
    // Create A Player Object
    this.player = this.physics.add.sprite(100,300,"dude",4);
    // Set The Bounce Values For The Player
    this.player.setBounce(0.5);
    // Don't Allow Player To Move Out Of Game The World
    this.player.setCollideWorldBounds(true);
    // Player Movements --> Control The Player Through The Keyboard
    this.cursors = this.input.keyboard.createCursorKeys();
    // Player Animations
    this.anims.create({
       key: 'left',
       frames: this.anims.generateFrameNumbers("dude", {start:0, end:3}),
       frameRate: 10,
       repeat: -1    
    });
    this.anims.create({
       key: 'center',
       frames: [{key: "dude", frame:4}],
       frameRate: 10
    });
    this.anims.create({
       key: 'right',
       frames: this.anims.generateFrameNumbers("dude", {start:5, end:8}),
       frameRate: 10,
       repeat: -1    
    });
    
    // Add A Group Of Apples --> Physical Objects
    let fruits = this.physics.add.group({
        key: "apple",
        repeat: 12,
        setScale: {x:0.2, y:0.2},
        setXY: {x:30, y:0, stepX:96}
    });

    // Add Bouncing Effect To All The Apples
    fruits.children.iterate(function(f){
       f.setBounce(Phaser.Math.FloatBetween(0.4, 0.7)); 
    });
    
    // Create More Platforms
    let platforms = this.physics.add.staticGroup();
    platforms.create(500, 350, "ground").setScale(2,0.5).refreshBody();
    platforms.create(700, 200, "ground").setScale(2,0.5).refreshBody();
    platforms.create(150, 200, "ground").setScale(2,0.5).refreshBody();
    platforms.create(1000, 125, "ground").setScale(2,0.5).refreshBody();
    platforms.create(1100, 325, "ground").setScale(2,0.5).refreshBody();
    platforms.add(ground);

    this.physics.add.existing(ground, true); // True --> Static Body
    ground.body.allowGravity = false;
    // ground.body.immovable = true; // Alternative To Make Ground Static
    
    // Adding Collision Detection Between Player And The Ground
    this.physics.add.collider(platforms, this.player);
    
    // Adding Collision Detection Between Apples And The Ground
    // this.physics.add.collider(ground, fruits);
    
    // Adding Collision Detection Between Apples And The Platforms
    this.physics.add.collider(platforms, fruits);
    
    // Adding Overlap Between Player And The Fruits
    this.physics.add.overlap(this.player, fruits, eatFruit, null, this);
    
    // Create Cameras
    this.cameras.main.setBounds(0,0,W,H);
    this.physics.world.setBounds(0,0,W,H);
    
    this.cameras.main.startFollow(this.player,true,true);
    this.cameras.main.setZoom(1.25);
    
}

function update(){
    
    if(this.cursors.left.isDown) {
        this.player.setVelocityX(-player_config.player_speed);
        this.player.anims.play("left", true);
    }
    else if(this.cursors.right.isDown) {
        this.player.setVelocityX(player_config.player_speed);
        this.player.anims.play("right", true);
    }
    else {
        this.player.setVelocityX(0);
        this.player.anims.play("center", true);
    }
    
    // Add Jumping Ability, Stop The Player From Jumping When In Air !
    if(this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(player_config.player_jumpspeed);
    }
}

function eatFruit(player, fruit) {
    fruit.disableBody(true, true);
}