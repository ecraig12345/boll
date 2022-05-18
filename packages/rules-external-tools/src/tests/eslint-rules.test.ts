import * as assert from "assert";
import { baretest, inFixtureDir } from "@boll/test-internal";
import { ESLintRules } from "../eslint-config";
import { asBollFile, NullLogger } from "@boll/core";

export const test = baretest("ESLint Rules");

test("Correctly parses the config for a ts file in the same directory as the ESLint config", async () => {
  await inFixtureDir("eslint", __dirname, async () => {
    const sut = new ESLintRules({ logger: NullLogger });
    const config = await sut.getSourceFileConfig(asBollFile("foo.ts"));
    assert.ok(config.rules);
    assert.deepStrictEqual(config.rules, { "rule-one": ["error"], "rule-two": ["warn"], "rule-three": ["off"] });
    assert.ok(config.env);
    assert.deepStrictEqual(config.env, { browser: true, node: false });
  });
});

test("Correctly parses both configs for a ts file in a nested directory with its own ESLint config", async () => {
  await inFixtureDir("eslint/foo", __dirname, async () => {
    const sut = new ESLintRules({ logger: NullLogger });
    const config = await sut.getSourceFileConfig(asBollFile("bar.ts"));
    assert.ok(config.rules);
    assert.deepStrictEqual(config.rules, {
      "rule-one": ["error"],
      "rule-two": ["error"],
      "rule-three": ["off"],
      "rule-four": ["warn"]
    });
    assert.ok(config.env);
    assert.deepStrictEqual(config.env, { browser: true, node: false, es6: true });
  });
});
