import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import babel from 'rollup-plugin-babel';


export default {
  input: 'src/main.js',
  output: {
    file: 'clevertap.js',
    format: 'umd',
  },
  name: 'clevertap',
  plugins: [
    builtins(),
    babel({
      exclude: 'node_modules/**'
    }),
    resolve({
      browser: true,
    }),
    commonjs(),
  ],
}
