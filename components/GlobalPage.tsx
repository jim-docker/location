import React from "react"
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Component, LensRendererExtension, Store } from "@k8slens/extensions";
import { TheMap } from "./the-map"

const { PageLayout } = Component;

const clusterStore = Store.clusterStore

const fakePositions: [ lon: number, lat: number ][] = [
  [-80.577277, 43.468069],
  [24.654079, 60.205238],
  [24.654079, 60.205238],
];

var fakeCount = 0;

@observer
export class GlobalPage extends React.Component<{ extension: LensRendererExtension }> {

  @observable locations: [ lon: number, lat: number ][] = [];

  constructor(props: any) {
    super(props);

    clusterStore.connectedClustersList.forEach(cluster => this.addClusterLocation(cluster));
  }

  render() {
    return (
      <PageLayout
        header={
          <h2 key={"header"}>Clusters Map</h2>
        }
        showOnTop
      >
        <div>
          <TheMap height="600px" points={this.locations}/>
        </div>      
      </PageLayout>
    )
  }

  addClusterLocation(cluster: Store.Cluster) {
    this.locations.push(fakePositions[fakeCount++]);
    if (fakeCount >= fakePositions.length) {
      fakeCount = 0;
    }
  }
}
