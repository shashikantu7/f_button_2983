import FE from '../../../../src/js/editor.js'
import $ from '../../../../src/js/$.js'

import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
    'DOMContentLoaded',
    function() {
        QUnit.module('misc')

        const insertHTMLTest = (input, output) => {
            QUnit.test(input, function(assert) {
                const done = assert.async();
                const $editor = $(document.createElement('div')).attr('id', 'edit')

                $editor.html(input.replace('#', FE.MARKERS))

                $(document.body).append($editor)
                const editorInstance = new FroalaEditor('#edit', {
                    QUnitCommonConfig,
                    events: {
                        initialized: function() {
                            const instance = this

                            instance.html.insert('<h1>froala</h1>')

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

        insertHTMLTest('<p>foo</p><p>#<br></p><p>bar</p>', '<p>foo</p><h1>froala#</h1><p>bar</p>')

        QUnit.test('Init inside list.', function(assert) {
            const done = assert.async()

            const $ul = document.createElement("ul")
            const $li = document.createElement("li")

            const $editor = $(document.createElement('div')).attr('id', 'edit')
            $editor.innerHTML = `foo${FE.MARKERS}far`

            $($li).append($editor)
            $($ul).append($li)

            $(document.body).append($ul)

            const editorInstance = new FroalaEditor('#edit', {
                QUnitCommonConfig,
                enter: FE.ENTER_BR,
                events: {
                    initialized: function() {
                        const instance = this

                        instance.$el.focus()
                        instance.button.bulkRefresh()

                        setTimeout(function() {
                            assert.expect(1)
                            assert.ok(!instance.$tb.find('a[data-cmd="formatUL"]').hasClass('fr-active'), 'Is Active.')

                            instance.destroy()
                            $ul.remove()

                            done()
                        }, 200)
                    }
                }
            })
        })

        QUnit.test('Init inside list.', function(assert) {
            const done = assert.async()

            const $ul = document.createElement("ul")
            const $li = document.createElement("li")

            const $editor = $(document.createElement('div')).attr('id', 'edit')
            $editor.innerHTML = `foo${FE.MARKERS}far`

            $($li).append($editor)
            $($ul).append($li)

            $(document.body).append($ul)

            const editorInstance = new FroalaEditor('#edit', {
                QUnitCommonConfig,
                enter: FE.ENTER_P,
                events: {
                    initialized: function() {
                        const instance = this

                        instance.$el.focus()
                        instance.button.bulkRefresh()

                        setTimeout(function() {
                            assert.expect(1)
                            assert.ok(!instance.$tb.find('a[data-cmd="formatUL"]').hasClass('fr-active'), 'Is Active.')

                            instance.destroy()
                            $ul.remove();

                            done()
                        }, 200)
                    }
                }
            })
        })

        QUnit.test('Keep Font Awesome.', function(assert) {
            const done = assert.async()
            const html = '<p><i class="fa fa-star"></i> foo</p>'

            const $editor = $(document.createElement('div')).attr('id', 'edit')
            $editor.html(html)

            $(document.body).append($editor)
            const editorInstance = new FroalaEditor('#edit', {
                QUnitCommonConfig,
                enter: FE.ENTER_P,
                events: {
                    initialized: function() {
                        const instance = this

                        assert.expect(1)
                        assert.equal(instance.html.get(), html)

                        instance.destroy()
                        $editor.remove()

                        done()
                    }
                }
            })
        })


        QUnit.test('Colors break.', function(assert) {
            const done = assert.async()
            const html = `<p>Want to <span style="color: rgb(239, 239, 239);"><span style="background-color: rgb(71, 85, 119);">fo${FE.START_MARKER}rm${FE.END_MARKER}at</span></span> a word.</p>`

            const $editor = $(document.createElement('div')).attr('id', 'edit')
            $editor.html(html);

            $(document.body).append($editor)
            const editorInstance = new FroalaEditor('#edit', {
                QUnitCommonConfig,
                enter: FE.ENTER_P,
                events: {
                    initialized: function() {
                        const instance = this

                        assert.expect(1)
                        instance.format.removeStyle('color')
                        const ihtml = instance.html.get()

                        assert.ok(ihtml == '<p>Want to <span style="color: rgb(239, 239, 239);"><span style="background-color: rgb(71, 85, 119);">fo</span></span><span style="background-color: rgb(71, 85, 119);">rm</span><span style="color: rgb(239, 239, 239);"><span style="background-color: rgb(71, 85, 119);">at</span></span> a word.</p>')

                        instance.destroy()
                        $editor.remove()

                        done()
                    }
                }
            })
        })
    });