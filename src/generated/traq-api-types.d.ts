declare namespace Traq {
  /**
   * メッセージ
   */
  export type Message = {
  /**
   * メッセージUUID
   */
  id: string;
  /**
   * 投稿者UUID
   */
  userId: string;
  /**
   * チャンネルUUID
   */
  channelId: string;
  /**
   * メッセージ本文
   */
  content: string;
  /**
   * 投稿日時
   */
  createdAt: string;
  /**
   * 編集日時
   */
  updatedAt: string;
  /**
   * ピン留めされているかどうか
   */
  pinned: boolean;
  /**
   * 押されているスタンプの配列
   */
  stamps: Traq.MessageStamp[];
  /**
   * スレッドUUID
   */
  threadId: string | null;
  /**
   * メッセージ送信の確認に使うことができる任意の識別子(投稿でのみ使用可)
   */
  nonce?: string;
};

  /**
   * メッセージに押されたスタンプ
   */
  export type MessageStamp = {
  /**
   * ユーザーUUID
   */
  userId: string;
  /**
   * スタンプUUID
   */
  stampId: string;
  /**
   * スタンプ数
   */
  count: number;
  /**
   * スタンプが最初に押された日時
   */
  createdAt: string;
  /**
   * スタンプが最後に押された日時
   */
  updatedAt: string;
};

  /**
   * スタンプ統計情報
   */
  export type StampStats = {
  /**
   * スタンプ使用総数(同じユーザによって同じメッセージに貼られたものは複数カウントしない)
   */
  count: number;
  /**
   * スタンプ使用総数(全てカウント)
   */
  totalCount: number;
};

  /**
   * ピン情報(メッセージ本体付き)
   */
  export type Pin = {
  /**
   * ピン留めしたユーザーUUID
   */
  userId: string;
  /**
   * ピン留めされた日時
   */
  pinnedAt: string;
  message: Traq.Message;
};

  /**
   * チャンネル
   */
  export type Channel = {
  /**
   * チャンネルUUID
   */
  id: string;
  /**
   * 親チャンネルUUID
   */
  parentId: string | null;
  /**
   * チャンネルがアーカイブされているかどうか
   */
  archived: boolean;
  /**
   * 強制通知チャンネルかどうか
   */
  force: boolean;
  /**
   * チャンネルトピック
   */
  topic: string;
  /**
   * チャンネル名
   */
  name: string;
  /**
   * 子チャンネルのUUID配列
   */
  children: string[];
};

  /**
   * メッセージ投稿リクエスト
   */
  export type PostMessageRequest = {
  /**
   * メッセージ本文
   */
  content: string;
  /**
   * メンション・チャンネルリンクを自動埋め込みするか
   */
  embed?: boolean;
  /**
   * メッセージ送信の確認に使うことができる任意の識別子(投稿でのみ使用可)
   */
  nonce?: string;
};

  /**
   * チャンネル統計情報
   */
  export type ChannelStats = {
  /**
   * チャンネルの総投稿メッセージ数(削除されたものも含む)
   */
  totalMessageCount: number;
  /**
   * チャンネル上のスタンプ統計情報
   */
  stamps: Traq.ChannelStatsStamp[];
  /**
   * チャンネル上のユーザー統計情報
   */
  users: Traq.ChannelStatsUser[];
  /**
   * 統計情報日時
   */
  datetime: string;
};

  /**
   * チャンネル上の特定スタンプ統計情報
   */
  export type ChannelStatsStamp = {
  /**
   * スタンプID
   */
  id: string;
  /**
   * スタンプ数(同一メッセージ上のものは複数カウントしない)
   */
  count: number;
  /**
   * スタンプ数(同一メッセージ上のものも複数カウントする)
   */
  total: number;
};

  /**
   * チャンネル上の特定ユーザー統計情報
   */
  export type ChannelStatsUser = {
  /**
   * ユーザーID
   */
  id: string;
  /**
   * メッセージ数
   */
  messageCount: number;
};

  /**
   * チャンネルトピック
   */
  export type ChannelTopic = {
  /**
   * トピック
   */
  topic: string;
};

  /**
   * チャンネルトピック編集リクエスト
   */
  export type PutChannelTopicRequest = {
  /**
   * トピック
   */
  topic: string;
};

  /**
   * チャンネル閲覧者情報
   */
  export type ChannelViewer = {
  /**
   * ユーザーUUID
   */
  userId: string;
  state: Traq.ChannelViewState;
  /**
   * 更新日時
   */
  updatedAt: string;
};

  /**
   * 自身のチャンネル閲覧状態
   */
  export type MyChannelViewState = {
  /**
   * WSセッションの識別子
   */
  key: string;
  /**
   * チャンネルUUID
   */
  channelId: string;
  state: Traq.ChannelViewState;
};

  /**
   * 閲覧状態
   */
  export type ChannelViewState = "none" | "stale_viewing" | "monitoring" | "editing";

  /**
   * ファイルアップロードリクエスト
   */
  export type PostFileRequest = {
  /**
   * ファイル本体
   */
  file: Blob;
  /**
   * アップロード先チャンネルUUID
   */
  channelId: string;
};

  /**
   * サムネイル画像のタイプ
   */
  export type ThumbnailType = "image" | "waveform";

  export type ThumbnailInfo = {
  type: Traq.ThumbnailType;
  /**
   * MIMEタイプ
   */
  mime: string;
  /**
   * サムネイル幅
   */
  width?: number;
  /**
   * サムネイル高さ
   */
  height?: number;
};

  /**
   * ファイル情報
   */
  export type FileInfo = {
  /**
   * ファイルUUID
   */
  id: string;
  /**
   * ファイル名
   */
  name: string;
  /**
   * MIMEタイプ
   */
  mime: string;
  /**
   * ファイルサイズ
   */
  size: number;
  /**
   * MD5ハッシュ
   */
  md5: string;
  /**
   * アニメーション画像かどうか
   */
  isAnimatedImage: boolean;
  /**
   * アップロード日時
   */
  createdAt: string;
  thumbnails: Traq.ThumbnailInfo[];
  /**
   * サムネイル情報
   * サムネイルが存在しない場合はnullになります
   * Deprecated: thumbnailsを参照してください
   */
  thumbnail: {
  /**
   * MIMEタイプ
   */
  mime: string;
  /**
   * サムネイル幅
   */
  width?: number;
  /**
   * サムネイル高さ
   */
  height?: number;
} | null;
  /**
   * 属しているチャンネルUUID
   */
  channelId: string | null;
  /**
   * アップロード者UUID
   */
  uploaderId: string | null;
};

  /**
   * スタンプを押すリクエスト
   */
  export type PostMessageStampRequest = {
  /**
   * 押す数
   */
  count: number;
};

  /**
   * スタンプ情報
   */
  export type Stamp = {
  /**
   * スタンプUUID
   */
  id: string;
  /**
   * スタンプ名
   */
  name: string;
  /**
   * 作成者UUID
   */
  creatorId: string;
  /**
   * 作成日時
   */
  createdAt: string;
  /**
   * 更新日時
   */
  updatedAt: string;
  /**
   * ファイルUUID
   */
  fileId: string;
  /**
   * Unicode絵文字か
   */
  isUnicode: boolean;
};

  /**
   * スタンプ作成リクエスト
   */
  export type PostStampRequest = {
  /**
   * スタンプ名
   */
  name: string;
  /**
   * スタンプ画像(1MBまでのpng, jpeg, gif)
   */
  file: Blob;
};

  /**
   * スタンプ履歴の1項目
   */
  export type StampHistoryEntry = {
  /**
   * スタンプUUID
   */
  stampId: string;
  /**
   * 使用日時
   */
  datetime: string;
};

  /**
   * スタンプ情報とサムネイルの有無
   */
  export type StampWithThumbnail = {
  /**
   * スタンプUUID
   */
  id: string;
  /**
   * スタンプ名
   */
  name: string;
  /**
   * 作成者UUID
   */
  creatorId: string;
  /**
   * 作成日時
   */
  createdAt: string;
  /**
   * 更新日時
   */
  updatedAt: string;
  /**
   * ファイルUUID
   */
  fileId: string;
  /**
   * Unicode絵文字か
   */
  isUnicode: boolean;
  /**
   * サムネイルの有無
   */
  hasThumbnail: boolean;
};

  /**
   * ユーザー情報
   */
  export type User = {
  /**
   * ユーザーUUID
   */
  id: string;
  /**
   * ユーザー名
   */
  name: string;
  /**
   * ユーザー表示名
   */
  displayName: string;
  /**
   * アイコンファイルUUID
   */
  iconFileId: string;
  /**
   * BOTかどうか
   */
  bot: boolean;
  state: Traq.UserAccountState;
  /**
   * 更新日時
   */
  updatedAt: string;
};

  /**
   * ユーザー詳細情報
   */
  export type UserDetail = {
  /**
   * ユーザーUUID
   */
  id: string;
  state: Traq.UserAccountState;
  /**
   * BOTかどうか
   */
  bot: boolean;
  /**
   * アイコンファイルUUID
   */
  iconFileId: string;
  /**
   * ユーザー表示名
   */
  displayName: string;
  /**
   * ユーザー名
   */
  name: string;
  /**
   * Twitter ID
   */
  twitterId: string;
  /**
   * 最終オンライン日時
   */
  lastOnline: string | null;
  /**
   * 更新日時
   */
  updatedAt: string;
  /**
   * タグリスト
   */
  tags: Traq.UserTag[];
  /**
   * 所属グループのUUIDの配列
   */
  groups: string[];
  /**
   * 自己紹介(biography)
   */
  bio: string;
  /**
   * ホームチャンネル
   */
  homeChannel: string | null;
};

  /**
   * ユーザータグ
   */
  export type UserTag = {
  /**
   * タグUUID
   */
  tagId: string;
  /**
   * タグ文字列
   */
  tag: string;
  /**
   * タグがロックされているか
   */
  isLocked: boolean;
  /**
   * タグ付与日時
   */
  createdAt: string;
  /**
   * タグ更新日時
   */
  updatedAt: string;
};

  /**
   * ユーザーアカウント状態
   * 0: 停止
   * 1: 有効
   * 2: 一時停止
   */
  export type UserAccountState = 0 | 1 | 2;

  /**
   * ユーザーグループ
   */
  export type UserGroup = {
  /**
   * グループUUID
   */
  id: string;
  /**
   * グループ名
   */
  name: string;
  /**
   * グループ説明
   */
  description: string;
  /**
   * グループタイプ
   */
  type: string;
  /**
   * グループアイコンUUID
   */
  icon: string;
  /**
   * グループメンバーの配列
   */
  members: Traq.UserGroupMember[];
  /**
   * 作成日時
   */
  createdAt: string;
  /**
   * 更新日時
   */
  updatedAt: string;
  /**
   * グループ管理者のUUIDの配列
   */
  admins: string[];
};

  /**
   * ユーザーグループメンバー
   */
  export type UserGroupMember = {
  /**
   * ユーザーUUID
   */
  id: string;
  /**
   * ユーザーの役割
   */
  role: string;
};

  /**
   * ユーザーグループメンバーの配列
   */
  export type UserGroupMembers = Traq.UserGroupMember[];

  /**
   * ユーザー統計情報
   */
  export type UserStats = {
  /**
   * ユーザーの総投稿メッセージ数(削除されたものも含む)
   */
  totalMessageCount: number;
  /**
   * ユーザーのスタンプ統計情報
   */
  stamps: Traq.UserStatsStamp[];
  /**
   * 統計情報日時
   */
  datetime: string;
};

  /**
   * ユーザーの特定スタンプ統計情報
   */
  export type UserStatsStamp = {
  /**
   * スタンプID
   */
  id: string;
  /**
   * スタンプ数(同一メッセージ上のものは複数カウントしない)
   */
  count: number;
  /**
   * スタンプ数(同一メッセージ上のものも複数カウントする)
   */
  total: number;
};

  /**
   * ユーザーグループメンバー編集リクエスト
   */
  export type PatchGroupMemberRequest = {
  /**
   * ユーザーの役割
   */
  role: string;
};

  /**
   * ユーザーグループ編集リクエスト
   */
  export type PatchUserGroupRequest = {
  /**
   * グループ名
   */
  name?: string;
  /**
   * グループ説明
   */
  description?: string;
  /**
   * グループタイプ
   */
  type?: string;
};

  /**
   * ユーザーグループ作成リクエスト
   */
  export type PostUserGroupRequest = {
  /**
   * グループ名
   */
  name: string;
  /**
   * 説明
   */
  description: string;
  /**
   * グループタイプ
   */
  type: string;
};

  /**
   * 自分のユーザー詳細情報
   */
  export type MyUserDetail = {
  /**
   * ユーザーUUID
   */
  id: string;
  /**
   * 自己紹介(biography)
   */
  bio: string;
  /**
   * 所属グループのUUIDの配列
   */
  groups: string[];
  /**
   * タグリスト
   */
  tags: Traq.UserTag[];
  /**
   * 更新日時
   */
  updatedAt: string;
  /**
   * 最終オンライン日時
   */
  lastOnline: string | null;
  /**
   * Twitter ID
   */
  twitterId: string;
  /**
   * ユーザー名
   */
  name: string;
  /**
   * ユーザー表示名
   */
  displayName: string;
  /**
   * アイコンファイルUUID
   */
  iconFileId: string;
  /**
   * BOTかどうか
   */
  bot: boolean;
  state: Traq.UserAccountState;
  /**
   * 所有している権限の配列
   */
  permissions: Traq.UserPermission[];
  /**
   * ホームチャンネル
   */
  homeChannel: string | null;
};

  /**
   * 自分のユーザー詳細情報
   */
  export type OIDCUserInfo = {
  /**
   * ユーザーUUID
   */
  sub: string;
  /**
   * ユーザー名
   */
  name: string;
  /**
   * ユーザー名
   */
  preferred_username: string;
  /**
   * アイコン画像URL
   */
  picture: string;
  /**
   * 更新日時
   */
  updated_at?: number;
  traq?: Traq.OIDCTraqUserInfo;
};

  /**
   * traQ特有のユーザー詳細情報
   */
  export type OIDCTraqUserInfo = {
  /**
   * 自己紹介(biography)
   */
  bio: string;
  /**
   * 所属グループのUUIDの配列
   */
  groups: string[];
  /**
   * タグリスト
   */
  tags: Traq.UserTag[];
  /**
   * 最終オンライン日時
   */
  last_online: string | null;
  /**
   * Twitter ID
   */
  twitter_id: string;
  /**
   * ユーザー表示名
   */
  display_name: string;
  /**
   * アイコンファイルUUID
   */
  icon_file_id: string;
  /**
   * BOTかどうか
   */
  bot: boolean;
  state: Traq.UserAccountState;
  /**
   * 所有している権限の配列
   */
  permissions: Traq.UserPermission[];
  /**
   * ホームチャンネル
   */
  home_channel: string | null;
};

  /**
   * チャンネル購読者編集リクエスト
   */
  export type PatchChannelSubscribersRequest = {
  /**
   * 通知をオンにするユーザーのUUID配列
   */
  on?: string[];
  /**
   * 通知をオフにするユーザーのUUID配列
   */
  off?: string[];
};

  /**
   * 通知をオンにするユーザーのUUID配列
   */
  export type PutChannelSubscribersRequest = {
  /**
   * 通知をオンにするユーザーのUUID配列
   */
  on: string[];
};

  /**
   * ユーザーのチャンネル購読状態
   */
  export type UserSubscribeState = {
  /**
   * チャンネルUUID
   */
  channelId: string;
  level: Traq.ChannelSubscribeLevel;
};

  /**
   * チャンネル購読レベル
   * 0：無し
   * 1：未読管理
   * 2：未読管理+通知
   */
  export type ChannelSubscribeLevel = 0 | 1 | 2;

  /**
   * チャンネル購読レベル変更リクエスト
   */
  export type PutChannelSubscribeLevelRequest = {
  level: Traq.ChannelSubscribeLevel;
};

  /**
   * Webhook情報
   */
  export type Webhook = {
  /**
   * WebhookUUID
   */
  id: string;
  /**
   * WebhookユーザーUUID
   */
  botUserId: string;
  /**
   * Webhookユーザー表示名
   */
  displayName: string;
  /**
   * 説明
   */
  description: string;
  /**
   * セキュアWebhookかどうか
   */
  secure: boolean;
  /**
   * デフォルトの投稿先チャンネルUUID
   */
  channelId: string;
  /**
   * オーナーUUID
   */
  ownerId: string;
  /**
   * 作成日時
   */
  createdAt: string;
  /**
   * 更新日時
   */
  updatedAt: string;
};

  /**
   * Webhook情報変更リクエスト
   */
  export type PatchWebhookRequest = {
  /**
   * Webhookユーザー表示名
   */
  name?: string;
  /**
   * 説明
   */
  description?: string;
  /**
   * デフォルトの投稿先チャンネルUUID
   */
  channelId?: string;
  /**
   * Webhookシークレット
   */
  secret?: string;
  /**
   * 移譲先のユーザーUUID
   */
  ownerId?: string;
};

  /**
   * Webhook作成リクエスト
   */
  export type PostWebhookRequest = {
  /**
   * Webhookユーザーの表示名
   */
  name: string;
  /**
   * 説明
   */
  description: string;
  /**
   * デフォルトの投稿先チャンネルUUID
   */
  channelId: string;
  /**
   * Webhookシークレット
   */
  secret: string;
};

  /**
   * アイコン画像変更リクエスト
   */
  export type PutUserIconRequest = {
  /**
   * アイコン画像(2MB,`Config.Imaging.MaxPixels`(default: 2560*1600)までのpng, jpeg, gif)
   */
  file: Blob;
};

  /**
   * パスワード変更リクエスト
   */
  export type PutMyPasswordRequest = {
  /**
   * 現在のパスワード
   */
  password: string;
  /**
   * 新しいパスワード
   */
  newPassword: string;
};

  /**
   * 自分のユーザー情報変更リクエスト
   */
  export type PatchMeRequest = {
  /**
   * 新しい表示名
   */
  displayName?: string;
  /**
   * TwitterID
   */
  twitterId?: string;
  /**
   * 自己紹介(biography)
   */
  bio?: string;
  /**
   * ホームチャンネルのUUID
   * `00000000-0000-0000-0000-000000000000`を指定すると、ホームチャンネルが`null`に設定されます
   */
  homeChannel?: string;
};

  /**
   * ユーザーパスワード変更リクエスト
   */
  export type PutUserPasswordRequest = {
  /**
   * 新しいパスワード
   */
  newPassword: string;
};

  /**
   * ユーザー情報編集リクエスト
   */
  export type PatchUserRequest = {
  /**
   * 新しい表示名
   */
  displayName?: string;
  /**
   * TwitterID
   */
  twitterId?: string;
  state?: Traq.UserAccountState;
  /**
   * ユーザーロール
   */
  role?: string;
};

  /**
   * FCMデバイス登録リクエスト
   */
  export type PostMyFCMDeviceRequest = {
  /**
   * FCMのデバイストークン
   */
  token: string;
};

  /**
   * ユーザー登録リクエスト
   */
  export type PostUserRequest = {
  /**
   * ユーザー名
   */
  name: string;
  /**
   * パスワード
   */
  password?: string;
};

  /**
   * チャンネル作成リクエスト
   */
  export type PostChannelRequest = {
  /**
   * チャンネル名
   */
  name: string;
  /**
   * 親チャンネルのUUID
   * ルートに作成する場合はnullを指定
   */
  parent: string | null;
};

  /**
   * ユーザータグ追加リクエスト
   */
  export type PostUserTagRequest = {
  /**
   * タグ文字列
   */
  tag: string;
};

  /**
   * ユーザーのタグの編集リクエスト
   */
  export type PatchUserTagRequest = {
  /**
   * タグのロック状態
   */
  isLocked: boolean;
};

  /**
   * タグ情報
   */
  export type Tag = {
  /**
   * タグUUID
   */
  id: string;
  /**
   * タグ文字列
   */
  tag: string;
  /**
   * タグがつけられているユーザーのUUID配列
   */
  users: string[];
};

  /**
   * スター追加リクエスト
   */
  export type PostStarRequest = {
  /**
   * チャンネルUUID
   */
  channelId: string;
};

  /**
   * 未読チャンネル情報
   */
  export type UnreadChannel = {
  /**
   * チャンネルUUID
   */
  channelId: string;
  /**
   * 未読メッセージ数
   */
  count: number;
  /**
   * 自分宛てメッセージが含まれているかどうか
   */
  noticeable: boolean;
  /**
   * チャンネルの最古の未読メッセージの日時
   */
  since: string;
  /**
   * チャンネルの最新の未読メッセージの日時
   */
  updatedAt: string;
  /**
   * そのチャンネルの未読の中で最も古いメッセージのid
   */
  oldestMessageId: string;
};

  /**
   * ログインリクエスト
   */
  export type PostLoginRequest = {
  /**
   * ユーザー名
   */
  name: string;
  /**
   * パスワード
   */
  password: string;
};

  /**
   * ログインセッション情報
   */
  export type LoginSession = {
  /**
   * セッションUUID
   */
  id: string;
  /**
   * 発行日時
   */
  issuedAt: string;
};

  /**
   * 有効なOAuth2トークン情報
   */
  export type ActiveOAuth2Token = {
  /**
   * トークンUUID
   */
  id: string;
  /**
   * OAuth2クライアントUUID
   */
  clientId: string;
  /**
   * スコープ
   */
  scopes: Traq.OAuth2Scope[];
  /**
   * 発行日時
   */
  issuedAt: string;
};

  /**
   * OAuth2スコープ
   */
  export type OAuth2Scope = "openid" | "profile" | "read" | "write" | "manage_bot";

  /**
   * OAuth2クライアント情報
   */
  export type OAuth2Client = {
  /**
   * クライアントUUID
   */
  id: string;
  /**
   * クライアント名
   */
  name: string;
  /**
   * 説明
   */
  description: string;
  /**
   * クライアント開発者UUID
   */
  developerId: string;
  /**
   * 要求スコープの配列
   */
  scopes: Traq.OAuth2Scope[];
  /**
   * confidential client なら true, public client なら false
   */
  confidential: boolean;
};

  /**
   * OAuth2クライアント情報変更リクエスト
   */
  export type PatchClientRequest = {
  /**
   * クライアント名
   */
  name?: string;
  /**
   * 説明
   */
  description?: string;
  /**
   * コールバックURL
   */
  callbackUrl?: string;
  /**
   * クライアント開発者UUID
   */
  developerId?: string;
  /**
   * confidential client なら true, public client なら false
   */
  confidential?: boolean;
};

  /**
   * OAuth2クライアント詳細情報
   */
  export type OAuth2ClientDetail = {
  /**
   * クライアントUUID
   */
  id: string;
  /**
   * クライアント開発者UUID
   */
  developerId: string;
  /**
   * 説明
   */
  description: string;
  /**
   * クライアント名
   */
  name: string;
  /**
   * 要求スコープの配列
   */
  scopes: Traq.OAuth2Scope[];
  /**
   * コールバックURL
   */
  callbackUrl: string;
  /**
   * クライアントシークレット
   */
  secret: string;
  /**
   * confidential client なら true, public client なら false
   */
  confidential: boolean;
};

  /**
   * OAuth2クライアント作成リクエスト
   */
  export type PostClientRequest = {
  /**
   * クライアント名
   */
  name: string;
  /**
   * コールバックURL
   */
  callbackUrl: string;
  /**
   * 要求スコープの配列
   */
  scopes: Traq.OAuth2Scope[];
  /**
   * 説明
   */
  description: string;
  /**
   * confidential client なら true, public cleint なら false
   */
  confidential?: boolean;
};

  /**
   * BOT動作モード
   *
   * HTTP: HTTP Mode
   * WebSocket: WebSocket Mode
   */
  export type BotMode = "HTTP" | "WebSocket";

  /**
   * BOT状態
   * 0: 停止
   * 1: 有効
   * 2: 一時停止
   */
  export type BotState = 0 | 1 | 2;

  /**
   * BOT情報
   */
  export type Bot = {
  /**
   * BOT UUID
   */
  id: string;
  /**
   * BOTユーザーUUID
   */
  botUserId: string;
  /**
   * 説明
   */
  description: string;
  /**
   * BOT開発者UUID
   */
  developerId: string;
  /**
   * BOTが購読しているイベントの配列
   */
  subscribeEvents: string[];
  mode: Traq.BotMode;
  state: Traq.BotState;
  /**
   * 作成日時
   */
  createdAt: string;
  /**
   * 更新日時
   */
  updatedAt: string;
};

  /**
   * BOT情報変更リクエスト
   */
  export type PatchBotRequest = {
  /**
   * BOTユーザー表示名
   */
  displayName?: string;
  /**
   * BOTの説明
   */
  description?: string;
  /**
   * 特権
   */
  privileged?: boolean;
  mode?: Traq.BotMode;
  /**
   * BOTサーバーエンドポイント
   */
  endpoint?: string;
  /**
   * 移譲先の開発者UUID
   */
  developerId?: string;
  /**
   * 購読するイベント
   */
  subscribeEvents?: string[];
  /**
   * 自己紹介(biography)
   */
  bio?: string;
};

  /**
   * BOTのトークン情報
   */
  export type BotTokens = {
  /**
   * Verification Token
   */
  verificationToken: string;
  /**
   * BOTアクセストークン
   */
  accessToken: string;
};

  /**
   * BOT詳細情報
   */
  export type BotDetail = {
  /**
   * BOT UUID
   */
  id: string;
  /**
   * 更新日時
   */
  updatedAt: string;
  /**
   * 作成日時
   */
  createdAt: string;
  mode: Traq.BotMode;
  state: Traq.BotState;
  /**
   * BOTが購読しているイベントの配列
   */
  subscribeEvents: string[];
  /**
   * BOT開発者UUID
   */
  developerId: string;
  /**
   * 説明
   */
  description: string;
  /**
   * BOTユーザーUUID
   */
  botUserId: string;
  tokens: Traq.BotTokens;
  /**
   * BOTサーバーエンドポイント
   */
  endpoint: string;
  /**
   * 特権BOTかどうか
   */
  privileged: boolean;
  /**
   * BOTが参加しているチャンネルのUUID配列
   */
  channels: string[];
};

  /**
   * BOTイベントログ
   */
  export type BotEventLog = {
  /**
   * BOT UUID
   */
  botId: string;
  /**
   * リクエストUUID
   */
  requestId: string;
  /**
   * イベントタイプ
   */
  event: string;
  result?: Traq.BotEventResult;
  /**
   * ステータスコード
   */
  code: number;
  /**
   * イベント日時
   */
  datetime: string;
};

  /**
   * イベント配送結果
   */
  export type BotEventResult = "ok" | "ng" | "ne" | "dp";

  /**
   * BOT作成リクエスト
   */
  export type PostBotRequest = {
  /**
   * BOTユーザーID
   * 自動的に接頭辞"BOT_"が付与されます
   */
  name: string;
  /**
   * BOTユーザー表示名
   */
  displayName: string;
  /**
   * BOTの説明
   */
  description: string;
  mode: Traq.BotMode;
  /**
   * BOTサーバーエンドポイント
   * BOT動作モードがHTTPの場合必須です
   */
  endpoint?: string;
};

  /**
   * BOTチャンネル参加リクエスト
   */
  export type PostBotActionJoinRequest = {
  /**
   * チャンネルUUID
   */
  channelId: string;
};

  /**
   * BOTチャンネル退出リクエスト
   */
  export type PostBotActionLeaveRequest = {
  /**
   * チャンネルUUID
   */
  channelId: string;
};

  /**
   * BOTユーザー対
   */
  export type BotUser = {
  /**
   * BOT UUID
   */
  id: string;
  /**
   * BOTユーザーUUID
   */
  botUserId: string;
};

  /**
   * skyway用認証リクエスト
   */
  export type PostWebRTCAuthenticateRequest = {
  /**
   * ピアID
   */
  peerId: string;
};

  /**
   * skyway用認証リクエストリザルト
   */
  export type WebRTCAuthenticateResult = {
  /**
   * ピアID
   */
  peerId: string;
  /**
   * TTL
   */
  ttl: number;
  /**
   * タイムスタンプ
   */
  timestamp: number;
  /**
   * 認証トークン
   */
  authToken: string;
};

  /**
   * チャンネル情報変更リクエスト
   */
  export type PatchChannelRequest = {
  /**
   * チャンネル名
   */
  name?: string;
  /**
   * アーカイブされているかどうか
   */
  archived?: boolean;
  /**
   * 強制通知チャンネルかどうか
   */
  force?: boolean;
  /**
   * 親チャンネルUUID
   */
  parent?: string;
};

  /**
   * WebRTC状態の配列
   */
  export type WebRTCUserStates = Traq.WebRTCUserState[];

  /**
   * クリップフォルダ情報
   */
  export type ClipFolder = {
  /**
   * フォルダUUID
   */
  id: string;
  /**
   * フォルダ名
   */
  name: string;
  /**
   * 作成日時
   */
  createdAt: string;
  /**
   * フォルダ所有者UUID
   */
  ownerId: string;
  /**
   * 説明
   */
  description: string;
};

  /**
   * クリップフォルダ情報編集リクエスト
   */
  export type PatchClipFolderRequest = {
  /**
   * フォルダ名
   */
  name?: string;
  /**
   * 説明
   */
  description?: string;
};

  /**
   * クリップフォルダ作成リクエスト
   */
  export type PostClipFolderRequest = {
  /**
   * フォルダ名
   */
  name: string;
  /**
   * 説明
   */
  description: string;
};

  /**
   * クリップ追加リクエスト
   */
  export type PostClipFolderMessageRequest = {
  /**
   * メッセージUUID
   */
  messageId: string;
};

  /**
   * クリップされたメッセージ
   */
  export type ClippedMessage = {
  message: Traq.Message;
  /**
   * クリップした日時
   */
  clippedAt: string;
};

  /**
   * チャンネルイベント
   */
  export type ChannelEvent = {
  /**
   * イベントタイプ
   */
  type: "TopicChanged" | "SubscribersChanged" | "PinAdded" | "PinRemoved" | "NameChanged" | "ParentChanged" | "VisibilityChanged" | "ForcedNotificationChanged" | "ChildCreated";
  /**
   * イベント日時
   */
  datetime: string;
  /**
   * イベント内容
   */
  detail: Traq.TopicChangedEvent | Traq.SubscribersChangedEvent | Traq.PinAddedEvent | Traq.PinRemovedEvent | Traq.NameChangedEvent | Traq.ParentChangedEvent | Traq.VisibilityChangedEvent | Traq.ForcedNotificationChangedEvent | Traq.ChildCreatedEvent;
};

  /**
   * トピック変更イベント
   */
  export type TopicChangedEvent = {
  /**
   * 変更者UUID
   */
  userId: string;
  /**
   * 変更前トピック
   */
  before: string;
  /**
   * 変更後トピック
   */
  after: string;
};

  /**
   * 購読者変更イベント
   */
  export type SubscribersChangedEvent = {
  /**
   * 変更者UUID
   */
  userId: string;
  /**
   * オンにされたユーザーのUUID配列
   */
  on: string[];
  /**
   * オフにされたユーザーのUUID配列
   */
  off: string[];
};

  /**
   * ピン追加イベント
   */
  export type PinAddedEvent = {
  /**
   * 変更者UUID
   */
  userId: string;
  /**
   * メッセージUUID
   */
  messageId: string;
};

  /**
   * ピン削除イベント
   */
  export type PinRemovedEvent = {
  /**
   * 変更者UUID
   */
  userId: string;
  /**
   * メッセージUUID
   */
  messageId: string;
};

  /**
   * チャンネル名変更イベント
   */
  export type NameChangedEvent = {
  /**
   * 変更者UUID
   */
  userId: string;
  /**
   * 変更前チャンネル名
   */
  before: string;
  /**
   * 変更後チャンネル名
   */
  after: string;
};

  /**
   * 親チャンネル変更イベント
   */
  export type ParentChangedEvent = {
  /**
   * 変更者UUID
   */
  userId: string;
  /**
   * 変更前親チャンネルUUID
   */
  before: string;
  /**
   * 変更後親チャンネルUUID
   */
  after: string;
};

  /**
   * チャンネル可視状態変更イベント
   */
  export type VisibilityChangedEvent = {
  /**
   * 変更者UUID
   */
  userId: string;
  /**
   * 変更後可視状態
   */
  visibility: boolean;
};

  /**
   * チャンネル強制通知状態変更イベント
   */
  export type ForcedNotificationChangedEvent = {
  /**
   * 変更者UUID
   */
  userId: string;
  /**
   * 変更後強制通知状態
   */
  force: boolean;
};

  /**
   * 子チャンネル作成イベント
   */
  export type ChildCreatedEvent = {
  /**
   * 作成者UUID
   */
  userId: string;
  /**
   * チャンネルUUID
   */
  channelId: string;
};

  /**
   * Qallのルーム状態が変更された
   */
  export type QallRoomStateChangedEvent = {
  roomStates: {
  /**
   * ルームのID
   */
  roomId: string;
  participants: {
  /**
   * ユーザーID_RandomUUID
   */
  identity: string;
  /**
   * 表示名
   */
  name: string;
  /**
   * 参加した時刻
   */
  joinedAt: string;
  attributes?: {
  [key: string]: string;
};
  /**
   * 発言権限
   */
  canPublish: boolean;
}[];
  /**
   * ウェビナールームかどうか
   */
  isWebinar: boolean;
  /**
   * ルームに関連付けられたカスタム属性
   */
  metadata?: string;
}[];
};

  /**
   * Qallのサウンドボードアイテムが作成された
   */
  export type QallSoundboardItemCreatedEvent = {
  /**
   * 作成されたサウンドボードアイテムのId
   */
  soundId: string;
  /**
   * 作成されたサウンドボードアイテムの名前
   */
  name: string;
  /**
   * 作成者のId
   */
  creatorId: string;
};

  /**
   * Qallのサウンドボードアイテムが削除された
   */
  export type QallSoundboardItemDeletedEvent = {
  /**
   * 削除されたサウンドボードアイテムのId
   */
  soundId: string;
};

  /**
   * スタンプパレット情報
   */
  export type StampPalette = {
  /**
   * スタンプパレットUUID
   */
  id: string;
  /**
   * パレット名
   */
  name: string;
  /**
   * パレット内のスタンプのUUID配列
   */
  stamps: string[];
  /**
   * 作成者UUID
   */
  creatorId: string;
  /**
   * パレット作成日時
   */
  createdAt: string;
  /**
   * パレット更新日時
   */
  updatedAt: string;
  /**
   * パレット説明
   */
  description: string;
};

  /**
   * スタンプパレット作成リクエスト
   */
  export type PostStampPaletteRequest = {
  /**
   * パレット内のスタンプのUUID配列
   */
  stamps: string[];
  /**
   * パレット名
   */
  name: string;
  /**
   * 説明
   */
  description: string;
};

  /**
   * スタンプパレット情報変更リクエスト
   */
  export type PatchStampPaletteRequest = {
  /**
   * パレット名
   */
  name?: string;
  /**
   * 説明
   */
  description?: string;
  /**
   * パレット内のスタンプUUIDの配列
   */
  stamps?: string[];
};

  /**
   * スタンプ情報変更リクエスト
   */
  export type PatchStampRequest = {
  /**
   * スタンプ名
   */
  name?: string;
  /**
   * 作成者UUID
   */
  creatorId?: string;
};

  /**
   * ピン情報
   */
  export type MessagePin = {
  /**
   * ピン留めしたユーザーUUID
   */
  userId: string;
  /**
   * ピン留めされた日時
   */
  pinnedAt: string;
};

  /**
   * グループ管理者追加リクエスト
   */
  export type PostUserGroupAdminRequest = {
  /**
   * 追加するユーザーのUUID
   */
  id: string;
};

  /**
   * GET /channelsレスポンス
   */
  export type ChannelList = {
  /**
   * パブリックチャンネルの配列
   */
  public: Traq.Channel[];
  /**
   * ダイレクトメッセージチャンネルの配列
   */
  dm?: Traq.DMChannel[];
};

  /**
   * ダイレクトメッセージチャンネル
   */
  export type DMChannel = {
  /**
   * チャンネルUUID
   */
  id: string;
  /**
   * 送信先相手のUUID
   */
  userId: string;
};

  /**
   * Timelineアクテビティ用メッセージ
   */
  export type ActivityTimelineMessage = {
  /**
   * メッセージUUID
   */
  id: string;
  /**
   * 投稿者UUID
   */
  userId: string;
  /**
   * チャンネルUUID
   */
  channelId: string;
  /**
   * メッセージ本文
   */
  content: string;
  /**
   * 投稿日時
   */
  createdAt: string;
  /**
   * 編集日時
   */
  updatedAt: string;
};

  export type OAuth2Decide = {
  /**
   * 承諾する場合は"approve"
   */
  submit: string;
};

  export type PostOAuth2Token = {
  grant_type: string;
  code?: string;
  redirect_uri?: string;
  client_id?: string;
  code_verifier?: string;
  username?: string;
  password?: string;
  scope?: string;
  refresh_token?: string;
  client_secret?: string;
};

  export type OAuth2Token = {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
};

  export type OAuth2Authorization = {
  response_type?: Traq.OAuth2ResponseType;
  client_id: string;
  redirect_uri?: string;
  scope?: string;
  state?: string;
  code_challenge?: string;
  code_challenge_method?: string;
  nonce?: string;
  prompt?: Traq.OAuth2Prompt;
};

  export type OAuth2Prompt = "none";

  export type OAuth2ResponseType = "code" | "token" | "none";

  /**
   * POST /oauth2/revoke 用リクエストボディ
   */
  export type OAuth2Revoke = {
  /**
   * 無効化するOAuth2トークンまたはOAuth2リフレッシュトークン
   */
  token: string;
};

  /**
   * 外部認証アカウントユーザー
   */
  export type ExternalProviderUser = {
  /**
   * 外部サービス名
   */
  providerName: string;
  /**
   * 紐付けた日時
   */
  linkedAt: string;
  /**
   * 外部アカウント名
   */
  externalName: string;
};

  /**
   * POST /users/me/ex-accounts/link 用リクエストボディ
   */
  export type PostLinkExternalAccount = {
  /**
   * 外部サービス名
   */
  providerName: string;
};

  /**
   * POST /users/me/ex-accounts/unlink 用リクエストボディ
   */
  export type PostUnlinkExternalAccount = {
  /**
   * 外部サービス名
   */
  providerName: string;
};

  /**
   * ユーザー権限
   */
  export type UserPermission = "get_webhook" | "create_webhook" | "edit_webhook" | "delete_webhook" | "access_others_webhook" | "get_bot" | "create_bot" | "edit_bot" | "delete_bot" | "access_others_bot" | "bot_action_join_channel" | "bot_action_leave_channel" | "create_channel" | "get_channel" | "edit_channel" | "delete_channel" | "change_parent_channel" | "edit_channel_topic" | "get_channel_star" | "edit_channel_star" | "get_my_tokens" | "revoke_my_token" | "get_clients" | "create_client" | "edit_my_client" | "delete_my_client" | "manage_others_client" | "upload_file" | "download_file" | "delete_file" | "get_message" | "post_message" | "edit_message" | "delete_message" | "report_message" | "get_message_reports" | "create_message_pin" | "delete_message_pin" | "get_channel_subscription" | "edit_channel_subscription" | "connect_notification_stream" | "register_fcm_device" | "get_stamp" | "create_stamp" | "edit_stamp" | "edit_stamp_created_by_others" | "delete_stamp" | "delete_my_stamp" | "add_message_stamp" | "remove_message_stamp" | "get_my_stamp_history" | "get_my_stamp_recommendations" | "get_stamp_palette" | "create_stamp_palette" | "edit_stamp_palette" | "delete_stamp_palette" | "get_user" | "register_user" | "get_me" | "get_oidc_userinfo" | "edit_me" | "change_my_icon" | "change_my_password" | "edit_other_users" | "get_user_qr_code" | "get_user_tag" | "edit_user_tag" | "get_user_group" | "create_user_group" | "create_special_user_group" | "edit_user_group" | "delete_user_group" | "edit_others_user_group" | "web_rtc" | "get_my_sessions" | "delete_my_sessions" | "get_my_external_account" | "edit_my_external_account" | "get_unread" | "delete_unread" | "get_clip_folder" | "create_clip_folder" | "edit_clip_folder" | "delete_clip_folder";

  /**
   * バージョン・サーバーフラグ情報
   */
  export type Version = {
  /**
   * traQ(サーバー)リビジョン
   */
  revision: string;
  /**
   * traQ(サーバー)バージョン
   */
  version: string;
  flags: {
  /**
   * 有効な外部ログインプロバイダ
   */
  externalLogin: string[];
  /**
   * ユーザーが自身で新規登録(POST /api/v3/users)可能か
   */
  signUpAllowed: boolean;
};
};

  /**
   * WebRTC状態
   */
  export type WebRTCUserState = {
  /**
   * ユーザーUUID
   */
  userId: string;
  /**
   * チャンネルUUID
   */
  channelId: string;
  /**
   * セッションの配列
   */
  sessions: Traq.Session[];
};

  /**
   * メッセージクリップ
   */
  export type MessageClip = {
  /**
   * クリップされているフォルダのID
   */
  folderId: string;
  /**
   * クリップされた日時
   */
  clippedAt: string;
};

  /**
   * OGPの情報
   */
  export type Ogp = {
  type: string;
  title: string;
  url: string;
  images: Traq.OgpMedia[];
  description: string;
  videos: Traq.OgpMedia[];
};

  /**
   * OGPに含まれる画像の情報
   */
  export type OgpMedia = {
  url: string;
  secureUrl: string | null;
  type: string | null;
  width: number | null;
  height: number | null;
};

  /**
   * メッセージ引用通知の設定情報
   */
  export type GetNotifyCitation = {
  notifyCitation: boolean;
};

  /**
   * ユーザー設定の情報
   */
  export type UserSettings = {
  /**
   * ユーザーUUID
   */
  id: string;
  /**
   * メッセージ引用通知の設定情報
   */
  notifyCitation: boolean;
};

  /**
   * メッセージ引用通知設定リクエスト
   */
  export type PutNotifyCitationRequest = {
  /**
   * メッセージ引用通知の設定情報
   */
  notifyCitation: boolean;
};

  /**
   * チャンネルパス
   */
  export type ChannelPath = {
  /**
   * チャンネルパス
   */
  path: string;
};

  export type Session = {
  /**
   * 状態
   */
  state: string;
  /**
   * セッションID
   */
  sessionId: string;
};

  export type soundboardPlayResponse = {
  /**
   * 作成された Ingress のID
   */
  ingressId: string;
  /**
   * 作成された Ingress のストリームURL等
   */
  url?: string;
  /**
   * RTMP配信の場合のstream key
   */
  streamKey?: string;
};

  export type qallEndpointResponse = {
  /**
   * LiveKitのエンドポイント
   */
  endpoint: string;
};

  export type soundboardListResponse = Traq.soundboardItem[];

  export type soundboardItem = {
  /**
   * サーバが発行したサウンドID
   */
  soundId: string;
  /**
   * ユーザが指定した表示用のサウンド名
   */
  soundName: string;
  /**
   * 任意のスタンプID等、サウンドに紐づく拡張情報
   */
  stampId: string;
  /**
   * 作成者のユーザID
   */
  creatorId: string;
};

  export type soundboardUploadResponse = {
  /**
   * 登録されたサウンドID (ファイル名)
   */
  soundId: string;
};

  export type qallRoomsListResponse = Traq.qallRoomWithParticipants[];

  export type qallTokenResponse = {
  /**
   * LiveKit用のJWTトークン
   */
  token: string;
};

  export type qallRoomWithParticipants = {
  /**
   * ルームのID
   */
  roomId: string;
  participants: Traq.qallParticipant[];
  /**
   * ウェビナールームかどうか
   */
  isWebinar?: boolean;
  /**
   * ルームに関連付けられたカスタム属性
   */
  metadata?: string;
};

  /**
   * ルーム内の参加者一覧
   */
  export type qallParticipant = {
  /**
   * ユーザーID_RandomUUID
   */
  identity?: string;
  /**
   * 表示名
   */
  name?: string;
  /**
   * 参加した時刻
   */
  joinedAt?: string;
  /**
   * ユーザーに関連付けられたカスタム属性
   */
  attributes?: {
  [key: string]: string;
};
  /**
   * 発言権限
   */
  canPublish?: boolean;
};

  export type qallParticipantRequest = {
  users: {
  /**
   * ユーザーID
   */
  userId?: string;
  /**
   * 発言権限
   */
  canPublish?: boolean;
}[];
};

  export type qallMetadataRequest = {
  /**
   * ルームに関連付けられたカスタム属性
   */
  metadata?: string;
};

  export type qallMetadataResponse = {
  /**
   * ルームに関連付けられたカスタム属性
   */
  metadata?: string;
};

  export type qallParticipantResponse = {
  results?: {
  /**
   * 対象参加者ID
   */
  participantId?: string;
  /**
   * success もしくは error
   */
  status?: string;
  /**
   * エラーがある場合の詳細
   */
  errorMessage?: string;
}[];
};

  export type soundboardUploadRequest = {
  /**
   * アップロードする音声ファイル(20秒以内)
   */
  audio: Blob;
  /**
   * ユーザが自由につけるサウンド名
   */
  soundName: string;
  /**
   * アイコンスタンプID
   */
  stampId?: string;
};

  export type soundboardPlayRequest = {
  /**
   * サウンドID (DB登録済み)
   */
  soundId: string;
  /**
   * 再生させたいルームのUUID
   */
  roomName: string;
};
}

/**
 * ノートブックのセル内で使える traQ API メソッドです。
 *
 * 現在の OAuth token でリクエストし、結果を Network Log に記録します。
 */
declare const api: {
  /**
   * チャンネルにメッセージを投稿
   *
   * 指定したチャンネルにメッセージを投稿します。
   * embedをtrueに指定すると、メッセージ埋め込みが自動で行われます。
   * アーカイブされているチャンネルに投稿することはできません。
   *
   * Endpoint: POST /channels/{channelId}/messages
   *
   * Tags: message, channel
   */
  postMessage(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostMessageRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Message>;

  /**
   * チャンネルメッセージのリストを取得
   *
   * 指定したチャンネルのメッセージのリストを取得します。
   *
   * Endpoint: GET /channels/{channelId}/messages
   *
   * Tags: channel, message
   */
  getMessages(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 取得する件数
     */
    limit?: number;
    /**
     * 取得するオフセット
     */
    offset?: number;
    /**
     * 取得する時間範囲の開始日時
     */
    since?: string;
    /**
     * 取得する時間範囲の終了日時
     */
    until?: string;
    /**
     * 範囲の端を含めるかどうか
     */
    inclusive?: boolean;
    /**
     * 昇順か降順か
     */
    order?: "asc" | "desc";
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Message[]>;

  /**
   * メッセージを検索
   *
   * メッセージを検索します。
   *
   * Endpoint: GET /messages
   *
   * Tags: message
   */
  searchMessages(input?: {
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 検索ワード
     * Simple-Query-String-Syntaxをパースして検索します
     */
    word?: string;
    /**
     * 投稿日時が指定日時より後
     */
    after?: string;
    /**
     * 投稿日時が指定日時より前
     */
    before?: string;
    /**
     * メッセージが投稿されたチャンネル
     */
    in?: string;
    /**
     * メンションされたユーザー
     */
    to?: string[];
    /**
     * メッセージを投稿したユーザー
     */
    from?: string[];
    /**
     * 引用しているメッセージ
     */
    citation?: string;
    /**
     * メッセージを投稿したユーザーがBotかどうか
     */
    bot?: boolean;
    /**
     * メッセージがURLを含むか
     */
    hasURL?: boolean;
    /**
     * メッセージが添付ファイルを含むか
     */
    hasAttachments?: boolean;
    /**
     * メッセージが画像を含むか
     */
    hasImage?: boolean;
    /**
     * メッセージが動画を含むか
     */
    hasVideo?: boolean;
    /**
     * メッセージが音声ファイルを含むか
     */
    hasAudio?: boolean;
    /**
     * 検索結果から取得するメッセージの最大件数
     */
    limit?: number;
    /**
     * 検索結果から取得するメッセージのオフセット
     */
    offset?: number;
    /**
     * ソート順 (作成日時が新しい `createdAt`, 作成日時が古い `-createdAt`, 更新日時が新しい `updatedAt`, 更新日時が古い `-updatedAt`)
     */
    sort?: "createdAt" | "-createdAt" | "updatedAt" | "-updatedAt";
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<{
  /**
   * 検索にヒットしたメッセージ件数
   */
  totalHits: number;
  /**
   * 検索にヒットしたメッセージの配列
   */
  hits: Traq.Message[];
}>;

  /**
   * メッセージを取得
   *
   * 指定したメッセージを取得します。
   *
   * Endpoint: GET /messages/{messageId}
   *
   * Tags: message
   */
  getMessage(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * メッセージUUID
     */
    messageId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Message>;

  /**
   * メッセージを編集
   *
   * 指定したメッセージを編集します。
   * 自身が投稿したメッセージのみ編集することができます。
   * アーカイブされているチャンネルのメッセージを編集することは出来ません。
   *
   * Endpoint: PUT /messages/{messageId}
   *
   * Tags: message
   */
  editMessage(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * メッセージUUID
     */
    messageId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostMessageRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * メッセージを削除
   *
   * 指定したメッセージを削除します。
   * 自身が投稿したメッセージと自身が管理権限を持つWebhookとBOTが投稿したメッセージのみ削除することができます。
   * アーカイブされているチャンネルのメッセージを編集することは出来ません。
   *
   * Endpoint: DELETE /messages/{messageId}
   *
   * Tags: message
   */
  deleteMessage(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * メッセージUUID
     */
    messageId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * ピン留めを取得
   *
   * 指定したメッセージのピン留め情報を取得します。
   *
   * Endpoint: GET /messages/{messageId}/pin
   *
   * Tags: message, pin
   */
  getPin(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * メッセージUUID
     */
    messageId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.MessagePin>;

  /**
   * ピン留めする
   *
   * 指定したメッセージをピン留めします。
   * アーカイブされているチャンネルのメッセージ・存在しないメッセージ・チャンネル当たりの上限数を超えたメッセージのピン留めはできません。
   *
   * Endpoint: POST /messages/{messageId}/pin
   *
   * Tags: message, pin
   */
  createPin(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * メッセージUUID
     */
    messageId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.MessagePin>;

  /**
   * ピン留めを外す
   *
   * 指定したメッセージのピン留めを外します。
   *
   * Endpoint: DELETE /messages/{messageId}/pin
   *
   * Tags: message, pin
   */
  removePin(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * メッセージUUID
     */
    messageId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * チャンネル統計情報を取得
   *
   * 指定したチャンネルの統計情報を取得します。
   *
   * Endpoint: GET /channels/{channelId}/stats
   *
   * Tags: channel
   */
  getChannelStats(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 削除されたメッセージを除外するかどうか(デフォルト false)
     */
    "exclude-deleted-messages"?: boolean;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.ChannelStats>;

  /**
   * チャンネルトピックを取得
   *
   * 指定したチャンネルのトピックを取得します。
   *
   * Endpoint: GET /channels/{channelId}/topic
   *
   * Tags: channel
   */
  getChannelTopic(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.ChannelTopic>;

  /**
   * チャンネルトピックを編集
   *
   * 指定したチャンネルのトピックを編集します。
   * アーカイブされているチャンネルのトピックは編集できません。
   *
   * Endpoint: PUT /channels/{channelId}/topic
   *
   * Tags: channel
   */
  editChannelTopic(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PutChannelTopicRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * チャンネル閲覧者リストを取得
   *
   * 指定したチャンネルの閲覧者のリストを取得します。
   *
   * Endpoint: GET /channels/{channelId}/viewers
   *
   * Tags: channel
   */
  getChannelViewers(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.ChannelViewer[]>;

  /**
   * ファイルをアップロード
   *
   * 指定したチャンネルにファイルをアップロードします。
   * アーカイブされているチャンネルにはアップロード出来ません。
   *
   * Endpoint: POST /files
   *
   * Tags: file
   */
  postFile(input?: {
  /**
   * リクエスト body です。Content-Type: multipart/form-data.
   */
  body?: Traq.PostFileRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.FileInfo>;

  /**
   * ファイルメタのリストを取得
   *
   * 指定したクエリでファイルメタのリストを取得します。
   * クエリパラメータ`channelId`, `mine`の少なくともいずれかが必須です。
   *
   * Endpoint: GET /files
   *
   * Tags: file
   */
  getFiles(input?: {
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * アップロード先チャンネルUUID
     */
    channelId?: string;
    /**
     * 取得する件数
     */
    limit?: number;
    /**
     * 取得するオフセット
     */
    offset?: number;
    /**
     * 取得する時間範囲の開始日時
     */
    since?: string;
    /**
     * 取得する時間範囲の終了日時
     */
    until?: string;
    /**
     * 範囲の端を含めるかどうか
     */
    inclusive?: boolean;
    /**
     * 昇順か降順か
     */
    order?: "asc" | "desc";
    /**
     * アップロード者が自分のファイルのみを取得するか
     */
    mine?: boolean;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.FileInfo[]>;

  /**
   * ファイルメタを取得
   *
   * 指定したファイルのメタ情報を取得します。
   * 指定したファイルへのアクセス権限が必要です。
   *
   * Endpoint: GET /files/{fileId}/meta
   *
   * Tags: file
   */
  getFileMeta(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ファイルUUID
     */
    fileId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.FileInfo>;

  /**
   * サムネイル画像を取得
   *
   * 指定したファイルのサムネイル画像を取得します。
   * 指定したファイルへのアクセス権限が必要です。
   *
   * Endpoint: GET /files/{fileId}/thumbnail
   *
   * Tags: file
   */
  getThumbnailImage(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ファイルUUID
     */
    fileId: string;
  };
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 取得するサムネイルのタイプ
     */
    type?: Traq.ThumbnailType;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /**
   * ファイルをダウンロード
   *
   * 指定したファイル本体を取得します。
   * 指定したファイルへのアクセス権限が必要です。
   *
   * Endpoint: GET /files/{fileId}
   *
   * Tags: file
   */
  getFile(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ファイルUUID
     */
    fileId: string;
  };
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * このクエリパラメータは廃止されており、意味を持ちません（現在、このパラメータが0の場合も1の場合もレスポンスにはContent-Dispositionヘッダーが付与されます）
     */
    dl?: number;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /**
   * ファイルを削除
   *
   * 指定したファイルを削除します。
   * 指定したファイルの削除権限が必要です。
   *
   * Endpoint: DELETE /files/{fileId}
   *
   * Tags: file
   */
  deleteFile(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ファイルUUID
     */
    fileId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * チャンネルピンのリストを取得
   *
   * 指定したチャンネルにピン留めされているピンメッセージのリストを取得します。
   *
   * Endpoint: GET /channels/{channelId}/pins
   *
   * Tags: channel, pin
   */
  getChannelPins(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Pin[]>;

  /**
   * メッセージのスタンプリストを取得
   *
   * 指定したメッセージに押されているスタンプのリストを取得します。
   *
   * Endpoint: GET /messages/{messageId}/stamps
   *
   * Tags: message, stamp
   */
  getMessageStamps(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * メッセージUUID
     */
    messageId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.MessageStamp[]>;

  /**
   * スタンプを押す
   *
   * 指定したメッセージに指定したスタンプを押します。
   *
   * Endpoint: POST /messages/{messageId}/stamps/{stampId}
   *
   * Tags: message, stamp
   */
  addMessageStamp(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * メッセージUUID
     */
    messageId: string;
    /**
     * スタンプUUID
     */
    stampId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostMessageStampRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * スタンプを消す
   *
   * 指定したメッセージから指定した自身が押したスタンプを削除します。
   *
   * Endpoint: DELETE /messages/{messageId}/stamps/{stampId}
   *
   * Tags: message, stamp
   */
  removeMessageStamp(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * メッセージUUID
     */
    messageId: string;
    /**
     * スタンプUUID
     */
    stampId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * スタンプ情報を取得
   *
   * 指定したスタンプの情報を取得します。
   *
   * Endpoint: GET /stamps/{stampId}
   *
   * Tags: stamp
   */
  getStamp(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * スタンプUUID
     */
    stampId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Stamp>;

  /**
   * スタンプを削除
   *
   * 指定したスタンプを削除します。
   * 対象のスタンプの削除権限が必要です。
   *
   * Endpoint: DELETE /stamps/{stampId}
   *
   * Tags: stamp
   */
  deleteStamp(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * スタンプUUID
     */
    stampId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * スタンプ情報を変更
   *
   * 指定したスタンプの情報を変更します。
   *
   * Endpoint: PATCH /stamps/{stampId}
   *
   * Tags: stamp
   */
  editStamp(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * スタンプUUID
     */
    stampId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PatchStampRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * スタンプを作成
   *
   * スタンプを新規作成します。
   *
   * Endpoint: POST /stamps
   *
   * Tags: stamp
   */
  createStamp(input?: {
  /**
   * リクエスト body です。Content-Type: multipart/form-data.
   */
  body?: Traq.PostStampRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Stamp>;

  /**
   * スタンプリストを取得
   *
   * スタンプのリストを取得します。
   *
   * Endpoint: GET /stamps
   *
   * Tags: stamp
   */
  getStamps(input?: {
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * Unicode絵文字を含ませるかどうか
     * Deprecated: typeクエリを指定しなければ全てのスタンプを取得できるため、そちらを利用してください
     */
    "include-unicode"?: boolean;
    /**
     * 取得するスタンプの種類
     */
    type?: "unicode" | "original";
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.StampWithThumbnail[]>;

  /**
   * スタンプ履歴を取得
   *
   * 自分のスタンプ履歴を最大100件まで取得します。
   * 結果は降順で返されます。
   *
   * このAPIが返すスタンプ履歴は厳密な履歴ではありません。
   *
   * Endpoint: GET /users/me/stamp-history
   *
   * Tags: stamp, me
   */
  getMyStampHistory(input?: {
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 件数
     */
    limit?: number;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.StampHistoryEntry[]>;

  /**
   * スタンプレコメンドを取得
   *
   * 自分のスタンプレコメンドを最大200件まで取得します。
   * 結果は推薦度の高い順で返されます。
   * スタンプを使用したことがないユーザーの場合は空配列が返されます。
   *
   * Endpoint: GET /users/me/stamp-recommendations
   *
   * Tags: stamp, me
   */
  getMyStampRecommendations(input?: {
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 件数
     */
    limit?: number;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<{
  /**
   * スタンプUUID
   */
  stampId: string;
  /**
   * レコメンドスコア
   */
  score: number;
}[]>;

  /**
   * QRコードを取得
   *
   * 自身のQRコードを取得します。
   * 返されたQRコードまたはトークンは、発行後の5分間のみ有効です
   *
   * Endpoint: GET /users/me/qr-code
   *
   * Tags: me
   */
  getMyQRCode(input?: {
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 画像でなくトークン文字列で返すかどうか
     */
    token?: boolean;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /**
   * スタンプ統計情報を取得
   *
   * 指定したスタンプの統計情報を取得します。
   *
   * Endpoint: GET /stamps/{stampId}/stats
   *
   * Tags: stamp
   */
  getStampStats(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * スタンプUUID
     */
    stampId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.StampStats>;

  /**
   * ユーザー詳細情報を取得
   *
   * 指定したユーザーの詳細情報を取得します。
   *
   * Endpoint: GET /users/{userId}
   *
   * Tags: user
   */
  getUser(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーUUID
     */
    userId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserDetail>;

  /**
   * ユーザー情報を変更
   *
   * 指定したユーザーの情報を変更します。
   * 管理者権限が必要です。
   *
   * Endpoint: PATCH /users/{userId}
   *
   * Tags: user
   */
  editUser(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーUUID
     */
    userId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PatchUserRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * ユーザーグループを取得
   *
   * 指定したユーザーグループの情報を取得します。
   *
   * Endpoint: GET /groups/{groupId}
   *
   * Tags: group
   */
  getUserGroup(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーグループUUID
     */
    groupId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserGroup>;

  /**
   * ユーザーグループを削除
   *
   * 指定したユーザーグループを削除します。
   * 対象のユーザーグループの管理者権限が必要です。
   *
   * Endpoint: DELETE /groups/{groupId}
   *
   * Tags: group
   */
  deleteUserGroup(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーグループUUID
     */
    groupId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * ユーザーグループを編集
   *
   * 指定したユーザーグループの情報を編集します。
   * 対象のユーザーグループの管理者権限が必要です。
   *
   * Endpoint: PATCH /groups/{groupId}
   *
   * Tags: group
   */
  editUserGroup(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーグループUUID
     */
    groupId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PatchUserGroupRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * ユーザーグループのアイコンを変更
   *
   * ユーザーグループのアイコンを変更します。
   * 対象のユーザーグループの管理者権限が必要です。
   *
   * Endpoint: PUT /groups/{groupId}/icon
   *
   * Tags: group
   */
  changeUserGroupIcon(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーグループUUID
     */
    groupId: string;
  };
  /**
   * リクエスト body です。Content-Type: multipart/form-data.
   */
  body?: Traq.PutUserIconRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * グループメンバーを取得
   *
   * 指定したグループのメンバーのリストを取得します。
   *
   * Endpoint: GET /groups/{groupId}/members
   *
   * Tags: group
   */
  getUserGroupMembers(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーグループUUID
     */
    groupId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserGroupMember[]>;

  /**
   * グループメンバーを追加
   *
   * 指定したグループにメンバーを追加します。
   * 対象のユーザーグループの管理者権限が必要です。
   *
   * Endpoint: POST /groups/{groupId}/members
   *
   * Tags: group
   */
  addUserGroupMember(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーグループUUID
     */
    groupId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.UserGroupMember | Traq.UserGroupMembers;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * グループメンバーを一括削除
   *
   * 指定したグループから全てのメンバーを削除します。
   * 対象のユーザーグループの管理者権限が必要です。
   *
   * Endpoint: DELETE /groups/{groupId}/members
   *
   * Tags: group
   */
  removeUserGroupMembers(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーグループUUID
     */
    groupId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * グループメンバーを削除
   *
   * 指定したユーザーグループから指定したユーザーを削除します。
   * 既にグループから削除されているメンバーを指定した場合は204を返します。
   * 対象のユーザーグループの管理者権限が必要です。
   *
   * Endpoint: DELETE /groups/{groupId}/members/{userId}
   *
   * Tags: group
   */
  removeUserGroupMember(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーグループUUID
     */
    groupId: string;
    /**
     * ユーザーUUID
     */
    userId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * グループメンバーを編集
   *
   * 指定したユーザーグループ内の指定したユーザーの属性を編集します。
   * 対象のユーザーグループの管理者権限が必要です。
   *
   * Endpoint: PATCH /groups/{groupId}/members/{userId}
   *
   * Tags: group
   */
  editUserGroupMember(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーグループUUID
     */
    groupId: string;
    /**
     * ユーザーUUID
     */
    userId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PatchGroupMemberRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * ユーザーグループのリストを取得
   *
   * ユーザーグループのリストを取得します。
   *
   * Endpoint: GET /groups
   *
   * Tags: group
   */
  getUserGroups(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserGroup[]>;

  /**
   * ユーザーグループを作成
   *
   * ユーザーグループを作成します。
   * 作成者は自動的にグループ管理者になります。
   *
   * Endpoint: POST /groups
   *
   * Tags: group
   */
  createUserGroup(input?: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostUserGroupRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserGroup>;

  /**
   * 自分のユーザー詳細を取得
   *
   * 自身のユーザー詳細情報を取得します。
   *
   * Endpoint: GET /users/me
   *
   * Tags: me
   */
  getMe(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.MyUserDetail>;

  /**
   * 自分のユーザー情報を変更
   *
   * 自身のユーザー情報を変更します。
   *
   * Endpoint: PATCH /users/me
   *
   * Tags: me
   */
  editMe(input?: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PatchMeRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * 自分のユーザー詳細を取得 (OIDC UserInfo)
   *
   * OIDCトークンを用いてユーザー詳細を取得します。
   * OIDC UserInfo Endpointです。
   *
   * Endpoint: GET /users/me/oidc
   *
   * Tags: me
   */
  getOIDCUserInfo(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.OIDCUserInfo>;

  /**
   * ダイレクトメッセージを送信
   *
   * 指定したユーザーにダイレクトメッセージを送信します。
   *
   * Endpoint: POST /users/{userId}/messages
   *
   * Tags: message, user
   */
  postDirectMessage(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーUUID
     */
    userId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostMessageRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Message>;

  /**
   * ダイレクトメッセージのリストを取得
   *
   * 指定したユーザーとのダイレクトメッセージのリストを取得します。
   *
   * Endpoint: GET /users/{userId}/messages
   *
   * Tags: message, user
   */
  getDirectMessages(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーUUID
     */
    userId: string;
  };
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 取得する件数
     */
    limit?: number;
    /**
     * 取得するオフセット
     */
    offset?: number;
    /**
     * 取得する時間範囲の開始日時
     */
    since?: string;
    /**
     * 取得する時間範囲の終了日時
     */
    until?: string;
    /**
     * 範囲の端を含めるかどうか
     */
    inclusive?: boolean;
    /**
     * 昇順か降順か
     */
    order?: "asc" | "desc";
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Message[]>;

  /**
   * ユーザー統計情報を取得
   *
   * 指定したユーザーの統計情報を取得します。
   *
   * Endpoint: GET /users/{userId}/stats
   *
   * Tags: user
   */
  getUserStats(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーUUID
     */
    userId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserStats>;

  /**
   * チャンネルの通知購読者のリストを取得
   *
   * 指定したチャンネルを通知購読しているユーザーのUUIDのリストを取得します。
   *
   * Endpoint: GET /channels/{channelId}/subscribers
   *
   * Tags: channel, notification
   */
  getChannelSubscribers(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<string[]>;

  /**
   * チャンネルの通知購読者を編集
   *
   * 指定したチャンネルの通知購読者を編集します。
   * リクエストに含めなかったユーザーの通知購読状態は変更しません。
   * また、存在しないユーザーを指定した場合は無視されます。
   *
   * Endpoint: PATCH /channels/{channelId}/subscribers
   *
   * Tags: channel, notification
   */
  editChannelSubscribers(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PatchChannelSubscribersRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * チャンネルの通知購読者を設定
   *
   * 指定したチャンネルの通知購読者を設定します。
   * リクエストに含めなかったユーザーの通知購読状態はオフになります。
   * また、存在しないユーザーを指定した場合は無視されます。
   *
   * Endpoint: PUT /channels/{channelId}/subscribers
   *
   * Tags: channel, notification
   */
  setChannelSubscribers(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PutChannelSubscribersRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * 自分のチャンネル購読状態を取得
   *
   * 自身のチャンネル購読状態を取得します。
   *
   * Endpoint: GET /users/me/subscriptions
   *
   * Tags: me, notification
   */
  getMyChannelSubscriptions(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserSubscribeState[]>;

  /**
   * チャンネル購読レベルを設定
   *
   * 自身の指定したチャンネルの購読レベルを設定します。
   *
   * Endpoint: PUT /users/me/subscriptions/{channelId}
   *
   * Tags: me, notification
   */
  setChannelSubscribeLevel(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PutChannelSubscribeLevelRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * Webhook情報のリストを取得します
   *
   * Webhookのリストを取得します。
   * allがtrueで無い場合は、自分がオーナーのWebhookのリストを返します。
   *
   * Endpoint: GET /webhooks
   *
   * Tags: webhook
   */
  getWebhooks(input?: {
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 全てのWebhookを取得します。権限が必要です。
     */
    all?: boolean;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Webhook[]>;

  /**
   * Webhookを新規作成
   *
   * Webhookを新規作成します。
   * `secret`が空文字の場合、insecureウェブフックが作成されます。
   *
   * Endpoint: POST /webhooks
   *
   * Tags: webhook
   */
  createWebhook(input?: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostWebhookRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Webhook>;

  /**
   * Webhook情報を取得
   *
   * 指定したWebhookの詳細を取得します。
   *
   * Endpoint: GET /webhooks/{webhookId}
   *
   * Tags: webhook
   */
  getWebhook(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * WebhookUUID
     */
    webhookId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Webhook>;

  /**
   * Webhookを送信
   *
   * Webhookにメッセージを投稿します。
   * secureなウェブフックに対しては`X-TRAQ-Signature`ヘッダーが必須です。
   * アーカイブされているチャンネルには投稿できません。
   *
   * Endpoint: POST /webhooks/{webhookId}
   *
   * Tags: webhook
   */
  postWebhook(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * WebhookUUID
     */
    webhookId: string;
  };
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * メンション・チャンネルリンクを自動埋め込みする場合に1を指定する
     */
    embed?: number;
  };
  /**
   * メッセージ文字列
   *
   * リクエスト body です。Content-Type: text/plain.
   */
  body?: string;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * Webhookを削除
   *
   * 指定したWebhookを削除します。
   * Webhookによって投稿されたメッセージは削除されません。
   *
   * Endpoint: DELETE /webhooks/{webhookId}
   *
   * Tags: webhook
   */
  deleteWebhook(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * WebhookUUID
     */
    webhookId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * Webhook情報を変更
   *
   * 指定したWebhookの情報を変更します。
   *
   * Endpoint: PATCH /webhooks/{webhookId}
   *
   * Tags: webhook
   */
  editWebhook(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * WebhookUUID
     */
    webhookId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PatchWebhookRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * Webhookのアイコンを取得
   *
   * 指定したWebhookのアイコン画像を取得します
   *
   * Endpoint: GET /webhooks/{webhookId}/icon
   *
   * Tags: webhook
   */
  getWebhookIcon(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * WebhookUUID
     */
    webhookId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /**
   * Webhookのアイコンを変更
   *
   * 指定したWebhookのアイコン画像を変更します。
   *
   * Endpoint: PUT /webhooks/{webhookId}/icon
   *
   * Tags: webhook
   */
  changeWebhookIcon(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * WebhookUUID
     */
    webhookId: string;
  };
  /**
   * リクエスト body です。Content-Type: multipart/form-data.
   */
  body?: Traq.PutUserIconRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * ユーザーのアイコン画像を取得
   *
   * 指定したユーザーのアイコン画像を取得します。
   *
   * Endpoint: GET /users/{userId}/icon
   *
   * Tags: user
   */
  getUserIcon(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーUUID
     */
    userId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /**
   * ユーザーのアイコン画像を変更します
   *
   * 指定したユーザーのアイコン画像を変更します。
   * 管理者権限が必要です。
   *
   * Endpoint: PUT /users/{userId}/icon
   *
   * Tags: user
   */
  changeUserIcon(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーUUID
     */
    userId: string;
  };
  /**
   * リクエスト body です。Content-Type: multipart/form-data.
   */
  body?: Traq.PutUserIconRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * 自分のアイコン画像を取得
   *
   * 自分のアイコン画像を取得します。
   *
   * Endpoint: GET /users/me/icon
   *
   * Tags: me
   */
  getMyIcon(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /**
   * 自分のアイコン画像を変更
   *
   * 自分のアイコン画像を変更します。
   *
   * Endpoint: PUT /users/me/icon
   *
   * Tags: me
   */
  changeMyIcon(input?: {
  /**
   * リクエスト body です。Content-Type: multipart/form-data.
   */
  body?: Traq.PutUserIconRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * 自分のパスワードを変更
   *
   * 自身のパスワードを変更します。
   *
   * Endpoint: PUT /users/me/password
   *
   * Tags: me
   */
  changeMyPassword(input?: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PutMyPasswordRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * ユーザーのパスワードを変更
   *
   * 指定したユーザーのパスワードを変更します。
   * 管理者権限が必要です。
   *
   * Endpoint: PUT /users/{userId}/password
   *
   * Tags: user
   */
  changeUserPassword(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーUUID
     */
    userId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PutUserPasswordRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * FCMデバイスを登録
   *
   * 自身のFCMデバイスを登録します。
   *
   * Endpoint: POST /users/me/fcm-device
   *
   * Tags: me, notification
   */
  registerFCMDevice(input?: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostMyFCMDeviceRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * 自身のチャンネル閲覧状態一覧を取得
   *
   * 自身のチャンネル閲覧状態一覧を取得します。
   *
   * Endpoint: GET /users/me/view-states
   *
   * Tags: me, notification
   */
  getMyViewStates(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.MyChannelViewState[]>;

  /**
   * ユーザーを登録
   *
   * ユーザーを登録します。
   * 管理者権限が必要です。
   *
   * Endpoint: POST /users
   *
   * Tags: user
   */
  createUser(input?: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostUserRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserDetail>;

  /**
   * ユーザーのリストを取得
   *
   * ユーザーのリストを取得します。
   * `include-suspended`を指定しない場合、レスポンスにはユーザーアカウント状態が"1: 有効"であるユーザーのみが含まれます。
   * `include-suspended`と`name`を同時に指定することはできません。
   *
   * Endpoint: GET /users
   *
   * Tags: user
   */
  getUsers(input?: {
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * アカウントがアクティブでないユーザーを含め、全てのユーザーを取得するかどうか
     */
    "include-suspended"?: boolean;
    /**
     * 名前が一致するアカウントのみを取得する
     */
    name?: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.User[]>;

  /**
   * チャンネルを作成
   *
   * チャンネルを作成します。
   * 階層が6以上になるチャンネルは作成できません。
   *
   * Endpoint: POST /channels
   *
   * Tags: channel
   */
  createChannel(input?: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostChannelRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Channel>;

  /**
   * チャンネルリストを取得
   *
   * チャンネルのリストを取得します。
   *
   * Endpoint: GET /channels
   *
   * Tags: channel
   */
  getChannels(input?: {
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * ダイレクトメッセージチャンネルをレスポンスに含めるかどうか
     */
    "include-dm"?: boolean;
    /**
     * パスが一致するチャンネルのみを取得する
     */
    path?: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.ChannelList>;

  /**
   * ユーザーのタグリストを取得
   *
   * 指定したユーザーのタグリストを取得します。
   *
   * Endpoint: GET /users/{userId}/tags
   *
   * Tags: user, user tag
   */
  getUserTags(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーUUID
     */
    userId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserTag[]>;

  /**
   * ユーザーにタグを追加
   *
   * 指定したユーザーに指定したタグを追加します。
   * Webhookユーザーにタグを追加することは出来ません。
   *
   * Endpoint: POST /users/{userId}/tags
   *
   * Tags: user, user tag
   */
  addUserTag(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーUUID
     */
    userId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostUserTagRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserTag>;

  /**
   * ユーザーのタグを編集
   *
   * 指定したユーザーの指定したタグの状態を変更します。
   * 他人の状態は変更できません。
   *
   * Endpoint: PATCH /users/{userId}/tags/{tagId}
   *
   * Tags: user, user tag
   */
  editUserTag(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーUUID
     */
    userId: string;
    /**
     * タグUUID
     */
    tagId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PatchUserTagRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * ユーザーからタグを削除します
   *
   * 既に存在しないタグを削除しようとした場合は204を返します。
   *
   * Endpoint: DELETE /users/{userId}/tags/{tagId}
   *
   * Tags: user, user tag
   */
  removeUserTag(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーUUID
     */
    userId: string;
    /**
     * タグUUID
     */
    tagId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * タグ情報を取得
   *
   * 指定したタグの情報を取得します。
   *
   * Endpoint: GET /tags/{tagId}
   *
   * Tags: user tag
   */
  getTag(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * タグUUID
     */
    tagId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Tag>;

  /**
   * 自分のタグリストを取得
   *
   * 自分に付けられているタグの配列を取得します。
   *
   * Endpoint: GET /users/me/tags
   *
   * Tags: me, user tag
   */
  getMyUserTags(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserTag[]>;

  /**
   * 自分にタグを追加
   *
   * 自分に新しくタグを追加します。
   *
   * Endpoint: POST /users/me/tags
   *
   * Tags: me, user tag
   */
  addMyUserTag(input?: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostUserTagRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserTag>;

  /**
   * 自分からタグを削除します
   *
   * 既に存在しないタグを削除しようとした場合は204を返します。
   *
   * Endpoint: DELETE /users/me/tags/{tagId}
   *
   * Tags: user tag, me
   */
  removeMyUserTag(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * タグUUID
     */
    tagId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * 自分のタグを編集
   *
   * 自分の指定したタグの状態を変更します。
   *
   * Endpoint: PATCH /users/me/tags/{tagId}
   *
   * Tags: user tag, me
   */
  editMyUserTag(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * タグUUID
     */
    tagId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PatchUserTagRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * スターチャンネルリストを取得
   *
   * 自分がスターしているチャンネルのUUIDの配列を取得します。
   *
   * Endpoint: GET /users/me/stars
   *
   * Tags: me, star
   */
  getMyStars(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<string[]>;

  /**
   * チャンネルをスターに追加
   *
   * 指定したチャンネルをスターチャンネルに追加します。
   * スター済みのチャンネルIDを指定した場合、204を返します。
   * 不正なチャンネルIDを指定した場合、400を返します。
   *
   * Endpoint: POST /users/me/stars
   *
   * Tags: me, star
   */
  addMyStar(input?: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostStarRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * チャンネルをスターから削除します
   *
   * 既にスターから削除されているチャンネルを指定した場合は204を返します。
   *
   * Endpoint: DELETE /users/me/stars/{channelId}
   *
   * Tags: me, star
   */
  removeMyStar(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * 未読チャンネルを取得
   *
   * 自分が現在未読のチャンネルの未読情報を取得します。
   *
   * Endpoint: GET /users/me/unread
   *
   * Tags: me, notification
   */
  getMyUnreadChannels(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.UnreadChannel[]>;

  /**
   * バージョンを取得
   *
   * サーバーバージョン及びサーバーフラグ情報を取得します。
   *
   * Endpoint: GET /version
   *
   * Tags: public
   */
  getServerVersion(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Version>;

  /**
   * ログイン
   *
   * ログインします。
   *
   * Endpoint: POST /login
   *
   * Tags: authentication
   */
  login(input?: {
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * リダイレクト先
     */
    redirect?: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostLoginRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * ログアウト
   *
   * ログアウトします。
   *
   * Endpoint: POST /logout
   *
   * Tags: authentication
   */
  logout(input?: {
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * リダイレクト先
     */
    redirect?: string;
    /**
     * 全てのセッションでログアウトするかどうか
     */
    all?: boolean;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * 自分のログインセッションリストを取得
   *
   * 自分のログインセッションのリストを取得します。
   *
   * Endpoint: GET /users/me/sessions
   *
   * Tags: authentication, me
   */
  getMySessions(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.LoginSession[]>;

  /**
   * セッションを無効化
   *
   * 指定した自分のセッションを無効化(ログアウト)します。
   * 既に存在しない・無効化されているセッションを指定した場合も`204`を返します。
   *
   * Endpoint: DELETE /users/me/sessions/{sessionId}
   *
   * Tags: authentication, me
   */
  revokeMySession(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * セッションUUID
     */
    sessionId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * アクテビティタイムラインを取得
   *
   * パブリックチャンネルの直近の投稿メッセージを作成日時の降順で取得します。
   * `all`が`true`でない場合、購読チャンネルのみのタイムラインを取得します
   *
   * Endpoint: GET /activity/timeline
   *
   * Tags: activity
   */
  getActivityTimeline(input?: {
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 取得する件数
     */
    limit?: number;
    /**
     * 全てのチャンネルのタイムラインを取得する
     */
    all?: boolean;
    /**
     * 同じチャンネルのメッセージは最新のもののみ取得するか
     */
    per_channel?: boolean;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.ActivityTimelineMessage[]>;

  /**
   * WebSocket通知ストリームに接続します
   *
   * # WebSocketプロトコル
   * ## 送信
   * `コマンド:引数1:引数2:...`のような形式のTextMessageをサーバーに送信することで、このWebSocketセッションに対する設定が実行できる。
   * ### `viewstate`コマンド
   * このWebSocketセッションが見ているチャンネル(イベントを受け取るチャンネル)を設定する。
   * 現時点では1つのセッションに対して1つのチャンネルしか設定できない。
   *
   * `viewstate:{チャンネルID}:{閲覧状態}`
   * + チャンネルID: 対象のチャンネルID
   * + 閲覧状態: `none`, `monitoring`, `editing`
   *
   * 最初の`viewstate`コマンドを送る前、または`viewstate:null`, `viewstate:`を送信した後は、このセッションはどこのチャンネルも見ていないことになる。
   *
   * ### `rtcstate`コマンド
   * 自分のWebRTC状態を変更する。
   * 他のコネクションが既に状態を保持している場合、変更することができません。
   *
   * `rtcstate:{チャンネルID}:({状態}:{セッションID})*`
   *
   * コネクションが切断された場合、自分のWebRTC状態はリセットされます。
   *
   * ### `timeline_streaming`コマンド
   * 全てのパブリックチャンネルの`MESSAGE_CREATED`イベントを受け取るかどうかを設定する。
   * 初期状態は`off`です。
   *
   * `timeline_streaming:(on|off|true|false)`
   *
   * ## 受信
   * TextMessageとして各種イベントが`type`と`body`を持つJSONとして非同期に送られます。
   *
   * 例:
   * ```json
   * {"type":"USER_ONLINE","body":{"id":"7dd8e07f-7f5d-4331-9176-b56a4299768b"}}
   * ```
   *
   * ## イベント一覧
   *
   * ### `USER_JOINED`
   * ユーザーが新規登録された。
   *
   * 対象: 全員
   *
   * + `id`: 登録されたユーザーのId
   *
   * ### `USER_UPDATED`
   * ユーザーの情報が更新された。
   *
   * 対象: 全員
   *
   * + `id`: 情報が更新されたユーザーのId
   *
   * ### `USER_TAGS_UPDATED`
   * ユーザーのタグが更新された。
   *
   * 対象: 全員
   *
   * + `id`: タグが更新されたユーザーのId
   * + `tag_id`: 更新されたタグのId
   *
   * ### `USER_ICON_UPDATED`
   * ユーザーのアイコンが更新された。
   *
   * 対象: 全員
   *
   * + `id`: アイコンが更新されたユーザーのId
   *
   * ### `USER_WEBRTC_STATE_CHANGED`
   * ユーザーのWebRTCの状態が変化した
   *
   * 対象: 全員
   *
   * + `user_id`: 変更があったユーザーのId
   * + `channel_id`: ユーザーの変更後の接続チャンネルのId
   * + `sessions`: ユーザーの変更後の状態(配列)
   *   + `state`: 状態
   *   + `sessionId`: セッションID
   *
   * ### `USER_VIEWSTATE_CHANGED`
   * ユーザーのチャンネルの閲覧状態が変化した
   *
   * 対象: 変化したWSセッションを含めた、該当ユーザーのWSセッション全て
   *
   * + `view_states`: 変化したWSセッションを含めた、該当ユーザーの変更後の状態(配列)
   *   + `key`: WSセッションの識別子
   *   + `channel_id`: 閲覧しているチャンネルId
   *   + `state`: 閲覧状態
   *
   * ### `USER_ONLINE`
   * ユーザーがオンラインになった。
   *
   * 対象: 全員
   *
   * + `id`: オンラインになったユーザーのId
   *
   * ### `USER_OFFLINE`
   * ユーザーがオフラインになった。
   *
   * 対象: 全員
   *
   * + `id`: オフラインになったユーザーのId
   *
   * ### `USER_GROUP_CREATED`
   * ユーザーグループが作成された
   *
   * 対象: 全員
   *
   * + `id`: 作成されたユーザーグループのId
   *
   * ### `USER_GROUP_UPDATED`
   * ユーザーグループが更新された
   *
   * 対象: 全員
   *
   * + `id`: 作成されたユーザーグループのId
   *
   * ### `USER_GROUP_DELETED`
   * ユーザーグループが削除された
   *
   * 対象: 全員
   *
   * + `id`: 削除されたユーザーグループのId
   *
   * ### `CHANNEL_CREATED`
   * チャンネルが新規作成された。
   *
   * 対象: 該当チャンネルを閲覧可能な全員
   *
   * + `id`: 作成されたチャンネルのId
   * + `dm_user_id`: (DMの場合のみ) DM相手のユーザーId
   *
   * ### `CHANNEL_UPDATED`
   * チャンネルの情報が変更された。
   *
   * 対象: 該当チャンネルを閲覧可能な全員
   *
   * + `id`: 変更があったチャンネルのId
   * + `dm_user_id`: (DMの場合のみ) DM相手のユーザーId
   *
   * ### `CHANNEL_DELETED`
   * チャンネルが削除された。
   *
   * 対象: 該当チャンネルを閲覧可能な全員
   *
   * + `id`: 削除されたチャンネルのId
   * + `dm_user_id`: (DMの場合のみ) DM相手のユーザーId
   *
   * ### `CHANNEL_STARED`
   * 自分がチャンネルをスターした。
   *
   * 対象: 自分
   *
   * + `id`: スターしたチャンネルのId
   *
   * ### `CHANNEL_UNSTARED`
   * 自分がチャンネルのスターを解除した。
   *
   * 対象: 自分
   *
   * + `id`: スターしたチャンネルのId
   *
   * ### `CHANNEL_VIEWERS_CHANGED`
   * チャンネルの閲覧者が変化した。
   *
   * 対象: 該当チャンネルを閲覧しているユーザー
   *
   * + `id`: 変化したチャンネルのId
   * + `viewers`: 変化後の閲覧者(配列)
   *   + `userId`: ユーザーId
   *   + `state`: 閲覧状態
   *   + `updatedAt`: 閲覧状態の更新日時
   *
   * ### `CHANNEL_SUBSCRIBERS_CHANGED`
   * チャンネルの購読者が変化した。
   *
   * 対象: 該当チャンネルを閲覧しているユーザー
   *
   * + `id`: 変化したチャンネルのId
   *
   * ### `MESSAGE_CREATED`
   * メッセージが投稿された。
   *
   * 対象: 投稿チャンネルを閲覧しているユーザー・投稿チャンネルに通知をつけているユーザー・メンションを受けたユーザー
   *
   * + `id`: 投稿されたメッセージのId
   * + `is_citing`: 投稿されたメッセージがWebSocketを接続しているユーザーの投稿を引用しているかどうか
   *
   * ### `MESSAGE_UPDATED`
   * メッセージが更新された。
   *
   * 対象: 投稿チャンネルを閲覧しているユーザー
   *
   * + `id`: 更新されたメッセージのId
   *
   * ### `MESSAGE_DELETED`
   * メッセージが削除された。
   *
   * 対象: 投稿チャンネルを閲覧しているユーザー
   *
   * + `id`: 削除されたメッセージのId
   *
   * ### `MESSAGE_STAMPED`
   * メッセージにスタンプが押された。
   *
   * 対象: 投稿チャンネルを閲覧しているユーザー
   *
   * + `message_id`: メッセージId
   * + `user_id`: スタンプを押したユーザーのId
   * + `stamp_id`: スタンプのId
   * + `count`: そのユーザーが押した数
   * + `created_at`: そのユーザーがそのスタンプをそのメッセージに最初に押した日時
   *
   * ### `MESSAGE_UNSTAMPED`
   * メッセージからスタンプが外された。
   *
   * 対象: 投稿チャンネルを閲覧しているユーザー
   *
   * + `message_id`: メッセージId
   * + `user_id`: スタンプを押したユーザーのId
   * + `stamp_id`: スタンプのId
   *
   * ### `MESSAGE_PINNED`
   * メッセージがピン留めされた。
   *
   * 対象: 投稿チャンネルを閲覧しているユーザー
   *
   * + `message_id`: ピンされたメッセージのID
   * + `channel_id`: ピンされたメッセージのチャンネルID
   *
   * ### `MESSAGE_UNPINNED`
   * ピン留めされたメッセージのピンが外された。
   *
   * 対象: 投稿チャンネルを閲覧しているユーザー
   *
   * + `message_id`: ピンが外されたメッセージのID
   * + `channel_id`: ピンが外されたメッセージのチャンネルID
   *
   * ### `MESSAGE_READ`
   * 自分があるチャンネルのメッセージを読んだ。
   *
   * 対象: 自分
   *
   * + `id`: 読んだチャンネルId
   *
   * ### `STAMP_CREATED`
   * スタンプが新しく追加された。
   *
   * 対象: 全員
   *
   * + `id`: 作成されたスタンプのId
   *
   * ### `STAMP_UPDATED`
   * スタンプが修正された。
   *
   * 対象: 全員
   *
   * + `id`: 修正されたスタンプのId
   *
   * ### `STAMP_DELETED`
   * スタンプが削除された。
   *
   * 対象: 全員
   *
   * + `id`: 削除されたスタンプのId
   *
   * ### `STAMP_PALETTE_CREATED`
   * スタンプパレットが新しく追加された。
   *
   * 対象: 自分
   *
   * + `id`: 作成されたスタンプパレットのId
   *
   * ### `STAMP_PALETTE_UPDATED`
   * スタンプパレットが修正された。
   *
   * 対象: 自分
   *
   * + `id`: 修正されたスタンプパレットのId
   *
   * ### `STAMP_PALETTE_DELETED`
   * スタンプパレットが削除された。
   *
   * 対象: 自分
   *
   * + `id`: 削除されたスタンプパレットのId
   *
   * ### `CLIP_FOLDER_CREATED`
   * クリップフォルダーが作成された。
   *
   * 対象：自分
   *
   * + `id`: 作成されたクリップフォルダーのId
   *
   * ### `CLIP_FOLDER_UPDATED`
   * クリップフォルダーが修正された。
   *
   * 対象: 自分
   *
   * + `id`: 更新されたクリップフォルダーのId
   *
   * ### `CLIP_FOLDER_DELETED`
   * クリップフォルダーが削除された。
   *
   * 対象: 自分
   *
   * + `id`: 削除されたクリップフォルダーのId
   *
   * ### `CLIP_FOLDER_MESSAGE_DELETED`
   * クリップフォルダーからメッセージが除外された。
   *
   * 対象: 自分
   *
   * + `folder_id`: メッセージが除外されたクリップフォルダーのId
   * + `message_id`: クリップフォルダーから除外されたメッセージのId
   *
   * ### `CLIP_FOLDER_MESSAGE_ADDED`
   * クリップフォルダーにメッセージが追加された。
   *
   * 対象: 自分
   *
   * + `folder_id`: メッセージが追加されたクリップフォルダーのId
   * + `message_id`: クリップフォルダーに追加されたメッセージのId
   *
   * ### `QALL_ROOM_STATE_CHANGED`
   * ルーム状態が変更された。
   *
   * 対象: 全員
   *
   * + `room_id`: 変更されたルームのId
   * + `state`: 変更後のルーム状態
   *   + `roomId`: ルームのID
   *   + `participants`: ルーム内の参加者(配列)
   *     + `identity`: ユーザーID_RandomUUID
   *     + `name`: 表示名
   *     + `joinedAt`: 参加した時刻
   *     + `attributes`: ユーザーに関連付けられたカスタム属性
   *     + `canPublish`: 発言権限
   *   + `isWebinar`: ウェビナールームかどうか
   *   + `metadata`: ルームに関連付けられたカスタム属性
   *
   * ### `QALL_SOUNDBOARD_ITEM_CREATED`
   * サウンドボードアイテムが作成された。
   *
   * 対象: 全員
   *
   * + `sound_id`: 作成されたサウンドのId
   * + `name`: サウンド名
   * + `creator_id`: 作成者のId
   *
   * ### `QALL_SOUNDBOARD_ITEM_DELETED`
   * サウンドボードアイテムが削除された。
   *
   * 対象: 全員
   *
   * + `sound_id`: 削除されたサウンドのId
   *
   * Endpoint: GET /ws
   *
   * Tags: notification
   */
  ws(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * 有効トークンのリストを取得
   *
   * 有効な自分に発行されたOAuth2トークンのリストを取得します。
   *
   * Endpoint: GET /users/me/tokens
   *
   * Tags: oauth2, me
   */
  getMyTokens(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.ActiveOAuth2Token[]>;

  /**
   * トークンの認可を取り消す
   *
   * 自分の指定したトークンの認可を取り消します。
   *
   * Endpoint: DELETE /users/me/tokens/{tokenId}
   *
   * Tags: oauth2, me
   */
  revokeMyToken(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * OAuth2トークンUUID
     */
    tokenId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * ユーザーのアイコン画像を取得
   *
   * ユーザーのアイコン画像を取得します。
   *
   * Endpoint: GET /public/icon/{username}
   *
   * Tags: public
   */
  getPublicUserIcon(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザー名
     */
    username: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /**
   * OAuth2クライアント情報を取得
   *
   * 指定したOAuth2クライアントの情報を取得します。
   * 詳細情報の取得には対象のクライアントの管理権限が必要です。
   *
   * Endpoint: GET /clients/{clientId}
   *
   * Tags: oauth2
   */
  getClient(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * OAuth2クライアントUUID
     */
    clientId: string;
  };
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 詳細情報を含めるかどうか
     */
    detail?: boolean;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.OAuth2Client | Traq.OAuth2ClientDetail>;

  /**
   * OAuth2クライアントを削除
   *
   * 指定したOAuth2クライアントを削除します。
   * 対象のクライアントの管理権限が必要です。正常に削除された場合、このクライアントに対する認可は全て取り消されます。
   *
   * Endpoint: DELETE /clients/{clientId}
   *
   * Tags: oauth2
   */
  deleteClient(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * OAuth2クライアントUUID
     */
    clientId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * OAuth2クライアント情報を変更
   *
   * 指定したOAuth2クライアントの情報を変更します。
   * 対象のクライアントの管理権限が必要です。
   * クライアント開発者UUIDを変更した場合は、変更先ユーザーにクライアント管理権限が移譲され、自分自身は権限を失います。
   *
   * Endpoint: PATCH /clients/{clientId}
   *
   * Tags: oauth2
   */
  editClient(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * OAuth2クライアントUUID
     */
    clientId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PatchClientRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * OAuthクライアントのトークンを削除
   *
   * 自分が許可している指定したOAuthクライアントのアクセストークンを全てRevokeします。
   *
   * Endpoint: DELETE /clients/{clientId}/tokens
   *
   * Tags: oauth2
   */
  revokeClientTokens(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * OAuth2クライアントUUID
     */
    clientId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * OAuth2クライアントのリストを取得
   *
   * 自身が開発者のOAuth2クライアントのリストを取得します。
   * `all`が`true`の場合、全開発者の全クライアントのリストを返します。
   *
   * Endpoint: GET /clients
   *
   * Tags: oauth2
   */
  getClients(input?: {
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 全てのクライアントを取得するかどうか
     */
    all?: boolean;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.OAuth2Client[]>;

  /**
   * OAuth2クライアントを作成
   *
   * OAuth2クライアントを作成します。
   *
   * Endpoint: POST /clients
   *
   * Tags: oauth2
   */
  createClient(input?: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostClientRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.OAuth2ClientDetail>;

  /**
   * BOTを作成
   *
   * BOTを作成します。
   * 作成後に購読イベントの設定を行う必要があります。
   * さらにHTTP Modeの場合はアクティベーションを行う必要があります。
   *
   * Endpoint: POST /bots
   *
   * Tags: bot
   */
  createBot(input?: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostBotRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.BotDetail>;

  /**
   * BOTリストを取得
   *
   * BOT情報のリストを取得します。
   * allを指定しない場合、自分が開発者のBOTのみを返します。
   *
   * Endpoint: GET /bots
   *
   * Tags: bot
   */
  getBots(input?: {
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 全てのBOTを取得するかどうか
     */
    all?: boolean;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Bot[]>;

  /**
   * WebSocket Mode BOT用通知ストリームに接続します
   *
   * # BOT WebSocketプロトコル
   *
   * ## 送信
   *
   * `コマンド:引数1:引数2:...` のような形式のTextMessageをサーバーに送信することで、このWebSocketセッションに対する設定が実行できます。
   *
   * ### `rtcstate`コマンド
   * 自分のWebRTC状態を変更します。
   * 他のコネクションが既に状態を保持している場合、変更することができません。
   *
   * `rtcstate:{チャンネルID}:({状態}:{セッションID})*`
   *
   * チャンネルIDにnullもしくは空文字を指定するか、状態にnullもしくは空文字を指定した場合、WebRTC状態はリセットされます。
   *
   * `rtcstate:null`, `rtcstate:`, `rtcstate:channelId:null`, `rtcstate:channelId:`
   *
   * コネクションが切断された場合、自分のWebRTC状態はリセットされます。
   *
   * ## 受信
   *
   * TextMessageとして各種イベントが`type`、`reqId`、`body`を持つJSONとして非同期に送られます。
   * `body`の内容はHTTP Modeの場合のRequest Bodyと同様です。
   * 例外として`ERROR`イベントは`reqId`を持ちません。
   *
   * 例: PINGイベント
   * `{"type":"PING","reqId":"requestId","body":{"eventTime":"2019-05-07T04:50:48.582586882Z"}}`
   *
   * ### `ERROR`
   *
   * コマンドの引数が不正などの理由でコマンドが受理されなかった場合に送られます。
   * 非同期に送られるため、必ずしもコマンドとの対応関係を確定できないことに注意してください。
   * 本番環境ではERRORが送られないようにすることが望ましいです。
   *
   * `{"type":"ERROR","body":"message"}`
   *
   * Endpoint: GET /bots/ws
   *
   * Tags: bot
   */
  connectBotWS(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * BOTのアイコン画像を取得
   *
   * 指定したBOTのアイコン画像を取得を取得します。
   *
   * Endpoint: GET /bots/{botId}/icon
   *
   * Tags: bot
   */
  getBotIcon(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * BOTUUID
     */
    botId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /**
   * BOTのアイコン画像を変更
   *
   * 指定したBOTのアイコン画像を変更を変更します。
   * 対象のBOTの管理権限が必要です。
   *
   * Endpoint: PUT /bots/{botId}/icon
   *
   * Tags: bot
   */
  changeBotIcon(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * BOTUUID
     */
    botId: string;
  };
  /**
   * リクエスト body です。Content-Type: multipart/form-data.
   */
  body?: Traq.PutUserIconRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * BOT情報を取得
   *
   * 指定したBOTのBOT情報を取得します。
   * BOT詳細情報を取得する場合は、対象のBOTの管理権限が必要です。
   *
   * Endpoint: GET /bots/{botId}
   *
   * Tags: bot
   */
  getBot(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * BOTUUID
     */
    botId: string;
  };
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 詳細情報を含めるかどうか
     */
    detail?: boolean;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Bot | Traq.BotDetail>;

  /**
   * BOTを削除
   *
   * 指定したBOTを削除します。
   * 対象のBOTの管理権限が必要です。
   *
   * Endpoint: DELETE /bots/{botId}
   *
   * Tags: bot
   */
  deleteBot(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * BOTUUID
     */
    botId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * BOT情報を変更
   *
   * 指定したBOTの情報を変更します。
   * 対象のBOTの管理権限が必要です。
   * BOT開発者UUIDを変更した場合は、変更先ユーザーにBOT管理権限が移譲され、自分自身は権限を失います。
   *
   * Endpoint: PATCH /bots/{botId}
   *
   * Tags: bot
   */
  editBot(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * BOTUUID
     */
    botId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PatchBotRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * BOTをアクティベート
   *
   * 指定したBOTを有効化します。
   * 対象のBOTの管理権限が必要です。
   *
   * Endpoint: POST /bots/{botId}/actions/activate
   *
   * Tags: bot
   */
  activateBot(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * BOTUUID
     */
    botId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * BOTをインアクティベート
   *
   * 指定したBOTを無効化します。対象のBOTの管理権限が必要です。
   *
   * Endpoint: POST /bots/{botId}/actions/inactivate
   *
   * Tags: bot
   */
  inactivateBot(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * BOTUUID
     */
    botId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * BOTのトークンを再発行
   *
   * 指定したBOTの現在の各種トークンを無効化し、再発行を行います。
   * 対象のBOTの管理権限が必要です。
   *
   * Endpoint: POST /bots/{botId}/actions/reissue
   *
   * Tags: bot
   */
  reissueBot(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * BOTUUID
     */
    botId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.BotTokens>;

  /**
   * BOTのイベントログを取得
   *
   * 指定したBOTのイベントログを取得します。
   * 対象のBOTの管理権限が必要です。
   *
   * Endpoint: GET /bots/{botId}/logs
   *
   * Tags: bot
   */
  getBotLogs(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * BOTUUID
     */
    botId: string;
  };
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 取得する件数
     */
    limit?: number;
    /**
     * 取得するオフセット
     */
    offset?: number;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.BotEventLog[]>;

  /**
   * BOTをチャンネルに参加させる
   *
   * 指定したBOTを指定したチャンネルに参加させます。
   * チャンネルに参加したBOTは、そのチャンネルの各種イベントを受け取るようになります。
   * 対象のBOTの管理権限が必要です。
   *
   * Endpoint: POST /bots/{botId}/actions/join
   *
   * Tags: bot
   */
  letBotJoinChannel(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * BOTUUID
     */
    botId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostBotActionJoinRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * BOTをチャンネルから退出させる
   *
   * 指定したBOTを指定したチャンネルから退出させます。
   * 対象のBOTの管理権限が必要です。
   *
   * Endpoint: POST /bots/{botId}/actions/leave
   *
   * Tags: bot
   */
  letBotLeaveChannel(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * BOTUUID
     */
    botId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostBotActionLeaveRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * チャンネル参加中のBOTのリストを取得
   *
   * 指定したチャンネルに参加しているBOTのリストを取得します。
   *
   * Endpoint: GET /channels/{channelId}/bots
   *
   * Tags: bot, channel
   */
  getChannelBots(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.BotUser[]>;

  /**
   * Skyway用認証API
   *
   * Skyway WebRTC用の認証API
   *
   * Endpoint: POST /webrtc/authenticate
   *
   * Tags: webrtc
   */
  postWebRTCAuthenticate(input?: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostWebRTCAuthenticateRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.WebRTCAuthenticateResult>;

  /**
   * チャンネル情報を取得
   *
   * 指定したチャンネルの情報を取得します。
   *
   * Endpoint: GET /channels/{channelId}
   *
   * Tags: channel
   */
  getChannel(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Channel>;

  /**
   * チャンネル情報を変更
   *
   * 指定したチャンネルの情報を変更します。
   * 変更には権限が必要です。
   * ルートチャンネルに移動させる場合は、`parent`に`00000000-0000-0000-0000-000000000000`を指定してください。
   *
   * Endpoint: PATCH /channels/{channelId}
   *
   * Tags: channel
   */
  editChannel(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PatchChannelRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * WebRTC状態を取得
   *
   * 現在のWebRTC状態を取得します。
   *
   * Endpoint: GET /webrtc/state
   *
   * Tags: webrtc
   */
  getWebRTCState(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.WebRTCUserStates>;

  /**
   * クリップフォルダを作成
   *
   * クリップフォルダを作成します。
   * 既にあるフォルダと同名のフォルダを作成することは可能です。
   *
   * Endpoint: POST /clip-folders
   *
   * Tags: clip
   */
  createClipFolder(input?: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostClipFolderRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.ClipFolder>;

  /**
   * クリップフォルダのリストを取得
   *
   * 自身が所有するクリップフォルダのリストを取得します。
   *
   * Endpoint: GET /clip-folders
   *
   * Tags: clip
   */
  getClipFolders(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.ClipFolder[]>;

  /**
   * クリップフォルダ情報を取得
   *
   * 指定したクリップフォルダの情報を取得します。
   *
   * Endpoint: GET /clip-folders/{folderId}
   *
   * Tags: clip
   */
  getClipFolder(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * クリップフォルダUUID
     */
    folderId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.ClipFolder>;

  /**
   * クリップフォルダを削除
   *
   * 指定したクリップフォルダを削除します。
   *
   * Endpoint: DELETE /clip-folders/{folderId}
   *
   * Tags: clip
   */
  deleteClipFolder(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * クリップフォルダUUID
     */
    folderId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * クリップフォルダ情報を編集
   *
   * 指定したクリップフォルダの情報を編集します。
   *
   * Endpoint: PATCH /clip-folders/{folderId}
   *
   * Tags: clip
   */
  editClipFolder(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * クリップフォルダUUID
     */
    folderId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PatchClipFolderRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * メッセージをクリップフォルダに追加
   *
   * 指定したメッセージを指定したクリップフォルダに追加します。
   *
   * Endpoint: POST /clip-folders/{folderId}/messages
   *
   * Tags: clip
   */
  clipMessage(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * クリップフォルダUUID
     */
    folderId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostClipFolderMessageRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.ClippedMessage>;

  /**
   * フォルダ内のクリップのリストを取得
   *
   * 指定したフォルダ内のクリップのリストを取得します。
   * `order`を指定しない場合、クリップした日時の新しい順で返されます。
   *
   * Endpoint: GET /clip-folders/{folderId}/messages
   *
   * Tags: clip
   */
  getClips(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * クリップフォルダUUID
     */
    folderId: string;
  };
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 取得する件数
     */
    limit?: number;
    /**
     * 取得するオフセット
     */
    offset?: number;
    /**
     * 昇順か降順か
     */
    order?: "asc" | "desc";
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.ClippedMessage[]>;

  /**
   * メッセージをクリップフォルダから除外
   *
   * 指定したフォルダから指定したメッセージのクリップを除外します。
   * 既に外されているメッセージを指定した場合は204を返します。
   *
   * Endpoint: DELETE /clip-folders/{folderId}/messages/{messageId}
   *
   * Tags: clip
   */
  unclipMessage(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * クリップフォルダUUID
     */
    folderId: string;
    /**
     * メッセージUUID
     */
    messageId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * Webhookの投稿メッセージのリストを取得
   *
   * 指定されたWebhookが投稿したメッセージのリストを返します。
   *
   * Endpoint: GET /webhooks/{webhookId}/messages
   *
   * Tags: webhook
   */
  getWebhookMessages(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * WebhookUUID
     */
    webhookId: string;
  };
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 取得する件数
     */
    limit?: number;
    /**
     * 取得するオフセット
     */
    offset?: number;
    /**
     * 取得する時間範囲の開始日時
     */
    since?: string;
    /**
     * 取得する時間範囲の終了日時
     */
    until?: string;
    /**
     * 範囲の端を含めるかどうか
     */
    inclusive?: boolean;
    /**
     * 昇順か降順か
     */
    order?: "asc" | "desc";
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Message[]>;

  /**
   * Webhookの投稿メッセージを削除
   *
   * 指定されたWebhookが投稿したメッセージを削除します。
   *
   * Endpoint: DELETE /webhooks/{webhookId}/messages/{messageId}
   *
   * Tags: webhook
   */
  DeleteWebhookMessage(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * WebhookUUID
     */
    webhookId: string;
    /**
     * メッセージUUID
     */
    messageId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * チャンネルイベントのリストを取得
   *
   * 指定したチャンネルのイベントリストを取得します。
   *
   * Endpoint: GET /channels/{channelId}/events
   *
   * Tags: channel
   */
  getChannelEvents(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * 取得する件数
     */
    limit?: number;
    /**
     * 取得するオフセット
     */
    offset?: number;
    /**
     * 取得する時間範囲の開始日時
     */
    since?: string;
    /**
     * 取得する時間範囲の終了日時
     */
    until?: string;
    /**
     * 範囲の端を含めるかどうか
     */
    inclusive?: boolean;
    /**
     * 昇順か降順か
     */
    order?: "asc" | "desc";
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.ChannelEvent[]>;

  /**
   * スタンプパレットのリストを取得
   *
   * 自身が所有しているスタンプパレットのリストを取得します。
   *
   * Endpoint: GET /stamp-palettes
   *
   * Tags: stamp
   */
  getStampPalettes(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.StampPalette[]>;

  /**
   * スタンプパレットを作成
   *
   * スタンプパレットを作成します。
   *
   * Endpoint: POST /stamp-palettes
   *
   * Tags: stamp
   */
  createStampPalette(input?: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostStampPaletteRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.StampPalette>;

  /**
   * スタンプパレットを取得
   *
   * 指定したスタンプパレットの情報を取得します。
   *
   * Endpoint: GET /stamp-palettes/{paletteId}
   *
   * Tags: stamp
   */
  getStampPalette(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * スタンプパレットUUID
     */
    paletteId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.StampPalette>;

  /**
   * スタンプパレットを削除
   *
   * 指定したスタンプパレットを削除します。
   * 対象のスタンプパレットの管理権限が必要です。
   *
   * Endpoint: DELETE /stamp-palettes/{paletteId}
   *
   * Tags: stamp
   */
  deleteStampPalette(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * スタンプパレットUUID
     */
    paletteId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * スタンプパレットを編集
   *
   * 指定したスタンプパレットを編集します。
   * リクエストのスタンプの配列の順番は保存されて変更されます。
   * 対象のスタンプパレットの管理権限が必要です。
   *
   * Endpoint: PATCH /stamp-palettes/{paletteId}
   *
   * Tags: stamp
   */
  editStampPalette(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * スタンプパレットUUID
     */
    paletteId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PatchStampPaletteRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * オンラインユーザーリストを取得
   *
   * 現在オンラインな(SSEまたはWSが接続中)ユーザーのUUIDのリストを返します。
   *
   * Endpoint: GET /activity/onlines
   *
   * Tags: activity
   */
  getOnlineUsers(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<string[]>;

  /**
   * スタンプ画像を取得
   *
   * 指定したIDのスタンプ画像を返します。
   *
   * Endpoint: GET /stamps/{stampId}/image
   *
   * Tags: stamp
   */
  getStampImage(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * スタンプUUID
     */
    stampId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /**
   * スタンプ画像を変更
   *
   * 指定したスタンプの画像を変更します。
   *
   * Endpoint: PUT /stamps/{stampId}/image
   *
   * Tags: stamp
   */
  changeStampImage(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * スタンプUUID
     */
    stampId: string;
  };
  /**
   * リクエスト body です。Content-Type: multipart/form-data.
   */
  body?: {
  /**
   * スタンプ画像(1MBまでのpng, jpeg, gif)
   */
  file: Blob;
};
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * チャンネルを既読にする
   *
   * 自分が未読のチャンネルを既読にします。
   *
   * Endpoint: DELETE /users/me/unread/{channelId}
   *
   * Tags: me, notification
   */
  readChannel(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * グループ管理者を削除
   *
   * 指定したユーザーグループから指定した管理者を削除します。
   * 対象のユーザーグループの管理者権限が必要です。
   * グループから管理者が存在しなくなる場合は400エラーを返します。
   *
   * Endpoint: DELETE /groups/{groupId}/admins/{userId}
   *
   * Tags: group
   */
  removeUserGroupAdmin(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーグループUUID
     */
    groupId: string;
    /**
     * ユーザーUUID
     */
    userId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * グループ管理者を追加
   *
   * 指定したグループに管理者を追加します。
   * 対象のユーザーグループの管理者権限が必要です。
   *
   * Endpoint: POST /groups/{groupId}/admins
   *
   * Tags: group
   */
  addUserGroupAdmin(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーグループUUID
     */
    groupId: string;
  };
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostUserGroupAdminRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * グループ管理者を取得
   *
   * 指定したグループの管理者のリストを取得します。
   *
   * Endpoint: GET /groups/{groupId}/admins
   *
   * Tags: group
   */
  getUserGroupAdmins(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ユーザーグループUUID
     */
    groupId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<string[]>;

  /**
   * OAuth2 トークンエンドポイント
   *
   * Endpoint: POST /oauth2/token
   *
   * Tags: oauth2
   */
  postOAuth2Token(input: {
  /**
   * リクエスト body です。Content-Type: application/x-www-form-urlencoded.
   */
  body: Traq.PostOAuth2Token;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.OAuth2Token>;

  /**
   * OAuth2 認可承諾API
   *
   * OAuth2 認可承諾
   *
   * Endpoint: POST /oauth2/authorize/decide
   *
   * Tags: oauth2
   */
  postOAuth2AuthorizeDecide(input: {
  /**
   * リクエスト body です。Content-Type: application/x-www-form-urlencoded.
   */
  body: Traq.OAuth2Decide;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * OAuth2 認可エンドポイント
   *
   * Endpoint: GET /oauth2/authorize
   *
   * Tags: oauth2
   */
  getOAuth2Authorize(input: {
  /**
   * URL の query string として送るパラメータです。
   */
  query: {
    response_type?: Traq.OAuth2ResponseType;
    client_id: string;
    redirect_uri?: string;
    scope?: string;
    state?: string;
    code_challenge?: string;
    code_challenge_method?: string;
    nonce?: string;
    prompt?: Traq.OAuth2Prompt;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * OAuth2 認可エンドポイント
   *
   * Endpoint: POST /oauth2/authorize
   *
   * Tags: oauth2
   */
  postOAuth2Authorize(input: {
  /**
   * リクエスト body です。Content-Type: application/x-www-form-urlencoded.
   */
  body: Traq.OAuth2Authorization;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * OAuth2 トークン無効化エンドポイント
   *
   * Endpoint: POST /oauth2/revoke
   *
   * Tags: oauth2
   */
  revokeOAuth2Token(input: {
  /**
   * リクエスト body です。Content-Type: application/x-www-form-urlencoded.
   */
  body: Traq.OAuth2Revoke;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * 外部ログインアカウント一覧を取得
   *
   * 自分に紐付けられている外部ログインアカウント一覧を取得します。
   *
   * Endpoint: GET /users/me/ex-accounts
   *
   * Tags: authentication, me
   */
  getMyExternalAccounts(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.ExternalProviderUser[]>;

  /**
   * 外部ログインアカウントを紐付ける
   *
   * 自分に外部ログインアカウントを紐付けます。
   * 指定した`providerName`がサーバー側で有効である必要があります。
   * リクエストが受理された場合、外部サービスの認証画面にリダイレクトされ、認証される必要があります。
   *
   * Endpoint: POST /users/me/ex-accounts/link
   *
   * Tags: authentication, me
   */
  linkExternalAccount(input?: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostLinkExternalAccount;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * 外部ログインアカウントの紐付けを解除
   *
   * 自分に紐付けられている外部ログインアカウントの紐付けを解除します。
   *
   * Endpoint: POST /users/me/ex-accounts/unlink
   *
   * Tags: authentication, me
   */
  unlinkExternalAccount(input?: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PostUnlinkExternalAccount;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * DMチャンネル情報を取得
   *
   * 指定したユーザーとのダイレクトメッセージチャンネルの情報を返します。
   * ダイレクトメッセージチャンネルが存在しなかった場合、自動的に作成されます。
   *
   * Endpoint: GET /users/{userId}/dm-channel
   *
   * Tags: user, channel
   */
  getUserDMChannel(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    userId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.DMChannel>;

  /**
   * 自分のクリップを取得
   *
   * 対象のメッセージの自分のクリップの一覧を返します。
   *
   * Endpoint: GET /messages/{messageId}/clips
   *
   * Tags: message, clip
   */
  getMessageClips(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * メッセージUUID
     */
    messageId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.MessageClip[]>;

  /**
   * OGP情報を取得
   *
   * 指定されたURLのOGP情報を取得します。
   * 指定されたURLに対するOGP情報が見つからなかった場合、typeがemptyに設定された空のOGP情報を返します。
   *
   * Endpoint: GET /ogp
   *
   * Tags: ogp
   */
  getOgp(input: {
  /**
   * URL の query string として送るパラメータです。
   */
  query: {
    /**
     * OGPを取得したいURL
     */
    url: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.Ogp>;

  /**
   * OGP情報のキャッシュを削除
   *
   * 指定されたURLのOGP情報のキャッシュを削除します。
   *
   * Endpoint: DELETE /ogp/cache
   *
   * Tags: ogp
   */
  deleteOgpCache(input: {
  /**
   * URL の query string として送るパラメータです。
   */
  query: {
    /**
     * OGPのキャッシュを削除したいURL
     */
    url: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * ユーザー設定を取得
   *
   * ユーザー設定を取得します。
   *
   * Endpoint: GET /users/me/settings
   *
   * Tags: me
   */
  getUserSettings(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserSettings>;

  /**
   * メッセージ引用通知の設定情報を取得
   *
   * メッセージ引用通知の設定情報を変更します。
   *
   * Endpoint: GET /users/me/settings/notify-citation
   *
   * Tags: me
   */
  getMyNotifyCitation(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.GetNotifyCitation>;

  /**
   * メッセージ引用通知の設定情報を変更
   *
   * メッセージ引用通知の設定情報を変更します
   *
   * Endpoint: PUT /users/me/settings/notify-citation
   *
   * Tags: me
   */
  changeMyNotifyCitation(input?: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body?: Traq.PutNotifyCitationRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * 指定したチャンネルパスを取得
   *
   * 指定されたチャンネルのパスを取得します。
   *
   * Endpoint: GET /channels/{channelId}/path
   *
   * Tags: channel
   */
  getChannelPath(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * チャンネルUUID
     */
    channelId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.ChannelPath>;

  /**
   * LiveKitエンドポイントを取得
   *
   * 接続可能なLiveKitエンドポイントを取得します。
   *
   * Endpoint: GET /qall/endpoints
   *
   * Tags: qall
   */
  getQallEndpoints(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.qallEndpointResponse>;

  /**
   * LiveKitトークンを取得
   *
   * 指定したルームに参加するためのLiveKitトークンを取得します。
   *
   * Endpoint: GET /qall/token
   *
   * Tags: qall
   */
  getLiveKitToken(input?: {
  /**
   * URL の query string として送るパラメータです。
   */
  query?: {
    /**
     * ルームUUID
     */
    roomId?: string;
    /**
     * ウェビナールームかどうか(デフォルト false)
     */
    isWebinar?: boolean;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.qallTokenResponse>;

  /**
   * ルームと参加者の一覧を取得
   *
   * 現在存在する(またはアクティブな)ルームと、そのルームに所属している参加者情報を取得します。
   *
   * Endpoint: GET /qall/rooms
   *
   * Tags: qall
   */
  getRooms(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.qallRoomsListResponse>;

  /**
   * ルームのメタデータを取得
   *
   * ルームのメタデータを取得します。
   *
   * Endpoint: GET /qall/rooms/{roomId}/metadata
   *
   * Tags: qall
   */
  getRoomMetadata(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ルームUUID
     */
    roomId: string;
  };
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.qallMetadataResponse>;

  /**
   * ルームのメタデータを更新
   *
   * ルームのメタデータを更新します。
   *
   * Endpoint: PATCH /qall/rooms/{roomId}/metadata
   *
   * Tags: qall
   */
  updateRoomMetadata(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ルームUUID
     */
    roomId: string;
  };
  /**
   * ルームのメタデータ
   *
   * リクエスト body です。Content-Type: application/json.
   */
  body: Traq.qallMetadataRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * ルームでの発言権限を変更
   *
   * ルーム内の参加者の発言権限を変更します。
   *
   * Endpoint: PATCH /qall/rooms/{roomId}/participants
   *
   * Tags: qall
   */
  changeParticipantRole(input: {
  /**
   * エンドポイント URL に埋め込む path パラメータです。
   */
  path: {
    /**
     * ルームUUID
     */
    roomId: string;
  };
  /**
   * 発言権限を変更する参加者の情報
   *
   * リクエスト body です。Content-Type: application/json.
   */
  body: Traq.qallParticipantRequest[];
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.qallParticipantResponse>;

  /**
   * LiveKit Webhook受信
   *
   * LiveKit側で設定したWebhookから呼び出されるエンドポイントです。   参加者の入室・退出などのイベントを受け取り、サーバ内で処理を行います。
   *
   * Endpoint: POST /qall/webhook
   *
   * Tags: qall
   */
  liveKitWebhook(input: {
  /**
   * LiveKit Webhook イベントのペイロード
   *
   * リクエスト body です。Content-Type: application/webhook+json.
   */
  body: {
  [key: string]: unknown;
};
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /**
   * サウンドボード用の音声一覧を取得
   *
   * DBに保存されたサウンドボード情報を取得します。   各アイテムには soundId, soundName, stampId が含まれます。
   *
   * Endpoint: GET /qall/soundboard
   *
   * Tags: qall
   */
  getSoundboardList(input?: {
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.soundboardListResponse>;

  /**
   * サウンドボード用の短い音声ファイルをアップロード
   *
   * 15秒程度の短い音声ファイルを multipart/form-data で送信し、S3(互換ストレージ)にアップロードします。   クライアントは「soundName」というフィールドを送信し、それをDBに保存して関連付けを行います。   また、サーバ側で soundId を自動生成し、S3のファイル名に使用します。
   *
   * Endpoint: POST /qall/soundboard
   *
   * Tags: qall
   */
  postSoundboard(input: {
  /**
   * リクエスト body です。Content-Type: multipart/form-data.
   */
  body: Traq.soundboardUploadRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.soundboardUploadResponse>;

  /**
   * アップロード済み音声を LiveKit ルームで再生
   *
   * S3上にある音声ファイルの署名付きURLを生成し、   Ingressを介して指定ルームに音声を流します。     該当ルームに参加しているユーザであれば再生可能とします。
   *
   * Endpoint: POST /qall/soundboard/play
   *
   * Tags: qall
   */
  postSoundboardPlay(input: {
  /**
   * リクエスト body です。Content-Type: application/json.
   */
  body: Traq.soundboardPlayRequest;
  /**
   * multipart/form-data や form-urlencoded の送信で使う追加フォーム値です。
   */
  form?: Record<string, string | Blob>;
}): Promise<Traq.soundboardPlayResponse>;
};

/**
 * ノートブックのセル内で使える小さな補助関数です。
 */
declare const util: {
  /**
   * 指定したミリ秒だけ待機します。
   */
  sleep(ms: number): Promise<void>;
  /**
   * limit/offset 形式の API を、短いページが返るまで全ページ取得します。
   *
   * callback は `{ limit, offset }` を受け取り、1ページ分の配列を返してください。
   */
  pageAll<T>(fetchPage: (params: { limit: number; offset: number }) => Promise<T[]>, pageSize?: number): Promise<T[]>;
  /**
   * 値が UUID 文字列なら true を返します。
   */
  isUuid(value: unknown): boolean;
  /**
   * 現在時刻を ISO 8601 文字列で返します。
   */
  now(): string;
};
/**
 * スラッシュ区切りの fullPath を付与した traQ チャンネルです。
 */
type TraqChannelWithFullPath = Traq.Channel & { fullPath: string };
/**
 * 現在ログインしている traQ ユーザーです。
 */
declare const me: Traq.MyUserDetail;
/**
 * ノートブック開始時に読み込んだ全ユーザーです。ユーザー名順に並んでいます。
 */
declare const users: Traq.User[];
/**
 * ノートブック開始時に読み込んだ全公開チャンネルです。各要素に `fullPath` が付きます。
 */
declare const channels: TraqChannelWithFullPath[];
/**
 * ノートブック開始時に読み込んだ全ユーザーグループです。名前順に並んでいます。
 */
declare const groups: Traq.UserGroup[];
