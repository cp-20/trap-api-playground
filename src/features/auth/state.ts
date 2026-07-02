import { atom } from "jotai";
import { readToken, type OAuthToken } from "./oauth";

export const tokenAtom = atom<OAuthToken | null>(readToken());
