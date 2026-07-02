import createClient from "openapi-fetch";
import { getApiBase } from "../config";
import type { ChannelWithFullPath, EntityIndexes } from "../features/entities/types";
import type { paths } from "../generated/traq-openapi";

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

const createTraqClient = (accessToken: string) =>
  createClient<paths>({
    baseUrl: getApiBase(),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

type TraqClient = ReturnType<typeof createTraqClient>;

const getJson = async (
  client: TraqClient,
  path: keyof paths,
  init?: Record<string, unknown>,
): Promise<unknown> => {
  const result = await client.GET(path as never, init as never);
  if (result.error) throw new Error(`Failed to load ${path}`);
  return result.data ?? null;
};

const arrayOfRecords = (value: unknown): Record<string, unknown>[] => {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => {
        return !!item && typeof item === "object";
      })
    : [];
};

const channelRecords = (value: unknown): Record<string, unknown>[] => {
  if (Array.isArray(value)) return arrayOfRecords(value);
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  return arrayOfRecords(record.public);
};

const computeFullPath = (
  channel: Record<string, unknown>,
  byId: Map<string, Record<string, unknown>>,
  visiting = new Set<string>(),
): string => {
  const id = typeof channel.id === "string" ? channel.id : "";
  const name = typeof channel.name === "string" ? channel.name : id;
  const parentId = typeof channel.parentId === "string" ? channel.parentId : null;
  if (!parentId || visiting.has(parentId)) return name;
  visiting.add(id);
  const parent = byId.get(parentId);
  return parent ? `${computeFullPath(parent, byId, visiting)}/${name}` : name;
};

const asChannelWithFullPath = (
  channel: Record<string, unknown>,
  byId: Map<string, Record<string, unknown>>,
): ChannelWithFullPath | null => {
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
};

const compareRecordByStringField = (
  field: string,
): ((left: Record<string, unknown>, right: Record<string, unknown>) => number) => {
  return (left, right) =>
    collator.compare(
      typeof left[field] === "string" ? left[field] : "",
      typeof right[field] === "string" ? right[field] : "",
    );
};

export const loadEntityIndexes = async (accessToken: string): Promise<EntityIndexes> => {
  const client = createTraqClient(accessToken);
  const [me, users, channels, stamps, groups] = await Promise.allSettled([
    getJson(client, "/users/me"),
    getJson(client, "/users", {
      params: { query: { "include-suspended": true } },
    }),
    getJson(client, "/channels"),
    getJson(client, "/stamps"),
    getJson(client, "/groups"),
  ]);

  const indexes: EntityIndexes = {
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
    const displayName = typeof user.displayName === "string" ? user.displayName : username;
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
    indexes.globals.users = arrayOfRecords(users.value).sort(compareRecordByStringField("name"));
    for (const user of indexes.globals.users) {
      const id = typeof user.id === "string" ? user.id : undefined;
      const username = typeof user.name === "string" ? user.name : id;
      const displayName = typeof user.displayName === "string" ? user.displayName : username;
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
    indexes.globals.groups = arrayOfRecords(groups.value).sort(compareRecordByStringField("name"));
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
};
