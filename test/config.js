// Define paths.
var paths = {
  'app': '/test/app',
  'fa': '/test/fa'
};

// Init RequireJS.
requirejs.config({
  'baseUrl': '/src/js',
  'paths': paths,
  urlArgs: 'v=' + (new Date()).getTime()
});