---
title: Ingest & Export with GeoMesa Tools
author: andrew-and-jake
layout: tutorial
redirect_from:
    - /2014/10/09/geomesa-tools-ingest-export/
---

{% include tutorial-header.html %}

<!-- add some style to fix the xml formatting color -->
<style>
code.xml { color:#93a1a1 }
</style>

### This tutorial shows how to:

1. Ingest features into GeoMesa with the command line tools.
2. Use the command line tools to query and export data.
<!--more-->

### INTRODUCTION

<div class="callout callout-warning">
    <span class="glyphicon glyphicon-exclamation-sign"></span>
    The instructions in the tutorial apply to GeoMesa version 1.1.0-rc.6 and below. In later 
    releases, including the current development branch, the <code>geomesa ingest</code>
    command makes use of the <code>-conf</code> option to specify a <a href="https://github
    .com/locationtech/geomesa/tree/master/geomesa-convert">geomesa-convert</a> configuration file
    to pass arguments formerly specified by the <code>-cols</code>, <code>-dt</code>, <code>-dtf</code>,
    <code>-h</code>, <code>-id</code>, <code>-lat</code>, <code>-long</code>, and <code>-ld</code> 
    flags.
</div>

GeoMesa Tools is a set of command line tools to add feature management functions, query planning and
explanation, ingest, and export abilities from the command line. In this tutorial, we'll cover how
to ingest and export features using GeoMesa Tools.

### PREREQUISITES

If you haven't already gone through the [GeoMesa Deployment Tutorial](/geomesa-deployment/) and done an initial setup of the GeoMesa Tools, please finish those tutorials first and return back to this page.

### GETTING DATA

For this tutorial, we are going to download some [GDELT](http://gdeltproject.org/) data from [Google BigQuery](https://cloud.google.com/products/bigquery/).
The details involved for signing up can be found at their website, and the following [google blog post](http://googlecloudplatform.blogspot.com/2014/05/worlds-largest-event-dataset-now-publicly-available-in-google-bigquery.html) is also a good resource.
Once you have set up your account, run the following query to compile every protest in the Ukraine from November 1, 2013 to March 31, 2014 and download the data as a CSV.
This will cover the Euromaidan through the 2014 Ukrainian revolution and the annexation of the Crimean Peninsula.

{% highlight SQL %}

SELECT GLOBALEVENTID, SQLDATE, EventCode, Actor1Name, Actor1Type1Code, Actor2Name, Actor2Type1Code, ActionGeo_Long, ActionGeo_Lat, ActionGeo_FullName
FROM [gdelt-bq:full.events]
WHERE
 LEFT(EventCode, 2) = '19'
 AND ActionGeo_CountryCode='UP'
 AND SQLDATE BETWEEN 20131101 AND 20140331;

{% endhighlight %}

Rename the CSV file you just downloaded `ukraineNovToMar.csv`. Since the file is only around 1.5MB we will ingest it directly from the local file system without first loading it onto HDFS.

### INGESTING FEATURES

The ingest command currently supports three formats: CSV, TSV, and SHP.

The `ingest` command takes several has the following required flags in addition to Accumulo user and password:

* `-u` or `--user`: the Accumulo user
* `-p` or `--password`: the Accumulo password (will prompt if omitted)
* `-c` or `--catalog`: the name of the GeoMesa catalog table
* `-fn` or `--feature-name`: the name of the feature to ingest

If ``$ACCUMULO_HOME`` does not contain the configuration of the Accumulo instance you wish to connect to, you also must specify the connection parameters for Accumulo:

* `-i` or `--instance`: the Accumulo instance
* `-z` or `--zookeepers`: a comma-separated list of Zookeeper hosts

Additionally for CSV/TSV ingest there are several optional parameters that can be used:

* `-s` or `--spec`: The name of the ``SimpleFeatureType`` of the CSV or TSV file. Each column in the file must have a corresponding attribute in the ``SimpleFeatureType``. This is not required for SHP ingest.
* `-dt` or `--dtg`: The name of the field in the SFT that corresponds to the *time* column (default timezone is UTC).
* `-dtf` or `--dt-format`: The [Joda](http://www.joda.org/joda-time/) ``DateTimeFormat`` quote-wrapped string for the date-time field, e.g.: ``"MM/dd/yyyy HH:mm:ss"``.
* `-id` or `--id-fields`: The set of attributes of each feature used to encode the feature name.
* `-h` or `--hash`: A flag to optionally MD5 hash the resulting id created from the `--id-fields` flag.
* `-lon` or `--lon-attribute`: The name of the longitude field in the SimpleFeature if longitude is kept in the SFT spec; otherwise defines the csv field index used to create the default geometry.
* `-lat` or `--lat-attribute`: The name of the latitude field in the SimpleFeature if longitude is kept in the SFT spec; otherwise defines the csv field index used to create the default geometry.
* `-ld` or `--list-delimiter`: The character(s) to delimit list features.
* `-cols` or `--columns`: The set of numerical column indexes to be ingested. These must match (in number and order) the ``SimpleFeatureType`` specification (zero-indexed).

The last argument that is required for all ingest commands is the path to the file to ingest. If ingesting CSV/TSV data this can be an HDFS path, specified by prefixing it with `hdfs://`.

### GEOMETRIES FOR CSV/TSV FILES

Each feature/line of delimited data is required to contain a valid geometry. This geometry may be supplied in one of two ways:

* A [Well-Known-Text (WKT)](http://en.wikipedia.org/wiki/Well-known_text) geometry field
* Longitude and Latitude columns used to create a ``Point`` geoemtry

If you are attempting to ingest a file with longitude and latitude columns, you must append an additional attribute for the point geometry to the end of the ``SimpleFeatureType`` schema string , e.g.: `*geom:Point:srid=4326`.

When ingesting a file with a WKT geometry column, the `-lon` and `-lat` parameters should not be provided. Instead, the geometry column can be directly referenced in the SFT as the default geometry. e.g.: `*geom:Geometry:srid=4326` or `*geom:Point:srid=4326`.

### RUNNING AN INGEST

*If you have not already downloaded the sample set of GDELT data as described above, please do so now.*

Now that we know a little about the ingest tool, and have a set of data, we are going to construct the parameters needed to ingest the data.
To start, we need to determine the ``SimpleFeatureType`` for the GDELT data, looking at the query above and the file itself we can construct the following simple feature type.

{% highlight bash %}
GLOBALEVENTID:Integer,SQLDATE:Date,EventCode:String,Actor1Name:String,Actor1Type1Code:String,Actor2Name:String,
Actor2Type1Code:String,ActionGeo_Long:Float,ActionGeo_Lat:Float,ActionGeo_FullName:String,*geom:Point:srid=4326
{% endhighlight  %}

Again note the extra `*geom:Point:srid=4326` at the end of the ``SimpleFeatureType`` schema string. Since we are constructing a default geometry from the latitude and longitude coordinates, we must give the feature a geometry attribute.
The SQLDATE column contains the date of each event, and in this column the date time format is simply "yyyyMMdd" (for the syntax of the date format strings please refer to the [JODA documentation](http://joda-time.sourceforge.net/apidocs/org/joda/time/format/DateTimeFormat.html)):

{% highlight bash %}
-dt SQLDATE
-dtf "yyyyMMdd"
{% endhighlight %}

We specify the column that contains the unique identifier for each event:

{% highlight bash %}
-id GLOBALEVENTID
{% endhighlight %}

We also need to specify the names of the columns that contain the latitude and longitude; GeoMesa will use this information to build the content of the geometry field specified in the ``SimpleFeatureType`` schema string above. 

{% highlight bash %}
-lon ActionGeo_Long
-lat ActionGeo_Lat
{% endhighlight %}

We are also going to set the id fields parameter to contain the `GLOBALEVENTID`.
Now that we have everything ready, we will now combine the various parameters into the following complete ingest command:

{% highlight bash %}
geomesa ingest \
 -u <username> -p <password> -i <instance> -z <zookeepers> \
 -c gdelt_Ukraine -fn gdelt \
 -s 'GLOBALEVENTID:Integer,SQLDATE:Date,EventCode:String,Actor1Name:String,Actor1Type1Code:String,Actor2Name:String,Actor2Type1Code:String,ActionGeo_Long:Double,ActionGeo_Lat:Double,ActionGeo_FullName:String,*geom:Point:srid=4326' \
 -dt SQLDATE \
 -dtf "yyyyMMdd" \
 -id GLOBALEVENTID \
 -lon ActionGeo_Long \
 -lat ActionGeo_Lat \
 /path/to/ukraineNovToMar.csv
{% endhighlight %}

``<username>`` and ``<password>`` are the credentials associated with the Accumulo instance. ``<instance>`` and ``<zookeepers>`` are the connection parameters for Accumulo, if this is not specified in the configuration files in ``$ACCUMULO_HOME``.


### CUSTOMIZING INDEX FIELDS
GeoMesa ingest supports customizing which fields are ingested from a CSV or TSV file. If we decide to drop the fields `ActionGeo_Long` and `ActionGeo_Lat` from our SFT spec in favor of just a geometry field we must do three things:

1. Use the `-cols` attribute to indicate which positional fields from the csv file we want to ingest (0-6 and 9).
2. Provide numerical indexes from the original csv file for `-lon` and `-lat` (7 and 8)
3. Remove the lon/lat fields from our SFT spec.

Notice that the total number of ingest fields (0-6,9) selected using `-cols` is 8 while we have 9 in our SFT. The 9th field is the geometry that will be set from the dropped fields (7 and 8). The order of the fields (0-6,9) matches the first 8 fields of the SFT.

{% highlight bash %}
geomesa ingest \
 -u <username> -p <password> -i <instance> -z <zookeepers> \
 -c gdelt_Ukraine -fn gdelt \
 -s 'GLOBALEVENTID:Integer,SQLDATE:Date,EventCode:String,Actor1Name:String,Actor1Type1Code:String,Actor2Name:String,Actor2Type1Code:String,ActionGeo_FullName:String,*geom:Point:srid=4326' \
 -dt SQLDATE
 -dtf "yyyyMMdd" \
 -id GLOBALEVENTID \
 -lon 7 \
 -lat 8 \
 -cols 0-6,9 \
 /path/to/ukraineNovToMar.csv
{% endhighlight %}

### EXPORTING FEATURES

Let's export your newly ingested features in a couple of file formats. Currently, the `export`
command supports exports to CSV, TSV, Shapefile, GeoJSON, and GML. We'll do one of each format in
this next section.

The `export` command has 3 required flags:

* `-c` or `--catalog`: the name of the catalog table
* `-fn` or `--feature-name`: the name of the feature to export
* `-fmt` or `--format`: the output format (`csv`, `tsv`, `shp`, `geojson`, or `gml`)

Additionally, you can specify more details about the kind of export you would like to perform with optional flags for `export`: 

* `-at` or `--attributes`: the attributes of the feature to return
* `-max` or `--max-features`: the maximum number of features to return in an export
* `-q` or `--query`: a [CQL query](http://docs.geotools.org/latest/userguide/library/cql/index.html) to perform on the features, to return only subset of features matching the query

We'll use the `--max-features` flag to ensure our dataset is small and quick to export. First, we'll export to CSV with the following command:

{% highlight bash %}
$ geomesa export -u <username> -p <password> -c gdelt_Ukraine -fn gdelt -fmt csv -max 50
# or specifying Accumulo configuration explicitly:
$ geomesa export -u <username> -p <password> \
  -i <instance> -z <zookeepers> \
  -c gdelt_Ukraine -fn gdelt \
  -fmt csv -max 50
{% endhighlight %}

This command will output the relevant rows to the console.  Inspect the rows now, or pipe the output into a file for later review.

Now, run the above command four additional times, changing the `--format` flag to `tsv`, `shp`, `json`, and `gml`. The `shp` format also requires the `-o` option to specify the name of an output file. 

Inspect the output to ensure your data was properly exported in the respective formats (and if it wasn't, be sure to
[submit a bug to our listserv](mailto:geomesa-users@locationtech.org)).

<!--
## Explaining Queries

One last command in the GeoMesa Command Line Tools module is the `explain` command, which is covered
in detail in the post [Understanding Queries by James Hughes](no-link-yet).
-->

### CONCLUSION
In this tutorial, you learned about the how to run ingests and exports using the GeoMesa Command
Line Tools. We covered `ingest` and `export`. If you have ideas for additional functionality to
include in the Command Line Tools module, please don't hesitate to
[reach out on our listserv](mailto:geomesa-users@locationtech.org).
