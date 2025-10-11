// ==UserScript==
// @name         QuickShareDL
// @namespace    https://github.com/Neeted
// @version      1.1.0
// @description  Googleドライブ、Dropbox、OneDrive、MediaFire、MEGAのファイル共有ページで自動的にダウンロードを開始しタブを自動で閉じます
// @author       ﾏﾝﾊｯﾀﾝｶﾞｯﾌｪ
// @match        https://drive.google.com/file/d/*
// @match        https://drive.usercontent.google.com/download*
// @match        https://www.dropbox.com/scl/fi/*
// @match        https://www.mediafire.com/file/*
// @match        https://onedrive.live.com/*
// @match        https://mega.nz/file/*
// @grant        window.close
// @grant        GM_openInTab
// @updateURL    https://neeted.github.io/quick-share-dl/quick_share_dl.user.js
// @downloadURL  https://neeted.github.io/quick-share-dl/quick_share_dl.user.js
// ==/UserScript==

// DL処理開始後にウィンドウ閉じるまでの時間(ミリ秒)
// スクリプトからDLが開始できているか知ることはできないのでデフォルトでは10秒と長めに設定してある
const WINDOW_CLOSE_TIMEOUT = 10000;

// falseにすればタブを自動で閉じない
const AUTO_TAB_CLOSE = true;

(function() {
  // サイトごとに処理を分岐
  if (window.location.href.startsWith("https://drive.google.com/file/d/")) {
    // Googleドライブのファイルビューアーページの場合
    googleDriveFileView();
  } else if (window.location.href.startsWith("https://drive.usercontent.google.com/download?id=")) {
    // Googleドライブの大容量ファイルDL時の警告ページの場合
    googleDriveWarnPage();
  } else if (window.location.href.startsWith("https://www.dropbox.com/scl/fi/") && !window.location.search.includes("dl=1")) {
    // Dropboxのファイル共有ページで自動でDL開始しない("dl=1"パラメータがセットされていない)場合
    dropboxFilePage();
  } else if (window.location.href.startsWith("https://www.mediafire.com/file/")) {
    // MediaFireのファイル共有ページの場合
    mediaFireFilePage();
  } else if (window.location.href.startsWith("https://onedrive.live.com/")) {
    // OneDriveの場合
    oneDrive();
  } else if (window.location.href.startsWith("https://mega.nz/file/")) {
    // MEGAの場合
    megaFilePage();
  }
})();

// Googleドライブのビューアーページでの処理
function googleDriveFileView() {
  console.log("Googleドライブのファイルページです");
  // ファイルIDを抽出
  const match = window.location.href.match(/^https:\/\/drive\.google\.com\/file\/d\/([^/]+)/);

  if (match) {
    const fileId = match[1];
    const downloadUrl = "https://drive.usercontent.google.com/download?id=" + fileId + "&export=download";

    // ダウンロードページを新規タブで開く
    GM_openInTab(downloadUrl);
    if (AUTO_TAB_CLOSE) {
      window.close();
    }
  } else {
    console.error("ファイルIDを抽出できませんでした");
  }
}

// Googleドライブの大容量ファイルDL時の警告ページでの処理（form→GM_openInTab優先、なければclickフォールバック）
function googleDriveWarnPage() {
  console.log("Googleドライブのウイルススキャン不可警告ページです");

  const form = document.getElementById("download-form");
  const dlButton = document.getElementById("uc-download-link");
  const captionEl = document.querySelector("#uc-text > p.uc-warning-caption");

  // form が存在し method が GET なら URL を組み立てて新しいタブで開く
  if (form && (form.method || '').toLowerCase() === 'get' && (form.action || '').trim() !== '') {
    try {
      // 基準を current location にして action を解決
      const actionUrl = new URL(form.action, location.href);
      const params = new URLSearchParams(actionUrl.search);

      // form 内の input[name] をクエリに追加（submit/button は除外）
      form.querySelectorAll('input[name]').forEach(inp => {
        const name = inp.name;
        if (!name) return;
        const type = (inp.type || '').toLowerCase();
        if (type === 'submit' || type === 'button') return;
        if (inp.disabled) return; // disabled は無視
        params.set(name, inp.value || ''); // value をセット（空文字でもセットする）
      });

      actionUrl.search = params.toString();
      const downloadUrl = actionUrl.toString();

      if (captionEl) captionEl.textContent = "自動で新しいタブを開いてダウンロードを開始します";
      GM_openInTab(downloadUrl);
      if (AUTO_TAB_CLOSE) {
        window.close();
      }
      return; // 成功したので終了
    } catch (e) {
      console.warn("download-form -> URL 組み立てに失敗しました。フォールバックに移行します:", e);
      // そのままフォールバックへ
    }
  }

  // form がなかったり form 組み立てに失敗した場合は既存のボタンクリックを試す
  if (dlButton) {
    try {
      dlButton.click();
      if (captionEl) captionEl.textContent = "自動で「このままダウンロード」をクリックしました";
      endProc();
    } catch (e) {
      console.error("ダウンロードボタンのクリックに失敗しました:", e);
    }
  } else {
    console.error("ダウンロードボタンが見つかりませんでした");
  }
}

// Dropboxのファイル共有ページで自動でDL開始しない("dl=1"パラメータがセットされていない)場合の処理
function dropboxFilePage() {
  console.log("Dropboxのファイル共有ページです");
  // dl=1 にした URL を作る
  let downloadUrl;
  if (window.location.search.includes("dl=0")) {
    downloadUrl = window.location.href.replace("dl=0", "dl=1");
  } else {
    // dlパラメータが無ければ追記
    const url = new URL(window.location.href);
    url.searchParams.set("dl", "1");
    downloadUrl = url.toString();
  }
  GM_openInTab(downloadUrl);
  if (AUTO_TAB_CLOSE) {
    window.close();
  }
}

// MediaFireのファイル共有ページでの処理
function mediaFireFilePage() {
  console.log("MediaFireのファイル共有ページです");
  const btn = document.querySelector("a#downloadButton, a.input.popsok");
  if (btn && btn.href.includes("mediafire.com")) {
    GM_openInTab(btn.href);
    if (AUTO_TAB_CLOSE) {
      window.close();
    }
  }
}

// OneDriveでの処理
// 非ログイン時にバックグラウンドでDOMが生成されないためタイムアウトは設定しない、visibilitychangeイベント後に監視を開始する方法もあるが面倒なので省略
// ログイン時はバックグラウンドでもDOMが生成されるので問題ない
function oneDrive() {
  console.log("OneDriveのページです");
  // const TIMEOUT_MS = 15000; // 最大待ち時間（ミリ秒）

  // 優先順に試すセレクタ（先頭が最優先）
  const selList = [
    '#downloadCommand', // ログイン時、画面左上のボタン(非ログイン時と違い幅が狭くても表示される)
    '[data-automationid="download"]', // 非ログイン時、画面左上のボタン(ブラウザ幅が狭いと表示されない)
    'button.od-Button.od-ButtonBarCommand.od-Button--primary' // 非ログイン時、画面中央のボタン(幅にかかわらず表示される)
  ];

  // selListの中から最初に見つかった要素を返す関数
  function findFirstSelector(selList) {
    for (const sel of selList) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  // selListの中から最初に見つかった要素が現れるまで待つ関数
  function waitForAnySelector(selList) {
    return new Promise((resolve) => {
      const found = findFirstSelector(selList);
      if (found) {
        resolve(found);
        return;
      }

      const obs = new MutationObserver(() => {
        const found = findFirstSelector(selList);
        if (found) {
          obs.disconnect();
          resolve(found);
        }
      });

      obs.observe(document, { childList: true, subtree: true });

      // setTimeout(() => {
      //   obs.disconnect();
      // }, TIMEOUT_MS);
    });
  }

  // 非同期関数を即時実行
  (async () => {
    const btn = await waitForAnySelector(selList); // ボタンが見つかるまで待機
    // ボタンが見つかったらクリックして処理終了
    if (btn) {
      btn.click();
      endProc();
    }
  })();
}

// faviconを変更する関数
function changeFavicon(faviconUrl) {
  // 既存の favicon を削除
  document.querySelectorAll("link[rel*='icon']").forEach(e => e.remove());

  // 新しい link を作成
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/png";
  link.href = faviconUrl;
  document.head.appendChild(link);
}

// MEGAファイルページでの処理
// MutationObserverを使うとMEGAのダウンロードや復号化処理が不安定になる事象が起きたためsetIntervalでのDOMチェックにした
// この場合でも最後の複合中に処理が進まなくなくなる事象が稀にありそうでスクリプトの影響なのか定かではないが注意が必要そう
// バックグラウンドのままダウンロードを開始するのが良くないかもしれないので場合によってはタブにフォーカスしてからの処理開始を検討したほうが良さそう
function megaFilePage() {
  // ダウンロードボタン
  const DOWNLOAD_SELECTOR = 'button.mega-button.positive.js-default-download.js-standard-download';
  // 通常はhiddenだがキャッシュ済みデータがあると表示される「保存」ボタン
  const SAVE_SELECTOR = 'button.mega-button.positive.save.js-save-download:not(.hidden)';
  // 現状このdivにdownload-completeがあるかどうかを見ることでダウンロードの完了とキャッシュ済みデータの保存の完了の双方を検知できる
  const COMPLETE_SELECTOR = 'div.download-content.download.download-page.download-complete';

  let clicked = false;

  function checkOnce() {
    // 未クリックの場合「ダウンロード」か「保存」ボタンのクリックを試みる
    if (!clicked) {
      const dl = document.querySelector(DOWNLOAD_SELECTOR);
      const save = document.querySelector(SAVE_SELECTOR);
      if (dl) {
        dl.click();
        clicked = true;
      } else if (save) {
        save.click();
        clicked = true;
      }
    }

    // クリック済みの場合完了状態か確かめる
    if (clicked) {
      const comp = document.querySelector(COMPLETE_SELECTOR);
      if (comp) {
        clearInterval(poller);
        // 念のため少し遅延してクローズ
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    }
  }

  checkOnce(); // 初回即時チェック
  const poller = setInterval(checkOnce, 1000); // 1秒ごとにチェック
}

// タイトルやfaviconを処理が完了したものを示すものに変更し、一定時間後にウィンドウを閉じる関数
function endProc() {
  const greenIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACdJREFUeNpi/M9AGmAiUT0DC4RiJMKi/4xk2TCqYaRoYKR5agUIMADPEgQfB7nemwAAAABJRU5ErkJggg==";
  changeFavicon(greenIcon);

  const originalTitle = document.title;
  const startTime = Date.now();
  // 500ミリ秒ごとにタイトルを更新して経過時間を表示、バックグラウンドタブの場合正確に500ミリ秒ごとに更新されないことがある
  setInterval(() => {
    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
    document.title = "✅" + elapsedSec + " " + originalTitle;
  }, 500);

  // AUTO_TAB_CLOSEがtrueの場合、一定時間後にウィンドウを閉じる
  if (AUTO_TAB_CLOSE) {
    setTimeout(() => {
      try { window.close(); } catch (e) { /* 無視 */ }
    }, WINDOW_CLOSE_TIMEOUT);
  }
}
