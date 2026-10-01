// 十字キーでプレイヤーを移動
// 白い弾幕に触れるとゲームオーバー
// 青い円は弾幕を抑え、持ち上げることも出来る
// 黄色のアイテムに触れるとスコアを1つ獲得
//
// ゲーム開始前は当たり判定がない
// 操作確認も兼ねて、任意の場所から始めよう
// 起動時、プレイヤーが動かない場合はウインドウをクリックすること

const BULLET_COUNT = 170;

// プレイヤーの座標、移動速度
let px = 450.0; // 初期位置(x)
let py = 500.0; // 初期位置(y)
const speed = 3.0;

// 弾幕の位置、大きさ
let x = [];
let y = [];
let z = [];

// アイテムの生成座標
let sx, sy;

// スタート、ミス、スコア
let start = false;
let end = false;
let score = 0;

function setup() {
  createCanvas(900, 1000);
  textFont('sans-serif');

  // p5.jsではsetup()より前にrandom()を呼べないので、ここで初期化する
  sx = random(100, 800);
  sy = random(100, 900);

  for (let i = 0; i < BULLET_COUNT; i++) {
    x[i] = random(0, 900);
    y[i] = random(0, 1000);
    z[i] = random(17, 65);
  }
}

function draw() {
  background(0);
  fill(255);
  strokeWeight(1);
  noFill();
  stroke(255);

  // ゲーム開始のフラグ (Rキー)
  if (keyIsDown(82)) {
    start = true;
  }

  rainEnemy();   // 弾幕
  drawHeart(0.7); // プレイヤー
  deco();        // 装飾
}

function drawHeart(size) {
  // アシストカーソル
  noStroke();
  fill(0, 0, 255, 150);
  ellipse(mouseX, mouseY, 50, 50);

  if (!start) {
    fill(255, 0, 0, 150);
  } else {
    fill(255, 0, 0);
  }

  // プレイヤー(ハート型)
  strokeJoin(ROUND);
  push();
  translate(px, py);
  beginShape();
  for (let theta = 0; theta < 360; theta++) {
    const t = radians(theta);
    const hx = size * (13 * sin(t) * sin(t) * sin(t));
    const hy = -size * (13 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t));
    vertex(hx, hy);
  }
  endShape(CLOSE);
  pop();

  // 移動(元のコードと違い、斜め移動もできる)
  if (keyIsDown(RIGHT_ARROW)) px += speed;
  if (keyIsDown(LEFT_ARROW))  px -= speed;
  if (keyIsDown(UP_ARROW))    py -= speed;
  if (keyIsDown(DOWN_ARROW))  py += speed;

  // 壁判定
  px = constrain(px, 30, 870);
  py = constrain(py, 30, 970);

  playerSetting();
}

function playerSetting() {
  if (!start) return;

  // 弾幕との当たり判定
  for (let i = 0; i < BULLET_COUNT; i++) {
    if (dist(px, py + 20, x[i], y[i]) <= (z[i] + 15) / 2.5) {
      stroke(0);
      strokeWeight(2);
      line(px + 2, py - 10, px + 3, py - 2);
      line(px + 3, py - 2, px - 2, py + 2);
      line(px - 2, py + 2, px, py + 11);
      end = true;
    }
  }

  // アイテム(ハート型の曲線で描画)
  const delta = TWO_PI / 100;
  const A = 20;
  fill(255, 255, 0);
  beginShape();
  for (let t = 0; t < TWO_PI; t += delta) {
    vertex(sx + A * pow(cos(t), 3), sy + A * pow(sin(t), 3));
  }
  endShape(CLOSE);

  // アイテム取得
  if (dist(px, py, sx, sy) < 22) {
    score += 1;
    sx = random(200, 800);
    sy = random(200, 800);
  }
}

// ゲームオーバー後にクリックでリトライ
function mousePressed() {
  if (end) {
    start = false;
    end = false;
    score = 0;
    sx = random(100, 800);
    sy = random(100, 900);
    px = 450.0;
    py = 500.0;
    loop();
  }
}

// 矢印キーでページがスクロールするのを防ぐ
function keyPressed() {
  if ([UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW].includes(keyCode)) {
    return false;
  }
}

function rainEnemy() {
  for (let i = 0; i < BULLET_COUNT; i++) {
    ellipse(x[i], y[i] - 20, z[i], z[i]);

    // カーソルに触れていない間は落下、触れていると押さえて持ち上げる
    if (!isNeighbor(x[i], y[i] - 20, mouseX, mouseY, z[i])) {
      y[i] += random(0.01, 2.0);
    } else {
      y[i] = mouseY - 40;
    }

    // 画面下に消えたら上に戻す。x座標もランダムに
    if (y[i] > 1050) {
      y[i] = 0;
      x[i] = random(0, 900);
    }
  }
}

function isNeighbor(x1, y1, x2, y2, distance) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy < distance * distance;
}

function deco() {
  // 弾幕に当たったとき
  if (end) {
    noLoop();
    noStroke();
    textSize(120);
    fill(255);
    text("Game Over", 160, 280);
    textSize(75);
    text("SCORE " + score, 290, 360);
    textSize(50);
    text("Click to Restart", 270, 800);
  }

  // 枠の飾り
  noFill();
  stroke(200);
  strokeWeight(40);
  rect(10, 10, 880, 980);
  stroke(120, 0, 110);
  strokeWeight(50);
  rect(0, 0, 900, 1000);

  // タイトルテキスト
  if (!start) {
    noStroke();
    textSize(120);
    fill(255);
    text("Collect Items!", width / 7.7, height / 3.5);
    textSize(60);
    text("check your control", 220, height / 2.8);
    textSize(30);
    text("↑", 440, 480);
    text("←　→", 415, 505);
    text("↓", 440, 533);
    textSize(55);
    text("'R' START", 340, 800);
  }
}
