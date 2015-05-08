/*
DONE:
Ajout d'une classe Set pour créer des set d'ennemis ou de projectiles.
Ajout d'une classe Projectile héritant de Character
Ajout de tirs pour les ennemis.
Suppression de la méthode fires de Character : les Projectile ne doivent pas pouvoir tirer.
Ajout d'un joueur.
Ajout des collisions.
*/

/*
TO DO:
Regler le problème de l'animation d'explosion.
Mettre à jour la version POO avec les ajouts de la version non POO:
    - Système de Pause/Game Over.
    - Power Ups.
    - Différents types d'ennemis.
*/

animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null;


ArenaWidth = 500;
ArenaHeight = 300;
tics = 0; //Compteur global, incrémenté à chaque frame.
timeToBeAlive = 30; //Nombre de frames d'invulnérabilité

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
    var keycode = event.keyCode, key; 
    for (key in keys) {
        if (keys[key] === keycode) {
            keyStatus[keycode] = true;
            event.preventDefault();
        }
    }
}

function keyUpHandler(event) {
   var keycode = event.keyCode, key;
    for (key in keys) {
        if (keys[key] == keycode) {
            keyStatus[keycode] = false;
        }
        
    }
}
//Classe gérant toutes les animations : ennemis, explosion, etc.
Animation = function(url, length, width, height){
    this.tabOffscreenCanvas = new Array();
    this.width = width;
    this.height = height; 
    this.length = length;
    this.ready = false;
    this.cpt = 0; //Compteur désignant l'avancement de l'animation
    var image = new Image();
    image.src = url;
    var that = this;
    image.onload = function(){
        that.ready = true;
        var offscreenCanvas, offscreenContext;
        for(var j=0;j<that.length;j++){ 
			offscreenCanvas = document.createElement("canvas");
			offscreenCanvas.width = that.width;
			offscreenCanvas.height = that.height;
			offscreenContext = offscreenCanvas.getContext("2d");
            offscreenContext.drawImage(image,0,j*that.height,that.width,that.height,0,0,that.width,that.height);
			that.tabOffscreenCanvas.push(offscreenCanvas);
        }
    }
}

Animation.prototype.clear = function(x,y){
    conArena.clearRect(x,y,this.width,this.height);
}
Animation.prototype.update = function(){
    if(tics % 5 == 1) {
        this.cpt = (this.cpt + 1) % this.length; //On augmente le compteur de l'animation toutes les 5 frames.
    }
}
Animation.prototype.draw = function(x,y){
    if(this.ready){
        conArena.drawImage(this.tabOffscreenCanvas[this.cpt],x,y); //On ne dessine l'animation que si celle-ci a finie de précharger.
    }
}
        

//Fonction permettant d'initialiser le jeu.
init = function(divId){
    var divArena = document.getElementById(divId);
    this.canArena = document.createElement("canvas");
    this.canArena.setAttribute("id", "canArena");
    this.canArena.setAttribute("width", ArenaWidth);
    this.canArena.setAttribute("height", ArenaHeight);
    this.conArena = this.canArena.getContext("2d");
    divArena.appendChild(this.canArena);  
    
    enemies = new SetEnemies();
    player1 = new Player(20,100,5);
    
    window.addEventListener("keydown", keyDownHandler, false);
    window.addEventListener("keyup", keyUpHandler, false);
    
    animFrame( recursiveAnim ); //Début de la boucle de jeu.
};

//Boucle de jeu
function recursiveAnim (){
    clearGame();
    updateGame();
    drawGame();
    animFrame( recursiveAnim );
};
updateGame = function() {
    tics++;
    //updateScene(); //Pour faire évoluer l'arrière-plan
    updateItems();
};
clearGame = function() {
    clearItems();
};
drawGame = function() {
    //drawScene();
    drawItems();
};
updateItems = function() {
    enemies.update();
    player1.update();
};
drawItems = function() {
    enemies.draw();
    player1.draw();
};
clearItems = function() {
    enemies.clear();
    player1.clear();
};


////////////// Set, collection d'objets comme les ennemis ou les projectiles.
Set = function(){
    this.tab = new Array();
}

Set.prototype.add = function(obj){
    this.tab.push(obj);
}
Set.prototype.remove = function(){
    this.tab.map(function(obj,index,array){
            if(obj.exists == false ||obj.x >ArenaWidth || obj.x<-50){
                  delete array[index];
            }
        });
}
Set.prototype.draw = function(){
    this.tab.map(function(obj){
            obj.draw();
        });
}
Set.prototype.clear = function(){
    this.tab.map(function(obj){
            obj.clear();
        });
}
//Chaque Set doit pouvoir se mettre à jour, cependant le comportement varie en fonction de ce qu'il contient => A définir dans les sous-classes
//Comportement par défaut : mettre à jour l'ensemble des objets qu'il contient, puis les supprimer s'ils sortent de l'écran.
Set.prototype.update = function(){
    this.tab.map(function(obj){
        obj.update();
    });
     this.remove();
}

/////////////////// Character
Character = function (x,y,speed) { 
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.xOrigine = x;
    this.yOrigine = y;
    //this.cpt = 0;
    this.exploding =  false;
    this.exists = true;
    this.width;
    this.height;
    this.life = 2;
};

Character.prototype.getSpeed = function(){
        return this.speed;
};
Character.prototype.setSpeed = function(tmp){
        this.speed =  tmp; 
};
Character.prototype.getX = function(){
        return this.x;
};
Character.prototype.setX = function(tmpX){
        this.x = tmpX;
};
Character.prototype.getY = function(){
        return this.y;
};
Character.prototype.setY = function(tmpY){
        this.y = tmpY;
};

Character.prototype.collides = function(tabOfObjects){
    var hits = null;
    var index;
    for(index in tabOfObjects){
        if ((tabOfObjects[index].exploding == false) && this.x < tabOfObjects[index].x + tabOfObjects[index].width &&
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
Character.prototype.explodes = function(){
    this.exploding = true;
    this.life --;
};
Character.prototype.draw = function(){ //Comportement pour les ennemis et les joueurs. A redéfinir pour les projectiles.
    if(!this.exploding){
        if(this.life>0) this.animation.draw(this.x,this.y);
    } else {
        this.explosion.draw(this.x, this.y);
        if(this.explosion.cpt >= 0) this.exploding = false; //Valeur de comparaison 0 à changer quand l'animation d'explosion marchera.
    }
    this.projectileSet.draw();            
};
Character.prototype.update = function(){ //Comportement (partiel) des ennemis et joueurs. A redéfinir pour les projectiles.
    this.animation.update();  
    this.x=this.x+this.speed;
};
Character.prototype.clear = function(){ //Comportement pour les ennemis et les joueurs. A redéfinir pour les projectiles.
    this.animation.clear(this.x, this.y);     
};

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

//////////////////////// Player
//Un Player est un Character possédant une couleur, deux animations et un Set de Projectile.
Player = function(x,y,speed){
    Character.call(this,x,y,speed);
    this.color = "green"; //Couleur des tirs.
    this.animation = new Animation("./assets/Ship/Spritesheet_64x29.png",4,64,29);
    this.explosion = new Animation("./assets/Explosion/explosionSpritesheet_128x1280.png",10,128,128);
    this.width = this.animation.width;
    this.height = this.animation.height;
    this.projectileSet = new Set(); //Collection des tirs du joueur.
    this.timeToFire = 0; //Nombre de frame à attendre afin de pouvoir tirer.
    this.fireRate = 15; //Nombre de frame minimum entre chaque tirs.
};
Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;

Player.prototype.getColor = function(){
            return this.color;
};
Player.prototype.fires = function(){
    var tmp = new Projectile(this.x+this.animation.width+10,this.y+this.animation.height/2,this.speed+1,10,5,this.color);
    this.projectileSet.add(tmp);
};

Player.prototype.clear = function(){
    Character.prototype.clear.call(this);
    this.projectileSet.clear();
};
Player.prototype.update = function(){
    this.animation.update();
    this.projectileSet.update();
    this.timeToFire --;
    for (keycode in keyStatus) {
                if(keyStatus[keycode] == true){
                    if(keycode == keys.UP) {
                        this.y -= this.speed;
                        if(this.y<0) this.y=0;//console.log("up");
                    }
                    if(keycode == keys.DOWN) {
                        this.y += this.speed;
                        if(this.y>ArenaHeight-this.animation.height) this.y=ArenaHeight-this.animation.height;
                    }
                    if(keycode == keys.LEFT) {
                        this.x -= this.speed;
                        if(this.x<0) this.x=0;
                    }
                    if(keycode == keys.RIGHT) {
                        this.x += this.speed;
                        if(this.x>ArenaWidth-this.animation.width) this.x=ArenaWidth-this.animation.width;
                    }
                    if(keycode == keys.SPACE && this.timeToFire <=0) {
                        //shoot
                        this.fires();
                        this.timeToFire = this.fireRate;
                    }
                }
    }
    var hits = this.collides();
}

//////////////////////// Enemy 
//Un Ennemy est un Character possédant une couleur, deux animations et un Set de Projectile.
Enemy = function(x,y,speed){
    Character.call(this,x,y,speed);
    this.color = "red"; //Couleur des tirs.
    this.animation = new Animation("./assets/Enemy/eSpritesheet_40x30.png",6,40,30);
    this.explosion = new Animation("./assets/Explosion/explosionSpritesheet_128x1280.png",10,128,128);
    this.width = this.animation.width;
    this.height = this.animation.height;
    this.projectileSet = new Set(); //Collection des tirs de l'ennemi.
};
Enemy.prototype = Object.create(Character.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.getColor = function(){
            return this.color;
};
Enemy.prototype.fires = function(){
    var tmp = new Projectile(this.x-10,this.y+this.animation.height/2,-4,10,5,this.color);
    this.projectileSet.add(tmp);
};
Enemy.prototype.clear = function(){
    Character.prototype.clear.call(this);
    this.projectileSet.clear();
};
Enemy.prototype.update = function(){
    Character.prototype.update.call(this)
    this.projectileSet.update();
    if(this.life>0){
        if(tics % 100 == 1){
            this.fires();
        }
        var tmp = this.collides([player1]);
        if(tmp != null){ // S'il y a collision entre un ennemi et un joueur : le joueur et l'ennemi explosent.
            tmp.explodes();
            this.explodes;
            console.log("explose");
        }
    }
}


///////////////////////// SetEnemies : Set d'Ennemy, on redéfinit une classe afin de pouvoir modifier la méthode update.
SetEnemies = function(){
    Set.call(this);
};
SetEnemies.prototype = Object.create(Set.prototype);
SetEnemies.prototype.constructor = SetEnemies;
SetEnemies.prototype.update = function(){
    if(tics % 100 == 1) {
        var rand = Math.floor(Math.random() * ArenaHeight);
        this.add(new Enemy(ArenaWidth, rand,-2));
    }
    Set.prototype.update.call(this);
    this.remove();
}

//////////////////////// Projectile 
Projectile = function(x,y,speed,width,height,color){
    Character.call(this,x,y,speed);
    this.color = color;
    this.width = width;
    this.height = height;
};
Projectile.prototype = Object.create(Character.prototype);
Projectile.prototype.constructor = Projectile;
Projectile.prototype.draw = function(){
    if(this.exists){
        conArena.fillStyle = this.color;
        conArena.fillRect(this.x,this.y,this.width,this.height);
    }
};
Projectile.prototype.clear = function(){
    if(this.exists){
        conArena.clearRect(this.x-1,this.y-1,this.width+2,this.height+2);
    }
};
Projectile.prototype.update = function(){  
    this.x=this.x+this.speed;
    var tmp = this.collides([player1].concat(enemies.tab));
    if(tmp != null && tmp.life>0){ // S'il y a collision entre un projectile et un joueur ou un ennemi : le joueur/ennemi explose et le projectile disparaît.
        tmp.explodes();
        this.exists = false;
    }
};



window.addEventListener("load", init("arena"), false);
//init("arena");