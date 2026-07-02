import { getApiBase } from "./config";
import { parseResponse } from "./api/request";

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

type Indexes = {
  users: Map<string, EntityChip>;
  channels: Map<string, EntityChip>;
  stamps: Map<string, EntityChip>;
  groups: Map<string, EntityChip>;
  globals: RuntimeGlobals;
};

export type EntityIndexes = Indexes;

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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  };
}

async function getJson(path: string, accessToken: string): Promise<unknown> {
  const response = await fetch(`${getApiBase()}${path}`, {
    headers: authHeaders(accessToken),
  });
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return parseResponse(response);
}

function arrayOfRecords(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => {
        return !!item && typeof item === "object";
      })
    : [];
}

function channelRecords(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return arrayOfRecords(value);
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  return arrayOfRecords(record.public);
}

function computeFullPath(
  channel: Record<string, unknown>,
  byId: Map<string, Record<string, unknown>>,
  visiting = new Set<string>(),
): string {
  const id = typeof channel.id === "string" ? channel.id : "";
  const name = typeof channel.name === "string" ? channel.name : id;
  const parentId =
    typeof channel.parentId === "string" ? channel.parentId : null;
  if (!parentId || visiting.has(parentId)) return name;
  visiting.add(id);
  const parent = byId.get(parentId);
  return parent ? `${computeFullPath(parent, byId, visiting)}/${name}` : name;
}

function asChannelWithFullPath(
  channel: Record<string, unknown>,
  byId: Map<string, Record<string, unknown>>,
): ChannelWithFullPath | null {
  const id = typeof channel.id === "string" ? channel.id : undefined;
  const name = typeof channel.name === "string" ? channel.name : undefined;
  if (!id || !name) return null;
  return {
    ...channel,
    id,
    name,
    parentId: typeof channel.parentId === "string" ? channel.parentId : null,
    fullPath: computeFullPath(channel, byId),
  };
}

function compareRecordByStringField(
  field: string,
): (left: Record<string, unknown>, right: Record<string, unknown>) => number {
  return (left, right) =>
    collator.compare(
      typeof left[field] === "string" ? left[field] : "",
      typeof right[field] === "string" ? right[field] : "",
    );
}

export async function loadEntityIndexes(accessToken: string): Promise<Indexes> {
  const [me, users, channels, stamps, groups] = await Promise.allSettled([
    getJson("/users/me", accessToken),
    getJson("/users?include-suspended=true", accessToken),
    getJson("/channels", accessToken),
    getJson("/stamps", accessToken),
    getJson("/groups", accessToken),
  ]);

  const indexes: Indexes = {
    users: new Map(),
    channels: new Map(),
    stamps: new Map(),
    groups: new Map(),
    globals: {
      me:
        me.status === "fulfilled" && me.value && typeof me.value === "object"
          ? (me.value as Record<string, unknown>)
          : null,
      users: [],
      channels: [],
      groups: [],
    },
  };

  if (indexes.globals.me) {
    const user = indexes.globals.me;
    const id = typeof user.id === "string" ? user.id : undefined;
    const username = typeof user.name === "string" ? user.name : id;
    const displayName =
      typeof user.displayName === "string" ? user.displayName : username;
    if (id && username && displayName) {
      indexes.users.set(id, {
        kind: "user",
        id,
        username,
        displayName,
        label: `${displayName} (@${username})`,
        imageUrl: `https://image-proxy.trap.jp/icon/${encodeURIComponent(
          username,
        )}?width=48&height=48&format=webp`,
        detail: user,
      });
    }
  }

  if (users.status === "fulfilled") {
    indexes.globals.users = arrayOfRecords(users.value).sort(
      compareRecordByStringField("name"),
    );
    for (const user of indexes.globals.users) {
      const id = typeof user.id === "string" ? user.id : undefined;
      const username = typeof user.name === "string" ? user.name : id;
      const displayName =
        typeof user.displayName === "string" ? user.displayName : username;
      if (id && username && displayName) {
        indexes.users.set(id, {
          kind: "user",
          id,
          username,
          displayName,
          label: `${displayName} (@${username})`,
          imageUrl: `https://image-proxy.trap.jp/icon/${encodeURIComponent(
            username,
          )}?width=48&height=48&format=webp`,
          detail: user,
        });
      }
    }
  }

  if (channels.status === "fulfilled") {
    const rawChannels = channelRecords(channels.value);
    const byId = new Map(
      rawChannels
        .filter((channel) => typeof channel.id === "string")
        .map((channel) => [channel.id as string, channel] as const),
    );
    indexes.globals.channels = rawChannels
      .map((channel) => asChannelWithFullPath(channel, byId))
      .filter((channel): channel is ChannelWithFullPath => channel !== null)
      .sort((left, right) => collator.compare(left.fullPath, right.fullPath));

    for (const channel of indexes.globals.channels) {
      indexes.channels.set(channel.id, {
        kind: "channel",
        id: channel.id,
        label: channel.fullPath,
        fullPath: channel.fullPath,
        detail: channel,
      });
    }
  }

  if (stamps.status === "fulfilled") {
    for (const stamp of arrayOfRecords(stamps.value)) {
      const id = typeof stamp.id === "string" ? stamp.id : undefined;
      const name = typeof stamp.name === "string" ? stamp.name : id;
      if (id && name) {
        indexes.stamps.set(id, {
          kind: "stamp",
          id,
          name,
          label: name,
          imageUrl: `https://image-proxy.trap.jp/stamp/${encodeURIComponent(
            id,
          )}?width=48&height=48&format=webp`,
          detail: stamp,
        });
      }
    }
  }

  if (groups.status === "fulfilled") {
    indexes.globals.groups = arrayOfRecords(groups.value).sort(
      compareRecordByStringField("name"),
    );
    for (const group of indexes.globals.groups) {
      const id = typeof group.id === "string" ? group.id : undefined;
      const name = typeof group.name === "string" ? group.name : id;
      if (id && name) {
        indexes.groups.set(id, {
          kind: "group",
          id,
          label: name,
          detail: group,
        });
      }
    }
  }

  return indexes;
}

export function findEntityChip(
  indexes: Indexes | null,
  value: unknown,
  fieldKey?: string,
): EntityChip | null {
  if (!indexes || typeof value !== "string" || !UUID_RE.test(value))
    return null;
  const key = fieldKey?.toLowerCase() ?? "";
  if (/(group|member|admin)/.test(key))
    return indexes.groups.get(value) ?? indexes.users.get(value) ?? null;
  if (/(stamp|palette)/.test(key)) return indexes.stamps.get(value) ?? null;
  if (/(channel|home|parent)/.test(key))
    return indexes.channels.get(value) ?? null;
  if (/(user|creator|author|owner|uploader|developer|bot)/.test(key)) {
    return indexes.users.get(value) ?? null;
  }
  return (
    indexes.users.get(value) ??
    indexes.channels.get(value) ??
    indexes.stamps.get(value) ??
    indexes.groups.get(value) ??
    null
  );
}
