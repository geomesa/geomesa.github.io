---
title: GeoMesa OSM Analysis
author: hunter
layout: tutorial
---

{% include tutorial-header.html %}

### This tutorial shows how to:

1. quickly and easily ingest big OSM data files into a GeoMesa Accumulo table via a Kafka/Storm stream.
2. leverage Geoserver to query and visualize the data.

<div class="callout callout-warning">
    <span class="glyphicon glyphicon-exclamation-sign"></span>
    You will need access to a Kafka 0.8 installation, a Storm 0.8 installation as well as an Accumulo 1.5.x database.
</div>

### INGEST

#### Obtaining OSM
You can download the OSM data [here](http://planet.openstreetmap.org/gps/simple-gps-points-120312.txt.xz).  Use the following command to unpack the data:

{% highlight bash %}
xz filename.xz
{% endhighlight %}

Note: The complete OSM data set -- that has more columns than the latitude and longitude -- is not supported via this ingest.

Clone geomesa and geomesa-osm projects:
{% highlight bash %}
git clone git@github.com:locationtech/geomesa.git
git clone git@github.com:geomesa/geomesa-osm.git
{% endhighlight %}

Build the projects using

{% highlight bash %}
mvn clean install
{% endhighlight %}

### STORM

Use storm jar to submit the topology to your Storm Nimbus.

{% highlight bash %}
storm jar geomesa-osm-1.0.0.jar                  \
   geomesa.osm.OSMIngest                         \
   -instanceId <accumulo-instance-id>            \
   -zookeepers <zookeeper-hosts-string>          \   
   -user <username> -password <password>         \
   -auths <comma-separated-authorization-string> \
   -tableName OSM -featureName event             \
   -topic OSM                                    \
{% endhighlight %}

Note that authorizations are optional.  Unless you know that your table already exists with explicit authorizations, or that it will be created with default authorizations, you probably want to omit this parameter.

### DataStore Initialization

Geotools uses a ```SimpleFeatureType``` to represent the schema for a feature source.  We can easily create a schema for the GDELT feature type using the DataUtilities class.  The schema string is a comma separated list of `<ATTRIBUTE_NAME>:<ATTRIBUTE_CLASSNAME>`, e.g. "lat:Integer".
Specify the default geometry attribute with an asterisk, e.g. "&#42;geom:Point:srid=4326".

{% highlight java linenos %}
static List<String> attributes = Lists.newArrayList(
            "lat:Integer",
            "lon:Integer",
            "&#42;geom:Point:srid=4326"
            );
String spec = Joiner.on(",").join(attributes);
SimpleFeatureType featureType = DataUtilities.createType(name, spec);
{% endhighlight %}

Finally, we create the new feature type in GeoMesa as follows.

{% highlight java %}
ds.createSchema(featureType);
{% endhighlight %}

### KAFKA

Create Kafka topic.

{% highlight bash %}
kafka-create-topic.sh       \
   --zookeeper <zookeepers> \
   --replica 3              \
   --partition 10           \
   --topic OSM              \
{% endhighlight %}

Create a Kafka producer to convert the ingest file into kafka messages.

{% highlight bash %}
java -cp geomesa-osm-1.0.0.jar     \
   geomesa.osm.OSMIngestProducer   \
   -ingestFile <ingestFile>        \
   -topic OSM                      \
   -brokers <kafka broker list>    \
{% endhighlight %}

Note that Kafka's default partitioner class assigns message partition based on a hash of the provided Key. 
If no key is provided, all messages are assigned the same partition.

In our example, we combine 40 records into a single Kafka message to increase performance.

{% highlight java linenos %}
agglomeratedData.add(x);
if (agglomeratedData.size() == 40) {
    producer.send(new KeyedMessage<String, String>(topic, String.valueOf(rnd.nextInt()), Joiner.on("%").join(agglomeratedData)));
    agglomeratedData = new ArrayList<String>();
}
{% endhighlight %}

### SPOUTS and BOLTS

Spouts consume messages from a Kafka queue.
They operate in parallel, each on a different partition, converting messages into streams of Tuples that are read from Bolts.

{% highlight java linenos %}
public void nextTuple() {
    if(kafkaIterator.hasNext()) {
        List<Object> messages = new ArrayList<Object>();
        messages.add(kafkaIterator.next().message());
        _collector.emit(messages);
    }
}
{% endhighlight %}

The Bolts parse the message, create and write Features.
In the `prepare` method of the Bolt class, we grab the connection params that were initialized in the constructor and get a handle on a `FeatureWriter`.

{% highlight java linenos %}
ds = DataStoreFinder.getDataStore(connectionParams);
SimpleFeatureType featureType = ds.getSchema(featureName);
featureBuilder = new SimpleFeatureBuilder(featureType);
featureWriter = ds.getFeatureWriter(featureName, Transaction.AUTO_COMMIT);
{% endhighlight %}

The input to the Bolt's execute method is a Tuple containing a String.  We split the String on '%' to get individual points.  For each point, we split on commas to extract the attributes.  We parse the latitude and longitude field to set the default geometry of our `SimpleFeature`.  Note that OSM latitude and longitude values are stored as integers that must be divided by 10^7.

{% highlight java linenos %}

private Geometry getGeometry(final String[] attributes) {
    .
    .
    .
    final Double lat = (double)Integer.parseInt(attributes[LATITUDE_COL_IDX]) / 1e7;
    final Double lon = (double)Integer.parseInt(attributes[LONGITUDE_COL_IDX]) / 1e7;
    return geometryFactory.createPoint(new Coordinate(lon, lat));
}
{% endhighlight %}

{% highlight java linenos %}

public void execute(Tuple tuple) {
    .
    .
    .
    featureBuilder.reset();
    featureBuilder.addAll(attributes);
    final SimpleFeature simpleFeature = featureBuilder.buildFeature(String.valueOf(UUID.randomUUID().getMostSignificantBits()));
    simpleFeature.setDefaultGeometry(getGeometry(attributes));

    try {
        final SimpleFeature next = featureWriter.next();
        for (int i = 0; i < simpleFeature.getAttributeCount(); i++) {
            next.setAttribute(i, simpleFeature.getAttribute(i));
        }
        ((FeatureIdImpl)next.getIdentifier()).setID(simpleFeature.getID());
        featureWriter.write();
    }
}
{% endhighlight %}

### ANALYZE

#### Geoserver Setup

Expand the tar ball below:

{% highlight bash %}
tar -xvf geomesa-dist/target/geomesa-dist-1.0.0-SNAPSHOT-distribution.tar.gz
{% endhighlight %}

Deploy the lib/*.jar files to Geoserver.
Do not move the geomesa-distributed-runtime or geomesa-utils jars to Geoserver - they go to the tablet servers.
Be sure to move the GeoMesa Geoserver plugin (geomesa-plugin-1.0.0-SNAPSHOT-geoserver-plugin.jar)

If you are using tomcat:

{% highlight bash %}
cp geomesa-plugin/target/geomesa-plugin-1.0.0-SNAPSHOT-geoserver-plugin.jar /path/to/tomcat/webapps/geoserver/WEB-INF/lib/geomesa-plugin-1.0.0-SNAPSHOT-geoserver-plugin.jar
{% endhighlight %}

If you are using GeoServer's built in Jetty web server:

{% highlight bash %}
cp geomesa-plugin/target/geomesa-plugin-1.0.0-SNAPSHOT-geoserver-plugin.jar ~/dev/geoserver-2.5/webapps/geoserver/WEB-INF/lib/
{% endhighlight %}

Your local Accumulo and Zookeepers JARs also need to be available within your GeoServer's `lib` directory.

Restart the server.

#### Register the GeoMesa DataStore with Geoserver

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

#### QUERY

Let's look at events in the Ukraine from 2013 until April 30, 2014. The red squares are the default styling that Geoserver applies to point data.


{% highlight bash %}
http://localhost:8080/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=geomesa:gdelt&styles=&bbox=31.6,44,37.4,47.75&width=1200&height=600&srs=EPSG:4326&format=application/openlayers&TIME=2013-01-01T00:00:00.000Z/2014-04-30T23:00:00.000Z
{% endhighlight %}

!["Showing all  GDELT events from Jan 1, 2013 to April 30, 2014"](/img/tutorials/2014-04-17-geomesa-gdelt-analysis/Ukraine_Unfiltered.png)

#### FILTER

Let's narrow our results. GDELT codes events using the CAMEO (Conflict and Mediation Event Observations).  The CAMEO code for events of type 'THREATEN' starts with '13'.  We can filter down to these events using the drop down in Geoserver's OpenLayers preview.

!["Open Geoserver Toggle Options Toolbar"](/img/tutorials/2014-04-17-geomesa-gdelt-analysis/Geoserver_Toggle_Options_Toolbar.png)

!["Enter CQL Filter into Toolbar"](/img/tutorials/2014-04-17-geomesa-gdelt-analysis/Geoserver_Layer_Preview_Drop_Down.png)

Let's use a custom icon to display THREATEN events. Add [this SLD file](/assets/tutorials/2014-04-17-geomesa-gdelt-analysis/threat.sld) to Geoserver, call it threat.sld
For the ExternalGraphic in the SLD to work, move the image file to the specified location in your geoserver installation.

{% highlight bash %}
http://localhost:8080/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=geomesa:gdelt&CQL_FILTER=EventRootCode=13&styles=threat&bbox=31.6,44,37.4,47.75&width=1200&height=600&srs=EPSG:4326&format=application/openlayers&TIME=2013-01-01T00:00:00.000Z/2014-04-30T23:00:00.000Z
{% endhighlight %}

!["Showing GDELT events with CAMEO root code THREATEN from Jan 1, 2013 to April 30, 2014"](/img/tutorials/2014-04-17-geomesa-gdelt-analysis/Ukraine_Event_RootCode_Threaten.png)

#### HEATMAPS

Use a heatmap to more clearly visualize multiple events in the same location or high volume of data in general. Add [this SLD file](/assets/tutorials/2014-04-17-geomesa-gdelt-analysis/heatmap.sld) to Geoserver, call it heatmap.sld


In the request below, the heatmap is before the points layer so that the points will be overlayed and not hidden. 
Notice the &env=radiusPixels:30, this is SLD variable substitution and will replace the default value assigned in the SLD.

{% highlight bash %}
http://localhost:8080/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=geomesa:gdelt,geomesa:gdelt&CQL_FILTER=include;EventRootCode=13&styles=heatmap,threat&bbox=31.6,44,37.4,47.75&width=1200&height=600&srs=EPSG:4326&format=application/openlayers&TIME=2013-01-01T00:00:00.000Z/2014-04-30T23:00:00.000Z&env=radiusPixels:30
{% endhighlight %}

!["Showing heatmap with event overlay of GDELT events with CAMEO root code THREATEN from Jan 1, 2013 to April 30, 2014"](/img/tutorials/2014-04-17-geomesa-gdelt-analysis/Heatmap_Ukraine_EventRootCode_Threaten.png)
