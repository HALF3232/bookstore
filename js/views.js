/* ==========================================================================
 * views.js —— 页面视图
 * 每个视图是一个对象：{ title, render(ctx), mount?(ctx), submit?() }
 *   render —— 返回该页面的 HTML 字符串
 *   mount  —— 页面插入 DOM 之后再执行（例如启动轮播定时器）
 * 页面上所有交互都通过 data-action 属性交给 app.js 统一处理。
 * ========================================================================== */
window.Views = (function () {
  'use strict';

  var U = window.Util;
  var C = window.Components;

  /* ====================== 轮播控制（首页） ====================== */

  var slide = { index: 0, total: 0, timer: null };

  function slideTo(index) {
    var root = U.qs('#carousel');
    if (!root) return;
    var total = slide.total || 1;
    var next = ((index % total) + total) % total;   /* 首尾循环 */
    slide.index = next;

    var track = U.qs('#carouselTrack');
    if (track) track.style.transform = 'translateX(' + (-next * 100) + '%)';

    U.qsa('.slide', root).forEach(function (el, i) { el.classList.toggle('is-active', i === next); });
    U.qsa('.dot', root).forEach(function (el, i) {
      el.classList.toggle('is-active', i === next);
      if (i === next) el.setAttribute('aria-current', 'true');
      else el.removeAttribute('aria-current');
    });
  }

  function slideStep(delta) {
    slideTo(slide.index + delta);
  }

  function startAutoplay() {
    stopAutoplay();
    slide.timer = window.setInterval(function () { slideTo(slide.index + 1); }, 5000);
  }

  function stopAutoplay() {
    if (slide.timer) {
      window.clearInterval(slide.timer);
      slide.timer = null;
    }
  }

  /* ====================== 排序与筛选工具 ====================== */

  function bySales(a, b) { return b.sales - a.sales; }
  function byPriceAsc(a, b) { return a.price - b.price; }
  function byPriceDesc(a, b) { return b.price - a.price; }
  function byNew(a, b) {
    if (a.publishDate === b.publishDate) return b.id - a.id;
    return a.publishDate < b.publishDate ? 1 : -1;
  }
  /* 综合排序：编辑推荐优先，其次看销量 */
  function byRecommend(a, b) {
    var ra = a.recommended ? 1 : 0;
    var rb = b.recommended ? 1 : 0;
    if (ra !== rb) return rb - ra;
    return bySales(a, b);
  }

  function matchPrice(book, range) {
    if (range === 'lt50') return book.price < 50;
    if (range === '50to100') return book.price >= 50 && book.price <= 100;
    if (range === 'gt100') return book.price > 100;
    return true;
  }

  function matchKeyword(book, keyword) {
    if (!keyword) return true;
    var haystack = [book.title, book.author, book.publisher, book.tags.join(' '), U.categoryName(book.category)]
      .join(' ').toLowerCase();
    return haystack.indexOf(keyword.toLowerCase()) > -1;
  }

  /* 列表页核心：按查询条件过滤并排序 */
  function queryBooks(query) {
    var cat = query.cat || 'all';
    var keyword = (query.q || '').trim();
    var range = query.price || 'all';
    var instock = query.instock === '1';
    var sort = query.sort || 'recommend';

    var result = window.DATA.books.filter(function (book) {
      if (cat !== 'all' && book.category !== cat) return false;
      if (instock && book.stock <= 0) return false;
      if (!matchPrice(book, range)) return false;
      return matchKeyword(book, keyword);
    });

    if (sort === 'sales') result.sort(bySales);
    else if (sort === 'price-asc') result.sort(byPriceAsc);
    else if (sort === 'price-desc') result.sort(byPriceDesc);
    else if (sort === 'new') result.sort(byNew);
    else result.sort(byRecommend);

    return result;
  }

  /* 生成列表页链接：在当前查询条件上打补丁 */
  function listHref(query, patch) {
    var merged = {};
    var key;
    for (key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) merged[key] = query[key];
    }
    for (key in patch) {
      if (!Object.prototype.hasOwnProperty.call(patch, key)) continue;
      if (patch[key] === '' || patch[key] == null) delete merged[key];
      else merged[key] = patch[key];
    }
    return '#/books' + U.toQuery(merged);
  }

  /* ====================== 读者评价（模拟） ====================== */

  var REVIEW_POOL = [
    { name: '沐风', text: '包装很仔细，书角一点没磕。纸张厚实，排版舒服，两天就到了。', rating: 5, date: '10-08' },
    { name: '阿茶', text: '内容比想象中好读，作者讲得很透，做笔记做了半本。', rating: 5, date: '10-05' },
    { name: '林间', text: '整体不错，就是希望能多配几张图，纯文字有时候要看两遍。', rating: 4, date: '09-28' },
    { name: '小满', text: '送给同学的生日礼物，他很喜欢，说早就想买了。', rating: 5, date: '09-21' },
    { name: '半山', text: '书的开本偏小，随身带着看倒是方便。内容值得反复读。', rating: 4, date: '09-16' },
    { name: '南栀', text: '印刷清晰，没有异味。物流信息更新很及时。', rating: 5, date: '09-09' }
  ];

  function reviewsFor(book) {
    var start = book.id % REVIEW_POOL.length;
    var list = [];
    for (var i = 0; i < 3; i++) list.push(REVIEW_POOL[(start + i) % REVIEW_POOL.length]);
    return list.slice().sort(function (a, b) { return b.rating - a.rating; });
  }

  /* ====================== 首页 ====================== */

  var home = {
    title: '拾光书城 · 在线图书商城',
    render: function () {
      var books = window.DATA.books;
      var recommend = books.filter(function (book) { return book.recommended; }).slice(0, 4);
      var hot = books.slice().sort(bySales).slice(0, 5);
      var fresh = books.slice().sort(byNew).slice(0, 4);

      return '' +
        C.carousel(window.DATA.banners) +
        '<section class="section">' +
          C.sectionHead('图书分类', '按兴趣直接进对应书架', '#/books', '全部图书') +
          C.categoryTiles() +
        '</section>' +
        '<section class="section">' +
          C.sectionHead('编辑推荐', '本周由编辑挑出的好书', listHref({}, { sort: 'recommend' }), '更多推荐') +
          C.grid(recommend) +
        '</section>' +
        '<section class="band">' +
          '<div class="band-inner">' +
            C.sectionHead('热销榜', '按近 30 天销量排序', listHref({}, { sort: 'sales' }), '完整榜单') +
            '<ol class="rank-list">' + hot.map(function (book, index) { return C.rankRow(index + 1, book); }).join('') + '</ol>' +
          '</div>' +
        '</section>' +
        '<section class="section">' +
          C.sectionHead('新书上架', '刚入库的新书，先读为快', listHref({}, { sort: 'new' }), '更多新书') +
          C.grid(fresh) +
        '</section>' +
        C.serviceStrip();
    },
    mount: function () {
      slide.total = window.DATA.banners.length;
      slide.index = 0;
      slideTo(0);
      startAutoplay();

      /* 鼠标悬停时暂停自动播放，移开继续 */
      var root = U.qs('#carousel');
      if (root) {
        root.addEventListener('mouseenter', stopAutoplay);
        root.addEventListener('mouseleave', startAutoplay);
      }
    },
    leave: stopAutoplay
  };

  /* ====================== 图书列表页 ====================== */

  var list = {
    title: '图书列表',
    render: function (ctx) {
      var query = ctx.query || {};
      var books = queryBooks(query);
      var keyword = (query.q || '').trim();
      var cat = query.cat || 'all';

      /* 左侧筛选：分类 + 价格区间 + 仅看有货 */
      var catItems = [{ id: 'all', name: '全部图书', count: window.DATA.books.length }].concat(
        window.DATA.categories.map(function (category) {
          return { id: category.id, name: category.name, count: window.DATA.booksOfCategory(category.id).length };
        })
      );

      var aside = '' +
        '<aside class="filters panel" aria-label="筛选条件">' +
          '<div class="filter-head">' + U.icon('filter', 18) + '<span>筛选</span>' +
            '<a class="filter-reset" href="#/books">重置</a>' +
          '</div>' +
          '<div class="filter-group">' +
            '<p class="filter-title">图书分类</p>' +
            '<ul class="filter-list">' +
              catItems.map(function (item) {
                var active = item.id === cat;
                return '<li><a class="filter-link' + (active ? ' is-active' : '') + '"' +
                  ' href="' + listHref(query, { cat: item.id === 'all' ? '' : item.id }) + '"' +
                  (active ? ' aria-current="true"' : '') + '>' +
                  '<span>' + U.escapeHtml(item.name) + '</span><span class="filter-count">' + item.count + '</span>' +
                '</a></li>';
              }).join('') +
            '</ul>' +
          '</div>' +
          '<div class="filter-group">' +
            '<p class="filter-title">价格区间</p>' +
            '<select class="select" data-action="filter-price" aria-label="价格区间">' +
              '<option value="all"' + ((query.price || 'all') === 'all' ? ' selected' : '') + '>全部价格</option>' +
              '<option value="lt50"' + (query.price === 'lt50' ? ' selected' : '') + '>50 元以下</option>' +
              '<option value="50to100"' + (query.price === '50to100' ? ' selected' : '') + '>50 - 100 元</option>' +
              '<option value="gt100"' + (query.price === 'gt100' ? ' selected' : '') + '>100 元以上</option>' +
            '</select>' +
          '</div>' +
          '<div class="filter-group">' +
            '<label class="check-row">' +
              '<input type="checkbox" data-action="filter-instock"' + (query.instock === '1' ? ' checked' : '') + '>' +
              '<span>仅看有货</span>' +
            '</label>' +
          '</div>' +
        '</aside>';

      var sortTabs = [
        { key: 'recommend', label: '综合' },
        { key: 'sales', label: '销量' },
        { key: 'price-asc', label: '价格低到高' },
        { key: 'price-desc', label: '价格高到低' },
        { key: 'new', label: '最新出版' }
      ];
      var currentSort = query.sort || 'recommend';

      var toolbar = '' +
        '<div class="list-toolbar">' +
          '<form class="list-search" data-form="list-search" role="search">' +
            U.icon('search', 18) +
            '<input class="input" type="search" name="q" value="' + U.escapeHtml(keyword) + '"' +
              ' placeholder="输入书名、作者或出版社" aria-label="搜索图书">' +
            '<button class="btn btn-primary btn-sm" type="submit">搜索</button>' +
          '</form>' +
          '<div class="seg" role="group" aria-label="排序方式">' +
            sortTabs.map(function (tab) {
              var active = tab.key === currentSort;
              return '<button class="seg-item' + (active ? ' is-active' : '') + '" type="button"' +
                ' aria-pressed="' + (active ? 'true' : 'false') + '"' +
                ' data-action="sort" data-sort="' + tab.key + '">' + tab.label + '</button>';
            }).join('') +
          '</div>' +
        '</div>';

      var heading = keyword
        ? '“' + U.escapeHtml(keyword) + '” 的搜索结果'
        : (cat === 'all' ? '全部图书' : U.categoryName(cat));

      return '' +
        C.breadcrumb([{ text: '首页', href: '#/' }, { text: '图书列表' }]) +
        '<div class="page-head">' +
          '<h1 class="page-title">' + heading + '</h1>' +
          '<p class="page-sub">共 <strong>' + books.length + '</strong> 本图书' +
            (query.instock === '1' ? ' · 已过滤缺货' : '') + '</p>' +
        '</div>' +
        '<div class="list-layout">' +
          aside +
          '<div class="list-main" aria-live="polite">' +
            toolbar +
            C.grid(books) +
          '</div>' +
        '</div>';
    }
  };

  /* ====================== 图书详情页 ====================== */

  var detailQty = 1;

  /* 详情页的收藏按钮：图标 + 文字，收藏状态一眼可见 */
  function wideFavButton(book) {
    var on = window.Store.isFavorite(book.id);
    return '<button class="btn btn-outline btn-lg fav-wide' + (on ? ' is-on' : '') + '" type="button"' +
      ' data-action="toggle-fav" data-id="' + book.id + '"' +
      ' aria-pressed="' + (on ? 'true' : 'false') + '">' +
      U.icon('heart', 18, on) +
      '<span class="fav-text">' + (on ? '已收藏' : '收藏') + '</span>' +
    '</button>';
  }

  var detail = {
    title: '图书详情',
    render: function (ctx) {
      var book = U.bookById(ctx.params.id);
      if (!book) {
        return C.emptyState({
          icon: 'box',
          title: '这本图书不存在或已下架',
          text: '可能是链接里的编号有误',
          actionText: '返回图书列表',
          actionHref: '#/books'
        });
      }

      var inStock = book.stock > 0;
      var max = Math.max(book.stock, 1);
      var sameCategory = window.DATA.booksOfCategory(book.category)
        .filter(function (item) { return item.id !== book.id; })
        .slice(0, 4);
      var reviews = reviewsFor(book);

      var localStepper = '' +
        '<div class="qty-stepper qty-stepper--lg" role="group" aria-label="购买数量">' +
          '<button class="qty-btn" type="button" data-action="local-minus" aria-label="减少一本"' +
            (detailQty <= 1 ? ' disabled' : '') + '>' + U.icon('minus', 16) + '</button>' +
          '<span class="qty-value" id="localQtyValue">' + detailQty + '</span>' +
          '<button class="qty-btn" type="button" data-action="local-plus" aria-label="增加一本"' +
            (detailQty >= max ? ' disabled' : '') + '>' + U.icon('plus', 16) + '</button>' +
        '</div>';

      var buyRow = inStock
        ? localStepper +
          '<button class="btn btn-primary btn-lg" type="button" data-action="detail-add" data-id="' + book.id + '">' +
            U.icon('cart', 18) + '<span>加入购物车</span></button>' +
          '<button class="btn btn-accent btn-lg" type="button" data-action="detail-buy" data-id="' + book.id + '">' +
            '<span>立即购买</span></button>' +
          wideFavButton(book)
        : '<span class="stock-note">该书暂时缺货，可以先收藏，到货后第一时间通知你</span>' +
          wideFavButton(book);

      var infoRows = [
        ['出版社', book.publisher],
        ['出版日期', book.publishDate],
        ['页数', book.pages + ' 页'],
        ['ISBN', book.isbn],
        ['分类', U.categoryName(book.category)],
        ['库存', inStock ? book.stock + ' 本' : '缺货'],
        ['累计销量', U.salesText(book.sales) + ' 本']
      ];

      return '' +
        C.breadcrumb([
          { text: '首页', href: '#/' },
          { text: U.categoryName(book.category), href: '#/books?cat=' + book.category },
          { text: book.title }
        ]) +
        '<div class="detail-layout">' +
          '<div class="detail-media">' +
            C.cover(book, 'cover--detail') +
            '<ul class="detail-media-list">' +
              '<li>' + U.icon('shield', 16) + '正品保障</li>' +
              '<li>' + U.icon('truck', 16) + '满 99 包邮</li>' +
              '<li>' + U.icon('refresh', 16) + '七天无理由退换</li>' +
            '</ul>' +
          '</div>' +
          '<div class="detail-info">' +
            '<div class="detail-tags">' +
              book.tags.map(function (tag) { return '<span class="tag">' + U.escapeHtml(tag) + '</span>'; }).join('') +
            '</div>' +
            '<h1 class="detail-title">' + U.escapeHtml(book.title) + '</h1>' +
            '<p class="detail-sub">' + U.escapeHtml(book.author) + ' 著 · ' + U.escapeHtml(book.publisher) +
              ' · ' + book.publishDate + '</p>' +
            '<p class="detail-rating">' + U.starHtml(book.rating) +
              '<span class="rating-num">' + book.rating + '</span>' +
              '<span class="detail-sales">已售 ' + U.salesText(book.sales) + ' 本</span>' +
              '<span class="detail-review-count">' + reviews.length + ' 条评价</span>' +
            '</p>' +
            '<div class="price-panel">' +
              '<span class="price-label">售价</span>' +
              '<span class="price-now price-lg">' + U.money(book.price) + '</span>' +
              '<span class="price-old">定价 ' + U.money(book.originalPrice) + '</span>' +
              (U.discountText(book.price, book.originalPrice)
                ? '<span class="price-discount">' + U.discountText(book.price, book.originalPrice) + '</span>' : '') +
              '<span class="price-hint">已优惠 ' + U.money(book.originalPrice - book.price) + '</span>' +
            '</div>' +
            '<dl class="fact-list">' +
              '<div class="fact"><dt>库存</dt><dd>' + (inStock ? '现货 ' + book.stock + ' 本' : '暂时缺货') + '</dd></div>' +
              '<div class="fact"><dt>配送</dt><dd>湖北武汉仓发货，预计 1-3 天送达</dd></div>' +
              '<div class="fact"><dt>规格</dt><dd>' + book.pages + ' 页 / ' + book.isbn + '</dd></div>' +
            '</dl>' +
            '<div class="buy-row">' + buyRow + '</div>' +
          '</div>' +
        '</div>' +
        '<section class="band"><div class="band-inner">' +
          '<h2 class="band-title">内容简介</h2>' +
          '<p class="band-text">' + U.escapeHtml(book.summary) + '</p>' +
        '</div></section>' +
        '<section class="band"><div class="band-inner">' +
          '<h2 class="band-title">编辑推荐</h2>' +
          '<ul class="bullet-list">' +
            book.highlights.map(function (item) { return '<li>' + U.icon('check', 16) + '<span>' + U.escapeHtml(item) + '</span></li>'; }).join('') +
          '</ul>' +
        '</div></section>' +
        '<section class="band"><div class="band-inner">' +
          '<h2 class="band-title">图书信息</h2>' +
          '<table class="info-table"><tbody>' +
            infoRows.map(function (row) {
              return '<tr><th scope="row">' + row[0] + '</th><td>' + U.escapeHtml(row[1]) + '</td></tr>';
            }).join('') +
          '</tbody></table>' +
        '</div></section>' +
        '<section class="band"><div class="band-inner">' +
          '<h2 class="band-title">读者评价</h2>' +
          '<ul class="review-list">' +
            reviews.map(function (review) {
              return '<li class="review">' +
                '<div class="review-head">' +
                  '<span class="review-avatar">' + U.icon('user', 18) + '</span>' +
                  '<span class="review-name">' + U.escapeHtml(review.name) + '</span>' +
                  U.starHtml(review.rating) +
                  '<span class="review-date">' + review.date + '</span>' +
                '</div>' +
                '<p class="review-text">' + U.escapeHtml(review.text) + '</p>' +
              '</li>';
            }).join('') +
          '</ul>' +
        '</div></section>' +
        (sameCategory.length
          ? '<section class="section">' + C.sectionHead('同类推荐', '喜欢这本书的人也在看') + C.grid(sameCategory) + '</section>'
          : '');
    },
    mount: function () { detailQty = 1; },
    /* 供 app.js 调用：调整详情页的选择数量 */
    changeQty: function (delta) {
      var book = U.bookById(window.Router.current().params.id);
      if (!book) return;
      var max = Math.max(book.stock, 1);
      var next = detailQty + delta;
      if (next < 1) next = 1;
      if (next > max) next = max;
      detailQty = next;

      var value = U.qs('#localQtyValue');
      if (value) value.textContent = String(next);
      var minus = U.qs('[data-action="local-minus"]');
      var plus = U.qs('[data-action="local-plus"]');
      if (minus) minus.disabled = next <= 1;
      if (plus) plus.disabled = next >= max;
    },
    /* 供 app.js 调用：拿当前选择的数量 */
    qty: function () { return detailQty; }
  };

  /* ====================== 购物车 ====================== */

  function cartRow(book, qty, subtotal) {
    return '' +
      '<li class="cart-row">' +
        '<a class="cart-thumb" href="#/book/' + book.id + '" aria-label="查看《' + U.escapeHtml(book.title) + '》">' +
          C.cover(book, 'cover--mini') +
        '</a>' +
        '<div class="cart-info">' +
          '<a class="cart-title" href="#/book/' + book.id + '">' + U.escapeHtml(book.title) + '</a>' +
          '<p class="cart-meta">' + U.escapeHtml(book.author) + ' · ' + U.escapeHtml(book.publisher) + '</p>' +
          '<p class="cart-meta">库存 ' + book.stock + ' 本</p>' +
        '</div>' +
        '<div class="cart-cells">' +
          '<div class="cart-cell"><span class="cell-label">单价</span>' + U.money(book.price) + '</div>' +
          '<div class="cart-cell"><span class="cell-label">数量</span>' + C.qtyStepper(book, qty) + '</div>' +
          '<div class="cart-cell"><span class="cell-label">小计</span>' +
            '<span class="price-now">' + U.money(subtotal) + '</span></div>' +
        '</div>' +
        '<button class="icon-btn danger-btn" type="button" data-action="remove-item" data-id="' + book.id + '"' +
          ' aria-label="从购物车删除《' + U.escapeHtml(book.title) + '》" title="删除">' +
          U.icon('trash', 18) + '</button>' +
      '</li>';
  }

  function summaryCard(context) {
    var count = window.Store.cartItems().reduce(function (sum, item) { return sum + item.qty; }, 0);
    var goods = window.Store.goodsTotal();
    var shipping = window.Store.shippingFee();
    var total = window.Store.payable();
    var gap = window.Store.FREE_SHIPPING - goods;

    return '' +
      '<aside class="summary panel" aria-label="订单摘要">' +
        '<h2 class="summary-title">订单摘要</h2>' +
        '<div class="summary-row"><span>商品件数</span><span>' + count + ' 件</span></div>' +
        '<div class="summary-row"><span>商品金额</span><span>' + U.money(goods) + '</span></div>' +
        '<div class="summary-row"><span>运费</span><span>' +
          (shipping > 0 ? U.money(shipping) : '<span class="free-ship">免运费</span>') + '</span></div>' +
        '<div class="summary-row is-total"><span>应付总额</span>' +
          '<span class="price-now price-lg">' + U.money(total) + '</span></div>' +
        (context && context.showTip
          ? '<p class="summary-tip">' +
              (gap > 0 ? '再买 ' + U.money(gap) + ' 可免运费' : '已满 ' + U.money(window.Store.FREE_SHIPPING) + '，免运费') +
            '</p>'
          : '') +
        (context && context.actionHref
          ? '<a class="btn btn-primary btn-block" href="' + context.actionHref + '">' +
              U.escapeHtml(context.actionText || '去结算') + '</a>'
          : '') +
      '</aside>';
  }

  var cart = {
    title: '购物车',
    render: function () {
      var items = window.Store.cartItems();
      if (!items.length) {
        return '' +
          C.breadcrumb([{ text: '首页', href: '#/' }, { text: '购物车' }]) +
          C.emptyState({
            icon: 'cart',
            title: '购物车还是空的',
            text: '挑几本喜欢的书放进来吧',
            actionText: '去挑书',
            actionHref: '#/books'
          });
      }

      return '' +
        C.breadcrumb([{ text: '首页', href: '#/' }, { text: '购物车' }]) +
        '<div class="page-head">' +
          '<h1 class="page-title">购物车</h1>' +
          '<p class="page-sub">共 <strong>' + items.length + '</strong> 种图书</p>' +
        '</div>' +
        '<div class="cart-layout">' +
          '<div class="cart-main">' +
            '<ul class="cart-list">' +
              items.map(function (item) { return cartRow(item.book, item.qty, item.subtotal); }).join('') +
            '</ul>' +
            '<div class="cart-tools">' +
              '<button class="btn btn-ghost" type="button" data-action="clear-cart">' +
                U.icon('trash', 16) + '<span>清空购物车</span></button>' +
              '<a class="link" href="#/books">继续挑书' + U.icon('right', 14) + '</a>' +
            '</div>' +
          '</div>' +
          summaryCard({ showTip: true, actionHref: '#/checkout', actionText: '去结算' }) +
        '</div>';
    }
  };

  /* ====================== 结算页 ====================== */

  var checkoutState = { order: null, errors: {}, values: {} };

  function regionOptions(selected) {
    var regions = ['北京市', '上海市', '广东省', '湖北省', '浙江省', '江苏省', '四川省', '陕西省'];
    return '<option value="">请选择</option>' + regions.map(function (region) {
      return '<option value="' + region + '"' + (selected === region ? ' selected' : '') + '>' + region + '</option>';
    }).join('');
  }

  var checkout = {
    title: '结算',
    render: function () {
      /* 下单成功后显示结果页 */
      if (checkoutState.order) return orderSuccess(checkoutState.order);

      var items = window.Store.cartItems();
      if (!items.length) {
        return '' +
          C.breadcrumb([{ text: '首页', href: '#/' }, { text: '结算' }]) +
          C.emptyState({
            icon: 'box',
            title: '没有可结算的商品',
            text: '先去挑几本书，再来结算',
            actionText: '去挑书',
            actionHref: '#/books'
          });
      }

      var values = checkoutState.values;
      var errors = checkoutState.errors;

      function errorOf(field) {
        return errors[field] ? '<p class="error" role="alert">' + errors[field] + '</p>' : '';
      }

      var payOptions = [
        { value: '微信支付', label: '微信支付', desc: '扫码即时到账' },
        { value: '支付宝', label: '支付宝', desc: '推荐使用' },
        { value: '货到付款', label: '货到付款', desc: '收货时付款' }
      ];
      var currentPay = values.pay || '微信支付';

      return '' +
        C.breadcrumb([{ text: '首页', href: '#/' }, { text: '购物车', href: '#/cart' }, { text: '结算' }]) +
        '<div class="page-head">' +
          '<h1 class="page-title">填写订单信息</h1>' +
          '<p class="page-sub">本项目为前端模拟下单，不会产生真实交易</p>' +
        '</div>' +
        '<form class="checkout-layout" id="checkoutForm" novalidate>' +
          '<div class="checkout-form panel">' +
            '<h2 class="panel-title">' + U.icon('user', 18) + '收货信息</h2>' +
            '<div class="form-grid">' +
              '<div class="form-field">' +
                '<label class="form-label" for="ckName">收货人</label>' +
                '<input class="input" id="ckName" name="name" type="text" autocomplete="name"' +
                  ' placeholder="请输入姓名" value="' + U.escapeHtml(values.name || '') + '">' +
                errorOf('name') +
              '</div>' +
              '<div class="form-field">' +
                '<label class="form-label" for="ckPhone">手机号</label>' +
                '<input class="input" id="ckPhone" name="phone" type="tel" inputmode="numeric"' +
                  ' placeholder="11 位手机号" value="' + U.escapeHtml(values.phone || '') + '">' +
                errorOf('phone') +
              '</div>' +
              '<div class="form-field">' +
                '<label class="form-label" for="ckRegion">所在地区</label>' +
                '<select class="select" id="ckRegion" name="region">' + regionOptions(values.region) + '</select>' +
                errorOf('region') +
              '</div>' +
              '<div class="form-field form-field--full">' +
                '<label class="form-label" for="ckAddress">详细地址</label>' +
                '<input class="input" id="ckAddress" name="address" type="text" autocomplete="street-address"' +
                  ' placeholder="街道、楼牌号等" value="' + U.escapeHtml(values.address || '') + '">' +
                errorOf('address') +
              '</div>' +
              '<div class="form-field form-field--full">' +
                '<label class="form-label" for="ckNote">订单备注（选填）</label>' +
                '<input class="input" id="ckNote" name="note" type="text" placeholder="例如：工作日送货"' +
                  ' value="' + U.escapeHtml(values.note || '') + '">' +
              '</div>' +
            '</div>' +

            '<h2 class="panel-title">' + U.icon('lock', 18) + '支付方式</h2>' +
            '<div class="pay-list">' +
              payOptions.map(function (option) {
                return '<label class="pay-item">' +
                  '<input type="radio" name="pay" value="' + option.value + '"' +
                    (option.value === currentPay ? ' checked' : '') + '>' +
                  '<span class="pay-body"><span class="pay-name">' + option.label + '</span>' +
                  '<span class="pay-desc">' + option.desc + '</span></span>' +
                '</label>';
              }).join('') +
            '</div>' +
          '</div>' +

          '<div class="checkout-side">' +
            '<div class="panel order-preview">' +
              '<h2 class="panel-title">' + U.icon('box', 18) + '商品清单</h2>' +
              '<ul class="preview-list">' +
                items.map(function (item) {
                  return '<li class="preview-row">' +
                    C.cover(item.book, 'cover--tiny') +
                    '<span class="preview-title">' + U.escapeHtml(item.book.title) + '</span>' +
                    '<span class="preview-qty">×' + item.qty + '</span>' +
                    '<span class="preview-price">' + U.money(item.subtotal) + '</span>' +
                  '</li>';
                }).join('') +
              '</ul>' +
            '</div>' +
            summaryCard({ showTip: false }) +
            '<button class="btn btn-accent btn-lg btn-block" type="submit" name="submitOrder">' +
              U.icon('check', 18) + '<span>提交订单</span></button>' +
            '<p class="checkout-tip">点击提交即表示同意《拾光书城服务协议》（模拟）</p>' +
          '</div>' +
        '</form>';
    },
    /* 表单提交：先校验，再生成订单 */
    submit: function (values) {
      var errors = {};
      var name = (values.name || '').trim();
      var phone = (values.phone || '').trim();
      var address = (values.address || '').trim();

      if (!name) errors.name = '请填写收货人姓名';
      if (!/^1[3-9]\d{9}$/.test(phone)) errors.phone = '请填写 11 位有效手机号';
      if (!values.region) errors.region = '请选择所在地区';
      if (address.length < 5) errors.address = '详细地址不少于 5 个字';

      checkoutState.values = {
        name: name,
        phone: phone,
        region: values.region || '',
        address: address,
        note: (values.note || '').trim(),
        pay: values.pay || '微信支付'
      };
      checkoutState.errors = errors;

      if (Object.keys(errors).length) return { ok: false, errors: errors };

      var items = window.Store.cartItems();
      var now = new Date();
      var stamp = '' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0');

      var order = {
        no: 'SG' + stamp + String(Math.floor(Math.random() * 9000) + 1000),
        items: items,
        goods: window.Store.goodsTotal(),
        shipping: window.Store.shippingFee(),
        total: window.Store.payable(),
        pay: checkoutState.values.pay,
        name: name,
        phone: phone,
        region: values.region,
        address: address,
        note: checkoutState.values.note,
        createdAt: now
      };

      checkoutState.order = order;
      checkoutState.errors = {};
      window.Store.clearCart();   /* 清空购物车会触发界面刷新，所以放在最后 */
      return { ok: true, order: order };
    },
    /* 离开结算页时清掉上一次的下单结果 */
    clearResult: function () {
      checkoutState.order = null;
      checkoutState.errors = {};
    }
  };

  /* 下单成功页 */
  function orderSuccess(order) {
    var time = order.createdAt.getFullYear() + '-' +
      String(order.createdAt.getMonth() + 1).padStart(2, '0') + '-' +
      String(order.createdAt.getDate()).padStart(2, '0') + ' ' +
      String(order.createdAt.getHours()).padStart(2, '0') + ':' +
      String(order.createdAt.getMinutes()).padStart(2, '0');

    return '' +
      '<section class="order-success">' +
        '<span class="success-icon">' + U.icon('check', 30) + '</span>' +
        '<h1 class="success-title">订单提交成功</h1>' +
        '<p class="success-sub">订单号 <strong>' + order.no + '</strong> · 下单时间 ' + time + '</p>' +
        '<div class="success-grid">' +
          '<div class="success-block">' +
            '<h2 class="success-block-title">收货信息</h2>' +
            '<p>' + U.escapeHtml(order.name) + '　' + U.escapeHtml(order.phone) + '</p>' +
            '<p>' + U.escapeHtml(order.region) + ' ' + U.escapeHtml(order.address) + '</p>' +
            (order.note ? '<p>备注：' + U.escapeHtml(order.note) + '</p>' : '') +
          '</div>' +
          '<div class="success-block">' +
            '<h2 class="success-block-title">支付信息</h2>' +
            '<p>支付方式：' + U.escapeHtml(order.pay) + '</p>' +
            '<p>商品金额：' + U.money(order.goods) + '</p>' +
            '<p>运费：' + (order.shipping > 0 ? U.money(order.shipping) : '免运费') + '</p>' +
            '<p class="success-total">应付总额：<span class="price-now">' + U.money(order.total) + '</span></p>' +
          '</div>' +
        '</div>' +
        '<ul class="preview-list success-list">' +
          order.items.map(function (item) {
            return '<li class="preview-row">' +
              C.cover(item.book, 'cover--tiny') +
              '<span class="preview-title">' + U.escapeHtml(item.book.title) + '</span>' +
              '<span class="preview-qty">×' + item.qty + '</span>' +
              '<span class="preview-price">' + U.money(item.subtotal) + '</span>' +
            '</li>';
          }).join('') +
        '</ul>' +
        '<div class="success-actions">' +
          '<a class="btn btn-primary" href="#/books">继续购物</a>' +
          '<a class="btn btn-outline" href="#/">返回首页</a>' +
        '</div>' +
      '</section>';
  }

  /* ====================== 我的收藏 ====================== */

  var favorites = {
    title: '我的收藏',
    render: function () {
      var books = window.Store.favorites();
      if (!books.length) {
        return '' +
          C.breadcrumb([{ text: '首页', href: '#/' }, { text: '我的收藏' }]) +
          C.emptyState({
            icon: 'heart',
            title: '收藏夹还是空的',
            text: '看到喜欢的书，点一下心形图标就收藏了',
            actionText: '去逛书城',
            actionHref: '#/books'
          });
      }

      return '' +
        C.breadcrumb([{ text: '首页', href: '#/' }, { text: '我的收藏' }]) +
        '<div class="page-head">' +
          '<h1 class="page-title">我的收藏</h1>' +
          '<p class="page-sub">已收藏 <strong>' + books.length + '</strong> 本</p>' +
        '</div>' +
        C.grid(books);
    }
  };

  /* ====================== 404 ====================== */

  var notFound = {
    title: '页面不存在',
    render: function () {
      return C.emptyState({
        icon: 'close',
        title: '页面不存在',
        text: '地址可能输错了，回首页看看吧',
        actionText: '回到首页',
        actionHref: '#/'
      });
    }
  };

  return {
    home: home,
    list: list,
    detail: detail,
    cart: cart,
    checkout: checkout,
    favorites: favorites,
    notFound: notFound,
    slideTo: slideTo,
    slideStep: slideStep,
    queryBooks: queryBooks
  };
})();
