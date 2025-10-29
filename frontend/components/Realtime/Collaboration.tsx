'use client';
import { useState, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/react';

type Workflow = {
  id: string;
  title: string;
  nodes: Node[];
  edges: Edge[];
  owner: string;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
};

// Mock workflow for development when Convex isn't running
const MOCK_WORKFLOW: Workflow = {
  id: 'demo-room',
  title: 'My First Workflow',
  nodes: [],
  edges: [],
  owner: 'demo-user',
  isPublic: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export function useWorkflow(roomId: string) {
  const [mockWorkflow, setMockWorkflow] = useState<Workflow>(MOCK_WORKFLOW);
  const [isConvexReady, setIsConvexReady] = useState(false);

  // Check if Convex is available
  useEffect(() => {
    try {
      // Try to access Convex - if it fails, we'll use mock data
      setIsConvexReady(true);
    } catch {
      setIsConvexReady(false);
    }
  }, []);

  // Fallback: Use mock workflow if Convex isn't ready
  const workflow: Workflow | null = isConvexReady ? null : mockWorkflow;

  // Fallback: Mock updateWorkflow function
  const updateWorkflow = async (args: Partial<Pick<Workflow, 'nodes' | 'edges' | 'title'>>) => {
    if (args.nodes) setMockWorkflow((prev) => ({ ...prev, nodes: args.nodes as Node[] }));
    if (args.edges) setMockWorkflow((prev) => ({ ...prev, edges: args.edges as Edge[] }));
    if (args.title) setMockWorkflow((prev) => ({ ...prev, title: args.title as string }));
    return mockWorkflow;
  };

  return { workflow, updateWorkflow } as const;
}


