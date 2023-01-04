import * as React from 'react';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Title, Text } from '@patternfly/react-core';
import { Table, TableHeader, TableBody, sortable } from '@patternfly/react-table';
import { Label, Button, LabelProps } from '@patternfly/react-core'

export type ClowdEnvDeployment = {
  managedDeployments?: number;
  readyDeployments?: number;
};

export type ClowdEnvCondition = {
	type: string;
  status: string;
  lastProbeTime?: string;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export type ClowdEnvStatus = {
  deployments?: ClowdEnvDeployment;
  ready?: boolean;
  conditions?: ClowdEnvCondition[];
};

export type ClowdEnvKind = {
  spec: ClowdSpec;
  status?: ClowdEnvStatus;
} & K8sResourceCommon;

const CombineError = ({ errors }: { errors: React.ReactNode[] }) => {
  var error: JSX.Element[] = [];
  errors.forEach(element => {
    error.push(<React.Fragment>{element}<br/></React.Fragment>);
    });
  return <div>{error}</div>;
}

const Foo: React.FC = () => {
  const [data, loaded] = useK8sWatchResource<ClowdEnvKind[]>({
    kind: 'cloud.redhat.com~v1alpha1~ClowdEnvironment',
    isList: true,
  });

  const tabData = () => {
    var newArray: {title: React.ReactNode}[][] = []
    if (!loaded) {
      return []
    }
    data.forEach((a, b, c) => {

      var appReady = true
      var col: LabelProps['color']

      var errors: (string | undefined)[] = []
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

      var link = "/k8s/cluster/cloud.redhat.com~v1alpha1~ClowdEnvironment/" + a.metadata?.name

      newArray.push([
        {title: <Button variant="link" component="a" href={link} isInline>{a.metadata?.name}</Button>, }, 
        {title: <Label color={col}>{appReady.toString()}</Label>},
        {title: <CombineError errors={errors}/>},
      ])
    })
    return newArray
  }

  return (
    <PageSection style={{ paddingTop: 20, paddingLeft: 20, overflow: "auto" }}>
      <Title headingLevel="h1" size="3xl">Clowd Environment Status</Title>
      <Text style={{paddingTop: 20, paddingBottom: 20, color: "#555"}}>This page shows a list of all ClowdEnvs and their associated states.</Text>
      <React.Fragment>
          <SortableTable 
            columns={[{title: "Name", transforms:[sortable]}, "Ready", "Error"]}
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
import { ClowdSpec } from './ClowdApp';

type SortableTableProps = {rows: any[], columns: any[]}
type SortableTableState = {rows: any[], columns: any[], sortBy: {
  index: number,
  direction: SortByDirection
}}
class SortableTable extends React.Component<SortableTableProps, SortableTableState> {
  state: SortableTableState
  constructor(props: SortableTableProps) {
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

  componentDidUpdate(prevProps: SortableTableProps) {
    if (JSON.stringify(this.props.rows) !== JSON.stringify(prevProps.rows)) {
      this.setState({
        rows: this.props.rows
      })
    }
  }

  onSort(_event: any, index: number, direction: SortByDirection) {
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
