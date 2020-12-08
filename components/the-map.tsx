import 'ol/ol.css';
import React, { Component } from "react";
import { Map as OlMap} from "ol";
import { View } from "ol";
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import { Coordinate } from "ol/coordinate";
import {Cluster, OSM, Vector as VectorSource} from 'ol/source';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style,
  Text,
} from 'ol/style';

export class TheMap extends Component<{ height: string }> {
    olmap: OlMap;
    state: {
        center: Coordinate,
        zoom: number
    }
  constructor(props: any) {
    super(props);

    this.state = { center: [0, 0], zoom: 1 };

    this.olmap = new OlMap({
      target: null,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        clusters
      ],
      view: new View({
        center: this.state.center,
        zoom: this.state.zoom
      })
    });
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



var distance = 40;

var count = 20000;
var features: Feature[] = [];
var e = 4500000;
for (var i = 0; i < count; ++i) {
  var coordinates = [2 * e * Math.random() - e, 2 * e * Math.random() - e];
  features[i] = new Feature(new Point(coordinates));
}

var source = new VectorSource({
  features: features,
});

var clusterSource = new Cluster({
  distance: distance,
  source: source,
});

var styleCache: Map<number, Style>;

var clusters = new VectorLayer({
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
