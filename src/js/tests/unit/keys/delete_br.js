import FE from '../../../../../src/js/editor.js'
import $ from '../../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('keys/delete_br')

    const fooEvent = (which) => {
      return {
        which: which,
        preventDefault: function () {},
        stopPropagation: function () {}
      }
    }

    const delete_br_cases = {
      '#foo bar': 
      '#oo bar',

      'foo #bar': 
      'foo #ar',

      'foo# bar': 
      'foo#bar',

      'foo bar#': 
      'foo bar#',

      'foo#<br>bar': 
      'foo#bar',

      'foo #<br>bar': 
      'foo #bar',

      'foo<br>#bar': 
      'foo<br>#ar',

      'foo<br>bar#': 
      'foo<br>bar#',

      '<strong>#foo</strong> bar': 
      '<strong>#oo</strong> bar',

      '<strong>foo#</strong> bar': 
      '<strong>foo</strong>#bar',

      '<strong>foo</strong># bar': 
      '<strong>foo</strong>#bar',

      '<strong>#foo</strong> bar': 
      '<strong>#oo</strong> bar',

      'foo <strong>#bar</strong>': 
      'foo <strong>#ar</strong>',

      'foo #<strong>bar</strong>': 
      'foo <strong>#ar</strong>',

      'foo <strong>bar#</strong>': 
      'foo <strong>bar#</strong>',

      'foo <strong>bar</strong>#': 
      'foo <strong>bar</strong>#',

      'foo<br><strong>#bar</strong>': 
      'foo<br><strong>#ar</strong>',

      'foo#<br><strong>bar</strong>': 
      'foo#<strong>bar</strong>',

      '<strong>foo</strong><br>#bar': 
      '<strong>foo</strong><br>#ar',

      '<strong>foo#</strong><br>bar': 
      '<strong>foo</strong>#bar',

      '<h1>#foo bar</h1>': 
      '<h1>#oo bar</h1>',

      '<h1>foo #bar</h1>': 
      '<h1>foo #ar</h1>',

      '<h1>foo bar#</h1>': 
      '<h1>foo bar#</h1>',

      '<h1>foo</h1>#bar': 
      '<h1>foo</h1>#ar',

      '<h1>foo#</h1>bar': 
      '<h1>foo#bar</h1>',

      'foo bar<br>#<br>': 
      'foo bar<br>#<br>',

      'foo bar#<br>': 
      'foo bar#<br>',

      '<br><br>#foo bar': 
      '<br><br>#oo bar',

      '#<br><br>foo bar': 
      '#<br>foo bar',

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

      '<table><tbody><tr><td>foo</td></tr></tbody></table>#bar': 
      '<table><tbody><tr><td>foo</td></tr></tbody></table>#ar',

      'bar#<table><tbody><tr><td>foo</td></tr></tbody></table>': 
      'bar#<table><tbody><tr><td>foo</td></tr></tbody></table>',

      '#<br><table><tbody><tr><td>foo</td></tr></tbody></table>': 
      '#<table><tbody><tr><td>foo</td></tr></tbody></table>',

      '<table><tbody><tr><td>#f</td></tr></tbody></table>': 
      '<table><tbody><tr><td>#<br></td></tr></tbody></table>',

      '<h1><strong>foo</strong></h1>#bar': 
      '<h1><strong>foo</strong></h1>#ar',

      '<h1><strong>foo#</strong></h1>bar': 
      '<h1><strong>foo#</strong>bar</h1>',

      '<h1>foo#</h1><strong>bar</strong><br>bar': 
      '<h1>foo#<strong>bar</strong></h1>bar',

      '<h1>foo#</h1><strong>bar</strong>foo<br>bar': 
      '<h1>foo#<strong>bar</strong>foo</h1>bar'
    }

    function deleteTest(input, output, t) {
      QUnit.test(`${t}. DELETE ${input}`, function (assert) {
        const done = assert.async()
        const $editor = $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.MARKERS))
        $(document.body).append($editor)

        const editorInstance = new FroalaEditor('#edit', {
          QUnitCommonConfig,
          enter: FE.ENTER_BR,
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
    for (const input in delete_br_cases) {
      deleteTest(input, delete_br_cases[input], ++t)
    }
  })