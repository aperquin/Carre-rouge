var shapes=[]; //Tableau contenant l'ensemble des carrés.
var dixieme = 0; //Variable comptant les dixèmes de secondes.
var attente = 4; //Nombre de secondes à attendre avant le lancement de l'animation.
var ecart = 1; //Nombre de secondes à attendre entre le lancement de deux carrés.

//Fonction créant les 10 premiers carrés de base.
function makeShapes(){
	for (j=1; j<=10; j++){
		makeCarre();
	}
}

//Fonction créant un carré en lui initialisant ses attributs de base.
function makeCarre(){ 
	Nvcarre = document.createElement("div");
	Nvcarre.setAttribute("class", "carre");
	Nvcarre.style.top = 50*shapes.length + 50 +"px";
	Nvcarre.style.left = 0;
	shapes.push(Nvcarre); 
	document.body.appendChild(Nvcarre);
}

//Fonction permettant à un carré de se déplacer.
function moveCarre(i){
	//On acquière dans "gauche" la position actuelle du carré i.
	var gauche = eval(shapes[i].style.left.substr(0,shapes[i].style.left.length-2));
	//On décale le carré i de 10 pixels vers la droite.
	shapes[i].style.left = gauche+10+"px";
}

//Fonction permettant à l'ensemble des carrés de se déplacer.
function move(){
	if(dixieme/10>=attente){
		for(j=0;j<shapes.length;j++){
			if(dixieme/10>=ecart*j+attente){
				moveCarre(j);
			}
		}
	}
}

function actionCompteur(){
	var elem = document.getElementById("chrono");
	elem.innerHTML = dixieme/10;
	dixieme++;
	move();
}

compteID = setInterval(actionCompteur,100);
