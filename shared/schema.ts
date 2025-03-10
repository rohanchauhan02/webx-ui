import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Workflow Table
export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("draft"),
  nodes: jsonb("nodes").notNull().default([]),
  edges: jsonb("edges").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertWorkflowSchema = createInsertSchema(workflows).pick({
  name: true,
  status: true,
  nodes: true,
  edges: true,
});

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

// Workflow Execution Table
export const workflowExecutions = pgTable("workflow_executions", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull(),
  status: text("status").notNull().default("pending"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"),
  error: text("error"),
  data: jsonb("data").default({}),
});

export const insertWorkflowExecutionSchema = createInsertSchema(workflowExecutions).pick({
  workflowId: true,
  status: true,
  data: true,
});

export type InsertWorkflowExecution = z.infer<typeof insertWorkflowExecutionSchema>;
export type WorkflowExecution = typeof workflowExecutions.$inferSelect;

// Node Execution Table
export const nodeExecutions = pgTable("node_executions", {
  id: serial("id").primaryKey(),
  executionId: integer("execution_id").notNull(),
  nodeId: text("node_id").notNull(),
  nodeName: text("node_name").notNull(),
  status: text("status").notNull().default("pending"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"),
  input: jsonb("input").default({}),
  output: jsonb("output").default({}),
  error: text("error"),
});

export const insertNodeExecutionSchema = createInsertSchema(nodeExecutions).pick({
  executionId: true,
  nodeId: true,
  nodeName: true,
  status: true,
  input: true,
});

export type InsertNodeExecution = z.infer<typeof insertNodeExecutionSchema>;
export type NodeExecution = typeof nodeExecutions.$inferSelect;

// Workflow Templates Table
export const workflowTemplates = pgTable("workflow_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  nodes: jsonb("nodes").notNull(),
  edges: jsonb("edges").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull().default("blue"),
  nodeCount: integer("node_count").notNull(),
  tags: text("tags").array().notNull(),
  isRecommended: boolean("is_recommended").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWorkflowTemplateSchema = createInsertSchema(workflowTemplates).pick({
  name: true,
  description: true,
  nodes: true,
  edges: true,
  icon: true,
  color: true,
  nodeCount: true,
  tags: true,
  isRecommended: true,
});

export type InsertWorkflowTemplate = z.infer<typeof insertWorkflowTemplateSchema>;
export type WorkflowTemplate = typeof workflowTemplates.$inferSelect;
