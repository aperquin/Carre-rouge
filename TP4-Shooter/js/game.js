var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null;

var tics = 0;
var _timeToBeAlive = 30;

//Canvas
var divArena;
var canArena;
var conArena;
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
    UP: 38,
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
  this.tabProjectiles = new Array();
  this.add = function (projectile) {
    this.tabProjectiles.push(projectile);  
  };
  this.remove = function () {  
      if((this.tabProjectiles.length>0) && (this.tabProjectiles[0].x >ArenaWidth || this.tabProjectiles[0].x<0)) 
      {
          this.tabProjectiles.shift();
          this.remove();
      }
	  else{
		  //S'il y a collision, on supprime le projectile.
		for(i=0;i<this.tabProjectiles.length;i++){
			if(this.tabProjectiles[i].inCollison) this.tabProjectiles.splice(i,1);
		}
    }  
	  }
    
    
 this.update = function(){
        this.remove();
        this.tabProjectiles.map(function(obj){
            obj.update();
        });
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
     //console.log(this.tabProjectiles.length);
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
	this.inCollison = false;
    this.collision = function(tabOfObjects){
        var hits = null;
        var index;
        for(index=0;index<tabOfObjects.length;index++){
            if (this.x < tabOfObjects[index].x + tabOfObjects[index].width &&
                this.x + this.width > tabOfObjects[index].x &&
                this.y < tabOfObjects[index].y + tabOfObjects[index].height &&
                this.height + this.y > tabOfObjects[index].y) {
                    // collision detected!
                    hits = tabOfObjects[index];
					this.inCollison = true;
                    break;
            }
        }
        return hits;  
    };
    this.draw = function(){
        conArena.fillStyle = this.color;
         conArena.fillRect(this.x,this.y,this.width,this.height);
        };
    this.clear = function(){
         conArena.clearRect(this.x-1,this.y-1,this.width+2,this.height+2);
        };
    this.update = function(){
        this.x +=   this.xSpeed ;
        var tmp = this.collision([player]);
        if(tmp != null){
            tmp.explodes();
			console.log("Boom !");
        }
		tmp = this.collision(enemies.tabEnemies);
        if(tmp != null){
			player.score += 100;
			tmp.explode=true;
            console.log(tmp);
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
      if((this.tabEnemies.length>0) && (this.tabEnemies[0].x >ArenaWidth || this.tabEnemies[0].x<0)) 
      {
          this.tabEnemies.shift();
          this.remove();
      }
	  else{
		  for(i=0;i<this.tabEnemies.length;i++){
			  if(this.tabEnemies[i].explode ==true){
				  this.tabEnemies.splice(i,1);
				}
			}
		}
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
        this.remove();
        this.tabEnemies.map(function(obj){
            obj.update();
        });
    }
    
};

function Enemy(x,y,speed){
    this.x = x;
    this.yOrigine = y;
    this.y = this.yOrigine;
    this.xSpeed = speed;
    this.height = 40;
    this.width = 40;
	this.explode = false;
    this.img = new Image();
    this.img.src = "./assets/Enemy/Example/e_f1.png";
    this.projectileSet = new ProjectileSet();
    this.fire = function (){
        var tmp = new Projectile(this.x-10,this.y+this.height/2,-4,10,10,"rgb(0,200,0)");
        this.projectileSet.add(tmp);
    };
    this.draw = function(){ 
        conArena.drawImage(this.img, 0,0,this.width,this.height, this.x,this.y,this.width,this.height); 
        this.projectileSet.draw();
    };
    this.clear = function(){
        conArena.clearRect(this.x,this.y,this.width,this.height);
        this.projectileSet.clear();
    };
    this.update = function(){
        this.x +=   this.xSpeed ;
        this.y = this.yOrigine+ ArenaHeight/3 * Math.sin(this.x / 100);
        if(tics % 50 == 1) this.fire();
        this.projectileSet.update();
    };
}
/////////////////////////////////

/////////////////////////////////
// Hero Player
var player = {
    init : function(){
        this.img = new Image();
        this.img.src = "./assets/Ship/f1.png";
        this.projectileSet = new ProjectileSet();
    },
    x : 20,
    ySpeed : 10,
    y : 100,
    height : 29,
    width : 64,
    nbOfLives : 4,
	score : 0,
    timeToBeAlive : 0,
    fires : function(){
        var tmp = new Projectile(this.x+this.width,this.y+this.height/2,4,10,10,"rgb(0,0,200)");
        this.projectileSet.add(tmp);
    },
    explodes : function(){
        if(this.timeToBeAlive == 0) {
            this.nbOfLives--;
            if(this.nbOfLives>0){
                this.timeToBeAlive = _timeToBeAlive;
            }else{
                //Game Over
                console.log("GAME OVER");
				alert("GAME OVER");
            }
        }
    },
    clear : function(){
        conArena.clearRect(this.x,this.y,this.width,this.height);
        this.projectileSet.clear();
    },
    update :  function(){
        var keycode;
        if(this.timeToBeAlive>0) {
            this.timeToBeAlive --;
        }
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
                if(keycode == keys.SPACE) { 
                    //shoot
                    this.fires();
                }             
            }
            keyStatus[keycode] = false;
        }  
        this.projectileSet.update();
    },
    draw : function(){
        if(this.timeToBeAlive == 0) {
            conArena.drawImage(this.img, 0,0,this.width,this.height, this.x,this.y,this.width,this.height); 
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
     if(tics % 100 == 1) {
         var rand = Math.floor(Math.random() * ArenaHeight);
         console.log(rand);
        enemies.add(new Enemy(ArenaWidth, rand,-2));
    }
    enemies.update();
}
function drawScene() {
    "use strict"; 
    canArena.style.backgroundPosition = xBackgroundOffset + "px 0px" ;
}
function drawItems() {
    "use strict"; 
    player.draw();
    enemies.draw();
	conArena.fillStyle = "white";
	conArena.fillText("Lives : "+player.nbOfLives,10,30);
	conArena.fillText("Score : "+player.score,10,60);
}
function clearItems() {
    "use strict"; 
    player.clear(); 
    enemies.clear();
}

function updateGame() {
    "use strict"; 
    updateScene();
    updateItems();
}
function clearGame() {
    "use strict"; 
	conArena.clearRect(0,0,canArena.width,canArena.height);
    clearItems();
}

function drawGame() {
    "use strict"; 
    drawScene();
    drawItems();    
}


function mainloop () {
    "use strict"; 
    clearGame();
    updateGame();
    drawGame();
}

function recursiveAnim () {
    "use strict"; 
    mainloop();
    animFrame( recursiveAnim );
}
 
function init() {
    "use strict";
    divArena = document.getElementById("arena");
    canArena = document.createElement("canvas");
    canArena.setAttribute("id", "canArena");
    canArena.setAttribute("height", ArenaHeight);
    canArena.setAttribute("width", ArenaWidth);
    conArena = canArena.getContext("2d");
	conArena.font = "30px Arial";
    divArena.appendChild(canArena);
 
    player.init();
    enemies.init();
    
window.addEventListener("keydown", keyDownHandler, false);
window.addEventListener("keyup", keyUpHandler, false);
    
    animFrame( recursiveAnim );
    
}

window.addEventListener("load", init, false);
