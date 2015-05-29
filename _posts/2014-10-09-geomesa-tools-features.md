---
title: Management with GeoMesa Tools
author: jake
layout: tutorial
redirect_from:
    - /2014/10/09/geomesa-tools-features/
---

{% include tutorial-header.html %}

<!-- add some style to fix the xml formatting color -->
<style>
code.xml { color:#93a1a1 }
</style>

## Introduction

GeoMesa Tools is a set of command line tools to add feature management functions, query planning and 
explanation, ingest, and export abilities from the command line. In this tutorial, we'll cover initial
setup of GeoMesa Tools and the feature management commands included with the module.
<!--more-->

## Configuration

To begin using the command line tools, first follow the [GeoMesa Deployment Tutorial](/geomesa-deployment/) to download and build the full GeoMesa project. 

This will build the project and GeoMesa TAR-ball.  
The TAR-ball can be found under `geomesa/geomesa-assemble/target`. Untar this file with:

{% highlight bash %}
tar xvfz geomesa-assemble/target/geomesa-{{ site.stableVersion }}-bin.tar.gz
{% endhighlight %}
 
Next, cd into the newly created directory with:

{% highlight bash %}
cd geomesa-{{ site.stableVersion }}
{% endhighlight %}

GeoMesa Tools relies on a GEOMESA_HOME environment variable. Running:

{% highlight bash %}
source bin/geomesa configure
{% endhighlight %}

will set this for you, add $GEOMESA_HOME/bin to your PATH, and source your new 
environment variables in your current shell session. Additionally, make sure that $ACCUMULO_HOME and 
$HADOOP_CONF_DIR environment variables are set.

The next steps are to install the Java Advanced Imaging (JAI) and JLine libraries to the `$GEOMESA_HOME/lib` folder.
These libraries are necessary for full functionality in the GeoMesa command line tools. In particular, the raster support needs the vecmath and jai jars.
Scripts are provided that attempt to `wget` the JAI and JLine
jars and install them:

{% highlight bash %}
bin/install-jai
bin/install-jline
bin/install-vecmath
{% endhighlight %}

Now, you should be able to use GeoMesa from any directory on your computer. To test, `cd` to a 
different directory and run:

{% highlight bash %}
geomesa
{% endhighlight %}

GeoMesa Tools comes with a bundled SLF4j implementation. However, if you receive an SLF4J error like this:

{% highlight bash %}
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.
{% endhighlight %}
    
download the SLF4J TAR-ball [found here](http://www.slf4j.org/download.html). Extract 
slf4j-log4j12-1.7.7.jar and place it in the geomesa-{{ site.stableVersion }}/lib directory. 

If this conflicts with another SLF4J implementation, it may need to be removed from the lib directory.

Try running

{% highlight bash %}
geomesa
{% endhighlight %}

once more. This should print out the following usage text: 

{% highlight bash %}
Using GEOMESA_HOME = /home/jkenneally/geomesa/geomesa-1.0.0-rc.6
Usage: geomesa [command] [command options]
  Commands:
    create           Create a feature definition in a GeoMesa catalog
    deletecatalog    Delete a GeoMesa catalog completely (and all features in it)
    describe         Describe the attributes of a given feature in GeoMesa
    explain          Explain how a GeoMesa query will be executed
    export           Export a GeoMesa feature
    help             Show help
    ingest           Ingest a file of various formats into GeoMesa
    list             List GeoMesa features for a given catalog
    removeschema     Remove a schema and associated features from a GeoMesa catalog
    tableconf        Perform table configuration operations
    version          GeoMesa Version

{% endhighlight %}

This usage text gives a brief overview of how to use each command. To learn more about each command 
the the flags associated with them, take a look at the 
[Github Tools README](https://github.com/locationtech/geomesa/tree/accumulo1.5.x/1.x/geomesa-tools#geomesa-tools).

Throughout this tutorial, be aware that all commands will require `-u` or `--user` flags, where 
the username is your Accumulo username. The password for the Accumulo user can also be given on the 
command line with `-p` or `--password`, or geomesa-tools can prompt you for your password after 
entering a command, ensuring your password won't enter shell history.

If you run into issues with Hadoop JARs not being found, try appending your commands with
    
{% highlight bash %}    
--instance-name {accumulo-instance-name} --zookeepers {accumulo-zookeepers-string}
{% endhighlight %}

where `accumulo-instance-name` and `accumulo-zookeepers-string` are specific to your Accumulo setup.
This will override GeoMesa-Tools attempting to automatically find your Accumulo and Hadoop configurations.

Additionally, if you need visibilities or authorizations on your Accumulo tables, every command accepts
`--visibilities` and `--auths` for Accumulo connection parameters.

## Feature Management

To begin, let's start by creating a new feature in GeoMesa with the `create` command. The `create` 
command takes three required flags and one optional:  
#### Required  
`-c` or `--catalog` for the name of the catalog table  
`-fn` or `--feature-name` for the name of the feature  
`-s` or `--spec` for the SimpleFeatureType specification  
#### Optional
`-dt` or `--dt-field` for the default date attribute of the SFT

From the root GeoMesa directory, run the command: 

{% highlight bash %}
geomesa create -u username -p password -c cmd_tutorial -fn feature -s id:String:index=true,dtg:Date,geom:Point:srid=4326 -dt dtg
{% endhighlight %}

This will create a new feature, named "feature," on catalog table "cmd_tutorial." The catalog table 
stores metadata information about each feature, and it will be used to prefix each table name in
 Accumulo. 

If the above command was successful, you should see output text similar to the following:

{% highlight bash %}    
Creating 'cmd_tutorial_feature' with spec 'id:String:index=true,dtg:Date,geom:Point:srid=4326'. Just a few moments...
Feature 'cmd_tutorial_feature' with spec 'id:String:index=true,dtg:Date,geom:Point:srid=4326' successfully created.
{% endhighlight %}

Now that you've seen how to create features, create another feature on catalog table "cmd_tutorial" 
using your own first name for the `--feature-name` and the above schema for the `--spec`.

You should have two features on catalog table "cmd_tutorial." To verify, we'll use the `list` 
command. The `list` command takes one flag:  

`-c` or `--catalog` for the name of the catalog table  

Run the following command:

{% highlight bash %}
geomesa list -u username -p password -c cmd_tutorial 
{% endhighlight %}

The output text should be something like:

{% highlight bash %}    
Listing features on 'cmd_tutorial'. Just a few moments...
2 features exist on 'cmd_tutorial'. They are: 
feature
jake
{% endhighlight %}
      
To find out more about the attributes of a feature, we'll use the `describe` command. This command 
takes 2 flags:

`-c` or `--catalog` for the name of the catalog table  
`-fn` or `--feature-name` for the name of the feature   

Let's find out more about the attributes on our first feature. Run the command

{% highlight bash %}
geomesa describe -u username -p password -c cmd_tutorial -fn feature
{% endhighlight %}

The output should look like:

{% highlight bash %}    
Describing attributes of feature 'cmd_tutorial_feature'. Just a few moments...
id: String (Indexed) 
dtg: Date (Time-index) 
geom: Point (Geo-index) 
{% endhighlight %}
        
Continuing on, let's delete the first feature we created with the `delete` command. The `delete` 
command takes two flags:  

`-c` or `--catalog` for the name of the catalog table  
`-fn` or `--feature-name` for the name of the feature to delete.  

Run the following command:

{% highlight bash %}
geomesa delete -u username -p password -c cmd_tutorial -fn feature
{% endhighlight %}

NOTE: Running this command will take a bit longer than the previous two, as it will delete three 
tables in Accumulo, as well as remove the metadata rows in the catalog table associated with the 
feature.

The output should resemble the following:

{% highlight bash %}
Delete 'feature' on catalog table 'cmd_tutorial'? (yes/no) : yes
Deleting 'cmd_tutorial_feature'. This will take longer than other commands to complete. Just a few moments...
Feature 'jdk2pq_test_test' successfully deleted.
{% endhighlight %}

## Conclusion
In this tutorial, you learned about the feature management commands contained in the GeoMesa Command 
Line Tools. We covered `create`, `list`, `describe`, and `delete`, as well as how to setup geomesa-tools
on the first run. In our next post on geomesa-tools, we'll cover feature ingest and feature export 
from the command line. If you have ideas for additional functionality to include in the Command Line 
Tools module, please don't hesitate to [reach out on our listserv](mailto:geomesa-users@locationtech.org).
