import FE from '../../../../../src/js/editor.js'
import $ from '../../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('keys/backspace_i')

    const fooEvent = (which) => {
      return {
        which: which,
        preventDefault: function () {},
        stopPropagation: function () {}
      }
    }

    const backspace_i_cases = {
      '<p><i class="ui down chevron icon fr-deletable" contenteditable="false"></i></p><p>#<br></p>': 
      '<p><i class="ui down chevron icon fr-deletable" contenteditable="false"></i>#</p>'
    }

    function backspaceiTest(input, output, t) {
      QUnit.test(`${t}. BACKSPACE ${input}`, function (assert) {
        const done = assert.async()

        const $editor =
          input.indexOf('$') >= 0 ?
          $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.START_MARKER).replace('$', FE.END_MARKER)) :
          $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.MARKERS))
        $(document.body).append($editor)

        const editorInstance = new FroalaEditor('#edit', {
          QUnitCommonConfig,
          htmlAllowedEmptyTags: ['textarea', 'a', 'iframe', 'object', 'video', 'style', 'script', '.fa', 'i'],
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
    for (const input in backspace_i_cases) {
      backspaceiTest(input, backspace_i_cases[input], ++t)
    }
  })