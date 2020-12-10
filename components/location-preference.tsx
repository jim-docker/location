import { Component } from "@k8slens/extensions";
import { observer } from "mobx-react";
import React from "react";
import { LocationPreferencesStore } from "./location-store";

export class LocationPreferenceProps {
  preferences: LocationPreferencesStore;
}

@observer
export class LocationPreferenceInput extends React.Component<LocationPreferenceProps> {

  render() {
    const { preferences } = this.props;
    return (
      <Component.Checkbox
        label="Apply clustering"
        value={preferences.clustering}
        onChange={v => { preferences.clustering = v; }}
      />
    );
  }
}

export class LocationPreferenceHint extends React.Component {
  render() {
    return (
      <span>Clustering combines points together when they are very close to each other as viewed on the map.</span>
    );
  }
}