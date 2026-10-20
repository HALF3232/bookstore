/* ==========================================================================
 * util.js —— 通用工具函数
 * 金额格式化、文本转义、图标、星级、DOM 查询等，供其它模块复用。
 * ========================================================================== */
window.Util = (function () {
  'use strict';

  /* ---------------- 金额与数字 ---------------- */

  /* 39.8 -> "¥39.80" */
  function money(value) {
    return '¥' + Number(value || 0).toFixed(2);
  }

  /* 42610 -> "4.3万"；3260 -> "3260" */
  function salesText(value) {
    var n = Number(value || 0);
    if (n >= 10000) return (n / 10000).toFixed(1) + '万';
    return String(n);
  }

  /* 售价 39.8、定价 52 -> "7.7折" */
  function discountText(price, originalPrice) {
    if (!originalPrice || originalPrice <= price) return '';
    return (price / originalPrice * 10).toFixed(1) + '折';
  }

  /* ---------------- 安全与文本 ---------------- */

  /* 把用户输入渲染进 HTML 前先转义 */
  function escapeHtml(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function categoryName(id) {
    var list = (window.DATA && window.DATA.categories) || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i].name;
    }
    return '未分类';
  }

  function bookById(id) {
    var list = (window.DATA && window.DATA.books) || [];
    var target = Number(id);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === target) return list[i];
    }
    return null;
  }

  /* ---------------- DOM 简写 ---------------- */

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  /* ---------------- 图标 ----------------
   * 全部用内联 SVG（24×24 视口、描边风格），不依赖任何图标库，离线也能显示。
   * ---------------------------------------- */
  var ICONS = {
    search: '<circle cx="11" cy="11" r="6"/><line x1="15.6" y1="15.6" x2="20" y2="20"/>',
    cart: '<circle cx="9.5" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>' +
          '<path d="M3 4h2.2l2.3 10.2a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.6-1.2L20.6 8H6.1"/>',
    heart: '<path d="M12 20.2C8.2 17.6 5 14.9 5 11.3A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7 3.7c0 3.6-3.2 6.3-7 8.9z"/>',
    star: '<path d="M12 3.6l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.9-5.4 2.9 1-6L3.3 10l6-.9z"/>',
    trash: '<path d="M4 7h16M9.5 7V5.2h5V7M6.5 7l1 12.8h9L17.5 7"/>',
    plus: '<line x1="12" y1="6" x2="12" y2="18"/><line x1="6" y1="12" x2="18" y2="12"/>',
    minus: '<line x1="6" y1="12" x2="18" y2="12"/>',
    left: '<polyline points="14.5 6 8.5 12 14.5 18"/>',
    right: '<polyline points="9.5 6 15.5 12 9.5 18"/>',
    check: '<polyline points="5 12.5 10 17.5 19 6.5"/>',
    truck: '<rect x="1.5" y="7" width="12.5" height="9" rx="1.2"/>' +
           '<path d="M14 10h3.6l2.9 2.9V16H14z"/><circle cx="5.5" cy="18" r="1.6"/>' +
           '<circle cx="17.5" cy="18" r="1.6"/>',
    shield: '<path d="M12 3l7 2.8v5.9c0 4.1-2.9 7.3-7 9.3-4.1-2-7-5.2-7-9.3V5.8z"/><polyline points="9 12 11.3 14.3 15.3 10"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.7-6"/><polyline points="20 3.8 20 9.8 14 9.8"/>',
    arrow: '<line x1="4.5" y1="12" x2="18" y2="12"/><polyline points="12 6 18 12 12 18"/>',
    box: '<path d="M3.2 7.8L12 3.6l8.8 4.2v8.4L12 20.4l-8.8-4.2z"/>' +
         '<path d="M3.2 7.8L12 12l8.8-4.2M12 12v8.4"/>',
    user: '<circle cx="12" cy="8.2" r="3.6"/><path d="M5.5 20.2a6.6 6.6 0 0 1 13 0"/>',
    close: '<line x1="6.5" y1="6.5" x2="17.5" y2="17.5"/><line x1="17.5" y1="6.5" x2="6.5" y2="17.5"/>',
    filter: '<line x1="4" y1="7" x2="20" y2="7"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="17" x2="14" y2="17"/>',
    lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
    book: '<path d="M4.5 5.4A2.4 2.4 0 0 1 6.9 3H19v14.6H6.9A2.4 2.4 0 0 0 4.5 20z"/><path d="M19 17.6V21H6.9"/>',
    code: '<polyline points="9 7.5 4.5 12 9 16.5"/><polyline points="15 7.5 19.5 12 15 16.5"/>',
    kite: '<path d="M12 3l5.5 5.5L12 14l-5.5-5.5z"/><path d="M12 14v3.5M12 17.5c0 1.6 1.2 2.2 2.4 2.2"/>',
    chart: '<line x1="4" y1="20" x2="20" y2="20"/><line x1="7.5" y1="20" x2="7.5" y2="12"/><line x1="12" y1="20" x2="12" y2="8"/><line x1="16.5" y1="20" x2="16.5" y2="15"/>',
    scroll: '<line x1="4" y1="20" x2="20" y2="20"/><path d="M6.5 20V9.5M12 20V4.5M17.5 20v-6.5"/>',
    leaf: '<path d="M5 19.5C5 10.5 11 5 19.5 4.5 19 13.5 13 19.5 5 19.5z"/><path d="M5 19.5C7 14.5 11 11.5 15.5 10.5"/>',
    palette: '<path d="M12 3.2a8.8 8.8 0 1 0 0 17.6c1.2 0 2-1 2-2 0-1.6 1.3-2.1 2.9-2.1H18a3 3 0 0 0 2.8-3A8.8 8.8 0 0 0 12 3.2z"/>' +
             '<circle cx="8.2" cy="10.4" r="1.1"/><circle cx="12" cy="8" r="1.1"/><circle cx="15.8" cy="11" r="1.1"/>',
    atom: '<circle cx="12" cy="12" r="1.9"/><ellipse cx="12" cy="12" rx="8.8" ry="3.8"/>' +
          '<ellipse cx="12" cy="12" rx="8.8" ry="3.8" transform="rotate(60 12 12)"/>'
  };

  /* 返回一段 svg 字符串；filled 为 true 时用 currentColor 填充（心形、星星） */
  function icon(name, size, filled) {
    var body = ICONS[name] || ICONS.box;
    var s = size || 20;
    return '<svg class="icon" viewBox="0 0 24 24" width="' + s + '" height="' + s + '"' +
      ' fill="' + (filled ? 'currentColor' : 'none') + '"' +
      ' stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"' +
      ' aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  /* 星级评价，支持半星 */
  function starHtml(rating) {
    var score = Math.round(Number(rating || 0) * 2) / 2;
    var html = '<span class="stars" role="img" aria-label="评分 ' + score + ' 分">';
    for (var i = 1; i <= 5; i++) {
      var on = i <= score;
      var half = !on && (i - 0.5 === score);
      html += '<span class="star' + (on ? ' is-on' : '') + (half ? ' is-half' : '') + '">' +
        icon('star', 14, on) + '</span>';
    }
    return html + '</span>';
  }

  /* {q:'vue', cat:'computer'} -> "?q=vue&cat=computer" */
  function toQuery(params) {
    var pairs = [];
    for (var key in params) {
      if (!Object.prototype.hasOwnProperty.call(params, key)) continue;
      var value = params[key];
      if (value === '' || value == null) continue;
      pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
    return pairs.length ? '?' + pairs.join('&') : '';
  }

  return {
    money: money,
    salesText: salesText,
    discountText: discountText,
    escapeHtml: escapeHtml,
    categoryName: categoryName,
    bookById: bookById,
    qs: qs,
    qsa: qsa,
    icon: icon,
    starHtml: starHtml,
    toQuery: toQuery
  };
})();
