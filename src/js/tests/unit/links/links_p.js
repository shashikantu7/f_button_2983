import FE from '../../../../../src/js/editor.js'
import $ from '../../../../../src/js/$.js'

import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
    'DOMContentLoaded',
    function() {
        QUnit.module('links/links_p')

        const fooEvent = (which) => {
            return {
                which: which,
                preventDefault: function() {},
                stopPropagation: function() {}
            }
        }

        let test_cases = {
            // simulate plugin not working with cursor at the beginning.
            //'<p>#<a href="#">aaa</a></p>':
            //'<p>9#<a href="#">aaa</a></p>',

            //'<p><a>#aaa</a></p>':
            //'<p><a>9#aaa</a></p>',

            '<p><a>foo#</a></p>': '<p><a>foo9#</a></p>',

            '<p><a>foo#bar</a></p>': '<p><a>foo9#bar</a></p>',

            // Fail because of the simulate plugin.
            //'<p><a>foo</a>#</p>':
            //'<p><a>foo</a>9#</p>',

            // Fail because of the simulate plugin.
            //'<p><a>foo</a>#bar</p>':
            //'<p><a>foo</a>9#bar</p>',

            '<p><a>foo</a>b#ar</p>': '<p><a>foo</a>b9#ar</p>',

            '<p><a>foo</a>bar#</p>': '<p><a>foo</a>bar9#</p>',

            // Fail because of the simulate plugin.
            // '<p>foo<a>#bar</a></p>':
            // '<p>foo<a>9#bar</a></p>'
        }

        function linkTest(input, output, t) {
            QUnit.test(`${t}. Links ${input}`, function(assert) {
                const done = assert.async()

                const $editor = $(document.createElement('div')).attr('id', 'edit')
                $editor.html(input.replace('#', FE.MARKERS))
                
				$(document.body).append($editor)

                const editorInstance = new FroalaEditor('#edit', {
                    QUnitCommonConfig,
                    events: {
                        initialized: function() {
                            const instance = this
                            instance.$el.focus()

                            instance.$el.simulate("key-sequence", {
                                sequence: "9"
                            })

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

        let t = 0
        for (let input in test_cases) {
            linkTest(input, test_cases[input], ++t)
        }

        // Test unlink
        const unlinkTest = (input, output) => {
            QUnit.test('Unlink Test', function(assert) {
                const done = assert.async()

                const $editor = $(document.createElement('div')).attr('id', 'edit')
                $editor.html(input.replace('#', FE.MARKERS))
                
				$(document.body).append($editor)
                const editorInstance = new FroalaEditor('#edit', {
                    QUnitCommonConfig,
                    events: {
                        initialized: function() {
                            const instance = this

                            instance.$el.focus()

                            instance.link.remove()

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

        unlinkTest('<p><a>foo b#ar</a> foo bar</p>', '<p>foo b#ar foo bar</p>')
    })
