import FroalaEditor from 'FroalaEditor'
import $ from '../../$'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {

    QUnit.module('comments')

    const allow_cases = {
      name: 'Allow comments',
      config: {
        htmlAllowComments: true
      },
      tests: {
        // ID 1.
        '<h1>foo</h1><!-- froala --><p>bar</p>': 
        '<h1>foo</h1><!-- froala --><p>bar</p>',

        // ID 1.
        '<h1>foo<!-- froala --></h1><p>bar</p>': 
        '<h1>foo<!-- froala --></h1><p>bar</p>',

        '<h1>foo</h1><!--&lt;link rel=\"stylesheet\" href=\"/cms/css/print.css\" type=\"text/css\" media=\"print\">-->': 
        '<h1>foo</h1><!--&lt;link rel=\"stylesheet\" href=\"/cms/css/print.css\" type=\"text/css\" media=\"print\">-->',

        '<!-- foo -->': 
        '<!-- foo -->'
      }
    }

    function testComments(id, config, input, expected) {
      QUnit.test(id, function (assert) {
        const done = assert.async()

        const $editor = $(document.createElement('div')).attr('id', 'edit').html(input)
        $(document.body).append($editor)

        new FroalaEditor('#edit', {
          config,
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this
              const output = instance.html.get()
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
        testComments(obj.name + ' ' + (++t), obj.config, input, obj.tests[input])
      }
    }

    runTest(allow_cases)
  })
