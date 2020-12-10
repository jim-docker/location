import React from "react"
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Component, LensRendererExtension, Store } from "@k8slens/extensions";
import { TheMap } from "./the-map"


const fakePositions: [ lon: number, lat: number ][] = [
  [24.654079, 60.205238],
  [24.938379, 60.169857],
];

var fakeCount = 0;

@observer
export class ClusterPage extends React.Component<{ extension: LensRendererExtension }> {

  @observable locations: [ lon: number, lat: number ][] = [];

  render() {
    return (
      <div style={{
        padding: "2em",
      }}>
        <TheMap height="600px" points={fakePositions}/>
      </div>      
    )
  }
}
