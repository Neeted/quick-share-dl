// ==UserScript==
// @name         QuickShareDL
// @namespace    https://github.com/Neeted
// @version      1.0.0
// @description  Googleドライブ、Dropbox、MediaFireのファイル共有ページで自動的にダウンロードを開始し新規タブなら自動で閉じます
// @author       ﾏﾝﾊｯﾀﾝｶﾞｯﾌｪ
// @match        https://drive.google.com/file/d/*
// @match        https://drive.usercontent.google.com/download*
// @match        https://www.dropbox.com/scl/fi/*
// @match        https://www.mediafire.com/file/*
// @grant        none
// @updateURL    https://neeted.github.io/quick-share-dl/quick_share_dl.user.js
// @downloadURL  https://neeted.github.io/quick-share-dl/quick_share_dl.user.js
// ==/UserScript==

(function() {
  'use strict';

  // サイトごとに処理を分岐
  if (window.location.href.startsWith("https://drive.google.com/file/d/")) {
    // Googleドライブのファイルビューアーページの場合
    googleDriveFileView();
  } else if (window.location.href.startsWith("https://drive.usercontent.google.com/download?id=")) {
    // Googleドライブの大容量ファイルDL時の警告ページの場合
    googleDriveWarnPage();
  } else if (window.location.href.startsWith("https://www.dropbox.com/scl/fi/" && !window.location.search.includes("dl=1"))) {
    // Dropboxのファイル共有ページで自動でDL開始しない("dl=1"パラメータがセットされていない)場合
    dropboxFilePage();
  } else if (window.location.href.startsWith("https://www.mediafire.com/file/")) {
    // MediaFireのファイル共有ページの場合
    mediaFireFilePage();
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
  windowClose();
}

// Googleドライブの大容量ファイルDL時の警告ページでの処理
function googleDriveWarnPage() {
  console.log("Googleドライブのウイルススキャン不可警告ページです");
  const dlButton = document.getElementById("uc-download-link");

  if (dlButton) {
    document.getElementById("uc-download-link").click();
    document.querySelector("#uc-text > p.uc-warning-caption").textContent = "自動で「このままダウンロード」をクリックしました";
  } else {
    console.error("ダウンロードボタンが見つかりませんでした");
  }
  windowClose();
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
  }
  windowClose();
}

// 10秒後に閉じるを試行（ブラウザが許可する場合のみ閉じる）
// 新しいタブで開くなど履歴が1つしかない状態ならスクリプトから閉じることができるはず
function windowClose() {
  setTimeout(() => {
    try { window.close(); } catch (e) { /* 無視 */ }
  }, 10000);
}
