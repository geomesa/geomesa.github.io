# GeoMesa.org

Very much in progress...

This site is built with [ jekyll ](http://jekyllrb.com), a static site generator.

### Installing jekyll 

Jekyll v3 is now used on github.io.

#### jekyll v3
1. Make sure Ruby and its development package are installed: `sudo apt-get install ruby ruby-dev`
2. Install jekyll: `sudo gem install jekyll` (requires ruby >  on Ubuntu)
3. Install jekyll-redirect-from: `sudo gem install jekyll-redirect-from`
3. Install [ kramdown ](http://kramdown.gettalong.org/): `sudo gem install kramdown`
4. Install [ rouge ](http://rouge.jneen.net/): `sudo gem install rouge`
5. Install nodejs: `sudo apt-get install nodejs` for the javascript/coffeescript runtime

### Generate and serve the site
The command `jekyll serve --watch` will generate the site in the `_site` directory, watch source files for changes, and serve
it locally on port 4000.

### Notes

- Changes made to `_config.yml` will not be caught in `watch` mode--need to restart jekyll.
