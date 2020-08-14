import FE from '../../../../../src/js/editor.js'
import $ from '../../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('keys/backspace_p')

    const fooEvent = (which) => {
      return {
        which: which,
        preventDefault: function () {},
        stopPropagation: function () {}
      }
    }

    const backspace_p_cases = {
      '<p>#foo bar</p>': 
      '<p>#foo bar</p>',

      '<p>foo #bar</p>': 
      '<p>foo#bar</p>',

      '<p>foo# bar</p>': 
      '<p>fo# bar</p>',

      '<p>foo bar#</p>': 
      '<p>foo ba#</p>',

      '<p>foo</p><p>#bar</p>': 
      '<p>foo#bar</p>',

      '<p>foo&nbsp;</p><p>#bar</p>': 
      '<p>foo #bar</p>',

      '<p>foo</p><p>b#ar</p>': 
      '<p>foo</p><p>#ar</p>',

      '<p>foo</p><p>bar#</p>': 
      '<p>foo</p><p>ba#</p>',

      '<p><strong>#foo</strong> bar</p>': 
      '<p><strong>#foo</strong> bar</p>',

      '<p><strong>foo#</strong> bar</p>': 
      '<p><strong>fo#</strong> bar</p>',

      '<p><strong>foo</strong># bar</p>': 
      '<p><strong>fo#</strong> bar</p>',

      '<p>foo <strong>#bar</strong></p>': 
      '<p>foo#<strong>bar</strong></p>',

      '<p>foo #<strong>bar</strong></p>': 
      '<p>foo#<strong>bar</strong></p>',

      '<p>foo <strong>bar#</strong></p>': 
      '<p>foo <strong>ba#</strong></p>',

      '<p>foo <strong>bar</strong>#</p>': 
      '<p>foo <strong>ba#</strong></p>',

      '<p>foo</p><p><strong>#bar</strong></p>': 
      '<p>foo<strong>#bar</strong></p>',

      '<p><strong>foo</strong></p><p>#bar</p>': 
      '<p><strong>foo</strong>#bar</p>',

      // 18.
      '<h1>#foo bar</h1>': 
      '<h1>#foo bar</h1>',

      '<h1>foo #bar</h1>': 
      '<h1>foo#bar</h1>',

      '<h1>foo bar#</h1>': 
      '<h1>foo ba#</h1>',

      '<h1>foo</h1><p>#bar</p>': 
      '<h1>foo#bar</h1>',

      '<p>foo bar</p><p>#<br></p>': 
      '<p>foo bar#</p>',

      '<p><br></p><p>#foo bar</p>': 
      '<p>#foo bar</p>',

      // 24.
      '<table><tbody><tr><td>#foo bar</td></tr></tbody></table>': 
      '<table><tbody><tr><td>#foo bar</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo b#ar</td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo #ar</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo bar#</td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo ba#</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo</td><td>#bar</td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo</td><td>#bar</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo#</td><td>bar</td></tr></tbody></table>': 
      '<table><tbody><tr><td>fo#</td><td>bar</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo</td><td>bar#</td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo</td><td>ba#</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo</td></tr></tbody></table><p>#bar</p>': 
      '<table><tbody><tr><td>foo</td></tr></tbody></table><p>#bar</p>',

      '<table><tbody><tr><td>f#</td></tr></tbody></table>': 
      '<table><tbody><tr><td>#<br></td></tr></tbody></table>',

      // 32.
      '<h1><strong>foo</strong></h1><p>#bar</p>': 
      '<h1><strong>foo</strong>#bar</h1>',

      '<p><strong>foo</strong></p><p>#bar</p>': 
      '<p><strong>foo</strong>#bar</p>',

      '<h1><br></h1><p>#foo</p>': 
      '<p>#foo</p>',

      '<strong>foo</strong><p>#bar</p>': 
      '<p><strong>foo</strong>#bar</p>',

      // Selection
      '<p>#foo bar$</p>': 
      '<p>#<br></p>',

      '<p>#foo $bar</p>': 
      '<p>#bar</p>',

      '<p>foo&nbsp; &nbsp;#<strong>bar</strong></p>': 
      '<p>foo &nbsp;#<strong>bar</strong></p>',

      '<h1>#foo</h1><p>bar <strong>foo$</strong></p><p>bar</p>': 
      '<h1>#<br></h1><p>bar</p>',

      '<h1>#foo</h1><p>bar <strong>fo$o</strong></p><p>bar</p>': 
      '<h1>#<strong>o</strong></h1><p>bar</p>',

      '<p>foo <strong>ba#r</strong> foo <strong>b$ar</strong></p>': 
      '<p>foo <strong>ba#</strong><strong>ar</strong></p>',

      // 41.
      '<ul><li>foo</li><li>ba#r</li></ul><p><a>foo $bar</a></p>': 
      '<ul><li>foo</li><li>ba#<a>bar</a></li></ul>',

      '<table><tbody><tr><td>f#oo</td></tr></tbody></table><p>ba$r</p>': 
      '<table><tbody><tr><td>f#</td></tr></tbody></table><p>r</p>',

      '<table><tbody><tr><td>fo#o</td><td>bar</td></tr></tbody></table><p>foo$ bar</p>': 
      '<table><tbody><tr><td>fo#</td><td><br></td></tr></tbody></table><p>&nbsp;bar</p>',

      '<p>foo# bar</p><table><tbody><tr><td>foo</td><td>b$ar</td></tr></tbody></table>': 
      '<p>foo#</p><table><tbody><tr><td><br></td><td>ar</td></tr></tbody></table>',

      '<p>a</p><p>&nbsp; &nbsp; #&nbsp;b</p>': 
      '<p>a</p><p>&nbsp; &nbsp;# b</p>',

      '<p>foo b a r#</p>': 
      '<p>foo b a&nbsp;#</p>'
    }

    function backspaceTest(input, output, t) {
      QUnit.test(`${t}. BACKSPACE ${input}`, function (assert) {
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
              instance.events.trigger('keydown', [fooEvent(FE.KEYCODE.BACKSPACE)])
              instance.events.trigger('keyup', [fooEvent(FE.KEYCODE.BACKSPACE)])

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
    for (const input in backspace_p_cases) {
      backspaceTest(input, backspace_p_cases[input], ++t)
    }
  })