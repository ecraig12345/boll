import * as assert from "assert";
import { inTmpDir, baretest } from "@boll/test-internal";
import { Cli } from "../cli";
import { existsSync } from "fs";
import { NullLogger } from "@boll/core";

export const test = baretest("CLI");

test("should create example config file when invoked with `init`", async () => {
  await inTmpDir(async () => {
    const configExistsPrecondition = existsSync("boll.config.js");
    assert.strictEqual(false, configExistsPrecondition);

    const sut = new Cli(NullLogger);
    await sut.run(["init"]);

    const configExistsExpected = existsSync(".boll.config.js");
    assert.strictEqual(true, configExistsExpected);
  });
});
