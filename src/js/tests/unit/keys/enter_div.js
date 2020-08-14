import FE from '../../../../../src/js/editor.js'
import $ from '../../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('keys/enter_div')

    const fooEvent = (which) => {
      return {
        which: which,
        preventDefault: function () {},
        stopPropagation: function () {}
      }
    }

    const enter_div_cases = {
      '<div>#foo bar</div>': 
      '<div><br></div><div>#foo bar</div>',

      '<div>foo #bar</div>': 
      '<div>foo&nbsp;</div><div>#bar</div>',

      '<div>foo bar#</div>': 
      '<div>foo bar</div><div>#<br></div>',

      '<div>foo #<strong>bar</strong></div>': 
      '<div>foo&nbsp;</div><div>#<strong>bar</strong></div>',

      '<div>foo <strong>#bar</strong></div>': 
      '<div>foo&nbsp;</div><div><strong>#bar</strong></div>',

      '<div>foo <strong>b#ar</strong></div>': 
      '<div>foo <strong>b</strong></div><div><strong>#ar</strong></div>',

      '<div>foo <strong>bar#</strong></div>': 
      '<div>foo <strong>bar</strong></div><div><strong>_#</strong><br></div>',

      '<div>foo <strong>bar</strong>#</div>': 
      '<div>foo <strong>bar</strong></div><div>#<br></div>',

      '<div>foo <strong><em>#bar</em></strong></div>': 
      '<div>foo&nbsp;</div><div><strong><em>#bar</em></strong></div>',

      '<div>foo <strong><em>b#ar</em></strong></div>': 
      '<div>foo <strong><em>b</em></strong></div><div><strong><em>#ar</em></strong></div>',

      '<div>foo <strong><em>bar#</em></strong></div>': 
      '<div>foo <strong><em>bar</em></strong></div><div><strong><em>_#</em></strong><br></div>',

      '<h1>#foo bar</h1>': 
      '<h1><br></h1><h1>#foo bar</h1>',

      '<h1>foo# bar</h1>': 
      '<h1>foo</h1><h1>#&nbsp;bar</h1>',

      '<h1>foo bar#</h1>': 
      '<h1>foo bar</h1><div>#<br></div>',

      '<h1>foo <strong><em>#bar</em></strong></h1>': 
      '<h1>foo&nbsp;</h1><h1><strong><em>#bar</em></strong></h1>',

      '<h1>foo <strong><em>b#ar</em></strong></h1>': 
      '<h1>foo <strong><em>b</em></strong></h1><h1><strong><em>#ar</em></strong></h1>',

      '<h1>foo <strong><em>bar#</em></strong></h1>': 
      '<h1>foo <strong><em>bar</em></strong></h1><div><strong><em>_#</em></strong><br></div>',

      '<table><tbody><tr><td>foo #bar</td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo <br>#bar</td></tr></tbody></table>',

      '<table><tbody><tr><td>#foo bar</td></tr></tbody></table>': 
      '<table><tbody><tr><td><br>#foo bar</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo bar#</td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo bar<br>#<br></td></tr></tbody></table>',

      '<div>froala#</div><table><tbody><tr><td>foo bar</td></tr></tbody></table>': 
      '<div>froala</div><div>#<br></div><table><tbody><tr><td>foo bar</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo bar</td></tr></tbody></table><div>#froala</div>': 
      '<table><tbody><tr><td>foo bar</td></tr></tbody></table><div><br></div><div>#froala</div>'
    }

    function enterTest(input, output, t) {
      QUnit.test(`${t}. ENTER ${input}`, function (assert) {
        const done = assert.async()
        const $editor = $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.MARKERS))
        $(document.body).append($editor)

        const editorInstance = new FroalaEditor('#edit', {
          QUnitCommonConfig,
          enter: FE.ENTER_DIV,
          events: {
            initialized: function () {
              const instance = this
              instance.events.trigger('keydown', [fooEvent(FE.KEYCODE.ENTER)])

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
    for (const input in enter_div_cases) {
      enterTest(input, enter_div_cases[input], ++t)
    }
  })