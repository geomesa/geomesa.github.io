module.exports = function (grunt) {
    'use strict';
    
    // Load npm tasks.
    require('matchdep').filterDev('grunt-*').forEach(function (dep) {
        grunt.loadNpmTasks(dep);
    });

    // STYLUS
    grunt.config('stylus', {
        build: {
            src: ['_stylus/main.styl'],
            dest: 'css/site.css',
            options: {
                compress: true,
                'include css': true
            }
        }
    });

    // WATCH
    grunt.config('watch', {
        stylus: {
            files: ['_stylus/**/*.styl'],
            tasks: ['stylus:build']
        }
    });

};
