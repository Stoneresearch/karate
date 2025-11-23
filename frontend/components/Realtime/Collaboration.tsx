'use client';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../lib/convex/api';
import type { Id } from '../../lib/convex/dataModel';
import type { Node, Edge } from '@xyflow/react';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';

export function useWorkflow(roomId: string) {
  const { user } = useUser();
  const router = useRouter();
  const storeUser = useMutation(api.users.getOrCreate);

  // Sync user to Convex on load
  useEffect(() => {
    if (user && user.primaryEmailAddress?.emailAddress) {
        storeUser({
            email: user.primaryEmailAddress.emailAddress,
            name: user.fullName || user.username || 'User',
        });
    }
  }, [user, storeUser]);

  // Try to parse roomId as Convex ID, fallback to string for compatibility
  let workflowId: Id<'workflows'> | null = null;
  // Treat any non-empty, non-demo ID as a Convex document id
  if (roomId && roomId.length > 0 && roomId !== 'demo-room') {
    workflowId = roomId as Id<'workflows'>;
  }

  // Always register hooks in a consistent order; use 'skip' when we have no id yet
  const workflow = useQuery(api.workflows.get, workflowId ? { id: workflowId } : 'skip');
  const getOrCreateWorkflow = useMutation(api.workflows.getOrCreate);
  const updateWorkflowMutation = useMutation(api.workflows.update);

  // Update workflow function
  const updateWorkflow = async (args: { nodes?: Node[]; edges?: Edge[]; title?: string }) => {
    let targetId = workflowId;

    // If no workflow exists, create one first
    if (!targetId && !workflow) {
      const newId = await getOrCreateWorkflow({
        // owner: user?.id || 'demo-user', // Backend now handles owner from auth context
        title: args.title || 'My First Flow',
      });
      targetId = newId;
      
      // If we were in demo-room, move to the new real ID
      if (roomId === 'demo-room' && newId) {
         router.push({ pathname: '/editor', query: { id: newId } }, undefined, { shallow: true });
      }
    } else if (workflow?._id) {
      targetId = workflow._id;
    }

    if (!targetId) return;

    await updateWorkflowMutation({
      id: targetId,
      ...args,
    });
  };

  return {
    workflow: workflow || null,
    updateWorkflow,
  } as const;
}


