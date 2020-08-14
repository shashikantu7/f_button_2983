import FE from '../../../../../src/js/editor.js'
import $ from '../../../../../src/js/$.js'

import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
    'DOMContentLoaded',
    function() {
        QUnit.module('misc/invisible_space')

        const fooEvent = (which) => {
            return {
                which: which,
                preventDefault: function() {},
                stopPropagation: function() {}
            }
        }

        let test_cases = {
            '<p>foo<strong>&#8203;</strong></p>': 
            '<p>foo</p>',

            '<p>foo<strong><em>&#8203;</em></strong></p>': 
            '<p>foo</p>',

            '<p>foo<strong>MK&#8203;</strong></p>': 
            '<p>foo</p>'
        }

        function invisibleSpaces(input, output, t) {
            QUnit.test(`${t}. Invisible Spaces ${input}`, function(assert) {
                const done = assert.async()
                const $editor = $(document.createElement('div')).attr('id', 'edit')

                $(document.body).append($editor)
                const editorInstance = new FroalaEditor('#edit', {
                    events: {
                        initialized: function() {
                            const instance = this
                            instance.$el.html(input.replace('MK', FE.MARKERS))

                            // Assertion
                            assert.expect(1)
                            assert.equal(instance.html.get(false).replace(/\u200b/g, '_'), output, 'OK.')

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
        for (let input in test_cases) {
            invisibleSpaces(input, test_cases[input], ++t)
        }


        let test_cases_with_markers = {
            '<p>foo<strong>MK&#8203;</strong></p>': 
            '<p>foo#$</p>'
        }

        const invisibleSpacesWithMarkers = (input, output, t) => {
            QUnit.test(`${t}. Invisible Spaces with markers ${input}`, function(assert) {
                const done = assert.async()
                const $editor = $(document.createElement('div')).attr('id', 'edit')

                $(document.body).append($editor)
                const editorInstance = new FroalaEditor('#edit', {
                    events: {
                        initialized: function() {
                            const instance = this
                            instance.$el.html(input.replace('MK', FE.MARKERS))

                            const html = instance.html.get(true).replace(/\u200b/g, FE.INVISIBLE_SPACE)
                            output = output.replace('#', FE.START_MARKER).replace('$', FE.END_MARKER)

                            // Assertion
                            assert.expect(1)
                            assert.equal(html, output, 'OK.')

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
        for (let input in test_cases_with_markers) {
            invisibleSpacesWithMarkers(input, test_cases_with_markers[input], ++t)
        }
    })