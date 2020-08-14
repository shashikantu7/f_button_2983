import FE from '../../../../../src/js/editor.js'
import $ from '../../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('keys/backspace_br')

    const fooEvent = (which) => {
      return {
        which: which,
        preventDefault: () => {},
        stopPropagation: () => {}
      }
    }

    const backspace_p_cases = {
      '#foo bar': 
      '#foo bar',

      'foo #bar': 
      'foo#bar',

      'foo# bar': 
      'fo# bar',

      'foo bar#': 
      'foo ba#',

      'foo<br>#bar': 
      'foo#bar',

      'foo <br>#bar': 
      'foo#bar',

      'foo<br>b#ar': 
      'foo<br>#ar',

      'foo<br>bar#': 
      'foo<br>ba#',

      '<strong>#foo</strong> bar': 
      '<strong>#foo</strong> bar',

      '<strong>foo#</strong> bar': 
      '<strong>fo#</strong> bar',

      '<strong>foo</strong># bar': 
      '<strong>fo#</strong> bar',

      'foo <strong>#bar</strong>': 
      'foo#<strong>bar</strong>',

      'foo #<strong>bar</strong>': 
      'foo#<strong>bar</strong>',

      'foo <strong>bar#</strong>': 
      'foo <strong>ba#</strong>',

      'foo <strong>bar</strong>#': 
      'foo <strong>ba#</strong>',

      'foo<br><strong>#bar</strong>': 
      'foo#<strong>bar</strong>',

      '<strong>foo</strong><br>#bar': 
      '<strong>foo</strong>#bar',

      '<h1>#foo bar</h1>': 
      '<h1>#foo bar</h1>',

      '<h1>foo #bar</h1>': 
      '<h1>foo#bar</h1>',

      '<h1>foo bar#</h1>': 
      '<h1>foo ba#</h1>',

      '<h1>foo</h1>#bar': 
      '<h1>foo#bar</h1>',

      'foo bar<br>#': 
      'foo bar#',

      '<br>#foo bar': 
      '#foo bar',

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

      '<table><tbody><tr><td>foo</td></tr></tbody></table>#bar': 
      '<table><tbody><tr><td>foo</td></tr></tbody></table>#bar',

      '<table><tbody><tr><td>f#</td></tr></tbody></table>': 
      '<table><tbody><tr><td>#<br></td></tr></tbody></table>',

      '<h1><strong>foo</strong></h1>#bar': 
      '<h1><strong>foo</strong>#bar</h1>',

      '<strong>foo</strong><br>#bar': 
      '<strong>foo</strong>#bar',

      '<h1><br></h1>#foo': 
      '#foo',

      '<h1><br></h1>#<br>foobar': 
      '#<br>foobar',

      '<strong>foo</strong><br>#bar': 
      '<strong>foo</strong>#bar',

      // Selection
      '#foo bar$': 
      '#<br>',

      '<h1>#foo</h1>bar <strong>foo$</strong><br>bar': 
      '<h1>#<br></h1>bar',

      '<h1>#foo</h1>bar <strong>fo$o</strong><br>bar': 
      '<h1>#<strong>o</strong></h1>bar',

      'foo <strong>ba#r</strong> foo <strong>b$ar</strong>': 
      'foo <strong>ba#</strong><strong>ar</strong>',

      '<ul><li>foo</li><li>ba#r</li></ul><br><a>foo $bar</a>': 
      '<ul><li>foo</li><li>ba#<a>bar</a></li></ul>',

      '<table><tbody><tr><td>f#oo</td></tr></tbody></table>ba$r': 
      '<table><tbody><tr><td>f#</td></tr></tbody></table>r',

      '<table><tbody><tr><td>fo#o</td><td>bar</td></tr></tbody></table>foo$ bar': 
      '<table><tbody><tr><td>fo#</td><td><br></td></tr></tbody></table>&nbsp;bar',

      'foo# bar<table><tbody><tr><td>foo</td><td>b$ar</td></tr></tbody></table>': 
      'foo#<table><tbody><tr><td><br></td><td>ar</td></tr></tbody></table>',

      'a<br>&nbsp; &nbsp; #&nbsp;b': 
      'a<br>&nbsp; &nbsp;# b',

      'a<br>&nbsp;# b': 
      'a<br>#&nbsp;b'
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
          enter: FE.ENTER_BR,
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