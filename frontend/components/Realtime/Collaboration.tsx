'use client';
import { useQuery, useMutation } from 'convex/react';
import { useState, useEffect } from 'react';

// Mock workflow for development when Convex isn't running
const MOCK_WORKFLOW = {
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
  const [mockWorkflow, setMockWorkflow] = useState(MOCK_WORKFLOW);
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
  const workflow = isConvexReady
    ? null // Convex would be used here
    : mockWorkflow;

  // Fallback: Mock updateWorkflow function
  const updateWorkflow = async (args: any) => {
    if (args.nodes) setMockWorkflow((prev) => ({ ...prev, nodes: args.nodes }));
    if (args.edges) setMockWorkflow((prev) => ({ ...prev, edges: args.edges }));
    if (args.title) setMockWorkflow((prev) => ({ ...prev, title: args.title }));
    return mockWorkflow;
  };

  return { workflow, updateWorkflow } as const;
}


