// import commonjs from '@rollup/plugin-commonjs';
// import json from '@rollup/plugin-json';
// import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

// import esbuild from 'rollup-plugin-esbuild';

// TDDO: - Get roll up working :(
// TDDO: - fix circular dependency warning when building rollup
export default [
  {
    input: `src/index.ts`,
    plugins: [
      // json(),
      // commonjs({ extensions: ['.js', '.ts'] }),
      // resolve({
      //   preferBuiltins: true,
      // }),
      typescript({
        // tsconfig: './tsconfig.build.json',
      }),
      copy({
        targets: [
          { src: 'src/markdown', dest: 'dist/markdown' },
          { src: 'src/templates', dest: 'dist/templates' },
        ],
      }),
    ],
    output: [
      {
        file: `dist/bundle.mjs`,
        format: 'esm',
        sourcemap: true,
        exports: 'default',
      },
      {
        file: `dist/bundle.min.mjs`,
        format: 'esm',
        sourcemap: true,
        exports: 'default',
        plugins: [terser()],
      },
    ],
  },
];
