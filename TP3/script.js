var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var dateDernierFrame = new Date(); //Variable permettant de mesurer le temps écoulé entre deux frames.
var dateDernierAnim = new Date(); //Variable permettant de mesurer s'il est temps de faire avancer l'animation.

//Tableau/Objet contenant des informations sur l'ensemble des touches appuyées entre deux iterations de la boucle de jeu.
var keys = {
	up:false,
	down:false,
	left:false,
	right:false,
	enter:false,
	escape:false,
};

//Objet contenant des informations à propos du personnage.
var character = {
	direction : false, //Direction selon laquelle le personnage se déplace, vaut false s'il est immobile.
	posX : 0, //Position X dans le canvas du personnage.
	posY : 0, //Position Y dans le canvas du personnage.
	animationStepX : 1, //Position X de la sprite à dessiner.
	animationStepY : 2 //Position Y de la sprite à dessiner.
};

//On ajoute une image au personnage.
character.sprite = new Image();
character.sprite.src = "hero_walk_cycle_spritesheet_by_mrnoobtastic-d3defej.png";
character.sprite.onload = ctx.drawImage(character.sprite,1*128,2*128,128,128,0,0,128,128);

//Objet contenant des informations relative à la souris.
var mouse = {
	posX : 0, //Position X de la souris dans le canvas.
	posY : 0, //Position Y de la souris dans le canvas.
	clicked : false, //Représente si il y a eu click ou non.
	clickedX : 0, //PositionX du click dans le canvas.
	clickedY : 0 //PositionY du click dans le canvas.
};

//Fonction gérant les imputs du joueur.
function aquisition(){
	//Pour chaque touche fléchée, on définit la direction que le personnage doit suivre, on annule un éventuel déplacement à la souris.
	if(keys.up==true){character.direction="up";mouse.clicked=false;}
	else if(keys.down==true){character.direction="down";mouse.clicked=false;}
	else if(keys.left==true){character.direction="left";mouse.clicked=false;}
	else if(keys.right==true){character.direction="right";mouse.clicked=false;}
	//Si il y a eu click, la direction de déplacement est determinée par "mouseMoving".
	else if(mouse.clicked==true){mouseMoving();}
	else{character.direction=false;}
}

//Fonction effectuant les mises à jour du monde de jeu.
function updateWorld(){
	moveCharacter();
}

//Fonction gérant l'affichage du monde de jeu.
function drawScreen(){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	drawCharacter();
}

//Fonction gérant le déplacement et la phase de l'animation du personnage.
function moveCharacter(){
	var now = new Date();	
	var delay = now - dateDernierFrame;
	
	//En fonction de la direction du personnage, on définit quelle ligne de sprite utiliser pour l'animation.
	//On modifie aussi la position du personnage en fonction du temps écoulé entre deux appels, soit le temps entre deux frames.
	//Si le personnage s'apprête à dépasser le cadre du jeu, on ne modifie pas la position, on arrête le déplacement.
	switch(character.direction) {
		case "up":
			character.animationStepY=3;
			if(character.posY>=2){character.posY-=3*delay/16;}
			else{{character.direction = false;}}
			break;
		case "down":
			character.animationStepY=2;
			if(character.posY+128<=canvas.height-2){character.posY+=3*delay/16;}
			else{{character.direction = false;}}
			break;
		case "left":
			character.animationStepY=0;
			if(character.posX>=2){character.posX-=3*delay/16;}
			else{{character.direction = false;}}
			break;
		case "right":
			character.animationStepY=1;
			if(character.posX+128<=canvas.width-2){character.posX+=3*delay/16;}
			else{{character.direction = false;}}
			break;
		default:
			character.direction=false;
	}
	
	//Si le personnage se déplace, il faut aussi faire évoluer la colonne de sprite à utiliser.
	//Ce changement se fait à intervalle constant, ici 200ms.
	if(character.direction!=false){
		var now = new Date();	
		var delayFrame = now - dateDernierAnim;
		if(delayFrame>=200){
			character.animationStepX++;
			if(character.animationStepX>3) {character.animationStepX=0;}
			dateDernierAnim = now;
		}
	}
	
	dateDernierFrame = new Date();
}

//Fonction déterminant la direction à adopter lors d'un déplacement à la souris.
function mouseMoving(){
	
	var X = character.posX + 68; //Position X du centre de l'image.
	var Y = character.posY + 68; //Position Y du centre de l'image.
	
	//Le personnage commence à se déplacer selon l'axe Y.
	//Dans une fourchette de 2 pixels, on considère que le personnage est à la bonne ordonnée.
	if(Y > mouse.clickedY + 2){
		character.direction = "up";
	}
	else if(Y < mouse.clickedY - 2){
		character.direction = "down";
	}
	//Le personnage se déplace ensuite selon l'axe X.
	//Dans une fourchette de 2 pixels, on considère que le personnage est à la bonne abscisse.
	else{
		if(X > mouse.clickedX + 2){
			character.direction = "left";
		}
		else if(X < mouse.clickedX - 2){
			character.direction = "right";
		}
		//Une fois la bonne valeur de X atteinte, le personnage est considéré à la bonne position.
		//On arrête le déplacement du personnage.
		else{
			mouse.clicked = false;
			character.direction = false;
		}
	}
}

//Fonction gérant l'affichage du personnage.
function drawCharacter(){
	ctx.drawImage(character.sprite,128*character.animationStepX,128*character.animationStepY,128,128,character.posX,character.posY,128,128);
}

//Acquière les inputs du joueur.
window.addEventListener("keydown", function (event) {
  if (event.defaultPrevented) {
    return; // Should do nothing if the key event was already consumed.
  }

  switch (event.keyCode) {
    case 40:
      // Do something for "down arrow" key press.
	  keys.down = true;
      break;
    case 38:
      // Do something for "up arrow" key press.
	  keys.up=true;
      break;
    case 37:
      // Do something for "left arrow" key press.
	  keys.left=true;
      break;
    case 39:
      // Do something for "right arrow" key press.
	  keys.right=true;
      break;
    case 13:
      // Do something for "enter" or "return" key press.
	  keys.enter=true;
      break;
    case 27:
      // Do something for "esc" key press.
	  keys.escape=true;
      break;
    default:
      return; // Quit when this doesn't handle the key event.
  }

  // Consume the event for suppressing "double action".
  event.preventDefault();
}, true);

//Acquière la fin des inputs du joueur.
window.addEventListener("keyup", function (event) {
	switch (event.keyCode) {
    case 40:
      // Do something for "down arrow" key press.
	  keys.down = false;
      break;
    case 38:
      // Do something for "up arrow" key press.
	  keys.up=false;
      break;
    case 37:
      // Do something for "left arrow" key press.
	  keys.left=false;
      break;
    case 39:
      // Do something for "right arrow" key press.
	  keys.right=false;
      break;
    case 13:
      // Do something for "enter" or "return" key press.
	  keys.enter=false;
      break;
    case 27:
      // Do something for "esc" key press.
	  keys.escape=false;
      break;
    default:
      return; // Quit when this doesn't handle the key event.
  }
}, true);

//Gère le pseudo-click sur le canvas.
canvas.addEventListener("mousedown", function (event) {
	var rect = canvas.getBoundingClientRect();
	mouse.clicked = true;
	mouse.clickedX = event.clientX - rect.left;
	mouse.clickedY = event.clientY - rect.top;
},true);

//Boucle de jeu.
function jeu(){
		aquisition();
		updateWorld();
		drawScreen();
		requestAnimationFrame(jeu);
}

//Lancement de la boucle de jeu.
requestAnimationFrame(jeu);