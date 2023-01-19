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
require(path.resolve(__dirname, './worker.ts'));
