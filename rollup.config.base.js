import postcss from 'rollup-plugin-postcss'
import babel from '@rollup/plugin-babel';
import nodejs from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.js',
  plugins: [
    postcss(),
    babel(),
    nodejs({
      jsnext: true,
      main: true,
    }),
    commonjs(),
  ],
}
