import FE from '../../../../../src/js/editor.js'
import $ from '../../../../../src/js/$.js'

import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
    'DOMContentLoaded',
    function() {
        QUnit.module('misc/spaces')

        const fooEvent = (which) => {
            return {
                which: which,
                preventDefault: function() {},
                stopPropagation: function() {}
            }
        }

        let test_cases = {
            '<p> foo</p>': 
            '<p>&nbsp;foo</p>',

            '<p>  foo</p>': 
            '<p>&nbsp; foo</p>',

            '<p>   foo</p>': 
            '<p>&nbsp; &nbsp;foo</p>',

            '<p>    foo</p>': 
            '<p>&nbsp; &nbsp; foo</p>',

            '<p>     foo</p>': 
            '<p>&nbsp; &nbsp; &nbsp;foo</p>',

            '<p>foo </p>': 
            '<p>foo&nbsp;</p>',

            '<p>foo  </p>': 
            '<p>foo &nbsp;</p>',

            '<p>foo   </p>': 
            '<p>foo &nbsp;&nbsp;</p>',

            '<p>foo    </p>': 
            '<p>foo &nbsp; &nbsp;</p>',

            '<p>foo     </p>': 
            '<p>foo &nbsp; &nbsp;&nbsp;</p>'
        }

        function spacesTest(input, output, t) {
            QUnit.test(`${t}. Spaces ${input}`, function(assert) {
                const done = assert.async()
                const $editor = $(document.createElement('div')).attr('id', 'edit')

                $(document.body).append($editor)
                const editorInstance = new FroalaEditor('#edit', {
                    QUnitCommonConfig,
                    events: {
                        initialized: function() {
                            const instance = this
                            instance.$el.html(input)
                            instance.spaces.normalize()

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

        let html_test_cases = {
            '<p><img src="" class="fr-fic fr-dii"> <img src="" class="fr-fic fr-dii"></p>': 
            '<p><img src="" class="fr-fic fr-dii"> <img src="" class="fr-fic fr-dii"></p>',

            '<p><strong>foo</strong> <img src="" class="fr-fic fr-dii"></p>':
            '<p><strong>foo</strong> <img src="" class="fr-fic fr-dii"></p>',
        }

        function spacesHTMLSetTest(input, output, t) {
            QUnit.test(`${t}. Spaces html.set ${input}`, function(assert) {
                const done = assert.async()
                const $editor = $(document.createElement('div')).attr('id', 'edit')

                $(document.body).append($editor)
                const editorInstance = new FroalaEditor('#edit', {
                    QUnitCommonConfig,
                    events: {
                        initialized: function() {
                            const instance = this
                            instance.html.set(input)

                            // Assertion
                            assert.expect(1)
                            assert.equal(instance.$el.html().replace(/\u200B/g, '_'), output, 'OK.')

                            instance.destroy()
                            $editor.remove();

                            done()
                        }
                    }
                })
            })
        }

        // Call test for all test cases.
        let t = 0
        for (let input in test_cases) {
            spacesTest(input, test_cases[input], ++t)
        }

        // Call test for all test cases.
        t = 0
        for (let input in html_test_cases) {
            spacesHTMLSetTest(input, html_test_cases[input], ++t)
        }
    })
