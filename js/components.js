/* ==========================================================================
 * components.js —— 可复用界面片段
 * 每个函数返回一段 HTML 字符串，由 views.js 组装成完整页面。
 * 之所以用「返回字符串」的方式，是因为它最简单直观：没有模板语法、
 * 没有编译步骤，纯 JS 字符串拼接，浏览器直接就能跑。
 * ========================================================================== */
window.Components = (function () {
  'use strict';

  var U = window.Util;

  /* 图书封面：用渐变色 + 书名作者排版，模拟一张书封，不需要任何图片文件 */
  function cover(book, extraClass) {
    var style = '--from:' + book.cover.from + ';--to:' + book.cover.to;
    return '' +
      '<span class="cover ' + (extraClass || '') + '" style="' + style + '">' +
        '<span class="cover-top">' +
          '<span class="cover-series">' + U.escapeHtml(U.categoryName(book.category)) + '</span>' +
          '<span class="cover-brand">拾光书城</span>' +
        '</span>' +
        '<span class="cover-glyph" aria-hidden="true">' + U.escapeHtml(book.cover.glyph) + '</span>' +
        '<span class="cover-title">' + U.escapeHtml(book.title) + '</span>' +
        '<span class="cover-author">' + U.escapeHtml(book.author) + '</span>' +
      '</span>';
  }

  /* 库存标签 */
  function stockTag(book) {
    if (book.stock <= 0) return '<span class="stock-tag is-out">缺货</span>';
    if (book.stock <= 5) return '<span class="stock-tag is-low">仅剩 ' + book.stock + ' 本</span>';
    return '<span class="stock-tag">现货</span>';
  }

  /* 收藏按钮（心形，收藏后填充） */
  function favButton(book, extraClass) {
    var on = window.Store.isFavorite(book.id);
    return '<button class="icon-btn fav-btn' + (on ? ' is-on' : '') + ' ' + (extraClass || '') + '"' +
      ' type="button" data-action="toggle-fav" data-id="' + book.id + '"' +
      ' aria-pressed="' + (on ? 'true' : 'false') + '"' +
      ' aria-label="' + (on ? '取消收藏' : '收藏') + ' ' + U.escapeHtml(book.title) + '"' +
      ' title="' + (on ? '取消收藏' : '加入收藏') + '">' + U.icon('heart', 18, on) + '</button>';
  }

  /* 加入购物车按钮 */
  function addButton(book, extraClass) {
    if (book.stock <= 0) {
      return '<button class="btn btn-primary btn-sm ' + (extraClass || '') + '" type="button" disabled>已缺货</button>';
    }
    return '<button class="btn btn-primary btn-sm ' + (extraClass || '') + '" type="button"' +
      ' data-action="add-cart" data-id="' + book.id + '">' + U.icon('cart', 16) + '<span>加入购物车</span></button>';
  }

  /* 图书卡片（列表页、首页、详情页推荐都用它） */
  function bookCard(book) {
    return '' +
      '<article class="book-card">' +
        '<a class="book-cover-link" href="#/book/' + book.id + '" aria-label="查看《' + U.escapeHtml(book.title) + '》详情">' +
          cover(book, 'cover--card') +
          stockTag(book) +
        '</a>' +
        '<div class="book-body">' +
          '<h3 class="book-title"><a href="#/book/' + book.id + '">' + U.escapeHtml(book.title) + '</a></h3>' +
          '<p class="book-author">' + U.escapeHtml(book.author) + ' · ' + U.escapeHtml(book.publisher) + '</p>' +
          '<p class="book-rating">' + U.starHtml(book.rating) +
            '<span class="rating-num">' + book.rating + '</span>' +
            '<span class="book-sales">已售 ' + U.salesText(book.sales) + '</span>' +
          '</p>' +
          '<div class="price-row">' +
            '<span class="price-now">' + U.money(book.price) + '</span>' +
            '<span class="price-old">' + U.money(book.originalPrice) + '</span>' +
            (U.discountText(book.price, book.originalPrice)
              ? '<span class="price-discount">' + U.discountText(book.price, book.originalPrice) + '</span>'
              : '') +
          '</div>' +
          '<div class="book-actions">' +
            addButton(book) +
            favButton(book) +
          '</div>' +
        '</div>' +
      '</article>';
  }

  /* 图书网格 */
  function grid(books) {
    if (!books.length) {
      return emptyState({
        icon: 'box',
        title: '没有找到符合条件的图书',
        text: '换个关键词或切换分类再试试',
        actionText: '查看全部图书',
        actionHref: '#/books'
      });
    }
    return '<div class="book-grid">' + books.map(bookCard).join('') + '</div>';
  }

  /* 热销榜的一行 */
  function rankRow(rank, book) {
    var top = rank <= 3 ? ' is-top' : '';
    return '' +
      '<li class="rank-row">' +
        '<span class="rank-num' + top + '">' + rank + '</span>' +
        '<a class="rank-cover" href="#/book/' + book.id + '" aria-label="查看《' + U.escapeHtml(book.title) + '》">' +
          cover(book, 'cover--mini') +
        '</a>' +
        '<div class="rank-info">' +
          '<a class="rank-title" href="#/book/' + book.id + '">' + U.escapeHtml(book.title) + '</a>' +
          '<p class="rank-meta">' + U.escapeHtml(book.author) + ' · ' + U.escapeHtml(U.categoryName(book.category)) +
            ' · 已售 ' + U.salesText(book.sales) + '</p>' +
        '</div>' +
        '<div class="rank-side">' +
          '<span class="price-now">' + U.money(book.price) + '</span>' +
          addButton(book) +
        '</div>' +
      '</li>';
  }

  /* 轮播广告：三张幻灯片 + 左右箭头 + 圆点 */
  function carousel(banners) {
    var slides = banners.map(function (banner, index) {
      var book = U.bookById(banner.bookId) || window.DATA.books[0];
      return '' +
        '<article class="slide theme-' + banner.theme + (index === 0 ? ' is-active' : '') + '"' +
          ' data-index="' + index + '" role="group" aria-label="' + (index + 1) + ' / ' + banners.length + '">' +
          '<div class="slide-text">' +
            '<p class="slide-kicker">' + U.escapeHtml(banner.kicker) + '</p>' +
            '<h2 class="slide-title">' + U.escapeHtml(banner.title) + '</h2>' +
            '<p class="slide-desc">' + U.escapeHtml(banner.text) + '</p>' +
            '<a class="btn btn-light" href="#/book/' + book.id + '">' +
              U.escapeHtml(banner.cta) + U.icon('arrow', 16) +
            '</a>' +
          '</div>' +
          '<a class="slide-media" href="#/book/' + book.id + '">' +
            cover(book, 'cover--slide') +
            '<span class="slide-book">《' + U.escapeHtml(book.title) + '》 ' + U.money(book.price) + '</span>' +
          '</a>' +
        '</article>';
    }).join('');

    var dots = banners.map(function (banner, index) {
      return '<button class="dot' + (index === 0 ? ' is-active' : '') + '" type="button"' +
        ' data-action="slide-go" data-index="' + index + '"' +
        ' aria-label="第 ' + (index + 1) + ' 张：' + U.escapeHtml(banner.title) + '"></button>';
    }).join('');

    return '' +
      '<section class="carousel" id="carousel" aria-label="促销活动轮播">' +
        '<div class="carousel-viewport">' +
          '<div class="carousel-track" id="carouselTrack">' + slides + '</div>' +
        '</div>' +
        '<button class="carousel-arrow is-left" type="button" data-action="slide-prev" aria-label="上一张">' + U.icon('left', 20) + '</button>' +
        '<button class="carousel-arrow is-right" type="button" data-action="slide-next" aria-label="下一张">' + U.icon('right', 20) + '</button>' +
        '<div class="carousel-dots">' + dots + '</div>' +
      '</section>';
  }

  /* 数量步进器：data-id 对应图书 id，加号减号交给全局事件处理 */
  function qtyStepper(book, qty) {
    var min = 1;
    var max = Math.max(book.stock, 1);
    return '' +
      '<div class="qty-stepper" role="group" aria-label="购买数量">' +
        '<button class="qty-btn" type="button" data-action="qty-minus" data-id="' + book.id + '"' +
          (qty <= min ? ' disabled' : '') + ' aria-label="减少一本">' + U.icon('minus', 14) + '</button>' +
        '<input class="qty-input" type="text" inputmode="numeric" value="' + qty + '"' +
          ' data-role="qty-input" data-id="' + book.id + '" data-max="' + max + '" aria-label="数量">' +
        '<button class="qty-btn" type="button" data-action="qty-plus" data-id="' + book.id + '"' +
          (qty >= max ? ' disabled' : '') + ' aria-label="增加一本">' + U.icon('plus', 14) + '</button>' +
      '</div>';
  }

  /* 区块标题 */
  function sectionHead(title, desc, moreHref, moreText) {
    return '' +
      '<div class="section-head">' +
        '<div>' +
          '<h2 class="section-title">' + U.escapeHtml(title) + '</h2>' +
          (desc ? '<p class="section-desc">' + U.escapeHtml(desc) + '</p>' : '') +
        '</div>' +
        (moreHref ? '<a class="more-link" href="' + moreHref + '">' + U.escapeHtml(moreText || '查看全部') +
          U.icon('right', 16) + '</a>' : '') +
      '</div>';
  }

  /* 空状态 */
  function emptyState(options) {
    return '' +
      '<div class="empty-state">' +
        '<span class="empty-icon">' + U.icon(options.icon || 'box', 30) + '</span>' +
        '<h2 class="empty-title">' + U.escapeHtml(options.title) + '</h2>' +
        (options.text ? '<p class="empty-text">' + U.escapeHtml(options.text) + '</p>' : '') +
        (options.actionHref
          ? '<a class="btn btn-primary" href="' + options.actionHref + '">' + U.escapeHtml(options.actionText) + '</a>'
          : '') +
      '</div>';
  }

  /* 面包屑：items = [{ text, href }]，最后一项不带链接 */
  function breadcrumb(items) {
    return '<nav class="breadcrumb" aria-label="当前位置">' + items.map(function (item, index) {
      var last = index === items.length - 1;
      var node = last
        ? '<span class="crumb is-current" aria-current="page">' + U.escapeHtml(item.text) + '</span>'
        : '<a class="crumb" href="' + item.href + '">' + U.escapeHtml(item.text) + '</a>';
      return (index ? '<span class="crumb-sep" aria-hidden="true">/</span>' : '') + node;
    }).join('') + '</nav>';
  }

  /* 首页分类导航 */
  function categoryTiles() {
    return '' +
      '<div class="cat-grid">' +
        window.DATA.categories.map(function (category) {
          var count = window.DATA.booksOfCategory(category.id).length;
          return '' +
            '<a class="cat-tile" href="#/books?cat=' + category.id + '">' +
              '<span class="cat-icon">' + U.icon(category.icon, 22) + '</span>' +
              '<span class="cat-name">' + U.escapeHtml(category.name) + '</span>' +
              '<span class="cat-desc">' + U.escapeHtml(category.desc) + '</span>' +
              '<span class="cat-count">' + count + ' 本</span>' +
            '</a>';
        }).join('') +
      '</div>';
  }

  /* 服务保障条 */
  function serviceStrip() {
    var items = [
      { icon: 'shield', title: '正品保障', text: '出版社直发，盗版必赔' },
      { icon: 'truck', title: '满 99 包邮', text: '当日 15 点前下单当天发出' },
      { icon: 'refresh', title: '七天无理由', text: '不影响二次销售可退换' },
      { icon: 'lock', title: '安全支付', text: '信息加密，绝不外泄' }
    ];
    return '<div class="service-strip">' + items.map(function (item) {
      return '' +
        '<div class="service-item">' +
          '<span class="service-icon">' + U.icon(item.icon, 20) + '</span>' +
          '<div><p class="service-title">' + item.title + '</p>' +
          '<p class="service-text">' + item.text + '</p></div>' +
        '</div>';
    }).join('') + '</div>';
  }

  return {
    cover: cover,
    stockTag: stockTag,
    favButton: favButton,
    addButton: addButton,
    bookCard: bookCard,
    grid: grid,
    rankRow: rankRow,
    carousel: carousel,
    qtyStepper: qtyStepper,
    sectionHead: sectionHead,
    emptyState: emptyState,
    breadcrumb: breadcrumb,
    categoryTiles: categoryTiles,
    serviceStrip: serviceStrip
  };
})();
