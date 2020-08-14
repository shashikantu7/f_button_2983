import FE from '../../../../src/js/editor.js'
import $ from '../../$.js'
import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
  'DOMContentLoaded',
  function () {
    QUnit.module('editor')

    QUnit.test('Focus on initialize.', function (assert) {
      const done = assert.async()

      const $editor = $(document.createElement('div')).attr('id', 'edit')
      $(document.body).append($editor)

      const editorInstance = new FroalaEditor('#edit', {
        QUnitCommonConfig,
        events: {
          initialized: function () {
            const instance = this
            assert.expect(1)
            assert.ok(instance.core.hasFocus() === false, 'Not focused.')

            instance.destroy()
            $editor.remove()
            done()
          }
        }
      })
    })

    QUnit.test('Input keeps focus on initialize.', function (assert) {
      const done = assert.async()

      const $input = $(document.createElement('input'))
      $(document.body).append($input)
      $input.focus()
      assert.expect(2)
      assert.ok($input.is(':focus'), 'Initial focus.')

      const $editor = $(document.createElement('div')).attr('id', 'edit')
      $(document.body).append($editor)

      const editorInstance = new FroalaEditor('#edit', {
        QUnitCommonConfig,
        events: {
          initialized: function () {
            const instance = this
            assert.ok($input.is(':focus'), '2nd focus.')

            $input.remove()
            instance.destroy()
            $editor.remove()
            done()
          }
        }
      })
    })

    QUnit.test('Scroll on initialize.', function (assert) {
      const done = assert.async()

      let html = ''
      for (let i = 0; i < 1000; i++) {
        html += `${i} `
      }

      const $editor = $(document.createElement('div')).attr('id', 'edit')
      $(document.body).append($editor)

      $(window).scrollTop(500)
      const c_scroll = $(window).scrollTop()


      const editorInstance = new FroalaEditor('#edit', {
        QUnitCommonConfig,
        events: {
          initialized: function () {
            const instance = this
            assert.expect(1)
            assert.ok(c_scroll == $(window).scrollTop(), 'Same top scroll.')

            instance.destroy()
            $editor.remove()
            done()
          }
        }
      })
    })

    QUnit.test('Scroll on selection restore.', function (assert) {
      const done = assert.async()

      let html = ''
      for (let i = 0; i < 10000; i++) {
        html += `${i} `
      }

      html += FE.MARKERS

      const $editor = $(document.createElement('div')).attr('id', 'edit')
      $(document.body).append($editor)


      const editorInstance = new FroalaEditor('#edit', {
        QUnitCommonConfig,
        events: {
          initialized: function () {
            const instance = this
            assert.expect(2)

            instance.events.focus()
            instance.selection.save()
            $(window).scrollTop(500)
            instance.$el.blur()
            assert.ok(!instance.core.hasFocus())
            const c_scroll = $(window).scrollTop()
            instance.selection.restore()

            assert.ok(c_scroll == $(window).scrollTop(), 'Same top scroll.')

            instance.destroy()
            $editor.remove()
            done()
          }
        }
      })
    })
  })