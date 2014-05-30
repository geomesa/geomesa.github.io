---
title: GeoMesa Queries
author: emilio
layout: tutorial
---

{% include tutorial-header.html %}

### This tutorial will show you how to:

1. Check out and build GeoMesa source
2. Write custom Java code using GeoMesa to do the following:
    1.  query previously-ingested data
    2.  apply projections to your queries
    3.  apply transformations to your queries

<div class="callout callout-warning">
    <span class="glyphicon glyphicon-exclamation-sign"></span>
    You will need access to a Hadoop 2.2 installation as well as an Accumulo 1.5.x database.
</div>

<div class="callout callout-warning">
    <span class="glyphicon glyphicon-exclamation-sign"></span>
    You will need to have ingested the GDELT data set using GeoMesa. Instructions are available <a href="/2014/04/17/geomesa-gdelt-analysis/">here</a>.
</div>

#### Other prerequisites

Before you begin, you should also have these:

* an Accumulo user that has appropriate permissions to query your data
* a local copy of the Java Development Kit 1.7.x
* Apache Maven installed
* a GitHub client installed

### DOWNLOAD AND BUILD GEOMESA

Pick a reasonable directory on your machine, and run:

```
git clone git@github.com:locationtech/geomesa.git
```

From that newly-created directory, run

```
mvn clean install
```

NB: This step is only required, because the GeoMesa artifacts have not yet been published to a public Maven repository. With the upcoming 1.0 release of GeoMesa, these artifacts will be available at LocationTech's Nexus server, and this download-and-build step will become obsolete.

### DOWNLOAD AND BUILD THE TUTORIAL CODE

Pick a reasonable directory on your machine, and run:

```
git clone git@github.com:geomesa/geomesa-tutorial-projections.git
```

The ```pom.xml``` file contains an explicit list of dependent libraries that will be bundled together into the final tutorial. You should confirm that the versions of Accumulo and Hadoop match what you are running; if it does not match, change the value in the POM. (NB: The only reason these libraries are bundled into the final JAR is that this is easier for most people to do this than it is to set the classpath when running the tutorial. If you would rather not bundle these dependencies, mark them as provided in the POM, and update your classpath as appropriate.)

From within the root of the cloned tutorial, run:

```
mvn clean install
```

When this is complete, it will have built a JAR file that contains all of the code you need to run the tutorial.

### RUN THE TUTORIAL

On the command-line, run:

```
java -cp ./target/geomesa-tutorial-queries-1.0-SNAPSHOT.jar org.geomesa.tutorial.QueryTutorial -instanceId <instance> -zookeepers <zoos> -user <user> -password <pwd> -tableName <table> -featureName <feature>
```

where you provide the following arguments:

* ```<instance>``` - the name of your Accumulo instance
* ```<zoos>``` - comma-separated list of your Zookeeper nodes, e.g. zoo1:2181,zoo2:2181,zoo3:2181
* ```<user>``` - the name of an Accumulo user that will execute the scans, e.g. root
* ```<pwd>``` - the password for the previously-mentioned Accumulo user
* ```<table>``` - the name of the Accumulo table that has the GeoMesa GDELT dataset, e.g. gdelt
* ```<feature>``` - the feature name used to ingest the GeoMesa GDELT dataset, e.g. gdelt

You should see several queries run and the results printed out to your console.

### INSIGHT INTO HOW THE TUTORIAL WORKS

The code for querying and projections is available in the following class:

* ```org.geomesa.tutorial.QueryTutorial```

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

* ```org.geomesa.tutorial.GdeltFeature``` - Contains the properties (attributes) available in the GDELT data set.
* ```org.geomesa.tutorial.SetupUtil``` - Handles reading command-line arguments

### SAMPLE CODE

The following code snippets show the basic aspects of querying GeoMesa.

#### Create a basic query with no projections

    Query query = new Query(simpleFeatureTypeName, cqlFilter);

#### Create a query with a projection for attributes 'a' and 'b'

    String[] properties = new String[] {"a", "b"};
    Query query = new Query(simpleFeatureTypeName, cqlFilter, properties);

#### Create a query with a transformation for attribute 'a'

    String[] properties = new String[] {"a=strConcat('hello ', a)"};
    Query query = new Query(simpleFeatureTypeName, cqlFilter, properties);

#### Create a query with a derived attribute 'c'

    String[] properties = new String[] {"c=strConcat('hello ', a)"};
    Query query = new Query(simpleFeatureTypeName, cqlFilter, properties);
