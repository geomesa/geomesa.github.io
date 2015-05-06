---
title: GeoMesa Deployment
author: chris-and-aannex
layout: tutorial
redirect_from:
    - /2015/05/05/geomesa-deployment/
---

{% include tutorial-header.html %}

### This tutorial will introduce how to:

1. Check out and build GeoMesa source.
2. Deploy the Distributed Runtime Jar to your Accumulo Cluster.
3. Deploy the GeoServer Plugin.
<!--more-->

<div class="callout callout-warning">
    <span class="glyphicon glyphicon-exclamation-sign"></span>
    You will need access to a Hadoop 2.2 installation as well as an Accumulo 1.5.x database.
</div>

#### Other prerequisites

Before you begin, you should also have these:

* basic knowledge of GeoTools, GeoServer, and Accumulo
* an Accumulo user that has both create-table and write permissions
* a local copy of the Java Development Kit 1.7.x
* Apache Maven installed
* a GitHub client installed

### DOWNLOAD AND BUILD GEOMESA

Pick a reasonable directory on your machine, and run:

{% highlight bash %}
git clone --branch geomesa-accumulo1.5-{{ site.stableVersion }} https://github.com/locationtech/geomesa/ && cd geomesa && mvn clean install -DskipTests
{% endhighlight %}

Note: This step is required because the GeoMesa artifacts have not yet been published to a public Maven repository. With the upcoming 1.0 release of GeoMesa, these artifacts will be available at LocationTech's Nexus server, and this download-and-build step will become obsolete.

### DEPLOY GEOMESA TO ACCUMULO

After `mvn clean install` finishes, you should have a JAR in geomesa-distributed-runtime/target/ named `geomesa-distributed-runtime-accumulo1.5-{{ site.stableVersion }}.jar`.  

This JAR contains the GeoMesa Accumulo Iterators which are necessary to query GeoMesa.  This JAR needs to be copied into $ACCUMULO_HOME/lib/ext on each tablet server. 

### DEPLOY GEOMESA PLUGIN TO GEOSERVER

You should have an instance of GeoServer, version 2.5.2, running somewhere that has access to your Accumulo instance.

#### Geoserver Setup

In addition to our GeoServer plugin, you will also need to install the WPS plugin to your GeoServer instance. The [WPS Plugin](http://docs.geoserver.org/stable/en/user/extensions/wps/install.html) must also match the version of GeoServer instance.

Copy the the `geomesa-plugin-accumulo1.5-{{ site.stableVersion }}-geoserver-plugin.jar` jar file from the GeoMesa directory you built into your GeoServer's library directory.

If you are using tomcat:

{% highlight bash %}
cp geomesa/geomesa-plugin/target/geomesa-plugin-accumulo1.5-{{ site.stableVersion }}-geoserver-plugin.jar /path/to/tomcat/webapps/geoserver/WEB-INF/lib/
{% endhighlight %}

If you are using GeoServer's built in Jetty web server:

{% highlight bash %}
cp geomesa/geomesa-plugin/target/geomesa-plugin-accumulo1.5-{{ site.stableVersion }}-geoserver-plugin.jar ~/dev/geoserver-2.5.2/webapps/geoserver/WEB-INF/lib/
{% endhighlight %}

#### ADDITIONAL DEPENDENCIES
<!---
You'll also need to install additional dependencies, marked as "provided" in the GeoMesa pom.xml file, that are needed by GeoMesa to function. This allows your server administrators to manage dependencies and upgrade for bugfixes. We have tried to include all the necessary JARs in the [GeoMesa Quick Start tutorial](/geomesa-quickstart/). 
-->

There are additional JARs that are specific to your installation that you will also need to copy to GeoServer's `WEB-INF/lib` directory.  These may include (the specific JARs
are included only for reference, and only apply if you are using Accumulo 1.5.1 and Hadoop 2.2):

* Accumulo
    * accumulo-core-1.5.1.jar  
    * accumulo-fate-1.5.1.jar  
    * accumulo-trace-1.5.1.jar
* Zookeeper
    * zookeeper-3.4.5.jar
* Hadoop core
    * hadoop-auth-2.2.0.jar
    * hadoop-client-2.2.0.jar
    * hadoop-common-2.2.0.jar
    * hadoop-hdfs-2.2.0.jar
    * hadoop-mapreduce-client-app-2.2.0.jar
    * hadoop-mapreduce-client-common-2.2.0.jar
    * hadoop-mapreduce-client-core-2.2.0.jar
    * hadoop-mapreduce-client-jobclient-2.2.0.jar
    * hadoop-mapreduce-client-shuffle-2.2.0.jar
* Thrift
    * libthrift-0.9.1.jar
    
There are also GeoServer JARs that need to be updated for Accumulo (also in the lib directory):
    
* commons-configuration: Accumulo requires commons-configuration 1.6 and previous versions should be replaced
* commons-lang: GeoServer ships with commons-lang 2.1, but Accumulo requires replacing that with version 2.4

Once all of the dependencies for the GeoServer plugin are in place you will need to restart GeoServer for the changes to take effect.

#### Verify Deployment

To verify that the deployment worked you can follow the [Quickstart tutorial](/geomesa-quickstart/) to ingest test data and view the data in GeoServer.  

### Configuring Geoserver
Depending on your hardware, it may be important to set the limits for your WMS plugin to be higher or disable them completely by clicking "WMS" under "Services" on the left side of the admin page of Geoserver. Check with your server administrator to determine the correct settings. For massive queries, the standard 60 second timeout may be too short.
!["Disable limits"](/img/tutorials/2014-05-16-geomesa-tubeselect/wms_limits.png)
