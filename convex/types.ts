// Shared TypeScript types for Convex tables and APIs (temporary until codegen is enabled)

// Generic table id placeholder (replace with Id<'table'> from Convex when available)
export type TableId<T extends string> = string & { __table?: T };

// Graph types stored in workflows
export type FlowPosition = { x: number; y: number };
export type FlowNodeData = Record<string, unknown>;
export type FlowNode = {
  id: string;
  type?: string;
  position?: FlowPosition;
  data?: FlowNodeData;
  selected?: boolean;
};
export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  animated?: boolean;
};

export type Workflow = {
  _id?: TableId<'workflows'>;
  title: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  owner: string; // user id or external id
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
};

export type User = {
  _id?: TableId<'users'>;
  name: string;
  email: string;
  credits: number;
  createdAt: number;
};

export type Organization = {
  _id?: TableId<'organizations'>;
  name: string;
  ownerId?: TableId<'users'>;
  createdAt: number;
};

export type MembershipRole = 'admin' | 'staff' | 'user';
export type Membership = {
  _id?: TableId<'memberships'>;
  orgId: TableId<'organizations'>;
  userId: TableId<'users'>;
  role: MembershipRole;
  createdAt: number;
};

export type AgentEvent = {
  _id?: TableId<'agents'>;
  type: string;
  action: string;
  data: unknown;
  timestamp: number;
};

export type RunStatus = 'queued' | 'running' | 'completed' | 'failed';
export type Run = {
  _id?: TableId<'runs'>;
  workflowId: TableId<'workflows'>;
  userId: TableId<'users'>;
  status: RunStatus;
  result: unknown;
  startedAt: number;
  completedAt?: number;
};

export type TicketStatus = 'open' | 'in_progress' | 'closed';
export type Ticket = {
  _id?: TableId<'tickets'>;
  orgId: TableId<'organizations'>;
  createdBy: TableId<'users'>;
  assigneeId?: TableId<'users'>;
  status: TicketStatus;
  priority?: string;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
};

export type TicketComment = {
  _id?: TableId<'ticket_comments'>;
  ticketId: TableId<'tickets'>;
  authorId: TableId<'users'>;
  body: string;
  createdAt: number;
};

export type AgentJobStatus = 'queued' | 'claimed' | 'completed' | 'failed';
export type AgentJob = {
  _id?: TableId<'agent_jobs'>;
  type: string;
  status: AgentJobStatus;
  payload: unknown;
  createdAt: number;
  claimedAt?: number;
  completedAt?: number;
  claimedBy?: TableId<'users'>;
  result?: unknown;
  error?: string;
  priority?: number;
};


