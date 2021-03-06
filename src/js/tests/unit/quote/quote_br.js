import FE from '../../../../../src/js/editor.js'
import FroalaEditor from 'FroalaEditor'
import $ from '../../../$'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('quote/quote_br')

    const fooEvent = (which, shiftKey) => {
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
      '<blockquote>foo# bar</blockquote>':
        '<blockquote>foo</blockquote>#<br><blockquote>&nbsp;bar</blockquote>',

      '<blockquote>foo#<br><br>bar</blockquote>':
        '<blockquote>foo</blockquote>#<br><blockquote><br><br>bar</blockquote>',

      '<blockquote><ul><li>foo</li><li>bar</li></ul>#<br><br>axaxa</blockquote>':
        '<blockquote><ul><li>foo</li><li>bar</li></ul><br></blockquote>#<br><blockquote>axaxa</blockquote>',

      '<blockquote><ul><li>foo#bar</li></ul></blockquote>':
        '<blockquote><ul><li>foo</li></ul></blockquote>#<br><blockquote><ul><li>bar</li></ul></blockquote>',

      '<blockquote>#foo bar</blockquote>':
        '#<br><blockquote>foo bar</blockquote>',

      '<blockquote><ul><li>foo#</li><li>bar</li></ul></blockquote>':
        '<blockquote><ul><li>foo</li></ul></blockquote>#<br><blockquote><ul><li>bar</li></ul></blockquote>',

      '<blockquote><ul><li>foo</li><li>bar#</li></ul></blockquote>':
        '<blockquote><ul><li>foo</li><li>bar</li></ul></blockquote>#<br>',

      '<blockquote><ul><li>foo</li><li>bar#</li></ul><br></blockquote>':
        '<blockquote><ul><li>foo</li><li>bar</li></ul></blockquote>#<br><blockquote><br></blockquote>',

      '<blockquote><table><tbody><tr><td>foo#bar</td></tr></tbody></table></blockquote>':
        '<blockquote><table><tbody><tr><td>foo<br>#bar</td></tr></tbody></table></blockquote>',

      '<blockquote><table><tbody><tr><td><ul><li>foo#bar</li></ul></td></tr></tbody></table></blockquote>':
        '<blockquote><table><tbody><tr><td><ul><li>foo</li><li>#bar</li></ul></td></tr></tbody></table></blockquote>'
    }

    function quoteEnterTest(input, output, t) {
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
          enter: FE.ENTER_BR,
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
      '<blockquote>foo# bar</blockquote>':
        '<blockquote>foo<br>#&nbsp;bar</blockquote>',

      '<blockquote>foo#<br><br>bar</blockquote>':
        '<blockquote>foo<br>#<br><br>bar</blockquote>',

      '<blockquote><ul><li>foo</li><li>bar</li></ul>#<br><br>axaxa</blockquote>':
        '<blockquote><ul><li>foo</li><li>bar</li></ul><br><br>#axaxa</blockquote>',

      '<blockquote><ul><li>foo#bar</li></ul></blockquote>':
        '<blockquote><ul><li>foo<br>#bar</li></ul></blockquote>',

      '<blockquote>#foo bar</blockquote>':
        '<blockquote><br>#foo bar</blockquote>',

      '<blockquote><ul><li>foo#</li><li>bar</li></ul></blockquote>':
        '<blockquote><ul><li>foo<br>#</li><li>bar</li></ul></blockquote>',

      '<blockquote><ul><li>foo</li><li>bar#</li></ul></blockquote>':
        '<blockquote><ul><li>foo</li><li>bar<br>#</li></ul></blockquote>',

      '<blockquote><ul><li>foo</li><li>bar#</li></ul><br></blockquote>':
        '<blockquote><ul><li>foo</li><li>bar<br>#</li></ul><br></blockquote>',

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
          enter: FE.ENTER_BR,
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
      '<blockquote>foo</blockquote>#<br><blockquote>&nbsp;bar</blockquote>':
        '<blockquote>foo#</blockquote><blockquote>&nbsp;bar</blockquote>',

      '<blockquote><ul><li>foo</li></ul></blockquote>#<br><blockquote><ul><li>bar</li></ul></blockquote>':
        '<blockquote><ul><li>foo#</li></ul></blockquote><blockquote><ul><li>bar</li></ul></blockquote>',

      'foo<blockquote>#bar</blockquote>':
        'foo#bar',

      'foo<br><br><blockquote>#bar</blockquote>':
        'foo<br><blockquote>#bar</blockquote>'
    }

    const quoteBackspaceTest = (input, output, t) => {
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
          enter: FE.ENTER_BR,
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
    t = 0
    for (const input in quote_backspace_test_cases) {
      quoteBackspaceTest(input, quote_backspace_test_cases[input], ++t)
    }

    /******************
     * Quote + Delete *
     ******************/
    const quote_delete_test_cases = {
      '<blockquote>foo#</blockquote>bar':
        '<blockquote>foo#bar</blockquote>',

      '<blockquote>foo#</blockquote><ul><li>bar</li></ul>':
        '<blockquote>foo#bar</blockquote>',

      '<blockquote>foo#</blockquote><ul><li>bar</li><li>foo</li></ul>':
        '<blockquote>foo#bar</blockquote><ul><li>foo</li></ul>',

      '#<br><blockquote>foo<br>bar</blockquote>':
        '#foo<blockquote>bar</blockquote>',

      '<blockquote>foo#<br>bar</blockquote>':
        '<blockquote>foo#bar</blockquote>'
    }

    const quoteDeleteTest = (input, output, t) => {
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
          enter: FE.ENTER_BR,
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
