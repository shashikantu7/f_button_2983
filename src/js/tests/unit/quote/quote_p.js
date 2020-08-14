import FE from '../../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../../$'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('quote/quote_p')

    const fooEvent = function (which, shiftKey) {
      return {
        which: which,
        shiftKey: shiftKey,
        preventDefault: function () { },
        stopPropagation: function () { }
      }
    }

    /********************
     * Quote + Enter <p>*
     ********************/
    const quote_enter_test_cases = {
      '<blockquote><p>foo# bar</p></blockquote>':
        '<blockquote><p>foo</p></blockquote><p>#<br></p><blockquote><p>&nbsp;bar</p></blockquote>',

      '<blockquote><p>foo#<br><br>bar</p></blockquote>':
        '<blockquote><p>foo</p></blockquote><p>#<br></p><blockquote><p><br><br>bar</p></blockquote>',

      '<blockquote><ul><li>foo</li><li>bar</li></ul><p>#<br></p><p>axaxa</p></blockquote>':
        '<blockquote><ul><li>foo</li><li>bar</li></ul><p><br></p></blockquote><p>#<br></p><blockquote><p>axaxa</p></blockquote>',

      '<blockquote><ul><li>foo#bar</li></ul></blockquote>':
        '<blockquote><ul><li>foo</li></ul></blockquote><p>#<br></p><blockquote><ul><li>bar</li></ul></blockquote>',

      '<blockquote><p>#foo bar</p></blockquote>':
        '<p>#<br></p><blockquote><p>foo bar</p></blockquote>',

      '<blockquote><ul><li>foo#</li><li>bar</li></ul></blockquote>':
        '<blockquote><ul><li>foo</li></ul></blockquote><p>#<br></p><blockquote><ul><li>bar</li></ul></blockquote>',

      '<blockquote><ul><li>foo</li><li>bar#</li></ul></blockquote>':
        '<blockquote><ul><li>foo</li><li>bar</li></ul></blockquote><p>#<br></p>',

      '<blockquote><ul><li>foo</li><li>bar#</li></ul><p><br></p></blockquote>':
        '<blockquote><ul><li>foo</li><li>bar</li></ul></blockquote><p>#<br></p><blockquote><p><br></p></blockquote>',

      '<blockquote><table><tbody><tr><td>foo#bar</td></tr></tbody></table></blockquote>':
        '<blockquote><table><tbody><tr><td>foo<br>#bar</td></tr></tbody></table></blockquote>',

      '<blockquote><table><tbody><tr><td><ul><li>foo#bar</li></ul></td></tr></tbody></table></blockquote>':
        '<blockquote><table><tbody><tr><td><ul><li>foo</li><li>#bar</li></ul></td></tr></tbody></table></blockquote>'
    }

    const quoteEnterTest = (input, output, t) => {
      QUnit.test(`${t}. ENTER ${input}`, function (assert) {
        const done = assert.async()
        
        const $editor = $(document.createElement('div')).attr('id', 'edit')
        $(document.body).append($editor)

        if (input.indexOf('$') >= 0) {
          $editor.html(input.replace('#', FE.START_MARKER).replace('$', FE.END_MARKER))
        } else {
          $editor.html(input.replace('#', FE.MARKERS))
        }

        new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this

              // Simulate enter
              instance.events.trigger('keydown', [fooEvent(FE.KEYCODE.ENTER)])
              instance.events.trigger('keyup', [fooEvent(FE.KEYCODE.ENTER)])

              // Add cursor
              instance.markers.insert()
              instance.$el.find('.fr-marker').replaceWith('#')

              // Assertion
              assert.expect(1)
              assert.equal(instance.$el.html().replace(/\u200B/g, '_').replace(/\u200B/g, '_'), output, 'OK.')

              instance.destroy()
              $editor.remove()
              done()
            }
          }
        })

      })
    }

    // Call test for all test cases.
    let t = 0
    for (const input in quote_enter_test_cases) {
      quoteEnterTest(input, quote_enter_test_cases[input], ++t)
    }

    /**********************
    * Quote Shift + Enter *
    ***********************/
    const quote_shiftenter_test_cases = {
      '<blockquote><p>foo# bar</p></blockquote>':
        '<blockquote><p>foo<br>#&nbsp;bar</p></blockquote>',

      '<blockquote><p>foo#<br><br>bar</p></blockquote>':
        '<blockquote><p>foo<br>#<br><br>bar</p></blockquote>',

      '<blockquote><ul><li>foo</li><li>bar</li></ul><p>#<br></p><p>axaxa</p></blockquote>':
        '<blockquote><ul><li>foo</li><li>bar</li></ul><p><br></p><br>#<p>axaxa</p></blockquote>',

      '<blockquote><ul><li>foo#bar</li></ul></blockquote>':
        '<blockquote><ul><li>foo<br>#bar</li></ul></blockquote>',

      '<blockquote><p>#foo bar</p></blockquote>':
        '<blockquote><br>#<p>foo bar</p></blockquote>',

      '<blockquote><ul><li>foo#</li><li>bar</li></ul></blockquote>':
        '<blockquote><ul><li>foo<br>#</li><li>bar</li></ul></blockquote>',

      '<blockquote><ul><li>foo</li><li>bar#</li></ul></blockquote>':
        '<blockquote><ul><li>foo</li><li>bar<br>#</li></ul></blockquote>',

      '<blockquote><ul><li>foo</li><li>bar#</li></ul><p><br></p></blockquote>':
        '<blockquote><ul><li>foo</li><li>bar<br>#</li></ul><p><br></p></blockquote>',

      '<blockquote><table><tbody><tr><td>foo#bar</td></tr></tbody></table></blockquote>':
        '<blockquote><table><tbody><tr><td>foo<br>#bar</td></tr></tbody></table></blockquote>',

      '<blockquote><table><tbody><tr><td><ul><li>foo#bar</li></ul></td></tr></tbody></table></blockquote>':
        '<blockquote><table><tbody><tr><td><ul><li>foo<br>#bar</li></ul></td></tr></tbody></table></blockquote>'
    }

    function shift_enterTest(input, output, t) {
      QUnit.test(`${t}. SHIFT ENTER ${input}`, function (assert) {
        const done = assert.async()
        
        const $editor = $(document.createElement('div')).attr('id', 'edit')
        $(document.body).append($editor)

        if (input.indexOf('$') >= 0) {
          $editor.html(input.replace('#', FE.START_MARKER).replace('$', FE.END_MARKER))
        } else {
          $editor.html(input.replace('#', FE.MARKERS))
        }

        new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this

              instance.events.trigger('keydown', [fooEvent(FE.KEYCODE.ENTER, FE.KEYCODE.SHIFT)])

              instance.markers.insert()
              instance.$el.find('.fr-marker').replaceWith('#')

              assert.expect(1)
              assert.equal(instance.$el.html().replace(/\u200B/g, '_'), output, 'OK.')

              instance.destroy()
              $editor.remove()
              done()
            }
          }
        })

      })
    }

    t = 0
    for (const input in quote_shiftenter_test_cases) {
      shift_enterTest(input, quote_shiftenter_test_cases[input], t++)
    }

    /******************
     * Quote + Backspace *
     ******************/
    const quote_backspace_test_cases = {
      '<blockquote><p>foo</p></blockquote><p>#<br></p><blockquote><p>&nbsp;bar</p></blockquote>':
        '<blockquote><p>foo#</p></blockquote><blockquote><p>&nbsp;bar</p></blockquote>',

      '<blockquote><ul><li>foo</li></ul></blockquote><p>#<br></p><blockquote><ul><li>bar</li></ul></blockquote>':
        '<blockquote><ul><li>foo#</li></ul></blockquote><blockquote><ul><li>bar</li></ul></blockquote>',

      '<p>foo</p><blockquote><p>#bar</p></blockquote>':
        '<p>foo#bar</p>',

      '<p>foo</p><p><br></p><blockquote><p>#bar</p></blockquote>':
        '<p>foo</p><blockquote><p>#bar</p></blockquote>'
    }

    function quoteBackspaceTest(input, output, t) {
      QUnit.test(`${t}. BACKSPACE ${input}`, function (assert) {
        const done = assert.async()
        
        const $editor = $(document.createElement('div')).attr('id', 'edit')
        $(document.body).append($editor)

        if (input.indexOf('$0') >= 0) {
          const txt = input.replace(/#(\d)/g, function (str, a1) {
            return FE.START_MARKER.replace(/id="0"/, `id="${a1}"`)
          }).replace(/\$(\d)/g, function (str, a1) {
            return FE.END_MARKER.replace(/id="0"/, `id="${a1}"`)
          })
          $editor.html(txt)
        }
        else if (input.indexOf('$') >= 0) {
          $editor.html(input.replace('#', FE.START_MARKER).replace('$', FE.END_MARKER))
        }
        else {
          $editor.html(input.replace('#', FE.MARKERS)) 
        }

        new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this

              // Simulate backspace
              instance.events.trigger('keydown', [fooEvent(FE.KEYCODE.BACKSPACE)])
              instance.events.trigger('keyup', [fooEvent(FE.KEYCODE.BACKSPACE)])

              // Add cursor
              instance.markers.insert()
              instance.$el.find('.fr-marker').replaceWith('#')

              // Assertion
              assert.expect(1)
              assert.equal(instance.$el.html().replace(/\u200B/g, '_').replace(/\u200B/g, '_'), output, 'OK.')

              instance.destroy()
              $editor.remove()
              done()
            }
          }
        })

      })
    }

    // Call test for all test cases.
    for (const input in quote_backspace_test_cases) {
      quoteBackspaceTest(input, quote_backspace_test_cases[input], ++t)
    }

    /******************
     * Quote + Delete *
     ******************/
    const quote_delete_test_cases = {
      '<blockquote><p>foo#</p></blockquote><p>bar</p>':
        '<blockquote><p>foo#bar</p></blockquote>',

      '<blockquote><p>foo#</p></blockquote><ul><li>bar</li></ul>':
        '<blockquote><p>foo#bar</p></blockquote>',

      '<blockquote><p>foo#</p></blockquote><ul><li>bar</li><li>foo</li></ul>':
        '<blockquote><p>foo#bar</p></blockquote><ul><li>foo</li></ul>',

      '<p>#<br></p><blockquote><p>foo</p><p>bar</p></blockquote>':
        '<p>#foo</p><blockquote><p>bar</p></blockquote>',

      '<blockquote><p>foo#</p><p>bar</p></blockquote>':
        '<blockquote><p>foo#bar</p></blockquote>'
    }

    function quoteDeleteTest(input, output, t) {
      QUnit.test(`${t}. DELETE ${input}`, function (assert) {
        const done = assert.async()
        
        const $editor = $(document.createElement('div')).attr('id', 'edit')
        $(document.body).append($editor)

        if (input.indexOf('$0') >= 0) {
          const txt = input.replace(/#(\d)/g, function (str, a1) {
            return FE.START_MARKER.replace(/id="0"/, `id="${a1}"`)
          }).replace(/\$(\d)/g, function (str, a1) {
            return FE.END_MARKER.replace(/id="0"/, `id="${a1}"`)
          })
          $editor.html(txt)
        }
        else if (input.indexOf('$') >= 0) {
          $editor.html(input.replace('#', FE.START_MARKER).replace('$', FE.END_MARKER))
        }
        else {
          $editor.html(input.replace('#', FE.MARKERS))
        }

        new FroalaEditor('#edit', {
          QUnitCommonConfig,
          events: {
            initialized: function () {
              const instance = this

              // Simulate delete
              instance.events.trigger('keydown', [fooEvent(FE.KEYCODE.DELETE)])
              instance.events.trigger('keyup', [fooEvent(FE.KEYCODE.DELETE)])

              // Add cursor
              instance.markers.insert()
              instance.$el.find('.fr-marker').replaceWith('#')

              // Assertion
              assert.expect(1)
              assert.equal(instance.$el.html().replace(/\u200B/g, '_').replace(/\u200B/g, '_'), output, 'OK.')

              instance.destroy()
              $editor.remove()

              done()
            }
          }
        })

      })
    }

    // Call test for all test cases.
    t = 0
    for (const input in quote_delete_test_cases) {
      quoteDeleteTest(input, quote_delete_test_cases[input], ++t)
    }
  })
