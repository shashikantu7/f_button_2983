import FE from '../../../../../src/js/editor.js'
import $ from '../../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('keys/backspace_div')

    const fooEvent = (which) =>{
      return {
        which: which,
        preventDefault: function () {},
        stopPropagation: function () {}
      }
    }

    const backspace_div_cases = {
      '<div>#foo bar</div>': 
      '<div>#foo bar</div>',

      '<div>foo #bar</div>': 
      '<div>foo#bar</div>',

      '<div>foo# bar</div>': 
      '<div>fo# bar</div>',

      '<div>foo bar#</div>': 
      '<div>foo ba#</div>',

      '<div>foo</div><div>#bar</div>': 
      '<div>foo#bar</div>',

      // 6.
      '<div>foo&nbsp;</div><div>#bar</div>': 
      '<div>foo #bar</div>',

      '<div>foo</div><div>b#ar</div>': 
      '<div>foo</div><div>#ar</div>',

      '<div>foo</div><div>bar#</div>': 
      '<div>foo</div><div>ba#</div>',

      '<div><strong>#foo</strong> bar</div>': 
      '<div><strong>#foo</strong> bar</div>',

      // 10.
      '<div><strong>foo#</strong> bar</div>': 
      '<div><strong>fo#</strong> bar</div>',

      '<div><strong>foo</strong># bar</div>': 
      '<div><strong>fo#</strong> bar</div>',

      '<div>foo <strong>#bar</strong></div>': 
      '<div>foo#<strong>bar</strong></div>',

      '<div>foo #<strong>bar</strong></div>': 
      '<div>foo#<strong>bar</strong></div>',

      '<div>foo <strong>bar#</strong></div>': 
      '<div>foo <strong>ba#</strong></div>',

      // 15.
      '<div>foo <strong>bar</strong>#</div>': 
      '<div>foo <strong>ba#</strong></div>',

      '<div>foo</div><div><strong>#bar</strong></div>': 
      '<div>foo<strong>#bar</strong></div>',

      '<div><strong>foo</strong></div><div>#bar</div>': 
      '<div><strong>foo</strong>#bar</div>',

      '<h1>#foo bar</h1>': 
      '<h1>#foo bar</h1>',

      '<h1>foo #bar</h1>': 
      '<h1>foo#bar</h1>',

      // 20.
      '<h1>foo bar#</h1>': 
      '<h1>foo ba#</h1>',

      '<h1>foo</h1><div>#bar</div>': 
      '<h1>foo#bar</h1>',

      '<div>foo bar</div><div>#<br></div>': 
      '<div>foo bar#</div>',

      '<div><br></div><div>#foo bar</div>': 
      '<div>#foo bar</div>',

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

      '<table><tbody><tr><td>foo</td></tr></tbody></table><div>#bar</div>': 
      '<table><tbody><tr><td>foo</td></tr></tbody></table><div>#bar</div>',

      // 30.
      '<table><tbody><tr><td>f#</td></tr></tbody></table>': 
      '<table><tbody><tr><td>#<br></td></tr></tbody></table>',

      '<h1><strong>foo</strong></h1><div>#bar</div>': 
      '<h1><strong>foo</strong>#bar</h1>',

      '<div><strong>foo</strong></div><div>#bar</div>': 
      '<div><strong>foo</strong>#bar</div>',

      // 33.
      '<h1><br></h1><p>#foo</p>': 
      '<p>#foo</p>',

      // 34.
      '<strong>foo</strong><div>#bar</div>': 
      '<div><strong>foo</strong>#bar</div>',

      // Selection

      '<h1>#foo</h1><div>bar <strong>foo$</strong></div><div>bar</div>': 
      '<h1>#<br></h1><div>bar</div>',

      '<h1>#foo</h1><div>bar <strong>fo$o</strong></div><div>bar</div>': 
      '<h1>#<strong>o</strong></h1><div>bar</div>',

      '<div>foo <strong>ba#r</strong> foo <strong>b$ar</strong></div>': 
      '<div>foo <strong>ba#</strong><strong>ar</strong></div>',

      '<ul><li>foo</li><li>ba#r</li></ul><div><a>foo $bar</a></div>': 
      '<ul><li>foo</li><li>ba#<a>bar</a></li></ul>',

      '<table><tbody><tr><td>f#oo</td></tr></tbody></table><div>ba$r</div>': 
      '<table><tbody><tr><td>f#</td></tr></tbody></table><div>r</div>',

      '<table><tbody><tr><td>fo#o</td><td>bar</td></tr></tbody></table><div>foo$ bar</div>': 
      '<table><tbody><tr><td>fo#</td><td><br></td></tr></tbody></table><div>&nbsp;bar</div>',

      '<div>foo# bar</div><table><tbody><tr><td>foo</td><td>b$ar</td></tr></tbody></table>': 
      '<div>foo#</div><table><tbody><tr><td><br></td><td>ar</td></tr></tbody></table>',

      '<div>a</div><div>&nbsp; &nbsp; #&nbsp;b</div>': 
      '<div>a</div><div>&nbsp; &nbsp;# b</div>'
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
          enter: FE.ENTER_DIV,
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
    for (const input in backspace_div_cases) {
      backspaceTest(input, backspace_div_cases[input], ++t)
    }
  })