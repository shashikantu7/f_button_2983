import FroalaEditor from 'FroalaEditor'
import $ from '../../$'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('html_code_view')

    const test_cases = {
      '<div>\n\t<h2>text</h2>\n\t<a href="#">\n\t\t<div>text</div>\n\t\t<div>text</div>\n\t\t<div>text</div>\n\t\t<div>text</div>\n\t\t<div></div>\n\t</a>\n</div>':
        '<div>\n\n\t<h2>text</h2>\n\t<a href="#">\n\t\t<div>text</div>\n\t\t<div>text</div>\n\t\t<div>text</div>\n\t\t<div>text</div>\n\t\t<div>\n\t\t\t<br>\n\t\t</div>\n\t</a></div>\n'
    }

    function html_format_test(input, output, t) {
      QUnit.test(`${t}. Html_Format ${input}`, function (assert) {
        const done = assert.async()

        const $editor = $(document.createElement('div')).attr('id', 'edit')
        $(document.body).append($editor)

        new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this

              instance.codeView.toggle()

              instance.html.set(input)
              instance.codeView.toggle()
              instance.codeView.toggle()

              let html = instance.html.get(false, true)

              html = html.replace(/<span class="fr-tmp fr-sm">F<\/span>/, 'FROALA-SM')
              html = html.replace(/<span class="fr-tmp fr-em">F<\/span>/, 'FROALA-EM')

              // Beautify HTML.
              if (instance.codeBeautifier) {
                html = instance.codeBeautifier.run(html, instance.opts.codeBeautifierOptions)
              }

              assert.expect(1)
              assert.equal(html, output, 'OK')

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
      html_format_test(input, test_cases[input], ++t)
    }
  })