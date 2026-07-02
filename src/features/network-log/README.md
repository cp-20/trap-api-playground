# network-log

notebook 実行中に発生した API request/response と mutation 履歴の表示を担当します。

ログの生成は runtime worker、永続化は notebook feature が担当し、この feature は閲覧と revert 操作の入口を提供します。
