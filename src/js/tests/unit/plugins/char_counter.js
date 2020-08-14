import FE from '../../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../../$'

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('plugins/char_counter');

    var simple_html = {
      tests: {
        '<p>foo</p>': 3,
        '<p> foo</p>': 3,
        '<p>  foo</p>': 3,
        '<p>   foo</p>': 3,
        '<p>    foo</p>': 3,
        '<p>foo </p>': 3,
        '<p>foo  </p>': 3,
        '<p>foo   </p>': 3,
        '<p>foo    </p>': 3,
        '<p>foo foo</p>': 7,
        '<p>foo  foo</p>': 7,
        '<p>foo   foo</p>': 7
      }
        
    }

    function testCharCounter(id, input, expected) {
    QUnit.test(`html.set property character count ${id}`, function (assert) {
      const done = assert.async();

      const $editor = $(document.createElement('div')).attr('id', 'edit')
      $(document.body).append($editor)

      new FroalaEditor('#edit', {
        QUnitCommonConfig,
        events: {
          initialized: function () {
            const instance = this
            assert.expect(1)
            instance.html.set(input)
            const output = instance.charCounter.count()
            assert.equal(output, expected, 'OK.')

            instance.destroy()
            $editor.remove()
            done()
          }
        }
      })

    })
  }


    let t = 0;
    for (const input in simple_html.tests) {
      t++
      testCharCounter(`${t}) ${input}`, input, simple_html.tests[input])
    }
  

  })
