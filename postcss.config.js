// const autoprefixer = require('autoprefixer');

module.exports = {
    plugins: [
        require('postcss-import'),
        require('autoprefixer'),
        require('cssnano'),
    ],
};