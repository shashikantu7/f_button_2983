/* jshint node:true */
module.exports = function (grunt) {
  'use strict';

  // Force use of Unix newlines
  grunt.util.linefeed = '\n';

  RegExp.quote = function (string) {
    return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  var dropConsole = true;

  // Read plugins.
  var plugins = [];
  grunt.file.recurse ('src/js/plugins', function (abspath, rootdir, subdir, filename) {
    plugins.push(filename.replace('.js', ''))
  })

  // Read third party.
  var third_party = [];
  grunt.file.recurse ('src/js/third_party', function (abspath, rootdir, subdir, filename) {
    third_party.push(filename.replace('.js', ''))
  })

  // Read modules.
  var modules = [];
  grunt.file.recurse ('src/js/modules', function (abspath, rootdir, subdir, filename) {
    subdir = (subdir ? (subdir + '/') : '')
    modules.push('src/js/modules/' + (subdir || '') + filename);
  })
  modules.splice(modules.indexOf('src/js/modules/data.js'), 1);

  // Read languages.
  var langs = [];
  grunt.file.recurse ('src/js/languages', function (abspath, rootdir, subdir, filename) {
    langs.push(filename.replace('.js', ''))
  })

  var rDefineStart = /define\([^{]*?{/;
  var rDefineEndWithReturn = /\s*return\s+[^\}]+(\}\);[^\w\}]*)$/;
  var rDefineEnd = /\}\);[^}\w]*\n?$/;

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*!\n' +
        ' * <%= pkg.name %> v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
        ' * License <%= pkg.license %>\n' +
        ' * Copyright <%= pkg.startYear %>-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' */\n',

    // Task configuration.
    clean: {
      sources: ['dist/js/froala_editor.js', 'dist/js/froala_editor.js.map', 'dist/js/froala_editor.pkgd.js.map','dist/js/froala_editor.pkgd.js', 'dist/js/plugins.pkgd.js.map','dist/js/plugins.pkgd.js'].concat(
        plugins.map(function (p) {
          return 'dist/js/plugins/' + p + '.js';
        })
      ).concat(
        plugins.map(function (p) {
          return 'dist/js/plugins/' + p + '.js.map';
        })
      ).concat(
        third_party.map(function (p) {
          return 'dist/js/third_party/' + p + '.js';
        })
      ).concat(
        third_party.map(function (p) {
          return 'dist/js/third_party/' + p + '.js.map';
        })
      ).concat(
        langs.map(function (p) {
          return 'dist/js/languages/' + p + '.js.map';
        })
      ),
      sass: ['dist/sass'],
      sassPkgFile: ['src/sass/froala_editor.pkgd.scss', 'src/sass/theme.scss', 'src/sass/plugins.pkgd.scss' ]
    },

    copy: {
      index: {
        expand: true,
        cwd: 'src/',
        src: 'index.html',
        dest: 'dist/'
      },

      html: {
        expand: true,
        src: ['html/**'],
        dest: 'dist/',
        cwd: 'src/'
      },

      img: {
        expand: true,
        src: ['img/**'],
        dest: 'dist/',
        cwd: 'src/'
      },

      css: {
        expand: true,
        src: ['css/**'],
        dest: 'dist/',
        cwd: 'src/'
      },

      sass: {
        expand: true,
        src: ['sass/**'],
        dest: 'dist/',
        cwd: 'src/',
        options: {
          sourcemap: 'none'
        }
      },

      assets: {
        expand: true,
        src: ['**'],
        dest: 'dist/js',
        cwd: 'src/assets/svgs'
      },

      license: {
        expand: true,
        src: ['License.txt', 'bower.json', 'composer.json', 'editor.jpg', 'README.md'],
        dest: 'dist/'
      },

      npm_package: {
        src: ['npm_package.json'],
        dest: 'dist/package.json'
      },

      readme: {
        expand: true,
        src: ['README.md'],
        dest: 'dist/'
      },

      udist: {
        expand: true,
        src: ['**'],
        cwd: 'dist/',
        dest: 'udist/'
      }
    },

    remove_usestrict: {
      dist: {
        files: [
          {
            expand: true,
            cwd: 'dist/js/',
            dest: 'dist/js/',
            src: ['**/*.js']
          }
        ]
      }
    },

    sass: {
      options: {
        sourcemap: 'none'
      },
      compileCore: {
        files: {
          'dist/css/froala_editor.css': ['src/sass/froala.scss'],
          'dist/css/froala_editor.pkgd.css': function(){
            var str = '// Files to package.\n';
            var basePath = 'src/sass/';
            var files = 'froala.scss';
            if(grunt.file.expand(basePath+files).length)
              str += '@import \''+files+'\';\n';

            [].concat(plugins).reduce(function (h, p) {
              var srcPath = 'plugins/' + p + '.scss';
              if(grunt.file.expand(basePath+srcPath).length)
                str += '@import \''+srcPath+'\';\n';
              return h;
            }, {});

            // Add style file to pkgd.
            str += '@import \'style.scss\'';

            grunt.file.write('src/sass/froala_editor.pkgd.scss', str);
          }(),

          'dist/css/froala_editor.pkgd.css': function(){
            var str = '// Files to package.\n';
            var basePath = 'src/sass/';

            [].concat(plugins).reduce(function (h, p) {
              var srcPath = 'plugins/' + p + '.scss';
              if(grunt.file.expand(basePath+srcPath).length)
                str += '@import \''+srcPath+'\';\n';
              return h;
            }, {});

            grunt.file.write('src/sass/plugins.pkgd.scss', str);
          }(),

          'dist/css/froala_editor.pkgd.css' : ['src/sass/froala_editor.pkgd.scss'],

          'dist/css/plugins.pkgd.css' : ['src/sass/plugins.pkgd.scss'],

          'dist/css/froala_style.css': ['src/sass/style.scss']
        }

      },

      compilePlugins: {
        files: [].concat(plugins).concat(third_party).reduce(function (h, p) {
          if (third_party.indexOf(p) < 0) {
            var srcPath = 'src/sass/plugins/' + p + '.scss';
            if(grunt.file.expand(srcPath).length)
              h['dist/css/plugins/' + p + '.css'] = [srcPath]
          }
          else {
            var srcPath = 'src/sass/third_party/' + p + '.scss';
            if(grunt.file.expand(srcPath).length)
              h['dist/css/third_party/' + p + '.css'] = [srcPath]
          }
          return h;
        }, {})
      },

      compileDarkTheme: {
        files: {
          'dist/css/themes/dark.css': ['src/sass/theme-dark.scss']
        }
      },

      compileGrayTheme: {
        files: {
          'dist/css/themes/gray.css': ['src/sass/theme-gray.scss']
        }
      },

      compileRoyalTheme: {
        files: {
          'dist/css/themes/royal.css': ['src/sass/theme-royal.scss']
        }
      },

      minifyAll: {

        options: {
          style: 'compressed' // Minify output
        },
        files: [].concat(plugins).concat(third_party).reduce(function (h, p) {
          if (third_party.indexOf(p) < 0) {
            var srcPath = 'src/sass/plugins/' + p + '.scss';
            if(grunt.file.expand(srcPath).length)
              h['dist/css/plugins/' + p + '.min.css'] = [srcPath]
          }
          else {
            var srcPath = 'src/sass/third_party/' + p + '.scss';
            if(grunt.file.expand(srcPath).length)
              h['dist/css/third_party/' + p + '.min.css'] = [srcPath]
          }
          return h;
        }, {
          'dist/css/froala_editor.min.css': ['dist/css/froala_editor.css'],
          'dist/css/froala_editor.pkgd.min.css': ['dist/css/froala_editor.pkgd.css'],
          'dist/css/plugins.pkgd.min.css': ['dist/css/plugins.pkgd.css'],
          'dist/css/froala_style.min.css': ['dist/css/froala_style.css'],
          'dist/css/themes/dark.min.css': ['dist/css/themes/dark.css'],
          'dist/css/themes/gray.min.css': ['dist/css/themes/gray.css'],
          'dist/css/themes/royal.min.css': ['dist/css/themes/royal.css']
        })
      }
    },

    uglify: {
      froala_editor: {
        options: {
          report: 'min',
          output: {
            ascii_only: true
          },
          compress: {
            drop_console: dropConsole
          },
          ie8: true
        },
        src: 'dist/js/froala_editor.js',
        dest: 'dist/js/froala_editor.min.js'
      },

      pkgd: {
        options: {
          report: 'min',
          output: {
            ascii_only: true
          },
          compress: {
            drop_console: dropConsole
          },
          ie8: true
        },
        src: 'dist/js/froala_editor.pkgd.js',
        dest: 'dist/js/froala_editor.pkgd.min.js'
      },

      pkgd_plugins: {
        options: {
          report: 'min',
          output: {
            ascii_only: true
          },
          compress: {
            drop_console: dropConsole
          },
          ie8: true
        },
        src: 'dist/js/plugins.pkgd.js',
        dest: 'dist/js/plugins.pkgd.min.js'
      },

      plugins: {
        options: {
          report: 'min',
          output: {
            ascii_only: true
          },
          compress: {
            drop_console: dropConsole
          },
          ie8: true
        },
        files: [].concat(plugins).concat(third_party).reduce (function (h, p) {
          if (third_party.indexOf(p) < 0) {
            h['dist/js/plugins/' + p + '.min.js'] = ['dist/js/plugins/' + p + '.js'];
          }
          else {
            h['dist/js/third_party/' + p + '.min.js'] = ['dist/js/third_party/' + p + '.js'];
          }

          return h;
        }, {})
      }
    },

    compress: {
      min: {
        options: {
          archive: 'versions/<%= pkg.name %>_<%= pkg.version %>.zip',
          mode: 'zip'
        },
        files: [
          {
            expand: true,
            cwd: 'dist/',
            src: ['**'],
            dest: '/'
          }
        ]
      },

      sources: {
        options: {
          archive: 'versions/<%= pkg.name %>_sources_<%= pkg.version %>.zip',
          mode: 'zip'
        },
        files: [
          {
            expand: true,
            cwd: 'udist',
            src: ['**'],
            dest: '/'
          }
        ]
      }
    },

    shell: {
      qunit: {
        command: './build/run-phantomjs.sh http://localhost:90/src/js/tests/',
        options: {
          stdout: true,
          stderr: true,
          failOnError: true
        }
      }
    },

    usebanner: {
      dist: {
        options: {
          position: 'top',
          banner: '<%= banner %>'
        },
        files: {
          src: ['dist/js/**', 'dist/css/**']
        }
      }
    },

    createTheme: {
      dist: {
        files: {
          src: 'src/sass/',
          except: ['mixins.scss', 'variables.scss', 'theme.scss','contrast.scss','theme-gray.scss','theme-dark.scss','theme-royal.scss'],
          andRules: /\.(fr-box|fr-popup|fr-modal|fr-overlay|fr-toolbar|fr-image-overlay|fr-video-overlay|fr-desktop)/gi
        }
      }
    }

  });

  // These plugins provide necessary tasks.
  require('load-grunt-tasks')(grunt, {
    scope: 'devDependencies'
  });

  grunt.loadNpmTasks('grunt-remove-usestrict');
  grunt.loadNpmTasks('grunt-contrib-obfuscator');
  grunt.loadNpmTasks('grunt-contrib-sass');

  // Copy other files to the dist folder.
  grunt.registerTask('copy-files', ['copy:index', 'copy:html', 'copy:img', 'copy:css', 'copy:license', 'copy:npm_package', 'copy:sass', 'copy:assets']);

  // Uglify plugins and the main file.
  grunt.registerTask('uglify-js', ['uglify:plugins', 'uglify:froala_editor', 'uglify:pkgd', 'uglify:pkgd_plugins']);

  grunt.registerTask('clean-sources', ['clean:sources', 'clean:sass']);

  grunt.registerTask('compile-sass', ['sass:compileCore', 'sass:compileDarkTheme', 'sass:compileGrayTheme', 'sass:compileRoyalTheme', 'sass:compilePlugins', 'sass:minifyAll']);

  grunt.registerTask('zip', ['compress:sources', 'compress:min']);

  // Remove sass package file
  grunt.registerTask('remove-sass-pkg-file', ['clean:sassPkgFile']);

  grunt.registerTask('banner', ['usebanner'])

  grunt.registerMultiTask('createTheme', 'Create theme file.', function () {
    var that = this;
    var str = '// Theme file.\n';
    str += '.#{$theme}-theme {\n';

    grunt.file.recurse(this.data.files.src, function (abspath, rootdir, subdir, filename) {
      if (that.data.files.except.indexOf(filename) < 0 && filename !== '.DS_Store') {
        var content = grunt.file.read(abspath);
        var lines = content.split('\n');
        var rules = [];
        var idx = 0;

        for (var i = 0; i < lines.length; i++) {
          if (lines[i].trim().indexOf('{') > 0 && lines[i].trim()[lines[i].trim().length - 1] === '{') {
            rules.push(lines[i]);
          }

          else if (lines[i].trim().indexOf('{') > 0 && lines[i].trim().indexOf('#{') < 0) {
            continue;
          }

          // Use trim to ignore beginning spaces.
          else if ((lines[i].trim().indexOf('#{') > 0 || lines[i].trim().indexOf('@include') >= 0 || lines[i].trim().indexOf('$') > 0 || lines[i].trim().indexOf('auto;') > 0 || lines[i].trim().indexOf('inherit;') > 0 || lines[i].trim().indexOf('0;') > 0)) {
            if (idx !== rules.length) {
              for (var j = idx; j < rules.length; j++) {
                idx++;

                var new_rule = rules[j].split(',');

                if (j === 0) {
                  for (var k = 0; k < new_rule.length; k++) {
                    if (new_rule[k].trim().match(that.data.files.andRules)) {
                      new_rule[k] = '&' + new_rule[k].trim();
                    }
                  }
                }

                str += '\n' + '  ' + new_rule.join(', ') + '\n';
              }
            }
            str += '  ' + lines[i] + '\n';
          }

          else if (lines[i].indexOf('}') >= 0) {
            if (idx === rules.length) {
              str += '  ' + lines[i] + '\n';
              idx--;
            }
            rules.pop();
          }
        }
      }
    });
    str += '}';

    grunt.file.write('src/sass/theme.scss', str);
  });
};
