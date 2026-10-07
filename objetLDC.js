// ============================================================
// CLASSE LIGNE DE CHAMP
// ============================================================

class LigneDeChamp {

  constructor(posX, posY, ppas) {
    this.x0 = posX;
    this.y0 = posY;
    this.pas = ppas;
  }

  display() {
    strokeWeight(2);
    stroke(153);
    fill(0, 153, 204, 150);
    let xxx1;
    let yyy1;
    let xx1;
    let yy1;
    let angle;
    // --------------------------------------------------------
    // Sens positif du champ
    // --------------------------------------------------------
    xx1 = this.x0;
    yy1 = this.y0;
    xxx1 = decX + this.x0;
    yyy1 = decY + this.y0;
    push();
    translate(this.x0, this.y0);
    let v = champ(xxx1, yyy1);
    angle = v.heading();
    rotate(angle);
    // Flèche initiale
    beginShape(TRIANGLES);
    vertex(-6, 2);
    vertex(0, 0);
    vertex(-6, -2);
    endShape();
    rotate(-angle);
    while (NoFrontiere(xxx1,yyy1,armatureN) && NoFrontiere(xxx1,yyy1,armatureP) && champ(xxx1, yyy1).mag() !== 0){
      angle = champ(xxx1,yyy1).heading();
      xx1 += this.pas * cos(angle);
      yy1 += this.pas * sin(angle);
      xxx1 = floor(decX + xx1);
      yyy1 = floor(decY + yy1);
      line(0, 0, this.pas * cos(angle), this.pas * sin(angle));
      translate(this.pas * cos(angle),this.pas * sin(angle));
    }
    pop();
    // --------------------------------------------------------
    // Sens opposé du champ
    // --------------------------------------------------------
    xx1 = this.x0;
    yy1 = this.y0;
    xxx1 = decX + this.x0;
    yyy1 = decY + this.y0;
    push();
    translate(xx1, yy1);
    while (
      NoFrontiere(xxx1, yyy1, armatureN ) && NoFrontiere(xxx1, yyy1, armatureP) && champ(xxx1, yyy1).mag() !== 0) {
        angle = champ(xxx1,yyy1).heading();
        xx1 += this.pas * cos(angle + PI);
        yy1 += this.pas * sin(angle + PI);
        xxx1 = floor(decX + xx1);
        yyy1 = floor(decY + yy1);
        line(0, 0,this.pas * cos(angle + PI),this.pas * sin(angle + PI));
        translate(this.pas * cos(angle + PI),this.pas * sin(angle + PI));
      }
      pop();
      strokeWeight(1);
    }
  }
