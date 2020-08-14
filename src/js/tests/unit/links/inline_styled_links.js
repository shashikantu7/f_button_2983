import FE from '../../../../../src/js/editor.js'
import $ from '../../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('links/inline_styled_links')

    const test_cases = {
      '<p>What does the fox say?#</p>': '<p><a href="http://google.com"><span style="font-size: 20px; color: red;">What does the fox say?</span></a></p>',
    }

    function inline_styled_links_test(input, output, t) {
      QUnit.test(`${t}. Inline Styled Links ${input}`, function (assert) {
        const done = assert.async()
        const $editor = $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.MARKERS))
        $(document.body).append($editor)

        const editorInstance = new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this
              instance.html.wrap()
              instance.doc.execCommand('selectAll', false, false)
              instance.selection.save()
              instance.inlineStyle.apply('font-size: 20px; color: red;')
              instance.link.showInsertPopup()
              const $popup = instance.popups.get('link.insert')
              const text_inputs = $popup.find('input.fr-link-attr[type="text"]')
              text_inputs.filter('[name="href"]').val("google.com")
              instance.link.insertCallback()

              const actual_output = instance.$el.html()

              assert.expect(1)
              assert.equal(actual_output, output, 'OK')

              instance.destroy()
              $editor.remove()

              done()
            }
          }
        })
      })
    }

    let t = 0
    for (const input in test_cases) {
      inline_styled_links_test(input, test_cases[input], ++t)
    }
  })