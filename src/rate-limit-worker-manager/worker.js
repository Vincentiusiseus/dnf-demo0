const fs = require('fs')
const path = require('path');
const tsconfigPaths = require("tsconfig-paths")

const tsconfig_path = path.join(process.cwd(), "./tsconfig.json")
const tsConfig = require(tsconfig_path)

const baseUrl = "./";
const cleanup = tsconfigPaths.register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
});

require('ts-node').register(tsconfigPaths);
/**
 * 2023-01-22 20:01
 * `new Worker(..., { env: { k: v } })` 사용시 프로젝트 root 폴더에 `undefined/temp/v8-compiled-cache/[v8버전]` 폴더
 * 생기며 이 안에는 2개의 파일이 있음. 뭔지는 몰름.
 * 
 * `new Worker(..., { argv: [...] })` 같은 경우는 폴더 생성되지 않음.
 */
const worker_fp = "worker_fp" in process.env ? process.env["worker_fp"] : path.resolve(__dirname, './base-worker.ts')
require(worker_fp);
