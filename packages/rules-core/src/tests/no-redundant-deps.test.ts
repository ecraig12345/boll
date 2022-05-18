import * as assert from "assert";
import { baretest, inFixtureDir } from "@boll/test-internal";
import { NoRedundantDepsRule } from "../no-redundant-deps";
import { asBollDirectory, getSourceFile, NullLogger, ResultStatus } from "@boll/core";

export const test = baretest("NoRedundantDepsTest");

const sut = new NoRedundantDepsRule(NullLogger);
const emptyPackageContentsStub = { dependencies: {}, devDependencies: {} };

test("passes when no peerDeps present", async () => {
  await inFixtureDir("simple", __dirname, async () => {
    const source = await getSourceFile(asBollDirectory("."), "package.json", emptyPackageContentsStub);
    const result = await sut.check(source);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].status, ResultStatus.success);
  });
});

test("passes when no overlap between dependencies and peerDeps", async () => {
  await inFixtureDir("complex", __dirname, async () => {
    const source = await getSourceFile(asBollDirectory("."), "package.json", emptyPackageContentsStub);
    const result = await sut.check(source);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].status, ResultStatus.success);
  });
});

test("fails when overlap between dependencies and peerDeps", async () => {
  await inFixtureDir("redundant", __dirname, async () => {
    const source = await getSourceFile(asBollDirectory("."), "package.json", emptyPackageContentsStub);
    const result = await sut.check(source);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].status, ResultStatus.failure);
  });
});
