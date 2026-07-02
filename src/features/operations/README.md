# operations

OpenAPI から作る API operation catalog と、その Jotai state を担当します。

生成時の抽出、operation metadata の型、実行時に参照する catalog を管理します。実際の HTTP request 構築と送信は `src/data/request.ts` の責務です。
