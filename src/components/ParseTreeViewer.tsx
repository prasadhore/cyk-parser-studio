import React, { useState, useMemo } from 'react';
import { ParseTreeNode } from '../types/cyk.ts';
import { GitBranch, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';
import { sound } from '../utils/sound.ts';

interface ParseTreeViewerProps {
  tree: ParseTreeNode | null | undefined;
  input: string;
}

interface LayoutNode {
  id: string;
  node: ParseTreeNode;
  x: number;
  y: number;
  width: number;
  children: LayoutNode[];
}

export const ParseTreeViewer: React.FC<ParseTreeViewerProps> = ({
  tree,
  input,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Compute SVG tree coordinates using hierarchical layout
  const layout = useMemo(() => {
    if (!tree) return null;

    let idCounter = 0;
    const nodeWidth = 72;
    const nodeHeight = 54;
    const levelHeight = 85;

    // First pass: compute subtree widths
    function buildLayout(curr: ParseTreeNode, depth: number): LayoutNode {
      const id = `node-${idCounter++}`;
      const children: LayoutNode[] = [];

      if (curr.left) {
        children.push(buildLayout(curr.left, depth + 1));
      }
      if (curr.right) {
        children.push(buildLayout(curr.right, depth + 1));
      }

      const totalChildWidth = children.reduce((acc, c) => acc + c.width, 0);
      const width = Math.max(nodeWidth + 24, totalChildWidth);

      return {
        id,
        node: curr,
        x: 0,
        y: depth * levelHeight + 40,
        width,
        children,
      };
    }

    const root = buildLayout(tree, 0);

    // Second pass: assign horizontal X coordinates
    function assignPositions(curr: LayoutNode, leftBound: number) {
      if (curr.children.length === 0) {
        curr.x = leftBound + curr.width / 2;
        return;
      }

      let childLeft = leftBound;
      for (const child of curr.children) {
        assignPositions(child, childLeft);
        childLeft += child.width;
      }

      // Center parent between first and last child
      const firstChild = curr.children[0];
      const lastChild = curr.children[curr.children.length - 1];
      curr.x = (firstChild.x + lastChild.x) / 2;
    }

    assignPositions(root, 40);

    // Flatten nodes and edges for SVG rendering
    const allNodes: LayoutNode[] = [];
    const allEdges: { fromX: number; fromY: number; toX: number; toY: number; parentId: string; childId: string }[] = [];

    function traverse(curr: LayoutNode) {
      allNodes.push(curr);
      for (const ch of curr.children) {
        allEdges.push({
          fromX: curr.x,
          fromY: curr.y + 16,
          toX: ch.x,
          toY: ch.y - 16,
          parentId: curr.id,
          childId: ch.id,
        });
        traverse(ch);
      }
    }

    traverse(root);

    const maxX = Math.max(...allNodes.map((n) => n.x)) + 80;
    const maxY = Math.max(...allNodes.map((n) => n.y)) + 80;

    return {
      nodes: allNodes,
      edges: allEdges,
      width: Math.max(maxX, 600),
      height: Math.max(maxY, 320),
    };
  }, [tree]);

  if (!tree || !layout) return null;

  const handleZoomIn = () => {
    sound.play('click');
    setScale((s) => Math.min(2.0, s + 0.15));
  };

  const handleZoomOut = () => {
    sound.play('click');
    setScale((s) => Math.max(0.6, s - 0.15));
  };

  const handleResetZoom = () => {
    sound.play('click');
    setScale(1);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
            <span>Syntax Parse Tree Derivation</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            Hierarchical Vector Parse Tree for "{input}"
          </h3>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={handleZoomOut}
            className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono px-1.5 text-slate-500 text-[11px]">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded ml-1"
            title="Reset Zoom"
            aria-label="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 p-4 max-h-[480px] flex justify-center">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
        >
          <svg
            width={layout.width}
            height={layout.height}
            className="overflow-visible select-none"
          >
            <defs>
              <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Tree Branches (Edges) */}
            {layout.edges.map((edge, idx) => {
              const dx = edge.toX - edge.fromX;
              const dy = edge.toY - edge.fromY;
              // Smooth bezier curve
              const pathD = `M ${edge.fromX} ${edge.fromY} C ${edge.fromX} ${edge.fromY + dy * 0.45}, ${edge.toX} ${edge.toY - dy * 0.45}, ${edge.toX} ${edge.toY}`;

              return (
                <path
                  key={idx}
                  d={pathD}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-300 dark:text-slate-700 transition-colors"
                />
              );
            })}

            {/* Tree Nodes */}
            {layout.nodes.map((n) => {
              const isLeaf = Boolean(n.node.terminal);
              const isHovered = hoveredNodeId === n.id;

              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x}, ${n.y})`}
                  onMouseEnter={() => setHoveredNodeId(n.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="cursor-pointer transition-transform"
                >
                  {isLeaf ? (
                    /* Terminal Leaf Node */
                    <>
                      <circle
                        r="18"
                        className="fill-amber-100 dark:fill-amber-950 stroke-amber-400 dark:stroke-amber-600 transition-all"
                        strokeWidth={isHovered ? '2.5' : '1.5'}
                      />
                      <text
                        textAnchor="middle"
                        dy="4"
                        className="font-mono text-xs font-bold fill-amber-900 dark:fill-amber-200"
                      >
                        '{n.node.terminal}'
                      </text>
                      <text
                        textAnchor="middle"
                        dy="30"
                        className="font-mono text-[10px] fill-slate-400"
                      >
                        w[{n.node.range[0]}]
                      </text>
                    </>
                  ) : (
                    /* Non-Terminal Internal Node */
                    <>
                      <rect
                        x="-24"
                        y="-16"
                        width="48"
                        height="32"
                        rx="8"
                        className={`transition-all ${
                          isHovered
                            ? 'fill-indigo-600 stroke-indigo-400'
                            : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                        }`}
                        strokeWidth="1.5"
                      />
                      <text
                        textAnchor="middle"
                        dy="4"
                        className={`font-mono text-xs font-bold ${
                          isHovered
                            ? 'fill-white'
                            : 'fill-indigo-600 dark:fill-indigo-400'
                        }`}
                      >
                        {n.node.symbol}
                      </text>
                      <text
                        textAnchor="middle"
                        dy="27"
                        className="font-mono text-[9px] fill-slate-400 font-normal"
                      >
                        "{n.node.substring}"
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
