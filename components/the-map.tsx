import "ol/ol.css";
import "./the-map.css"

import React, { Component } from "react";

import { locationPreferencesStore } from "./location-store";

import { Map as OlMap, View, Overlay } from "ol";
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import { Coordinate } from "ol/coordinate";
import {Cluster, OSM, Vector as VectorSource} from 'ol/source';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {fromLonLat} from 'ol/proj';
import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style,
  Text,
} from 'ol/style';
import { isEmpty } from 'ol/extent';

export class TheMap extends Component<{ height: string, points?: [lon: number, lat: number][] }> {
  olmap: OlMap;
  state: {
      center: Coordinate,
      zoom: number,
  }

   constructor(props: { height: string, points?: [lon: number, lat: number][] }) {
    super(props);

    this.state = { center: [0, 0], zoom: 1 };

    this.olmap = new OlMap({
      target: null,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({ center: this.state.center, zoom: this.state.zoom})
    });

    var clusters: VectorLayer;
    const { points } = props;
    if (points?.length > 0) {
      // build the clusters
      console.log("# of points: ", points.length);
      for (var i = 1; i < points.length; ++i) {
        if (points[i] !== points[i-1]) {
          break;
        }
      }
      if (i === points.length) {
        // there's only one unique point
        this.state.center = fromLonLat(points[0]);
        this.state.zoom = 12;
      }
      clusters = createClusters(this.pointsToFeatures(points))
    } else {
      clusters = createDemoClusters();
    }

    this.olmap.addLayer(clusters);
    var extent = clusters.getSource().getExtent();  // this is undefined???
    if (extent && !isEmpty(extent)) {
      console.log("fitting to cluster extent");
      this.olmap.getView().fit(extent); // this does not work even with hand-calculated extent????
    } else {
      console.log("fitting to centre and zoom");
      this.olmap.getView().setCenter(this.state.center);
      this.olmap.getView().setZoom(this.state.zoom);
    }
  }

  pointsToFeatures(points: [lon: number, lat: number][]) : Feature[] {
    var features: Feature[] = [];

    for (var i = 0; i < points.length; ++i) {
      var coordinates = fromLonLat(points[i]);
      features[i] = new Feature(new Point(coordinates));
    }

    return features;
  }  

  updateMap() {
    this.olmap.getView().setCenter(this.state.center);
    this.olmap.getView().setZoom(this.state.zoom);
  }

  componentDidMount() {
    this.olmap.setTarget("map");

    // Listen to map changes
    this.olmap.on("moveend", () => {
      let center = this.olmap.getView().getCenter();
      let zoom = this.olmap.getView().getZoom();
      this.setState({ center, zoom });
    });
  }

  shouldComponentUpdate(nextProps: any, nextState : any) {
    let center = this.olmap.getView().getCenter();
    let zoom = this.olmap.getView().getZoom();
    if (center === nextState.center && zoom === nextState.zoom) return false;
    return true;
  }

  render() {
    console.log("rendering map");
    const { height } = this.props;

    this.updateMap(); // Update map on render?
    return (
      <div id="map" style={{ width: "100%", height: height }}>
    </div>
    );
  }
}


function createDemoClusters(): VectorLayer {
  var count = 5000;
  var features: Feature[] = [];
  var e = 10000000;
  var f = 20000000;
  for (var i = 0; i < count; ++i) {
    var coordinates = [2 * f * Math.random() - f, 2 * e * Math.random() - e];
    features[i] = new Feature(new Point(coordinates));
  }

  return createClusters(features);
}

function createClusters( points: Feature[]): VectorLayer {
  var source = new VectorSource({
    features: points,
  });
  
  var clusterSource: Cluster;
  if (locationPreferencesStore.clustering) {
    clusterSource = new Cluster({
      distance: 40,
      source: source,
    });
  }

  var styleCache = new Map<number, Style>();
  
  return new VectorLayer({
    source: clusterSource ? clusterSource : source,
    style: function (feature) {
      var size: number;
      if (!feature.get('features')) {
        size = 1;
      } else {
        size = feature.get('features').length;
      }
      var style = styleCache.get(size);
      if (!style) {
        style = new Style({
          image: new CircleStyle({
            radius: 10,
            stroke: new Stroke({
              color: '#fff',
            }),
            fill: new Fill({
              color: '#3399CC',
            }),
          }),
          text: size === 1 ? undefined : new Text({
            text: size.toString(),
            fill: new Fill({
              color: '#fff',
            }),
          }),
        });
        styleCache.set(size, style);
      }
      return style;
    },
  });
}
