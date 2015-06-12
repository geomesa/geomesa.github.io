---
title: GeoMesa Quick Start
author: chris
layout: tutorial
redirect_from:
    - /2014/05/28/geomesa-quickstart/
    - /2014/04/10/geomesa-quickstart/
---

{% include tutorial-header.html %}

### This tutorial will introduce how to:

1. write custom Java code using GeoMesa to do the following:
    1.  create a custom ```FeatureType```
    2.  prepare a GeoMesa-managed table backed by Accumulo to accept your new type
    3.  create a collection of new records
    4.  write these new records to the GeoMesa-managed table
    5.  query your data
2. visualize data within GeoServer
<!--more-->

<div class="callout callout-warning">
    <span class="glyphicon glyphicon-exclamation-sign"></span>
    You will need access to a Hadoop 2.2 installation as well as an Accumulo 1.5.x database.
</div>

#### Other prerequisites

You must go through the [GeoMesa Deployment tutorial](http://geomesa.org/geomesa-deployment/) first, completing the tasks relevant to Accumulo.

Afterwards, it may be necessary to change the versions of Accumulo and Hadoop that the quickstart tutorial uses.

The ```pom.xml``` file in the root geomesa directory contains an explicit list of dependent libraries that will be bundled together into the final tutorial. You should confirm that the versions of Accumulo and Hadoop match what you are running; if it does not match, change the value in the POM. (NB: The only reason these libraries are bundled into the final JAR is that this is easier for most people to do this than it is to set the classpath when running the tutorial. If you would rather not bundle these dependencies, mark them as provided in the POM, and update your classpath as appropriate.)

Navigate to the directory where GeoMesa was installed and run:

```
mvn clean install -f geomesa-examples/geomesa-accumulo-quickstart/pom.xml
```

When this is complete, it should have built a JAR file that contains all of the code you need to run the tutorial with the correct dependencies.

### RUN THE TUTORIAL

On the command-line, run:

{% highlight bash %}
java -cp ./geomesa-examples/geomesa-accumulo-quickstart/target/geomesa-accumulo-quickstart-{{ site.stableVersion }}.jar org.locationtech.geomesa.examples.AccumuloQuickStart -instanceId somecloud -zookeepers "zoo1:2181,zoo2:2181,zoo3:2181" -user someuser -password somepwd -tableName sometable
{% endhighlight %}

where you provide your own values for the following place-holder arguments:

* ```somecloud```: the name of your Accumulo instance
* ```"zoo1:2181,zoo2:2181,zoo3:2181"```: your Zookeeper nodes, separated by commas
* ```someuser```: the name of an Accumulo user that has permissions to create, and write to, tables
* ```somepwd```: the password for the previously-mentioned Accumulo user
* ```sometable```: the name of the destination table that will accept these test records; this table should either not exist or should be empty

You should see output similar to the following (not including some of Maven's output and log4j's warnings):

{% highlight bash %}
Creating feature-type (schema):  AccumuloQuickStart
Creating new features
Inserting new features
Submitting query
1.  Bierce|640|Sun Sep 14 15:48:25 EDT 2014|POINT (-77.36222958792739 -37.13013846773835)|null
2.  Bierce|886|Tue Jul 22 14:12:36 EDT 2014|POINT (-76.59795732474399 -37.18420917493149)|null
3.  Bierce|925|Sun Aug 17 23:28:33 EDT 2014|POINT (-76.5621106573523 -37.34321201566148)|null
4.  Bierce|589|Sat Jul 05 02:02:15 EDT 2014|POINT (-76.88146600670152 -37.40156607152168)|null
5.  Bierce|394|Fri Aug 01 19:55:05 EDT 2014|POINT (-77.42555615743139 -37.26710898726304)|null
6.  Bierce|931|Fri Jul 04 18:25:38 EDT 2014|POINT (-76.51304097832912 -37.49406125975311)|null
7.  Bierce|322|Tue Jul 15 17:09:42 EDT 2014|POINT (-77.01760098223343 -37.30933767159561)|null
8.  Bierce|343|Wed Aug 06 04:59:22 EDT 2014|POINT (-76.66826220670282 -37.44503877750368)|null
9.  Bierce|259|Thu Aug 28 15:59:30 EDT 2014|POINT (-76.90122194030118 -37.148525741002466)|null
{% endhighlight %}

### INSIGHT INTO HOW THE TUTORIAL WORKS

The source code is meant to be accessible for this tutorial, but here is a high-level breakdown of the sections that are relevant:

* lines 3-31:  package imports
* lines 65-110:  helper code to establish the command-line parser for Accumulo options
* lines 112-119:  create a `HashMap` of Accumulo parameters that will be used to fetch a `DataStore`
* lines 121-143:  defines the custom `FeatureType` used in the tutorial.  There are five fields:  Who, What, When, Where, and Why.
* lines 145-193:  creates a collection of new features, each of which is initialized to some randomized set of values
* lines 195-202:  instructs the `DataStore` to write the collection of new features to the GeoMesa-managed Accumulo table
* lines 204-227:  given a set of geometric bounds, temporal bounds, and an optional attribute-only expression, construct a common query language (CQL) filter that embodies these constraints.  This filter will be used to query data.
* lines 229-257:  query for records; for each, print out the five field (attribute) values
* lines 259-294:  this is the main entry point; it collects command-line parameters, builds the `DataStore`, creates and inserts new records, and then kicks off a single query

### VISUALIZE DATA WITH GEOSERVER

#### Register the GeoMesa store with GeoServer

Log into GeoServer using your user and password credentials.  Click "Stores" and "Add new Store".
If you do not see the Accumulo Feature Data Store listed under Vector Data Sources, ensure the plugin is in the right directory and restart GeoServer.

Select the `Accumulo Feature Data Store` vector data source, and enter the following parameters:

* basic store info
    * `workspace`:  this is dependent upon your GeoServer installation
    * `data source name`:  pick a sensible name, such as, `geomesa_quick_start`
    * `description`:  this is strictly decorative; `GeoMesa quick start`
* connection parameters:  these are the same parameter values that you supplied on the command-line when you ran the tutorial; they describe how to connect to the Accumulo instance where your data reside

Click "Save", and GeoServer will search your Accumulo table for any GeoMesa-managed feature types.

#### Publish the layer

GeoServer should recognize the `QuickStart` feature type, and should present that as a layer that could be published.  Click on the "Publish" link.

You will be taken to the Edit Layer screen. Two of the tabs need to be updated: Data and Dimensions.

In the Data pane, enter values for the bounding boxes.  In this case, you can click on the link to compute these values from the data.

In the Dimensions tab, check the "Enabled" checkbox under Time. Then select "When" in the Attribute and End Attribute dropdowns, and "Continuous Interval" in the Presentation dropdown.

Click on the "Save" button when you are done.

#### Take a look

Click on the "Layer Preview" link in the left-hand gutter.  If you don't see the quick-start layer on the first page of results, enter the name of the layer you just created into the search box, and press &lt;Enter&gt;.
 
Once you see your layer, click on the "OpenLayers" link, which will open a new tab.  By default, the display that opens will not show all the data, because we have enabled the time dimension for this layer, but the preview does not specify a time.  In the URL bar for the visualization, add the following to the end:
 
 ```
 &TIME=2014-01-01T00:00:00.000Z/2014-12-31T23:59:59.999Z
 ```
 
That tells GeoServer to display the records for the entire calendar year 2014.  You can find more information about the TIME parameter from [GeoServer's documentation](http://docs.geoserver.org/latest/en/user/services/wms/time.html).

Once you press &lt;Enter&gt;, the display will update, and you should see a collection of red dots similar to the following image.

!["Visualizing quick-start data"](/img/tutorials/2014-04-10-geomesa-quickstart/geoserver-layer-preview.png)

#### Tweaking the display

Here are just a few simple ways you can play with the visualization:

* Click on one of the red points in the display, and GeoServer will report the detail records underneath the map area.
* Shift-click to highlight a region within the map that you would like to zoom into.
* Alter the `TIME=` parameter in the URL to a different date range, and you can filter to see only the records that satisfy the temporal constraint.
* Click on the "Toggle options toolbar" icon in the upper-left corner of the preview window.  The right-hand side of the screen will include a "Filter" text box.  Enter `Who = 'Bierce'`, and press on the "play" icon.  The display will now show only those points matching your filter criterion.  This is a CQL filter, which can be constructed in various ways to query our data.  You can find more information about CQL from [GeoServer's CQL tutorial](http://docs.geoserver.org/latest/en/user/tutorials/cql/cql_tutorial.html).

Generating Heatmaps:

* To try out the DensityIterator, you can install the Heatmap SLD from the [GDELT tutorial](http://www.geomesa.org/geomesa-gdelt-analysis/#heatmaps).
* After configuring the SLD, in the URL, change `styles=` to be `styles=heatmap&amp;density=true`.  Once you press &lt;Enter&gt;, the display will change to a density heat-map.  (NB:  For this to work, you will have to first install the WPS module for GeoServer.  See the official web site for a download.)
