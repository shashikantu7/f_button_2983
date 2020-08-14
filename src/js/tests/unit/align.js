import FE from '../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../$'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('align')

    const align_test_cases = {
      'left': 'text-align: left',
      'right': 'text-align: right',
      'center': 'text-align: center',
      'justify': 'text-align: justify'
    }

    function align_test(input, output, t) {

      QUnit.test(`${t}. Text Align ${input}`, function (assert) {
        const done = assert.async()

        const $editor = $(document.createElement('div')).attr('id', 'edit').attr('class','test_node').attr('style',`text-align:${input}`).html(`<p>${FE.MARKERS}bar<p>`)
        $(document.body).append($editor)

        new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this
              
              instance.align.apply(input)

              const elementStyle = instance.selection.element().style.cssText
              let result = false

              if (elementStyle.indexOf(output) === 0) {
                result = true
              }

              assert.expect(1)
              assert.equal(true, result, 'OK')

              instance.destroy()
              $editor.remove()

              done()
            }
          }
        })

      })
    }

    let t=0
    for (const input in align_test_cases) {
      align_test(input, align_test_cases[input], ++t)
    }
  })