//===============================================================
// メニュー制御用の関数とイベント設定（※バージョン2025-1）
//===============================================================
$(function(){
  //-------------------------------------------------
  // 変数の宣言
  //-------------------------------------------------
  const $menubar = $('#menubar');
  const $menubarHdr = $('#menubar_hdr');
  const breakPoint = 900;	// ここがブレイクポイント指定箇所です

  // ▼ここを切り替えるだけで 2パターンを使い分け！
  //   false → “従来どおり”
  //   true  → “ハンバーガーが非表示の間は #menubar も非表示”
  const HIDE_MENUBAR_IF_HDR_HIDDEN = false;

  // タッチデバイスかどうかの判定
  const isTouchDevice = ('ontouchstart' in window) ||
                       (navigator.maxTouchPoints > 0) ||
                       (navigator.msMaxTouchPoints > 0);

  //-------------------------------------------------
  // debounce(処理の呼び出し頻度を抑制) 関数
  //-------------------------------------------------
  function debounce(fn, wait) {
    let timerId;
    return function(...args) {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        fn.apply(this, args);
      }, wait);
    };
  }

  //-------------------------------------------------
  // ドロップダウン用の初期化関数
  //-------------------------------------------------
  function initDropdown($menu, isTouch) {
    // ドロップダウンメニューが存在するliにクラス追加
    $menu.find('ul li').each(function() {
      if ($(this).find('ul').length) {
        $(this).addClass('ddmenu_parent');
        $(this).children('a').addClass('ddmenu');
      }
    });

    // ドロップダウン開閉のイベント設定
    if (isTouch) {
      // タッチデバイスの場合 → タップで開閉
      $menu.find('.ddmenu').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const $dropdownMenu = $(this).siblings('ul');
        if ($dropdownMenu.is(':visible')) {
          $dropdownMenu.hide();
        } else {
          $menu.find('.ddmenu_parent ul').hide(); // 他を閉じる
          $dropdownMenu.show();
        }
      });
    } else {
      // PCの場合 → ホバーで開閉
      $menu.find('.ddmenu_parent').hover(
        function() {
          $(this).children('ul').show();
        },
        function() {
          $(this).children('ul').hide();
        }
      );
    }
  }

  //-------------------------------------------------
  // ハンバーガーメニューでの開閉制御関数
  //-------------------------------------------------
  function initHamburger($hamburger, $menu) {
    $hamburger.on('click', function() {
      $(this).toggleClass('ham');
      if ($(this).hasClass('ham')) {
        $menu.show();
        // ▼ ブレイクポイント未満でハンバーガーが開いたら body のスクロール禁止
        //    （メニューが画面いっぱいに fixed 表示されている時に背後をスクロールさせないため）
        if ($(window).width() < breakPoint) {
          $('body').addClass('noscroll');  // ★追加
        }
      } else {
        $menu.hide();
        // ▼ ハンバーガーを閉じたらスクロール禁止を解除
        if ($(window).width() < breakPoint) {
          $('body').removeClass('noscroll');  // ★追加
        }
      }
      // ドロップダウン部分も一旦閉じる
      $menu.find('.ddmenu_parent ul').hide();
    });
  }

  //-------------------------------------------------
  // レスポンシブ時の表示制御 (リサイズ時)
  //-------------------------------------------------
  const handleResize = debounce(function() {
    const windowWidth = $(window).width();

    // bodyクラスの制御 (small-screen / large-screen)
    if (windowWidth < breakPoint) {
      $('body').removeClass('large-screen').addClass('small-screen');
    } else {
      $('body').removeClass('small-screen').addClass('large-screen');
      // PC表示になったら、ハンバーガー解除 + メニューを開く
      $menubarHdr.removeClass('ham');
      $menubar.find('.ddmenu_parent ul').hide();

      // ▼ PC表示に切り替わったらスクロール禁止も解除しておく (保険的な意味合い)
      $('body').removeClass('noscroll'); // ★追加

      // ▼ #menubar を表示するか/しないかの切り替え
      if (HIDE_MENUBAR_IF_HDR_HIDDEN) {
        $menubarHdr.hide();
        $menubar.hide();
      } else {
        $menubarHdr.hide();
        $menubar.show();
      }
    }

    // スマホ(ブレイクポイント未満)のとき
    if (windowWidth < breakPoint) {
      $menubarHdr.show();
      if (!$menubarHdr.hasClass('ham')) {
        $menubar.hide();
        // ▼ ハンバーガーが閉じている状態ならスクロール禁止も解除
        $('body').removeClass('noscroll'); // ★追加
      }
    }
  }, 200);

  //-------------------------------------------------
  // 初期化
  //-------------------------------------------------
  // 1) ドロップダウン初期化 (#menubar)
  initDropdown($menubar, isTouchDevice);

  // 2) ハンバーガーメニュー初期化 (#menubar_hdr + #menubar)
  initHamburger($menubarHdr, $menubar);

  // 3) レスポンシブ表示の初期処理 & リサイズイベント
  handleResize();
  $(window).on('resize', handleResize);

  //-------------------------------------------------
  // アンカーリンク(#)のクリックイベント
  //-------------------------------------------------
  $menubar.find('a[href^="#"]').on('click', function() {
    // ドロップダウンメニューの親(a.ddmenu)のリンクはメニューを閉じない
    if ($(this).hasClass('ddmenu')) return;

    // スマホ表示＆ハンバーガーが開いている状態なら閉じる
    if ($menubarHdr.is(':visible') && $menubarHdr.hasClass('ham')) {
      $menubarHdr.removeClass('ham');
      $menubar.hide();
      $menubar.find('.ddmenu_parent ul').hide();
      // ハンバーガーが閉じたのでスクロール禁止を解除
      $('body').removeClass('noscroll'); // ★追加
    }
  });

  //-------------------------------------------------
  // 「header nav」など別メニューにドロップダウンだけ適用したい場合
  //-------------------------------------------------
  // 例：header nav へドロップダウンだけ適用（ハンバーガー連動なし）
  //initDropdown($('header nav'), isTouchDevice);
});


//===============================================================
// スムーススクロール（※バージョン2024-1）※通常タイプ
//===============================================================
$(function() {
    // ページ上部へ戻るボタンのセレクター
    var topButton = $('.pagetop');
    // ページトップボタン表示用のクラス名
    var scrollShow = 'pagetop-show';

    // スムーススクロールを実行する関数
    // targetにはスクロール先の要素のセレクターまたは'#'（ページトップ）を指定
    function smoothScroll(target) {
        // スクロール先の位置を計算（ページトップの場合は0、それ以外は要素の位置）
        var scrollTo = target === '#' ? 0 : $(target).offset().top;
        // アニメーションでスムーススクロールを実行
        $('html, body').animate({scrollTop: scrollTo}, 500);
    }

    // ページ内リンクとページトップへ戻るボタンにクリックイベントを設定
    $('a[href^="#"], .pagetop').click(function(e) {
        e.preventDefault(); // デフォルトのアンカー動作をキャンセル
        var id = $(this).attr('href') || '#'; // クリックされた要素のhref属性を取得、なければ'#'
        smoothScroll(id); // スムーススクロールを実行
    });

    // スクロールに応じてページトップボタンの表示/非表示を切り替え
    $(topButton).hide(); // 初期状態ではボタンを隠す
    $(window).scroll(function() {
        if($(this).scrollTop() >= 300) { // スクロール位置が300pxを超えたら
            $(topButton).fadeIn().addClass(scrollShow); // ボタンを表示
        } else {
            $(topButton).fadeOut().removeClass(scrollShow); // それ以外では非表示
        }
    });

    // ページロード時にURLのハッシュが存在する場合の処理
    if(window.location.hash) {
        // ページの最上部に即時スクロールする
        $('html, body').scrollTop(0);
        // 少し遅延させてからスムーススクロールを実行
        setTimeout(function() {
            smoothScroll(window.location.hash);
        }, 10);
    }
});

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
//timeはミリ秒

//===============================================================
// 異常ポップアップ演出
//===============================================================
/*
 * 0 : modal名
 * 1 : 位置(top)
 * 2 : 位置(left)
 */
let bugWindowList = [
  ['bugPopup1', "50px", "50px"],
  ['bugPopup2', "100px", "900px"],
  ['bugPopup3', "140px", "350px"],
  ['bugPopup4', "190px", "120px"],
  ['bugPopup5', "250px", "780px"],
  ['bugPopup6', "290px", "350px"],
  ['bugPopup7', "340px", "610px"],
  ['bugPopup8', "380px", "270px"],
  ['bugPopup9', "430px", "490px"],
  ['bugPopup10', "80px", "550px"],
  ['bugPopup11', "23px", "420px"],
  ['bugPopup12', "200px", "620px"],
  ['bugPopup13', "10px", "820px"],
  ['bugPopup14', "370px", "850px"],
  ['bugPopup15', "100px", "170px"],
  ['bugPopup16', "350px", "100px"],
  ['bugPopup17', "450px", "40px"],
  ['bugPopup18', "460px", "700px"],
  ['bugPopup19', "215px", "950px"],
  ['bugPopup20', "265px", "150px"]
];
async function directionWarning(){
  let i = 0;
  let sleep_time = 1500;

  //document.body.style.filter = "invert(1)";

  document.body.style.background = "black";
  document.body.style.color = "red";
  document.getElementById("full").style.background = "black";
  document.getElementById("footer").style.color = "black";  // 文字色を赤に変更
  document.getElementById("footer").style.background = "black";  // 文字色を赤に変更

  await sleep(2000);
  let variables = [];
  for (i=0, len=bugWindowList.length; i<20; i++, len--){
    rand = Math.floor( Math.random() * len); // 0～len-1の範囲の整数からランダムに値を取得  

    variables[i] = document.getElementById(bugWindowList[rand][0]);
    variables[i].style.zIndex = i + 1000;
    variables[i].style.top = bugWindowList[rand][1];
    variables[i].style.left = bugWindowList[rand][2];
    variables[i].style.display = "block";

    bugWindowList.push(bugWindowList.splice(rand, 1)); // 配列のランダム値に対応するインデックスを得たうえで元々の配列から取り除く

    await sleep(sleep_time);
    if(i == 2){
      sleep_time = 500;
    }else if (i == 5){
      sleep_time = 250;
      startGarble();
    }else if(i == 8){
      sleep_time = 200;
    }else if(i == 11){
      sleep_time = 100;
    }else if(i == 14){
      sleep_time = 100;
    }
  }

  $('html, body').css('overflow', 'hidden');
  
  showLoadingPopup();
}

let isExe = false;
function directionBugStart() {
  if(!isExe){
    isExe = true;
    setTimeout(directionWarning, 25000);  
  }
}

//===============================================================
// 文字化け演出
//===============================================================
const originalText = document.getElementById("contents").textContent;
const textElement = document.getElementById("contents");
let intervalId = null;
function randomUnicodeChar() {
  // 無意味で表示が壊れやすい文字の範囲から選ぶ（制御文字除く）
  const ranges = [
    [0x0370, 0x03FF],   // ギリシャ文字
    [0x0400, 0x04FF],   // キリル文字
    [0x2000, 0x206F],   // 一般的な記号
    [0x2100, 0x214F],   // 書記記号
    [0x2190, 0x21FF],   // 矢印
    //[0x2300, 0x23FF],   // 技術記号
    [0x2500, 0x257F],   // ボックス描画
    [0x2E80, 0x2EFF],   // CJK部首
    [0x3000, 0x30FF],   // 日本語記号・カタカナ
  ];

  const [start, end] = ranges[Math.floor(Math.random() * ranges.length)];
  return String.fromCharCode(start + Math.floor(Math.random() * (end - start)));
}

function garbleText(length) {
  return Array.from({ length }).map(() => randomUnicodeChar()).join('');
}

function startGarble() {
  const length = originalText.length;
  if (intervalId) clearInterval(intervalId);

  intervalId = setInterval(() => {
    textElement.textContent = garbleText(length);
  }, 150);
}


//===============================================================
// リダイレクト時プログレスバー演出
//===============================================================
function showLoadingPopup() {
  document.getElementById("redirect-popup").style.display = "block";

  let fill = document.getElementById("progressBarFill");
  let progress = 0;
  let interval = setInterval(() => {
    progress += 10;
    fill.style.width = progress + "%";
    if (progress == 100) {
      window.location.href = 'https://unknown-yorushiro.github.io/whoami/';
    }
  }, 300);
}
