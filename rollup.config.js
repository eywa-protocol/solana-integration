import dts from "rollup-plugin-dts";
import cleanup from "rollup-plugin-cleanup";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

const name = "SolanaBridge";

const bundle = (config) => ({
  ...config,
  input: "./bridge-ts/bridge-user-client.ts",
  external: (id) => !/^[./]/.test(id),
});

export default [
  bundle({
    plugins: [
      json(),
      commonjs(),
      nodeResolve(),
      cleanup({ comments: "istanbul", extensions: ["js", "ts"] }),
      typescript({ module: "ESNext", tsconfig: "./tsconfigBridge.json" }),
    ],
    output: [
      {
        file: `./bridge-ts/build/${name}.js`,
        format: "es",
        sourcemap: true,
      },
    ],
  }),
  bundle({
    plugins: [dts()],
    output: {
      file: `./bridge-ts/build/${name}.d.ts`,
      format: "es",
    },
  }),
];
