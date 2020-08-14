import FE from '../../../../src/js/editor.js'
import $ from '../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('selection')

    QUnit.test('Save/Restore near STRONG tag with ENTER_P.', function (assert) {
      const done = assert.async()
      const $editor = $(document.createElement('div')).attr('id', 'edit').html(`<p>${FE.MARKERS}<strong>bar</strong></p>`)
      $(document.body).append($editor)

      new FroalaEditor('#edit', {
        QUnitCommonConfig,
        enter: FE.ENTER_P,
        events: {
          initialized: function () {
            const instance = this
            instance.markers.insert()
            instance.$el.find('.fr-marker').replaceWith('#')

            assert.expect(1)
            assert.equal(instance.$el.html().replace(/\u200B/g, '_'), '<p>#<strong>bar</strong></p>', 'OK.')

            instance.destroy()
            $editor.remove()

            done()
          }
        }
      })
    })

    QUnit.test('Save/Restore after STRONG tag with ENTER_P.', function (assert) {
      const done = assert.async()
      const $editor = $(document.createElement('div')).attr('id', 'edit').html(`<p><strong>bar</strong>${FE.MARKERS}</p>`)
      $(document.body).append($editor)

      new FroalaEditor('#edit', {
        QUnitCommonConfig,
        enter: FE.ENTER_P,
        events: {
          initialized: function () {
            const instance = this
            instance.markers.insert()
            instance.$el.find('.fr-marker').replaceWith('#')

            assert.expect(1)
            assert.equal(instance.$el.html().replace(/\u200B/g, '_'), '<p><strong>bar</strong>#</p>', 'OK.')

            instance.destroy()
            $editor.remove()

            done()
          }
        }
      })
    })

    QUnit.test('Save/Restore at beginning of STRONG tag with ENTER_P.', function (assert) {
      const done = assert.async()
      const $editor = $(document.createElement('div')).attr('id', 'edit').html(`<p>foo<strong>${FE.MARKERS}bar</strong></p>`)
      $(document.body).append($editor)

      new FroalaEditor('#edit', {
        QUnitCommonConfig,
        enter: FE.ENTER_P,
        events: {
          initialized: function () {
            const instance = this
            instance.markers.insert()
            instance.$el.find('.fr-marker').replaceWith('#')

            assert.expect(1)
            assert.equal(instance.$el.html().replace(/\u200B/g, '_'), '<p>foo<strong>#bar</strong></p>', 'OK.')

            instance.destroy()
            $editor.remove()

            done()
          }
        }
      })
    })

    QUnit.test('Save/Restore at the end of STRONG tag with ENTER_P.', function (assert) {
      const done = assert.async()
      const $editor = $(document.createElement('div')).attr('id', 'edit').html(`<p><strong>foo${FE.MARKERS}</strong>bar</p>`)
      $(document.body).append($editor)

      new FroalaEditor('#edit', {
        QUnitCommonConfig,
        enter: FE.ENTER_P,
        events: {
          initialized: function () {
            const instance = this
            instance.markers.insert()
            instance.$el.find('.fr-marker').replaceWith('#')

            assert.expect(1)
            assert.equal(instance.$el.html().replace(/\u200B/g, '_'), '<p><strong>foo#</strong>bar</p>', 'OK.')

            instance.destroy()
            $editor.remove()

            done()
          }
        }
      })
    })

    QUnit.test('Save/Restore between space', function (assert) {
      const done = assert.async()
      const $editor = $(document.createElement('div')).attr('id', 'edit').html(`<h1>Click ${FE.START_MARKER}and${FE.END_MARKER} edit</h1>`)
      $(document.body).append($editor)

      new FroalaEditor('#edit', {
        QUnitCommonConfig,
        enter: FE.ENTER_P,
        events: {
          initialized: function () {
            const instance = this
            instance.selection.remove()
            instance.markers.insert()
            instance.$el.find('.fr-marker').replaceWith('#')

            assert.expect(1)
            assert.equal(instance.$el.html().replace(/\u200B/g, '_'), '<h1>Click #&nbsp;edit</h1>', 'OK.')

            instance.destroy()
            $editor.remove()

            done()
          }
        }
      })
    })

    QUnit.test('Delete inside <strong>', function (assert) {
      const done = assert.async()
      const $editor = $(document.createElement('div')).attr('id', 'edit').html(`<h1>Click <em>${FE.START_MARKER}and${FE.END_MARKER}</em> edit</h1>`)
      $(document.body).append($editor)

      new FroalaEditor('#edit', {
        QUnitCommonConfig,
        enter: FE.ENTER_P,
        events: {
          initialized: function () {
            const instance = this
            instance.selection.remove()
            instance.markers.insert()
            instance.$el.find('.fr-marker').replaceWith('#')

            assert.expect(1)
            assert.equal(instance.$el.html().replace(/\u200B/g, '_'), '<h1>Click #&nbsp;edit</h1>', 'OK.')

            instance.destroy()
            $editor.remove()

            done()
          }
        }
      })
    })

    QUnit.test('Show format on collapsed selection.', function (assert) {
      const done = assert.async()
      const $editor = $(document.createElement('div')).attr('id', 'edit').html(`<p>foo<strong>bar${FE.MARKERS}</strong></p></div>`)
      $(document.body).append($editor)

      new FroalaEditor('#edit', {
        QUnitCommonConfig,
        enter: FE.ENTER_P,
        events: {
          initialized: function () {
            const instance = this

            assert.expect(1)
            assert.equal(instance.format.is('strong'), true, 'OK.')

            instance.destroy()
            $editor.remove()

            done()
          }
        }
      })
    })

    const keep_format = {
      '<p>#asd$</p>': 
      '<p>_#</p>',

      '<p>asd</p><p>#<strong>foo</strong>$</p>': 
      '<p>asd</p><p><strong>_#</strong></p>',

      '<p>asd</p><p>#foo <strong>bar</strong>$</p>': 
      '<p>asd</p><p>_#</p>',

      '<p>asd</p><p>#<s>foo</s></p><p><strong>bar</strong>$</p>': 
      '<p>asd</p><p><s>_#</s></p>',

      '<p>asd</p><p>#froala <s>foo</s></p><p><strong>bar</strong>$</p>': 
      '<p>asd</p><p>_#</p>',

      '<p>asd</p><p>#<strong><em>foo</em></strong>$</p>': 
      '<p>asd</p><p><strong><em>_#</em></strong></p>',

      '<p>asd</p><p>#<strong><em><u>foo</u></em></strong>$</p>': 
      '<p>asd</p><p><strong><em><u>_#</u></em></strong></p>'
    }

    function test_keep_format(input, output) {
      QUnit.test(`Remove selection but keep format. ${input}`, function (assert) {
        const done = assert.async()
        const $editor = $(document.createElement('div')).attr('id', 'edit').html(input.replace('#', FE.START_MARKER).replace('$', FE.END_MARKER))
        $(document.body).append($editor)

        new FroalaEditor('#edit', {
          QUnitCommonConfig,
          enter: FE.ENTER_P,
          keepFormatOnDelete: true,
          events: {
            initialized: function () {
              const instance = this

              instance.events.focus()
              instance.selection.remove()
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

    for (const input in keep_format) {
      test_keep_format(input, keep_format[input])
    }
  })