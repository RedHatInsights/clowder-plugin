import * as React from 'react';
//import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Title, Text } from '@patternfly/react-core';
import {
	sortable
} from '@patternfly/react-table';
import {
	Table,
	TableHeader,
	TableBody
} from '@patternfly/react-table/deprecated';
import { Label, Button, LabelProps } from '@patternfly/react-core'

export type PipelineSpec = {
    appName: string;
}

export type PipelineCondition = {
  type: string;
  status: string;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
};

export type PipelineStatus = {
  valid?: boolean;
  conditions?: PipelineCondition[];
  initialSyncInProgress: string;
  hostCount: number;
};

export type CyndiPipelineKind = {
  spec: PipelineSpec;
  status?: PipelineStatus;
} & K8sResourceCommon;

const CombineError = ({ errors }: { errors: React.ReactNode[] }) => {
  var error: JSX.Element[] = [];
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

  const [pipeline,load] = useK8sWatchResource<CyndiPipelineKind[]>({
    kind: 'cyndi.cloud.redhat.com~v1alpha1~CyndiPipeline',
    isList: true,
    namespace: namespace
  })

  const tabbData = () => {
    var pipelineArray: ({title: React.ReactNode} | string | undefined)[][] = []
    if (!load) {
      return []
    }
    pipeline.forEach((a, b, c) => {

      var pipelineValid = true
      var col: LabelProps["color"]

      var errors: (string | undefined)[] = []
      if (a.status && a.status.conditions){
        a.status.conditions.forEach((d, e, f) => {
          if (d.type == "Valid" && d.status == "False"){
            errors.push(d.message)
            pipelineValid = false
          }
        })
      }

      if (pipelineValid) {
        col = "green"
      } else {
        col = "red"
      }

      var link = "/k8s/ns/" + a.metadata?.namespace + "/cyndi.cloud.redhat.com~v1alpha1~CyndiPipeline/" + a.metadata?.name
      var project = "/k8s/cluster/project.openshift.io~v1~Project/" + a.metadata?.namespace

      pipelineArray.push([
        {title: <Button variant="link" component="a" href={link} isInline>{a.metadata?.name}</Button>, }, 
        {title: <Button variant="link" component="a" href={project} isInline>{a.metadata?.namespace}</Button>, }, 
        {title: <Label>{a.status?.initialSyncInProgress}</Label>, },
        {title: <Label color={col}>{pipelineValid.toString()}</Label>},
        {title: <Label>{a.status?.hostCount}</Label>, },
        {title: <CombineError errors={errors}/>},
      ])
    })
    return pipelineArray
    
  }

  return (
    <PageSection style={{ paddingTop: 20, paddingLeft: 20, overflow: "auto" }}>
      <Title headingLevel="h1" size="3xl">Cyndi Pipeline Status</Title>
      <Text style={{paddingTop: 20, paddingBottom: 20, color: "#555"}}>This page shows a list of all Cyndi Pipelines and their valid state.</Text>
      <React.Fragment>
          <SortableTable 
            columns={[{title: "Name", transforms:[sortable]}, "Namespace", "Initial Sync", "Valid", "Host Count", "Error"]}
            rows={tabbData()}
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
    const sortedRows = [...this.state.rows]
    
    sortedRows.sort((a, b) => {
      const aValue = JSON.stringify(a[index].title.props.children)
      const bValue = JSON.stringify(b[index].title.props.children)
      return aValue.localeCompare(bValue)
    });

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
