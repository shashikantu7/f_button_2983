import FE from '../../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../../$'

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('table/insert_column_row')

    const fooEvent = function (which) {
      return {
        which: which,
        preventDefault: function () { },
        stopPropagation: function () { }
      }
    }

    const table_insert_test_cases = {
      // 1
      '<table><tbody><tr><td class="fr-selected-cell">a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>':
      {
        'before': '<table><tbody><tr><td><br></td><td class="fr-selected-cell">a</td><td>b</td></tr><tr><td><br></td><td>c</td><td>d</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td class="fr-selected-cell">a</td><td><br></td><td>b</td></tr><tr><td>c</td><td><br></td><td>d</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td class="fr-selected-cell">a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td class="fr-selected-cell">a</td><td>b</td></tr><tr><td><br></td><td><br></td></tr><tr><td>c</td><td>d</td></tr></tbody></table>'
      },

      // 2
      '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td class="fr-selected-cell">d</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td>a</td><td><br></td><td>b</td></tr><tr><td>c</td><td><br></td><td class="fr-selected-cell">d</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td>b</td><td><br></td></tr><tr><td>c</td><td class="fr-selected-cell">d</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td><br></td><td><br></td></tr><tr><td>c</td><td class="fr-selected-cell">d</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td class="fr-selected-cell">d</td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'
      },

      // 3
      '<table><tbody><tr><td>a</td><td class="fr-selected-cell">b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td>a</td><td><br></td><td class="fr-selected-cell">b</td></tr><tr><td>c</td><td><br></td><td>d</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td class="fr-selected-cell">b</td><td><br></td></tr><tr><td>c</td><td>d</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td>a</td><td class="fr-selected-cell">b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td class="fr-selected-cell">b</td></tr><tr><td><br></td><td><br></td></tr><tr><td>c</td><td>d</td></tr></tbody></table>'
      },

      // 4
      '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td><td>d</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td><br></td><td>a</td><td>b</td></tr><tr><td><br></td><td class="fr-selected-cell">c</td><td>d</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td><br></td><td>b</td></tr><tr><td class="fr-selected-cell">c</td><td><br></td><td>d</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td><br></td><td><br></td></tr><tr><td class="fr-selected-cell">c</td><td>d</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td><td>d</td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'
      },

      // 5
      '<table><tbody><tr><td class="fr-selected-cell" rowspan="2">a</td><td>b</td></tr><tr><td>c</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td><br></td><td class="fr-selected-cell" rowspan="2">a</td><td>b</td></tr><tr><td><br></td><td>c</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td class="fr-selected-cell" rowspan="2">a</td><td><br></td><td>b</td></tr><tr><td><br></td><td>c</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td class="fr-selected-cell" rowspan="2">a</td><td>b</td></tr><tr><td>c</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td class="fr-selected-cell" rowspan="2">a</td><td>b</td></tr><tr><td>c</td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'
      },

      // 6
      '<table><tbody><tr><td rowspan="2">a</td><td class="fr-selected-cell">b</td></tr><tr><td>c</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td rowspan="2">a</td><td><br></td><td class="fr-selected-cell">b</td></tr><tr><td><br></td><td>c</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td rowspan="2">a</td><td class="fr-selected-cell">b</td><td><br></td></tr><tr><td>c</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td rowspan="2">a</td><td class="fr-selected-cell">b</td></tr><tr><td>c</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td rowspan="3">a</td><td class="fr-selected-cell">b</td></tr><tr><td><br></td></tr><tr><td>c</td></tr></tbody></table>'
      },

      // 7
      '<table><tbody><tr><td rowspan="2">a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td rowspan="2">a</td><td><br></td><td>b</td></tr><tr><td><br></td><td class="fr-selected-cell">c</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td><br></td></tr><tr><td class="fr-selected-cell">c</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td rowspan="3">a</td><td>b</td></tr><tr><td><br></td></tr><tr><td class="fr-selected-cell">c</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td rowspan="2">a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'
      },

      // 8
      '<table><tbody><tr><td>a</td><td class="fr-selected-cell" rowspan="2">b</td></tr><tr><td>c</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td>a</td><td><br></td><td class="fr-selected-cell" rowspan="2">b</td></tr><tr><td>c</td><td><br></td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td class="fr-selected-cell" rowspan="2">b</td><td><br></td></tr><tr><td>c</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td>a</td><td class="fr-selected-cell" rowspan="2">b</td></tr><tr><td>c</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td class="fr-selected-cell" rowspan="2">b</td></tr><tr><td>c</td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'
      },

      // 9
      '<table><tbody><tr><td class="fr-selected-cell">a</td><td rowspan="2">b</td></tr><tr><td>c</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td><br></td><td class="fr-selected-cell">a</td><td rowspan="2">b</td></tr><tr><td><br></td><td>c</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td class="fr-selected-cell">a</td><td><br></td><td rowspan="2">b</td></tr><tr><td>c</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td class="fr-selected-cell">a</td><td rowspan="2">b</td></tr><tr><td>c</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td class="fr-selected-cell">a</td><td rowspan="3">b</td></tr><tr><td><br></td></tr><tr><td>c</td></tr></tbody></table>'
      },

      // 10
      '<table><tbody><tr><td>a</td><td rowspan="2">b</td></tr><tr><td class="fr-selected-cell">c</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td><br></td><td>a</td><td rowspan="2">b</td></tr><tr><td><br></td><td class="fr-selected-cell">c</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td><br></td><td rowspan="2">b</td></tr><tr><td class="fr-selected-cell">c</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td>a</td><td rowspan="3">b</td></tr><tr><td><br></td></tr><tr><td class="fr-selected-cell">c</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td rowspan="2">b</td></tr><tr><td class="fr-selected-cell">c</td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'
      },

      // 11
      '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td class="fr-selected-cell" rowspan="2">d</td></tr><tr><td>e</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td>a</td><td><br></td><td>b</td></tr><tr><td>c</td><td><br></td><td class="fr-selected-cell" rowspan="2">d</td></tr><tr><td>e</td><td><br></td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td>b</td><td><br></td></tr><tr><td>c</td><td class="fr-selected-cell" rowspan="2">d</td><td><br></td></tr><tr><td>e</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td><br></td><td><br></td></tr><tr><td>c</td><td class="fr-selected-cell" rowspan="2">d</td></tr><tr><td>e</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td>c</td><td class="fr-selected-cell" rowspan="2">d</td></tr><tr><td>e</td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'
      },

      // 12
      '<table><tbody><tr><td>a</td><td class="fr-selected-cell">b</td></tr><tr><td>c</td><td rowspan="2">d</td></tr><tr><td>e</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td>a</td><td><br></td><td class="fr-selected-cell">b</td></tr><tr><td>c</td><td><br></td><td rowspan="2">d</td></tr><tr><td>e</td><td><br></td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td class="fr-selected-cell">b</td><td><br></td></tr><tr><td>c</td><td rowspan="2">d</td><td><br></td></tr><tr><td>e</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td>a</td><td class="fr-selected-cell">b</td></tr><tr><td>c</td><td rowspan="2">d</td></tr><tr><td>e</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td class="fr-selected-cell">b</td></tr><tr><td><br></td><td><br></td></tr><tr><td>c</td><td rowspan="2">d</td></tr><tr><td>e</td></tr></tbody></table>'
      },

      // 13
      '<table><tbody><tr><td>a</td><td class="fr-selected-cell">b</td></tr><tr><td rowspan="2">c</td><td>d</td></tr><tr><td>e</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td>a</td><td><br></td><td class="fr-selected-cell">b</td></tr><tr><td rowspan="2">c</td><td><br></td><td>d</td></tr><tr><td><br></td><td>e</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td class="fr-selected-cell">b</td><td><br></td></tr><tr><td rowspan="2">c</td><td>d</td><td><br></td></tr><tr><td>e</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td>a</td><td class="fr-selected-cell">b</td></tr><tr><td rowspan="2">c</td><td>d</td></tr><tr><td>e</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td class="fr-selected-cell">b</td></tr><tr><td><br></td><td><br></td></tr><tr><td rowspan="2">c</td><td>d</td></tr><tr><td>e</td></tr></tbody></table>'
      },

      // 14
      '<table><tbody><tr><td rowspan="2">a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td></tr><tr><td>d</td><td>e</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td rowspan="2">a</td><td><br></td><td>b</td></tr><tr><td><br></td><td class="fr-selected-cell">c</td></tr><tr><td>d</td><td><br></td><td>e</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td><br></td></tr><tr><td class="fr-selected-cell">c</td><td><br></td></tr><tr><td>d</td><td>e</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td rowspan="3">a</td><td>b</td></tr><tr><td><br></td></tr><tr><td class="fr-selected-cell">c</td></tr><tr><td>d</td><td>e</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td rowspan="2">a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td></tr><tr><td><br></td><td><br></td></tr><tr><td>d</td><td>e</td></tr></tbody></table>'
      },

      // 15
      '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td>c</td></tr><tr><td class="fr-selected-cell" rowspan="2">d</td><td>e</td></tr><tr><td>f</td><td>g</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td rowspan="2">a</td><td><br></td><td>b</td><td>c</td></tr><tr><td><br></td><td class="fr-selected-cell" rowspan="2">d</td><td>e</td></tr><tr><td>f</td><td><br></td><td>g</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td><br></td><td>c</td></tr><tr><td class="fr-selected-cell" rowspan="2">d</td><td><br></td><td>e</td></tr><tr><td>f</td><td><br></td><td>g</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td rowspan="3">a</td><td>b</td><td>c</td></tr><tr><td><br></td><td><br></td></tr><tr><td class="fr-selected-cell" rowspan="2">d</td><td>e</td></tr><tr><td>f</td><td>g</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td>c</td></tr><tr><td class="fr-selected-cell" rowspan="2">d</td><td>e</td></tr><tr><td>f</td><td>g</td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table>'
      },

      // 16
      '<table><tbody><tr><td class="fr-selected-cell" rowspan="2">a</td><td>b</td><td>c</td></tr><tr><td rowspan="2">d</td><td>e</td></tr><tr><td>f</td><td>g</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td><br></td><td class="fr-selected-cell" rowspan="2">a</td><td>b</td><td>c</td></tr><tr><td><br></td><td rowspan="2">d</td><td>e</td></tr><tr><td><br></td><td>f</td><td>g</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td class="fr-selected-cell" rowspan="2">a</td><td><br></td><td>b</td><td>c</td></tr><tr><td><br></td><td rowspan="2">d</td><td>e</td></tr><tr><td>f</td><td><br></td><td>g</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td><td><br></td></tr><tr><td class="fr-selected-cell" rowspan="2">a</td><td>b</td><td>c</td></tr><tr><td rowspan="2">d</td><td>e</td></tr><tr><td>f</td><td>g</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td class="fr-selected-cell" rowspan="2">a</td><td>b</td><td>c</td></tr><tr><td rowspan="3">d</td><td>e</td></tr><tr><td><br></td><td><br></td></tr><tr><td>f</td><td>g</td></tr></tbody></table>'
      },

      // 17
      '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td>c</td></tr><tr><td rowspan="2">d</td><td class="fr-selected-cell">e</td></tr><tr><td>f</td><td>g</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td><br></td><td>c</td></tr><tr><td rowspan="2">d</td><td><br></td><td class="fr-selected-cell">e</td></tr><tr><td>f</td><td><br></td><td>g</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td>c</td><td><br></td></tr><tr><td rowspan="2">d</td><td class="fr-selected-cell">e</td><td><br></td></tr><tr><td>f</td><td>g</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td rowspan="3">a</td><td>b</td><td>c</td></tr><tr><td><br></td><td><br></td></tr><tr><td rowspan="2">d</td><td class="fr-selected-cell">e</td></tr><tr><td>f</td><td>g</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td>c</td></tr><tr><td rowspan="3">d</td><td class="fr-selected-cell">e</td></tr><tr><td><br></td><td><br></td></tr><tr><td>f</td><td>g</td></tr></tbody></table>'
      },

      // 18
      '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td>c</td></tr><tr><td rowspan="2">d</td><td>e</td></tr><tr><td class="fr-selected-cell">f</td><td>g</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td><br></td><td rowspan="2">a</td><td>b</td><td>c</td></tr><tr><td><br></td><td rowspan="2">d</td><td>e</td></tr><tr><td><br></td><td class="fr-selected-cell">f</td><td>g</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td rowspan="2">a</td><td><br></td><td>b</td><td>c</td></tr><tr><td><br></td><td rowspan="2">d</td><td>e</td></tr><tr><td class="fr-selected-cell">f</td><td><br></td><td>g</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td>c</td></tr><tr><td rowspan="3">d</td><td>e</td></tr><tr><td><br></td><td><br></td></tr><tr><td class="fr-selected-cell">f</td><td>g</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td>c</td></tr><tr><td rowspan="2">d</td><td>e</td></tr><tr><td class="fr-selected-cell">f</td><td>g</td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table>'
      },

      // 19
      '<table><tbody><tr><td>a</td><td rowspan="2">b</td><td class="fr-selected-cell" rowspan="2">c</td><td>d</td></tr><tr><td>e</td><td>f</td></tr><tr><td>g</td><td>h</td><td>i</td><td>j</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td>a</td><td rowspan="2">b</td><td><br></td><td class="fr-selected-cell" rowspan="2">c</td><td>d</td></tr><tr><td>e</td><td><br></td><td>f</td></tr><tr><td>g</td><td>h</td><td><br></td><td>i</td><td>j</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td rowspan="2">b</td><td class="fr-selected-cell" rowspan="2">c</td><td><br></td><td>d</td></tr><tr><td>e</td><td><br></td><td>f</td></tr><tr><td>g</td><td>h</td><td>i</td><td><br></td><td>j</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr><tr><td>a</td><td rowspan="2">b</td><td class="fr-selected-cell" rowspan="2">c</td><td>d</td></tr><tr><td>e</td><td>f</td></tr><tr><td>g</td><td>h</td><td>i</td><td>j</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td rowspan="2">b</td><td class="fr-selected-cell" rowspan="2">c</td><td>d</td></tr><tr><td>e</td><td>f</td></tr><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr><tr><td>g</td><td>h</td><td>i</td><td>j</td></tr></tbody></table>'
      },

      // 20
      '<table><tbody><tr><td>a</td><td class="fr-selected-cell" rowspan="2">b</td><td rowspan="2">c</td><td>d</td></tr><tr><td>e</td><td>f</td></tr><tr><td>g</td><td>h</td><td>i</td><td>j</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td>a</td><td><br></td><td class="fr-selected-cell" rowspan="2">b</td><td rowspan="2">c</td><td>d</td></tr><tr><td>e</td><td><br></td><td>f</td></tr><tr><td>g</td><td><br></td><td>h</td><td>i</td><td>j</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td class="fr-selected-cell" rowspan="2">b</td><td><br></td><td rowspan="2">c</td><td>d</td></tr><tr><td>e</td><td><br></td><td>f</td></tr><tr><td>g</td><td>h</td><td><br></td><td>i</td><td>j</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr><tr><td>a</td><td class="fr-selected-cell" rowspan="2">b</td><td rowspan="2">c</td><td>d</td></tr><tr><td>e</td><td>f</td></tr><tr><td>g</td><td>h</td><td>i</td><td>j</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td class="fr-selected-cell" rowspan="2">b</td><td rowspan="2">c</td><td>d</td></tr><tr><td>e</td><td>f</td></tr><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr><tr><td>g</td><td>h</td><td>i</td><td>j</td></tr></tbody></table>'
      },

      // 21
      '<table><tbody><tr><td>a</td><td rowspan="2">b</td><td rowspan="2">c</td><td>d</td></tr><tr><td class="fr-selected-cell">e</td><td>f</td></tr><tr><td>g</td><td>h</td><td>i</td><td>j</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td><br></td><td>a</td><td rowspan="2">b</td><td rowspan="2">c</td><td>d</td></tr><tr><td><br></td><td class="fr-selected-cell">e</td><td>f</td></tr><tr><td><br></td><td>g</td><td>h</td><td>i</td><td>j</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td><br></td><td rowspan="2">b</td><td rowspan="2">c</td><td>d</td></tr><tr><td class="fr-selected-cell">e</td><td><br></td><td>f</td></tr><tr><td>g</td><td><br></td><td>h</td><td>i</td><td>j</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td>a</td><td rowspan="3">b</td><td rowspan="3">c</td><td>d</td></tr><tr><td><br></td><td><br></td></tr><tr><td class="fr-selected-cell">e</td><td>f</td></tr><tr><td>g</td><td>h</td><td>i</td><td>j</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td rowspan="2">b</td><td rowspan="2">c</td><td>d</td></tr><tr><td class="fr-selected-cell">e</td><td>f</td></tr><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr><tr><td>g</td><td>h</td><td>i</td><td>j</td></tr></tbody></table>'
      },

      // 22
      '<table><tbody><tr><td colspan="2">a</td></tr><tr><td class="fr-selected-cell">c</td><td>d</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td><br></td><td colspan="2">a</td></tr><tr><td><br></td><td class="fr-selected-cell">c</td><td>d</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td colspan="3">a</td></tr><tr><td class="fr-selected-cell">c</td><td><br></td><td>d</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td colspan="2">a</td></tr><tr><td><br></td><td><br></td></tr><tr><td class="fr-selected-cell">c</td><td>d</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td colspan="2">a</td></tr><tr><td class="fr-selected-cell">c</td><td>d</td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'
      },

      // 23
      '<table><tbody><tr><td class="fr-selected-cell" colspan="2">a</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td><br></td><td class="fr-selected-cell" colspan="2">a</td></tr><tr><td><br></td><td>c</td><td>d</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td class="fr-selected-cell" colspan="2">a</td><td><br></td></tr><tr><td>c</td><td>d</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td></tr><tr><td class="fr-selected-cell" colspan="2">a</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td class="fr-selected-cell" colspan="2">a</td></tr><tr><td><br></td><td><br></td></tr><tr><td>c</td><td>d</td></tr></tbody></table>'
      },

      // 24
      '<table><tbody><tr><td colspan="2">a</td></tr><tr><td>c</td><td class="fr-selected-cell">d</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td colspan="3">a</td></tr><tr><td>c</td><td><br></td><td class="fr-selected-cell">d</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td colspan="2">a</td><td><br></td></tr><tr><td>c</td><td class="fr-selected-cell">d</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td colspan="2">a</td></tr><tr><td><br></td><td><br></td></tr><tr><td>c</td><td class="fr-selected-cell">d</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td colspan="2">a</td></tr><tr><td>c</td><td class="fr-selected-cell">d</td></tr><tr><td><br></td><td><br></td></tr></tbody></table>'
      },

      // 25
      '<table><tbody><tr><td class="fr-selected-cell" colspan="2">a</td><td>b</td></tr><tr><td>c</td><td>d</td><td>e</td></tr><tr><td>f</td><td colspan="2">g</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td><br></td><td class="fr-selected-cell" colspan="2">a</td><td>b</td></tr><tr><td><br></td><td>c</td><td>d</td><td>e</td></tr><tr><td><br></td><td>f</td><td colspan="2">g</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td class="fr-selected-cell" colspan="2">a</td><td><br></td><td>b</td></tr><tr><td>c</td><td>d</td><td><br></td><td>e</td></tr><tr><td>f</td><td colspan="3">g</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td><td><br></td></tr><tr><td class="fr-selected-cell" colspan="2">a</td><td>b</td></tr><tr><td>c</td><td>d</td><td>e</td></tr><tr><td>f</td><td colspan="2">g</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td class="fr-selected-cell" colspan="2">a</td><td>b</td></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td>c</td><td>d</td><td>e</td></tr><tr><td>f</td><td colspan="2">g</td></tr></tbody></table>'
      },

      // 26
      '<table><tbody><tr><td colspan="2">a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td><td>d</td><td>e</td></tr><tr><td>f</td><td colspan="2">g</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td><br></td><td colspan="2">a</td><td>b</td></tr><tr><td><br></td><td class="fr-selected-cell">c</td><td>d</td><td>e</td></tr><tr><td><br></td><td>f</td><td colspan="2">g</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td colspan="3">a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td><td><br></td><td>d</td><td>e</td></tr><tr><td>f</td><td><br></td><td colspan="2">g</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td colspan="2">a</td><td>b</td></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td class="fr-selected-cell">c</td><td>d</td><td>e</td></tr><tr><td>f</td><td colspan="2">g</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td colspan="2">a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td><td>d</td><td>e</td></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td>f</td><td colspan="2">g</td></tr></tbody></table>'
      },

      // 27
      '<table><tbody><tr><td colspan="2">a</td><td>b</td></tr><tr><td>c</td><td>d</td><td>e</td></tr><tr><td>f</td><td class="fr-selected-cell" colspan="2">g</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td colspan="3">a</td><td>b</td></tr><tr><td>c</td><td><br></td><td>d</td><td>e</td></tr><tr><td>f</td><td><br></td><td class="fr-selected-cell" colspan="2">g</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td colspan="2">a</td><td>b</td><td><br></td></tr><tr><td>c</td><td>d</td><td>e</td><td><br></td></tr><tr><td>f</td><td class="fr-selected-cell" colspan="2">g</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td colspan="2">a</td><td>b</td></tr><tr><td>c</td><td>d</td><td>e</td></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td>f</td><td class="fr-selected-cell" colspan="2">g</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td colspan="2">a</td><td>b</td></tr><tr><td>c</td><td>d</td><td>e</td></tr><tr><td>f</td><td class="fr-selected-cell" colspan="2">g</td></tr><tr><td><br></td><td><br></td><td><br></td></tr></tbody></table>'
      },

      // 28
      '<table><tbody><tr><td colspan="2">a</td><td>b</td></tr><tr><td>c</td><td class="fr-selected-cell">d</td><td>e</td></tr><tr><td>f</td><td colspan="2">g</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td colspan="3">a</td><td>b</td></tr><tr><td>c</td><td><br></td><td class="fr-selected-cell">d</td><td>e</td></tr><tr><td>f</td><td><br></td><td colspan="2">g</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td colspan="2">a</td><td><br></td><td>b</td></tr><tr><td>c</td><td class="fr-selected-cell">d</td><td><br></td><td>e</td></tr><tr><td>f</td><td colspan="3">g</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td colspan="2">a</td><td>b</td></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td>c</td><td class="fr-selected-cell">d</td><td>e</td></tr><tr><td>f</td><td colspan="2">g</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td colspan="2">a</td><td>b</td></tr><tr><td>c</td><td class="fr-selected-cell">d</td><td>e</td></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td>f</td><td colspan="2">g</td></tr></tbody></table>'
      },

      // 29
      '<table><tbody><tr><td colspan="2">a</td><td class="fr-selected-cell">b</td></tr><tr><td>c</td><td>d</td><td>e</td></tr><tr><td>f</td><td colspan="2">g</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td colspan="2">a</td><td><br></td><td class="fr-selected-cell">b</td></tr><tr><td>c</td><td>d</td><td><br></td><td>e</td></tr><tr><td>f</td><td colspan="3">g</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td colspan="2">a</td><td class="fr-selected-cell">b</td><td><br></td></tr><tr><td>c</td><td>d</td><td>e</td><td><br></td></tr><tr><td>f</td><td colspan="2">g</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td><td><br></td></tr><tr><td colspan="2">a</td><td class="fr-selected-cell">b</td></tr><tr><td>c</td><td>d</td><td>e</td></tr><tr><td>f</td><td colspan="2">g</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td colspan="2">a</td><td class="fr-selected-cell">b</td></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td>c</td><td>d</td><td>e</td></tr><tr><td>f</td><td colspan="2">g</td></tr></tbody></table>'
      },

      // 30
      '<table><tbody><tr><td class="fr-selected-cell">a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td><br></td><td class="fr-selected-cell">a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td><br></td><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td><br></td><td>g</td></tr><tr><td><br></td><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td class="fr-selected-cell">a</td><td><br></td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="3" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td><br></td><td colspan="2">i</td><td>j</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr><tr><td class="fr-selected-cell">a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td class="fr-selected-cell">a</td><td>b</td><td rowspan="4">c</td><td>d</td></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>'
      },

      // 31
      '<table><tbody><tr><td>a</td><td class="fr-selected-cell">b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td>a</td><td><br></td><td class="fr-selected-cell">b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="3" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td><br></td><td colspan="2">i</td><td>j</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td class="fr-selected-cell">b</td><td><br></td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td><br></td><td>f</td></tr><tr><td><br></td><td>g</td></tr><tr><td>h</td><td colspan="3">i</td><td>j</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr><tr><td>a</td><td class="fr-selected-cell">b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td class="fr-selected-cell">b</td><td rowspan="4">c</td><td>d</td></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>'
      },

      // 32
      '<table><tbody><tr><td>a</td><td>b</td><td class="fr-selected-cell" rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td>a</td><td>b</td><td><br></td><td class="fr-selected-cell" rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td><br></td><td>f</td></tr><tr><td><br></td><td>g</td></tr><tr><td>h</td><td colspan="3">i</td><td>j</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td>b</td><td class="fr-selected-cell" rowspan="3">c</td><td><br></td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td><br></td><td>f</td></tr><tr><td><br></td><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td><br></td><td>j</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr><tr><td>a</td><td>b</td><td class="fr-selected-cell" rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td>b</td><td class="fr-selected-cell" rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>'
      },

      // 33
      '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td class="fr-selected-cell" colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td><br></td><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td><br></td><td class="fr-selected-cell" colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td><br></td><td>g</td></tr><tr><td><br></td><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td>b</td><td><br></td><td rowspan="3">c</td><td>d</td></tr><tr><td class="fr-selected-cell" colspan="2" rowspan="2">e</td><td><br></td><td>f</td></tr><tr><td><br></td><td>g</td></tr><tr><td>h</td><td colspan="3">i</td><td>j</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="4">c</td><td>d</td></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td class="fr-selected-cell" colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td class="fr-selected-cell" colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>'
      },

      // 34
      '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td class="fr-selected-cell" colspan="2">i</td><td>j</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td>a</td><td><br></td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="3" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td><br></td><td class="fr-selected-cell" colspan="2">i</td><td>j</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td><br></td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td><br></td><td>f</td></tr><tr><td><br></td><td>g</td></tr><tr><td>h</td><td class="fr-selected-cell" colspan="2">i</td><td><br></td><td>j</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr><tr><td>h</td><td class="fr-selected-cell" colspan="2">i</td><td>j</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td class="fr-selected-cell" colspan="2">i</td><td>j</td></tr><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr></tbody></table>'
      },

      // 35
      '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td class="fr-selected-cell">f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td><br></td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td><br></td><td class="fr-selected-cell">f</td></tr><tr><td><br></td><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td><br></td><td>j</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td><td><br></td></tr><tr><td colspan="2" rowspan="2">e</td><td class="fr-selected-cell">f</td><td><br></td></tr><tr><td>g</td><td><br></td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="4">c</td><td>d</td></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td colspan="2" rowspan="2">e</td><td class="fr-selected-cell">f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="4">c</td><td>d</td></tr><tr><td colspan="2" rowspan="3">e</td><td class="fr-selected-cell">f</td></tr><tr><td><br></td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>'
      },

      // 36
      '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td class="fr-selected-cell">g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td><br></td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td><br></td><td>f</td></tr><tr><td><br></td><td class="fr-selected-cell">g</td></tr><tr><td>h</td><td colspan="2">i</td><td><br></td><td>j</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td><td><br></td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td><td><br></td></tr><tr><td class="fr-selected-cell">g</td><td><br></td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="4">c</td><td>d</td></tr><tr><td colspan="2" rowspan="3">e</td><td>f</td></tr><tr><td><br></td></tr><tr><td class="fr-selected-cell">g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td class="fr-selected-cell">g</td></tr><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>'
      },

      // 37
      '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td class="fr-selected-cell">h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td><br></td><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td><br></td><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td><br></td><td>g</td></tr><tr><td><br></td><td class="fr-selected-cell">h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td><br></td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="3" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td class="fr-selected-cell">h</td><td><br></td><td colspan="2">i</td><td>j</td></tr></tbody></table>',
        'above': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr><tr><td class="fr-selected-cell">h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td class="fr-selected-cell">h</td><td colspan="2">i</td><td>j</td></tr><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr></tbody></table>'
      },

      // 38
      '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td class="fr-selected-cell">d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td><br></td><td class="fr-selected-cell">d</td></tr><tr><td colspan="2" rowspan="2">e</td><td><br></td><td>f</td></tr><tr><td><br></td><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td><br></td><td>j</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td class="fr-selected-cell">d</td><td><br></td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td><td><br></td></tr><tr><td>g</td><td><br></td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr><tr><td>a</td><td>b</td><td rowspan="3">c</td><td class="fr-selected-cell">d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="4">c</td><td class="fr-selected-cell">d</td></tr><tr><td><br></td><td><br></td><td><br></td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>'
      },

      // 39
      '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td class="fr-selected-cell">j</td></tr></tbody></table>': {
        'before': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td><br></td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td><br></td><td>f</td></tr><tr><td><br></td><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td><br></td><td class="fr-selected-cell">j</td></tr></tbody></table>',
        'after': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td><td><br></td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td><td><br></td></tr><tr><td>g</td><td><br></td></tr><tr><td>h</td><td colspan="2">i</td><td class="fr-selected-cell">j</td><td><br></td></tr></tbody></table>',
        'above': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr><tr><td>h</td><td colspan="2">i</td><td class="fr-selected-cell">j</td></tr></tbody></table>',
        'below': '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td class="fr-selected-cell">j</td></tr><tr><td><br></td><td><br></td><td><br></td><td><br></td></tr></tbody></table>'
      }

    }

    function tablesInsertTest(input, key, output, t) {
      QUnit.test(t + '. TABLES insertColumn and insertRow ' + input, function (assert) {
        const done = assert.async();
        const $editor = $(document.createElement('div')).attr('id', 'edit').html(input)
        $(document.body).append($editor)


        new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              let instance = this

              switch (key) {
              case 'before':
                instance.table.insertColumn('before');
                break;

              case 'after':
                instance.table.insertColumn('after');
                break;

              case 'above':
                instance.table.insertRow('above');
                break;

              case 'below':
                instance.table.insertRow('below');
                break;
              }

              assert.expect(1)
              assert.equal(instance.$el.html().replace(/ style="[^"]*"/gi, ''), output, key);

              instance.destroy();
              $editor.remove()

              done()
            }
          }
        });


      });
    }

    // Call test for all test cases.
    let t = 0;
    for (const input in table_insert_test_cases) {
      for (const output_key in table_insert_test_cases[input]) {
        tablesInsertTest(input, output_key, table_insert_test_cases[input][output_key], ++t);
      }
    }
  });
