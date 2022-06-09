const {override, addPostcssPlugins} = require("customize-cra");
module.exports = override(
  addPostcssPlugins([
    require('tailwindcss')('./tailwind.config.js'),
    require('autoprefixer')
  ])

)