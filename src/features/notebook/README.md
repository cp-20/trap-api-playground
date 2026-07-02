# notebook

セルの状態、editor 接続、ショートカット、runtime worker とのやり取り、ノートブック保存を担当します。

現在のセルや command は Jotai atom に置き、DOM や Monaco editor の実体だけを ref で保持します。API metadata、auth token、entity globals は各 feature の atom から読む境界にします。
