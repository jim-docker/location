import React from "react"
import { Component, LensRendererExtension } from "@k8slens/extensions";
import { TheMap } from "./the-map"

const { PageLayout } = Component;

export class GlobalPage extends React.Component<{ extension: LensRendererExtension }> {
  render() {
    return (
      <PageLayout
        header={
          <h2 key={"header"}>Clusters Map</h2>
        }
        showOnTop
      >
        <div>
          <TheMap height="600px"/>
        </div>      
      </PageLayout>
    )
  }
}
