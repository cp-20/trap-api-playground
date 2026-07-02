import { atom } from "jotai";
import type { ToastMessage } from "./ToastViewport";

export const toastsAtom = atom<ToastMessage[]>([]);
