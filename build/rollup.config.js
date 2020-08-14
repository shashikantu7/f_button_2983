const path = require('path')
const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')
const pkg = require(path.resolve(__dirname, '../package.json'))
const BUNDLE = process.env.BUNDLE === 'true'
const year = new Date().getFullYear()
const fs = require('fs')
const capitalize = require('capitalize')

const external = []

const globals = {}

const plugins = [
  babel({
    exclude: 'node_modules/**', // only transpile our source code
  })
]

const externalId = path.resolve(__dirname, '../src/js/index.js');

let exportArrry = [{
  input: path.resolve(__dirname, '../src/js/index.js'),
  output: {
    file: path.resolve(__dirname, `../dist/js/froala_editor.js`),
    format: 'umd',
    name: 'FroalaEditor',
    globals
  },
  external,
  plugins
}, {
  input: path.resolve(__dirname, '../src/js/index.pkgd.js'),
  output: {
    file: path.resolve(__dirname, `../dist/js/froala_editor.pkgd.js`),
    format: 'umd',
    name: 'FroalaEditor',
    globals
  },
  external,
  plugins
}, {
  input: path.resolve(__dirname, '../src/js/plugins.pkgd.js'),
  output: {
    file: path.resolve(__dirname, `../dist/js/plugins.pkgd.js`),
    format: 'umd',
    name: 'FroalaEditorPlugins',
    globals: {
      [externalId]: 'FroalaEditor'
    },
    paths: {
      [externalId]: 'froala-editor'
    }
  },
  external: [externalId],
  plugins
}]

let buildFolder = function (name) {
  let items = fs.readdirSync(`src/js/${name}`);

  for (var i = 0; i < items.length; i++) {
    let nm = items[i].replace(/\.js/, '')

    exportArrry.push({
      input: path.resolve(__dirname, `../src/js/${name}/${nm}.js`),
      external: [externalId],
      output: {
        file: path.resolve(__dirname, `../dist/js/${name}/${nm}.js`),
        format: 'umd',
        name: capitalize(nm.split('_').join(' ')).split(' ').join(''),
        globals: {
          [externalId]: 'FroalaEditor'
        },
        paths: {
          [externalId]: 'froala-editor'
        }
      },
      plugins: [
        babel({
          exclude: 'node_modules/**', // only transpile our source code
        })
      ]
    })
  }
}

buildFolder('plugins')
buildFolder('third_party')
buildFolder('languages')
export default exportArrry