'use client';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../lib/convex/api';
import type { Id } from '../../lib/convex/dataModel';
import type { Node, Edge } from '@xyflow/react';

export function useWorkflow(roomId: string) {
  // Try to parse roomId as Convex ID, fallback to string for compatibility
  let workflowId: Id<'workflows'> | null = null;
  try {
    // If roomId looks like a Convex ID, use it directly
    if (roomId && roomId.length > 0 && roomId !== 'demo-room') {
      workflowId = roomId as Id<'workflows'>;
    }
  } catch {
    // If parsing fails, we'll create a new workflow
  }

  const hasConvex =
    Boolean((api as any)?.workflows?.get) &&
    Boolean((api as any)?.workflows?.create) &&
    Boolean((api as any)?.workflows?.getOrCreate) &&
    Boolean((api as any)?.workflows?.update);

  // Get workflow if we have an ID
  const workflow = hasConvex
    ? useQuery((api as any).workflows.get, workflowId ? { id: workflowId } : 'skip')
    : undefined;

  // Create workflow mutation
  const createWorkflow = hasConvex ? useMutation((api as any).workflows.create) : undefined;
  
  // Get or create workflow mutation
  const getOrCreateWorkflow = hasConvex ? useMutation((api as any).workflows.getOrCreate) : undefined;
  
  // Update workflow mutation
  const updateWorkflowMutation = hasConvex ? useMutation((api as any).workflows.update) : undefined;

  // Update workflow function
  const updateWorkflow = async (args: { nodes?: Node[]; edges?: Edge[]; title?: string }) => {
    if (!hasConvex) {
      // No-op when Convex isn't initialized yet
      return;
    }
    let targetId = workflowId;
    
    // If no workflow exists, create one first
    if (!targetId && !workflow && getOrCreateWorkflow) {
      const newId = await getOrCreateWorkflow({
        owner: 'demo-user', // TODO: Get from Clerk auth
        title: args.title || 'My First Flow',
      });
      targetId = newId;
    } else if (workflow?._id) {
      targetId = workflow._id;
    }

    if (!targetId) return;

    await updateWorkflowMutation!({
      id: targetId,
      ...args,
    });
  };

  return { 
    workflow: workflow || null,
    updateWorkflow,
  } as const;
}


