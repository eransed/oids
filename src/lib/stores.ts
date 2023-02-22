import { writable, type Writable } from "svelte/store";
import type { Button90Config } from "../components/interface";

export const menu: Writable<Button90Config[]> = writable();
export const showMenu: Writable<boolean> = writable();
export const showLoginPage: Writable<boolean> = writable();
export const isLoggedIn: Writable<boolean> = writable();

export const authThoken: Writable<string> = writable();
export const refreshToken: Writable<string> = writable();
