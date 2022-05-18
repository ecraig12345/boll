import * as assert from "assert";
import { baretest, inFixtureDir } from "@boll/test-internal";
import { asBollDirectory, getSourceFile, asBollFile, Failure, Package, ResultStatus } from "@boll/core";
import { SrcDetector } from "../src-detector";
export const test = baretest("Source detector");

test("Should pass if no `src` detected in imports", () => {
  const importPaths = [
    { path: "a", lineNumber: 0 },
    { path: "b/c/d/e/f", lineNumber: 1 }
  ];
  const sut = new SrcDetector();
  const result = sut.checkImportPaths(asBollFile("a"), importPaths);
  assert.strictEqual(ResultStatus.success, result[0].status);
});

test("Should fail if `src` detected in imports", () => {
  const importPaths = [
    { path: "a/src/b", lineNumber: 0 },
    { path: "b/c/d/e/f", lineNumber: 1 }
  ];
  const sut = new SrcDetector();
  const result = sut.checkImportPaths(asBollFile("a"), importPaths);
  assert.strictEqual(ResultStatus.failure, result[0].status);
});

test("Should fail if references to `src` detected in imports", async () => {
  await inFixtureDir("src-detector", __dirname, async () => {
    const sut = new SrcDetector();
    const result = await sut.check(await getSourceFile(asBollDirectory("."), "src-detector.ts", new Package({}, {})));
    const failure = result[0] as Failure;
    const failure1 = result[1] as Failure;
    assert.strictEqual(2, result.length);
    assert.strictEqual(ResultStatus.failure, result[0].status);
    assert.strictEqual(ResultStatus.failure, result[1].status);
    assert.strictEqual(1, failure.line);
    assert.strictEqual(8, failure1.line);
  });
});
