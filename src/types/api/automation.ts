// Automation/Workflow Types

export type WorkflowStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ERROR';
export type NodeType = 'TRIGGER' | 'ACTION' | 'CONDITION' | 'DELAY' | 'LOOP' | 'WEBHOOK';
export type TriggerType = 'EVENT' | 'WEBHOOK' | 'SCHEDULE' | 'MANUAL';
export type ActionType = 'SEND_EMAIL' | 'CREATE_RECORD' | 'UPDATE_RECORD' | 'DELETE_RECORD' | 'WEBHOOK' | 'NOTIFICATION';

export interface WorkflowResponse {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  variables?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  runCount: number;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  data?: Record<string, any>;
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  variables?: Record<string, any>;
}

export interface WorkflowExecutionResponse {
  id: string;
  workflowId: string;
  workflow?: WorkflowResponse;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  logs: WorkflowLog[];
  error?: string;
}

export interface WorkflowLog {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  nodeId?: string;
  data?: Record<string, any>;
}

export interface WorkflowTemplateResponse {
  id: string;
  name: string;
  description?: string;
  category: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  preview?: string;
}

