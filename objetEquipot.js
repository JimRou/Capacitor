// ============================================================
// CLASSE ÉQUIPOTENTIELLE
// ============================================================

class Equipotentielle {
  constructor(posX, posY, ppas) {
    this.x0 = posX;
    this.y0 = posY;
    this.pas = ppas;
  }

  display() {
    strokeWeight(1);
    stroke(255, 157, 0);
    let xx1;
    let yy1;
    let ddist;
    let distance;
    let angle;
    let compteur = 0;
    let stop = false;
    xx1 = this.x0;
    yy1 = this.y0;
    while (!stop) {
      // Première estimation
      angle = champ(floor(decX + xx1),floor(decY + yy1)).heading() + HALF_PI;
      // RK2
      angle = champ(floor(decX +  xx1 + 0.5 * this.pas * cos(angle)), floor(decY + yy1 + 0.5 * this.pas * sin(angle))).heading() + HALF_PI;
      if (compteur % 2 === 0) {
        line(xx1, yy1,  xx1 + this.pas * cos(angle), yy1 + this.pas * sin(angle));
      }
      compteur++;
      ddist = -dist(xx1, yy1, this.x0, this.y0);
      xx1 += this.pas * cos(angle);
      yy1 += this.pas * sin(angle);
      distance = dist(xx1, yy1, this.x0, this.y0);
      ddist += distance;
      if ((distance < 2 * this.pas &&   ddist < 0) || compteur > 300) {stop = true;}
    }
  }
}
