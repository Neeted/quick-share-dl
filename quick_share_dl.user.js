// ==UserScript==
// @name         QuickShareDL
// @namespace    https://github.com/Neeted
// @version      1.0.2
// @description  Googleドライブ、Dropbox、OneDrive、MediaFireのファイル共有ページで自動的にダウンロードを開始し新規タブなら自動で閉じます
// @author       ﾏﾝﾊｯﾀﾝｶﾞｯﾌｪ
// @match        https://drive.google.com/file/d/*
// @match        https://drive.usercontent.google.com/download*
// @match        https://www.dropbox.com/scl/fi/*
// @match        https://www.mediafire.com/file/*
// @match        https://onedrive.live.com/*
// @grant        none
// @updateURL    https://neeted.github.io/quick-share-dl/quick_share_dl.user.js
// @downloadURL  https://neeted.github.io/quick-share-dl/quick_share_dl.user.js
// ==/UserScript==

// DL処理開始後にウィンドウ閉じるまでの時間(ミリ秒)
// スクリプトからDLが開始できているか知ることはできないのでデフォルトでは10秒と長めに設定してある
const WINDOW_CLOSE_TIMEOUT = 10000;

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
  }
})();

// Googleドライブのビューアーページでの処理
function googleDriveFileView() {
  console.log("Googleドライブのファイルページです");
  // ファイルIDを抽出
  const match = window.location.href.match(/^https:\/\/drive\.google\.com\/file\/d\/([^/]+)/);

  if (match) {
    const fileId = match[1];
    const downloadUrl = "https://drive.usercontent.google.com/download?id=" + fileId;

    // ダウンロードページにリダイレクト
    window.location.replace(downloadUrl);
  } else {
    console.error("ファイルIDを抽出できませんでした");
  }
}

// Googleドライブの大容量ファイルDL時の警告ページでの処理
function googleDriveWarnPage() {
  console.log("Googleドライブのウイルススキャン不可警告ページです");
  const dlButton = document.getElementById("uc-download-link");

  if (dlButton) {
    document.getElementById("uc-download-link").click();
    document.querySelector("#uc-text > p.uc-warning-caption").textContent = "自動で「このままダウンロード」をクリックしました";
    windowClose();
  } else {
    console.error("ダウンロードボタンが見つかりませんでした");
  }
}

// Dropboxのファイル共有ページで自動でDL開始しない("dl=1"パラメータがセットされていない)場合の処理
function dropboxFilePage() {
  console.log("Dropboxのファイル共有ページです");
  if (window.location.search.includes("dl=0")) {
    window.location.replace(window.location.href.replace("dl=0", "dl=1"));
  } else {
    // dlパラメータが無ければ追記
    const url = new URL(window.location.href);
    url.searchParams.set("dl", "1");
    window.location.replace(url.toString());
  }
  windowClose();
}

// MediaFireのファイル共有ページでの処理
function mediaFireFilePage() {
  console.log("MediaFireのファイル共有ページです");
  const btn = document.querySelector("a#downloadButton, a.input.popsok");
  if (btn && btn.href.includes("mediafire.com")) {
    window.location.href = btn.href;
    windowClose();
  }
}

// OneDriveでの処理
function oneDrive() {
  console.log("OneDriveのページです");
  const TIMEOUT_MS = 15000; // 最大待ち時間（ミリ秒）

  // 優先順に試すセレクタ（先頭が最優先）
  const selList = [
    '#downloadCommand', // ログイン時（優先）
    '[data-automationid="download"]' // 非ログイン時
  ];

  function findFirstSelector(selList) {
    for (const sel of selList) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

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

      setTimeout(() => {
        obs.disconnect();
      }, TIMEOUT_MS);
    });
  }

  (async () => {
    const btn = await waitForAnySelector(selList);
    if (btn) {
      btn.click();
      windowClose();
    }
  })();
}

// ページタイトルとfaviconを変更する関数
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

// 10秒後に閉じるを試行（ブラウザが許可する場合のみ閉じる）新しいタブで開くなど履歴が1つしかない状態ならスクリプトから閉じることができるはず
// タイトルやfaviconを処理が完了したものを示すものに変更する
function windowClose() {
  const greenIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACdJREFUeNpi/M9AGmAiUT0DC4RiJMKi/4xk2TCqYaRoYKR5agUIMADPEgQfB7nemwAAAABJRU5ErkJggg==";
  changeFavicon(greenIcon);

  const originalTitle = document.title;
  const startTime = Date.now();
  // 500ミリ秒ごとにタイトルを更新して経過時間を表示、バックグラウンドタブの場合正確に500ミリ秒ごとに更新されないことがある
  setInterval(() => {
    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
    document.title = "✅" + elapsedSec + " " + originalTitle;
  }, 500);

  setTimeout(() => {
    try { window.close(); } catch (e) { /* 無視 */ }
  }, WINDOW_CLOSE_TIMEOUT);
}
