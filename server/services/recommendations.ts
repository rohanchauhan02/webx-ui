import { storage } from "../storage";

/**
 * Extract node types from workflow nodes
 * @param nodes Workflow nodes
 * @returns Array of node types (subtypes)
 */
function extractNodeTypes(nodes: any[]): string[] {
  if (!nodes || !Array.isArray(nodes)) {
    return [];
  }
  
  return nodes
    .map(node => node.data?.subtype)
    .filter(Boolean);
}

/**
 * Extract node categories from workflow nodes
 * @param nodes Workflow nodes
 * @returns Array of node categories (types)
 */
function extractNodeCategories(nodes: any[]): string[] {
  if (!nodes || !Array.isArray(nodes)) {
    return [];
  }
  
  return nodes
    .map(node => node.data?.type)
    .filter(Boolean);
}

/**
 * Analyze workflow structure to identify patterns
 * @param nodes Workflow nodes
 * @param edges Workflow edges
 * @returns Object with pattern analysis
 */
function analyzeWorkflowStructure(nodes: any[], edges: any[]): any {
  const analysis = {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    hasConditionals: false,
    hasLoops: false,
    hasParallelPaths: false,
    nodeTypes: new Set<string>(),
    complexity: 'simple',
  };
  
  // Check for node types
  nodes.forEach(node => {
    if (node.data?.subtype) {
      analysis.nodeTypes.add(node.data.subtype);
    }
    
    if (node.data?.subtype === 'condition') {
      analysis.hasConditionals = true;
    }
    
    if (node.data?.subtype === 'loop') {
      analysis.hasLoops = true;
    }
  });
  
  // Check for parallel paths
  const outgoingEdgeCounts = new Map<string, number>();
  
  edges.forEach(edge => {
    const source = edge.source;
    outgoingEdgeCounts.set(source, (outgoingEdgeCounts.get(source) || 0) + 1);
  });
  
  // If any node has more than one outgoing edge, workflow has parallel paths
  outgoingEdgeCounts.forEach(count => {
    if (count > 1) {
      analysis.hasParallelPaths = true;
    }
  });
  
  // Determine complexity
  if (analysis.nodeCount > 10 || analysis.hasConditionals && analysis.hasLoops) {
    analysis.complexity = 'complex';
  } else if (analysis.nodeCount > 5 || analysis.hasConditionals || analysis.hasLoops) {
    analysis.complexity = 'medium';
  }
  
  return analysis;
}

/**
 * Get workflow template recommendations based on current workflow
 * @param nodes Current workflow nodes
 * @param edges Current workflow edges
 * @returns Array of recommended templates
 */
export async function getRecommendations(nodes: any[], edges: any[] = []): Promise<any[]> {
  // Extract node types from the workflow
  const nodeTypes = extractNodeTypes(nodes);
  const nodeCategories = extractNodeCategories(nodes);
  
  // Analyze workflow structure
  const analysis = analyzeWorkflowStructure(nodes, edges);
  
  // Get recommended templates from storage
  const recommendedTemplates = await storage.getRecommendedTemplates([
    ...nodeTypes,
    ...nodeCategories,
    analysis.complexity,
  ]);
  
  // If no workflows are similar enough, return popular templates
  if (recommendedTemplates.length === 0) {
    return await storage.getWorkflowTemplates();
  }
  
  return recommendedTemplates;
}

/**
 * Generate recommendations based on user behavior and workflow patterns
 * This is a more sophisticated recommendation engine that would use
 * machine learning in a production environment
 */
export function generateRecommendations(userHistory: any[], workflowHistory: any[]): any[] {
  // This is a simplified version - in a real system this would use ML algorithms
  
  // Mock recommendations
  const recommendations = [
    {
      id: 1,
      name: "Customer Onboarding",
      description: "Automate your customer welcome process with personalized emails and follow-ups.",
      icon: "ri-mail-line",
      color: "blue",
      nodeCount: 6,
      tags: ["Email", "Slack", "CRM"],
      confidence: 0.92
    },
    {
      id: 2,
      name: "Data Sync Pipeline",
      description: "Keep your systems in sync with scheduled data transfers and transformations.",
      icon: "ri-database-2-line",
      color: "green",
      nodeCount: 4,
      tags: ["Database", "API", "Scheduler"],
      confidence: 0.87
    },
    {
      id: 3,
      name: "Document Approval Flow",
      description: "Set up a structured approval process for documents with notifications.",
      icon: "ri-file-list-line",
      color: "orange",
      nodeCount: 5,
      tags: ["Email", "Condition", "Webhook"],
      confidence: 0.78
    }
  ];
  
  return recommendations;
}
