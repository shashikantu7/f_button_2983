import FE from '../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../$'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('clean')

    const html_cases = {
      name: 'Basic test',
      config: {},
      tests: {
        // ID 1.
        'foo bar': 
        'foo bar',

        'foo &lt; bar': 
        'foo &lt; bar',

        // ID 2.
        '<p>foo bar': 
        '<p>foo bar</p>',

        // ID 3.
        '<p onclick="alert(111);">foo bar</p>': 
        '<p>foo bar</p>',

        // ID 4.
        '<html><head><title>Froala</title></head><body>foo bar</body></html>': 
        'Froalafoo bar',

        // ID 5.
        '<p><span onClick="asdasd">foo</span> bar</p>': 
        '<p><span>foo</span> bar</p>',

        // ID 6.
        '<p><i class="fa fa-star"></i></p>': 
        '<p><i class="fa fa-star"></i></p>',

        // ID 7.
        '<h2>SVG Circle</h2><svg width="100" height="100"><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow"></circle></svg><span></span><div class="w3-example"><h3>Example</h3></div>':
        '<h2>SVG Circle</h2><span></span><div class="w3-example"><h3>Example</h3></div>'
      }
    }

    const full_page_cases = {
      name: 'Full Page test',
      config: {
        fullPage: true
      },
      tests: {
        'foo bar': '<!DOCTYPE html><html><head></head><body>foo bar</body></html>',
        '<html></html>': '<!DOCTYPE html><html><head></head><body></body></html>',

        '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">':
          '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"><html><head></head><body></body></html>'
      }
    }

    const image_src_test = {
      name: 'Image src test',
      config: {
        htmlAllowedAttrs: ['src', 'title', 'alt', 'href', 'class', 'width', 'height', 'style']
      },
      tests: {
        '<img src="/src/to/image.png" alt="">': '<img src="/src/to/image.png" alt="">'
      }
    }

    function testCleanHTML(id, config, input, expected) {
      QUnit.test(id, function (assert) {
        const done = assert.async()

        const $editor = $(document.createElement('div')).attr('id', 'edit').html(FE.MARKERS)
        $(document.body).append($editor)

        let options = {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this
              const output = instance.clean.html(input, [], [], true)
              assert.expect(1)
              assert.equal(output, expected, 'OK.')

              instance.destroy()
              $editor.remove()
              done()
            }
          }
        }
        Object.assign(options,config)
        new FroalaEditor('#edit',options)
        
      })
    }

    const runTest = (obj) => {
      let t = 0
      for (const input in obj.tests) {
        testCleanHTML(obj.name + ' ' + (++t), obj.config, input, obj.tests[input])
      }
    }

    runTest(html_cases)
    runTest(full_page_cases)
    runTest(image_src_test)
  })
