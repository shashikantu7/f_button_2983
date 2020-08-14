import FE from '../../../../../src/js/editor.js'
import $ from '../../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('keys/delete_div')

    const fooEvent = (which) => {
      return {
        which: which,
        preventDefault: function () {},
        stopPropagation: function () {}
      }
    }

    const delete_div_cases = {
      // 1
      '<div>#foo bar</div>': 
      '<div>#oo bar</div>',

      // 2
      '<div>foo #bar</div>': 
      '<div>foo #ar</div>',

      // 3
      '<div>foo# bar</div>': 
      '<div>foo#bar</div>',

      // 4
      '<div>foo bar#</div>': 
      '<div>foo bar#</div>',

      // 5.
      '<div>foo#</div><div>bar</div>': 
      '<div>foo#bar</div>',

      // 6
      '<div>foo #</div><div>bar</div>': 
      '<div>foo #bar</div>',

      // 7
      '<div>foo</div><div>#bar</div>': 
      '<div>foo</div><div>#ar</div>',

      // 8
      '<div>foo</div><div>bar#</div>': 
      '<div>foo</div><div>bar#</div>',

      // 9
      '<div><strong>#foo</strong> bar</div>': 
      '<div><strong>#oo</strong> bar</div>',

      // 10.
      '<div><strong>foo#</strong> bar</div>': 
      '<div><strong>foo</strong>#bar</div>',

      '<div><strong>foo</strong># bar</div>': 
      '<div><strong>foo</strong>#bar</div>',

      '<div>foo <strong>#bar</strong></div>': 
      '<div>foo <strong>#ar</strong></div>',

      '<div>foo #<strong>bar</strong></div>': 
      '<div>foo <strong>#ar</strong></div>',

      '<div>foo <strong>bar#</strong></div>': 
      '<div>foo <strong>bar#</strong></div>',

      // 15.
      '<div>foo <strong>bar</strong>#</div>': 
      '<div>foo <strong>bar</strong>#</div>',

      '<div>foo</div><div><strong>#bar</strong></div>': 
      '<div>foo</div><div><strong>#ar</strong></div>',

      '<div>foo#</div><div><strong>bar</strong></div>': 
      '<div>foo#<strong>bar</strong></div>',

      '<div><strong>foo</strong></div><div>#bar</div>': 
      '<div><strong>foo</strong></div><div>#ar</div>',

      '<div><strong>foo#</strong></div><div>bar</div>': 
      '<div><strong>foo#</strong>bar</div>',

      // 20.
      '<h1>#foo bar</h1>': 
      '<h1>#oo bar</h1>',

      '<h1>foo #bar</h1>': 
      '<h1>foo #ar</h1>',

      '<h1>foo bar#</h1>': 
      '<h1>foo bar#</h1>',

      '<h1>foo</h1><div>#bar</div>': 
      '<h1>foo</h1><div>#ar</div>',

      '<h1>foo#</h1><div>bar</div>': 
      '<h1>foo#bar</h1>',

      '<div>foo bar</div><div>#<br></div>': 
      '<div>foo bar</div><div>#<br></div>',

      '<div>foo bar#</div><div><br></div>': 
      '<div>foo bar#</div>',

      '<div><br></div><div>#foo bar</div>': 
      '<div><br></div><div>#oo bar</div>',

      '<div>#<br></div><div>foo bar</div>': 
      '<div>#foo bar</div>',

      '<table><tbody><tr><td>#foo bar</td></tr></tbody></table>': 
      '<table><tbody><tr><td>#oo bar</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo b#ar</td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo b#r</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo bar#</td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo bar#</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo</td><td>#bar</td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo</td><td>#ar</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo#</td><td>bar</td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo#</td><td>bar</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo</td><td>bar#</td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo</td><td>bar#</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo</td></tr></tbody></table><div>#bar</div>': 
      '<table><tbody><tr><td>foo</td></tr></tbody></table><div>#ar</div>',

      '<div>bar#</div><table><tbody><tr><td>foo</td></tr></tbody></table>': 
      '<div>bar#</div><table><tbody><tr><td>foo</td></tr></tbody></table>',

      '<div>#<br></div><table><tbody><tr><td>foo</td></tr></tbody></table>': 
      '<div>#<br></div><table><tbody><tr><td>foo</td></tr></tbody></table>',

      '<table><tbody><tr><td>#f</td></tr></tbody></table>': 
      '<table><tbody><tr><td>#<br></td></tr></tbody></table>',

      '<h1><strong>foo</strong></h1><div>#bar</div>': 
      '<h1><strong>foo</strong></h1><div>#ar</div>',

      '<h1><strong>foo#</strong></h1><div>bar</div>': 
      '<h1><strong>foo#</strong>bar</h1>'
    }

    function deleteTest(input, output, t) {
      QUnit.test(`${t}. DELETE ${input}`, function (assert) {
        const done = assert.async()
        const $editor = $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.MARKERS))
        $(document.body).append($editor)

        const editorInstance = new FroalaEditor('#edit', {
          QUnitCommonConfig,
          enter: FE.ENTER_DIV,
          events: {
            initialized: function () {
              const instance = this
              instance.events.trigger('keydown', [fooEvent(FE.KEYCODE.DELETE)])
              instance.events.trigger('keyup', [fooEvent(FE.KEYCODE.DELETE)])

              instance.markers.insert()
              instance.$el.find('.fr-marker').replaceWith('#')

              assert.expect(1)
              assert.equal(instance.$el.html().replace(/\u200B/g, '_'), output, 'OK.')

              instance.destroy()
              $editor.remove()

              done()
            }
          }
        })
      })
    }

    let t = 0
    for (const input in delete_div_cases) {
      deleteTest(input, delete_div_cases[input], ++t)
    }
  })