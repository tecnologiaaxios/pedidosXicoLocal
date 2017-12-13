var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

gulp.task('pluginsjs', function() {
  gulp.src([
    // 'js/jquery-3.2.1.min.js',
    'vendor/bootstrap/js/bootstrap.min.js',
    'dist/js/bootstrap-select.js',
    'vendor/metisMenu/metisMenu.min.js',
    'dist/js/sb-admin-2.js',
    'vendor/datatables/js/jquery.dataTables.min.js',
    'vendor/datatables-plugins/dataTables.bootstrap.min.js',
    'vendor/datatables-responsive/dataTables.responsive.js',
    'js/bootstrap-datepicker.min.js',
    'js/bootstrap-datepicker.es.min.js',
    'js/bootstrap-tooltip.js',
    'js/jquery.toaster.js',
    'js/dragula.min.js',
    'js/moment-with-locales.js'
    // 'js/panel.js'
    // // 'js/perfil.js'
  ])
    .pipe(concat('plugins.js'))
    .pipe(uglify().on('error', function(e){
      console.log(e);
    }))
    .pipe(gulp.dest('js/'));
});
