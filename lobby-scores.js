'use strict';

(function () {
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
      if (el && typeof window.getTeamCardSummary === 'function') {
        el.textContent = window.getTeamCardSummary(ids[i]);
      }
    }
    var fullEl = document.getElementById('lobby-scores-full');
    if (fullEl && typeof window.buildTeamLobbyScoresFullHtml === 'function') {
      fullEl.innerHTML = window.buildTeamLobbyScoresFullHtml();
    }
  };

  window.getLobbyScoreLine = function getLobbyScoreLine(id) {
    return typeof window.getTeamCardSummary === 'function' ? window.getTeamCardSummary(id) : '—';
  };
})();
