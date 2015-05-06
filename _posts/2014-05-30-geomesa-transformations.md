---
title: GeoMesa Transformations
author: emilio
layout: tutorial
redirect_from:
    - /2014/05/30/geomesa-transformations/
---

{% include tutorial-header.html %}

### Background

GeoMesa allows users to perform [relational projections](http://en.wikipedia.org/wiki/Projection_%28relational_algebra%29) on query results.  We call these 'transformations' to distinguish them from the overloaded term 'projection' which has a different meaning in a spatial context.  These transformations have the following uses and advantages

1. Subset to specified columns - reduces network overhead of returning results
2. Rename specified columns - alters the schema of data on the fly
3. Compute new attributes from one or more original attributes - adds derived fields to results

The transformations are applied in parallel across the cluster thus making them very fast.  They are analogous to the map tasks in a map-reduce job.  Transformations are also extensible; developers can implement new functions and plug them into the system using standard mechanisms from Geotools.  
<!--more-->
### This tutorial will show you how to:

Write custom Java code using GeoMesa to do the following:

1.  query previously-ingested data
2.  apply relational projections to your query results
3.  apply transformations to your query results

**Note:** when this tutorial refers to ```projections```, it means in the relational sense - see [Projection - Relational Algebra](http://en.wikipedia.org/wiki/Projection_(relational_algebra)). Projection also has [many other meanings](http://en.wikipedia.org/wiki/Projection_(disambiguation)) in spatial discussions - they are not used in this tutorial.

Although projections can also modify an attribute's value, in this tutorial we will refer to such modifications as ```transformations``` to keep things clearer.

<div class="callout callout-warning">
    <span class="glyphicon glyphicon-exclamation-sign"></span>
    You will need access to a Hadoop 2.2 installation as well as an Accumulo 1.5.x database.
</div>

<div class="callout callout-warning">
    <span class="glyphicon glyphicon-exclamation-sign"></span>
    You will need to have ingested the GDELT data set using GeoMesa. Instructions are available <a href="/geomesa-gdelt-analysis/">here</a>.
</div>

#### Other prerequisites

Before you begin, you should also have these:

* a locally-built version of GeoMesa - see [GeoMesa Deployment](/geomesa-deployment/) - (DOWNLOAD AND BUILD GEOMESA)
* an Accumulo user that has appropriate permissions to query your data
* a local copy of the Java Development Kit 1.7.x
* Apache Maven installed
* a GitHub client installed

### Download and Build the Tutorial Code

Pick a reasonable directory on your machine, and run:

```
git clone https://github.com/geomesa/geomesa-tutorial-transformations.git
```

The ```pom.xml``` file contains an explicit list of dependent libraries that will be bundled together into the final tutorial. You should confirm that the versions of Accumulo and Hadoop match what you are running; if it does not match, change the value in the POM. (NB: The only reason these libraries are bundled into the final JAR is that this is easier for most people to do this than it is to set the classpath when running the tutorial. If you would rather not bundle these dependencies, mark them as provided in the POM, and update your classpath as appropriate.)

From within the root of the cloned tutorial, run:

```
mvn clean install
```

When this is complete, it will have built a JAR file that contains all of the code you need to run the tutorial.

### Run the Tutorial

On the command-line, run:

{% highlight bash %}
java -cp ./target/geomesa-tutorial-transformations-accumulo1.5-1.0-SNAPSHOT.jar \
   geomesa.tutorial.QueryTutorial \
   -instanceId <instance> \
   -zookeepers <zoos> \
   -user <user> \
   -password <pwd> \
   -tableName <table> \
   -featureName <feature>
{% endhighlight %}

where you provide the following arguments:

* ```<instance>``` - the name of your Accumulo instance
* ```<zoos>``` - comma-separated list of your Zookeeper nodes, e.g. zoo1:2181,zoo2:2181,zoo3:2181
* ```<user>``` - the name of an Accumulo user that will execute the scans, e.g. root
* ```<pwd>``` - the password for the previously-mentioned Accumulo user
* ```<table>``` - the name of the Accumulo table that has the GeoMesa GDELT dataset, e.g. gdelt
* ```<feature>``` - the feature name used to ingest the GeoMesa GDELT dataset, e.g. gdelt

You should see several queries run and the results printed out to your console.

### Insight Into How the Tutorial Works

The code for querying and projections is available in the following class:

* ```geomesa.tutorial.QueryTutorial```

The source code is meant to be accessible, but here is a high-level breakdown of the relevant methods:

* basicQuery - executes a base filter without any further options. All attributes are returned in the data set.
* basicProjectionQuery - executes a base filter but specifies a subset of attributes to return.
* basicTransformationQuery - executes a base filter and transforms one of the attributes that is returned.
* renamedTransformationQuery - executes a base filter and transforms one of the attributes, returning it in a separate derived attribute.
* mutliFieldTransformationQuery - executes a base filter and transforms two attributes into a single derived attributes.
* geometricTransformationQuery - executes a base filter and transforms the geometry returned from a point into a polygon by buffering it. 

Additional transformation functions are listed [here](http://docs.geotools.org/latest/userguide/library/main/filter.html) (scroll to 'Function List').
*Please note that currently not all functions are supported by GeoMesa.*

Additionally, there are two helper classes included in the tutorial:

* ```geomesa.tutorial.GdeltFeature``` - Contains the properties (attributes) available in the GDELT data set.
* ```geomesa.tutorial.SetupUtil``` - Handles reading command-line arguments

### Sample Code and Output

The following code snippets show the basic aspects of creating queries for GeoMesa.

<style>
  div.output-scroll {
    margin-left: 30px;
    overflow: auto;
    width: 90%;
  }
  table.output {
    border: 2px inset white;
  }
  table.output td {
    font-size: 12px;
  }
  table.output th, table.output td {
    padding: 5px 10px;
    white-space: nowrap;
  }
  table.output tr.odd th, table.output tr.odd td {
    background-color: gray;
    color: black;
  }
</style>

#### Create a basic query with no projections

This query does not use any projections or transformations. Note that all attributes are returned in the results.

{% highlight java %}
Query query = new Query(simpleFeatureTypeName, cqlFilter);
{% endhighlight %}

**Output**

<div class="output-scroll">
<table class='output'>
<tr><th>Result</th><th>GLOBALEVENTID</th><th>SQLDATE</th><th>MonthYear</th><th>Year</th><th>FractionDate</th><th>Actor1Code</th><th>Actor1Name</th><th>Actor1CountryCode</th><th>Actor1KnownGroupCode</th><th>Actor1EthnicCode</th><th>Actor1Religion1Code</th><th>Actor1Religion2Code</th><th>Actor1Type1Code</th><th>Actor1Type2Code</th><th>Actor1Type3Code</th><th>Actor2Code</th><th>Actor2Name</th><th>Actor2CountryCode</th><th>Actor2KnownGroupCode</th><th>Actor2EthnicCode</th><th>Actor2Religion1Code</th><th>Actor2Religion2Code</th><th>Actor2Type1Code</th><th>Actor2Type2Code</th><th>Actor2Type3Code</th><th>IsRootEvent</th><th>EventCode</th><th>EventBaseCode</th><th>EventRootCode</th><th>QuadClass</th><th>GoldsteinScale</th><th>NumMentions</th><th>NumSources</th><th>NumArticles</th><th>AvgTone</th><th>Actor1Geo_Type</th><th>Actor1Geo_FullName</th><th>Actor1Geo_CountryCode</th><th>Actor1Geo_ADM1Code</th><th>Actor1Geo_Lat</th><th>Actor1Geo_Long</th><th>Actor1Geo_FeatureID</th><th>Actor2Geo_Type</th><th>Actor2Geo_FullName</th><th>Actor2Geo_CountryCode</th><th>Actor2Geo_ADM1Code</th><th>Actor2Geo_Lat</th><th>Actor2Geo_Long</th><th>Actor2Geo_FeatureID</th><th>ActionGeo_Type</th><th>ActionGeo_FullName</th><th>ActionGeo_CountryCode</th><th>ActionGeo_ADM1Code</th><th>ActionGeo_Lat</th><th>ActionGeo_Long</th><th>ActionGeo_FeatureID</th><th>DATEADDED</th><th>geom</th></tr>
<tr class='odd'><td>1</td><td>284464526</td><td>Sun Feb 02 00:00:00 EST 2014</td><td>201402</td><td>2014</td><td>2014.0876</td><td>USA</td><td>UNITED STATES</td><td>USA</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>USAGOV</td><td>UNITED STATES</td><td>USA</td><td></td><td></td><td></td><td></td><td>GOV</td><td></td><td></td><td>0</td><td>010</td><td>010</td><td>01</td><td>1</td><td>0.0</td><td>2</td><td>1</td><td>2</td><td>2.6362038</td><td>4</td><td>Kyiv, Kyyiv, Misto, Ukraine</td><td>UP</td><td>UP12</td><td>50.4333</td><td>30.5167</td><td>-1044367</td><td>1</td><td>United States</td><td>US</td><td>US</td><td>38.0</td><td>-97.0</td><td>null</td><td>1</td><td>United States</td><td>US</td><td>US</td><td>38.0</td><td>-97.0</td><td>null</td><td>20140202</td><td>POINT (30.5167 50.4333)</td></tr>
<tr><td>2</td><td>284466704</td><td>Sun Feb 02 00:00:00 EST 2014</td><td>201402</td><td>2014</td><td>2014.0876</td><td>USAGOV</td><td>UNITED STATES</td><td>USA</td><td></td><td></td><td></td><td></td><td>GOV</td><td></td><td></td><td>USA</td><td>UNITED STATES</td><td>USA</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>1</td><td>036</td><td>036</td><td>03</td><td>1</td><td>4.0</td><td>4</td><td>1</td><td>4</td><td>1.5810276</td><td>1</td><td>Ukraine</td><td>UP</td><td>UP</td><td>49.0</td><td>32.0</td><td>null</td><td>1</td><td>Ukraine</td><td>UP</td><td>UP</td><td>49.0</td><td>32.0</td><td>null</td><td>1</td><td>Ukraine</td><td>UP</td><td>UP</td><td>49.0</td><td>32.0</td><td>null</td><td>20140202</td><td>POINT (32 49)</td></tr>
<tr class='odd'><td>3</td><td>284427971</td><td>Sun Feb 02 00:00:00 EST 2014</td><td>201402</td><td>2014</td><td>2014.0876</td><td>IGOUNO</td><td>UNITED NATIONS</td><td></td><td>UNO</td><td></td><td></td><td></td><td>IGO</td><td></td><td></td><td>USA</td><td>UNITED STATES</td><td>USA</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>0</td><td>012</td><td>012</td><td>01</td><td>1</td><td>-0.4</td><td>27</td><td>3</td><td>27</td><td>1.0064903</td><td>4</td><td>Kiev, Ukraine (general), Ukraine</td><td>UP</td><td>UP00</td><td>50.4333</td><td>30.5167</td><td>-1044367</td><td>4</td><td>Kiev, Ukraine (general), Ukraine</td><td>UP</td><td>UP00</td><td>50.4333</td><td>30.5167</td><td>-1044367</td><td>4</td><td>Kiev, Ukraine (general), Ukraine</td><td>UP</td><td>UP00</td><td>50.4333</td><td>30.5167</td><td>-1044367</td><td>20140202</td><td>POINT (30.5167 50.4333)</td></tr>
<tr><td>4</td><td>284466607</td><td>Sun Feb 02 00:00:00 EST 2014</td><td>201402</td><td>2014</td><td>2014.0876</td><td>USAGOV</td><td>UNITED STATES</td><td>USA</td><td></td><td></td><td></td><td></td><td>GOV</td><td></td><td></td><td>UKR</td><td>UKRAINE</td><td>UKR</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>1</td><td>100</td><td>100</td><td>10</td><td>3</td><td>-5.0</td><td>2</td><td>1</td><td>2</td><td>7.826087</td><td>1</td><td>Ukraine</td><td>UP</td><td>UP</td><td>49.0</td><td>32.0</td><td>null</td><td>1</td><td>Ukraine</td><td>UP</td><td>UP</td><td>49.0</td><td>32.0</td><td>null</td><td>1</td><td>Ukraine</td><td>UP</td><td>UP</td><td>49.0</td><td>32.0</td><td>null</td><td>20140202</td><td>POINT (32 49)</td></tr>
<tr class='odd'><td>5</td><td>284464187</td><td>Sun Feb 02 00:00:00 EST 2014</td><td>201402</td><td>2014</td><td>2014.0876</td><td>USA</td><td>UNITED STATES</td><td>USA</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>UKR</td><td>UKRAINE</td><td>UKR</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>0</td><td>111</td><td>111</td><td>11</td><td>3</td><td>-2.0</td><td>5</td><td>1</td><td>5</td><td>1.4492754</td><td>4</td><td>Kiev, Ukraine (general), Ukraine</td><td>UP</td><td>UP00</td><td>50.4333</td><td>30.5167</td><td>-1044367</td><td>4</td><td>Kiev, Ukraine (general), Ukraine</td><td>UP</td><td>UP00</td><td>50.4333</td><td>30.5167</td><td>-1044367</td><td>4</td><td>Kiev, Ukraine (general), Ukraine</td><td>UP</td><td>UP00</td><td>50.4333</td><td>30.5167</td><td>-1044367</td><td>20140202</td><td>POINT (30.5167 50.4333)</td></tr>
</table>
</div>

#### Create a query with a projection for two attributes

This query uses a projection to only return the 'Actor1Name' and 'geom' attributes.

{% highlight java %}
String[] properties = new String[] {"Actor1Name", "geom"};
Query query = new Query(simpleFeatureTypeName, cqlFilter, properties);
{% endhighlight %}

**Output**

<div class="output-scroll">
<table class='output'>
<tr><th>Result</th><th>Actor1Name</th><th>geom</th></tr>
<tr class='odd'><td>1</td><td>UNITED STATES</td><td>POINT (32 49)</td></tr>
<tr><td>2</td><td>UNITED STATES</td><td>POINT (30.5167 50.4333)</td></tr>
<tr class='odd'><td>3</td><td>UNITED STATES</td><td>POINT (30.5167 50.4333)</td></tr>
<tr><td>4</td><td>UNITED STATES</td><td>POINT (30.5167 50.4333)</td></tr>
<tr class='odd'><td>5</td><td>UNITED STATES</td><td>POINT (30.5167 50.4333)</td></tr>
</table>
</div>

#### Create a query with an attribute transformation

This query performs a transformation on the 'Actor1Name' attribute, to print it in a more user-friendly format.

{% highlight java %}
String[] properties = new String[] {"Actor1Name=strCapitalize(Actor1Name)", "geom"};
Query query = new Query(simpleFeatureTypeName, cqlFilter, properties);
{% endhighlight %}

**Output**

<div class="output-scroll">
<table class='output'>
<tr><th>Result</th><th>geom</th><th>Actor1Name</th></tr>
<tr class='odd'><td>1</td><td>POINT (30.5167 50.4333)</td><td>United States</td></tr>
<tr><td>2</td><td>POINT (32 49)</td><td>United States</td></tr>
<tr class='odd'><td>3</td><td>POINT (32 49)</td><td>United States</td></tr>
<tr><td>4</td><td>POINT (30.5167 50.4333)</td><td>United States</td></tr>
<tr class='odd'><td>5</td><td>POINT (30.5167 50.4333)</td><td>United States</td></tr>
</table>
</div>

#### Create a query with a derived attribute

This query creates a new attribute called 'derived' based off a join of the 'Actor1Name' and 'Actor1Geo_FullName' attribute. This could be used to show the actor and location of the event, for example.

{% highlight java %}
String[] properties = new String[] {"derived=strConcat(Actor1Name,strConcat(' - ',Actor1Geo_FullName)),geom"};
Query query = new Query(simpleFeatureTypeName, cqlFilter, properties);
{% endhighlight %}

**Output**

<div class="output-scroll">
<table class='output'>
<tr><th>Result</th><th>geom</th><th>derived</th></tr>
<tr class='odd'><td>1</td><td>POINT (30.5167 50.4333)</td><td>UNITED STATES - Kyiv, Kyyiv, Misto, Ukraine</td></tr>
<tr><td>2</td><td>POINT (32 49)</td><td>UNITED STATES - Ukraine</td></tr>
<tr class='odd'><td>3</td><td>POINT (30.5167 50.4333)</td><td>UNITED STATES - Kiev, Ukraine (general), Ukraine</td></tr>
<tr><td>4</td><td>POINT (32 49)</td><td>UNITED STATES - Ukraine</td></tr>
<tr class='odd'><td>5</td><td>POINT (30.5167 50.4333)</td><td>UNITED NATIONS - Kiev, Ukraine (general), Ukraine</td></tr>
</table>
</div>

#### Create a query with a geometric transformation

This query performs a geometric transformation on the points returned, buffering them by a fixed amount. This could be used to estimate an area of impact around a particular event, for example.

{% highlight java %}
String[] properties = new String[] {"geom,derived=buffer(geom, 2)"};
Query query = new Query(simpleFeatureTypeName, cqlFilter, properties);
{% endhighlight %}

**Output**

<div class="output-scroll">
<table class='output'>
<tr><th>Result</th><th>geom</th><th>derived</th></tr>
<tr class='odd'><td>1</td><td>POINT (30.5167 50.4333)</td><td>POLYGON ((32.5167 50.4333, 32.478270560806465 50.04311935596775, 32.36445906502257 49.66793313526982, 32.17963922460509 49.3221595339608, 31.930913562373096 49.01908643762691, 31.627840466039206 48.77036077539491, 31.28206686473018 48.58554093497743, 30.906880644032256 48.47172943919354, 30.5167 48.4333, 30.126519355967744 48.47172943919354, 29.75133313526982 48.58554093497743, 29.405559533960798 48.77036077539491, 29.102486437626904 49.01908643762691, 28.85376077539491 49.3221595339608, 28.668940934977428 49.66793313526983, 28.55512943919354 50.04311935596775, 28.5167 50.4333, 28.55512943919354 50.82348064403226, 28.668940934977428 51.198666864730185, 28.85376077539491 51.54444046603921, 29.102486437626908 51.8475135623731, 29.405559533960798 52.09623922460509, 29.751333135269824 52.281059065022575, 30.126519355967748 52.39487056080647, 30.516700000000004 52.4333, 30.906880644032263 52.39487056080646, 31.282066864730186 52.281059065022575, 31.62784046603921 52.09623922460509, 31.9309135623731 51.847513562373095, 32.1796392246051 51.5444404660392, 32.36445906502258 51.19866686473018, 32.478270560806465 50.82348064403225, 32.5167 50.4333))</td></tr>
<tr><td>2</td><td>POINT (30.5167 50.4333)</td><td>POLYGON ((32.5167 50.4333, 32.478270560806465 50.04311935596775, 32.36445906502257 49.66793313526982, 32.17963922460509 49.3221595339608, 31.930913562373096 49.01908643762691, 31.627840466039206 48.77036077539491, 31.28206686473018 48.58554093497743, 30.906880644032256 48.47172943919354, 30.5167 48.4333, 30.126519355967744 48.47172943919354, 29.75133313526982 48.58554093497743, 29.405559533960798 48.77036077539491, 29.102486437626904 49.01908643762691, 28.85376077539491 49.3221595339608, 28.668940934977428 49.66793313526983, 28.55512943919354 50.04311935596775, 28.5167 50.4333, 28.55512943919354 50.82348064403226, 28.668940934977428 51.198666864730185, 28.85376077539491 51.54444046603921, 29.102486437626908 51.8475135623731, 29.405559533960798 52.09623922460509, 29.751333135269824 52.281059065022575, 30.126519355967748 52.39487056080647, 30.516700000000004 52.4333, 30.906880644032263 52.39487056080646, 31.282066864730186 52.281059065022575, 31.62784046603921 52.09623922460509, 31.9309135623731 51.847513562373095, 32.1796392246051 51.5444404660392, 32.36445906502258 51.19866686473018, 32.478270560806465 50.82348064403225, 32.5167 50.4333))</td></tr>
<tr class='odd'><td>3</td><td>POINT (32 49)</td><td>POLYGON ((34 49, 33.961570560806464 48.609819355967744, 33.84775906502257 48.23463313526982, 33.66293922460509 47.8888595339608, 33.41421356237309 47.58578643762691, 33.1111404660392 47.33706077539491, 32.76536686473018 47.15224093497743, 32.390180644032256 47.038429439193536, 32 47, 31.609819355967744 47.038429439193536, 31.23463313526982 47.15224093497743, 30.888859533960797 47.33706077539491, 30.585786437626904 47.58578643762691, 30.33706077539491 47.8888595339608, 30.152240934977428 48.234633135269824, 30.03842943919354 48.609819355967744, 30 49, 30.03842943919354 49.390180644032256, 30.152240934977428 49.76536686473018, 30.33706077539491 50.11114046603921, 30.585786437626908 50.4142135623731, 30.888859533960797 50.66293922460509, 31.234633135269824 50.84775906502257, 31.609819355967748 50.961570560806464, 32.00000000000001 51, 32.39018064403226 50.96157056080646, 32.76536686473018 50.84775906502257, 33.11114046603921 50.66293922460509, 33.4142135623731 50.41421356237309, 33.6629392246051 50.111140466039195, 33.84775906502258 49.765366864730176, 33.961570560806464 49.39018064403225, 34 49))</td></tr>
<tr><td>4</td><td>POINT (30.5167 50.4333)</td><td>POLYGON ((32.5167 50.4333, 32.478270560806465 50.04311935596775, 32.36445906502257 49.66793313526982, 32.17963922460509 49.3221595339608, 31.930913562373096 49.01908643762691, 31.627840466039206 48.77036077539491, 31.28206686473018 48.58554093497743, 30.906880644032256 48.47172943919354, 30.5167 48.4333, 30.126519355967744 48.47172943919354, 29.75133313526982 48.58554093497743, 29.405559533960798 48.77036077539491, 29.102486437626904 49.01908643762691, 28.85376077539491 49.3221595339608, 28.668940934977428 49.66793313526983, 28.55512943919354 50.04311935596775, 28.5167 50.4333, 28.55512943919354 50.82348064403226, 28.668940934977428 51.198666864730185, 28.85376077539491 51.54444046603921, 29.102486437626908 51.8475135623731, 29.405559533960798 52.09623922460509, 29.751333135269824 52.281059065022575, 30.126519355967748 52.39487056080647, 30.516700000000004 52.4333, 30.906880644032263 52.39487056080646, 31.282066864730186 52.281059065022575, 31.62784046603921 52.09623922460509, 31.9309135623731 51.847513562373095, 32.1796392246051 51.5444404660392, 32.36445906502258 51.19866686473018, 32.478270560806465 50.82348064403225, 32.5167 50.4333))</td></tr>
<tr class='odd'><td>5</td><td>POINT (30.5167 50.4333)</td><td>POLYGON ((32.5167 50.4333, 32.478270560806465 50.04311935596775, 32.36445906502257 49.66793313526982, 32.17963922460509 49.3221595339608, 31.930913562373096 49.01908643762691, 31.627840466039206 48.77036077539491, 31.28206686473018 48.58554093497743, 30.906880644032256 48.47172943919354, 30.5167 48.4333, 30.126519355967744 48.47172943919354, 29.75133313526982 48.58554093497743, 29.405559533960798 48.77036077539491, 29.102486437626904 49.01908643762691, 28.85376077539491 49.3221595339608, 28.668940934977428 49.66793313526983, 28.55512943919354 50.04311935596775, 28.5167 50.4333, 28.55512943919354 50.82348064403226, 28.668940934977428 51.198666864730185, 28.85376077539491 51.54444046603921, 29.102486437626908 51.8475135623731, 29.405559533960798 52.09623922460509, 29.751333135269824 52.281059065022575, 30.126519355967748 52.39487056080647, 30.516700000000004 52.4333, 30.906880644032263 52.39487056080646, 31.282066864730186 52.281059065022575, 31.62784046603921 52.09623922460509, 31.9309135623731 51.847513562373095, 32.1796392246051 51.5444404660392, 32.36445906502258 51.19866686473018, 32.478270560806465 50.82348064403225, 32.5167 50.4333))</td></tr>
</table>
</div>
