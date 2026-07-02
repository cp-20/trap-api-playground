import createClient from "openapi-fetch";
import { getApiBase } from "../config";
import type { paths } from "../generated/traq-openapi";

const createTraqClient = (accessToken: string) =>
  createClient<paths>({
    baseUrl: getApiBase(),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

type TraqClient = ReturnType<typeof createTraqClient>;

export type EntityIndexSources = {
  me: unknown;
  users: unknown;
  channels: unknown;
  stamps: unknown;
  groups: unknown;
};

const getJson = async (
  client: TraqClient,
  path: keyof paths,
  init?: Record<string, unknown>,
): Promise<unknown> => {
  const result = await client.GET(path as never, init as never);
  if (result.error) throw new Error(`Failed to load ${path}`);
  return result.data ?? null;
};

const valueOrNull = (result: PromiseSettledResult<unknown>): unknown => {
  return result.status === "fulfilled" ? result.value : null;
};

export const loadEntityIndexSources = async (accessToken: string): Promise<EntityIndexSources> => {
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

  return {
    me: valueOrNull(me),
    users: valueOrNull(users),
    channels: valueOrNull(channels),
    stamps: valueOrNull(stamps),
    groups: valueOrNull(groups),
  };
};
