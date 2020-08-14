import FE from '../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../$.js'

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('./modules/core/helpers')

    const basic_tests = {
      name: 'screensize',
      config: {},
      tests: {
      '494':'0',
      '800':'1',
      '1080':'2',
      '1400':'3',
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
              instance.$('#edit').css('width', input) 
              const output = instance.helpers.screenSize()
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