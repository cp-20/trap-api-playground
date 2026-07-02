# auth

traQ OAuth のログイン開始、callback 処理、token の保存状態を担当します。

API catalog や notebook 実行には token atom を公開するだけにして、認証フローの詳細を外へ漏らさない役割です。
