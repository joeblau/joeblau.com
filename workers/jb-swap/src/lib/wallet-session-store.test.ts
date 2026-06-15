import { afterEach, describe, expect, test } from "bun:test";

import {
	clearManualDisconnect,
	setManualDisconnect,
	walletSessionStore,
} from "./wallet-session-store";

// The store is a module singleton — reset it after every test so order doesn't
// matter.
afterEach(() => clearManualDisconnect());

describe("walletSessionStore", () => {
	test("starts not-disconnected", () => {
		expect(walletSessionStore.getSnapshot()).toBe(false);
	});

	test("server snapshot is always false", () => {
		setManualDisconnect();
		expect(walletSessionStore.getServerSnapshot()).toBe(false);
	});

	test("set/clear flips the snapshot", () => {
		setManualDisconnect();
		expect(walletSessionStore.getSnapshot()).toBe(true);
		clearManualDisconnect();
		expect(walletSessionStore.getSnapshot()).toBe(false);
	});

	test("notifies subscribers on change", () => {
		let calls = 0;
		const unsub = walletSessionStore.subscribe(() => calls++);
		setManualDisconnect();
		clearManualDisconnect();
		expect(calls).toBe(2);
		unsub();
	});

	test("does not notify when the value is unchanged (idempotent)", () => {
		let calls = 0;
		const unsub = walletSessionStore.subscribe(() => calls++);
		setManualDisconnect();
		setManualDisconnect(); // already true — no emit
		expect(calls).toBe(1);
		unsub();
	});

	test("unsubscribed listeners stop receiving updates", () => {
		let calls = 0;
		const unsub = walletSessionStore.subscribe(() => calls++);
		unsub();
		setManualDisconnect();
		expect(calls).toBe(0);
	});
});
