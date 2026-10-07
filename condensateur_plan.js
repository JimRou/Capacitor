// © J. Roussel

// Champs créés par un condensateur plan.
// Résolution numérique de l'équation de Laplace.
// Le condensateur est entouré par un conducteur carré porté au potentiel nul. Le condensateur est portée à une tension 2V0 et l'espacement vaut 2a.
// Travail inspiré du code processing de 05/2016
//
// Commandes :
//   setLigne(1) : ajouter des lignes de champ
//   setLigne(2) : ajouter des équipotentielles
//   EffaceLignes() : effacer les tracés
//   ChangeAfficheMagnitude() : afficher/masquer la carte d'intensité
//
// Souris :
//   - Cliquer sur une armature pour la déplacer
//   - Cliquer dans le champ pour ajouter une ligne/equipotentielle
//
// ------------------------------------------------------------


// ============================================================
// VARIABLES GLOBALES
// ============================================================

let N;
let ell;                 // demi-largeur du condensateur
let a;                   // demi-espacement des armatures
let b;                   // demi-largeur du conducteur carré
let V0;                  // potentiel des armatures

let decX, decY;          //l'origine du cadre que l'on visualise est décalée par rapport à l'origine de la masse carré

// Tableau du potentiel.
// Float32Array est beaucoup plus efficace qu'un tableau JS 2D.
let V;

let lignes = [];
let equipot = [];

let armatureP;
let armatureN;

// booléens
let afficheMagnitude = false;
let over1 = false;
let over2 = false;
let move1 = false;
let move2 = false;

// ============================================================
// CONTRÔLES TACTILES
// ============================================================
let Ligne = 1;
let boutonChamp;
let boutonEquipot;
let boutonEfface;
let boutonMagnitude;

// ============================================================
// SETUP
// ============================================================

function setup() {
  createCanvas(300, 250);
  
  // Frontière V = 0 de dimension 2b x 2b
  b = 250;

  // Réseau NxN
  N = 2 * b;

  // Décalage entre le repère numérique et la fenêtre
  decX = b - floor(width / 2);
  decY = b - floor(height / 2);

  // Champ potentiel V(X,Y), (X,Y) in (N+1) x (N+1)
  // On utilise un tableau 1D pour accélérer les accès.
  V = new Float32Array((N + 1) * (N + 1));

  // Demi-espacement entre les armatures
  a = 20;

  // Potentiel des armatures
  V0 = 10;

  // Demi-largeur des armatures
  ell = 99;

  // Armatures positive et négative
  armatureP = new Plaque(b,b - a,ell,4,V0,false);
  armatureN = new Plaque(b,b + a,ell,4,-V0,false);
  
  //liste initialement vide de lignes de champs et d'équipotentielle
  lignes = [];
  equipot = [];

  // Initialisation de la frontière V = 0
  initialisationBord();

  // Initialisation des armatures
  initialisation();

  // Relaxation initiale
  relaxation2(200);
  creerControles();
}


// ============================================================
// DRAW
// ============================================================

function draw() {
  // Relaxation à chaque image (4 itérations)
  relaxation2(4);

  // Carte du champ électrique
  draw_champ(decX, decY);

  // ----------------------------------------------------------
  // Interaction utilisateur avec l'armature positive
  // ----------------------------------------------------------
  if ( !NoFrontiere(decX + mouseX,decY + mouseY, armatureP) && !afficheMagnitude) {
    over1 = true;
    armatureP.inverted = true;
  } 
  else {
    over1 = false;
    armatureP.inverted = false;
  }
  // Déplacement armature positive
  if (move1) {
    armatureP.x = decX + mouseX;
    armatureP.y = decY + mouseY;
    initialisation();
  }


  // ----------------------------------------------------------
  // Interaction utilisateur avec l'armature négative
  // ----------------------------------------------------------
  if ( !NoFrontiere(decX + mouseX, decY + mouseY, armatureN) && !afficheMagnitude) {
    over2 = true;
    armatureN.inverted = true;
  } 
  else {
    over2 = false;
    armatureN.inverted = false;
  }
  // Déplacement armature négative
  if (move2) {
    armatureN.x = decX + mouseX;
    armatureN.y = decY + mouseY;
    initialisation();
  }

  // ----------------------------------------------------------
  // Carte d'intensité
  // ----------------------------------------------------------
  if (afficheMagnitude) {map_champE(decX, decY);}

  // ----------------------------------------------------------
  // Tracé des lignes de champ
  // ----------------------------------------------------------
  for (let i = lignes.length - 1; i >= 0; i--) {
    lignes[i].display();
  }

  // ----------------------------------------------------------
  // Tracé des Équipotentielles
  // ----------------------------------------------------------
  for (let i = equipot.length - 1; i >= 0; i--) {
    equipot[i].display();
  }

  // ----------------------------------------------------------
  // Tracé des Armatures
  // ----------------------------------------------------------
  armatureP.display();
  armatureN.display();
}


// ============================================================
// INDEXATION DU TABLEAU V
// ============================================================
function indexV(x, y) {
  return x * (N + 1) + y;
}

// ============================================================
// TEST : POINT SUR UNE ARMATURE
// ============================================================

function NoFrontiere(x, y, p) {
  if (abs(x - p.x) < p.half_largeur && abs(y - p.y) < p.half_hauteur) {
    return false;
  }
  return true;
}

// ============================================================
// INITIALISATION DE LA FRONTIÈRE
// ============================================================
function initialisationBord() {
  for (let i = 0; i <= N; i++) {
    V[indexV(i, 0)] = 0;
    V[indexV(i, N)] = 0;
    V[indexV(0, i)] = 0;
    V[indexV(N, i)] = 0;
    V[indexV(i, 1)] = 0;
    V[indexV(i, N - 1)] = 0;
    V[indexV(1, i)] = 0;
    V[indexV(N - 1, i)] = 0;
  }
}

// ============================================================
// INITIALISATION DES ARMATURES
// ============================================================
function initialisation() {
  // Suppression des lignes précédentes
  lignes = [];
  // Suppression des équipotentielles précédentes
  equipot = [];
  for (let i = 2; i <= N - 2; i++) {
    for (let j = 2; j <= N - 2; j++) {
      if (!NoFrontiere(i, j, armatureP)) {V[indexV(i, j)] = armatureP.potential;}
      if (!NoFrontiere(i, j, armatureN)) {V[indexV(i, j)] = armatureN.potential;}
    }
  }
}

// ============================================================
// RELAXATION 2M itérations
// ============================================================
function relaxation2(M) {
  // Relaxation rapide sur une moitié des points
  for (let k = 0; k < M; k++) {
    for (let i = 2; i <= N - 2; i += 2) {
      for (let j = 2; j <= N - 2; j += 2) {
        if (NoFrontiere(i, j, armatureP) && NoFrontiere(i, j, armatureN)) {
          V[indexV(i, j)] = 0.25 * (V[indexV(i - 2, j)] + V[indexV(i + 2, j)] + V[indexV(i, j - 2)] + V[indexV(i, j + 2)]);
        }
      }
    }
  }
  // Relaxation appliquée à tous les points (gain en précision)
  for (let k = 0; k < 2 * M; k++) {
    for (let i = 2; i <= N - 2; i++) {
      for (let j = 2; j <= N - 2; j++) {
        if (NoFrontiere(i, j, armatureP) && NoFrontiere(i, j, armatureN)) {
          V[indexV(i, j)] = 0.2 * (V[indexV(i - 1, j)] + V[indexV(i + 1, j)] + V[indexV(i, j - 1)] + V[indexV(i, j + 1)]) + 0.05 * (V[indexV(i - 1, j - 1)] + V[indexV(i - 1, j + 1)] + V[indexV(i + 1, j - 1)] + V[indexV(i + 1, j + 1)]);
        }
      }
    }
  }
}

// ============================================================
// CHAMP ÉLECTRIQUE
// ============================================================
function champ(xx, yy) {
  if (xx < 2 || xx > N - 2 || yy < 2 ||  yy > N - 2) {return createVector(0, 0);}
  return createVector(V[indexV(xx - 1, yy)] -  V[indexV(xx + 1, yy)], V[indexV(xx, yy - 1)] -  V[indexV(xx, yy + 1)]);
}


function champX(x, y) {
  if (x < 2 || x > N - 2 || y < 2 || y > N - 2) {return 0;}
  return (V[indexV(x - 1, y)] - V[indexV(x + 1, y)]);
}

function champY(x, y) {
  if (x < 2 || x > N - 2 || y < 2 || y > N - 2) {return 0;}
  return (V[indexV(x, y - 1)] - V[indexV(x, y + 1)]);
}

// ============================================================
// CARTE DU CHAMP
// ============================================================
function draw_champ(posX, posY) {
  background(64);
  strokeWeight(1);
  stroke(153);
  fill(153);
  const arrowsize = 4;
  const len = 10;
  for (let i = 0; i < width; i += 30) {
    for (let j = 0; j < height; j += 30) {
      const vector = createVector(champX(posX + i, posY + j), champY(posX + i, posY + j));
      if (vector.mag() !== 0) {
        push();
        translate(i, j);
        rotate(vector.heading());
        // dessin de la flèche
        line(0, 0, len, 0);
        //line(len, 0,len - arrowsize,arrowsize / 2);
        //line(len, 0, len - arrowsize,-arrowsize / 2);
        triangle(len,0,len-arrowsize,arrowsize/2,len-arrowsize,-arrowsize/2);
        pop();
      }
    }
  }
}

// ============================================================
// CARTE D'INTENSITÉ
// ============================================================
function map_champE(posX, posY) {
  let z;
  strokeWeight(2);
  for (let i = 0; i < width; i += 2) {
    for (let j = 0; j < height; j += 2) {
      const cx = champX(posX + i, posY + j);
      const cy = champY(posX + i, posY + j);
      z = sqrt(cx * cx + cy * cy);
      stroke(echelleCouleur(z));
      point(i, j);
    }
  }
}

// ============================================================
// ÉCHELLE DE COULEURS
// ============================================================
function echelleCouleur(z) {
  let b;
  let R;
  let G;
  let B;

  // Rouge
  if (z <= 0.25) {b = 0;} 
  else if (z >= 0.57) {b = 1;} 
  else {b = z / 0.32 - 0.78125;}
  R = 255 * b;
  // Vert
  if (z <= 0.42) {b = 0;} 
  else if (z >= 0.92) {b = 1;} 
  else {b = 2 * z - 0.84;}
  G = 255 * b;
  // Bleu
  if (z <= 0.42) {b = 4 * z;} 
  else if (z >= 0.92) {b = z / 0.08 - 11.5;} 
  else {b = -2 * z + 1.84;}
  B = 255 * b;
  return color(R, G, B);
}

// ============================================================
// COMMANDES GUI
// ============================================================
function setLigne(n) {Ligne = n;}

function EffaceLignes() {
  lignes = [];
  equipot = [];
}

function ChangeAfficheMagnitude() {afficheMagnitude = !afficheMagnitude;}

function mousePressed() {
  // Ligne de champ
  if (Ligne === 1 && !over1 && !over2) {
    lignes.push(new LigneDeChamp(mouseX,mouseY,2));
  }
  // Équipotentielle
  if (Ligne === 2 && !over1 && !over2) {
    equipot.push(new Equipotentielle(mouseX,mouseY,4));
  }
  // Déplacement armatures
  if (over1) {move1 = true;}
  if (over2) {move2 = true;}
}

function mouseReleased() {
  move1 = false;
  move2 = false;
}

function keyPressed() {
  // 1 : lignes de champ
  if (key === '1') {setLigne(1);}
  // 2 : équipotentielles
  if (key === '2') {setLigne(2);}
  // Espace : effacer les lignes
  if (key === ' ') {ChangeAfficheMagnitude();}
  // M : afficher/masquer la magnitude du champ
  if (key === 'r' || key === 'R') {
    EffaceLignes();
  }
}

// pour les smartphones
function touchStarted() {return mousePressed();}
function touchMoved() {return mouseDragged();}
function touchEnded() {return mouseReleased();}



function creerControles() {
  // Lignes de champ
  boutonChamp = createButton("Lignes de champ");
  boutonChamp.mousePressed(() => {setLigne(1);});
  // Équipotentielles
  boutonEquipot = createButton("Équipotentielles");
  boutonEquipot.mousePressed(() => {setLigne(2);});
  // Effacer
  boutonEfface = createButton("Effacer");
  boutonEfface.mousePressed(() => {EffaceLignes();});
  // Intensité
  boutonMagnitude = createButton("Intensité");
  boutonMagnitude.mousePressed(() => {ChangeAfficheMagnitude();});
  // ----------------------------------------------------------
  // Mise en forme
  // ----------------------------------------------------------
  let boutons = [boutonChamp,boutonEquipot,boutonEfface,boutonMagnitude];
  for (let bouton of boutons) {
    bouton.style("font-size", "16px");
    bouton.style("padding", "12px 16px");
    bouton.style("margin", "4px");
    bouton.style("border-radius", "8px");
    bouton.style("border", "1px solid #999");
    bouton.style("background", "#eeeeee");
    bouton.style("touch-action", "manipulation");
  }
}
