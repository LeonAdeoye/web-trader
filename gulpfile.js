const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));

// Task to compile Sass to CSS
gulp.task('styles', () =>
{
    // gulp.src('./src/styles/sass/**/*.scss') selects all Sass files within the ./src/styles/sass/ directory and its subdirectories.
    // .pipe(sass().on('error', sass.logError)) pipes the selected files through the gulp-sass plugin, which compiles Sass to CSS.
    // The .on('error', sass.logError) handles and logs any compilation errors.
    // .pipe(gulp.dest('./src/styles/css/')) pipes the compiled CSS files to the specified destination directory (./src/styles/css/).

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

