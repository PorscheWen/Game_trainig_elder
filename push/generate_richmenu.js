'use strict';
const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

registerFont('C:/Windows/Fonts/msjhbd.ttc', { family: 'JhengHei', weight: 'bold' });
registerFont('C:/Windows/Fonts/msjh.ttc',   { family: 'JhengHei' });
registerFont('C:/Windows/Fonts/seguiemj.ttf', { family: 'Emoji' });

const W = 2500;
const H = 1686;
const HEADER_H = 200;
const COLS = 3;
const ROWS = 2;
const gridTop = HEADER_H;
const gridH = H - HEADER_H;
const cellW = Math.floor(W / COLS);
const cellH = Math.floor(gridH / ROWS);

const games = [
  { label: '翻牌記憶',   sub: '最佳時間・翻牌數', hint: '點格看高分', icon: '🧠', color: '#6C63FF' },
  { label: '水果消消樂', sub: '最高分說明',     hint: '點格看高分', icon: '🍎', color: '#2DB37A' },
  { label: '數字拼圖',   sub: '2048 最高分',    hint: '點格看高分', icon: '🔢', color: '#E85D3B' },
  { label: '文字接龍',   sub: '接詞最高紀錄',   hint: '點格看高分', icon: '✏️', color: '#3A86D9' },
  { label: '數獨',       sub: '各題最佳時間',   hint: '點格看高分', icon: '🎯', color: '#8E44AD' },
  { label: '打地鼠',     sub: '關卡說明',       hint: '點格看高分', icon: '🔨', color: '#7B5E3C' },
];

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

/* 頂部：最高分紀錄版標題 */
ctx.fillStyle = '#3D4EAC';
ctx.fillRect(0, 0, W, HEADER_H);
const hg = ctx.createLinearGradient(0, 0, 0, HEADER_H);
hg.addColorStop(0, 'rgba(255,255,255,0.12)');
hg.addColorStop(1, 'rgba(0,0,0,0.08)');
ctx.fillStyle = hg;
ctx.fillRect(0, 0, W, HEADER_H);

ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillStyle = '#FFFFFF';
ctx.font = 'bold 108px "JhengHei"';
ctx.shadowColor = 'rgba(0,0,0,0.25)';
ctx.shadowBlur = 12;
ctx.fillText('🏆 各遊戲個人最高紀錄', W / 2, HEADER_H * 0.38);
ctx.shadowBlur = 0;
ctx.font = '52px "JhengHei"';
ctx.fillStyle = 'rgba(255,255,255,0.88)';
ctx.fillText('點下方格子查看各遊戲個人高分明細', W / 2, HEADER_H * 0.78);

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const g = games[row * COLS + col];
    const x = col * cellW;
    const y = gridTop + row * cellH;

    ctx.fillStyle = g.color;
    ctx.fillRect(x, y, cellW, cellH);

    const grad = ctx.createLinearGradient(x, y, x, y + cellH);
    grad.addColorStop(0, 'rgba(255,255,255,0.10)');
    grad.addColorStop(1, 'rgba(0,0,0,0.15)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, cellW, cellH);

    const cx = x + cellW / 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '175px "Emoji"';
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 10;
    ctx.fillText(g.icon, cx, y + cellH * 0.28);
    ctx.shadowBlur = 0;

    ctx.font = 'bold 118px "JhengHei"';
    ctx.fillStyle = 'white';
    ctx.shadowBlur = 8;
    ctx.fillText(g.label, cx, y + cellH * (g.sub ? 0.52 : 0.56));

    if (g.sub) {
      ctx.font = '62px "JhengHei"';
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.shadowBlur = 5;
      ctx.fillText(g.sub, cx, y + cellH * 0.67);
    }

    ctx.shadowBlur = 0;
    ctx.font = '56px "JhengHei"';
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.fillText(g.hint, cx, y + cellH * 0.88);
  }
}

ctx.strokeStyle = 'rgba(0,0,0,0.18)';
ctx.lineWidth = 6;
for (let col = 1; col < COLS; col++) {
  ctx.beginPath();
  ctx.moveTo(col * cellW, gridTop);
  ctx.lineTo(col * cellW, H);
  ctx.stroke();
}
ctx.beginPath();
ctx.moveTo(0, gridTop + cellH);
ctx.lineTo(W, gridTop + cellH);
ctx.stroke();

const outPath = path.join(__dirname, '..', 'richmenu.png');
fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
console.log(`✅ 生成 richmenu.png (${W}×${H}) 最高分紀錄版，頂部標題高 ${HEADER_H}px`);
