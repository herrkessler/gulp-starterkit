// -------------------------------------------------------------  
// --- Gulp Settings ---
// -------------------------------------------------------------

var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    sass        = require('gulp-sass'),
    csso        = require('gulp-csso'),
    uglify      = require('gulp-uglify'),
    jade        = require('gulp-jade'),
    concat      = require('gulp-concat'),
    livereload  = require('gulp-livereload'),
    imagemin    = require('gulp-imagemin'),
    gzip        = require('gulp-gzip'),
    ftp         = require('gulp-ftp'),
    pngcrush    = require('imagemin-pngcrush'),
    tinylr      = require('tiny-lr'),
    express     = require('express'),
    app         = express(),
    marked      = require('marked'),
    include     = require('gulp-include'),
    path        = require('path'),
    neat        = require('node-neat').includePaths,
    critical    = require('critical'),
    rename      = require('gulp-rename'),
    psi         = require('psi'),
    site        = '',
    key         = '',
    server      = tinylr();

// -------------------------------------------------------------  
// --- Asset Paths src/dist/build ---
// -------------------------------------------------------------  

var basePaths = {
    srcPath: 'src/assets/',
    distPath: 'dist/assets/',
    buildPath: 'build/assets/'
};

var paths = {
  images: {
      src: basePaths.srcPath + 'images/',
      dist: basePaths.distPath + 'images/',
      build: basePaths.buildPath + 'images/'
  },
  styles: {
    src: basePaths.srcPath + 'stylesheets/',
    dist: basePaths.distPath + 'css/',
    build: basePaths.buildPath + 'css/',
    critical: basePaths.buildPath + 'styles/'
  },
  scripts: {
    src: basePaths.srcPath + 'scripts/',
    dist: basePaths.distPath + 'js/',
    build: basePaths.buildPath + 'js/'
  },
  fonts: {
    src: basePaths.srcPath + 'fonts/',
    dist: basePaths.distPath + 'fonts/',
    build: basePaths.buildPath + 'fonts/'
  }
};

// -------------------------------------------------------------  
// --- JS Files ---
// -------------------------------------------------------------  

var jsFile = paths.scripts.src + 'app.js';

// -------------------------------------------------------------  
// --- Basic Tasks ---
// -------------------------------------------------------------

gulp.task('css', function() {
  return gulp.src(paths.styles.src + '*.scss')
    .pipe( 
      sass( { 
        includePaths: [paths.styles.src].concat(neat),
        errLogToConsole: true
      } ) )
    .pipe( gulp.dest(paths.styles.dist) )
    .pipe( livereload( server ));
});

gulp.task('js', function() {
  return gulp.src(jsFile)
    .pipe( include() )
    .pipe( concat('all.js'))
    .pipe( gulp.dest(paths.scripts.dist))
    .pipe( livereload( server ));
});

gulp.task('ie', function() {
  return gulp.src(paths.scripts.src + '/ie/*.js')
    .pipe( gulp.dest(paths.scripts.dist + '/ie/'))
    .pipe( livereload( server ));
});

gulp.task('images', function() {
  return gulp.src(paths.images.src + '**/*')
    .pipe( gulp.dest(paths.images.dist))
    .pipe( livereload( server ));
});

gulp.task('fonts', function() {
  return gulp.src(paths.fonts.src + '**/*')
    .pipe( gulp.dest(paths.fonts.dist))
    .pipe( livereload( server ));
});

gulp.task('templates', function() {
  return gulp.src('src/views/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('dist/'))
    .pipe( livereload( server ));
});

gulp.task('express', function() {
  app.use(express.static(path.resolve('./dist')));
  app.listen(1337);
  gutil.log('Listening on port: 1337');
});

gulp.task('watch', function () {
  server.listen(35728, function (err) {
    if (err) {
      return console.log(err);
    }

    gulp.watch(paths.styles.src + '**/*.scss',['css']);
    gulp.watch(paths.scripts.src + '**/*.js',['js']);
    gulp.watch(paths.images.src + '**/*.*',['images']);
    gulp.watch('src/**/*.jade',['templates']);
    
  });
});

gulp.task('default', ['js', 'ie', 'images', 'fonts', 'css','templates','express','watch']);

// -------------------------------------------------------------  
// --- Production Build Tasks ---
// -------------------------------------------------------------

gulp.task('css-prod', function() {
  return gulp.src(paths.styles.src + '*.scss')
    .pipe( 
      sass( { 
        includePaths: [paths.styles.src].concat(neat),
      } ) )
    .pipe( csso() )
    .pipe( gulp.dest(paths.styles.build) );
});

gulp.task('js-prod', function() {
  return gulp.src(jsFile)
    .pipe( include() )
    .pipe( uglify() )
    .pipe( concat('all.js'))
    .pipe( gulp.dest(paths.scripts.build));
});

gulp.task('images-prod', function() {
  return gulp.src(paths.images.src + '**/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngcrush()]
    }))
    .pipe( gulp.dest(paths.images.build));
});

gulp.task('ie-prod', function() {
  return gulp.src(paths.scripts.src + '/ie/*.js')
    .pipe( uglify() )
    .pipe( gulp.dest(paths.scripts.build + '/ie/'));
});

gulp.task('fonts-prod', function() {
  return gulp.src(paths.fonts.src + '**/*')
    .pipe( gulp.dest(paths.fonts.build));
});

gulp.task('templates-prod', function() {
  return gulp.src('src/views/*.jade')
    .pipe(jade({}))
    .pipe(gulp.dest('build/'));
});

gulp.task('compress-js', ['js-prod'], function() {
  return gulp.src(paths.scripts.build + 'all.js')
    .pipe(gzip())
    .pipe(gulp.dest(paths.scripts.build));
});

gulp.task('compress-css', ['css-prod'], function() {
  return gulp.src(paths.styles.build + '*.css')
    .pipe(gzip())
    .pipe(gulp.dest(paths.styles.build));
});

gulp.task('compress-html', ['templates-prod'], function() {
  return gulp.src('build/*.html')
    .pipe(gzip())
    .pipe(gulp.dest('build/'));
});

gulp.task('build', ['js-prod', 'ie-prod', 'images-prod', 'fonts-prod', 'css-prod','templates-prod', 'compress-js', 'compress-css', 'compress-html']);

// -------------------------------------------------------------
// Critical Path CSS
// -------------------------------------------------------------

gulp.task('copystyles', function () {
  return gulp.src([paths.styles.build +'all.css'])
    .pipe(rename({
      basename: "main"
    }))
    .pipe(gulp.dest(paths.styles.critical));
});


gulp.task('critical', ['build', 'copystyles'], function () {
  critical.generateInline({
    base: 'build/',
    src: 'index.html',
    styleTarget: 'assets/styles/main.css',
    htmlTarget: 'index-critical.html',
    width: 375,
    height: 667,
      minify: true
  });
});

// -------------------------------------------------------------  
// --- Deployment ---
// -------------------------------------------------------------

gulp.task('deploy', ['build'], function () {
  return gulp.src('build/**/*')
    .pipe(ftp({
      host: 'hostname',
      user: 'user',
      pass: '****',
      remotePath: '/'
  }));
});

// -------------------------------------------------------------  
// --- Page Speed Insights Test ---
// -------------------------------------------------------------

gulp.task('mobile', function (cb) {
  psi({
    // key: key
    nokey: 'true',
    url: site,
    strategy: 'mobile',
  }, cb);
});

gulp.task('desktop', function (cb) {
  psi({
    // key: key,
    nokey: 'true',
    url: site,
    strategy: 'desktop',
  }, cb);
});