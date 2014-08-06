---
title: GeoMesa GeoServer UI
author: emilio
layout: tutorial
---

{% include tutorial-header.html %}

<!-- add some style to fix the xml formatting color -->
<style>
code.xml { color:#93a1a1 }
</style>

### Background

When you install the GeoMesa plugin for GeoServer, you get access to the GeoMesa User Interface.
The GeoMesa UI provides status on your GeoMesa data stores and will eventually provide advanced
features, such as building indices on your data or calculating statistics on your common queries.

This post outlines some of the features currently available through the GeoMesa UI.

Instructions for installing the GeoMesa plugin in GeoServer are available
[here](/2014/04/17/geomesa-gdelt-analysis/), under 'GeoServer Setup'

## Access to the User Interface

Once you have installed the GeoMesa plugin, there will be a GeoMesa menu on any GeoServer page:

!["GeoMesa Menu"](/img/tutorials/2014-08-06-geomesa-ui/geoserver-menu.png)

## Data Store Summary

Any GeoMesa data stores that you have added to GeoServer can be examined on the Data Stores page.
At the top of the page there is a table listing all of your GeoMesa data stores. Underneath that,
there are two charts. The first chart shows you the number of records in your different features.
The second chart shows a dynamically-updating display of any current ingestion.

<div class="callout callout-warning">
    Note: in order for the ingest chart to display, the Accumulo monitor needs to be running and the
    configuration page needs to have the correct address for the monitor (see below).
</div>

Further down the page, statistics on each feature are displayed. Here you can see the different
tables used to store the feature in Accumulo, as well as the number of tablets per table and the
total number of entries. By clicking on the 'Feature Attributes' link, you can see a list of all
the attributes for the feature, and an indication if they are indexed for querying.

!["Hadoop Status"](/img/tutorials/2014-08-06-geomesa-ui/geoserver-datastores.png)

## Configuration

To enable some features in the UI, you will need to set various properties on the configuration page.
Most of these properties correspond to Hadoop properties, and they can be copied from your hadoop
configuration files. You can enter them by hand, or you can upload your hadoop configuration files
directly to the page. To do this, use the 'Load from XML' button.

!["GeoMesa Configuration"](/img/tutorials/2014-08-06-geomesa-ui/geoserver-config.png)

## Hadoop Status

Once the configuration is done, you can monitor the Hadoop cluster status on the Hadoop Status page.
Here you can see the load on your cluster and any currently running jobs. 

!["Hadoop Status"](/img/tutorials/2014-08-06-geomesa-ui/geoserver-hadoop-status.png)

## More to Come

We'll be expanding the capabilities of the GeoMesa UI soon, so check back for more updates.
