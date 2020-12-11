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

export class TheMap extends Component<{ height: string, points: [lon: number, lat: number][], isLonLat: boolean, labels?: string[], onClick?: (label: string) => void }> {
  olmap: OlMap;
  state: {
      center: Coordinate,
      zoom: number,
  }
  clusters: VectorLayer;

  constructor(props: { height: string, points: [lon: number, lat: number][], isLonLat: boolean, labels?: string[], onClick?: (label: string) => void }) {
    super(props);

    console.log("map constructor called");

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

    this.addPointsOverlay(props.points, props.isLonLat, props.labels);
  }

  pointsToFeatures(points: [lon: number, lat: number][], isLonLat: boolean, labels?: string[]) : Feature[] {
    var features: Feature[] = [];

    for (var i = 0; i < points.length; ++i) {
      var coordinates;
      if (isLonLat) {
        coordinates = fromLonLat(points[i]);
      } else {
        coordinates = points[i];
      }
      features[i] = new Feature(new Point(coordinates));
      if (labels && i < labels.length) {
        features[i].set("lensLabel", labels[i]);
      }
    }

    return features;
  }

  addPointsOverlay(points: [lon: number, lat: number][], isLonLat: boolean, labels: string[]) {
    if (this.clusters) {
      this.olmap.removeLayer(this.clusters);
      this.clusters = undefined;
    }

    if (points.length === 0) {
      //  no points, no vector layer
      console.log("no points!");
      return;
    }

    var center = this.state.center;
    var zoom = this.state.zoom;

    // build the clusters
    console.log("# of points: ", points.length);
    for (var i = 1; i < points.length; ++i) {
      if (points[i] !== points[i-1]) {
        console.log("points are not all the same");
        break;
      }
    }

    if (i === points.length) {
      // there's only one unique point
      center = fromLonLat(points[0]);
      zoom = 12;
    }

    this.clusters = createClusters(this.pointsToFeatures(points, isLonLat, labels))

    this.olmap.addLayer(this.clusters);
    var extent = this.clusters.getSource().getExtent();  // this is undefined???
    if (extent && !isEmpty(extent)) {
      console.log("fitting to cluster extent");
      this.olmap.getView().fit(extent); // this does not work even with hand-calculated extent????
    } else {
      console.log("fitting to centre and zoom");
      this.olmap.getView().setCenter(center);
      this.olmap.getView().setZoom(zoom);
    }
    this.setState({center, zoom});
  }

  updateMap() {
    this.olmap.getView().setCenter(this.state.center);
    this.olmap.getView().setZoom(this.state.zoom);
  }

  componentDidMount() {
    this.olmap.setTarget("map");

    // Listen to map changes
    this.olmap.on("moveend", () => {
      var center = this.olmap.getView().getCenter();
      var zoom = this.olmap.getView().getZoom();
      this.setState({ center, zoom });
    });

    this.olmap.on('singleclick', e => {
      this.olmap.forEachFeatureAtPixel(e.pixel, (f: any) => {
        console.log("clicked on feature");
        var label: string;
        if (!f.get('features')) {
          label = f.get("lensLabel");
        } else {
          label = f.get("features")[0].get("lensLabel");  // this won't work when clusters are all colocated
        }
        console.log(`clicked on cluster ${label}`);
        if (this.props.onClick) {
          this.props.onClick(label);
        }
        return true;
      });
    });    
  }

  componentDidUpdate(prevProps: any) {
    console.log("TheMap updated")
    if (this.props.points !== prevProps.points) {
      this.addPointsOverlay(this.props.points, this.props.isLonLat, this.props.labels);
    }
  }

  shouldComponentUpdate(nextProps: any, nextState : any) {
    let center = this.olmap.getView().getCenter();
    let zoom = this.olmap.getView().getZoom();
    if (center !== nextState.center || zoom !== nextState.zoom) return true;

    if (this.props.points !== nextProps.points) {
      console.log("points changed, TheMap should rerender");
      return true;
    }

    return false;
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
            radius: 12,
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
