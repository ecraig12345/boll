// workaround for issues with non-exported types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import realBaretest from "baretest";

export const baretest: (headline: string) => TesterFunctionObject = realBaretest;

export type TesterFunctionObject = TesterFunction & TesterSubFunctions;

export type TesterFunction = (name: string, fn: SyncOrAsyncVoidFunction) => void;
export interface TesterSubFunctions {
  only: (name: string, fn: SyncOrAsyncVoidFunction) => void;
  skip: (name?: string, fn?: SyncOrAsyncVoidFunction) => void;
  before: (fn: SyncOrAsyncVoidFunction) => void;
  after: (fn: SyncOrAsyncVoidFunction) => void;
  run: () => Promise<boolean>;
}

export type SyncOrAsyncVoidFunction = () => void | Promise<void>;
