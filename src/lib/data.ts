export type ProjectStatus = 'active' | 'paused' | 'draft'

export interface Workflow {
  id: string
  name: string
  description: string
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  createdAt: string
  lastRun: string | null
  workflows: Workflow[]
}

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Fraud Detection API',
    description: 'Monitors fraud detection model health and triggers remediation',
    status: 'active',
    createdAt: '2026-01-15',
    lastRun: '2026-04-05 14:32',
    workflows: [
      { id: '1-1', name: 'GPU Utilization Guard', description: 'Scale down when GPU < 20%', createdAt: '2026-01-20' },
      { id: '1-2', name: 'Latency Monitor', description: 'Rollback if latency > 500ms', createdAt: '2026-02-01' },
      { id: '1-3', name: 'Data Drift Retrainer', description: 'Retrain on drift score > 0.5', createdAt: '2026-02-10' },
    ]
  },
  {
    id: '2',
    name: 'Text Classification Model',
    description: 'NLP model for customer support ticket classification',
    status: 'active',
    createdAt: '2026-02-01',
    lastRun: '2026-04-06 09:10',
    workflows: [
      { id: '2-1', name: 'Accuracy Drop Alert', description: 'Alert when accuracy < 85%', createdAt: '2026-02-05' },
      { id: '2-2', name: 'Auto Retrainer', description: 'Trigger retraining pipeline weekly', createdAt: '2026-02-15' },
    ]
  },
  {
    id: '3',
    name: 'Stock Price Prediction',
    description: 'Time series model for stock price forecasting',
    status: 'paused',
    createdAt: '2026-02-20',
    lastRun: '2026-03-28 11:45',
    workflows: [
      { id: '3-1', name: 'Market Hours Monitor', description: 'Pause inference outside market hours', createdAt: '2026-02-25' },
    ]
  },
  {
    id: '4',
    name: 'Recommendation Engine',
    description: 'Collaborative filtering model for product recommendations',
    status: 'draft',
    createdAt: '2026-03-10',
    lastRun: null,
    workflows: []
  },
]

export const NODE_TYPES_CONFIG = [
  { type: 'trigger',   label: 'Trigger',          color: '#e63946', category: 'trigger',    description: 'Starts the workflow on a metric event' },
  { type: 'scale',     label: 'Scale Deployment', color: '#3a86ff', category: 'action',     description: 'Scale replicas up or down' },
  { type: 'rollback',  label: 'Rollback',         color: '#ffbe0b', category: 'action',     description: 'Roll back to previous model version' },
  { type: 'retrain',   label: 'Retrain',          color: '#2ec4b6', category: 'action',     description: 'Trigger retraining pipeline' },
  { type: 'alert',     label: 'Send Alert',       color: '#8338ec', category: 'action',     description: 'Send Slack or email notification' },
  { type: 'wait',      label: 'Wait',             color: '#7b8db0', category: 'logic',      description: 'Wait for specified duration' },
  { type: 'condition', label: 'If / Else',        color: '#ff6b35', category: 'logic',      description: 'Branch based on condition' },
  { type: 'approval',  label: 'Human Approval',   color: '#06d6a0', category: 'governance', description: 'Pause for human approval via Slack' },
]