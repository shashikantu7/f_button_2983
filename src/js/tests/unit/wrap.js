import FroalaEditor from 'FroalaEditor'
import $ from '../../$'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {

    QUnit.module('wrap')

    const basic_tests = {
      name: 'Basic wrap',
      config: {
      },
      tests: {
        // ID 1.
        '<h1>foo</h1><!-- froala --><p>bar</p>': 
        '<h1>foo</h1><!-- froala --><p>bar</p>',

        // ID 2.
        '<h1>foo</h1>froala<p>bar</p>': 
        '<h1>foo</h1><p>froala</p><p>bar</p>',

        '<h1>foo</h1>  <p>bar</p>': 
        '<h1>foo</h1><p>bar</p>'
      }
    }

    function testWrap(id, config, input, expected) {
      QUnit.test(id, function (assert) {
        const done = assert.async()

        const $editor = $(document.createElement('div')).attr('id', 'edit')
        $(document.body).append($editor)

        new FroalaEditor('#edit', {
          config,
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this
              instance.$el.html(input)
              instance.html.wrap()
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
        testWrap(obj.name + ' ' + (++t), obj.config, input, obj.tests[input])
      }
    }

    runTest(basic_tests)
  })
