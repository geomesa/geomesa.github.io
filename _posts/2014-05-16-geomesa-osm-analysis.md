---
title: GeoMesa OSM (Open Street Map) Analysis
author: hunter
layout: tutorial
---

{% include tutorial-header.html %}

### This tutorial shows how to:

1. Quickly and easily ingest big OSM (Open Street Map) data files into a GeoMesa Accumulo table via a Kafka/Storm stream.
2. Leverage Geoserver to query and visualize the data.

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

Note: In this demonstration, we will use the simple-gps-points OSM data that contains only the location of an observation.

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
storm jar geomesa-osm-accumulo1.5-1.0-SNAPSHOT.jar \
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

Geotools uses a ```SimpleFeatureType``` to represent the schema for a feature source.  We can easily create a schema for the OSM feature type using the DataUtilities class.  The schema string is a comma separated list of `<ATTRIBUTE_NAME>:<ATTRIBUTE_CLASSNAME>`, e.g. "&#42;geom:Point:srid=4326".

{% highlight java linenos %}
SimpleFeatureType featureType = DataUtilities.createType(featureName, "geom:Point:srid=4326");
{% endhighlight %}

Finally, we create the new feature type in GeoMesa as follows.

{% highlight java %}
ds.createSchema(featureType);
{% endhighlight %}

### KAFKA

Now we are going to create a Kafka topic. Kafka serves as the entry point into our Storm topology. We create a topic with several partitions to parallelize the ingest both from the producer side as well as from the consumer side

{% highlight bash %}
kafka-create-topic.sh       \
   --zookeeper <zookeepers> \
   --replica 3              \
   --partition 10           \
   --topic OSM              \
{% endhighlight %}

Create a Kafka producer to convert the ingest file into kafka messages.

{% highlight bash %}
java -cp geomesa-osm-accumulo1.5-1.0-SNAPSHOT.jar     \
   geomesa.osm.OSMIngestProducer   \
   -ingestFile <ingestFile>        \
   -topic OSM                      \
   -brokers <kafka broker list>    \
{% endhighlight %}

Note that Kafka's default partitioner class assigns a message partition based on a hash of the provided Key. 
If no key is provided, all messages are assigned the same partition.

{% highlight java linenos %}
for (String x = bufferedReader.readLine();
    x != null;
    x = bufferedReader.readLine()) {
    producer.send(new KeyedMessage<String, String>(topic, String.valueOf(rnd.nextInt()), x));
}
{% endhighlight %}

### SPOUTS and BOLTS

In our example, the Storm spouts will consume messages from a Kafka topic and send them through the ingest topology.

{% highlight java linenos %}
public void nextTuple() {
    if(kafkaIterator.hasNext()) {
        List<Object> messages = new ArrayList<Object>();
        messages.add(kafkaIterator.next().message());
        _collector.emit(messages);
    }
}
{% endhighlight %}

In our example, the Bolts parse the message, create and write Features.
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
tar -xvf geomesa-dist/target/geomesa-dist-accumulo1.5-1.0.0-SNAPSHOT-distribution.tar.gz
{% endhighlight %}

Deploy the lib/*.jar files to Geoserver: slf4j-api, accumulo-core, guava, hadoop-client

Do not move the geomesa-distributed-runtime or geomesa-utils jars to Geoserver - they go to the tablet servers.
Be sure to move the GeoMesa Geoserver plugin (geomesa-plugin-accumulo1.5-1.0.0-SNAPSHOT-geoserver-plugin.jar)

If you are using tomcat:

{% highlight bash %}
cp geomesa-plugin/target/geomesa-plugin-accumulo1.5-1.0.0-SNAPSHOT-geoserver-plugin.jar /path/to/tomcat/webapps/geoserver/WEB-INF/lib/
{% endhighlight %}

If you are using GeoServer's built in Jetty web server:

{% highlight bash %}
cp geomesa-plugin/target/geomesa-plugin-accumulo1.5-1.0.0-SNAPSHOT-geoserver-plugin.jar ~/dev/geoserver-2.5/webapps/geoserver/WEB-INF/lib/
{% endhighlight %}

Your local Accumulo and Zookeepers JARs also need to be available within your GeoServer's `lib` directory.

Restart the server.

#### Register the GeoMesa DataStore with Geoserver

Click "Stores" and "Add new Store".
If you do not see the Accumulo Feature Data Store listed under Vector Data Sources, ensure the plugin is in the right directory and restart Geoserver.

!["Registering new Data Store"](/img/tutorials/2014-04-17-geomesa-gdelt-analysis/Accumulo_Feature_Data_Store.png)

Register the newly created Accumulo table using the same parameters specified in the command line above.
(If you use a workspace:layer name other than geomesa:gdelt, you will need to change the WMS requests that follow.)

!["Registering new Accumulo Feature Data Store"](/img/tutorials/2014-05-16-geomesa-osm-analysis/GeoserverAccumuloStoreRegistration.png)

#### PUBLISH LAYER

After registering the DataStore, click to publish the layer.
You will be taken to the Edit Layer screen.
In the Data pane, enter values for the bounding boxes. For the whole world, use [-180,-90,180,90].

#### QUERY

Let's look at events in Chicago.  The default point style is a red square that does not suit our purposes.  Add [this SLD file](/assets/tutorials/2014-05-16-geomesa-osm-analysis/OSMPoint.sld) to Geoserver, call it OSMPoint.sld

{% highlight bash %}
http://localhost:8080/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=geomesa:OSM&styles=OSMPoint&bbox=-87.63,41.88,-87.61,41.9&width=1400&height=600&srs=EPSG:4326&format=application/openlayers
{% endhighlight %}

!["Showing all OSM events in Chicago before Mar 12, 2012"](/img/tutorials/2014-05-16-geomesa-osm-analysis/ChicagoPoint.png)

#### HEATMAPS

Use a heatmap to more clearly visualize multiple events in the same location or high volume of data in general. Add [this SLD file](/assets/tutorials/2014-04-17-geomesa-gdelt-analysis/heatmap.sld) to Geoserver, call it heatmap.sld

{% highlight bash %}
http://localhost:8080/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=geomesa:OSM&styles=heatmap&bbox=-87.63,41.88,-87.61,41.9&width=1400&height=600&srs=EPSG:4326&format=application/openlayers
{% endhighlight %}

!["Showing heatmap of OSM events in Chicago before Mar 12, 2012"](/img/tutorials/2014-05-16-geomesa-osm-analysis/ChicagoDensity.png)
