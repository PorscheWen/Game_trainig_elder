'use strict';
const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

registerFont('C:/Windows/Fonts/msjhbd.ttc', { family: 'JhengHei', weight: 'bold' });
registerFont('C:/Windows/Fonts/msjh.ttc',   { family: 'JhengHei' });
registerFont('C:/Windows/Fonts/seguiemj.ttf', { family: 'Emoji' });

const W = 2500, H = 1686;
const COLS = 3, ROWS = 2;
const cellW = Math.floor(W / COLS);   // 833
const cellH = Math.floor(H / ROWS);  // 843

const games = [
  { label: '翻牌記憶',   sub: '',           hint: '點我開始', icon: '🧠', color: '#6C63FF' },
  { label: '水果消消樂', sub: '',           hint: '點我開始', icon: '🍎', color: '#2DB37A' },
  { label: '數字拼圖',   sub: '2048',       hint: '點我開始', icon: '🔢', color: '#E85D3B' },
  { label: '文字接龍',   sub: '',           hint: '點我開始', icon: '✏️', color: '#3A86D9' },
  { label: '數獨',       sub: '簡易版',     hint: '點我開始', icon: '🎯', color: '#8E44AD' },
  { label: '分享遊戲',   sub: '邀朋友來挑戰', hint: '點我分享', icon: '📤', color: '#E67E22' },
];

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    const g = games[row * COLS + col];
    const x = col * cellW;
    const y = row * cellH;

    // 背景色
    ctx.fillStyle = g.color;
    ctx.fillRect(x, y, cellW, cellH);

    // 漸層覆蓋
    const grad = ctx.createLinearGradient(x, y, x, y + cellH);
    grad.addColorStop(0, 'rgba(255,255,255,0.10)');
    grad.addColorStop(1, 'rgba(0,0,0,0.15)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, cellW, cellH);

    const cx = x + cellW / 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Emoji icon
    ctx.font = '190px "Emoji"';
    ctx.fillStyle = 'white';
    ctx.fillText(g.icon, cx, y + cellH * 0.30);

    // 遊戲名稱
    ctx.font = 'bold 138px "JhengHei"';
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 10;
    ctx.fillText(g.label, cx, y + cellH * (g.sub ? 0.55 : 0.60));

    // 副標題
    if (g.sub) {
      ctx.font = '88px "JhengHei"';
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.shadowBlur = 6;
      ctx.fillText(g.sub, cx, y + cellH * 0.71);
    }

    ctx.shadowBlur = 0;

    // 底部提示
    ctx.font = '68px "JhengHei"';
    ctx.fillStyle = 'rgba(255,255,255,0.60)';
    ctx.fillText(g.hint, cx, y + cellH * 0.91);
  }
}

// 分格線
ctx.strokeStyle = 'rgba(0,0,0,0.18)';
ctx.lineWidth = 6;
for (let col = 1; col < COLS; col++) {
  ctx.beginPath();
  ctx.moveTo(col * cellW, 0);
  ctx.lineTo(col * cellW, H);
  ctx.stroke();
}
ctx.beginPath();
ctx.moveTo(0, cellH);
ctx.lineTo(W, cellH);
ctx.stroke();

const outPath = path.join(__dirname, '..', 'richmenu.png');
fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
console.log(`✅ 生成 richmenu.png (${W}×${H})`);
