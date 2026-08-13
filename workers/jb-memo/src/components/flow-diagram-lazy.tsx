"use client";

import dynamic from "next/dynamic";
import type { FlowSpec } from "@/components/flow-diagram";

/**
 * React Flow is ~55 kB. Loading it lazily keeps that weight off memos that
 * contain no diagram, since every memo shares the same /[slug] route bundle.
 * ssr: false because the graph measures the DOM to lay itself out.
 */
const FlowDiagram = dynamic(
  () => import("@/components/flow-diagram").then((mod) => mod.FlowDiagram),
  {
    ssr: false,
    loading: () => <div className="not-prose my-8" style={{ height: 80 }} />,
  },
);

export function LazyFlowDiagram({ spec }: { spec: FlowSpec }) {
  return <FlowDiagram spec={spec} />;
}
