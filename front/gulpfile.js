var gulp = require("gulp");
var cssnano = require("gulp-cssnano");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var concat = require('gulp-concat');
var bs = require('browser-sync').create();
var sass = require("gulp-sass");
var util = require("gulp-util");
var sourcemaps = require("gulp-sourcemaps");


// 安装：npm install gulp@4.0.2

// 跟gulp3相比，有三个地方进行了修改
// 1. 普通任务代码执行完成后需要执行done函数
// 2. watch任务中，监听到了文件的改变，需要执行某个依赖任务的时候，要加上gulp.series
// 3. 在default任务中，bs和watch任务是要同时执行的，因此使用gulp.parallel并行执行。
// 4. gulp.series和gulp.parallel的区别是series会串行执行，gulp.parallel是并行。

gulp.task("test",function(done){
    console.log("Hello, World!")
    done()
});

var path ={ 
    'html':'templates/**/',
    'css':'./src/css/**/',
    'js':'./src/js/',
    'images':'./src/images/',
    'css_dist':'./dist/css/',
    'js_dist':'./dist/js/',
    'images_dist':'./dist/images/',
};

// html task
gulp.task("html",function(done){
    gulp.src(path.html+'*.html')
        .pipe(bs.stream())
    done()
})

// css compression task
gulp.task("comp_css",function(done){
    gulp.src(path.css + '*.scss')
        .pipe(sass().on("error",sass.logError))
        .pipe(cssnano())
        .pipe(rename({'suffix':'.min'}))
        .pipe(gulp.dest(path.css_dist))
        .pipe(bs.stream())
    done()
});

// js compression task
gulp.task("comp_js",function(done){
    gulp.src(path.js + '*.js')
        .pipe(sourcemaps.init())
        .pipe(uglify().on("error",util.log))
        .pipe(rename({"suffix":".min"}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.js_dist))
        .pipe(bs.stream())
    done()
});

// watch any changes and auto replace new .min file
gulp.task("watch",function(done){
    gulp.watch(path.html+'*.html', gulp.series('html'));
    gulp.watch(path.css+'*.scss', gulp.series('comp_css'));
    gulp.watch(path.js+'*.js', gulp.series('comp_js'));
    done()
});

//create browser sync server
gulp.task("bs",function(done){
    bs.init({
        'server':{
            'baseDir':'./'
        }
    });
    done()
});

//create a defualt task for running watch and bs together
//gulp.task("default", gulp.parallel('bs', 'watch'));
gulp.task("default", gulp.parallel('watch'));