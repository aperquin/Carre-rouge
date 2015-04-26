var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null;

var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
            
var loop;
var pause = true; //Le jeu commence en état de pause.
var gameover = false;
var tics = 0;
var _timeToBeAlive = 30;

//Canvas
var divArena;
var canArena;
var canScore;
var conArena;
var conScore;
var ArenaWidth = 500;
var ArenaHeight = 300;

//Background
var imgBackground;
var xBackgroundOffset = 0;
var xBackgroundSpeed = 1;
var backgroundWidth = 1782;
var backgroundHeight = 600;
//une modification

///////////////////////////////////
//Keys
var keys = {
	LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SPACE: 32,
    ENTER: 13
};
	
var keyStatus = {};

function keyDownHandler(event) {
    "use strict"; 
    var keycode = event.keyCode, 
        key; 
    for (key in keys) {
        if (keys[key] === keycode) {
            keyStatus[keycode] = true;
            event.preventDefault();
        }
    }
}
function keyUpHandler(event) {
   var keycode = event.keyCode,
            key;
    for (key in keys) 
        if (keys[key] == keycode) {
            keyStatus[keycode] = false;
        }
        
    }
///////////////////////////////////

///////////////////
// une collection de projectiles
function ProjectileSet(tabTarget){
  this.tabTarget = tabTarget;
  this.score = 0;
  this.tabProjectiles = new Array();
  this.add = function (projectile) {
    this.tabProjectiles.push(projectile);  
  };
  this.remove = function () {  

       this.tabProjectiles.map(function(obj,index,array){
            if(obj.exists == false ||obj.x >ArenaWidth || obj.x<0){
                  delete array[index];
            }
        });

  };


 this.update = function(){
        this.remove();
        var score = 0;
        this.tabProjectiles.map(function(obj){
            obj.update();
            if(obj.exists == false) {//hit
                score = score +1;
            }
        });
        this.score = this.score + score;
    };
 this.clear = function(){
    this.tabProjectiles.map(function(obj){
         obj.clear();
    });
 };
 this.draw = function(){
    this.tabProjectiles.map(function(obj){
        obj.draw();
    });
 };
    
};

////////////////////
// un objet Projectile
function Projectile(x,y,speed,width,height,color){
    this.x = x;
    this.y = y;
    this.xSpeed = speed;
    this.width = width;
    this.height = height;
    this.color = color;
    this.exists = true;
    this.collision = function(tabOfObjects){
        var hits = null;
        var index;
        for(index in tabOfObjects){
            if ((tabOfObjects[index].cptExplosion ==0) && this.x < tabOfObjects[index].x + tabOfObjects[index].width &&
                this.x + this.width > tabOfObjects[index].x &&
                this.y < tabOfObjects[index].y + tabOfObjects[index].height &&
                this.height + this.y > tabOfObjects[index].y) {
                    // collision detected!
                    hits = tabOfObjects[index];
                    break;
            }
        }
        return hits;  
    };
    this.draw = function(){
        if(this.exists){
            conArena.fillStyle = this.color;
            conArena.fillRect(this.x,this.y,this.width,this.height);
        }
    };
    this.clear = function(){
        if(this.exists){
            conArena.clearRect(this.x-1,this.y-1,this.width+2,this.height+2);
        }
    };
    this.update = function(){
        if(this.exists){
            this.x +=   this.xSpeed ;
            var tmp = this.collision([player].concat(enemies.tabEnemies));
            if(tmp != null){
                tmp.explodes();
                this.exists = false;
            }
        }
    };
}
/////////////////////////////////

/////////////////////////////////
// Enemy
var enemies = {
    init : function(){
        this.tabEnemies = new Array();
    },
    add : function (enemy) {
        this.tabEnemies.push(enemy);  
    },
    remove : function () {  
        this.tabEnemies.map(function(obj,index,array){
            if(obj.exists == false ||obj.x >ArenaWidth || obj.x<0){
                  delete array[index];
            }
        });
    },
    draw : function(){ 
        this.tabEnemies.map(function(obj){
            obj.draw();
        });
    },
    clear : function(){
       this.tabEnemies.map(function(obj){
            obj.clear();
        });
    },
    update : function(){

        this.tabEnemies.map(function(obj){
            obj.update();
        });
         this.remove();
    }
    
};
//test
function Enemy(x,y,speed,type){
    this.x = x;
    this.yOrigine = y;
    this.y = this.yOrigine;
    this.xSpeed = speed;
    this.exists = true;
    this.height = 30;
    this.width = 40;
    this.life = type;
	this.type = type;
    this.img = new Image();
    this.img.src = "./assets/Enemy/HueShifted/eSpritesheet_40x30_hue"+type+".png";
    this.cpt = 0;

    this.cptExplosion =  0;//10 images
    this.imgExplosion = new Image();
    this.imgExplosionHeight = 128;
    this.imgExplosionWidth = 128;
    this.imgExplosion.src = "./assets/Explosion/explosionSpritesheet_1280x128.png";

    this.projectileSet = new ProjectileSet();
    this.explodes = function(){
    		this.life --;
    		if (this.life<=0) this.cptExplosion = 1;
    };
    this.collision = function(tabOfObjects){
        var hits = null;
        var index;
        for(index in tabOfObjects){
            if (this.x < tabOfObjects[index].x + tabOfObjects[index].width &&
                this.x + this.width > tabOfObjects[index].x &&
                this.y < tabOfObjects[index].y + tabOfObjects[index].height &&
                this.height + this.y > tabOfObjects[index].y) {
                    // collision detected!
                    hits = tabOfObjects[index];
                    break;
            }
        }
        return hits;
    };
    this.fire = function (){
        var tmp = new Projectile(this.x-10,this.y+this.height/2,-4,10,5,"rgb(0,200,0)");
        this.projectileSet.add(tmp);
    };
    this.draw = function(){ 

        this.projectileSet.draw();

        if(this.cptExplosion!=0){
                conArena.drawImage(this.imgExplosion, this.cptExplosion*this.imgExplosionWidth, 0, this.imgExplosionWidth,this.imgExplosionHeight, this.x,this.y,this.width,this.height);
        }else{
            conArena.drawImage(this.img,  0,this.cpt*this.height,this.width,this.height, this.x,this.y,this.width,this.height);
        }
    };
    this.clear = function(){
        if(this.exists){
            conArena.clearRect(this.x,this.y,this.width,this.height);
        }
        this.projectileSet.clear();
    };
    this.update = function(){
       if(this.cptExplosion==0){//is not exploding
            this.x +=   this.xSpeed ;
			switch(this.type){
				case 1:
					this.y = this.yOrigine+ ArenaHeight/3 * Math.sin(this.x / 100);
					break;
				case 2:
					this.y = this.yOrigine+ ArenaHeight/10 * Math.sin(this.x / 25);
					break;
				case 3:
					this.y = this.yOrigine+ ArenaHeight/3 * Math.log(this.x / 100);
					break;
			}
            var tmp = this.collision([player]);
                if(tmp != null){
                    tmp.explodes();
                    this.exists = false;
                }

            if(tics % 5 == 1) {
                    this.cpt = (this.cpt + 1) % 6;
            }
            if(tics % 50 == 1) this.fire();
       }else{
            if(tics % 3 == 1) {
                this.cptExplosion++;
            }
            if(this.cptExplosion>10){//end of animation
                this.cptExplosion=0;
                this.exists = false;
            }
        }
        this.projectileSet.update();
    };
}
/////////////////////////////////

var powerUps = {
    init : function(){
        this.tabPowerUps = new Array();
    },
    add : function (powerUp) {
        this.tabPowerUps.push(powerUp);  
    },
    remove : function () {  
        this.tabPowerUps.map(function(obj,index,array){
            if(obj.exists == false ||obj.x >ArenaWidth || obj.x<0){
                  delete array[index];
            }
        });
    },
    draw : function(){ 
        this.tabPowerUps.map(function(obj){
            obj.draw();
        });
    },
    clear : function(){
       this.tabPowerUps.map(function(obj){
            obj.clear();
        });
    },
    update : function(){

        this.tabPowerUps.map(function(obj){
            obj.update();
        });
         this.remove();
    }
    
};


function PowerUp(x,y,speed,type){
    this.x = x;
    this.yOrigine = y;
    this.y = this.yOrigine;
    this.xSpeed = speed;
    this.exists = true;
    this.height = 30;
    this.width = 40;
    this.img = new Image();
    this.img.src = "./assets/PowerUps/power"+type+".png";
    this.cpt = 0;
	this.type = type; //type du powerUp.

    this.collision = function(tabOfObjects){
        var hits = null;
        var index;
        for(index in tabOfObjects){
            if (this.x < tabOfObjects[index].x + tabOfObjects[index].width &&
                this.x + this.width > tabOfObjects[index].x &&
                this.y < tabOfObjects[index].y + tabOfObjects[index].height &&
                this.height + this.y > tabOfObjects[index].y) {
                    // collision detected!
                    hits = tabOfObjects[index];
                    break;
            }
        }
        return hits;
    };

    this.draw = function(){ 

            conArena.drawImage(this.img,  0,0,125,125, this.x,this.y,this.width,this.height);
        
    };
    this.clear = function(){
        if(this.exists){
            conArena.clearRect(this.x,this.y,this.width,this.height);
        }
    };
    this.update = function(){
            this.x +=   this.xSpeed ;
            this.y = this.yOrigine;
            var tmp = this.collision([player]);
                if(tmp != null){
					switch (this.type) {
						case 1 : //améliore la vitesse du vaisseau.
							console.log("vitesse !");
							player.xSpeed *= 1.5;
							player.ySpeed *= 1.5;
							break;
						case 2 : // vie en plus.
							console.log("vie !");
							player.nbOfLives ++;
							break;
						case 3 : // tire plus vite.
							console.log("tirs !");
							player.fireRate /= 1.5;
							break;
					}
                    this.exists = false;
                }
    };
}

/////////////////////////////////
// Hero Player
var player = {
    init : function(){
		//Déclarations de canvas offscreen pour précharger les différentes étapes de l'animation du vaisseau:
		this.offscreenCanvas = [];
        this.img = new Image();
        this.img.src = "./assets/Ship/Spritesheet_64x29.png";
		this.img.onload = offScreenCreate(player);
        this.cpt = 0;
        this.cptExplosion =  10;//10 images
        this.imgExplosion = new Image();
        this.imgExplosionHeight = 128;
        this.imgExplosionWidth = 128;
        this.imgExplosion.src = "./assets/Explosion/explosionSpritesheet_1280x128.png";
        this.projectileSet = new ProjectileSet();
		this.fireRate = 10; //Temps entre chaque tir.		  
    },
    x : 20,
    ySpeed : 5,
    xSpeed : 5,
    y : 100,
    height : 29,
    width : 64,
    nbOfLives : 2,
    timeToBeAlive : 0,
    timeToFire : 0,
    fires : function(){
    	if(this.timeToFire <= 0){
        var tmp = new Projectile(this.x+this.width,this.y+this.height/2,10,10,3,"rgb(200,0,0)");
        this.projectileSet.add(tmp);
        this.timeToFire = this.fireRate;
		}
		else{
			this.timeToFire --;
		}
    },
    explodes : function(){
        if(this.timeToBeAlive == 0) {
            this.nbOfLives--;
            if(this.nbOfLives>0){
                this.timeToBeAlive = _timeToBeAlive;
                this.cptExplosion = 1;
            }else{
                //Game Over
                console.log("GAME OVER");
                gameOver();
            }
        }
    },
    clear : function(){
        conArena.clearRect(this.x,this.y,this.width,this.height);
        this.projectileSet.clear();
    },
    update :  function(){
        var keycode;
        if(tics % 10 == 1) {
                this.cpt = (this.cpt + 1) % 4;
            }
        if(this.timeToBeAlive>0) {
            this.timeToBeAlive --;
        }else{
            for (keycode in keyStatus) {
                if(keyStatus[keycode] == true){
                    if(keycode == keys.UP) {
                        this.y -= this.ySpeed;
                        if(this.y<0) this.y=0;
                    }
                    if(keycode == keys.DOWN) {
                        this.y += this.ySpeed;
                        if(this.y>ArenaHeight-this.height) this.y=ArenaHeight-this.height;
                    }
                    if(keycode == keys.LEFT) {
                        this.x -= this.xSpeed;
                        if(this.x<0) this.x=0;
                    }
                    if(keycode == keys.RIGHT) {
                        this.x += this.xSpeed;
                        if(this.x>ArenaWidth-this.width) this.x=ArenaWidth-this.width;
                    }
                    if(keycode == keys.SPACE) {
                        //shoot
                        this.fires();
                    }
                }
			//Une touche restée pressée n'est pas acquittée afin d'avoir un mouvement plus fluide et un tir continu:
             //keyStatus[keycode] = false;
            }
        }
        this.projectileSet.update();
    },
    draw : function(){
        if(this.timeToBeAlive == 0) {

            //conArena.drawImage(this.img, 0,this.cpt*this.height,this.width,this.height, this.x,this.y,this.width,this.height);
            conArena.drawImage(this.offscreenCanvas[this.cpt],this.x,this.y);
        }else{
            //exploding
            if(this.cptExplosion!=0){
                conArena.drawImage(this.imgExplosion, this.cptExplosion*this.imgExplosionWidth, 0, this.imgExplosionWidth,this.imgExplosionHeight, this.x,this.y,this.width,this.height);
               if(tics % 3 == 1) {this.cptExplosion++;}
                if(this.cptExplosion>10) this.cptExplosion=0;
            }
        }
        this.projectileSet.draw();
    }
};



function updateScene() {
    "use strict"; 
    xBackgroundOffset = (xBackgroundOffset - xBackgroundSpeed) % backgroundWidth;
}
function updateItems() {
    "use strict"; 
    player.update();
    tics++;
     if(tics % 100 == 5) {
         var rand = Math.floor(Math.random() * ArenaHeight);

        enemies.add(new Enemy(ArenaWidth, rand,-2,rand%3+1));
    }
	if(tics % 500 == 10){
		var rand = Math.floor(Math.random() * ArenaHeight);
		powerUps.add(new PowerUp(ArenaWidth,rand,-2,rand%3+1));
	}
    enemies.update();
	powerUps.update();
}
function drawScene() {
    "use strict"; 
    canArena.style.backgroundPosition = xBackgroundOffset + "px 0px" ;
}
function drawItems() {
    "use strict"; 
    player.draw();
    enemies.draw();
	powerUps.draw();
}
function clearItems() {
    "use strict"; 
    player.clear(); 
    enemies.clear();
	powerUps.clear();
}

function clearScore() {
    conScore.clearRect(0,0,300,50);
}
function drawScore() {
    conScore.fillText("life : "+player.nbOfLives, 10, 25);
    conScore.fillText("score : "+player.projectileSet.score, 150,25);
}
function gameOver(){
	gameover = true;
	clearScore();
	conScore.fillText("Game Over !", 175, 175);
}
function updateGame() {
    "use strict"; 
	//On update le jeu s'il n'est pas en pause ou qu'il n'y a pas gameover,
	if(!pause){
		updateScene();
		updateItems();
	}
	//puis on vérifie l'état de la pause et du gameover.
	if(keyStatus[keys.ENTER] == true) {
							if(!pause){
							pause = true;
						}
							else {
								pause = false;
							}
						}
						keyStatus[keys.ENTER] = false;
}
function clearGame() {
    "use strict"; 
    clearItems();
    clearScore();
}

function drawGame() {
    "use strict"; 
    drawScene();
    drawScore();
    drawItems();    
}


function mainloop () {
    "use strict"; 
    clearGame();
    updateGame();
    drawGame();
}

function recursiveAnim () {
    "use strict"
    mainloop();
    loop = animFrame( recursiveAnim );
	if(gameover) cancelAnimationFrame(loop);
}

function restart(){
	clearGame();
	init();
}
 
function init() {
    "use strict";
    divArena = document.getElementById("arena");
    canArena = document.createElement("canvas");
    canArena.setAttribute("id", "canArena");
    canArena.setAttribute("height", ArenaHeight);
    canArena.setAttribute("width", ArenaWidth);
    conArena = canArena.getContext("2d");
    divArena.appendChild(canArena);

    canScore = document.createElement("canvas");
    canScore.setAttribute("id","canScore");
    canScore.setAttribute("height", ArenaHeight);
    canScore.setAttribute("width", ArenaWidth);
    conScore = canScore.getContext("2d");
    conScore.fillStyle = "rgb(200,0,0)";
    conScore.font = 'bold 12pt Courier';
    divArena.appendChild(canScore);

 
    player.init();
    enemies.init();
	powerUps.init();
    
window.addEventListener("keydown", keyDownHandler, false);
window.addEventListener("keyup", keyUpHandler, false);
    
    loop = animFrame( recursiveAnim );
    
}

window.addEventListener("load", init, false);

function offScreenCreate(object){
	var tempCanvas,tempCtx;
		  for(i=0;i<4;i++){
			  tempCanvas = document.createElement("canvas");
			  tempCanvas.setAttribute("id", "offscreenCanvas"+i);
			  tempCanvas.setAttribute("height", object.height);
		 	  tempCanvas.setAttribute("width", object.width);
		 	  tempCtx = tempCanvas.getContext("2d");
		 	  tempCtx.drawImage(object.img, 0,i*object.height,object.width,object.height, 0,0,object.width,object.height)
			  object.offscreenCanvas.push(tempCanvas);
		  }
}
