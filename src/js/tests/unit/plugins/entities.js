import FE from '../../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../../$'

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('plugins/entities');

    const html_cases = {
      name: 'Basic test',
      config: {},
      tests: {
        // ID 1.
        '<p><</p>': '<p>&lt;</p>',
        '<p>></p>': '<p>&gt;</p>',
        '<p>&</p>': '<p>&amp;</p>',
        '<p>"</p>': '<p>&quot;</p>',
      }
    }

    const simple_ampersand = {
      name: 'Ampersand test',
      config: {
        htmlSimpleAmpersand: true
      },
      tests: {
        // ID 1.
        '<p><</p>': '<p>&lt;</p>',
        '<p>></p>': '<p>&gt;</p>',
        '<p>&</p>': '<p>&</p>',
        '<p>"</p>': '<p>&quot;</p>'
      }
    }

    function testCleanHTML(id, config, input, expected) {
      QUnit.test(id, function (assert) {
        const done = assert.async();

        const $editor = $(document.createElement('div')).attr('id', 'edit').html(FE.MARKERS)
        $(document.body).append($editor)

        new FroalaEditor('#edit', Object.assign({
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this
              instance.html.set(input)
              const output = instance.html.get()
              assert.expect(1)
              assert.equal(output, expected, 'OK.')

              instance.destroy()
              $editor.remove()
              done()
            }
          }
        }, config))

      })
    }

    function runTest(obj) {
      let t = 0;
      for (const input in obj.tests) {
        t++
        testCleanHTML(obj.name + ' ' + t, obj.config, input, obj.tests[input])
      }
    }

    runTest(html_cases);
    runTest(simple_ampersand)
  })
