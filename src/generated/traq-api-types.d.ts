declare namespace Traq {
  export type Message = {
  id: string;
  userId: string;
  channelId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  stamps: Traq.MessageStamp[];
  threadId: string | null;
  nonce?: string;
};

  export type MessageStamp = {
  userId: string;
  stampId: string;
  count: number;
  createdAt: string;
  updatedAt: string;
};

  export type StampStats = {
  count: number;
  totalCount: number;
};

  export type Pin = {
  userId: string;
  pinnedAt: string;
  message: Traq.Message;
};

  export type Channel = {
  id: string;
  parentId: string | null;
  archived: boolean;
  force: boolean;
  topic: string;
  name: string;
  children: string[];
};

  export type PostMessageRequest = {
  content: string;
  embed?: boolean;
  nonce?: string;
};

  export type ChannelStats = {
  totalMessageCount: number;
  stamps: Traq.ChannelStatsStamp[];
  users: Traq.ChannelStatsUser[];
  datetime: string;
};

  export type ChannelStatsStamp = {
  id: string;
  count: number;
  total: number;
};

  export type ChannelStatsUser = {
  id: string;
  messageCount: number;
};

  export type ChannelTopic = {
  topic: string;
};

  export type PutChannelTopicRequest = {
  topic: string;
};

  export type ChannelViewer = {
  userId: string;
  state: Traq.ChannelViewState;
  updatedAt: string;
};

  export type MyChannelViewState = {
  key: string;
  channelId: string;
  state: Traq.ChannelViewState;
};

  export type ChannelViewState = "none" | "stale_viewing" | "monitoring" | "editing";

  export type PostFileRequest = {
  file: Blob;
  channelId: string;
};

  export type ThumbnailType = "image" | "waveform";

  export type ThumbnailInfo = {
  type: Traq.ThumbnailType;
  mime: string;
  width?: number;
  height?: number;
};

  export type FileInfo = {
  id: string;
  name: string;
  mime: string;
  size: number;
  md5: string;
  isAnimatedImage: boolean;
  createdAt: string;
  thumbnails: Traq.ThumbnailInfo[];
  thumbnail: {
  mime: string;
  width?: number;
  height?: number;
} | null;
  channelId: string | null;
  uploaderId: string | null;
};

  export type PostMessageStampRequest = {
  count: number;
};

  export type Stamp = {
  id: string;
  name: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  fileId: string;
  isUnicode: boolean;
};

  export type PostStampRequest = {
  name: string;
  file: Blob;
};

  export type StampHistoryEntry = {
  stampId: string;
  datetime: string;
};

  export type StampWithThumbnail = {
  id: string;
  name: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  fileId: string;
  isUnicode: boolean;
  hasThumbnail: boolean;
};

  export type User = {
  id: string;
  name: string;
  displayName: string;
  iconFileId: string;
  bot: boolean;
  state: Traq.UserAccountState;
  updatedAt: string;
};

  export type UserDetail = {
  id: string;
  state: Traq.UserAccountState;
  bot: boolean;
  iconFileId: string;
  displayName: string;
  name: string;
  twitterId: string;
  lastOnline: string | null;
  updatedAt: string;
  tags: Traq.UserTag[];
  groups: string[];
  bio: string;
  homeChannel: string | null;
};

  export type UserTag = {
  tagId: string;
  tag: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
};

  export type UserAccountState = 0 | 1 | 2;

  export type UserGroup = {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: string;
  members: Traq.UserGroupMember[];
  createdAt: string;
  updatedAt: string;
  admins: string[];
};

  export type UserGroupMember = {
  id: string;
  role: string;
};

  export type UserGroupMembers = Traq.UserGroupMember[];

  export type UserStats = {
  totalMessageCount: number;
  stamps: Traq.UserStatsStamp[];
  datetime: string;
};

  export type UserStatsStamp = {
  id: string;
  count: number;
  total: number;
};

  export type PatchGroupMemberRequest = {
  role: string;
};

  export type PatchUserGroupRequest = {
  name?: string;
  description?: string;
  type?: string;
};

  export type PostUserGroupRequest = {
  name: string;
  description: string;
  type: string;
};

  export type MyUserDetail = {
  id: string;
  bio: string;
  groups: string[];
  tags: Traq.UserTag[];
  updatedAt: string;
  lastOnline: string | null;
  twitterId: string;
  name: string;
  displayName: string;
  iconFileId: string;
  bot: boolean;
  state: Traq.UserAccountState;
  permissions: Traq.UserPermission[];
  homeChannel: string | null;
};

  export type OIDCUserInfo = {
  sub: string;
  name: string;
  preferred_username: string;
  picture: string;
  updated_at?: number;
  traq?: Traq.OIDCTraqUserInfo;
};

  export type OIDCTraqUserInfo = {
  bio: string;
  groups: string[];
  tags: Traq.UserTag[];
  last_online: string | null;
  twitter_id: string;
  display_name: string;
  icon_file_id: string;
  bot: boolean;
  state: Traq.UserAccountState;
  permissions: Traq.UserPermission[];
  home_channel: string | null;
};

  export type PatchChannelSubscribersRequest = {
  on?: string[];
  off?: string[];
};

  export type PutChannelSubscribersRequest = {
  on: string[];
};

  export type UserSubscribeState = {
  channelId: string;
  level: Traq.ChannelSubscribeLevel;
};

  export type ChannelSubscribeLevel = 0 | 1 | 2;

  export type PutChannelSubscribeLevelRequest = {
  level: Traq.ChannelSubscribeLevel;
};

  export type Webhook = {
  id: string;
  botUserId: string;
  displayName: string;
  description: string;
  secure: boolean;
  channelId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

  export type PatchWebhookRequest = {
  name?: string;
  description?: string;
  channelId?: string;
  secret?: string;
  ownerId?: string;
};

  export type PostWebhookRequest = {
  name: string;
  description: string;
  channelId: string;
  secret: string;
};

  export type PutUserIconRequest = {
  file: Blob;
};

  export type PutMyPasswordRequest = {
  password: string;
  newPassword: string;
};

  export type PatchMeRequest = {
  displayName?: string;
  twitterId?: string;
  bio?: string;
  homeChannel?: string;
};

  export type PutUserPasswordRequest = {
  newPassword: string;
};

  export type PatchUserRequest = {
  displayName?: string;
  twitterId?: string;
  state?: Traq.UserAccountState;
  role?: string;
};

  export type PostMyFCMDeviceRequest = {
  token: string;
};

  export type PostUserRequest = {
  name: string;
  password?: string;
};

  export type PostChannelRequest = {
  name: string;
  parent: string | null;
};

  export type PostUserTagRequest = {
  tag: string;
};

  export type PatchUserTagRequest = {
  isLocked: boolean;
};

  export type Tag = {
  id: string;
  tag: string;
  users: string[];
};

  export type PostStarRequest = {
  channelId: string;
};

  export type UnreadChannel = {
  channelId: string;
  count: number;
  noticeable: boolean;
  since: string;
  updatedAt: string;
  oldestMessageId: string;
};

  export type PostLoginRequest = {
  name: string;
  password: string;
};

  export type LoginSession = {
  id: string;
  issuedAt: string;
};

  export type ActiveOAuth2Token = {
  id: string;
  clientId: string;
  scopes: Traq.OAuth2Scope[];
  issuedAt: string;
};

  export type OAuth2Scope = "openid" | "profile" | "read" | "write" | "manage_bot";

  export type OAuth2Client = {
  id: string;
  name: string;
  description: string;
  developerId: string;
  scopes: Traq.OAuth2Scope[];
  confidential: boolean;
};

  export type PatchClientRequest = {
  name?: string;
  description?: string;
  callbackUrl?: string;
  developerId?: string;
  confidential?: boolean;
};

  export type OAuth2ClientDetail = {
  id: string;
  developerId: string;
  description: string;
  name: string;
  scopes: Traq.OAuth2Scope[];
  callbackUrl: string;
  secret: string;
  confidential: boolean;
};

  export type PostClientRequest = {
  name: string;
  callbackUrl: string;
  scopes: Traq.OAuth2Scope[];
  description: string;
  confidential?: boolean;
};

  export type BotMode = "HTTP" | "WebSocket";

  export type BotState = 0 | 1 | 2;

  export type Bot = {
  id: string;
  botUserId: string;
  description: string;
  developerId: string;
  subscribeEvents: string[];
  mode: Traq.BotMode;
  state: Traq.BotState;
  createdAt: string;
  updatedAt: string;
};

  export type PatchBotRequest = {
  displayName?: string;
  description?: string;
  privileged?: boolean;
  mode?: Traq.BotMode;
  endpoint?: string;
  developerId?: string;
  subscribeEvents?: string[];
  bio?: string;
};

  export type BotTokens = {
  verificationToken: string;
  accessToken: string;
};

  export type BotDetail = {
  id: string;
  updatedAt: string;
  createdAt: string;
  mode: Traq.BotMode;
  state: Traq.BotState;
  subscribeEvents: string[];
  developerId: string;
  description: string;
  botUserId: string;
  tokens: Traq.BotTokens;
  endpoint: string;
  privileged: boolean;
  channels: string[];
};

  export type BotEventLog = {
  botId: string;
  requestId: string;
  event: string;
  result?: Traq.BotEventResult;
  code: number;
  datetime: string;
};

  export type BotEventResult = "ok" | "ng" | "ne" | "dp";

  export type PostBotRequest = {
  name: string;
  displayName: string;
  description: string;
  mode: Traq.BotMode;
  endpoint?: string;
};

  export type PostBotActionJoinRequest = {
  channelId: string;
};

  export type PostBotActionLeaveRequest = {
  channelId: string;
};

  export type BotUser = {
  id: string;
  botUserId: string;
};

  export type PostWebRTCAuthenticateRequest = {
  peerId: string;
};

  export type WebRTCAuthenticateResult = {
  peerId: string;
  ttl: number;
  timestamp: number;
  authToken: string;
};

  export type PatchChannelRequest = {
  name?: string;
  archived?: boolean;
  force?: boolean;
  parent?: string;
};

  export type WebRTCUserStates = Traq.WebRTCUserState[];

  export type ClipFolder = {
  id: string;
  name: string;
  createdAt: string;
  ownerId: string;
  description: string;
};

  export type PatchClipFolderRequest = {
  name?: string;
  description?: string;
};

  export type PostClipFolderRequest = {
  name: string;
  description: string;
};

  export type PostClipFolderMessageRequest = {
  messageId: string;
};

  export type ClippedMessage = {
  message: Traq.Message;
  clippedAt: string;
};

  export type ChannelEvent = {
  type: "TopicChanged" | "SubscribersChanged" | "PinAdded" | "PinRemoved" | "NameChanged" | "ParentChanged" | "VisibilityChanged" | "ForcedNotificationChanged" | "ChildCreated";
  datetime: string;
  detail: Traq.TopicChangedEvent | Traq.SubscribersChangedEvent | Traq.PinAddedEvent | Traq.PinRemovedEvent | Traq.NameChangedEvent | Traq.ParentChangedEvent | Traq.VisibilityChangedEvent | Traq.ForcedNotificationChangedEvent | Traq.ChildCreatedEvent;
};

  export type TopicChangedEvent = {
  userId: string;
  before: string;
  after: string;
};

  export type SubscribersChangedEvent = {
  userId: string;
  on: string[];
  off: string[];
};

  export type PinAddedEvent = {
  userId: string;
  messageId: string;
};

  export type PinRemovedEvent = {
  userId: string;
  messageId: string;
};

  export type NameChangedEvent = {
  userId: string;
  before: string;
  after: string;
};

  export type ParentChangedEvent = {
  userId: string;
  before: string;
  after: string;
};

  export type VisibilityChangedEvent = {
  userId: string;
  visibility: boolean;
};

  export type ForcedNotificationChangedEvent = {
  userId: string;
  force: boolean;
};

  export type ChildCreatedEvent = {
  userId: string;
  channelId: string;
};

  export type QallRoomStateChangedEvent = {
  roomStates: {
  roomId: string;
  participants: {
  identity: string;
  name: string;
  joinedAt: string;
  attributes?: {
  [key: string]: string;
};
  canPublish: boolean;
}[];
  isWebinar: boolean;
  metadata?: string;
}[];
};

  export type QallSoundboardItemCreatedEvent = {
  soundId: string;
  name: string;
  creatorId: string;
};

  export type QallSoundboardItemDeletedEvent = {
  soundId: string;
};

  export type StampPalette = {
  id: string;
  name: string;
  stamps: string[];
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  description: string;
};

  export type PostStampPaletteRequest = {
  stamps: string[];
  name: string;
  description: string;
};

  export type PatchStampPaletteRequest = {
  name?: string;
  description?: string;
  stamps?: string[];
};

  export type PatchStampRequest = {
  name?: string;
  creatorId?: string;
};

  export type MessagePin = {
  userId: string;
  pinnedAt: string;
};

  export type PostUserGroupAdminRequest = {
  id: string;
};

  export type ChannelList = {
  public: Traq.Channel[];
  dm?: Traq.DMChannel[];
};

  export type DMChannel = {
  id: string;
  userId: string;
};

  export type ActivityTimelineMessage = {
  id: string;
  userId: string;
  channelId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

  export type OAuth2Decide = {
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

  export type OAuth2Revoke = {
  token: string;
};

  export type ExternalProviderUser = {
  providerName: string;
  linkedAt: string;
  externalName: string;
};

  export type PostLinkExternalAccount = {
  providerName: string;
};

  export type PostUnlinkExternalAccount = {
  providerName: string;
};

  export type UserPermission = "get_webhook" | "create_webhook" | "edit_webhook" | "delete_webhook" | "access_others_webhook" | "get_bot" | "create_bot" | "edit_bot" | "delete_bot" | "access_others_bot" | "bot_action_join_channel" | "bot_action_leave_channel" | "create_channel" | "get_channel" | "edit_channel" | "delete_channel" | "change_parent_channel" | "edit_channel_topic" | "get_channel_star" | "edit_channel_star" | "get_my_tokens" | "revoke_my_token" | "get_clients" | "create_client" | "edit_my_client" | "delete_my_client" | "manage_others_client" | "upload_file" | "download_file" | "delete_file" | "get_message" | "post_message" | "edit_message" | "delete_message" | "report_message" | "get_message_reports" | "create_message_pin" | "delete_message_pin" | "get_channel_subscription" | "edit_channel_subscription" | "connect_notification_stream" | "register_fcm_device" | "get_stamp" | "create_stamp" | "edit_stamp" | "edit_stamp_created_by_others" | "delete_stamp" | "delete_my_stamp" | "add_message_stamp" | "remove_message_stamp" | "get_my_stamp_history" | "get_my_stamp_recommendations" | "get_stamp_palette" | "create_stamp_palette" | "edit_stamp_palette" | "delete_stamp_palette" | "get_user" | "register_user" | "get_me" | "get_oidc_userinfo" | "edit_me" | "change_my_icon" | "change_my_password" | "edit_other_users" | "get_user_qr_code" | "get_user_tag" | "edit_user_tag" | "get_user_group" | "create_user_group" | "create_special_user_group" | "edit_user_group" | "delete_user_group" | "edit_others_user_group" | "web_rtc" | "get_my_sessions" | "delete_my_sessions" | "get_my_external_account" | "edit_my_external_account" | "get_unread" | "delete_unread" | "get_clip_folder" | "create_clip_folder" | "edit_clip_folder" | "delete_clip_folder";

  export type Version = {
  revision: string;
  version: string;
  flags: {
  externalLogin: string[];
  signUpAllowed: boolean;
};
};

  export type WebRTCUserState = {
  userId: string;
  channelId: string;
  sessions: Traq.Session[];
};

  export type MessageClip = {
  folderId: string;
  clippedAt: string;
};

  export type Ogp = {
  type: string;
  title: string;
  url: string;
  images: Traq.OgpMedia[];
  description: string;
  videos: Traq.OgpMedia[];
};

  export type OgpMedia = {
  url: string;
  secureUrl: string | null;
  type: string | null;
  width: number | null;
  height: number | null;
};

  export type GetNotifyCitation = {
  notifyCitation: boolean;
};

  export type UserSettings = {
  id: string;
  notifyCitation: boolean;
};

  export type PutNotifyCitationRequest = {
  notifyCitation: boolean;
};

  export type ChannelPath = {
  path: string;
};

  export type Session = {
  state: string;
  sessionId: string;
};

  export type soundboardPlayResponse = {
  ingressId: string;
  url?: string;
  streamKey?: string;
};

  export type qallEndpointResponse = {
  endpoint: string;
};

  export type soundboardListResponse = Traq.soundboardItem[];

  export type soundboardItem = {
  soundId: string;
  soundName: string;
  stampId: string;
  creatorId: string;
};

  export type soundboardUploadResponse = {
  soundId: string;
};

  export type qallRoomsListResponse = Traq.qallRoomWithParticipants[];

  export type qallTokenResponse = {
  token: string;
};

  export type qallRoomWithParticipants = {
  roomId: string;
  participants: Traq.qallParticipant[];
  isWebinar?: boolean;
  metadata?: string;
};

  export type qallParticipant = {
  identity?: string;
  name?: string;
  joinedAt?: string;
  attributes?: {
  [key: string]: string;
};
  canPublish?: boolean;
};

  export type qallParticipantRequest = {
  users: {
  userId?: string;
  canPublish?: boolean;
}[];
};

  export type qallMetadataRequest = {
  metadata?: string;
};

  export type qallMetadataResponse = {
  metadata?: string;
};

  export type qallParticipantResponse = {
  results?: {
  participantId?: string;
  status?: string;
  errorMessage?: string;
}[];
};

  export type soundboardUploadRequest = {
  audio: Blob;
  soundName: string;
  stampId?: string;
};

  export type soundboardPlayRequest = {
  soundId: string;
  roomName: string;
};
}

declare const api: {
  /** チャンネルにメッセージを投稿 */
  postMessage(input: {
  path: {
    channelId: string;
  };
  body?: Traq.PostMessageRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.Message>;

  /** チャンネルメッセージのリストを取得 */
  getMessages(input: {
  path: {
    channelId: string;
  };
  query?: {
    limit?: number;
    offset?: number;
    since?: string;
    until?: string;
    inclusive?: boolean;
    order?: "asc" | "desc";
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.Message[]>;

  /** メッセージを検索 */
  searchMessages(input?: {
  query?: {
    word?: string;
    after?: string;
    before?: string;
    in?: string;
    to?: string[];
    from?: string[];
    citation?: string;
    bot?: boolean;
    hasURL?: boolean;
    hasAttachments?: boolean;
    hasImage?: boolean;
    hasVideo?: boolean;
    hasAudio?: boolean;
    limit?: number;
    offset?: number;
    sort?: "createdAt" | "-createdAt" | "updatedAt" | "-updatedAt";
  };
  form?: Record<string, string | Blob>;
}): Promise<{
  totalHits: number;
  hits: Traq.Message[];
}>;

  /** メッセージを取得 */
  getMessage(input: {
  path: {
    messageId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.Message>;

  /** メッセージを編集 */
  editMessage(input: {
  path: {
    messageId: string;
  };
  body?: Traq.PostMessageRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** メッセージを削除 */
  deleteMessage(input: {
  path: {
    messageId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** ピン留めを取得 */
  getPin(input: {
  path: {
    messageId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.MessagePin>;

  /** ピン留めする */
  createPin(input: {
  path: {
    messageId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.MessagePin>;

  /** ピン留めを外す */
  removePin(input: {
  path: {
    messageId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** チャンネル統計情報を取得 */
  getChannelStats(input: {
  path: {
    channelId: string;
  };
  query?: {
    "exclude-deleted-messages"?: boolean;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.ChannelStats>;

  /** チャンネルトピックを取得 */
  getChannelTopic(input: {
  path: {
    channelId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.ChannelTopic>;

  /** チャンネルトピックを編集 */
  editChannelTopic(input: {
  path: {
    channelId: string;
  };
  body?: Traq.PutChannelTopicRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** チャンネル閲覧者リストを取得 */
  getChannelViewers(input: {
  path: {
    channelId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.ChannelViewer[]>;

  /** ファイルをアップロード */
  postFile(input?: {
  body?: Traq.PostFileRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.FileInfo>;

  /** ファイルメタのリストを取得 */
  getFiles(input?: {
  query?: {
    channelId?: string;
    limit?: number;
    offset?: number;
    since?: string;
    until?: string;
    inclusive?: boolean;
    order?: "asc" | "desc";
    mine?: boolean;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.FileInfo[]>;

  /** ファイルメタを取得 */
  getFileMeta(input: {
  path: {
    fileId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.FileInfo>;

  /** サムネイル画像を取得 */
  getThumbnailImage(input: {
  path: {
    fileId: string;
  };
  query?: {
    type?: Traq.ThumbnailType;
  };
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /** ファイルをダウンロード */
  getFile(input: {
  path: {
    fileId: string;
  };
  query?: {
    dl?: number;
  };
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /** ファイルを削除 */
  deleteFile(input: {
  path: {
    fileId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** チャンネルピンのリストを取得 */
  getChannelPins(input: {
  path: {
    channelId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.Pin[]>;

  /** メッセージのスタンプリストを取得 */
  getMessageStamps(input: {
  path: {
    messageId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.MessageStamp[]>;

  /** スタンプを押す */
  addMessageStamp(input: {
  path: {
    messageId: string;
    stampId: string;
  };
  body?: Traq.PostMessageStampRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** スタンプを消す */
  removeMessageStamp(input: {
  path: {
    messageId: string;
    stampId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** スタンプ情報を取得 */
  getStamp(input: {
  path: {
    stampId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.Stamp>;

  /** スタンプを削除 */
  deleteStamp(input: {
  path: {
    stampId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** スタンプ情報を変更 */
  editStamp(input: {
  path: {
    stampId: string;
  };
  body?: Traq.PatchStampRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** スタンプを作成 */
  createStamp(input?: {
  body?: Traq.PostStampRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.Stamp>;

  /** スタンプリストを取得 */
  getStamps(input?: {
  query?: {
    "include-unicode"?: boolean;
    type?: "unicode" | "original";
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.StampWithThumbnail[]>;

  /** スタンプ履歴を取得 */
  getMyStampHistory(input?: {
  query?: {
    limit?: number;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.StampHistoryEntry[]>;

  /** スタンプレコメンドを取得 */
  getMyStampRecommendations(input?: {
  query?: {
    limit?: number;
  };
  form?: Record<string, string | Blob>;
}): Promise<{
  stampId: string;
  score: number;
}[]>;

  /** QRコードを取得 */
  getMyQRCode(input?: {
  query?: {
    token?: boolean;
  };
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /** スタンプ統計情報を取得 */
  getStampStats(input: {
  path: {
    stampId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.StampStats>;

  /** ユーザー詳細情報を取得 */
  getUser(input: {
  path: {
    userId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserDetail>;

  /** ユーザー情報を変更 */
  editUser(input: {
  path: {
    userId: string;
  };
  body?: Traq.PatchUserRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** ユーザーグループを取得 */
  getUserGroup(input: {
  path: {
    groupId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserGroup>;

  /** ユーザーグループを削除 */
  deleteUserGroup(input: {
  path: {
    groupId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** ユーザーグループを編集 */
  editUserGroup(input: {
  path: {
    groupId: string;
  };
  body?: Traq.PatchUserGroupRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** ユーザーグループのアイコンを変更 */
  changeUserGroupIcon(input: {
  path: {
    groupId: string;
  };
  body?: Traq.PutUserIconRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** グループメンバーを取得 */
  getUserGroupMembers(input: {
  path: {
    groupId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserGroupMember[]>;

  /** グループメンバーを追加 */
  addUserGroupMember(input: {
  path: {
    groupId: string;
  };
  body?: Traq.UserGroupMember | Traq.UserGroupMembers;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** グループメンバーを一括削除 */
  removeUserGroupMembers(input: {
  path: {
    groupId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** グループメンバーを削除 */
  removeUserGroupMember(input: {
  path: {
    groupId: string;
    userId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** グループメンバーを編集 */
  editUserGroupMember(input: {
  path: {
    groupId: string;
    userId: string;
  };
  body?: Traq.PatchGroupMemberRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** ユーザーグループのリストを取得 */
  getUserGroups(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserGroup[]>;

  /** ユーザーグループを作成 */
  createUserGroup(input?: {
  body?: Traq.PostUserGroupRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserGroup>;

  /** 自分のユーザー詳細を取得 */
  getMe(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.MyUserDetail>;

  /** 自分のユーザー情報を変更 */
  editMe(input?: {
  body?: Traq.PatchMeRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** 自分のユーザー詳細を取得 (OIDC UserInfo) */
  getOIDCUserInfo(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.OIDCUserInfo>;

  /** ダイレクトメッセージを送信 */
  postDirectMessage(input: {
  path: {
    userId: string;
  };
  body?: Traq.PostMessageRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.Message>;

  /** ダイレクトメッセージのリストを取得 */
  getDirectMessages(input: {
  path: {
    userId: string;
  };
  query?: {
    limit?: number;
    offset?: number;
    since?: string;
    until?: string;
    inclusive?: boolean;
    order?: "asc" | "desc";
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.Message[]>;

  /** ユーザー統計情報を取得 */
  getUserStats(input: {
  path: {
    userId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserStats>;

  /** チャンネルの通知購読者のリストを取得 */
  getChannelSubscribers(input: {
  path: {
    channelId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<string[]>;

  /** チャンネルの通知購読者を編集 */
  editChannelSubscribers(input: {
  path: {
    channelId: string;
  };
  body?: Traq.PatchChannelSubscribersRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** チャンネルの通知購読者を設定 */
  setChannelSubscribers(input: {
  path: {
    channelId: string;
  };
  body?: Traq.PutChannelSubscribersRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** 自分のチャンネル購読状態を取得 */
  getMyChannelSubscriptions(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserSubscribeState[]>;

  /** チャンネル購読レベルを設定 */
  setChannelSubscribeLevel(input: {
  path: {
    channelId: string;
  };
  body?: Traq.PutChannelSubscribeLevelRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** Webhook情報のリストを取得します */
  getWebhooks(input?: {
  query?: {
    all?: boolean;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.Webhook[]>;

  /** Webhookを新規作成 */
  createWebhook(input?: {
  body?: Traq.PostWebhookRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.Webhook>;

  /** Webhook情報を取得 */
  getWebhook(input: {
  path: {
    webhookId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.Webhook>;

  /** Webhookを送信 */
  postWebhook(input: {
  path: {
    webhookId: string;
  };
  query?: {
    embed?: number;
  };
  body?: string;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** Webhookを削除 */
  deleteWebhook(input: {
  path: {
    webhookId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** Webhook情報を変更 */
  editWebhook(input: {
  path: {
    webhookId: string;
  };
  body?: Traq.PatchWebhookRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** Webhookのアイコンを取得 */
  getWebhookIcon(input: {
  path: {
    webhookId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /** Webhookのアイコンを変更 */
  changeWebhookIcon(input: {
  path: {
    webhookId: string;
  };
  body?: Traq.PutUserIconRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** ユーザーのアイコン画像を取得 */
  getUserIcon(input: {
  path: {
    userId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /** ユーザーのアイコン画像を変更します */
  changeUserIcon(input: {
  path: {
    userId: string;
  };
  body?: Traq.PutUserIconRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** 自分のアイコン画像を取得 */
  getMyIcon(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /** 自分のアイコン画像を変更 */
  changeMyIcon(input?: {
  body?: Traq.PutUserIconRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** 自分のパスワードを変更 */
  changeMyPassword(input?: {
  body?: Traq.PutMyPasswordRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** ユーザーのパスワードを変更 */
  changeUserPassword(input: {
  path: {
    userId: string;
  };
  body?: Traq.PutUserPasswordRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** FCMデバイスを登録 */
  registerFCMDevice(input?: {
  body?: Traq.PostMyFCMDeviceRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** 自身のチャンネル閲覧状態一覧を取得 */
  getMyViewStates(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.MyChannelViewState[]>;

  /** ユーザーを登録 */
  createUser(input?: {
  body?: Traq.PostUserRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserDetail>;

  /** ユーザーのリストを取得 */
  getUsers(input?: {
  query?: {
    "include-suspended"?: boolean;
    name?: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.User[]>;

  /** チャンネルを作成 */
  createChannel(input?: {
  body?: Traq.PostChannelRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.Channel>;

  /** チャンネルリストを取得 */
  getChannels(input?: {
  query?: {
    "include-dm"?: boolean;
    path?: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.ChannelList>;

  /** ユーザーのタグリストを取得 */
  getUserTags(input: {
  path: {
    userId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserTag[]>;

  /** ユーザーにタグを追加 */
  addUserTag(input: {
  path: {
    userId: string;
  };
  body?: Traq.PostUserTagRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserTag>;

  /** ユーザーのタグを編集 */
  editUserTag(input: {
  path: {
    userId: string;
    tagId: string;
  };
  body?: Traq.PatchUserTagRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** ユーザーからタグを削除します */
  removeUserTag(input: {
  path: {
    userId: string;
    tagId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** タグ情報を取得 */
  getTag(input: {
  path: {
    tagId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.Tag>;

  /** 自分のタグリストを取得 */
  getMyUserTags(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserTag[]>;

  /** 自分にタグを追加 */
  addMyUserTag(input?: {
  body?: Traq.PostUserTagRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserTag>;

  /** 自分からタグを削除します */
  removeMyUserTag(input: {
  path: {
    tagId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** 自分のタグを編集 */
  editMyUserTag(input: {
  path: {
    tagId: string;
  };
  body?: Traq.PatchUserTagRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** スターチャンネルリストを取得 */
  getMyStars(input?: {
  form?: Record<string, string | Blob>;
}): Promise<string[]>;

  /** チャンネルをスターに追加 */
  addMyStar(input?: {
  body?: Traq.PostStarRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** チャンネルをスターから削除します */
  removeMyStar(input: {
  path: {
    channelId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** 未読チャンネルを取得 */
  getMyUnreadChannels(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.UnreadChannel[]>;

  /** バージョンを取得 */
  getServerVersion(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.Version>;

  /** ログイン */
  login(input?: {
  query?: {
    redirect?: string;
  };
  body?: Traq.PostLoginRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** ログアウト */
  logout(input?: {
  query?: {
    redirect?: string;
    all?: boolean;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** 自分のログインセッションリストを取得 */
  getMySessions(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.LoginSession[]>;

  /** セッションを無効化 */
  revokeMySession(input: {
  path: {
    sessionId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** アクテビティタイムラインを取得 */
  getActivityTimeline(input?: {
  query?: {
    limit?: number;
    all?: boolean;
    per_channel?: boolean;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.ActivityTimelineMessage[]>;

  /** WebSocket通知ストリームに接続します */
  ws(input?: {
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** 有効トークンのリストを取得 */
  getMyTokens(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.ActiveOAuth2Token[]>;

  /** トークンの認可を取り消す */
  revokeMyToken(input: {
  path: {
    tokenId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** ユーザーのアイコン画像を取得 */
  getPublicUserIcon(input: {
  path: {
    username: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /** OAuth2クライアント情報を取得 */
  getClient(input: {
  path: {
    clientId: string;
  };
  query?: {
    detail?: boolean;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.OAuth2Client | Traq.OAuth2ClientDetail>;

  /** OAuth2クライアントを削除 */
  deleteClient(input: {
  path: {
    clientId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** OAuth2クライアント情報を変更 */
  editClient(input: {
  path: {
    clientId: string;
  };
  body?: Traq.PatchClientRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** OAuthクライアントのトークンを削除 */
  revokeClientTokens(input: {
  path: {
    clientId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** OAuth2クライアントのリストを取得 */
  getClients(input?: {
  query?: {
    all?: boolean;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.OAuth2Client[]>;

  /** OAuth2クライアントを作成 */
  createClient(input?: {
  body?: Traq.PostClientRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.OAuth2ClientDetail>;

  /** BOTを作成 */
  createBot(input?: {
  body?: Traq.PostBotRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.BotDetail>;

  /** BOTリストを取得 */
  getBots(input?: {
  query?: {
    all?: boolean;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.Bot[]>;

  /** WebSocket Mode BOT用通知ストリームに接続します */
  connectBotWS(input?: {
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** BOTのアイコン画像を取得 */
  getBotIcon(input: {
  path: {
    botId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /** BOTのアイコン画像を変更 */
  changeBotIcon(input: {
  path: {
    botId: string;
  };
  body?: Traq.PutUserIconRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** BOT情報を取得 */
  getBot(input: {
  path: {
    botId: string;
  };
  query?: {
    detail?: boolean;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.Bot | Traq.BotDetail>;

  /** BOTを削除 */
  deleteBot(input: {
  path: {
    botId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** BOT情報を変更 */
  editBot(input: {
  path: {
    botId: string;
  };
  body?: Traq.PatchBotRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** BOTをアクティベート */
  activateBot(input: {
  path: {
    botId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** BOTをインアクティベート */
  inactivateBot(input: {
  path: {
    botId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** BOTのトークンを再発行 */
  reissueBot(input: {
  path: {
    botId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.BotTokens>;

  /** BOTのイベントログを取得 */
  getBotLogs(input: {
  path: {
    botId: string;
  };
  query?: {
    limit?: number;
    offset?: number;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.BotEventLog[]>;

  /** BOTをチャンネルに参加させる */
  letBotJoinChannel(input: {
  path: {
    botId: string;
  };
  body?: Traq.PostBotActionJoinRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** BOTをチャンネルから退出させる */
  letBotLeaveChannel(input: {
  path: {
    botId: string;
  };
  body?: Traq.PostBotActionLeaveRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** チャンネル参加中のBOTのリストを取得 */
  getChannelBots(input: {
  path: {
    channelId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.BotUser[]>;

  /** Skyway用認証API */
  postWebRTCAuthenticate(input?: {
  body?: Traq.PostWebRTCAuthenticateRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.WebRTCAuthenticateResult>;

  /** チャンネル情報を取得 */
  getChannel(input: {
  path: {
    channelId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.Channel>;

  /** チャンネル情報を変更 */
  editChannel(input: {
  path: {
    channelId: string;
  };
  body?: Traq.PatchChannelRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** WebRTC状態を取得 */
  getWebRTCState(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.WebRTCUserStates>;

  /** クリップフォルダを作成 */
  createClipFolder(input?: {
  body?: Traq.PostClipFolderRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.ClipFolder>;

  /** クリップフォルダのリストを取得 */
  getClipFolders(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.ClipFolder[]>;

  /** クリップフォルダ情報を取得 */
  getClipFolder(input: {
  path: {
    folderId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.ClipFolder>;

  /** クリップフォルダを削除 */
  deleteClipFolder(input: {
  path: {
    folderId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** クリップフォルダ情報を編集 */
  editClipFolder(input: {
  path: {
    folderId: string;
  };
  body?: Traq.PatchClipFolderRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** メッセージをクリップフォルダに追加 */
  clipMessage(input: {
  path: {
    folderId: string;
  };
  body?: Traq.PostClipFolderMessageRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.ClippedMessage>;

  /** フォルダ内のクリップのリストを取得 */
  getClips(input: {
  path: {
    folderId: string;
  };
  query?: {
    limit?: number;
    offset?: number;
    order?: "asc" | "desc";
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.ClippedMessage[]>;

  /** メッセージをクリップフォルダから除外 */
  unclipMessage(input: {
  path: {
    folderId: string;
    messageId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** Webhookの投稿メッセージのリストを取得 */
  getWebhookMessages(input: {
  path: {
    webhookId: string;
  };
  query?: {
    limit?: number;
    offset?: number;
    since?: string;
    until?: string;
    inclusive?: boolean;
    order?: "asc" | "desc";
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.Message[]>;

  /** Webhookの投稿メッセージを削除 */
  DeleteWebhookMessage(input: {
  path: {
    webhookId: string;
    messageId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** チャンネルイベントのリストを取得 */
  getChannelEvents(input: {
  path: {
    channelId: string;
  };
  query?: {
    limit?: number;
    offset?: number;
    since?: string;
    until?: string;
    inclusive?: boolean;
    order?: "asc" | "desc";
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.ChannelEvent[]>;

  /** スタンプパレットのリストを取得 */
  getStampPalettes(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.StampPalette[]>;

  /** スタンプパレットを作成 */
  createStampPalette(input?: {
  body?: Traq.PostStampPaletteRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.StampPalette>;

  /** スタンプパレットを取得 */
  getStampPalette(input: {
  path: {
    paletteId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.StampPalette>;

  /** スタンプパレットを削除 */
  deleteStampPalette(input: {
  path: {
    paletteId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** スタンプパレットを編集 */
  editStampPalette(input: {
  path: {
    paletteId: string;
  };
  body?: Traq.PatchStampPaletteRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** オンラインユーザーリストを取得 */
  getOnlineUsers(input?: {
  form?: Record<string, string | Blob>;
}): Promise<string[]>;

  /** スタンプ画像を取得 */
  getStampImage(input: {
  path: {
    stampId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Blob>;

  /** スタンプ画像を変更 */
  changeStampImage(input: {
  path: {
    stampId: string;
  };
  body?: {
  file: Blob;
};
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** チャンネルを既読にする */
  readChannel(input: {
  path: {
    channelId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** グループ管理者を削除 */
  removeUserGroupAdmin(input: {
  path: {
    groupId: string;
    userId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** グループ管理者を追加 */
  addUserGroupAdmin(input: {
  path: {
    groupId: string;
  };
  body?: Traq.PostUserGroupAdminRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** グループ管理者を取得 */
  getUserGroupAdmins(input: {
  path: {
    groupId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<string[]>;

  /** OAuth2 トークンエンドポイント */
  postOAuth2Token(input: {
  body: Traq.PostOAuth2Token;
  form?: Record<string, string | Blob>;
}): Promise<Traq.OAuth2Token>;

  /** OAuth2 認可承諾API */
  postOAuth2AuthorizeDecide(input: {
  body: Traq.OAuth2Decide;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** OAuth2 認可エンドポイント */
  getOAuth2Authorize(input: {
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
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** OAuth2 認可エンドポイント */
  postOAuth2Authorize(input: {
  body: Traq.OAuth2Authorization;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** OAuth2 トークン無効化エンドポイント */
  revokeOAuth2Token(input: {
  body: Traq.OAuth2Revoke;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** 外部ログインアカウント一覧を取得 */
  getMyExternalAccounts(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.ExternalProviderUser[]>;

  /** 外部ログインアカウントを紐付ける */
  linkExternalAccount(input?: {
  body?: Traq.PostLinkExternalAccount;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** 外部ログインアカウントの紐付けを解除 */
  unlinkExternalAccount(input?: {
  body?: Traq.PostUnlinkExternalAccount;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** DMチャンネル情報を取得 */
  getUserDMChannel(input: {
  path: {
    userId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.DMChannel>;

  /** 自分のクリップを取得 */
  getMessageClips(input: {
  path: {
    messageId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.MessageClip[]>;

  /** OGP情報を取得 */
  getOgp(input: {
  query: {
    url: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.Ogp>;

  /** OGP情報のキャッシュを削除 */
  deleteOgpCache(input: {
  query: {
    url: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** ユーザー設定を取得 */
  getUserSettings(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.UserSettings>;

  /** メッセージ引用通知の設定情報を取得 */
  getMyNotifyCitation(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.GetNotifyCitation>;

  /** メッセージ引用通知の設定情報を変更 */
  changeMyNotifyCitation(input?: {
  body?: Traq.PutNotifyCitationRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** 指定したチャンネルパスを取得 */
  getChannelPath(input: {
  path: {
    channelId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.ChannelPath>;

  /** LiveKitエンドポイントを取得 */
  getQallEndpoints(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.qallEndpointResponse>;

  /** LiveKitトークンを取得 */
  getLiveKitToken(input?: {
  query?: {
    roomId?: string;
    isWebinar?: boolean;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.qallTokenResponse>;

  /** ルームと参加者の一覧を取得 */
  getRooms(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.qallRoomsListResponse>;

  /** ルームのメタデータを取得 */
  getRoomMetadata(input: {
  path: {
    roomId: string;
  };
  form?: Record<string, string | Blob>;
}): Promise<Traq.qallMetadataResponse>;

  /** ルームのメタデータを更新 */
  updateRoomMetadata(input: {
  path: {
    roomId: string;
  };
  body: Traq.qallMetadataRequest;
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** ルームでの発言権限を変更 */
  changeParticipantRole(input: {
  path: {
    roomId: string;
  };
  body: Traq.qallParticipantRequest[];
  form?: Record<string, string | Blob>;
}): Promise<Traq.qallParticipantResponse>;

  /** LiveKit Webhook受信 */
  liveKitWebhook(input: {
  body: {
  [key: string]: unknown;
};
  form?: Record<string, string | Blob>;
}): Promise<null>;

  /** サウンドボード用の音声一覧を取得 */
  getSoundboardList(input?: {
  form?: Record<string, string | Blob>;
}): Promise<Traq.soundboardListResponse>;

  /** サウンドボード用の短い音声ファイルをアップロード */
  postSoundboard(input: {
  body: Traq.soundboardUploadRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.soundboardUploadResponse>;

  /** アップロード済み音声を LiveKit ルームで再生 */
  postSoundboardPlay(input: {
  body: Traq.soundboardPlayRequest;
  form?: Record<string, string | Blob>;
}): Promise<Traq.soundboardPlayResponse>;
};

declare const util: {
  sleep(ms: number): Promise<void>;
  pageAll<T>(fetchPage: (params: { limit: number; offset: number }) => Promise<T[]>, pageSize?: number): Promise<T[]>;
  isUuid(value: unknown): boolean;
  now(): string;
};
declare const ctx: { state: Record<string, unknown> };
type TraqChannelWithFullPath = Traq.Channel & { fullPath: string };
declare const me: Traq.MyUserDetail | null;
declare const users: Traq.User[];
declare const channels: TraqChannelWithFullPath[];
declare const groups: Traq.UserGroup[];
