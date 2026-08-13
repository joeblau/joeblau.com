"use client";

import {
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";

export type FlowNodeData = {
  /** Primary label — rendered uppercase, in the site's eyebrow treatment */
  label: string;
  /** Optional second line, e.g. a measurement or status */
  note?: string;
  /** Draws the node as the emphasized step in the path */
  accent?: boolean;
};

export type FlowSpec = {
  /**
   * Nodes are placed on a grid, not in pixels, so a memo never has to carry
   * layout math and every diagram on the site lines up the same way.
   */
  nodes: {
    id: string;
    label: string;
    note?: string;
    accent?: boolean;
    col: number;
    row?: number;
  }[];
  edges: { id?: string; source: string; target: string; label?: string }[];
};

/**
 * Connector lines and their arrowheads. --border is too faint to read as a line
 * on cream, so this is muted-foreground held back. Inline rather than a
 * Tailwind class: React Flow renders edges into SVG, where border utilities do
 * not apply.
 */
const EDGE_COLOR = "hsl(var(--muted-foreground) / 0.45)";

const NODE_WIDTH = 120;
const NODE_HEIGHT = 72;
const COL_GAP = 32;
const ROW_GAP = 32;
/**
 * Just enough room that the accent node's 2px border is not clipped by the
 * scroll container. The diagram is otherwise flush with the text column.
 */
const PAD = 4;

/**
 * A single step in a flow. Every color is a theme token, so the diagram reads
 * as cream-and-ink in light mode and warm charcoal in dark mode without a
 * second palette.
 */
function StepNode({ data }: NodeProps) {
  const { label, note, accent } = data as FlowNodeData;

  return (
    <div
      className={cn(
        "flex h-[72px] w-[120px] flex-col items-center justify-center gap-1 rounded-sm px-2 text-center",
        accent
          ? "border-2 border-foreground bg-accent"
          : "border border-border bg-card",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-px !w-px !min-w-0 !border-0 !bg-transparent"
      />
      <span
        className={cn(
          "text-[11px] font-bold uppercase leading-tight tracking-widest",
          accent ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      {note ? (
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wider",
            accent ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {note}
        </span>
      ) : null}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-px !w-px !min-w-0 !border-0 !bg-transparent"
      />
    </div>
  );
}

const nodeTypes = { step: StepNode };

export function FlowDiagram({ spec }: { spec: FlowSpec }) {
  const columns = Math.max(...spec.nodes.map((node) => node.col)) + 1;
  const rows = Math.max(...spec.nodes.map((node) => node.row ?? 0)) + 1;

  // The canvas is sized to its contents and rendered at zoom 1. React Flow's
  // own fitView is deliberately not used: it runs before custom nodes are
  // measured and no-ops, leaving the graph pinned to the top-left corner.
  const width = columns * NODE_WIDTH + (columns - 1) * COL_GAP + PAD * 2;
  const height = rows * NODE_HEIGHT + (rows - 1) * ROW_GAP + PAD * 2;

  const nodes: Node[] = spec.nodes.map((node) => ({
    id: node.id,
    type: "step",
    // Padding lives in the coordinates, not the viewport: React Flow's
    // viewport transform stays at identity here, so defaultViewport is not a
    // reliable way to inset the graph.
    position: {
      x: PAD + node.col * (NODE_WIDTH + COL_GAP),
      y: PAD + (node.row ?? 0) * (NODE_HEIGHT + ROW_GAP),
    },
    data: { label: node.label, note: node.note, accent: node.accent },
    draggable: false,
    selectable: false,
    connectable: false,
  }));

  const edges: Edge[] = spec.edges.map((edge) => ({
    id: edge.id ?? `${edge.source}-${edge.target}`,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: "smoothstep",
    style: { stroke: EDGE_COLOR, strokeWidth: 1 },
    // Open chevron rather than a filled head — lighter, and it matches the
    // hairline weight of the connectors.
    markerEnd: {
      type: MarkerType.Arrow,
      width: 18,
      height: 18,
      strokeWidth: 1.5,
      color: EDGE_COLOR,
    },
    labelStyle: {
      fill: "hsl(var(--muted-foreground))",
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      fontWeight: 600,
    },
    labelBgStyle: { fill: "hsl(var(--background))" },
  }));

  return (
    // Wide diagrams scroll sideways rather than shrink, matching how this site
    // already handles wide tables.
    <div className="not-prose my-8 overflow-x-auto">
      <div style={{ width, height }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          // A memo is a reading surface: the diagram must never capture the
          // page scroll or drift out of frame under a stray drag.
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          edgesReconnectable={false}
          panOnDrag={false}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
        />
      </div>
    </div>
  );
}
