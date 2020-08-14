import FE from '../../../../../src/js/editor.js'
import $ from '../../../../../src/js/$.js'

import FroalaEditor from 'FroalaEditor'
'use strict';

document.addEventListener(
    'DOMContentLoaded',
    function() {
        QUnit.module('links/mail_links')
        
        const fooEvent = (which) => {
            return {
                which: which,
                preventDefault: function() {},
                stopPropagation: function() {}
            }
        }

        let test_cases = {
            'email@website.com': '',
            'website.com': 'noopener noreferrer',
            'mailto.com': 'noopener noreferrer',
        }

        function mail_links_test(input, output, t) {
            QUnit.test(`${t}. Links ${input}`, function(assert) {
                const done = assert.async()

                const $editor = $(document.createElement('div')).attr('id', 'edit')

                $(document.body).append($editor)
                const editorInstance = new FroalaEditor('#edit', {
                    QUnitCommonConfig,
                    events: {
                        initialized: function() {
                            const instance = this

                            const attrs = {}
                            attrs.target = '_blank'
                            instance.link.insert(input, 'Link text', attrs)
                            const actual_string = instance.link.get()

                            assert.expect(1)
                            assert.equal(actual_string.rel, output, 'OK')

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
            mail_links_test(input, test_cases[input], ++t)
        }
    })