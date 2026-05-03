'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');

const ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const GAME_URL = process.env.GAME_URL || 'https://porschewen.github.io/GrannysGotGame/';

if (!ACCESS_TOKEN) {
  console.error('[setup] 缺少 LINE_CHANNEL_ACCESS_TOKEN');
  process.exit(1);
}

const base = GAME_URL.replace(/\/?$/, '/');
/** Rich Menu 六格：導向大廳「團體最高分」分頁 */
const lobbyScoresUrl = `${base}games.html#scores`;
const memoryUrl = lobbyScoresUrl;
const fruitUrl = lobbyScoresUrl;
const puzzle2048Url = lobbyScoresUrl;
const wordchainUrl = lobbyScoresUrl;
const sudokuUrl = lobbyScoresUrl;
const moleUrl = lobbyScoresUrl;

/* 點擊區與 generate_richmenu.js 網格一致（頂 200px 標題 + 下方六格） */

async function lineApi(method, endpoint, body) {
  const res = await fetch(`https://api.line.me${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`LINE API ${res.status}: ${text}`);
  return text ? JSON.parse(text) : {};
}

async function uploadImage(richMenuId) {
  const imgPath = path.join(__dirname, '..', 'richmenu.png');
  const img = fs.readFileSync(imgPath);
  const res = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'image/png',
    },
    body: img,
  });
  if (!res.ok) throw new Error(`圖片上傳失敗 ${res.status}: ${await res.text()}`);
}

async function main() {
  const { richmenus = [] } = await lineApi('GET', '/v2/bot/richmenu/list');
  for (const rm of richmenus) {
    await lineApi('DELETE', `/v2/bot/richmenu/${rm.richMenuId}`);
    console.log(`[setup] 刪除舊 rich menu: ${rm.richMenuId}`);
  }

  const { richMenuId } = await lineApi('POST', '/v2/bot/richmenu', {
    size: { width: 2500, height: 1686 },
    selected: true,
    name: '連阿嬤都贏你｜團體最高分',
    chatBarText: '🏆 團體最高分（LINE）',
    areas: [
      { bounds: { x: 0, y: 200, width: 833, height: 743 }, action: { type: 'uri', label: '翻牌｜高分', uri: memoryUrl } },
      { bounds: { x: 833, y: 200, width: 834, height: 743 }, action: { type: 'uri', label: '消消樂｜高分', uri: fruitUrl } },
      { bounds: { x: 1667, y: 200, width: 833, height: 743 }, action: { type: 'uri', label: '2048｜高分', uri: puzzle2048Url } },
      { bounds: { x: 0, y: 943, width: 833, height: 743 }, action: { type: 'uri', label: '接龍｜高分', uri: wordchainUrl } },
      { bounds: { x: 833, y: 943, width: 834, height: 743 }, action: { type: 'uri', label: '數獨｜高分', uri: sudokuUrl } },
      { bounds: { x: 1667, y: 943, width: 833, height: 743 }, action: { type: 'uri', label: '地鼠｜高分', uri: moleUrl } },
    ],
  });
  console.log(`[setup] 建立 rich menu: ${richMenuId}`);

  await uploadImage(richMenuId);
  console.log('[setup] 圖片上傳完成');

  await lineApi('POST', `/v2/bot/user/all/richmenu/${richMenuId}`);
  console.log('[setup] ✅ Rich menu 設定完成，已套用至所有用戶');
}

main().catch(e => {
  console.error('[setup] 失敗:', e.message);
  process.exit(1);
});
