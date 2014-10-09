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

If you haven't already [read through this post]{% post_url 2014-09-08-geomesa-tools-features %} and 
gone through the initial setup of GeoMesa-Tools, please finish that tutorial first and return back 
to this page.

## Getting Data

For this tutorial, we are going to download some [GDELT](http://gdeltproject.org/) data from [Google BigQuery](https://cloud.google.com/products/bigquery/).
The details involved for signing up can be found at their website, and the following [google blog post](http://googlecloudplatform.blogspot.com/2014/05/worlds-largest-event-dataset-now-publicly-available-in-google-bigquery.html) is also a good resource. 
Once you have set up your account, run the following query to compile every protest in the Ukraine from November 1st 2013 to March 31st 2014 and download the data as a CSV. 
This will cover the Euromaidan through the 2014 Ukrainian revolution and the annexation of the Crimean Peninsula.

{% highlight SQL %}

SELECT GLOBALEVENTID, SQLDATE, EventCode, Actor1Name, Actor1Type1Code, Actor2Name, Actor2Type1Code, ActionGeo_Long, ActionGeo_Lat, ActionGeo_FullName
FROM [gdelt-bq:full.events] 
WHERE 
 LEFT(EventCode, 2) = '19'
 AND ActionGeo_CountryCode='UP' 
 AND SQLDATE BETWEEN 20131101 AND 20140331;

{% endhighlight %}

We will call the CSV file we just downloaded from BigQuery `ukraineNovToMar.csv`. Since the file is only around 1.5MB we will just go ahead and ingest it from the local file system instead of first loading it onto HDFS.

## Ingesting Features

The ingest command currently supports three formats: CSV, TSV, and SHP.
 
The CSV and TSV file ingest can ingest geometries in two different ways: a column in the file can represent
the geometry in [WKT](http://en.wikipedia.org/wiki/Well-known_text), or the file can also contain two columns 
(one for latitude and one for longitude). 
For the latter case, a Point geometry is constructed from the resulting pair
of coordinates. 

The `ingest` command has the following required flags in addition to accumulo user and password:

`-c` or `--catalog` to specify the name of the catalog table  
`-f` or `--feature-name` to give the name of the feature to ingest  

Additionally for CSV/TSV ingest there are several optional parameters that can be used:  
`-s` or `--sftspec` The Simple Feature Type of the CSV or TSV file, each column in the file must have a corresponding attributed in the SimpleFeatureType. This is not required for SHP ingest.  
`--datetime` The name of the field in the SFT that corresponds to the *time* column (default timezone is UTC).  
`--dtformat` The Joda DateTimeFormat quote-wrapped string for the date-time field, e.g.: "MM/dd/yyyy HH:mm:ss".  
`--idfields` The set of attributes of each feature used to encode the feature name.  
`-h` or `--hash` A flag to optionally md5 hash the resulting id created from the `--idfields` flag.  
`--lon` The name of the attribute in the SFT corresponding to the longitude data column in the file.    
`--lat` The name of the attribute in the SFT corresponding to the latitude data column in the file. 
 
If you are attempting to ingest a file with longitude and latitude columns, you must append to the end of the Simple Feature Type an addition attribute for the point geometry that will be constructed, e.g.: `*geom:Point:srid=4326`.
Ingesting a file with a column of WKT geometries the `--lon` and `--lat` parameters are no longer necessary and that column can be directly referenced in the sft as some geom e.g.: `*geom:Geometry:srid=4326` or `*geom:Point:srid=4326`. 

The last argument that is required for all ingest commands is the path to the file to ingest.

`--file` The path to the file that will be ingested. If ingesting CSV/TSV data this can be an HDFS path by prefixing it with `hdfs://`

### Running an Ingest

*If you have not already downloaded the sample set of GDELT data as described above, please do so now.*

Now that we know a little about the ingest tool, and have a set of data, we are going to construct the parameters needed to ingest the data.
To start, we need to determine the Simple Feature Type for the GDELT data, looking at the query above and the file itself we can construct the following simple feature type.

{% highlight bash %}
GLOBALEVENTID:Integer,SQLDATE:Date,EventCode:String,Actor1Name:String,Actor1Type1Code:String,Actor2Name:String,
Actor2Type1Code:String,ActionGeo_Long:Float,ActionGeo_Lat:Float,ActionGeo_FullName:String,*geom:Point:srid=4326
{% endhighlight  %}

Again note the extra `*geom:Point:srid=4326` at the end of the Simple Feature Type, since we are constructing a default geometry from the latitude and longitude coordinates we must give the feature a geometry attribute.
Looking at the SQLDATE column the date time format is simply `"yyyMMdd"`, for more complicated formats please refer to the [JODA documentation](http://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html)
The final things we need to set are the id fields, the date time field, and the names of the longitude and latitude columns. This is all fairly straight forward as they all correspond directly to the names we put in the simple feature type above:

{% highlight bash %}
--datetime SQLDATE
--lon ActionGeo_Long
--lat ActionGeo_Lat
{% endhighlight %}

We are also going to set the id fields parameter to contain the `GLOBALEVENTID`.  
Now that we have everything ready, we will now combine the various parameters into the following complete ingest command:

{% highlight bash %}
geomesa ingest -u username -p password -c gdelt_Ukraine -f gdelt
 -s GLOBALEVENTID:Integer,SQLDATE:Date,EventCode:String,Actor1Name:String,Actor1Type1Code:String,Actor2Name:String,Actor2Type1Code:String,ActionGeo_Long:Double,ActionGeo_Lat:Double,ActionGeo_FullName:String,*geom:Point:srid=4326
 --datetime SQLDATE
 --dtformat "yyyyMMdd"
 --idfields GLOBALEVENTID
 --lon ActionGeo_Long
 --lat ActionGeo_Lat
 --file ./ukraineNovToMar.csv
{% endhighlight %}

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
geomesa export -u username -p password -c gdelt_Ukraine -f gdelt -o csv -m 50
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