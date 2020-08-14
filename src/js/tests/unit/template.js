import FE from '../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../$.js'

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('./modules/html/core')

    const basic_tests = {
      name: 'template',
      config: {},
      tests: {
          '<template></template>':'<span class="fr-marker" data-id="0" data-type="false" style="display: none; line-height: 0;">​</span><span class="fr-marker" data-id="0" data-type="true" style="display: none; line-height: 0;">​</span><template></template>',
          '<template>hello</template>':'<span class="fr-marker" data-id="0" data-type="false" style="display: none; line-height: 0;">​</span><span class="fr-marker" data-id="0" data-type="true" style="display: none; line-height: 0;">​</span><template>hello</template>'
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
              instance.html.cleanEmptyTags()
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