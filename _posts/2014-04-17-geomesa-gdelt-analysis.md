---
title: GeoMesa GDELT Analysis
author: hunter
layout: tutorial
---

{% include tutorial-header.html %}

### This tutorial shows how to:

1. quickly and easily ingest big GDELT data files into a GeoMesa Accumulo table via a Hadoop Map/Reduce job.
2. leverage Geoserver to query and visualize the data.

<div class="callout callout-warning">
    <span class="glyphicon glyphicon-exclamation-sign"></span>
    You will need access to a Hadoop 2.2 installation as well as an Accumulo 1.5.x database.
</div>

### INGEST

#### Obtaining GDELT
You can download the GDELT data at [here](http://data.gdeltproject.org/events/index.html).  Use the following command to unpack the data and upload it to HDFS.

{% highlight bash %}
(ls -1 | xargs -n 1 zcat) | hadoop fs -put - /gdelt/uncompressed/gdelt.tsv
{% endhighlight %}

Clone geomesa and geomesa-gdelt projects:
{% highlight bash %}
git clone git@github.com:locationtech/geomesa.git
git clone git@github.com:geomesa/geomesa-gdelt.git
{% endhighlight %}

Build the projects using

{% highlight bash %}
mvn clean install
{% endhighlight %}

Use hadoop jar to launch the Map/Reduce ingest job

{% highlight bash %}
hadoop jar /path/to/geomesa-gdelt-1.0-SNAPSHOT.jar \
   geomesa.gdelt.GDELTIngest                       \
   -instanceId <accumulo-instance-id>              \
   -zookeepers <zookeeper-hosts-string>            \
   -user <username> -password <password>           \
   -auths <comma-separated-authorization-string>   \
   -tableName gdelt -featureName event             \
   -ingestFile hdfs:///gdelt/uncompressed/gdelt.tsv
{% endhighlight %}

### DataStore Initialization

Geotools uses a ```SimpleFeatureType``` to represent the schema for a feature source.  We can easily create a schema for the GDELT feature type using the DataUtilities class.  The schema string is a comma separated list of `<ATTRIBUTE_NAME>:<ATTRIBUTE_CLASSNAME>`, e.g. "DATEADDED:Integer".
Specify the default geometry attribute with an asterisk, e.g. "&#42;geom:Point:srid=4326".

{% highlight java linenos %}
static List<String> attributes = Lists.newArrayList(
            "GLOBALEVENTID:Integer",
            "SQLDATE:Date",
            "MonthYear:Integer",
            "Year:Integer",
            "FractionDate:Float",
            ...);
String spec = Joiner.on(",").join(attributes);
SimpleFeatureType featureType = DataUtilities.createType(name, spec);
{% endhighlight %}

After we create the GDELT feature type, we have to tell GeoMesa which field to use for the date index.  We specify this field using the ```SimpleFeatureType```'s user data.

{% highlight java %}
//This tells GeoMesa to use this Attribute as the Start Time index
featureType.getUserData().put(Constants.SF_PROPERTY_START_TIME, "SQLDATE");
{% endhighlight %}

Finally, we create the new feature type in GeoMesa as follows.

{% highlight java %}
ds.createSchema(featureType);
{% endhighlight %}

### MAPPER

In the `setup` method of the Mapper class, we grab the connection params from the `JobContext` and get a handle on a `FeatureWriter`.

{% highlight java linenos %}
DataStore ds = DataStoreFinder.getDataStore(connectionParams);
featureType = ds.getSchema(featureName);
featureBuilder = new SimpleFeatureBuilder(featureType);
featureWriter = ds.getFeatureWriter(featureName, Transaction.AUTO_COMMIT);
{% endhighlight %}

The input to the map method is a single line of the GDELT TSV file.  We split the line on tabs and extract the attributes of the data.  We parse the latitude and longitude field to set the default geometry of our `SimpleFeature`.

Geotools provides common conversions for most data types and some date formats.  However, any Attribute strings that will not convert automatically into the specified class need to be explicitly set on the SimpleFeature. See "SQLDATE" below.

{% highlight java linenos %}
featureBuilder.reset();
featureBuilder.addAll(attributes);

Double lat = Double.parseDouble(attributes[LATITUDE_COL_IDX]);
Double lon = Double.parseDouble(attributes[LONGITUDE_COL_IDX]);
Geometry geom = geometryFactory.createPoint(new Coordinate(lon, lat));
SimpleFeature simpleFeature = featureBuilder.buildFeature(attributes[ID_COL_IDX]);
simpleFeature.setAttribute("SQLDATE", formatter.parse(attributes[DATE_COL_IDX]));
simpleFeature.setDefaultGeometry(geom);

try {
    SimpleFeature next = featureWriter.next();
    next.setAttributes(simpleFeature.getAttributes());
    ((FeatureIdImpl)next.getIdentifier()).setID(simpleFeature.getID());
    featureWriter.write();
}
{% endhighlight %}

### ANALYZE

#### Register the GeoMesa DataStore with Geoserver

Deploy the GeoMesa geoserver plugin to Geoserver and restart the server

If you are using tomcat, it goes here:

{% highlight bash %}
/path/to/tomcat/webapps/geoserver/WEB-INF/lib/geomesa-plugin-1.0.0-SNAPSHOT-geoserver-plugin.jar
{% endhighlight %}

Click "Stores" and "Add new Store".
If you do not see the Accumulo Feature Data Store listed under Vector Data Sources, ensure the plugin is in the right directory and restart Geoserver.

!["Registering new Data Store"](/img/tutorials/2014-04-17-geomesa-gdelt-analysis/Accumulo_Feature_Data_Store.png)

Register the newly created Accumulo table using the same parameters specified in the command line above.
(If you use a workspace:layer name other than geomesa:gdelt, you will need to change the WMS requests that follow.)

!["Registering new Accumulo Feature Data Store"](/img/tutorials/2014-04-17-geomesa-gdelt-analysis/Geoserver_Accumulo_Store_Registration.png)

#### PUBLISH LAYER

After registering the DataStore, click to publish the layer.
You will be taken to the Edit Layer screen.
In the Data pane, enter values for the bounding boxes. For the whole world, use [-180,-90,180,90].
In the Dimensions pane, enable Time and select the SQLDATE field.  You will also need to specify a presentation for time - use List as a default.

!["Enable Time for the Layer"](/img/tutorials/2014-04-17-geomesa-gdelt-analysis/Edit_Layer_Enable_Time.png)

#### QUERY

Let's look at events in the Ukraine from 2013 until April 30, 2014. The red squares are the default styling that Geoserver applies to point data.


{% highlight bash %}
http://localhost:8080/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=geomesa:gdelt&styles=&bbox=31.6,44,37.4,47.75&width=1200&height=600&srs=EPSG:4326&format=application/openlayers&TIME=2013-01-01T00:00:00.000Z/2014-04-30T23:00:00.000Z
{% endhighlight %}

!["Showing all GDELT events from Jan 1, 2013 to April 30, 2014"](/img/tutorials/2014-04-17-geomesa-gdelt-analysis/Ukraine_Unfiltered.png)

#### FILTER

Let's narrow our results. GDELT codes events using the CAMEO (Conflict and Mediation Event Observations).  The CAMEO code for events of type 'THREATEN' starts with '13'.  We can filter down to these events using the drop down in Geoserver's OpenLayers preview.

!["Open Geoserver Toggle Options Toolbar"](/img/tutorials/2014-04-17-geomesa-gdelt-analysis/Geoserver_Toggle_Options_Toolbar.png)

!["Enter CQL Filter into Toolbar"](/img/tutorials/2014-04-17-geomesa-gdelt-analysis/Geoserver_Layer_Preview_Drop_Down.png)

{% highlight bash %}
http://localhost:8080/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=geomesa:gdelt&CQL_FILTER=EventRootCode=13&styles=&bbox=31.6,44,37.4,47.75&width=1200&height=600&srs=EPSG:4326&format=application/openlayers&TIME=2013-01-01T00:00:00.000Z/2014-04-30T23:00:00.000Z
{% endhighlight %}

!["Showing GDELT events with CAMEO root code THREATEN from Jan 1, 2013 to April 30, 2014"](/img/tutorials/2014-04-17-geomesa-gdelt-analysis/Ukraine_Event_RootCode_Threaten.png)

#### HEATMAPS

Use a heatmap to more clearly visualize multiple events in the same location or high volume of data in general. Add [this SLD file](/assets/tutorials/2014-04-17-geomesa-gdelt-analysis/heatmap.sld) to Geoserver, call it heatmap.sld


In the request below, the heatmap is before the points layer so that the points will be overlayed and not hidden. 
Notice the &env=radiusPixels:30, this is SLD variable substitution and will replace the default value assigned in the SLD.

{% highlight bash %}
http://localhost:8080/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=geomesa:gdelt,geomesa:gdelt&CQL_FILTER=EventRootCode=13;EventRootCode=13&styles=heatmap,&bbox=31.6,44,37.4,47.75&width=1200&height=600&srs=EPSG:4326&format=application/openlayers&TIME=2013-01-01T00:00:00.000Z/2014-04-30T23:00:00.000Z&env=radiusPixels:30
{% endhighlight %}

!["Showing heatmap with event overlay of GDELT events with CAMEO root code THREATEN from Jan 1, 2013 to April 30, 2014"](/img/tutorials/2014-04-17-geomesa-gdelt-analysis/Heatmap_Ukraine_EventRootCode_Threaten.png)
