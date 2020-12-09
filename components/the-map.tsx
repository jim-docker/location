import 'ol/ol.css';
import React, { Component } from "react";
import { Map as OlMap, View} from "ol";
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

export class TheMap extends Component<{ height: string, points?: [lon: number, lat: number][] }> {
    olmap: OlMap;
    state: {
        center: Coordinate,
        zoom: number
    }
  constructor(props: any) {
    super(props);

    this.olmap = new OlMap({
      target: null,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ]
    });

    var clusters: VectorLayer;
    const { points } = props;
    if (points) {
      // build the clusters
      this.state = { center: fromLonLat(points[0]), zoom: 12 };
      clusters = createClusters(this.pointsToFeatures(points))
    } else {
      this.state = { center: [0, 0], zoom: 1 };
      clusters = createDemoClusters();
    }

    this.olmap.addLayer(clusters);
    this.olmap.setView(new View({ center: this.state.center, zoom: this.state.zoom }));
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
      const { height } = this.props;

    this.updateMap(); // Update map on render?
    return (
      <div id="map" style={{ width: "100%", height: height }}>
      </div>
    );
  }
}


function createDemoClusters(): VectorLayer {
  var count = 20000;
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
  
  var clusterSource = new Cluster({
    distance: 40,
    source: source,
  });
  
  var styleCache = new Map<number, Style>();
  
  return new VectorLayer({
    source: clusterSource,
    style: function (feature) {
      var size: number = feature.get('features').length;
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
          text: new Text({
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
