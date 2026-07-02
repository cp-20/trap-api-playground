export type EntityChip =
  | {
      kind: "user";
      id: string;
      username: string;
      displayName: string;
      label: string;
      imageUrl: string;
      detail: Record<string, unknown>;
    }
  | {
      kind: "channel";
      id: string;
      label: string;
      fullPath: string;
      detail: Record<string, unknown>;
    }
  | {
      kind: "group";
      id: string;
      label: string;
      detail: Record<string, unknown>;
    }
  | {
      kind: "stamp";
      id: string;
      name: string;
      label: string;
      imageUrl: string;
      detail: Record<string, unknown>;
    };

export type ChannelWithFullPath = Record<string, unknown> & {
  id: string;
  name: string;
  parentId: string | null;
  fullPath: string;
};

export type RuntimeGlobals = {
  me: Record<string, unknown> | null;
  users: Record<string, unknown>[];
  channels: ChannelWithFullPath[];
  groups: Record<string, unknown>[];
};

export type EntityIndexes = {
  users: Map<string, EntityChip>;
  channels: Map<string, EntityChip>;
  stamps: Map<string, EntityChip>;
  groups: Map<string, EntityChip>;
  globals: RuntimeGlobals;
};

export const EMPTY_GLOBALS: RuntimeGlobals = {
  me: null,
  users: [],
  channels: [],
  groups: [],
};
