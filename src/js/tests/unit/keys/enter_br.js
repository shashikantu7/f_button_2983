import FE from '../../../../../src/js/editor.js'
import $ from '../../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('keys/enter_br')

    const fooEvent = (which) => {
      return {
        which: which,
        preventDefault: function () {},
        stopPropagation: function () {}
      }
    }

    const enter_br_cases = {
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

      'foo <strong>bar#</strong>': 
      'foo <strong>bar</strong><br><strong>_#</strong><br>',

      'foo <strong>bar</strong>#': 
      'foo <strong>bar</strong><br>#<br>',

      'foo <strong><em>#bar</em></strong>': 
      'foo <br><strong><em>#bar</em></strong>',

      'foo <strong><em>b#ar</em></strong>': 
      'foo <strong><em>b</em></strong><br><strong><em>#ar</em></strong>',

      'foo <strong><em>bar#</em></strong>': 
      'foo <strong><em>bar</em></strong><br><strong><em>_#</em></strong><br>',

      'foo <strong>bar#</strong><p>asd</p>': 
      'foo <strong>bar</strong><br><strong>_#</strong><p>asd</p>',

      '<a href="foo">bar#</a>': 
      '<a href="foo">bar</a><br>#<br>',

      'foo<h1>#</h1>bar': 
      'foo<h1><br></h1>#<br>bar',

      '<h1>#foo bar</h1>': 
      '<h1><br></h1><h1>#foo bar</h1>',

      '<h1>foo# bar</h1>': 
      '<h1>foo</h1><h1>#&nbsp;bar</h1>',

      '<h1>foo bar#</h1>': 
      '<h1>foo bar</h1>#<br>',

      '<h1>foo <strong><em>#bar</em></strong></h1>': 
      '<h1>foo&nbsp;</h1><h1><strong><em>#bar</em></strong></h1>',

      '<h1>foo <strong><em>b#ar</em></strong></h1>': 
      '<h1>foo <strong><em>b</em></strong></h1><h1><strong><em>#ar</em></strong></h1>',

      '<h1>foo <strong><em>bar#</em></strong></h1>': 
      '<h1>foo <strong><em>bar</em></strong></h1><strong><em>_#</em></strong><br>',

      '<table><tbody><tr><td>foo #bar</td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo <br>#bar</td></tr></tbody></table>',

      '<table><tbody><tr><td>#foo bar</td></tr></tbody></table>': 
      '<table><tbody><tr><td><br>#foo bar</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo bar#</td></tr></tbody></table>': 
      '<table><tbody><tr><td>foo bar<br>#<br></td></tr></tbody></table>',

      'froala#<table><tbody><tr><td>foo bar</td></tr></tbody></table>': 
      'froala<br>#<br><table><tbody><tr><td>foo bar</td></tr></tbody></table>',

      '<strong>froala#</strong><table><tbody><tr><td>foo bar</td></tr></tbody></table>': 
      '<strong>froala</strong><br><strong>_#</strong><table><tbody><tr><td>foo bar</td></tr></tbody></table>',

      '<table><tbody><tr><td>foo bar</td></tr></tbody></table>#froala': 
      '<table><tbody><tr><td>foo bar</td></tr></tbody></table><br>#froala',

      '<pre>foo#</pre>': 
      '<pre>foo<br>#<br></pre>'
    }

    function enterTest(input, output, t) {
      QUnit.test(`${t}. ENTER ${input}`, function (assert) {
        const done = assert.async()
        const $editor = $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.MARKERS))
        $(document.body).append($editor)

        const editorInstance = new FroalaEditor('#edit', {
          QUnitCommonConfig,
          enter: FE.ENTER_BR,
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
    for (const input in enter_br_cases) {
      enterTest(input, enter_br_cases[input], ++t)
    }
  })