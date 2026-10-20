/* ==========================================================================
 * store.js —— 状态层（购物车 / 收藏夹）
 * 1. 用最简单的发布订阅模式通知界面刷新；
 * 2. 购物车与收藏夹写入 localStorage，关掉浏览器再打开还在。
 * ========================================================================== */
window.Store = (function () {
  'use strict';

  var CART_KEY = 'shiguang.cart.v1';
  var FAV_KEY = 'shiguang.favorite.v1';
  var FREE_SHIPPING = 99;   /* 满 99 元免运费 */
  var SHIPPING_FEE = 8;     /* 不满 99 元收 8 元运费 */

  var state = { cart: [], favorites: [] };
  var listeners = [];

  /* ---------------- 本地存储 ----------------
   * file:// 或隐私模式下 localStorage 可能不可用，统一 try/catch 兜底。 */

  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      var value = JSON.parse(raw);
      return value == null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* 写入失败不影响当次浏览 */
    }
  }

  /* 过滤掉已下架的书与非法数量 */
  function sanitizeCart(list) {
    var result = [];
    if (!Array.isArray(list)) return result;
    list.forEach(function (item) {
      var book = window.Util.bookById(item && item.id);
      var qty = Math.floor(Number(item && item.qty));
      if (!book || !(qty > 0)) return;
      result.push({ id: book.id, qty: Math.min(qty, Math.max(book.stock, 1)) });
    });
    return result;
  }

  function sanitizeFavorites(list) {
    if (!Array.isArray(list)) return [];
    return list
      .map(function (id) { return Number(id); })
      .filter(function (id) { return !!window.Util.bookById(id); });
  }

  function init() {
    state.cart = sanitizeCart(read(CART_KEY, []));
    state.favorites = sanitizeFavorites(read(FAV_KEY, []));
  }

  /* ---------------- 订阅通知 ---------------- */

  function subscribe(fn) {
    listeners.push(fn);
  }

  function notify() {
    listeners.forEach(function (fn) { fn(state); });
  }

  function persist() {
    write(CART_KEY, state.cart);
    write(FAV_KEY, state.favorites);
  }

  /* ---------------- 购物车 ---------------- */

  function findItem(id) {
    var target = Number(id);
    for (var i = 0; i < state.cart.length; i++) {
      if (state.cart[i].id === target) return state.cart[i];
    }
    return null;
  }

  /* 统一返回 { ok, message }，界面据此弹提示 */
  function addToCart(id, qty) {
    var book = window.Util.bookById(id);
    if (!book) return { ok: false, message: '这本书不存在了' };
    if (book.stock <= 0) return { ok: false, message: '该书暂时缺货' };

    var amount = Math.max(1, Math.floor(Number(qty) || 1));
    var item = findItem(id);
    var current = item ? item.qty : 0;
    var next = current + amount;

    if (next > book.stock) {
      if (current >= book.stock) return { ok: false, message: '库存只剩 ' + book.stock + ' 本了' };
      next = book.stock;
    }

    if (item) item.qty = next;
    else state.cart.push({ id: book.id, qty: next });

    persist();
    notify();
    return { ok: true, message: '已加入购物车：' + book.title, qty: next };
  }

  function setQty(id, qty) {
    var book = window.Util.bookById(id);
    var item = findItem(id);
    if (!book || !item) return { ok: false, message: '购物车里没有这本书' };

    var next = Math.floor(Number(qty));
    if (!(next > 0)) return removeFromCart(id);

    if (next > book.stock) {
      item.qty = Math.max(book.stock, 1);
      persist();
      notify();
      return { ok: false, message: '库存只剩 ' + book.stock + ' 本' };
    }

    item.qty = next;
    persist();
    notify();
    return { ok: true };
  }

  function removeFromCart(id) {
    var target = Number(id);
    state.cart = state.cart.filter(function (item) { return item.id !== target; });
    persist();
    notify();
    return { ok: true, message: '已从购物车移除' };
  }

  function clearCart() {
    state.cart = [];
    persist();
    notify();
  }

  /* 购物车明细：把 id 换成完整图书对象，并算好小计 */
  function cartItems() {
    var items = [];
    state.cart.forEach(function (item) {
      var book = window.Util.bookById(item.id);
      if (!book) return;
      items.push({
        book: book,
        qty: item.qty,
        subtotal: Math.round(book.price * item.qty * 100) / 100
      });
    });
    return items;
  }

  function cartCount() {
    return state.cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
  }

  function goodsTotal() {
    var total = cartItems().reduce(function (sum, item) { return sum + item.subtotal; }, 0);
    return Math.round(total * 100) / 100;
  }

  function shippingFee() {
    var total = goodsTotal();
    if (total <= 0) return 0;
    return total >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
  }

  function payable() {
    return Math.round((goodsTotal() + shippingFee()) * 100) / 100;
  }

  /* ---------------- 收藏夹 ---------------- */

  function isFavorite(id) {
    return state.favorites.indexOf(Number(id)) > -1;
  }

  function toggleFavorite(id) {
    var target = Number(id);
    var book = window.Util.bookById(target);
    if (!book) return { ok: false, message: '这本书不存在了' };

    var index = state.favorites.indexOf(target);
    var added;
    if (index > -1) {
      state.favorites.splice(index, 1);
      added = false;
    } else {
      state.favorites.push(target);
      added = true;
    }
    persist();
    notify();
    return { ok: true, added: added, message: added ? '已加入收藏：' + book.title : '已取消收藏' };
  }

  function favorites() {
    return state.favorites
      .map(function (id) { return window.Util.bookById(id); })
      .filter(Boolean);
  }

  function favoriteCount() {
    return state.favorites.length;
  }

  return {
    init: init,
    subscribe: subscribe,
    state: state,
    addToCart: addToCart,
    setQty: setQty,
    removeFromCart: removeFromCart,
    clearCart: clearCart,
    cartItems: cartItems,
    cartCount: cartCount,
    goodsTotal: goodsTotal,
    shippingFee: shippingFee,
    payable: payable,
    isFavorite: isFavorite,
    toggleFavorite: toggleFavorite,
    favorites: favorites,
    favoriteCount: favoriteCount,
    FREE_SHIPPING: FREE_SHIPPING
  };
})();
