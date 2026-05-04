'use strict';

(function () {
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** 遊戲卡下方：僅團體榜一行，標籤 + 內容分層 */
  function buildGameCardHighHtml(summary) {
    var s = summary == null ? '' : String(summary);
    var mainClass = 'game-high-main';
    if (
      s === '尚無紀錄' ||
      s === '尚無榜單' ||
      s === '載入中…' ||
      s.indexOf('請於 config') >= 0
    ) {
      mainClass += ' game-high-main--empty';
    }
    return (
      '<div class="game-high-inner">' +
      '<span class="game-high-kicker">團體榜</span>' +
      '<span class="' +
      mainClass +
      '">' +
      esc(s) +
      '</span>' +
      '</div>'
    );
  }

  window.buildLobbyShareText = function buildLobbyShareText() {
    if (typeof window.buildTeamLobbyShareText === 'function') {
      return window.buildTeamLobbyShareText();
    }
    return '👵 連阿嬤都贏你｜請載入團體榜元件';
  };

  window.refreshLobbyHighScores = function refreshLobbyHighScores() {
    var ids = ['memory', 'fruit', 'd2048', 'sudoku', 'wordchain', 'mole'];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById('high-' + ids[i]);
      if (!el) continue;
      var summary =
        typeof window.getTeamCardSummary === 'function' ? window.getTeamCardSummary(ids[i]) : '—';
      el.innerHTML = buildGameCardHighHtml(summary);
    }
    var fullEl = document.getElementById('lobby-scores-full');
    if (fullEl && typeof window.buildTeamLobbyScoresFullHtml === 'function') {
      fullEl.innerHTML = window.buildTeamLobbyScoresFullHtml();
    }
    var heading = document.getElementById('lobby-scores-heading');
    if (heading && typeof window.__teamLeaderboardScopeLabel === 'string' && window.__teamLeaderboardScopeLabel) {
      heading.textContent = window.__teamLeaderboardScopeLabel;
    }
  };
})();
