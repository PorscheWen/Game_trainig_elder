'use strict';

require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const LIFF_ID = process.env.LIFF_ID || '';

// Line Bot 設定
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

const app = express();

// ===== 靜態檔案（PWA）=====
app.use(express.static(path.join(__dirname), {
  setHeaders(res, filePath) {
    if (filePath.endsWith('sw.js')) {
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Service-Worker-Allowed', '/');
    }
    if (filePath.endsWith('manifest.json')) {
      res.setHeader('Content-Type', 'application/manifest+json');
    }
  }
}));

// ===== Line Webhook =====
// 簽章驗證中介層（僅在有設定 secret 時啟用）
function lineMiddleware(req, res, next) {
  if (!lineConfig.channelSecret) return next();
  line.middleware(lineConfig)(req, res, next);
}

app.post('/webhook', lineMiddleware, async (req, res) => {
  res.json({ status: 'ok' });

  if (!lineConfig.channelAccessToken) {
    console.warn('[LINE] 尚未設定 LINE_CHANNEL_ACCESS_TOKEN，跳過回覆');
    return;
  }

  const client = new line.messagingApi.MessagingApiClient(lineConfig);
  const events = req.body?.events || [];

  for (const event of events) {
    try {
      await handleEvent(client, event);
    } catch (err) {
      console.error('[LINE] 事件處理錯誤:', err.message);
    }
  }
});

// ===== 事件處理 =====
async function handleEvent(client, event) {
  if (event.type !== 'message' || event.message.type !== 'text') return;

  const text = event.message.text.trim();
  const replyToken = event.replyToken;

  // 指令對應
  if (/^(開始|遊戲|玩|play|start)/i.test(text)) {
    return client.replyMessage({ replyToken, messages: [buildGameMessage()] });
  }
  if (/^(說明|規則|怎麼玩|help)/i.test(text)) {
    return client.replyMessage({ replyToken, messages: [buildHelpMessage()] });
  }

  // 預設：歡迎訊息
  return client.replyMessage({ replyToken, messages: [buildWelcomeMessage()] });
}

// ===== 訊息建構 =====
function buildWelcomeMessage() {
  return {
    type: 'template',
    altText: '🧠 記憶訓練遊戲 - 歡迎！',
    template: {
      type: 'buttons',
      thumbnailImageUrl: `${BASE_URL}/icons/icon-512.png`,
      imageAspectRatio: 'rectangle',
      imageSize: 'cover',
      title: '🧠 記憶訓練遊戲',
      text: '翻牌配對，訓練記憶力！\n傳送「開始」來玩遊戲，或傳送「說明」了解玩法。',
      actions: [
        buildGameAction(),
        { type: 'message', label: '📖 遊戲說明', text: '說明' },
      ],
    },
  };
}

function buildGameMessage() {
  const gameUrl = LIFF_ID
    ? `https://liff.line.me/${LIFF_ID}`
    : `${BASE_URL}/`;

  return {
    type: 'template',
    altText: '點我開始記憶訓練遊戲！',
    template: {
      type: 'buttons',
      thumbnailImageUrl: `${BASE_URL}/icons/icon-512.png`,
      imageAspectRatio: 'rectangle',
      imageSize: 'cover',
      title: '🎮 開始遊戲',
      text: '選擇難度，開始翻牌配對！\n挑戰您的記憶力！',
      actions: [
        { type: 'uri', label: '🚀 立即開始遊戲', uri: gameUrl },
        { type: 'message', label: '🔁 再看一次說明', text: '說明' },
      ],
    },
  };
}

function buildHelpMessage() {
  return {
    type: 'text',
    text:
      '📖 【遊戲規則】\n\n' +
      '1️⃣ 點擊任一張牌，翻開圖案\n' +
      '2️⃣ 再點一張牌，找相同圖案\n' +
      '3️⃣ ✅ 相同 → 配對成功，留在桌面\n' +
      '4️⃣ ❌ 不同 → 翻回背面，記住位置\n' +
      '5️⃣ 全部配對完成即獲勝！🎉\n\n' +
      '💡 翻牌次數越少、時間越短越厲害！\n\n' +
      '傳送「開始」來玩遊戲 👇',
  };
}

function buildGameAction() {
  const gameUrl = LIFF_ID
    ? `https://liff.line.me/${LIFF_ID}`
    : `${BASE_URL}/`;
  return { type: 'uri', label: '🎮 開始遊戲', uri: gameUrl };
}

// ===== 健康檢查 =====
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    pwa: `${BASE_URL}/`,
    webhook: `${BASE_URL}/webhook`,
    liff: LIFF_ID ? `https://liff.line.me/${LIFF_ID}` : '未設定',
  });
});

// ===== 啟動 =====
app.listen(PORT, () => {
  console.log('');
  console.log('🧠 記憶訓練遊戲伺服器已啟動');
  console.log('─────────────────────────────');
  console.log(`📱 PWA 網址    : ${BASE_URL}/`);
  console.log(`🔗 Webhook URL : ${BASE_URL}/webhook`);
  console.log(`🩺 健康檢查    : ${BASE_URL}/health`);
  if (LIFF_ID) {
    console.log(`✅ LIFF ID     : ${LIFF_ID}`);
    console.log(`🟢 LIFF 網址   : https://liff.line.me/${LIFF_ID}`);
  } else {
    console.log('⚠️  LIFF_ID 尚未設定（可在 .env 中加入）');
  }
  console.log('─────────────────────────────');
  if (!lineConfig.channelAccessToken) {
    console.log('⚠️  LINE_CHANNEL_ACCESS_TOKEN 尚未設定');
    console.log('   請複製 .env.example 為 .env 並填入 Line 憑證');
  }
  console.log('');
});
