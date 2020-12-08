import React, { Component } from "react";
import { Map } from "ol";
import { View } from "ol";
import { Coordinate } from "ol/coordinate";
import { Tile } from "ol/layer";
import { OSM } from "ol/source";

export class TheMap extends Component<{ height: string }> {
    olmap: Map;
    state: {
        center: Coordinate,
        zoom: number
    }
  constructor(props: any) {
    super(props);

    this.state = { center: [0, 0], zoom: 1 };

    this.olmap = new Map({
      target: null,
      layers: [
        new Tile({
          source: new OSM()
        })
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

  userAction() {
    this.setState({ center: [546000, 6868000], zoom: 5 });
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
