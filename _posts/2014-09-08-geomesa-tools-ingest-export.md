---
title: Ingest and Export with GeoMesa Tools
author: andrew-and-jake
layout: tutorial
---

{% include tutorial-header.html %}

<!-- add some style to fix the xml formatting color -->
<style>
code.xml { color:#93a1a1 }
</style>

## Introduction

GeoMesa Tools is a set of command line tools to add feature management functions, query planning and 
explanation, ingest, and export abilities from the command line. In this tutorial, we'll cover how
to ingest and export features using GeoMesa-Tools
<!--more-->

##Prerequistes

If you haven't already [read through this post]{% post_url 2014-09-08-geomesa-tools-feature %} and 
gone through the initial setup of GeoMesa-Tools, please finish that tutorial first and return back 
to this page.

## Ingesting Features

## Exporting Features

Let's export your newly ingested features in a couple of file formats. Currently, the `export` 
command supports exports to CSV, TSV, Shapefile, GeoJSON, and GML. We'll do one of each format in 
this next section.

The `export` command has 3 required flags:  
 
`-c` or `--catalog` to specify the name of the catalog table  
`-f` or `--feature-name` to give the name of the feature to export  
`-o` or `--format` to specify the output format (csv, tsv, shp, geojson, or gml)

Additionally, you can specify more details about the kind of export you would like to perform with 
`export`'s optional flags. Those are:
 
`-a` or `--attributes` - the attributes of the feature to return  
`-m` or `--maxFeatures` - the maximum number of features to return in an export  
`-q` or `--query` - a CQL query to perform on the features to return only subset of features matching the query   
`-s` or `--stdout` - add to export to STDOUT; useful for piping output to other commands

We'll use the `--maxFeatures` flag to ensure our dataset is small and quick to export. First, we'll 
export to CSV with the following command:

{% highlight bash %}
geomesa export -u username -p password -c {TODO: name} -f {TODO: name} -o csv -m 50
{% endhighlight %}

Now, run the above command four additional times, changing the `--format` flag to `tsv`, `shp`, 
`geojson`, and `gml`. 

The created files should now be under the "export" directory in your root GeoMesa directory. Inspect 
these files to ensure your data was properly exported (and if it wasn't, be sure to 
[submit a bug to our listserv](mailto:geomesa-users@locationtech.org)).

## Explaining Queries

One last command in the GeoMesa Command Line Tools module is the `explain` command, which is covered 
in detail in the post [Understanding Queries by James Hughes](no-link-yet).

## Conclusion
In this tutorial, you learned about the how to run ingests and exports using the GeoMesa Command 
Line Tools. We covered `ingest` and `export`. If you have ideas for additional functionality to 
include in the Command Line Tools module, please don't hesitate to 
[reach out on our listserv](mailto:geomesa-users@locationtech.org).