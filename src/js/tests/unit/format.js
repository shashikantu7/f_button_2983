import FE from '../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../$.js'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('format')

    const basic_tests = {
      name: 'format',
      config: {},
      tests: {
        // ID 1.
        '<span style="font-size: 10px;">Line1</span><br><br><table style="width: 100%;"><tbody><tr><td style="width: 100%;">Table</td></tr></tbody></table>Line2': 
        '<span style="font-size: 18px;">Line1<br><br></span><table style="width: 100%;"><tbody><tr><td style="width: 100%;"><span style="font-size: 18px;">Table</span></td></tr></tbody></table><span style="font-size: 18px;">Line2</span>',

        //ID 2
        '<div>foo<div>bar</div>asd</div>': 
        '<div><span style="font-size: 18px;">foo</span><div><span style="font-size: 18px;">bar</span></div><span style="font-size: 18px;">asd</span></div>'
      }
    }

    function testFormat(id, config, input, expected) {
      QUnit.test(id, function (assert) {

        const done = assert.async()
        const $editor = $(document.createElement('div')).attr('id', 'edit').html(FE.MARKERS)
        $(document.body).append($editor)

        const editorInstance = new FroalaEditor('#edit', {
          enter: FE.ENTER_BR,
          config,
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this
              instance.$el.html(input)
              instance.html.wrap()
              instance.doc.execCommand('selectAll', false, false)
              instance.selection.save()
              instance.format.applyStyle('font-size', '18px')
              const output = instance.$el.html()
              assert.expect(1)
              assert.equal(output, expected, 'OK.')

              instance.destroy()
              $editor.remove()

              done()
            }
          }
        })
        
      })
    }

    const runTest = (obj) => {
      let t = 0
      for (const input in obj.tests) {
        testFormat(`${obj.name} ${(++t)}`, obj.config, input, obj.tests[input])
      }
    }

    runTest(basic_tests)
  })