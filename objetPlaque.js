// ============================================================
// CLASSE PLAQUE
// ============================================================

class Plaque {

  constructor(xx,yy,ll,hh,pp,ii) {
    this.x = xx;
    this.y = yy;
    this.half_largeur = ll;
    this.half_hauteur = hh;
    this.potential = pp;
    this.inverted = ii;
  }

  display() {
    noStroke();
    if (this.inverted) {fill(250, 0, 230);} 
    else {fill(153);}
    rect(this.x - decX - this.half_largeur,this.y - decY - this.half_hauteur,2 * this.half_largeur,2 * this.half_hauteur);
    stroke(255);
    if (this.potential > 0) {
      // Symbole +
      line(this.x - decX,this.y - decY - this.half_hauteur,this.x - decX,this.y - decY + this.half_hauteur);
      line(this.x - decX - this.half_hauteur,this.y - decY,this.x - decX + this.half_hauteur,this.y - decY);
    } 
    else {
      // Symbole -
      line(this.x - decX - this.half_hauteur,this.y - decY,this.x - decX + this.half_hauteur,this.y - decY);
    }
  }
}
