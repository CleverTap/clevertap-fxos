import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
  input: 'ctServiceWorker',
  output: {
    file: 'serviceWorker.js',
    format: 'es',
  },
  plugins: [
    babel({
    }),
    resolve({
      browser: true,
    }),
    commonjs(),
    uglify()
  ],
}
