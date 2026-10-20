/* ==========================================================================
 * data.js —— 模拟数据层
 * 真实项目里这些数据来自后端接口，作业里用本地数组模拟（无后端）。
 * 用法：<script src="js/data.js"></script> 之后即可访问 DATA.books / DATA.categories
 * ========================================================================== */
window.DATA = (function () {
  'use strict';

  /* 图书分类：id 用于路由参数，name 用于展示 */
  var categories = [
    { id: 'literature', name: '文学小说', icon: 'feather', desc: '小说、散文、诗歌' },
    { id: 'computer', name: '计算机', icon: 'terminal', desc: '编程、算法、运维' },
    { id: 'kids', name: '少儿读物', icon: 'kite', desc: '绘本、童话、科普' },
    { id: 'business', name: '经管励志', icon: 'chart', desc: '管理、投资、成长' },
    { id: 'history', name: '历史人文', icon: 'scroll', desc: '史书、传记、文化' },
    { id: 'life', name: '生活美学', icon: 'leaf', desc: '家居、美食、旅行' },
    { id: 'art', name: '艺术设计', icon: 'palette', desc: '绘画、设计、摄影' },
    { id: 'science', name: '科普自然', icon: 'atom', desc: '物理、宇宙、生命' }
  ];

  /* 轮播广告位：引用真实书目，点击直接进详情 */
  var banners = [
    {
      id: 'b1',
      bookId: 3,
      kicker: '本周主打',
      title: '把框架读薄，把原理读厚',
      text: '计算机类图书满 99 减 20，会员再享 95 折',
      cta: '立即选购',
      theme: 'green'
    },
    {
      id: 'b2',
      bookId: 14,
      kicker: '艺术书单',
      title: '看见经典的重量',
      text: '艺术设计专场：精选画册与设计理论，限量 300 套',
      cta: '进入专场',
      theme: 'clay'
    },
    {
      id: 'b3',
      bookId: 7,
      kicker: '亲子共读',
      title: '把故事讲给孩子听',
      text: '少儿读物第二件半价，附赠导读手册',
      cta: '挑一本',
      theme: 'indigo'
    }
  ];

  /* 书目：price 为售价，originalPrice 为定价；stock 为库存；sales 为累计销量 */
  var books = [
    {
      id: 1,
      title: '长安的荔枝',
      author: '马伯庸',
      publisher: '湖南文艺出版社',
      category: 'literature',
      price: 39.8,
      originalPrice: 52.0,
      stock: 137,
      sales: 42610,
      rating: 4.8,
      pages: 288,
      publishDate: '2022-10',
      isbn: '978-7-5726-0843-1',
      tags: ['历史小说', '影视原著'],
      cover: { from: '#2f6f4e', to: '#17402c', glyph: '荔' },
      summary:
        '天宝十四载，长安城的小吏李善德接到一桩差事：在贵妃诞日前，把岭南的新鲜荔枝送到长安。荔枝三日色变，五千里的驿路，他必须算清每一匹马的脚力、每一处水陆的接续。一个九品小官的绝境突围，写尽大唐官场与百姓生计。',
      highlights: ['马伯庸历史小说代表作，销量逾百万册', '已被改编为影视剧，人物与情节还原度高', '附作者后记：一桩差事背后的盛唐物流']
    },
    {
      id: 2,
      title: '活着',
      author: '余华',
      publisher: '作家出版社',
      category: 'literature',
      price: 32.0,
      originalPrice: 45.0,
      stock: 92,
      sales: 88213,
      rating: 4.9,
      pages: 191,
      publishDate: '2012-08',
      isbn: '978-7-5063-6543-8',
      tags: ['当代文学', '经典再版'],
      cover: { from: '#8a5a44', to: '#5a3728', glyph: '活' },
      summary:
        '地主少爷福贵嗜赌成性，终于败光了家业。此后他经历战乱、饥荒与一场场离别，把命运的每一次捶打都咽了下去。余华用最朴素的语言，写出了一个人承受苦难的能力，以及活着本身的力量。',
      highlights: ['余华最广为流传的长篇小说', '多国译本，入选多项经典书单', '语言极简，情绪后劲极大']
    },
    {
      id: 3,
      title: 'Vue.js 设计与实现',
      author: '霍春阳',
      publisher: '人民邮电出版社',
      category: 'computer',
      price: 89.0,
      originalPrice: 129.0,
      stock: 64,
      sales: 20315,
      rating: 4.9,
      pages: 528,
      publishDate: '2022-01',
      isbn: '978-7-115-58291-4',
      tags: ['Vue3', '源码剖析'],
      cover: { from: '#1f7a6d', to: '#0f4a44', glyph: 'V' },
      summary:
        '以 Vue.js 3 源码为线索，讲清响应式系统、虚拟 DOM、渲染器、编译器与内在组件的工作方式。不是照抄源码，而是把设计动机与取舍讲透，读完能明白框架为什么这样写。',
      highlights: ['从零实现一个 mini 版响应式系统', '渲染器与 Diff 算法逐行拆解', '配套示例仓库，可随书动手验证'],
      recommended: true
    },
    {
      id: 4,
      title: 'JavaScript 高级程序设计（第4版）',
      author: '马特·弗里斯比',
      publisher: '人民邮电出版社',
      category: 'computer',
      price: 108.0,
      originalPrice: 149.0,
      stock: 41,
      sales: 33780,
      rating: 4.8,
      pages: 888,
      publishDate: '2020-11',
      isbn: '978-7-115-54538-1',
      tags: ['前端基石', '红宝书'],
      cover: { from: '#b4472e', to: '#7a2a18', glyph: 'JS' },
      summary:
        '前端工程师的案头书。从语言基础、DOM 与 BOM，到 ES6+ 新特性、模块化、异步编程与浏览器 API，覆盖现代 JavaScript 开发的完整知识面，示例可直接在浏览器里运行。',
      highlights: ['第 4 版全面覆盖 ES2015 之后的语法', '异步、模块化、代理与反射讲得最细', '适合作为系统学习 JavaScript 的主线教材'],
      recommended: true
    },
    {
      id: 5,
      title: '深入理解计算机系统（原书第3版）',
      author: 'Randal E. Bryant',
      publisher: '机械工业出版社',
      category: 'computer',
      price: 139.0,
      originalPrice: 168.0,
      stock: 18,
      sales: 15240,
      rating: 4.9,
      pages: 737,
      publishDate: '2016-10',
      isbn: '978-7-111-54493-7',
      tags: ['操作系统', '计算机组成'],
      cover: { from: '#334155', to: '#1c2534', glyph: 'CS' },
      summary:
        '从一行 C 程序如何变成可执行文件讲起，串起数据表示、汇编、存储层次、链接、虚拟内存、并发与网络编程。理解程序的机器视角，才能写出真正高效可靠的代码。',
      highlights: ['CMU 经典课程教材（CS:APP）', '每个概念都配可运行的实验', '面试与工程能力提升的硬书']
    },
    {
      id: 6,
      title: '小王子',
      author: '安托万·德·圣埃克苏佩里',
      publisher: '人民文学出版社',
      category: 'kids',
      price: 28.0,
      originalPrice: 38.0,
      stock: 205,
      sales: 52140,
      rating: 4.9,
      pages: 128,
      publishDate: '2018-06',
      isbn: '978-7-02-013340-8',
      tags: ['童话', '亲子共读'],
      cover: { from: '#3f6fa8', to: '#244a75', glyph: '星' },
      summary:
        '飞行员在沙漠中遇见小王子，听他讲自己星球上的玫瑰、旅途中遇到的大人和那只等待被驯养的狐狸。献给所有曾经是孩子的大人，关于爱、责任与看见本质的眼睛。',
      highlights: ['全彩插图版，四色印刷', '附亲子共读导读手册', '中小学生课外阅读推荐书目']
    },
    {
      id: 7,
      title: '夏洛的网',
      author: 'E.B.怀特',
      publisher: '上海译文出版社',
      category: 'kids',
      price: 25.0,
      originalPrice: 32.0,
      stock: 0,
      sales: 28960,
      rating: 4.8,
      pages: 176,
      publishDate: '2019-04',
      isbn: '978-7-5327-7961-2',
      tags: ['童话', '友谊'],
      cover: { from: '#7c9a3f', to: '#4e6a22', glyph: '网' },
      summary:
        '在朱克曼家的谷仓里，小猪威尔伯和蜘蛛夏洛成了朋友。当威尔伯面临被做成熏肉的危险时，夏洛用自己的丝在网上织出字，为朋友赢得了生存的机会。',
      highlights: ['关于友谊与承诺的经典童话', '语言幽默，适合大声朗读', '被多次改编为动画与电影'],
      recommended: true
    },
    {
      id: 8,
      title: '原则',
      author: '瑞·达利欧',
      publisher: '中信出版社',
      category: 'business',
      price: 78.0,
      originalPrice: 98.0,
      stock: 56,
      sales: 30215,
      rating: 4.6,
      pages: 576,
      publishDate: '2018-01',
      isbn: '978-7-5086-8409-6',
      tags: ['投资', '决策'],
      cover: { from: '#4b4a8f', to: '#2b2a5e', glyph: '则' },
      summary:
        '桥水基金创始人把自己几十年做决策的方法写成了可复用的原则：如何面对现实、如何做到极度透明与可信度加权、如何把经验沉淀成组织算法。',
      highlights: ['投资与管理双线并行的实践总结', '大量真实案例与失败复盘', '适合作为团队决策规范来读']
    },
    {
      id: 9,
      title: '认知觉醒',
      author: '周岭',
      publisher: '人民邮电出版社',
      category: 'business',
      price: 45.0,
      originalPrice: 58.0,
      stock: 88,
      sales: 41120,
      rating: 4.5,
      pages: 320,
      publishDate: '2020-09',
      isbn: '978-7-115-55249-0',
      tags: ['自我成长', '学习方法'],
      cover: { from: '#d97706', to: '#9a4d05', glyph: '醒' },
      summary:
        '从大脑的三重结构讲起，解释为什么我们总是急于求成、避难趋易，并给出一整套可操作的成长路径：清晰目标、刻意练习、深度沉浸与每日反思。',
      highlights: ['把认知科学翻译成可执行的方法', '附打卡模板与复盘清单', '适合学生与职场新人'],
      recommended: true
    },
    {
      id: 10,
      title: '万历十五年',
      author: '黄仁宇',
      publisher: '中华书局',
      category: 'history',
      price: 42.0,
      originalPrice: 56.0,
      stock: 73,
      sales: 26480,
      rating: 4.9,
      pages: 320,
      publishDate: '2014-05',
      isbn: '978-7-101-10505-3',
      tags: ['明史', '大历史观'],
      cover: { from: '#8c5a2b', to: '#5c3617', glyph: '万' },
      summary:
        '公元 1587 年，看似无事的这一年，却埋着帝国崩塌的伏笔。黄仁宇以万历皇帝、张居正、海瑞、戚继光等六个人物为切口，讲制度如何把人困住。',
      highlights: ['“大历史观”的代表作', '以人物写制度，读起来毫不枯燥', '中文史学的常销经典']
    },
    {
      id: 11,
      title: '明朝那些事儿（全九册）',
      author: '当年明月',
      publisher: '浙江人民出版社',
      category: 'history',
      price: 199.0,
      originalPrice: 299.0,
      stock: 26,
      sales: 61890,
      rating: 4.8,
      pages: 3200,
      publishDate: '2020-03',
      isbn: '978-7-213-09560-4',
      tags: ['明史', '通俗历史'],
      cover: { from: '#9a3b3b', to: '#63201f', glyph: '明' },
      summary:
        '从朱元璋起兵到崇祯自缢，三百年明朝兴衰以人物为线铺开。作者用讲故事的方式写正史，人物有血有肉，事件脉络清晰，是很多人爱上历史的起点。',
      highlights: ['全九册盒装，一次收齐', '语言幽默，适合通读', '附明代帝王世系表']
    },
    {
      id: 12,
      title: '断舍离',
      author: '山下英子',
      publisher: '广西科学技术出版社',
      category: 'life',
      price: 36.0,
      originalPrice: 45.0,
      stock: 112,
      sales: 34150,
      rating: 4.4,
      pages: 256,
      publishDate: '2013-07',
      isbn: '978-7-80763-984-2',
      tags: ['整理收纳', '生活方式'],
      cover: { from: '#6b8f8a', to: '#3f5f5c', glyph: '舍' },
      summary:
        '断 = 不买不需要的东西，舍 = 处理掉堆在身边的杂物，离 = 脱离对物品的执念。用一套可执行的整理方法，把房间和心情一起腾出空间。',
      highlights: ['日式整理术代表作', '按空间给出具体操作步骤', '附一周整理计划表']
    },
    {
      id: 13,
      title: '家的模样',
      author: '叶怡兰',
      publisher: '中信出版社',
      category: 'life',
      price: 58.0,
      originalPrice: 78.0,
      stock: 47,
      sales: 18620,
      rating: 4.6,
      pages: 288,
      publishDate: '2021-09',
      isbn: '978-7-5217-3366-9',
      tags: ['家居', '生活美学'],
      cover: { from: '#b07a4a', to: '#7a4c26', glyph: '家' },
      summary:
        '从光、材质、动线到收纳，作者记录自己造屋与居住的十年，讲清楚一个道理：好看的家不是买来的，而是一点点按生活方式长出来的。',
      highlights: ['全彩实景图，可当画册翻', '每章都有可落地的小改造建议', '适合装修前后反复阅读']
    },
    {
      id: 14,
      title: '艺术的故事',
      author: '贡布里希',
      publisher: '广西美术出版社',
      category: 'art',
      price: 168.0,
      originalPrice: 280.0,
      stock: 12,
      sales: 12480,
      rating: 4.9,
      pages: 688,
      publishDate: '2008-04',
      isbn: '978-7-80746-229-3',
      tags: ['艺术史', '画册'],
      cover: { from: '#6b4f8a', to: '#3d2b57', glyph: '艺' },
      summary:
        '从史前洞穴壁画到二十世纪现代艺术，贡布里希用一条清晰的线索讲完艺术史：每一代艺术家都在解决前一代留下的问题。被译成三十余种语言。',
      highlights: ['艺术史入门第一书', '全书四色精印，图版丰富', '附年表与图版索引'],
      recommended: true
    },
    {
      id: 15,
      title: '设计中的设计',
      author: '原研哉',
      publisher: '山东人民出版社',
      category: 'art',
      price: 68.0,
      originalPrice: 88.0,
      stock: 35,
      sales: 21740,
      rating: 4.7,
      pages: 288,
      publishDate: '2010-10',
      isbn: '978-7-209-05493-5',
      tags: ['设计思维', '日式美学'],
      cover: { from: '#8a8f96', to: '#4f545a', glyph: '白' },
      summary:
        '设计不是把东西做漂亮，而是把人们习以为常的事物重新变得陌生，再发现其中的问题。原研哉以自己的项目为例，讲“无印良品”“梅田医院指示系统”背后的思考。',
      highlights: ['设计思维启蒙经典', '大量项目案例与草图', '适合做设计之前先读']
    },
    {
      id: 16,
      title: '时间简史',
      author: '史蒂芬·霍金',
      publisher: '湖南科学技术出版社',
      category: 'science',
      price: 45.0,
      originalPrice: 68.0,
      stock: 79,
      sales: 45320,
      rating: 4.8,
      pages: 320,
      publishDate: '2018-01',
      isbn: '978-7-5357-9451-1',
      tags: ['宇宙学', '科普经典'],
      cover: { from: '#2b4a6f', to: '#152538', glyph: '宙' },
      summary:
        '从大爆炸到黑洞，从时间箭头到统一理论，霍金用几乎不含公式的语言，把二十世纪物理学的进展讲给普通人听。它让一代人对宇宙产生了好奇。',
      highlights: ['全球销量逾千万册的科普经典', '几乎不用公式，高中知识即可阅读', '附术语表与延伸阅读']
    },
    {
      id: 17,
      title: '上帝掷骰子吗',
      author: '曹天元',
      publisher: '北京联合出版公司',
      category: 'science',
      price: 52.0,
      originalPrice: 68.0,
      stock: 3,
      sales: 19860,
      rating: 4.9,
      pages: 424,
      publishDate: '2013-01',
      isbn: '978-7-5502-1271-4',
      tags: ['量子物理', '科学史'],
      cover: { from: '#a03c6b', to: '#6a1e42', glyph: '量' },
      summary:
        '从黑体辐射讲到多世界诠释，量子力学百年争论被写成了历史剧：爱因斯坦、玻尔、薛定谔轮番登场，每一次实验都改变了人类对实在的理解。',
      highlights: ['把量子力学史写成故事', '争论细节有据可查', '理科生与文科生都能读得下去'],
      isNew: true
    }
  ];

  /* 按分类取书，分类导航用它统计数量 */
  function booksOfCategory(id) {
    if (!id || id === 'all') return books;
    return books.filter(function (book) { return book.category === id; });
  }

  return {
    categories: categories,
    books: books,
    banners: banners,
    booksOfCategory: booksOfCategory
  };
})();
