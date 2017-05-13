const webpackConfig = require('./webpack.config');

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        webpack: {
            options: {
                stats: !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
            },
            prod: webpackConfig,
            dev: Object.assign({ watch: true }, webpackConfig)
        },

        // For some reason this isn't quite working properly. It starts the dev server but the browser doesn't dynamically update
        "webpack-dev-server": {
            options: {
                webpack: webpackConfig
            },
            start: {
            }
        },
        aws_s3: {
            options: {
                region: 'ap-southeast-2',
                awsProfile: 'mclellan',
                uploadConcurrency: 5, // 5 simultaneous uploads
                downloadConcurrency: 5 // 5 simultaneous downloads
            },
            production: {
                options: {
                    bucket: 'brew-fridge.mclellan.org.nz',
                    differential: true // Only uploads the files that have changed
                    // params: {
                    //     ContentEncoding: 'gzip' // applies to all the files!
                    // }
                },
                files: [
                    {expand: true, cwd: 'dashboard/js/build', src: ['**'], dest: 'js/build/'},
                    {expand: true, cwd: 'dashboard', src: ['**'], dest: '/'},
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-aws-s3');

    // Default task(s).
    grunt.registerTask('default', ['webpack:prod']);
    grunt.registerTask('deploy', ['webpack:prod', 'aws_s3:production']);
    grunt.registerTask('dev', ['webpack-dev-server']);
};
