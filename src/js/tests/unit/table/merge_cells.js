import FE from '../../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../../$'

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('table/merge_cells')

    const fooEvent = function (which) {
      return {
        which: which,
        preventDefault: function () { },
        stopPropagation: function () { }
      }
    }

    const table_merge_test_cases = {
      // 1
      '<table><tbody><tr><td class="fr-selected-cell">a</td><td class="fr-selected-cell">b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>':
        '<table><tbody><tr><td class="fr-selected-cell" colspan="2">a<br>b</td></tr><tr><td>c</td><td>d</td></tr></tbody></table>',

      // 2
      '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td><td class="fr-selected-cell">d</td></tr></tbody></table>':
        '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td class="fr-selected-cell" colspan="2">c<br>d</td></tr></tbody></table>',

      // 3
      '<table><tbody><tr><td class="fr-selected-cell">a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td><td>d</td></tr></tbody></table>':
        '<table><tbody><tr><td class="fr-selected-cell" rowspan="2">a<br>c</td><td>b</td></tr><tr><td>d</td></tr></tbody></table>',

      // 4
      '<table><tbody><tr><td>a</td><td class="fr-selected-cell">b</td></tr><tr><td>c</td><td class="fr-selected-cell">d</td></tr></tbody></table>':
        '<table><tbody><tr><td>a</td><td class="fr-selected-cell" rowspan="2">b<br>d</td></tr><tr><td>c</td></tr></tbody></table>',

      // 5
      '<table><tbody><tr><td class="fr-selected-cell">a</td><td class="fr-selected-cell">b</td></tr><tr><td class="fr-selected-cell">c</td><td class="fr-selected-cell">d</td></tr></tbody></table>':
        '<table><tbody><tr><td class="fr-selected-cell">a<br>b<br>c<br>d</td></tr></tbody></table>',

      // 6
      '<table><tbody><tr><td rowspan="2">a</td><td class="fr-selected-cell">b</td></tr><tr><td class="fr-selected-cell">c</td></tr></tbody></table>':
        '<table><tbody><tr><td>a</td><td class="fr-selected-cell">b<br>c</td></tr></tbody></table>',

      // 7
      '<table><tbody><tr><td class="fr-selected-cell" rowspan="2">a</td><td class="fr-selected-cell">b</td></tr><tr><td class="fr-selected-cell">c</td></tr></tbody></table>':
        '<table><tbody><tr><td class="fr-selected-cell">a<br>b<br>c</td></tr></tbody></table>',

      // 8
      '<table><tbody><tr><td class="fr-selected-cell">a</td><td rowspan="2">b</td></tr><tr><td class="fr-selected-cell">c</td></tr></tbody></table>':
        '<table><tbody><tr><td class="fr-selected-cell">a<br>c</td><td>b</td></tr></tbody></table>',

      // 9
      '<table><tbody><tr><td class="fr-selected-cell">a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td><td rowspan="2">d</td></tr><tr><td>e</td></tr></tbody></table>':
        '<table><tbody><tr><td class="fr-selected-cell" rowspan="2">a<br>c</td><td>b</td></tr><tr><td rowspan="2">d</td></tr><tr><td>e</td></tr></tbody></table>',

      // 10
      '<table><tbody><tr><td class="fr-selected-cell">a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td><td rowspan="2">d</td></tr><tr><td class="fr-selected-cell">e</td></tr></tbody></table>':
        '<table><tbody><tr><td class="fr-selected-cell" rowspan="2">a<br>c<br>e</td><td>b</td></tr><tr><td>d</td></tr></tbody></table>',

      // 11
      '<table><tbody><tr><td class="fr-selected-cell">a</td><td class="fr-selected-cell">b</td></tr><tr><td>c</td><td rowspan="2">d</td></tr><tr><td>e</td></tr></tbody></table>':
        '<table><tbody><tr><td class="fr-selected-cell" colspan="2">a<br>b</td></tr><tr><td>c</td><td rowspan="2">d</td></tr><tr><td>e</td></tr></tbody></table>',

      // 12
      '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td><td rowspan="2">d</td></tr><tr><td class="fr-selected-cell">e</td></tr></tbody></table>':
        '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td class="fr-selected-cell">c<br>e</td><td>d</td></tr></tbody></table>',

      // 13
      '<table><tbody><tr><td class="fr-selected-cell">a</td><td class="fr-selected-cell">b</td></tr><tr><td class="fr-selected-cell">c</td><td class="fr-selected-cell" rowspan="2">d</td></tr><tr><td class="fr-selected-cell">e</td></tr></tbody></table>':
        '<table><tbody><tr><td class="fr-selected-cell">a<br>b<br>c<br>d<br>e</td></tr></tbody></table>',

      // 14
      '<table><tbody><tr><td rowspan="2">a</td><td class="fr-selected-cell">b</td></tr><tr><td class="fr-selected-cell">c</td></tr><tr><td>d</td><td>e</td></tr></tbody></table>':
        '<table><tbody><tr><td>a</td><td class="fr-selected-cell">b<br>c</td></tr><tr><td>d</td><td>e</td></tr></tbody></table>',

      // 15
      '<table><tbody><tr><td rowspan="2">a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td></tr><tr><td>d</td><td class="fr-selected-cell">e</td></tr></tbody></table>':
        '<table><tbody><tr><td rowspan="2">a</td><td>b</td></tr><tr><td class="fr-selected-cell" rowspan="2">c<br>e</td></tr><tr><td>d</td></tr></tbody></table>',

      // 16
      '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td class="fr-selected-cell">c</td></tr><tr><td rowspan="2">d</td><td class="fr-selected-cell">e</td></tr><tr><td>f</td><td>g</td></tr></tbody></table>':
        '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td class="fr-selected-cell" rowspan="2">c<br>e</td></tr><tr><td rowspan="2">d</td></tr><tr><td>f</td><td>g</td></tr></tbody></table>',

      // 17
      '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td>c</td></tr><tr><td rowspan="2">d</td><td class="fr-selected-cell">e</td></tr><tr><td>f</td><td class="fr-selected-cell">g</td></tr></tbody></table>':
        '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td>c</td></tr><tr><td rowspan="2">d</td><td class="fr-selected-cell" rowspan="2">e<br>g</td></tr><tr><td>f</td></tr></tbody></table>',

      // 18
      '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td class="fr-selected-cell">c</td></tr><tr><td rowspan="2">d</td><td class="fr-selected-cell">e</td></tr><tr><td>f</td><td class="fr-selected-cell">g</td></tr></tbody></table>':
        '<table><tbody><tr><td rowspan="2">a</td><td>b</td><td class="fr-selected-cell" rowspan="3">c<br>e<br>g</td></tr><tr><td rowspan="2">d</td></tr><tr><td>f</td></tr></tbody></table>',

      // 19
      '<table><tbody><tr><td class="fr-selected-cell" rowspan="2">a</td><td>b</td><td>c</td></tr><tr><td rowspan="2">d</td><td>e</td></tr><tr><td class="fr-selected-cell">f</td><td>g</td></tr></tbody></table>':
        '<table><tbody><tr><td class="fr-selected-cell" rowspan="3">a<br>f</td><td>b</td><td>c</td></tr><tr><td rowspan="2">d</td><td>e</td></tr><tr><td>g</td></tr></tbody></table>',

      // 20
      '<table><tbody><tr><td rowspan="2">a</td><td class="fr-selected-cell">b</td><td>c</td></tr><tr><td class="fr-selected-cell" rowspan="2">d</td><td>e</td></tr><tr><td>f</td><td>g</td></tr></tbody></table>':
        '<table><tbody><tr><td rowspan="2">a</td><td class="fr-selected-cell" rowspan="3">b<br>d</td><td>c</td></tr><tr><td>e</td></tr><tr><td>f</td><td>g</td></tr></tbody></table>',

      // 21
      '<table><tbody><tr><td class="fr-selected-cell" rowspan="2">a</td><td class="fr-selected-cell">b</td><td>c</td></tr><tr><td class="fr-selected-cell" rowspan="2">d</td><td>e</td></tr><tr><td class="fr-selected-cell">f</td><td>g</td></tr></tbody></table>':
        '<table><tbody><tr><td class="fr-selected-cell" rowspan="3">a<br>b<br>d<br>f</td><td>c</td></tr><tr><td>e</td></tr><tr><td>g</td></tr></tbody></table>',

      // 22
      '<table><tbody><tr><td rowspan="2">a</td><td class="fr-selected-cell">b</td><td class="fr-selected-cell">c</td></tr><tr><td class="fr-selected-cell" rowspan="2">d</td><td class="fr-selected-cell">e</td></tr><tr><td>f</td><td class="fr-selected-cell">g</td></tr></tbody></table>':
        '<table><tbody><tr><td>a</td><td class="fr-selected-cell" rowspan="2">b<br>c<br>d<br>e<br>g</td></tr><tr><td>f</td></tr></tbody></table>',

      // 23
      '<table><tbody><tr><td class="fr-selected-cell">a</td><td rowspan="2">b</td><td rowspan="2">c</td><td>d</td></tr><tr><td class="fr-selected-cell">e</td><td>f</td></tr><tr><td>g</td><td>h</td><td>i</td><td>j</td></tr></tbody></table>':
        '<table><tbody><tr><td class="fr-selected-cell" rowspan="2">a<br>e</td><td rowspan="2">b</td><td rowspan="2">c</td><td>d</td></tr><tr><td>f</td></tr><tr><td>g</td><td>h</td><td>i</td><td>j</td></tr></tbody></table>',

      // 24
      '<table><tbody><tr><td class="fr-selected-cell">a</td><td class="fr-selected-cell" rowspan="2">b</td><td rowspan="2">c</td><td>d</td></tr><tr><td class="fr-selected-cell">e</td><td>f</td></tr><tr><td>g</td><td>h</td><td>i</td><td>j</td></tr></tbody></table>':
        '<table><tbody><tr><td class="fr-selected-cell" colspan="2" rowspan="2">a<br>b<br>e</td><td rowspan="2">c</td><td>d</td></tr><tr><td>f</td></tr><tr><td>g</td><td>h</td><td>i</td><td>j</td></tr></tbody></table>',

      // 25
      '<table><tbody><tr><td>a</td><td rowspan="2">b</td><td class="fr-selected-cell" rowspan="2">c</td><td class="fr-selected-cell">d</td></tr><tr><td>e</td><td class="fr-selected-cell">f</td></tr><tr><td>g</td><td>h</td><td class="fr-selected-cell">i</td><td class="fr-selected-cell">j</td></tr></tbody></table>':
        '<table><tbody><tr><td>a</td><td rowspan="2">b</td><td class="fr-selected-cell" rowspan="3">c<br>d<br>f<br>i<br>j</td></tr><tr><td>e</td></tr><tr><td>g</td><td>h</td></tr></tbody></table>',

      // 26
      '<table><tbody><tr><td colspan="2">a</td></tr><tr><td class="fr-selected-cell">c</td><td class="fr-selected-cell">d</td></tr></tbody></table>':
        '<table><tbody><tr><td>a</td></tr><tr><td class="fr-selected-cell">c<br>d</td></tr></tbody></table>',

      // 27
      '<table><tbody><tr><td class="fr-selected-cell" colspan="2">a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td><td class="fr-selected-cell">d</td><td>e</td></tr><tr><td>f</td><td colspan="2">g</td></tr></tbody></table>':
        '<table><tbody><tr><td class="fr-selected-cell" colspan="2" rowspan="2">a<br>c<br>d</td><td>b</td></tr><tr><td>e</td></tr><tr><td>f</td><td colspan="2">g</td></tr></tbody></table>',

      // 28
      '<table><tbody><tr><td class="fr-selected-cell" colspan="2">a</td><td class="fr-selected-cell">b</td></tr><tr><td class="fr-selected-cell">c</td><td class="fr-selected-cell">d</td><td class="fr-selected-cell">e</td></tr><tr><td>f</td><td colspan="2">g</td></tr></tbody></table>':
        '<table><tbody><tr><td class="fr-selected-cell" colspan="2">a<br>b<br>c<br>d<br>e</td></tr><tr><td>f</td><td>g</td></tr></tbody></table>',

      // 29
      '<table><tbody><tr><td colspan="2">a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td><td>d</td><td>e</td></tr><tr><td class="fr-selected-cell">f</td><td colspan="2">g</td></tr></tbody></table>':
        '<table><tbody><tr><td colspan="2">a</td><td>b</td></tr><tr><td class="fr-selected-cell" rowspan="2">c<br>f</td><td>d</td><td>e</td></tr><tr><td colspan="2">g</td></tr></tbody></table>',

      // 30
      '<table><tbody><tr><td colspan="2">a</td><td>b</td></tr><tr><td class="fr-selected-cell">c</td><td class="fr-selected-cell">d</td><td class="fr-selected-cell">e</td></tr><tr><td class="fr-selected-cell">f</td><td class="fr-selected-cell" colspan="2">g</td></tr></tbody></table>':
        '<table><tbody><tr><td>a</td><td>b</td></tr><tr><td class="fr-selected-cell" colspan="2">c<br>d<br>e<br>f<br>g</td></tr></tbody></table>',

      // 31
      '<table><tbody><tr><td colspan="2">a</td><td>b</td></tr><tr><td>c</td><td class="fr-selected-cell">d</td><td class="fr-selected-cell">e</td></tr><tr><td>f</td><td class="fr-selected-cell" colspan="2">g</td></tr></tbody></table>':
        '<table><tbody><tr><td colspan="2">a</td><td>b</td></tr><tr><td>c</td><td class="fr-selected-cell" colspan="2" rowspan="2">d<br>e<br>g</td></tr><tr><td>f</td></tr></tbody></table>',

      // 32
      '<table><tbody><tr><td class="fr-selected-cell">a</td><td class="fr-selected-cell">b</td><td rowspan="3">c</td><td>d</td></tr><tr><td class="fr-selected-cell" colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>':
        '<table><tbody><tr><td class="fr-selected-cell" colspan="2" rowspan="3">a<br>b<br>e</td><td rowspan="3">c</td><td>d</td></tr><tr><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>',

      // 33
      '<table><tbody><tr><td class="fr-selected-cell">a</td><td class="fr-selected-cell">b</td><td class="fr-selected-cell" rowspan="3">c</td><td>d</td></tr><tr><td class="fr-selected-cell" colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>':
        '<table><tbody><tr><td class="fr-selected-cell" colspan="2" rowspan="3">a<br>b<br>c<br>e</td><td>d</td></tr><tr><td>f</td></tr><tr><td>g</td></tr><tr><td>h</td><td>i</td><td>j</td></tr></tbody></table>',

      // 34
      '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td class="fr-selected-cell">h</td><td class="fr-selected-cell" colspan="2">i</td><td>j</td></tr></tbody></table>':
        '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td>d</td></tr><tr><td colspan="2" rowspan="2">e</td><td>f</td></tr><tr><td>g</td></tr><tr><td class="fr-selected-cell" colspan="3">h<br>i</td><td>j</td></tr></tbody></table>',

      // 35
      '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td class="fr-selected-cell">d</td></tr><tr><td colspan="2" rowspan="2">e</td><td class="fr-selected-cell">f</td></tr><tr><td class="fr-selected-cell">g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>':
        '<table><tbody><tr><td>a</td><td>b</td><td rowspan="2">c</td><td class="fr-selected-cell" rowspan="2">d<br>f<br>g</td></tr><tr><td colspan="2">e</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>',

      // 36
      '<table><tbody><tr><td>a</td><td>b</td><td rowspan="3">c</td><td class="fr-selected-cell">d</td></tr><tr><td colspan="2" rowspan="2">e</td><td class="fr-selected-cell">f</td></tr><tr><td class="fr-selected-cell">g</td></tr><tr><td>h</td><td colspan="2">i</td><td class="fr-selected-cell">j</td></tr></tbody></table>':
        '<table><tbody><tr><td>a</td><td>b</td><td rowspan="2">c</td><td class="fr-selected-cell" rowspan="3">d<br>f<br>g<br>j</td></tr><tr><td colspan="2">e</td></tr><tr><td>h</td><td colspan="2">i</td></tr></tbody></table>',

      // 37
      '<table><tbody><tr><td>a</td><td>b</td><td class="fr-selected-cell" rowspan="3">c</td><td class="fr-selected-cell">d</td></tr><tr><td colspan="2" rowspan="2">e</td><td class="fr-selected-cell">f</td></tr><tr><td class="fr-selected-cell">g</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>':
        '<table><tbody><tr><td>a</td><td>b</td><td class="fr-selected-cell" colspan="2" rowspan="2">c<br>d<br>f<br>g</td></tr><tr><td colspan="2">e</td></tr><tr><td>h</td><td colspan="2">i</td><td>j</td></tr></tbody></table>'
    }

    function tablesMergeTest(input, output, t) {
      QUnit.test(t + '. TABLES mergeCells ' + input, function (assert) {
        const done = assert.async();
        const $editor = $(document.createElement('div')).attr('id', 'edit').html(input)
        $(document.body).append($editor)

        new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this

              // Merge cells.
              instance.table.mergeCells();

              // Add cursor
              //instance.markers.insert();
              //instance.$el.find('.fr-marker').replaceWith('#');

              // We are expecting one assertion.
              assert.expect(1)
              assert.equal(normalizedHTML(undefined, instance).replace(/ style="[^"]*"/gi, ''), output, 'OK');

              instance.destroy()
              $editor.remove()
              
              done()
            }
          }
        });


        // Sort tag attributes.
        function sortedAttrs(node, instance) {
          const attrs = instance.node.rawAttributes(node);

          const names = Object.keys(attrs).sort();
          let str = '';
          for (let i = 0; i < names.length; i++) {
            str += ' ' + names[i] + '="' + attrs[names[i]] + '"';
          }

          return str;
        }

        function normalizedHTML($el, instance) {
          if (typeof $el == 'undefined') $el = instance.$el;

          let str = '';
          const contents = instance.node.contents($el.get(0));
          for (let i = 0; i < contents.length; i++) {
            if (contents[i].nodeType == Node.TEXT_NODE) {
              str += contents[i].textContent;
            }
            else if (contents[i].nodeType == Node.ELEMENT_NODE) {
              str += normalizedHTML($(contents[i]), instance)
            }
          }

          if ($el.get(0) == instance.el) return str;

          return '<' + $el.get(0).tagName.toLowerCase() + sortedAttrs($el.get(0), instance) + '>' + str + (FE.VOID_ELEMENTS.indexOf($el.get(0).tagName.toLowerCase()) >= 0 ? '' : instance.node.closeTagString($el.get(0)))
        }
      });
    }

    // Call test for all test cases.
    let t = 0;
    for (const input in table_merge_test_cases) {
      tablesMergeTest(input, table_merge_test_cases[input], ++t);
    }
  });