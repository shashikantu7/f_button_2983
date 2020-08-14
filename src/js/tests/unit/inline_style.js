import FE from '../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../$.js'

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('inline_style')

    const basic_tests = {
      name: 'inline_style',
      config: {},
      tests: {
      '<p>hello</p>':'<p><span style="font-weight: bold;">hello</span></p>'
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
              instance.inlineStyle.apply('id: style6 ;  font-weight:bold;  ')
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

    function runTest(obj) {
      let t = 0
      for (const input in obj.tests) {
        testFormat(`${obj.name} ${(++t)}`, obj.config, input, obj.tests[input])
      }
    }

    runTest(basic_tests)
  })