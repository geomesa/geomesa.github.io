---
title: GeoMesa Deployment
author: the-trio 
layout: tutorial
redirect_from:
    - /2015/05/05/geomesa-deployment/
---

{% include tutorial-header.html %}

### This tutorial will introduce how to:

1. Install GeoMesa Command Line Tools
2. Deploy the Distributed Runtime Jar to your Accumulo Cluster.
3. Deploy the GeoServer Plugin.
4. Deploy necessary dependencies for GeoMesa's GeoServer plugin for Accumulo and/or Kafka.
<!--more-->

<div class="callout callout-warning">
    <span class="glyphicon glyphicon-exclamation-sign"></span>
    For Accumulo deployment, you will need access to a Hadoop 2.2 installation as well as an Accumulo {{ site.accumuloVersion }} database.
</div>

#### Other prerequisites

Before you begin, you should also have these:

* basic knowledge of [GeoTools](http://www.geotools.org), [GeoServer](http://geoserver.org), [Accumulo](http://accumulo.apache.org), and/or [Kafka](http://kafka.apache.org)
* an Accumulo user that has both create-table and write permissions
* a Java 1.7 or higher runtime 

### DOWNLOAD GEOMESA

GeoMesa artifacts are available for download or can be built from source. The easiest way to get started is to [download the most recent stable version ({{ site.stableVersion }})](http://repo.locationtech.org/content/repositories/geomesa-releases/org/locationtech/geomesa/geomesa-assemble/{{ site.stableVersion }}/geomesa-assemble-{{ site.stableVersion }}-bin.tar.gz) and untar it somewhere convenient:

{% highlight bash %}
# cd to a convenient directory for installing geomesa 
$ cd ~/tools

# download and unpackage the most recent distribution
$ wget http://repo.locationtech.org/content/repositories/geomesa-releases/org/locationtech/geomesa/geomesa-assemble/{{ site.stableVersion }}/geomesa-assemble-{{ site.stableVersion }}-bin.tar.gz
$ tar xvf geomesa-assemble-{{ site.stableVersion }}-bin.tar.gz
$ cd geomesa-{{ site.stableVersion }}
$ ls
bin  dist  docs  lib  LICENSE.txt  README.md
{% endhighlight %}

### INSTALL THE GEOMESA TOOLS

GeoMesa comes with a set of command line tools for managing features. To complete the setup of the tools, cd into the bin directory and execute geomesa configure:

{% highlight bash %}
$ cd ~/tools/geomesa-{{ site.stableVersion }}/bin
$ ./geomesa configure
Warning: GEOMESA_HOME is not set, using ~/tools/geomesa-{{ site.stableVersion }}
Using GEOMESA_HOME as set: ~/tools/geomesa-{{ site.stableVersion }}
Is this intentional? Y\n Y
Warning: GEOMESA_LIB already set, probably by a prior configuration.
 Current value is ~/tools/geomesa-{{ site.stableVersion }}/lib.

Is this intentional? Y\n Y

To persist the configuration please update your bashrc file to include: 
export GEOMESA_HOME=/tools/geomesa-{{ site.stableVersion }}
export PATH=${GEOMESA_HOME}/bin:$PATH

{% endhighlight %}

Update and resource your bashrc to include the GEOMESA_HOME and PATH updates

Install GPL software:

{% highlight bash %}
$ bin/install-jai
$ bin/install-jline
$ bin/install-vecmath
{% endhighlight %}

Finally, test your installation:

{% highlight bash %}
$ bin/test-geomesa
{% endhighlight %}

Test the GeoMesa Tools:

{% highlight bash %}
$ geomesa
Usage: geomesa [command] [command options]
  Commands:
    create           Create a feature definition in a GeoMesa catalog
    deletecatalog    Delete a GeoMesa catalog completely (and all features in it)
    deleteraster     Delete a raster table
    describe         Describe the attributes of a given feature in GeoMesa
    explain          Explain how a GeoMesa query will be executed
    export           Export a GeoMesa feature
    help             Show help
    ingest           Ingest a file of various formats into GeoMesa
    ingestraster     Ingest a raster file or raster files in a directory into GeoMesa
    list             List GeoMesa features for a given catalog
    metadata         Write out the metadata for a feature or catalog
    querystats       Export queries and statistics about the last X number of queries to a CSV file.
    removeschema     Remove a schema and associated features from a GeoMesa catalog
    tableconf        Perform table configuration operations
{% endhighlight %}

For more information on the tools check out the  [GeoMesa Tools tutorial](/geomesa-tools-features/) after you're done with this tutorial

### DEPLOY GEOMESA TO ACCUMULO

The $GEOMESA_HOME/dist directory contains the distributed runtime jar that should be copied into the $ACCUMULO_HOME/lib/ext folder on each tablet server. This jar contains the GeoMesa Accumulo iterators that are necessary to query GeoMesa.

{% highlight bash %}
# something like this for each tablet server
scp $GEOMESA_HOME/dist/geomesa-distributed-runtime-{{ site.stableVersion }}.jar tserver1:$ACCUMULO_HOME/lib/ext/
{% endhighlight %}

### DEPLOY GEOMESA PLUGIN TO GEOSERVER

You should have an instance of GeoServer, version 2.5.2, running somewhere that has access to your Accumulo instance.

#### Geoserver Setup

In addition to our GeoServer plugin, you will also need to install the WPS plugin to your GeoServer instance. The [WPS Plugin](http://docs.geoserver.org/stable/en/user/extensions/wps/install.html) must also match the version of GeoServer instance.

Copy the `geomesa-plugin-{{ site.stableVersion }}-geoserver-plugin.jar` jar file from the GeoMesa dist directory into your GeoServer's library directory.

If you are using tomcat:

{% highlight bash %}
cp $GEOMESA_HOME/dist/geomesa-plugin-{{ site.stableVersion }}-geoserver-plugin.jar /path/to/tomcat/webapps/geoserver/WEB-INF/lib/
{% endhighlight %}

If you are using GeoServer's built in Jetty web server:

{% highlight bash %}
cp $GEOMESA_HOME/dist/geomesa-plugin-{{ site.stableVersion }}-geoserver-plugin.jar ~/dev/geoserver-2.5.2/webapps/geoserver/WEB-INF/lib/
{% endhighlight %}

#### ADDITIONAL DEPENDENCIES

There are additional JARs that are specific to your installation that you will also need to copy to GeoServer's `WEB-INF/lib` directory.
There is a script located at `$GEOMESA_HOME/bin/install-hadoop-accumulo.sh` which will install these dependencies to a target directory
using wget which will require an internet connection.
For example:
{% highlight bash %}
$> $GEOMESA_HOME/bin/install-hadoop-accumulo.sh /path/to/tomcat/webapps/geoserver/WEB-INF/lib/
Install accumulo and hadoop dependencies to /path/to/tomcat/webapps/geoserver/WEB-INF/lib/?
Confirm? [Y/n]y
fetching https://search.maven.org/remotecontent?filepath=org/apache/accumulo/accumulo-core/1.6.2/accumulo-core-1.6.2.jar
--2015-09-29 15:06:48--  https://search.maven.org/remotecontent?filepath=org/apache/accumulo/accumulo-core/1.6.2/accumulo-core-1.6.2.jar
Resolving search.maven.org (search.maven.org)... 207.223.241.72
Connecting to search.maven.org (search.maven.org)|207.223.241.72|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 4646545 (4.4M) [application/java-archive]
Saving to: ‘/path/to/tomcat/webapps/geoserver/WEB-INF/lib/accumulo-core-1.6.2.jar’
...
{% endhighlight %}

If you do no have an internet connection you can download the jars manually. These may include (the specific JARs are included 
only for reference, and only apply if you are using Accumulo 1.6.2 and Hadoop 2.2):

* Accumulo
    * accumulo-core-1.6.2.jar [[download]](https://search.maven.org/remotecontent?filepath=org/apache/accumulo/accumulo-core/1.6.2/accumulo-core-1.6.2.jar)  
    * accumulo-fate-1.6.2.jar [[download]](https://search.maven.org/remotecontent?filepath=org/apache/accumulo/accumulo-fate/1.6.2/accumulo-fate-1.6.2.jar) 
    * accumulo-trace-1.6.2.jar [[download]](https://search.maven.org/remotecontent?filepath=org/apache/accumulo/accumulo-trace/1.6.2/accumulo-trace-1.6.2.jar)
* Zookeeper
    * zookeeper-3.4.5.jar [[download]](https://search.maven.org/remotecontent?filepath=org/apache/zookeeper/zookeeper/3.4.5/zookeeper-3.4.5.jar)
* Hadoop core
    * hadoop-auth-2.2.0.jar [[download]](https://search.maven.org/remotecontent?filepath=org/apache/hadoop/hadoop-auth/2.2.0/hadoop-auth-2.2.0.jar)
    * hadoop-client-2.2.0.jar [[download]](https://search.maven.org/remotecontent?filepath=org/apache/hadoop/hadoop-client/2.2.0/hadoop-client-2.2.0.jar)
    * hadoop-common-2.2.0.jar [[download]](https://search.maven.org/remotecontent?filepath=org/apache/hadoop/hadoop-common/2.2.0/hadoop-common-2.2.0.jar)
    * hadoop-hdfs-2.2.0.jar [[download]](https://search.maven.org/remotecontent?filepath=org/apache/hadoop/hadoop-hdfs/2.2.0/hadoop-hdfs-2.2.0.jar)
    * hadoop-mapreduce-client-app-2.2.0.jar [[download]](https://search.maven.org/remotecontent?filepath=org/apache/hadoop/hadoop-mapreduce-client-app/2.2.0/hadoop-mapreduce-client-app-2.2.0.jar)
    * hadoop-mapreduce-client-common-2.2.0.jar [[download]](https://search.maven.org/remotecontent?filepath=org/apache/hadoop/hadoop-mapreduce-client-common/2.2.0/hadoop-mapreduce-client-common-2.2.0.jar)
    * hadoop-mapreduce-client-core-2.2.0.jar [[download]](https://search.maven.org/remotecontent?filepath=org/apache/hadoop/hadoop-mapreduce-client-core/2.2.0/hadoop-mapreduce-client-core-2.2.0.jar)
    * hadoop-mapreduce-client-jobclient-2.2.0.jar [[download]](https://search.maven.org/remotecontent?filepath=org/apache/hadoop/hadoop-mapreduce-client-jobclient/2.2.0/hadoop-mapreduce-client-jobclient-2.2.0.jar)
    * hadoop-mapreduce-client-shuffle-2.2.0.jar [[download]](https://search.maven.org/remotecontent?filepath=org/apache/hadoop/hadoop-mapreduce-client-shuffle/2.2.0/hadoop-mapreduce-client-shuffle-2.2.0.jar)
* Thrift
    * libthrift-0.9.1.jar [[download]](https://search.maven.org/remotecontent?filepath=org/apache/thrift/libthrift/0.9.1/libthrift-0.9.1.jar)
    
There are also GeoServer JARs that need to be updated for Accumulo (also in the lib directory):
    
* commons-configuration: Accumulo requires commons-configuration 1.6 and previous versions should be replaced [[download]](https://search.maven.org/remotecontent?filepath=commons-configuration/commons-configuration/1.6/commons-configuration-1.6.jar)
* commons-lang: GeoServer ships with commons-lang 2.1, but Accumulo requires replacing that with version 2.4 [[download]](https://search.maven.org/remotecontent?filepath=commons-lang/commons-lang/2.4/commons-lang-2.4.jar)

Once all of the dependencies for the GeoServer plugin are in place you will need to restart GeoServer for the changes to take effect. 

#### Verify Deployment

To verify that the deployment worked you can follow the [GeoMesa Quick Start tutorial](/geomesa-quickstart/) to ingest test data and view the data in GeoServer.  

### KAFKA DEPLOYMENT

To set up GeoMesa with Kafka, first build the geomesa-kafka submodule (see the [Kafka Quickstart tutorial](/geomesa-kafka-quickstart/) to see what GeoMesa can do with Kafka).

{% highlight bash %}
git clone --branch geomesa-{{ site.stableVersion }} https://github.com/locationtech/geomesa/ && mvn clean install -f geomesa/geomesa-kafka/pom.xml -DskipTests
{% endhighlight %}

Copy the GeoMesa Kafka plugin jar files from the GeoMesa directory you built into your GeoServer's library directory.

Tomcat:
{% highlight bash %}
cp geomesa/geomesa-kafka/geomesa-kafka-geoserver-plugin/target/geomesa-kafka-geoserver-plugin-{{ site.developmentVersion }}-geoserver-plugin.jar /path/to/tomcat/webapps/geoserver/WEB-INF/lib/
{% endhighlight %}

Jetty:

{% highlight bash %}
cp geomesa/geomesa-kafka/geomesa-kafka-geoserver-plugin/target/geomesa-kafka* ~/dev/geoserver-2.5.2/webapps/geoserver/WEB-INF/lib/
{% endhighlight %}

Then copy these dependencies to your `WEB-INF/lib` directory.

* Kafka
    * kafka-clients-0.8.2.1.jar
    * kafka_2.10-0.8.2.1.jar
    * metrics-core-2.2.0.jar
    * zkclient-0.3.jar
* Zookeeper
    * zookeeper-3.4.5.jar

Note: when using the Kafka Data Store with GeoServer in Tomcat it will most likely be necessary to increase the memory settings for Tomcat, `export CATALINA_OPTS="-Xms512M -Xmx1024M -XX:PermSize=256m -XX:MaxPermSize=256m"`.

After placing the dependencies in the correct folder, be sure to restart GeoServer for changes to take place.

### Configuring Geoserver
Depending on your hardware, it may be important to set the limits for your WMS plugin to be higher or disable them completely by clicking "WMS" under "Services" on the left side of the admin page of Geoserver. Check with your server administrator to determine the correct settings. For massive queries, the standard 60 second timeout may be too short.
!["Disable limits"](/img/tutorials/2014-05-16-geomesa-tubeselect/wms_limits.png)
