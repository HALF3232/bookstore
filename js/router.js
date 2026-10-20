/* ==========================================================================
 * router.js —— 基于 hash 的前端路由（单页应用的关键）
 * 地址形如：
 *   #/                     首页
 *   #/books?cat=computer   图书列表（支持分类、关键词、排序参数）
 *   #/book/3               图书详情
 *   #/cart                 购物车
 *   #/checkout             结算
 *   #/favorites            我的收藏
 * 用 hash 的好处：不需要服务器配合，直接双击 index.html 也能正常跳转。
 * ========================================================================== */
window.Router = (function () {
  'use strict';

  var current = { name: 'home', params: {}, query: {} };
  var listeners = [];

  function parseQuery(text) {
    var query = {};
    if (!text) return query;
    text.split('&').forEach(function (pair) {
      if (!pair) return;
      var index = pair.indexOf('=');
      var key = index > -1 ? pair.slice(0, index) : pair;
      var value = index > -1 ? pair.slice(index + 1) : '';
      query[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, ' '));
    });
    return query;
  }

  function parseHash(hash) {
    var raw = String(hash || window.location.hash || '#/').replace(/^#/, '');
    if (raw.charAt(0) !== '/') raw = '/' + raw;

    var split = raw.split('?');
    var segments = split[0].split('/').filter(function (part) { return part.length > 0; });
    var query = parseQuery(split[1]);
    var first = segments[0] || '';

    if (!first) return { name: 'home', params: {}, query: query };
    if (first === 'books') return { name: 'list', params: {}, query: query };
    if (first === 'book') return { name: 'detail', params: { id: Number(segments[1]) }, query: query };
    if (first === 'cart') return { name: 'cart', params: {}, query: query };
    if (first === 'checkout') return { name: 'checkout', params: {}, query: query };
    if (first === 'favorites') return { name: 'favorites', params: {}, query: query };
    return { name: 'notFound', params: {}, query: query };
  }

  function notify() {
    listeners.forEach(function (fn) { fn(current); });
  }

  function handle() {
    current = parseHash(window.location.hash);
    notify();
  }

  /* 跳转，例如 Router.go('/books?cat=computer') */
  function go(path) {
    var next = '#' + (String(path).charAt(0) === '/' ? path : '/' + path);
    if (window.location.hash === next) handle();   /* 目标与当前一致时手动刷新 */
    else window.location.hash = next;
  }

  /* 合并查询参数后跳到列表页，排序 / 筛选 / 搜索都用它 */
  function update(params) {
    var query = {};
    var key;
    for (key in current.query) {
      if (Object.prototype.hasOwnProperty.call(current.query, key)) query[key] = current.query[key];
    }
    for (key in params) {
      if (!Object.prototype.hasOwnProperty.call(params, key)) continue;
      if (params[key] === '' || params[key] == null) delete query[key];
      else query[key] = params[key];
    }
    go('/books' + window.Util.toQuery(query));
  }

  function start(onChange) {
    listeners.push(onChange);
    window.addEventListener('hashchange', handle);
    handle();
  }

  return {
    start: start,
    go: go,
    update: update,
    current: function () { return current; },
    parseHash: parseHash
  };
})();
