---
title: Time-Interpolated Queries
author: andrew
layout: tutorial
---
{% include tutorial-header.html %}

### This tutorial teaches how to:
1. Use Geoserver Web Processing Services (WPS)
2. Use time-interpolated queries
3. Query from and save results to Geoserver layers

#### Required Software
* Hadoop 2.2
* Accumulo 1.5.x
* Geomesa 1.0.x
* Geoserver 2.5.x

### What is a Time-Interpolated Query?
A time-interpolated query finds features that intersect in both **_space and time_**. Normal spatial or temporal queries select features that fall within a specified geometry, timerange, or both. A time-interpolated query has a changing geometry as you move foward in time.

Imagine you are traveling from Washington, DC to New York City and are interested in people traveling the same route at the same time. These travelers would be within a given distance from you at any point in the trip. They wouldn't be in DC while you were arriving in New York. Thus the geometry of results of your query would be **_a function of time_**. 

Time-interpolated queries are more complex than normal spatial or temporal queries and the input is a sequence of points or lines with an increasing time attribute. Time-interpolated queries are colloquially known as **_tube-selects_**.

### Configuring Geoserver
To get started, install the latest stable release of [2.5.x Geoserver](http://geoserver.org/release/stable/). You'll also need to install the [WPS Plugin](http://docs.geoserver.org/stable/en/user/extensions/wps/install.html). Depending on your hardware, it may be important to set the limits for your WMS plugin to be higher or disable them completely by clicking "WMS" under "Services" on the left side of the admin page of Geoserver. Check with your server administrator to determine the correct settings. For massive queries, the standard 60 second timeout may be too short.
!["Disable limits"](/img/tutorials/2014-05-16-geomesa-tubeselect/wms_limits.png)

You'll also need to install the Geomesa geoserver-plugin. Clone the locationtech/geomesa repo:
{% highlight bash %}
git clone git@github.com:locationtech/geomesa.git
{% endhighlight %}

Build the project, unzip the distribution tarball, and install the plugin to the geoserver lib directory:
{% highlight bash %}
mvn clean install
mkdir /tmp/geomesa-dist
tar -C /tmp/geomesa-dist -xvf geomesa-dist/target/geomesa-dist-accumulo1.5-1.0.0-SNAPSHOT-distribution.tar.gz
cd /tmp/geomesa-dist
cp geoserver/WEB-INF/lib/geomesa-plugin-accumulo1.5-1.0.0-SNAPSHOT-geoserver-plugin.jar $GEOSERVER_HOME/webapps/geoserver/WEB-INF/lib/
{% endhighlight %}

You'll probably also need to install various provided dependencies that are needed by Geomesa but are marked provided. This allows your server administrators to manage dependencies and upgrade for bugfixes. We have tried to include all the necessary jars. Be careful that you don't stomp any other dependencies when installing provided jars:
{% highlight bash %}
cd /tmp/geomesa-dist
cp dev/lib/* $GEOSERVER_HOME/webapps/geoserver/WEB-INF/lib
{% endhighlight %}

Start geoserver!
{% highlight bash %}
cd $GEOSERVER_HOME
bin/startup.sh
{% endhighlight %}

Once everything is installed you should see "vec:TubeSelect" appear in the [WPS Request Builder](http://docs.geoserver.org/stable/en/user/extensions/wps/requestbuilder.html)
!["vec:TubeSelect WPS plugin"](/img/tutorials/2014-05-16-geomesa-tubeselect/wps_builder1.png)

### Creating a WPS Request
The WPS builder will provide us with a sample XML document as a starting point to perform a tube select. Entering the values we want and clicking the "Generate XML" button gives us a sample XML document that we'll save off as "tube-select.xml" for usage later.

!["Generating XML from inputs"](/img/tutorials/2014-05-16-geomesa-tubeselect/generate_xml.png)

#### Chaining Processes
WPS supports chaining other WPS processes. This is most useful when selecting data from an existing layer or storing data back into geoserver to create a new layer. The Geoserver User Guide has a section on [Process Chaining](http://docs.geoserver.org/stable/en/user/extensions/wps/processes.html#process-chaining) that we use in creating our requests in the rest of the tutorial.

### Tube Selecting

#### Using a Layer as Input
For this demonstration, let's assume someone is traveling from Wilmington, DE to north of Philadelphia, PA along the New Jersey Turnpike and is tweeting. Each tweet would have a GPS coordinate and a timestamp allowing us to infer he was traveling somewhere around 55mph (25 m/s) on the Turnpike. This track is the input that defines the "tube" geometry for our query. Using the maxSpeed of 25 m/s and a maxTime of 120s we will create a space/time query tube. Here's a geoserver rendering of a possible track:

!["Tube Features"](/img/tutorials/2014-05-16-geomesa-tubeselect/tube_features.png)

#### Using JSON as Input

Instead of using a layer as input, you can manually define an input FeatureCollection track with JSON using [GeoJSON](http://geojson.org/). They features need a unique **_id_**, a **_geometry_** object, and a property named **_geomesa\_index\_start\_time_**. A sample of two of our input track points is shown below:

{% highlight xml %}
 <wps:Input>
  	<ows:Identifier>tubeFeatures</ows:Identifier>
  	<wps:Data>
   		 <wps:ComplexData mimeType="application/json">
            <![CDATA[
            {
               "features" : [
                    {
                        "id" : "0",
                        "geometry" : {
                            "coordinates": [-75.6002273 , 39.669456],
                            "type" : "Point"
                        },
                        "type" : "Feature",
                        "properties" : {
                            "geomesa_index_start_time" : "2014-05-17T15:33:16.000+0000",
                        }
                    }, {
                        "id" : "1",
                        "geometry" : {
                            "coordinates": [-75.5102991 , 39.6857254],
                            "type" : "Point"
                        },
                        "type" : "Feature",
                        "properties" : {
                            "geomesa_index_start_time" : "2014-05-17T15:39:28.000+0000",
                        }
                    }
               ],
               "type" : "FeatureCollection"
            }
            ]]>
        </wps:ComplexData>
  	</wps:Data>
</wps:Input>
{% endhighlight %}

#### Posting a Query
After creating our tube query xml we simple need to post it to our geoserver with curl:
{% highlight bash %}
curl -u admin:geoserver -H 'Content-type: xml' -XPOST -d@'/tmp/query.xml' http://localhost:8081/geoserver/wps | json_pp
{% endhighlight %}

In this request, the mime-type of the result variable is set to json in our file query.xml:

{% highlight xml %}
<wps:ResponseForm>
  <wps:RawDataOutput mimeType="application/json">
    <ows:Identifier>result</ows:Identifier>
  </wps:RawDataOutput>
</wps:ResponseForm>
{% endhighlight %}

We piped the output into json\_pp which will pretty print the output. You can install this with apt-get on ubuntu.
{% highlight bash %}
sudo apt-get install json_pp
{% endhighlight %}

### Saving Output as a Layer

Chaining your result with a **gs:import** process allows you to store your layer back into Geomesa allowing you to render a layer. Below we have created a layer combination with a map, our original tube track, and our results with maxSpeed 25m/s and maxTime 120s. These layers are **mapproxy:globe.osm.toner**, **accumulo:njtrack**, and **accumulo:nj120**

{% highlight bash %}
http://localhost:8081/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=mapproxy:globe.osm.toner,accumulo:njtrack,accumulo:nj120&styles=&bbox=-75.62390877,39.65103897,-74.81563784,40.04023423&width=1440&height=960&srs=EPSG:4326&format=application/openlayers
{% endhighlight %}

!["Tube Result at 25m/s 120s"](/img/tutorials/2014-05-16-geomesa-tubeselect/tube-25-120.png)

### Tweaking params

#### maxSpeed, maxTime, bufferSize

Adjusting the maxSpeed and maxTime parameters will increase the size of the tube from both a spatio and temporal aspect. Features that are further away in either time or geometry could possibly be reached by the input track by increasing these parameters. Below, we have doubled our maxTime to 240s creating a wider tube. Perhaps our friend strayed off the highway and visited a restaurant or gas station. We'd like to account for that possibility. Once again, a chained **gs:import** command has stored the layer as **nj240**.

{% highlight bash %}
http://localhost:8081/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=mapproxy:globe.osm.toner,accumulo:njtrack,accumulo:nj240&styles=&bbox=-75.62390877,39.65103897,-74.81563784,40.04023423&width=1440&height=960&srs=EPSG:4326&format=application/openlayers
{% endhighlight %}

!["Tube Result at 25m/s 240s"](/img/tutorials/2014-05-16-geomesa-tubeselect/tube-25-240.png)

#### gapFill
Many input tracks can be sparse. Our friend driving the Turnpike didn't tweet every 5 seconds. Selecting a gapFill method fills in those missing tracks. In this tutorial we used the **_line_** option for gap filling. The options to chose for gapFill are:

* **none** - use when you have a dense track
* **line** - draws a line between points two points and uses the time range of both points

### Beyond Curl
WPS services can also be accessed by a variety of clients including [OpenLayers](http://openlayers.org/) which has implemented a [JavaScript WPS Builder](http://dev.openlayers.org/releases/OpenLayers-2.13.1/examples/wps.html) tutorial similar to the one build into GeoServer.


