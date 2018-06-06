import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  output: {
    file: 'lib/module.js',
    format: 'cjs',
  },
  plugins: [
    babel({ exclude: 'node_modules/**' }),
    resolve({
      modulesOnly: true,
      jsnext: true,
      customResolveOptions: {
        moduleDirectory: 'node_modules',
      },
    }),
    commonjs(),
  ],
  external: ['fetches', 'lodash.frompairs', 'p-is-promise', 'prop-types', 'react', 'react-dom'],
}
