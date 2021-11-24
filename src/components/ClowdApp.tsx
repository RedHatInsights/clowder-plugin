import * as React from 'react';
//import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { K8sResourceCommon} from '@openshift-console/dynamic-plugin-sdk';
import { useK8sWatchResource} from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Title, Text } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, sortable } from '@patternfly/react-table';
import { Label, Button } from '@patternfly/react-core'

export type ClowdAppDeployment = {
  managedDeployments?: number;
  readyDeployments?: number;
};

export type ClowdAppCondition = {
	type: string;
  status: string;
  lastProbeTime?: string;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export type ClowdAppStatus = {
  deployments?: ClowdAppDeployment;
  ready?: boolean;
  conditions?: ClowdAppCondition[];
};

export type ClowdSpec = {
  envName: string;
}

export type ClowdAppKind = {
  spec: ClowdSpec;
  status?: ClowdAppStatus;
} & K8sResourceCommon;

const CombineError = ({ errors }) => {
  var error = [];
  errors.forEach(element => {
    error.push(<React.Fragment>{element}<br/></React.Fragment>);
    });
  return <div>{error}</div>;
}

const Foo: React.FC = () => {
  var path = window.location.pathname.split("/")
  var namespace = ""
  if (path[2] == "ns") {
    namespace = path[3]
  }
  const [data, loaded] = useK8sWatchResource<ClowdAppKind[]>({
    kind: 'cloud.redhat.com~v1alpha1~ClowdApp',
    isList: true,
    namespace: namespace
  });  

  const tabData = () => {
    var newArray = []
    if (!loaded) {
      return []
    }
    data.forEach((a, b, c) => {

      var appReady = true
      var col

      var errors = []
      if (a.status && a.status.conditions){
        a.status.conditions.forEach((d, e, f) => {
          if (d.type == "ReconciliationPartiallySuccessful" && d.status == "True"){
            errors.push(d.reason)
            appReady = false
          }
          if (d.type == "ReconciliationFailed" && d.status == "True"){
            errors.push(d.reason)
            appReady = false
          }
          if (d.type == "DeploymentsReady" && d.status == "False"){
            errors.push(d.message)
            appReady = false
          }
        })
      }

      if (appReady) {
        col = "green"
      } else {
        col = "red"
      }

      var link = "/k8s/cluster/cloud.redhat.com~v1alpha1~ClowdApp/" + a.metadata.name

      newArray.push([
        {title: <Button variant="link" component="a" href={link} isInline>{a.metadata.name}</Button>, }, 
        a.metadata.namespace, 
        a.spec.envName, 
        {title: <Label color={col}>{appReady.toString()}</Label>},
        {title: <CombineError errors={errors}/>},
      ])
    })
    return newArray
  }

  return (
    <PageSection style={{ paddingTop: 20, paddingLeft: 20, overflow: "auto" }}>
      <Title headingLevel="h1" size="3xl">ClowdApp Status</Title>
      <Text style={{paddingTop: 20, paddingBottom: 20, color: "#555"}}>This page shows a list of all ClowdApps and their associated states.</Text>
      <React.Fragment>
          <SortableTable 
            columns={[{title: "Name", transforms:[sortable]}, "Namespace", "Environment Name", "Ready", "Error"]}
            rows={tabData()}
          >
          </SortableTable>
        </React.Fragment>
    </PageSection>
  );
};
export default Foo;

import {
  SortByDirection,
} from '@patternfly/react-table';

class SortableTable extends React.Component<{rows: any, columns: any}, {rows: any, columns: any, sortBy: any}> {
  constructor(props) {
    super(props);
    
    this.state = {
      columns: props.columns,
      rows: props.rows,
      sortBy: {
        index: 0,
        direction: SortByDirection.asc
      }
    };
    this.onSort = this.onSort.bind(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (JSON.stringify(this.props.rows) !== JSON.stringify(prevProps.rows)) {
      this.setState({
        rows: this.props.rows
      })
    }
  }

  onSort(_event, index, direction) {
    const sortedRows = this.state.rows.sort((a, b) => (a[index].title < b[index].title ? -1 : a[index].title > b[index].title ? 1 : 0));
    this.setState({
      sortBy: {
        index,
        direction
      },
      rows: direction === SortByDirection.asc ? sortedRows : sortedRows.reverse()
    });
  }

  render() {
    const { sortBy, columns, rows } = this.state;

    return (
      <Table aria-label="Sortable Table" sortBy={sortBy} onSort={this.onSort} cells={columns} rows={rows} variant="compact">
        <TableHeader />
        <TableBody />
      </Table>
    );
  }
}
