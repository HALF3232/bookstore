/* ==========================================================================
 * app.js —— 应用入口
 * 负责：渲染顶部导航、根据路由渲染页面、处理全局交互（事件委托）。
 * 所有按钮都用 data-action 属性标记，在这里统一处理，
 * 好处是页面重新渲染后不需要重新绑定事件。
 * ========================================================================== */
(function () {
  'use strict';

  var U = window.Util;
  var Store = window.Store;
  var Router = window.Router;
  var Views = window.Views;

  var currentView = null;    /* 当前视图对象，切换时调用它的 leave() */
  var lastRouteKey = '';

  /* ====================== 轻提示 ====================== */

  function toast(message, type) {
    if (!message) return;
    var area = U.qs('#toastArea');
    if (!area) return;
    var el = document.createElement('div');
    el.className = 'toast' + (type ? ' is-' + type : '');
    el.setAttribute('role', 'status');
    el.textContent = message;
    area.appendChild(el);
    window.setTimeout(function () { el.classList.add('is-out'); }, 1800);
    window.setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 2150);
  }

  /* ====================== 顶部导航 ====================== */

  function buildHeader() {
    return '' +
      '<div class="container header-inner">' +
        '<a class="logo" href="#/" aria-label="拾光书城 首页">' +
          '<span class="logo-mark">' + U.icon('book', 22) + '</span>' +
          '<span class="logo-text"><strong>拾光书城</strong><em>SHIGUANG BOOKS</em></span>' +
        '</a>' +
        '<nav class="main-nav" aria-label="主导航">' +
          '<a class="nav-link" data-nav="home" href="#/">首页</a>' +
          '<a class="nav-link" data-nav="list" href="#/books">全部图书</a>' +
          '<a class="nav-link" data-nav="favorites" href="#/favorites">我的收藏</a>' +
        '</nav>' +
        '<form class="header-search" data-form="header-search" role="search">' +
          U.icon('search', 18) +
          '<input class="input" type="search" name="q" placeholder="搜索书名 / 作者 / 出版社" aria-label="搜索图书">' +
          '<button class="btn btn-primary btn-sm" type="submit">搜索</button>' +
        '</form>' +
        '<div class="header-actions">' +
          '<a class="icon-btn cart-link" href="#/cart" aria-label="购物车">' +
            U.icon('cart', 20) +
            '<span class="badge" id="cartBadge" hidden>0</span>' +
          '</a>' +
          '<a class="btn btn-outline btn-sm fav-link" href="#/favorites">' +
            U.icon('heart', 16) + '<span>收藏</span>' +
            '<span class="badge-soft" id="favBadge" hidden>0</span>' +
          '</a>' +
        '</div>' +
      '</div>';
  }

  /* 路由变化时同步导航高亮与搜索框内容（不重建整个头部，避免输入内容丢失） */
  function syncHeader(route) {
    var active = route.name === 'cart' || route.name === 'checkout'
      ? 'cart'
      : (route.name === 'home' ? 'home' : (route.name === 'favorites' ? 'favorites' : 'list'));

    U.qsa('[data-nav]').forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('data-nav') === active);
    });

    var input = U.qs('.header-search input[name="q"]');
    if (input && document.activeElement !== input) input.value = (route.query && route.query.q) || '';
  }

  function updateBadges() {
    var count = Store.cartCount();
    var favs = Store.favoriteCount();

    var cartBadge = U.qs('#cartBadge');
    if (cartBadge) {
      cartBadge.textContent = String(count);
      cartBadge.hidden = count <= 0;
    }
    var favBadge = U.qs('#favBadge');
    if (favBadge) {
      favBadge.textContent = String(favs);
      favBadge.hidden = favs <= 0;
    }
    var cartLink = U.qs('.cart-link');
    if (cartLink) cartLink.setAttribute('aria-label', '购物车，共 ' + count + ' 件商品');
    var favLink = U.qs('.fav-link');
    if (favLink) favLink.setAttribute('aria-label', '我的收藏，共 ' + favs + ' 本');
  }

  /* 收藏状态变化后，把页面上所有同一本书的收藏按钮同步过来 */
  function syncFavButtons(id) {
    var on = Store.isFavorite(id);
    U.qsa('[data-action="toggle-fav"][data-id="' + id + '"]').forEach(function (btn) {
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');

      if (btn.classList.contains('fav-wide')) {
        btn.innerHTML = U.icon('heart', 18, on) +
          '<span class="fav-text">' + (on ? '已收藏' : '收藏') + '</span>';
      } else {
        btn.title = on ? '取消收藏' : '加入收藏';
        btn.setAttribute('aria-label', (on ? '取消收藏' : '加入收藏') + '这本图书');
        btn.innerHTML = U.icon('heart', 18, on);
      }
    });
  }

  /* ====================== 页面渲染 ====================== */

  function routeKey(route) {
    return route.name + '|' + JSON.stringify(route.params) + '|' + JSON.stringify(route.query);
  }

  function renderView(route) {
    var view = Views[route.name] || Views.notFound;
    var container = U.qs('#view');

    if (currentView && currentView !== view && typeof currentView.leave === 'function') currentView.leave();
    container.innerHTML = view.render(route);
    currentView = view;
    if (typeof view.mount === 'function') view.mount(route);

    document.title = view.title ? view.title + ' · 拾光书城' : '拾光书城';
  }

  function refresh() {
    renderView(Router.current());
  }

  function onRoute(route) {
    var key = routeKey(route);
    if (key !== lastRouteKey) {
      lastRouteKey = key;
      window.scrollTo(0, 0);
      if (route.name !== 'checkout') Views.checkout.clearResult();
    }
    syncHeader(route);
    renderView(route);
  }

  /* ====================== 购物车相关操作 ====================== */

  function cartQtyOf(id) {
    var list = Store.state.cart;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === Number(id)) return list[i].qty;
    }
    return 0;
  }

  function addToCart(id, qty) {
    var result = Store.addToCart(id, qty);
    toast(result.message, result.ok ? 'ok' : 'warn');
    return result;
  }

  /* ====================== 全局事件 ====================== */

  function bindEvents() {
    /* ---- 点击 ---- */
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest ? event.target.closest('[data-action]') : null;
      if (!trigger) return;

      var action = trigger.getAttribute('data-action');
      var id = Number(trigger.getAttribute('data-id'));

      switch (action) {
        case 'add-cart':
          addToCart(id, 1);
          break;

        case 'detail-add':
          addToCart(id, Views.detail.qty());
          break;

        case 'detail-buy': {
          var added = Store.addToCart(id, Views.detail.qty());
          if (!added.ok) toast(added.message, 'warn');
          else Router.go('/checkout');
          break;
        }

        case 'toggle-fav': {
          var result = Store.toggleFavorite(id);
          toast(result.message, result.ok ? 'ok' : 'warn');
          if (result.ok) syncFavButtons(id);
          break;
        }

        case 'qty-plus': {
          var plus = Store.setQty(id, cartQtyOf(id) + 1);
          if (!plus.ok && plus.message) toast(plus.message, 'warn');
          break;
        }

        case 'qty-minus': {
          var minus = Store.setQty(id, cartQtyOf(id) - 1);
          if (!minus.ok && minus.message) toast(minus.message, 'warn');
          break;
        }

        case 'remove-item': {
          var removed = Store.removeFromCart(id);
          toast(removed.message, 'ok');
          break;
        }

        case 'clear-cart':
          if (window.confirm('确定要清空购物车吗？')) {
            Store.clearCart();
            toast('购物车已清空', 'ok');
          }
          break;

        case 'local-plus':
          Views.detail.changeQty(1);
          break;

        case 'local-minus':
          Views.detail.changeQty(-1);
          break;

        case 'slide-prev':
          Views.slideStep(-1);
          break;

        case 'slide-next':
          Views.slideStep(1);
          break;

        case 'slide-go':
          Views.slideTo(Number(trigger.getAttribute('data-index')));
          break;

        case 'sort':
          Router.update({ sort: trigger.getAttribute('data-sort') });
          break;

        case 'to-top':
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;

        default:
          break;
      }
    });

    /* ---- 表单提交 ---- */
    document.addEventListener('submit', function (event) {
      var form = event.target;
      if (!form || form.tagName !== 'FORM') return;

      var formName = form.getAttribute('data-form');
      if (formName === 'header-search' || formName === 'list-search') {
        event.preventDefault();
        var input = U.qs('input[name="q"]', form);
        var keyword = input ? input.value.trim() : '';
        if (formName === 'list-search') Router.update({ q: keyword });
        else Router.go('/books' + U.toQuery({ q: keyword }));
        return;
      }

      if (form.id === 'checkoutForm') {
        event.preventDefault();
        var payInput = U.qs('input[name="pay"]:checked', form);
        var values = {
          name: (U.qs('#ckName', form) || {}).value || '',
          phone: (U.qs('#ckPhone', form) || {}).value || '',
          region: (U.qs('#ckRegion', form) || {}).value || '',
          address: (U.qs('#ckAddress', form) || {}).value || '',
          note: (U.qs('#ckNote', form) || {}).value || '',
          pay: payInput ? payInput.value : '微信支付'
        };

        var placed = Views.checkout.submit(values);
        refresh();
        window.scrollTo(0, 0);

        if (placed.ok) {
          toast('下单成功，订单号 ' + placed.order.no, 'ok');
        } else {
          toast('请检查表单中标红的内容', 'warn');
          var firstError = U.qs('.form-field .error');
          if (firstError) {
            var field = firstError.previousElementSibling;
            if (field && field.focus) field.focus();
          }
        }
      }
    });

    /* ---- 下拉框 / 复选框 / 数量输入框 ---- */
    document.addEventListener('change', function (event) {
      var el = event.target;
      if (!el || !el.getAttribute) return;

      var action = el.getAttribute('data-action');
      if (action === 'filter-price') {
        Router.update({ price: el.value === 'all' ? '' : el.value });
        return;
      }
      if (action === 'filter-instock') {
        Router.update({ instock: el.checked ? '1' : '' });
        return;
      }
      if (el.getAttribute('data-role') === 'qty-input') {
        var id = Number(el.getAttribute('data-id'));
        var value = Number(el.value);
        if (!isFinite(value) || value < 1) {
          /* 输入了非法内容就恢复原值，不删除商品 */
          el.value = String(cartQtyOf(id));
          return;
        }
        var result = Store.setQty(id, value);
        if (!result.ok && result.message) toast(result.message, 'warn');
      }
    });

    /* ---- 滚动时显示「返回顶部」 ---- */
    window.addEventListener('scroll', function () {
      var btn = U.qs('#toTop');
      if (btn) btn.classList.toggle('is-show', window.scrollY > 420);
    }, { passive: true });
  }

  /* ====================== 启动 ====================== */

  function init() {
    Store.init();
    U.qs('#siteHeader').innerHTML = buildHeader();
    var footerCount = U.qs('#footerCount');
    if (footerCount) footerCount.textContent = String(window.DATA.books.length);
    updateBadges();

    /* 购物车 / 收藏变化后：刷新角标；购物车、结算、收藏页需要整块重画 */
    Store.subscribe(function () {
      updateBadges();
      var route = Router.current();
      if (route.name === 'cart' || route.name === 'checkout' || route.name === 'favorites') refresh();
    });

    bindEvents();
    Router.start(onRoute);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
