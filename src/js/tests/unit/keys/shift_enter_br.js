import FE from '../../../../../src/js/editor.js'
import $ from '../../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('keys/shift_enter_br')

    const fooEvent = (which, shiftKey) => {
      return {
        which: which,
        shiftKey: shiftKey,
        preventDefault: function () {},
        stopPropagation: function () {}
      }
    }

    const shift_enter_br_cases = {
      '#foo bar': 
      '<br>#foo bar',

      'foo #bar': 
      'foo <br>#bar',

      'foo bar#': 
      'foo bar<br>#<br>',

      'foo #<strong>bar</strong>': 
      'foo <br>#<strong>bar</strong>',

      'foo <strong>#bar</strong>': 
      'foo <br><strong>#bar</strong>',

      'foo <strong>b#ar</strong>': 
      'foo <strong>b</strong><br><strong>#ar</strong>',

      // 7.
      'foo <strong>bar#</strong>': 
      'foo <strong>bar</strong><br><strong>_#</strong><br>',

      'foo <strong>bar</strong>#': 
      'foo <strong>bar</strong><br>#<br>',

      'foo <strong><em>#bar</em></strong>': 
      'foo <br><strong><em>#bar</em></strong>',

      'foo <strong><em>b#ar</em></strong>': 
      'foo <strong><em>b</em></strong><br><strong><em>#ar</em></strong>',

      // 11.
      'foo <strong><em>bar#</em></strong>': 
      'foo <strong><em>bar</em></strong><br><strong><em>_#</em></strong><br>',

      '<h1>#foo bar</h1>': 
      '<h1><br>#foo bar</h1>',

      '<h1>foo# bar</h1>': 
      '<h1>foo<br>#&nbsp;bar</h1>',

      '<h1>foo bar#</h1>': 
      '<h1>foo bar<br>#<br></h1>',

      '<h1>foo <strong><em>#bar</em></strong></h1>': 
      '<h1>foo <br><strong><em>#bar</em></strong></h1>',

      '<h1>foo <strong><em>b#ar</em></strong></h1>': 
      '<h1>foo <strong><em>b</em></strong><br><strong><em>#ar</em></strong></h1>',

      // 17.
      '<h1>foo <strong><em>bar#</em></strong></h1>': 
      '<h1>foo <strong><em>bar</em></strong><br><strong><em>_#</em></strong><br></h1>',

      '<table><tbody><tr><td>foo #bar</td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo <br>#bar</td></tr></tbody></table>',

      '<table><tbody><tr><td>#foo bar</td></tr></tbody></table>': 
      '<table><tbody><tr><td><br>#foo bar</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo bar#</td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo bar<br>#<br></td></tr></tbody></table>',

      'froala#<table><tbody><tr><td>foo bar</td></tr></tbody></table>': 
      'froala<br>#<br><table><tbody><tr><td>foo bar</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo bar</td></tr></tbody></table>#froala': 
      '<table><tbody><tr><td>foo bar</td></tr></tbody></table><br>#froala'
    }

    function shift_enterTest(input, output, t) {
      QUnit.test(`${t}. SHIFT + ENTER ${input}`, function (assert) {
        const done = assert.async()

        const $editor = $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.MARKERS))
        $(document.body).append($editor)

        const editorInstance = new FroalaEditor('#edit', {
          QUnitCommonConfig,
          enter: FE.ENTER_BR,
          events: {
            initialized: function () {
              const instance = this
              instance.events.trigger('keydown', [fooEvent(FE.KEYCODE.ENTER, FE.KEYCODE.SHIFT)])

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
    for (const input in shift_enter_br_cases) {
      shift_enterTest(input, shift_enter_br_cases[input], ++t)
    }
  })