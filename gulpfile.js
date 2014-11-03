
var gulp        = require('gulp');
var concat      = require('gulp-concat');
var streamify   = require('gulp-streamify');
var declare     = require('gulp-declare');
var wrap        = require('gulp-wrap');
var tap         = require('gulp-tap');
var compiler    = require('ember-template-compiler');

var TEMPLATE_DIR = 'templates';

gulp.task('compile-handlebars', function(){

  // First - Grab all of the templates nested within our ./templates dir.
  return gulp.src(templateDir + '/**/*.hbs')

    // Second - Tap into the stream of files, compiling the template.
    // The second argument (false) of precompile says return a string
    // and not a function.
    .pipe(tap(function(file, t) {
      var compiled = compiler.precompile(file.contents.toString(), false);
      file.contents = new Buffer(compiled);
    }))

    // Third - Since the tap step above output a string, we need to make
    // sure we wrap the output in the Ember.Handlebars.template function.
    .pipe(wrap('Ember.Handlebars.template(<%= contents %>)'))

    // Fourth - Create an Ember.TEMPLATES object and attach it to the window.
    .pipe(declare({
      namespace: 'Ember.TEMPLATES',
      root: 'window',
      processName: function(filePath) {
        var id = filePath.split(TEMPLATE_DIR + '/')[1].replace('.hbs', '');
        return id;
      }
    }))

    // Fifth - Concatenate the templates and output to build dir.
    .pipe(concat('templates.js'))
    .pipe(gulp.dest('./build'));

});
