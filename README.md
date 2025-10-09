# QuickShareDL

## 概要

Tampermonkeyなどで利用可能なユーザースクリプトです。
Google ドライブ / Dropbox / MediaFire のファイル共有ページを開くと自動的にダウンロードを開始します。新規タブで開いた場合にはダウンロードを開始後に自動でタブを閉じます。

## 使い方

ブラウザにTampermonkeyといったユーザースクリプト実行機能を入れている状態で以下のリンクを開けば自動的にインストールするかどうか聞かれると思います。

- [https://neeted.github.io/quick-share-dl/quick_share_dl.user.js](https://neeted.github.io/quick-share-dl/quick_share_dl.user.js)

もし、このスクリプトを更新するようなことがあったら、自動的に更新されると思います。

## 対応対象

- Google Drive: /file/d/* と drive.usercontent.google.com のダウンロード警告ページ
- Dropbox: /scl/fi/* （ファイル共有ページ）
- MediaFire: /file/* （ファイルページ）

## 注意事項

- フォルダ共有には非対応(DL開始にどれくらい時間が掛かるか不透明なため)
- 自動ダウンロードはセキュリティリスクを伴います。必要な時だけ有効にした方が良いかもしれません。
- サービス側の仕様変更により動作しなくなる可能性があります。

## TODO

- OneDriveは技術的には対応が可能そうなものの実装が煩雑になりそうなので後回し(対応予定なし)
