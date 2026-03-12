# QuickShareDL

## 概要

Tampermonkeyなどで利用可能なユーザースクリプトです。
Googleドライブ / Dropbox / OneDrive / MediaFire / MEGA のファイル共有ページを開くと自動的にダウンロードを開始します。ダウンロード開始後に自動でタブを閉じます。

## 使い方

ブラウザにTampermonkeyといったユーザースクリプト実行機能を入れている状態で以下のリンクを開けば自動的にインストールするかどうか聞かれると思います。

- [https://neeted.github.io/quick-share-dl/quick_share_dl.user.js](https://neeted.github.io/quick-share-dl/quick_share_dl.user.js)

もし、このスクリプトを更新するようなことがあったら、自動的に更新されると思います。

## 対応対象

- Googleドライブ: /file/d/* と drive.usercontent.google.com のダウンロード警告ページ
- Dropbox: /scl/fi/* （ファイル共有ページ）
- MediaFire: /file/* （ファイルページ）
- OneDrive: onedrive.live.com/* 個別ファイルのダウンロードボタンが表示されたとき
- MEGA: /file/* （ファイル共有ページ）

## 注意事項

- **OneDriveは自分のドライブを操作しているときに誤爆(自分のファイルをDL)する可能性があるので注意**
- OneDriveは非ログイン時にバックグラウンドタブのページが描写されないのでタブをフォーカスしないとDLが開始しません。ログイン時はバックグラウンドでもページが描写されるのでそのまま自動DLできます。
- フォルダ共有には非対応(DL開始にどれくらい時間が掛かるか不透明なため)
- 自動ダウンロードはセキュリティリスクを伴います。必要な時だけ有効にした方が良いかもしれません。
- サービス側の仕様変更により動作しなくなる可能性があります。
- DL開始処理後、タブを自動で閉じるかや閉じるまでの時間はスクリプト冒頭の定数で設定できます。

## noteの記事

詳しいことはむしろ以下のnoteの記事の方がよく書いてあるかもしれません

[Googleドライブ、Dropbox、OneDrive、MediaFire、MEGAの共有リンクを開いた際に自動でダウンロードを開始するユーザースクリプトを作りました [BMS]](https://note.com/3935/n/n7a753990f1f6)
