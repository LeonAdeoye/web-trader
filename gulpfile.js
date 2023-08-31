const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));

// Task to compile Sass to CSS
gulp.task('styles', () =>
{
    // Select all Sass files within the specified directory and its subdirectories
    return gulp.src('./src/styles/sass/**/*.scss')
        // Compile Sass to CSS; log errors if any
        .pipe(sass().on('error', sass.logError))
        // Output the compiled CSS files to the specified destination directory
        .pipe(gulp.dest('./src/styles/css/'));
});

// Task to watch for changes in Sass files and trigger the 'styles' task
gulp.task('watch', () => {
    // Set up a watcher on Sass files
    gulp.watch('./src/styles/sass/**/*.scss', gulp.series('styles'));
});

// Default task that combines the 'styles' and 'watch' tasks
gulp.task('default', gulp.series('styles', 'watch'));

