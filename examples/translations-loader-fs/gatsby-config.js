const path = require('path')

module.exports = {
  plugins: [
    /* An instance with not-specified (default) priority value */
    {
      resolve: '@gatsby-plugin-multilingual/translations-loader-fs',
      options: {
        path: './translations',
      },
    },
    /* An instance with custom priority value */
    {
      resolve: '@gatsby-plugin-multilingual/translations-loader-fs',
      options: {
        path: path.resolve('./translations-additional'),
        priority: 2,
      },
    },
  ],
}
