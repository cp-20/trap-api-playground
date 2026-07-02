# entities

ユーザー、チャンネル、スタンプ、グループなどの entity index と runtime globals を担当します。

data layer から取得した生データを chip 表示や notebook global で使いやすい形へ構築します。HTTP 取得そのものは `src/data` に置きます。
