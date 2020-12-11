import React from "react"
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Component, K8sApi, LensRendererExtension, Store } from "@k8slens/extensions";
import { TheMap } from "./the-map"

const { PageLayout } = Component;

const locations: [ lon: number, lat: number ][] = [];
var count = 5000;
var e = 10000000;
var f = 20000000;
for (var i = 0; i < count; ++i) {
  locations.push([2 * f * Math.random() - f, 2 * e * Math.random() - e]);
}


export class DemoPage extends React.Component<{ extension: LensRendererExtension }> {

  render() {
    return (
      <PageLayout
        header={
          <h2 key={"header"}>Demo Clusters Map</h2>
        }
        showOnTop
      >
        <div>
          <TheMap height="600px" points={locations} isLonLat={false} />
        </div>      
      </PageLayout>
    )
  }
}
