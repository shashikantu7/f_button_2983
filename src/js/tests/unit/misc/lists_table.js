import FE from '../../../../../src/js/editor.js'
import $ from '../../../../../src/js/$.js'

import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
    'DOMContentLoaded',
    function() {
        QUnit.module('misc/lists_tables')

        const fooEvent = (which) => {
            return {
                which: which,
                preventDefault: function() {},
                stopPropagation: function() {}
            }
        }

        let test_cases = {
            // 1.
            '<table><tbody><tr><td>#foo</td><td>bar</td></tr></tbody></table><p>foo$ bar</p>': '<table><tbody><tr><td><ul><li>#foo</li></ul></td><td><ul><li>bar</li></ul></td></tr></tbody></table><ul><li>foo$ bar</li></ul>'
        }

        function listsTablesTest(input, output, t) {
            QUnit.test(`${t}. LISTS and TABLES ${input}`, function(assert) {
                const done = assert.async()

                const $editor = $(document.createElement('div')).attr('id', 'edit')
                if (input.indexOf('$') >= 0) {
                    $editor.html(input.replace('#', FE.START_MARKER).replace('$', FE.END_MARKER))
                } else {
                    $editor.html(input.replace('#', FE.MARKERS))
                }

                $(document.body).append($editor)

                const editorInstance = new FroalaEditor('#edit', {
                    QUnitCommonConfig,
                    events: {
                        initialized: function() {
                            const instance = this

                            // Simulate insert ul.
                            instance.lists.format('UL')
						
                            // Add cursor
                            instance.selection.save()
                            instance.$el.find('.fr-marker[data-type="true"]').replaceWith('#')
                            instance.$el.find('.fr-marker[data-type="false"]').replaceWith('$')

                            // Assertion
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

        // Call test for all test cases.
        let t = 0
        for (let input in test_cases) {
            listsTablesTest(input, test_cases[input], ++t)
        }
    })