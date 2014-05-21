# GeoMesa.org

Very much in progress...

This site is built with [ jekyll ](http://jekyllrb.com), a static site generator.

### Installing jekyll, etc.
1. Make sure Ruby and rubygems are installed (preferrably ruby1.9.3)
2. Install jekyll: `sudo gem install jekyll`(requires ruby > 1.9.2 on ubuntu)
3. Install [ kramdown ](http://kramdown.gettalong.org/): `sudo gem install kramdown`
4. Install [ Pygments ](http://pygments.org/): `sudo apt-get install pygments`(or python-pygments)
5. Install nodejs which needed by newer versions of jekyll for a javascript/coffeescript runtime

The command `jekyll serve --watch` will generate the site in the `_site` directory, watch source files for changes, and serve it locally on port 4000.

### Adding a tutorial

1. Add a markdown file with the following naming convention to the `_posts` directory: YYYY-MM-DD-[title-of-the-tutorial].md.
2. In `_config.yml` make sure the author of the tutorial exists in the `authors` list.
3. Add the following to the top of the tutorial markdown file:

```
---
title: (the title of the tutorial)
author: (the author key in the list in `_config.yml`)
layout: tutorial
---
{% include tutorial-header.html %}

(...your content here.)
```

The content between the `---`'s is [ FrontMatter ](http://jekyllrb.com/docs/frontmatter/). The content between the `{% %}` is [ Liquid ](http://docs.shopify.com/themes/liquid-basics).

#### Syntax highlighting

Wrap any code snippets in the totorial in the following Liquid statements:
```
{% highlight LANGUAGE_IDENTIFIER %}
... code ...
{% endhighlight %}
```
Language identifiers can be found on the [ Pygments ](http://pygments.org/docs/lexers/) website.

You can add line numbers to the code snippet by including `linenos` after the language identifier, i.e.  `{% highlight scala linenos %}`

### Notes

- Changes made to `_config.yml` will not be caught in `watch` mode--need to restart jekyll.







