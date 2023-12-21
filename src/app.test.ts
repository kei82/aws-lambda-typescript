import { test, expect } from "@jest/globals";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { eventBodySchema } from "./tset/handler";
import path from "path";
/** 10msec待機した後に文字列をtop-level-awaitで取得 */
const awaitedValue: string = "/test";
console.log(import.meta);

test("top level await", () => {
  console.log(readFileSync(fileURLToPath("./tset/body.json")));
  expect(awaitedValue).toBe(awaitedValue);
});
test("top level await", () => {
  console.log(readFileSync("./tset/body.json"));
  expect(awaitedValue).toBe(awaitedValue);
});
export {};
