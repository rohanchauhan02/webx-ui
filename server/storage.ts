import {
  Workflow,
  InsertWorkflow,
  WorkflowExecution,
  InsertWorkflowExecution,
  NodeExecution,
  InsertNodeExecution,
  WorkflowTemplate,
  InsertWorkflowTemplate,
} from "@shared/schema";

export interface IStorage {
  // Workflow methods
  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;
  
  // Workflow execution methods
  getWorkflowExecutions(): Promise<WorkflowExecution[]>;
  getWorkflowExecution(id: number): Promise<WorkflowExecution | undefined>;
  getExecutionsByWorkflowId(workflowId: number): Promise<WorkflowExecution[]>;
  getRecentExecutions(limit?: number): Promise<WorkflowExecution[]>;
  createWorkflowExecution(execution: InsertWorkflowExecution): Promise<WorkflowExecution>;
  updateWorkflowExecution(id: number, execution: Partial<WorkflowExecution>): Promise<WorkflowExecution | undefined>;
  
  // Node execution methods
  getNodeExecutions(executionId: number): Promise<NodeExecution[]>;
  createNodeExecution(execution: InsertNodeExecution): Promise<NodeExecution>;
  updateNodeExecution(id: number, execution: Partial<NodeExecution>): Promise<NodeExecution | undefined>;
  
  // Template methods
  getWorkflowTemplates(): Promise<WorkflowTemplate[]>;
  getWorkflowTemplate(id: number): Promise<WorkflowTemplate | undefined>;
  getRecommendedTemplates(nodeTypes: string[]): Promise<WorkflowTemplate[]>;
  createWorkflowTemplate(template: InsertWorkflowTemplate): Promise<WorkflowTemplate>;
}

export class MemStorage implements IStorage {
  private workflows: Map<number, Workflow>;
  private workflowExecutions: Map<number, WorkflowExecution>;
  private nodeExecutions: Map<number, NodeExecution>;
  private workflowTemplates: Map<number, WorkflowTemplate>;
  private workflowId: number;
  private executionId: number;
  private nodeExecutionId: number;
  private templateId: number;

  constructor() {
    this.workflows = new Map();
    this.workflowExecutions = new Map();
    this.nodeExecutions = new Map();
    this.workflowTemplates = new Map();
    this.workflowId = 1;
    this.executionId = 1;
    this.nodeExecutionId = 1;
    this.templateId = 1;
    
    // Initialize with sample templates
    this.initSampleTemplates();
  }

  // Workflow methods
  async getWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values());
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const id = this.workflowId++;
    const now = new Date();
    const newWorkflow: Workflow = {
      ...workflow,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.workflows.set(id, newWorkflow);
    return newWorkflow;
  }

  async updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const existingWorkflow = this.workflows.get(id);
    if (!existingWorkflow) return undefined;

    const updatedWorkflow = {
      ...existingWorkflow,
      ...workflow,
      updatedAt: new Date(),
    };
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    return this.workflows.delete(id);
  }

  // Workflow execution methods
  async getWorkflowExecutions(): Promise<WorkflowExecution[]> {
    return Array.from(this.workflowExecutions.values());
  }

  async getWorkflowExecution(id: number): Promise<WorkflowExecution | undefined> {
    return this.workflowExecutions.get(id);
  }

  async getExecutionsByWorkflowId(workflowId: number): Promise<WorkflowExecution[]> {
    return Array.from(this.workflowExecutions.values()).filter(
      (execution) => execution.workflowId === workflowId
    );
  }

  async getRecentExecutions(limit: number = 10): Promise<WorkflowExecution[]> {
    return Array.from(this.workflowExecutions.values())
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limit);
  }

  async createWorkflowExecution(execution: InsertWorkflowExecution): Promise<WorkflowExecution> {
    const id = this.executionId++;
    const newExecution: WorkflowExecution = {
      ...execution,
      id,
      startedAt: new Date(),
      completedAt: null,
      duration: null,
      error: null,
    };
    this.workflowExecutions.set(id, newExecution);
    return newExecution;
  }

  async updateWorkflowExecution(id: number, execution: Partial<WorkflowExecution>): Promise<WorkflowExecution | undefined> {
    const existingExecution = this.workflowExecutions.get(id);
    if (!existingExecution) return undefined;

    const updatedExecution = {
      ...existingExecution,
      ...execution,
    };
    this.workflowExecutions.set(id, updatedExecution);
    return updatedExecution;
  }

  // Node execution methods
  async getNodeExecutions(executionId: number): Promise<NodeExecution[]> {
    return Array.from(this.nodeExecutions.values()).filter(
      (execution) => execution.executionId === executionId
    );
  }

  async createNodeExecution(execution: InsertNodeExecution): Promise<NodeExecution> {
    const id = this.nodeExecutionId++;
    const newExecution: NodeExecution = {
      ...execution,
      id,
      startedAt: new Date(),
      completedAt: null,
      duration: null,
      output: {},
      error: null,
    };
    this.nodeExecutions.set(id, newExecution);
    return newExecution;
  }

  async updateNodeExecution(id: number, execution: Partial<NodeExecution>): Promise<NodeExecution | undefined> {
    const existingExecution = this.nodeExecutions.get(id);
    if (!existingExecution) return undefined;

    const updatedExecution = {
      ...existingExecution,
      ...execution,
    };
    this.nodeExecutions.set(id, updatedExecution);
    return updatedExecution;
  }

  // Template methods
  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    return Array.from(this.workflowTemplates.values());
  }

  async getWorkflowTemplate(id: number): Promise<WorkflowTemplate | undefined> {
    return this.workflowTemplates.get(id);
  }

  async getRecommendedTemplates(nodeTypes: string[]): Promise<WorkflowTemplate[]> {
    // Simple recommendation algorithm based on node types
    if (!nodeTypes || nodeTypes.length === 0) {
      return Array.from(this.workflowTemplates.values())
        .filter(template => template.isRecommended)
        .slice(0, 4);
    }
    
    const templates = Array.from(this.workflowTemplates.values());
    
    // Calculate a simple match score based on tag matching
    const scoredTemplates = templates.map(template => {
      let score = 0;
      
      // Check if tags match any of the nodeTypes
      for (const tag of template.tags) {
        if (nodeTypes.includes(tag)) {
          score += 1;
        }
      }
      
      return { template, score };
    });
    
    // Sort by score and return top 4
    return scoredTemplates
      .sort((a, b) => b.score - a.score)
      .map(item => item.template)
      .slice(0, 4);
  }

  async createWorkflowTemplate(template: InsertWorkflowTemplate): Promise<WorkflowTemplate> {
    const id = this.templateId++;
    const newTemplate: WorkflowTemplate = {
      ...template,
      id,
      createdAt: new Date(),
    };
    this.workflowTemplates.set(id, newTemplate);
    return newTemplate;
  }
  
  // Initialize sample templates
  private initSampleTemplates() {
    const templates: InsertWorkflowTemplate[] = [
      {
        name: "Customer Onboarding",
        description: "Automate your customer welcome process with personalized emails and follow-ups.",
        nodes: [
          {
            id: "trigger1",
            type: "custom",
            position: { x: 250, y: 100 },
            data: {
              label: "New Customer Trigger",
              type: "trigger",
              subtype: "webhook",
              icon: "ri-webhook-line",
              color: "purple",
              config: {
                method: "POST",
                url: "/webhook/new-customer"
              }
            }
          },
          {
            id: "email1",
            type: "custom",
            position: { x: 250, y: 250 },
            data: {
              label: "Welcome Email",
              type: "action",
              subtype: "email",
              icon: "ri-mail-line",
              color: "blue",
              config: {
                service: "smtp",
                recipient: "{{ data.email }}",
                subject: "Welcome to Our Service",
                body: "Hello {{ data.name }},\n\nWelcome to our service! We're excited to have you onboard.\n\nBest regards,\nThe Team"
              }
            }
          },
          {
            id: "delay1",
            type: "custom",
            position: { x: 250, y: 400 },
            data: {
              label: "3 Day Delay",
              type: "logic",
              subtype: "delay",
              icon: "ri-time-line",
              color: "blue",
              config: {
                delay: 3,
                unit: "days"
              }
            }
          },
          {
            id: "email2",
            type: "custom",
            position: { x: 250, y: 550 },
            data: {
              label: "Follow-up Email",
              type: "action",
              subtype: "email",
              icon: "ri-mail-line",
              color: "blue",
              config: {
                service: "smtp",
                recipient: "{{ data.email }}",
                subject: "How's it going?",
                body: "Hello {{ data.name }},\n\nHow are you finding our service so far? We'd love to hear your feedback!\n\nBest regards,\nThe Team"
              }
            }
          },
          {
            id: "slack1",
            type: "custom",
            position: { x: 500, y: 250 },
            data: {
              label: "Slack Notification",
              type: "action",
              subtype: "slack",
              icon: "ri-slack-line",
              color: "purple",
              config: {
                channel: "#new-customers",
                message: "New customer: {{ data.name }} ({{ data.email }})",
                username: "Onboarding Bot"
              }
            }
          }
        ],
        edges: [
          { source: "trigger1", target: "email1", id: "e1-2" },
          { source: "trigger1", target: "slack1", id: "e1-5" },
          { source: "email1", target: "delay1", id: "e2-3" },
          { source: "delay1", target: "email2", id: "e3-4" }
        ],
        icon: "ri-mail-line",
        color: "blue",
        nodeCount: 5,
        tags: ["email", "webhook", "slack"],
        isRecommended: true
      },
      {
        name: "Data Sync Pipeline",
        description: "Keep your systems in sync with scheduled data transfers and transformations.",
        nodes: [
          {
            id: "trigger1",
            type: "custom",
            position: { x: 250, y: 100 },
            data: {
              label: "Scheduled Sync",
              type: "trigger",
              subtype: "schedule",
              icon: "ri-time-line",
              color: "blue",
              config: {
                scheduleType: "cron",
                cron: "0 */3 * * *"  // Every 3 hours
              }
            }
          },
          {
            id: "db1",
            type: "custom",
            position: { x: 250, y: 250 },
            data: {
              label: "Fetch Source Data",
              type: "action",
              subtype: "database",
              icon: "ri-database-2-line",
              color: "green",
              config: {
                operation: "query",
                query: "SELECT * FROM source_table WHERE updated_at > :lastSync"
              }
            }
          },
          {
            id: "condition1",
            type: "custom",
            position: { x: 250, y: 400 },
            data: {
              label: "Has Data?",
              type: "logic",
              subtype: "condition",
              icon: "ri-git-branch-line",
              color: "orange",
              config: {
                condition: "data.length > 0"
              }
            }
          },
          {
            id: "db2",
            type: "custom",
            position: { x: 250, y: 550 },
            data: {
              label: "Update Target DB",
              type: "action",
              subtype: "database",
              icon: "ri-database-2-line",
              color: "green",
              config: {
                operation: "insert",
                query: "INSERT INTO target_table (id, name, value) VALUES (:id, :name, :value)"
              }
            }
          }
        ],
        edges: [
          { source: "trigger1", target: "db1", id: "e1-2" },
          { source: "db1", target: "condition1", id: "e2-3" },
          { source: "condition1", target: "db2", id: "e3-4" }
        ],
        icon: "ri-database-2-line",
        color: "green",
        nodeCount: 4,
        tags: ["database", "schedule"],
        isRecommended: true
      },
      {
        name: "Approval Workflow",
        description: "Create a multi-step approval process with notifications and conditional branches.",
        nodes: [
          {
            id: "trigger1",
            type: "custom",
            position: { x: 250, y: 100 },
            data: {
              label: "Form Submission",
              type: "trigger",
              subtype: "webhook",
              icon: "ri-webhook-line",
              color: "purple",
              config: {
                method: "POST",
                url: "/webhook/approval-request"
              }
            }
          },
          {
            id: "email1",
            type: "custom",
            position: { x: 250, y: 250 },
            data: {
              label: "Notify Approver",
              type: "action",
              subtype: "email",
              icon: "ri-mail-line",
              color: "blue",
              config: {
                service: "smtp",
                recipient: "{{ data.approverEmail }}",
                subject: "Approval Required: {{ data.requestTitle }}",
                body: "A new request requires your approval:\n\nRequest: {{ data.requestTitle }}\nRequested by: {{ data.requesterName }}\n\nPlease review and approve or reject."
              }
            }
          },
          {
            id: "condition1",
            type: "custom",
            position: { x: 250, y: 400 },
            data: {
              label: "Check Approval",
              type: "logic",
              subtype: "condition",
              icon: "ri-git-branch-line",
              color: "orange",
              config: {
                condition: "data.approved === true"
              }
            }
          },
          {
            id: "email2",
            type: "custom",
            position: { x: 100, y: 550 },
            data: {
              label: "Send Approval",
              type: "action",
              subtype: "email",
              icon: "ri-mail-line",
              color: "blue",
              config: {
                service: "smtp",
                recipient: "{{ data.requesterEmail }}",
                subject: "Request Approved: {{ data.requestTitle }}",
                body: "Your request has been approved."
              }
            }
          },
          {
            id: "email3",
            type: "custom",
            position: { x: 400, y: 550 },
            data: {
              label: "Send Rejection",
              type: "action",
              subtype: "email",
              icon: "ri-mail-line",
              color: "blue",
              config: {
                service: "smtp",
                recipient: "{{ data.requesterEmail }}",
                subject: "Request Rejected: {{ data.requestTitle }}",
                body: "Your request has been rejected.\n\nReason: {{ data.rejectionReason }}"
              }
            }
          }
        ],
        edges: [
          { source: "trigger1", target: "email1", id: "e1-2" },
          { source: "email1", target: "condition1", id: "e2-3" },
          { source: "condition1", target: "email2", id: "e3-4", label: "True" },
          { source: "condition1", target: "email3", id: "e3-5", label: "False" }
        ],
        icon: "ri-git-branch-line",
        color: "orange",
        nodeCount: 5,
        tags: ["email", "webhook", "condition"],
        isRecommended: true
      }
    ];
    
    templates.forEach((template, index) => {
      this.workflowTemplates.set(index + 1, {
        ...template,
        id: index + 1,
        createdAt: new Date()
      });
    });
    
    this.templateId = templates.length + 1;
  }
}

export const storage = new MemStorage();
