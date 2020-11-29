import React from "react"
import { Component, LensRendererExtension } from "@k8slens/extensions";

const { PageLayout } = Component;

export class GlobalPage extends React.Component<{ extension: LensRendererExtension }> {
  render() {
    return (
      <PageLayout
        header={
          <h2 key={"header"} data-testid="global-page-header">Extension Global Page</h2>
        }
        showOnTop
        data-testid="global-page-pagelayout"
      >
      <div key={"wrapper"}>
        <h1 data-testid="global-page-title">Global Page Content</h1>
        <br />
        <p data-testid="global-page-paragraph">A very long paragraph</p>
      </div>
    </PageLayout>
      )
  }
}
