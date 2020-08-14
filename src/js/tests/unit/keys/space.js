import FE from '../../../../../src/js/editor.js'
import $ from '../../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('keys/space')

    const fooEvent = (which) => {
      return {
        which: which,
        preventDefault: function () {},
        stopPropagation: function () {}
      }
    }

    const space_cases = {
      '<p>#foo bar</p>': '<p>&nbsp;#foo bar</p>',

      '<p> #foo bar</p>': '<p>&nbsp; #foo bar</p>',

      '<p>foo #bar</p>': '<p>foo &nbsp;#bar</p>',

      '<p>foo# bar</p>': '<p>foo #&nbsp;bar</p>',

      '<p>foo bar#</p>': '<p>foo bar&nbsp;#</p>',

      '<p>foo bar #</p>': '<p>foo bar &nbsp;#</p>',

      '<p>foo bar  #</p>': '<p>foo bar &nbsp;&nbsp;#</p>',

      '<p>foo bar   #</p>': '<p>foo bar &nbsp; &nbsp;#</p>',

      '<p>foo bar    #</p>': '<p>foo bar &nbsp; &nbsp;&nbsp;#</p>'
    }

    function spaceTest(input, output, t) {
      QUnit.test(`${t}. SPACE ${input}`, function (assert) {

        const done = assert.async()

        const $editor = $(document.createElement('div')).attr('id', 'edit')
        $(document.body).append($editor)

        const editorInstance = new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this
              instance.browser.mozilla = true
              instance.$el.html(input.replace('#', FE.MARKERS))
              instance.spaces.normalize()
              instance.selection.restore()

              instance.events.trigger('keydown', [fooEvent(FE.KEYCODE.SPACE)])

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
    for (const input in space_cases) {
      spaceTest(input, space_cases[input], ++t)
    }
  })