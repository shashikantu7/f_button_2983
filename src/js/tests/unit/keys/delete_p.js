import FE from '../../../../../src/js/editor.js'
import $ from '../../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('keys/delete_p')

    const fooEvent = (which) => {
      return {
        which: which,
        preventDefault: function () {},
        stopPropagation: function () {}
      }
    }

    const delete_p_cases = {
      '<p>#foo bar</p>': 
      '<p>#oo bar</p>',

      '<p>foo #bar</p>': 
      '<p>foo #ar</p>',

      '<p>foo# bar</p>': 
      '<p>foo#bar</p>',

      '<p>foo bar#</p>': 
      '<p>foo bar#</p>',

      '<p>foo#</p><p>bar</p>': 
      '<p>foo#bar</p>',

      '<p>foo #</p><p>bar</p>': 
      '<p>foo #bar</p>',

      '<p>foo</p><p>#bar</p>': 
      '<p>foo</p><p>#ar</p>',

      '<p>foo</p><p>bar#</p>': 
      '<p>foo</p><p>bar#</p>',

      '<p><strong>#foo</strong> bar</p>': 
      '<p><strong>#oo</strong> bar</p>',

      '<p><strong>foo#</strong> bar</p>': 
      '<p><strong>foo</strong>#bar</p>',

      '<p><strong>foo</strong># bar</p>': 
      '<p><strong>foo</strong>#bar</p>',

      '<p><strong>#foo</strong> bar</p>': 
      '<p><strong>#oo</strong> bar</p>',

      '<p>foo <strong>#bar</strong></p>': 
      '<p>foo <strong>#ar</strong></p>',

      '<p>foo #<strong>bar</strong></p>': 
      '<p>foo <strong>#ar</strong></p>',

      '<p>foo <strong>bar#</strong></p>': 
      '<p>foo <strong>bar#</strong></p>',

      '<p>foo <strong>bar</strong>#</p>': 
      '<p>foo <strong>bar</strong>#</p>',

      '<p>foo</p><p><strong>#bar</strong></p>': 
      '<p>foo</p><p><strong>#ar</strong></p>',

      '<p>foo#</p><p><strong>bar</strong></p>': 
      '<p>foo#<strong>bar</strong></p>',

      '<p><strong>foo</strong></p><p>#bar</p>': 
      '<p><strong>foo</strong></p><p>#ar</p>',

      '<p><strong>foo#</strong></p><p>bar</p>': 
      '<p><strong>foo#</strong>bar</p>',

      '<h1>#foo bar</h1>': 
      '<h1>#oo bar</h1>',

      '<h1>foo #bar</h1>': 
      '<h1>foo #ar</h1>',

      '<h1>foo bar#</h1>': 
      '<h1>foo bar#</h1>',

      '<h1>foo</h1><p>#bar</p>': 
      '<h1>foo</h1><p>#ar</p>',

      '<h1>foo#</h1><p>bar</p>': 
      '<h1>foo#bar</h1>',

      '<p>foo bar</p><p>#<br></p>': 
      '<p>foo bar</p><p>#<br></p>',

      '<p>foo bar#</p><p><br></p>': 
      '<p>foo bar#</p>',

      '<p><br></p><p>#foo bar</p>': 
      '<p><br></p><p>#oo bar</p>',

      '<p>#<br></p><p>foo bar</p>': 
      '<p>#foo bar</p>',

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

      '<table><tbody><tr><td>foo</td></tr></tbody></table><p>#bar</p>': 
      '<table><tbody><tr><td>foo</td></tr></tbody></table><p>#ar</p>',

      '<p>bar#</p><table><tbody><tr><td>foo</td></tr></tbody></table>': 
      '<p>bar#</p><table><tbody><tr><td>foo</td></tr></tbody></table>',

      '<p>#<br></p><table><tbody><tr><td>foo</td></tr></tbody></table>': 
      '<p>#<br></p><table><tbody><tr><td>foo</td></tr></tbody></table>',

      '<table><tbody><tr><td>#f</td></tr></tbody></table>': 
      '<table><tbody><tr><td>#<br></td></tr></tbody></table>',

      '<h1><strong>foo</strong></h1><p>#bar</p>': 
      '<h1><strong>foo</strong></h1><p>#ar</p>',

      '<h1><strong>foo#</strong></h1><p>bar</p>': 
      '<h1><strong>foo#</strong>bar</h1>',

      '<h1>#<br></h1><p>foo</p>': 
      '<h1>#foo</h1>',

      // Selection
      '<p>#foo bar$</p>': 
      '<p>#<br></p>',

      '<p>#foo $bar</p>': 
      '<p>#bar</p>'
    }

    function deleteTest(input, output, t) {
      QUnit.test(`${t}. DELETE ${input}`, function (assert) {
        const done = assert.async()

        const $editor =
          input.indexOf('$') >= 0 ?
          $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.START_MARKER).replace('$', FE.END_MARKER)) :
          $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.MARKERS))
        $(document.body).append($editor)

        const editorInstance = new FroalaEditor('#edit', {
          QUnitCommonConfig,
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
    for (const input in delete_p_cases) {
      deleteTest(input, delete_p_cases[input], ++t)
    }
  })