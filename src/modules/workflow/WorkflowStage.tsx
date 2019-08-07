import React, { useState } from 'react';
import { AutoSizer } from 'react-virtualized';
import { debounce } from 'lodash';
import { v4 } from 'uuid';
import { useDrop, DropTargetMonitor } from 'react-dnd'
import { Graph, Node } from '../../components/JSPlumb';
import { FlowNodeProps, FlowNodesProps } from './WorkflowProps';
import { XYCoord } from 'dnd-core';
import { useMappedState } from 'redux-react-hook';
import { Button, Icon, Tooltip, message } from 'antd';

type Props = {};

const flowNodes: FlowNodesProps = {};
const flowConnections: any = [];

const WorkflowStage: React.FC<Props> = (props) => {
  const { } = props;

  const MAX_SCALE = 2;
  const MIN_SCALE = 0.5;

  const [scale, setScale] = useState<number>(1);
  const [width, setWidth] = useState<number>(500);
  const [height, setHeight] = useState<number>(500);
  const [nodes, setNodes] = useState<any>(flowNodes);
  const [xOffset, setXOffset] = useState<number>(0.0);
  const [yOffset, setYOffset] = useState<number>(0.0);
  const [selectedNode, setSelectedNode] = useState<FlowNodeProps | null>(null);
  const [connections, setConnections] = useState<any>(flowConnections);
  // const nodes: FlowNodeProps = useMappedState(state => state.workflowReducer)  

  const handleResize = debounce(
    ({ height, width }: { height: number, width: number }) => {
      setHeight(height);
      setWidth(width);
    },
    400,
    { trailing: true }
  );

  const handlePanEnd = (xOffset?: number, yOffset?: number) => {
    xOffset && setXOffset(xOffset);
    yOffset && setYOffset(yOffset);
  };

  const handleZoom = (scale?: number | undefined) => {
    // console.log(scale);
    setScale(scale!);
  };

  const handleClose = (id: string | undefined) => {
    if (id) {
      const { [id]: omit, ...remaining } = nodes;
      setNodes(remaining);
      setConnections(connections.filter((connection: any) => (
        connection.source !== id && connection.target !== id
      )));
    }
  };

  const handleAddConnection = (id: string, source: string, target: string) => {
    console.log({ id, source, target })
    setConnections([
      ...connections,
      { id, source, target }
    ]);
  };

  const handleRemoveConnection = (connectionId?: string, sourceId?: string) => {
    // if (confirm('Remove connection \'' + connectionId + '\'?')) {
    setConnections(connections.filter((connection: any) => (
      connection.id !== connectionId
    )));
    // }
  };

  const handleDeleteNode = (nodeId: string) => {
    console.log(nodeId);
  };

  const handleSave = () => {
    console.log(`nodes: `, nodes);
    console.log(`connections: `, connections);
  };

  const handlePlay = () => {

  };

  const handleReset = () => {
    setScale(1);
    setXOffset(0.0);
    setYOffset(0.0);
    setWidth(500);
    setHeight(500);
  };

  const handleSelectNode = (selectedNode: FlowNodeProps) => {
    console.log(selectedNode);
  };

  // const handleDrop = (id: string, x: number, y: number) => {
  //   setNodes({
  //     ...nodes,
  //     [id]: { ...nodes[id], x, y }
  //   });
  // };

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'box',
    drop: (item: any, monitor: DropTargetMonitor) => {
      const clientOffset: XYCoord | null = monitor.getSourceClientOffset();

      const ndDropPlace = document.getElementById('drop-stage');
      const dropPlaceOffset: { left: number, top: number } = ndDropPlace!.getBoundingClientRect();

      const relativeXOffset = clientOffset!.x - dropPlaceOffset.left;
      const relativeYOffset = clientOffset!.y - dropPlaceOffset.top;

      console.log(`✨拖动结束！`, item.name);

      let type: 'both' | 'source' | 'target' = 'both';
      if (item.name.model) {
        if (!(item.name.model.inputs && Object.keys(item.name.model.inputs).length > 0)) {
          type = 'source';
        } else if (!(item.name.model.outputs && Object.keys(item.name.model.outputs).length > 0)) {
          type = 'target';
        }
      }

      setNodes({
        ...nodes,
        [v4()]: {
          label: item.name.title,
          icon: 'icon-code1',
          type,
          model: item.name.model,
          style: {
            left: relativeXOffset,
            top: relativeYOffset,
          },
        }
      });
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div className="workflow-stage">
      <AutoSizer onResize={handleResize}>
        {() => null}
      </AutoSizer>
      <div ref={drop} id="drop-stage">
        <div className="stage-toolbar">
          <Button.Group>
            <Tooltip placement="top" title="保存">
              <Button onClick={handleSave}><Icon type="save" theme="filled" />保存</Button>
            </Tooltip>
            <Tooltip placement="top" title="运行">
              <Button onClick={handlePlay}><Icon type="play-circle" theme="filled" />运行</Button>
            </Tooltip>
            <Tooltip placement="top" title="缩放重置">
              <Button onClick={handleReset}><Icon type="sync" /></Button>
            </Tooltip>
            <Tooltip placement="top" title="全屏">
              <Button onClick={() => message.warn('开发中 😁')}><Icon type="fullscreen" /></Button>
            </Tooltip>
          </Button.Group>
        </div>
        <Graph
          connections={connections}
          height={height}
          id={'simpleDiagram'}
          maxScale={MAX_SCALE}
          minScale={MIN_SCALE}
          // onSelect={handleSelectNode}
          onAddConnection={handleAddConnection}
          onRemoveConnection={handleRemoveConnection}
          onPanEnd={handlePanEnd}
          onZoom={handleZoom}
          scale={scale}
          width={width}
          xOffset={xOffset}
          yOffset={yOffset}
        >
          {
            Object.keys(nodes).map((id) => {
              return (
                //@ts-ignore
                <Node
                  id={id}
                  className="node"
                  key={id}
                  type={nodes[id].type}
                  icon={nodes[id].icon}
                  label={nodes[id].label}
                  model={nodes[id].model}
                  // onDrop={handleDrop}
                  //@ts-ignore
                  onSelect={handleSelectNode}
                  onDelete={handleDeleteNode}
                  style={nodes[id].style}
                >
                </Node>
              );
            })
          }
        </Graph>
      </div>
    </div>
  );
};

export default WorkflowStage;