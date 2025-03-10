import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { workflowExecutor } from "./services/workflowExecutor";
import { getRecommendations } from "./services/recommendations";
import { setupScheduler } from "./services/integrations/scheduler";
import { setupWebhooks } from "./services/integrations/webhook";
import { z } from "zod";
import { insertWorkflowSchema, insertWorkflowExecutionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup webhook server
  setupWebhooks(app);
  
  // Initialize scheduler
  setupScheduler();

  // Workflows API
  app.get("/api/workflows", async (req, res) => {
    try {
      const workflows = await storage.getWorkflows();
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      res.status(500).json({ message: "Failed to fetch workflows" });
    }
  });

  app.get("/api/workflows/:id", async (req, res) => {
    try {
      const workflowId = parseInt(req.params.id);
      if (isNaN(workflowId)) {
        return res.status(400).json({ message: "Invalid workflow ID" });
      }

      const workflow = await storage.getWorkflow(workflowId);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      res.json(workflow);
    } catch (error) {
      console.error("Error fetching workflow:", error);
      res.status(500).json({ message: "Failed to fetch workflow" });
    }
  });

  app.post("/api/workflows", async (req, res) => {
    try {
      const validatedData = insertWorkflowSchema.parse(req.body);
      const workflow = await storage.createWorkflow(validatedData);
      res.status(201).json(workflow);
    } catch (error) {
      console.error("Error creating workflow:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workflow data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workflow" });
    }
  });

  app.put("/api/workflows/:id", async (req, res) => {
    try {
      const workflowId = parseInt(req.params.id);
      if (isNaN(workflowId)) {
        return res.status(400).json({ message: "Invalid workflow ID" });
      }

      const validatedData = insertWorkflowSchema.partial().parse(req.body);
      const workflow = await storage.updateWorkflow(workflowId, validatedData);
      
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      res.json(workflow);
    } catch (error) {
      console.error("Error updating workflow:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workflow data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update workflow" });
    }
  });

  app.delete("/api/workflows/:id", async (req, res) => {
    try {
      const workflowId = parseInt(req.params.id);
      if (isNaN(workflowId)) {
        return res.status(400).json({ message: "Invalid workflow ID" });
      }

      const success = await storage.deleteWorkflow(workflowId);
      if (!success) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting workflow:", error);
      res.status(500).json({ message: "Failed to delete workflow" });
    }
  });

  // Workflow execution
  app.post("/api/workflows/:id/run", async (req, res) => {
    try {
      const workflowId = parseInt(req.params.id);
      if (isNaN(workflowId)) {
        return res.status(400).json({ message: "Invalid workflow ID" });
      }

      const workflow = await storage.getWorkflow(workflowId);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      // Create execution record
      const execution = await storage.createWorkflowExecution({
        workflowId,
        status: "running",
        data: req.body.data || {},
      });

      // Start workflow execution (non-blocking)
      workflowExecutor.executeWorkflow(workflow, execution, req.body.data || {}).catch(error => {
        console.error(`Workflow execution ${execution.id} failed:`, error);
      });

      res.json({ 
        message: "Workflow execution started", 
        executionId: execution.id 
      });
    } catch (error) {
      console.error("Error running workflow:", error);
      res.status(500).json({ message: "Failed to run workflow" });
    }
  });

  // Workflow execution history
  app.get("/api/workflow-executions", async (req, res) => {
    try {
      const executions = await storage.getWorkflowExecutions();
      
      // Add workflow name to each execution
      const result = await Promise.all(executions.map(async (execution) => {
        const workflow = await storage.getWorkflow(execution.workflowId);
        return {
          ...execution,
          workflowName: workflow?.name || "Unknown Workflow"
        };
      }));
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching workflow executions:", error);
      res.status(500).json({ message: "Failed to fetch workflow executions" });
    }
  });

  app.get("/api/workflow-executions/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const executions = await storage.getRecentExecutions(limit);
      
      // Add workflow name to each execution
      const result = await Promise.all(executions.map(async (execution) => {
        const workflow = await storage.getWorkflow(execution.workflowId);
        return {
          ...execution,
          workflowName: workflow?.name || "Unknown Workflow"
        };
      }));
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching recent executions:", error);
      res.status(500).json({ message: "Failed to fetch recent executions" });
    }
  });

  app.get("/api/workflows/:id/executions", async (req, res) => {
    try {
      const workflowId = parseInt(req.params.id);
      if (isNaN(workflowId)) {
        return res.status(400).json({ message: "Invalid workflow ID" });
      }

      const workflow = await storage.getWorkflow(workflowId);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      const executions = await storage.getExecutionsByWorkflowId(workflowId);
      
      // Add workflow name to each execution
      const result = executions.map(execution => ({
        ...execution,
        workflowName: workflow.name
      }));
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching workflow executions:", error);
      res.status(500).json({ message: "Failed to fetch workflow executions" });
    }
  });

  app.get("/api/workflow-executions/:id", async (req, res) => {
    try {
      const executionId = parseInt(req.params.id);
      if (isNaN(executionId)) {
        return res.status(400).json({ message: "Invalid execution ID" });
      }

      const execution = await storage.getWorkflowExecution(executionId);
      if (!execution) {
        return res.status(404).json({ message: "Execution not found" });
      }

      const workflow = await storage.getWorkflow(execution.workflowId);
      
      res.json({
        ...execution,
        workflowName: workflow?.name || "Unknown Workflow"
      });
    } catch (error) {
      console.error("Error fetching workflow execution:", error);
      res.status(500).json({ message: "Failed to fetch workflow execution" });
    }
  });

  app.get("/api/workflow-executions/:id/nodes", async (req, res) => {
    try {
      const executionId = parseInt(req.params.id);
      if (isNaN(executionId)) {
        return res.status(400).json({ message: "Invalid execution ID" });
      }

      const nodeExecutions = await storage.getNodeExecutions(executionId);
      res.json(nodeExecutions);
    } catch (error) {
      console.error("Error fetching node executions:", error);
      res.status(500).json({ message: "Failed to fetch node executions" });
    }
  });

  // Workflow templates
  app.get("/api/workflows/templates", async (req, res) => {
    try {
      const templates = await storage.getWorkflowTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching workflow templates:", error);
      res.status(500).json({ message: "Failed to fetch workflow templates" });
    }
  });

  app.get("/api/workflows/templates/:id", async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      if (isNaN(templateId)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }

      const template = await storage.getWorkflowTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error fetching workflow template:", error);
      res.status(500).json({ message: "Failed to fetch workflow template" });
    }
  });

  // Workflow recommendations
  app.post("/api/workflows/recommendations", async (req, res) => {
    try {
      const { nodes, edges } = req.body;
      if (!nodes || !Array.isArray(nodes)) {
        return res.status(400).json({ message: "Invalid nodes data" });
      }

      const recommendations = await getRecommendations(nodes, edges);
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ message: "Failed to get recommendations" });
    }
  });

  return httpServer;
}
