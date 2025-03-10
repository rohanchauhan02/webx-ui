import { Workflow, WorkflowExecution } from "@shared/schema";
import { storage } from "../storage";
import { ruleEngine } from "./ruleEngine";
import { sendEmail } from "./integrations/email";
import { makeWebhookRequest } from "./integrations/webhook";

class WorkflowExecutor {
  /**
   * Execute a workflow
   * @param workflow Workflow to execute
   * @param execution Execution record
   * @param initialData Initial data for the workflow
   */
  async executeWorkflow(
    workflow: Workflow,
    execution: WorkflowExecution,
    initialData: Record<string, any> = {}
  ): Promise<void> {
    console.log(`Starting workflow execution ${execution.id} for workflow ${workflow.id}`);
    
    try {
      // Find start nodes (nodes without incoming edges)
      const startNodes = this.findStartNodes(workflow.nodes, workflow.edges);
      
      if (startNodes.length === 0) {
        throw new Error("No start nodes found in workflow");
      }
      
      // Initialize workflow data
      let workflowData = { ...initialData };
      
      // Start execution from each start node
      for (const startNode of startNodes) {
        workflowData = await this.executeNode(workflow, execution, startNode, workflowData);
      }
      
      // Mark execution as completed
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - new Date(execution.startedAt).getTime()) / 1000);
      
      await storage.updateWorkflowExecution(execution.id, {
        status: "completed",
        completedAt: endTime,
        duration,
        data: workflowData
      });
      
      console.log(`Workflow execution ${execution.id} completed successfully`);
    } catch (error) {
      console.error(`Error executing workflow ${workflow.id}:`, error);
      
      // Mark execution as failed
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - new Date(execution.startedAt).getTime()) / 1000);
      
      await storage.updateWorkflowExecution(execution.id, {
        status: "failed",
        completedAt: endTime,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  /**
   * Execute a single node in the workflow
   * @param workflow Workflow containing the node
   * @param execution Execution record
   * @param node Node to execute
   * @param data Current workflow data
   * @returns Updated workflow data
   */
  private async executeNode(
    workflow: Workflow,
    execution: WorkflowExecution,
    node: any,
    data: Record<string, any>
  ): Promise<Record<string, any>> {
    // Skip nodes marked for skipping
    if (node.data.config?.skipExecution) {
      console.log(`Skipping node ${node.id} (${node.data.label}) as configured`);
      return data;
    }
    
    try {
      console.log(`Executing node ${node.id} (${node.data.label})`);
      
      // Create node execution record
      const nodeExecution = await storage.createNodeExecution({
        executionId: execution.id,
        nodeId: node.id,
        nodeName: node.data.label,
        status: "running",
        input: data,
      });
      
      // Execute node based on its type
      let result: Record<string, any> = {};
      const startTime = Date.now();
      
      switch (node.data.subtype) {
        case "condition":
          result = await this.executeConditionNode(workflow, execution, node, data);
          break;
        case "loop":
          result = await this.executeLoopNode(workflow, execution, node, data);
          break;
        case "email":
          result = await this.executeEmailNode(node, data);
          break;
        case "webhook":
          result = await this.executeWebhookNode(node, data);
          break;
        case "database":
          result = await this.executeDatabaseNode(node, data);
          break;
        case "slack":
          result = await this.executeSlackNode(node, data);
          break;
        case "schedule":
          result = await this.executeScheduleNode(node, data);
          break;
        default:
          console.log(`Unknown node type: ${node.data.subtype}`);
          result = data;
      }
      
      // Calculate duration in milliseconds
      const duration = Date.now() - startTime;
      
      // Update node execution record
      await storage.updateNodeExecution(nodeExecution.id, {
        status: "completed",
        completedAt: new Date(),
        duration,
        output: result,
      });
      
      // Merge node result with workflow data
      const updatedData = {
        ...data,
        [node.id]: result,
      };
      
      // Find and execute child nodes
      const childNodes = this.findChildNodes(workflow.nodes, workflow.edges, node.id);
      
      for (const childNode of childNodes) {
        // Check if this is a conditional path
        const edge = workflow.edges.find(e => e.source === node.id && e.target === childNode.id);
        
        // If edge has a label (e.g., "True" or "False"), check condition
        if (edge && edge.label) {
          if (
            (edge.label === "True" && !result.conditionResult) ||
            (edge.label === "False" && result.conditionResult)
          ) {
            // Skip this path if condition doesn't match
            continue;
          }
        }
        
        // Execute child node
        await this.executeNode(workflow, execution, childNode, updatedData);
      }
      
      return updatedData;
    } catch (error) {
      console.error(`Error executing node ${node.id} (${node.data.label}):`, error);
      
      // Create or update node execution record
      const nodeExecutions = await storage.getNodeExecutions(execution.id);
      const nodeExecution = nodeExecutions.find(ne => ne.nodeId === node.id);
      
      if (nodeExecution) {
        await storage.updateNodeExecution(nodeExecution.id, {
          status: "failed",
          completedAt: new Date(),
          duration: Date.now() - new Date(nodeExecution.startedAt).getTime(),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      
      // Check error handling strategy
      const errorHandling = node.data.config?.errorHandling || "abort";
      
      if (errorHandling === "abort") {
        throw error; // Stop workflow execution
      } else if (errorHandling === "retry") {
        // Basic retry logic - retry up to 3 times
        const retryCount = (data._retryCount?.[node.id] || 0) + 1;
        
        if (retryCount <= 3) {
          console.log(`Retrying node ${node.id} (${node.data.label}), attempt ${retryCount}`);
          
          // Update retry count
          const retryData = {
            ...data,
            _retryCount: {
              ...data._retryCount,
              [node.id]: retryCount
            }
          };
          
          // Wait a short time before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          
          return this.executeNode(workflow, execution, node, retryData);
        }
        
        // If all retries fail and we're here, continue with execution
        console.log(`All retries failed for node ${node.id}, continuing workflow`);
        return data;
      }
      
      // For "continue" error handling or after retry failures
      return data;
    }
  }
  
  /**
   * Execute a condition node
   */
  private async executeConditionNode(
    workflow: Workflow,
    execution: WorkflowExecution,
    node: any,
    data: Record<string, any>
  ): Promise<Record<string, any>> {
    const condition = node.data.config?.condition;
    
    if (!condition) {
      return { conditionResult: false, error: "No condition specified" };
    }
    
    // Evaluate the condition
    const result = ruleEngine.evaluateCondition(condition, data);
    return { conditionResult: result };
  }
  
  /**
   * Execute a loop node
   */
  private async executeLoopNode(
    workflow: Workflow,
    execution: WorkflowExecution,
    node: any,
    data: Record<string, any>
  ): Promise<Record<string, any>> {
    const loopType = node.data.config?.loopType || "collection";
    const maxIterations = node.data.config?.maxIterations || 100;
    let iterations = 0;
    let results: any[] = [];
    
    if (loopType === "collection") {
      const collectionPath = node.data.config?.collection || "data.items";
      // Extract collection from data using path
      const collection = this.getValueByPath(data, collectionPath) || [];
      
      if (!Array.isArray(collection)) {
        return { error: "Collection is not an array", iterations: 0, results: [] };
      }
      
      // Process each item in collection
      for (let i = 0; i < collection.length && i < maxIterations; i++) {
        iterations++;
        const item = collection[i];
        const itemData = { ...data, currentItem: item, index: i };
        
        // Find child nodes
        const childNodes = this.findChildNodes(workflow.nodes, workflow.edges, node.id);
        
        // Execute each child node
        for (const childNode of childNodes) {
          const result = await this.executeNode(workflow, execution, childNode, itemData);
          results.push(result);
        }
      }
    } else if (loopType === "count") {
      const count = parseInt(node.data.config?.count) || 5;
      
      // Execute loop for specified count
      for (let i = 0; i < count && i < maxIterations; i++) {
        iterations++;
        const itemData = { ...data, index: i };
        
        // Find child nodes
        const childNodes = this.findChildNodes(workflow.nodes, workflow.edges, node.id);
        
        // Execute each child node
        for (const childNode of childNodes) {
          const result = await this.executeNode(workflow, execution, childNode, itemData);
          results.push(result);
        }
      }
    } else if (loopType === "while") {
      const whileCondition = node.data.config?.whileCondition;
      
      if (!whileCondition) {
        return { error: "No while condition specified", iterations: 0, results: [] };
      }
      
      // Execute loop while condition is true
      let currentData = { ...data };
      
      while (iterations < maxIterations) {
        // Check condition
        const conditionResult = ruleEngine.evaluateCondition(whileCondition, currentData);
        
        if (!conditionResult) {
          break;
        }
        
        iterations++;
        currentData = { ...currentData, index: iterations - 1 };
        
        // Find child nodes
        const childNodes = this.findChildNodes(workflow.nodes, workflow.edges, node.id);
        
        // Execute each child node
        for (const childNode of childNodes) {
          const result = await this.executeNode(workflow, execution, childNode, currentData);
          results.push(result);
          currentData = { ...currentData, ...result };
        }
      }
    }
    
    return { iterations, results };
  }
  
  /**
   * Execute an email node
   */
  private async executeEmailNode(
    node: any,
    data: Record<string, any>
  ): Promise<Record<string, any>> {
    const config = node.data.config || {};
    
    // Interpolate template values in email fields
    const recipient = this.interpolateTemplate(config.recipient, data);
    const subject = this.interpolateTemplate(config.subject, data);
    const body = this.interpolateTemplate(config.body, data);
    
    // Send email
    const result = await sendEmail({
      to: recipient,
      subject,
      body,
      service: config.service || "smtp"
    });
    
    return result;
  }
  
  /**
   * Execute a webhook node
   */
  private async executeWebhookNode(
    node: any,
    data: Record<string, any>
  ): Promise<Record<string, any>> {
    const config = node.data.config || {};
    
    // Parse headers
    let headers: Record<string, string> = {};
    
    try {
      if (config.headers) {
        if (typeof config.headers === 'string') {
          headers = JSON.parse(config.headers);
        } else {
          headers = config.headers;
        }
      }
    } catch (error) {
      console.error("Error parsing webhook headers:", error);
    }
    
    // Make webhook request
    const result = await makeWebhookRequest({
      url: config.url,
      method: config.method || "GET",
      headers,
      body: config.body ? this.interpolateTemplate(config.body, data) : undefined
    });
    
    // Extract response data if path specified
    if (config.responseMapping && result.response) {
      try {
        const mapping = config.responseMapping;
        return this.extractMappedData(result.response, mapping);
      } catch (error) {
        console.error("Error mapping response data:", error);
        return result;
      }
    }
    
    return result;
  }
  
  /**
   * Execute a database node
   */
  private async executeDatabaseNode(
    node: any,
    data: Record<string, any>
  ): Promise<Record<string, any>> {
    // This is a simplified mock implementation
    // In a real application, this would connect to a database
    const config = node.data.config || {};
    
    console.log(`Executing database operation: ${config.operation}`);
    console.log(`Query: ${config.query}`);
    
    // Simulate database operations
    if (config.operation === "query") {
      return {
        success: true,
        message: "Query executed successfully",
        results: [] // Mock result set
      };
    } else if (config.operation === "insert") {
      return {
        success: true,
        message: "Data inserted successfully",
        insertId: Math.floor(Math.random() * 1000)
      };
    } else if (config.operation === "update") {
      return {
        success: true,
        message: "Data updated successfully",
        affectedRows: Math.floor(Math.random() * 5) + 1
      };
    } else if (config.operation === "delete") {
      return {
        success: true,
        message: "Data deleted successfully",
        affectedRows: Math.floor(Math.random() * 5) + 1
      };
    }
    
    return {
      success: false,
      message: "Unsupported database operation"
    };
  }
  
  /**
   * Execute a Slack node
   */
  private async executeSlackNode(
    node: any,
    data: Record<string, any>
  ): Promise<Record<string, any>> {
    // This is a simplified mock implementation
    // In a real application, this would use Slack API
    const config = node.data.config || {};
    
    console.log(`Sending Slack message to ${config.channel}`);
    
    // Interpolate template values
    const message = this.interpolateTemplate(config.message, data);
    
    return {
      success: true,
      message: "Slack notification sent successfully",
      details: {
        channel: config.channel,
        username: config.username || "Workflow Bot",
        messagePreview: message.substring(0, 50) + (message.length > 50 ? "..." : "")
      }
    };
  }
  
  /**
   * Execute a schedule node
   */
  private async executeScheduleNode(
    node: any,
    data: Record<string, any>
  ): Promise<Record<string, any>> {
    // Schedule nodes are primarily handled by the scheduler service
    // This just simulates the execution of the schedule node itself
    const config = node.data.config || {};
    
    console.log(`Schedule node executed with type: ${config.scheduleType}`);
    
    if (config.scheduleType === "interval") {
      const interval = config.interval || 5;
      const unit = config.intervalUnit || "minutes";
      
      return {
        success: true,
        message: `Scheduled to run every ${interval} ${unit}`,
        nextRun: this.calculateNextRun(interval, unit)
      };
    } else if (config.scheduleType === "cron") {
      return {
        success: true,
        message: `Scheduled with cron expression: ${config.cron}`,
        cronExpression: config.cron
      };
    } else if (config.scheduleType === "fixed") {
      return {
        success: true,
        message: `Scheduled to run at fixed time: ${config.fixedTime}`,
        scheduledTime: config.fixedTime
      };
    }
    
    return {
      success: false,
      message: "Unsupported schedule type"
    };
  }
  
  /**
   * Find nodes without incoming edges (start nodes)
   */
  private findStartNodes(nodes: any[], edges: any[]): any[] {
    return nodes.filter(node => {
      // A node is a start node if it has no incoming edges
      return !edges.some(edge => edge.target === node.id);
    });
  }
  
  /**
   * Find child nodes connected to the given node
   */
  private findChildNodes(nodes: any[], edges: any[], nodeId: string): any[] {
    const childNodeIds = edges
      .filter(edge => edge.source === nodeId)
      .map(edge => edge.target);
    
    return nodes.filter(node => childNodeIds.includes(node.id));
  }
  
  /**
   * Interpolate template values in a string
   * @param template Template string with {{ variable }} placeholders
   * @param data Data object with values to substitute
   * @returns Interpolated string
   */
  private interpolateTemplate(template: string, data: Record<string, any>): string {
    if (!template) return '';
    
    return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, path) => {
      const value = this.getValueByPath(data, path.trim());
      return value !== undefined ? String(value) : match;
    });
  }
  
  /**
   * Get a value from an object using a dot-notation path
   */
  private getValueByPath(obj: any, path: string): any {
    if (!path) return undefined;
    
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      
      current = current[part];
    }
    
    return current;
  }
  
  /**
   * Extract data from an object using a mapping
   */
  private extractMappedData(obj: any, mapping: string): any {
    if (!mapping) return obj;
    
    return this.getValueByPath(obj, mapping);
  }
  
  /**
   * Calculate next run time based on interval
   */
  private calculateNextRun(interval: number, unit: string): Date {
    const now = new Date();
    const next = new Date(now);
    
    switch (unit) {
      case "seconds":
        next.setSeconds(now.getSeconds() + interval);
        break;
      case "minutes":
        next.setMinutes(now.getMinutes() + interval);
        break;
      case "hours":
        next.setHours(now.getHours() + interval);
        break;
      case "days":
        next.setDate(now.getDate() + interval);
        break;
      default:
        next.setMinutes(now.getMinutes() + interval);
    }
    
    return next;
  }
}

export const workflowExecutor = new WorkflowExecutor();
