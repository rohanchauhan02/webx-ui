import { storage } from "../../storage";
import { workflowExecutor } from "../workflowExecutor";
import cron from 'node-cron';

// Store for active cron jobs
const activeJobs = new Map<string, cron.ScheduledTask>();

/**
 * Setup scheduler for time-based workflow triggers
 */
export function setupScheduler(): void {
  console.log('Initializing workflow scheduler');
  
  // Schedule recurring task to check for workflows with schedule triggers
  cron.schedule('* * * * *', async () => {
    try {
      await checkScheduledWorkflows();
    } catch (error) {
      console.error('Error checking scheduled workflows:', error);
    }
  });
  
  console.log('Workflow scheduler initialized');
}

/**
 * Check for workflows with schedule triggers
 */
async function checkScheduledWorkflows(): Promise<void> {
  // In a real implementation, this would query a database for workflows
  // with schedule triggers that need to be executed
  
  const workflows = await storage.getWorkflows();
  
  for (const workflow of workflows) {
    if (workflow.status !== 'active') {
      continue;
    }
    
    // Look for schedule trigger nodes
    const scheduleTriggers = findScheduleTriggers(workflow.nodes);
    
    for (const trigger of scheduleTriggers) {
      const jobId = `workflow_${workflow.id}_node_${trigger.id}`;
      
      // Skip if job is already scheduled
      if (activeJobs.has(jobId)) {
        continue;
      }
      
      // Schedule the workflow based on the trigger configuration
      scheduleWorkflow(jobId, workflow.id, trigger);
    }
  }
}

/**
 * Find schedule trigger nodes in a workflow
 * @param nodes Workflow nodes
 * @returns Array of schedule trigger nodes
 */
function findScheduleTriggers(nodes: any[]): any[] {
  return nodes.filter(node => 
    node.data?.type === 'trigger' && 
    node.data?.subtype === 'schedule'
  );
}

/**
 * Schedule a workflow based on a trigger node
 * @param jobId Unique ID for the job
 * @param workflowId Workflow ID
 * @param trigger Trigger node with schedule configuration
 */
function scheduleWorkflow(jobId: string, workflowId: number, trigger: any): void {
  const config = trigger.data?.config || {};
  const scheduleType = config.scheduleType || 'interval';
  
  console.log(`Scheduling workflow ${workflowId} with trigger ${trigger.id}, type: ${scheduleType}`);
  
  if (scheduleType === 'cron' && config.cron) {
    // Schedule using cron expression
    try {
      const job = cron.schedule(config.cron, async () => {
        await executeScheduledWorkflow(workflowId);
      });
      
      activeJobs.set(jobId, job);
      console.log(`Scheduled workflow ${workflowId} with cron: ${config.cron}`);
    } catch (error) {
      console.error(`Invalid cron expression for workflow ${workflowId}:`, error);
    }
  } else if (scheduleType === 'interval') {
    // Schedule at regular intervals
    const interval = config.interval || 5;
    const unit = config.intervalUnit || 'minutes';
    
    // Convert interval to cron expression
    let cronExpression: string;
    
    switch (unit) {
      case 'seconds':
        // Note: cron-node doesn't support seconds precision less than 1 minute
        // So we'll use setInterval for seconds
        if (interval < 60) {
          const milliseconds = interval * 1000;
          const intervalId = setInterval(async () => {
            await executeScheduledWorkflow(workflowId);
          }, milliseconds);
          
          // Store interval ID as a custom object that matches ScheduledTask interface
          activeJobs.set(jobId, {
            stop: () => clearInterval(intervalId),
            start: () => {}, // No-op, already started
          } as cron.ScheduledTask);
          
          console.log(`Scheduled workflow ${workflowId} to run every ${interval} seconds`);
          return;
        }
        cronExpression = `*/${Math.min(interval, 59)} * * * * *`;
        break;
        
      case 'minutes':
        cronExpression = `*/${Math.min(interval, 59)} * * * *`;
        break;
        
      case 'hours':
        cronExpression = `0 */${Math.min(interval, 23)} * * *`;
        break;
        
      case 'days':
        cronExpression = `0 0 */${Math.min(interval, 31)} * *`;
        break;
        
      default:
        cronExpression = `*/${Math.min(interval, 59)} * * * *`;
    }
    
    try {
      const job = cron.schedule(cronExpression, async () => {
        await executeScheduledWorkflow(workflowId);
      });
      
      activeJobs.set(jobId, job);
      console.log(`Scheduled workflow ${workflowId} with interval: ${interval} ${unit} (${cronExpression})`);
    } catch (error) {
      console.error(`Error scheduling workflow ${workflowId} with interval:`, error);
    }
  } else if (scheduleType === 'fixed' && config.fixedTime) {
    // Schedule at a fixed time
    const fixedTime = new Date(config.fixedTime);
    
    if (isNaN(fixedTime.getTime())) {
      console.error(`Invalid fixed time for workflow ${workflowId}: ${config.fixedTime}`);
      return;
    }
    
    const now = new Date();
    
    // If the time is in the past, don't schedule
    if (fixedTime <= now) {
      console.log(`Fixed time ${config.fixedTime} is in the past, not scheduling workflow ${workflowId}`);
      return;
    }
    
    // Calculate delay in milliseconds
    const delay = fixedTime.getTime() - now.getTime();
    
    // Schedule a one-time execution
    const timeoutId = setTimeout(async () => {
      await executeScheduledWorkflow(workflowId);
      activeJobs.delete(jobId);
    }, delay);
    
    // Store timeout ID as a custom object that matches ScheduledTask interface
    activeJobs.set(jobId, {
      stop: () => clearTimeout(timeoutId),
      start: () => {}, // No-op, already started
    } as cron.ScheduledTask);
    
    console.log(`Scheduled workflow ${workflowId} to run at ${fixedTime.toISOString()}`);
  }
}

/**
 * Execute a scheduled workflow
 * @param workflowId Workflow ID
 */
async function executeScheduledWorkflow(workflowId: number): Promise<void> {
  try {
    console.log(`Executing scheduled workflow ${workflowId}`);
    
    const workflow = await storage.getWorkflow(workflowId);
    
    if (!workflow || workflow.status !== 'active') {
      console.log(`Workflow ${workflowId} not found or not active, skipping execution`);
      return;
    }
    
    // Create execution record
    const execution = await storage.createWorkflowExecution({
      workflowId,
      status: "running",
      data: { _source: "scheduler", _timestamp: new Date().toISOString() },
    });
    
    // Execute workflow
    workflowExecutor.executeWorkflow(workflow, execution).catch(error => {
      console.error(`Scheduled workflow execution ${execution.id} failed:`, error);
    });
  } catch (error) {
    console.error(`Error executing scheduled workflow ${workflowId}:`, error);
  }
}

/**
 * Stop a scheduled job
 * @param jobId Job ID
 * @returns Boolean indicating if the job was stopped
 */
export function stopScheduledJob(jobId: string): boolean {
  const job = activeJobs.get(jobId);
  
  if (job) {
    job.stop();
    activeJobs.delete(jobId);
    console.log(`Stopped scheduled job ${jobId}`);
    return true;
  }
  
  console.log(`Job ${jobId} not found, cannot stop`);
  return false;
}

/**
 * Get all active scheduled jobs
 * @returns Map of active jobs
 */
export function getActiveJobs(): Map<string, cron.ScheduledTask> {
  return activeJobs;
}
