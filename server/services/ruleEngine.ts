import { Engine, Rule } from 'json-rules-engine';

interface RuleOptions {
  conditions: any;
  event: any;
  priority?: number;
}

export class RuleEngine {
  private engine: Engine;

  constructor() {
    this.engine = new Engine();
  }

  /**
   * Add a rule to the engine
   * @param options Rule options including conditions and event
   * @returns Rule object
   */
  addRule(options: RuleOptions): Rule {
    const rule = new Rule({
      conditions: options.conditions,
      event: options.event,
      priority: options.priority || 1
    });
    this.engine.addRule(rule);
    return rule;
  }

  /**
   * Remove a rule from the engine
   * @param rule Rule object to remove
   */
  removeRule(rule: Rule): void {
    this.engine.removeRule(rule);
  }

  /**
   * Run the rule engine with the given facts
   * @param facts Object containing facts to evaluate rules against
   * @returns Promise with the events that were triggered
   */
  async run(facts: Record<string, any>): Promise<any[]> {
    try {
      const results = await this.engine.run(facts);
      return results.events;
    } catch (error) {
      console.error('Error running rule engine:', error);
      throw error;
    }
  }

  /**
   * Evaluate a single condition expression
   * @param condition JavaScript condition as string
   * @param data Data to evaluate against
   * @returns Boolean result of condition evaluation
   */
  evaluateCondition(condition: string, data: Record<string, any>): boolean {
    try {
      // Create a function that evaluates the condition with the data context
      // This is safer than using eval directly
      const func = new Function('data', `return (${condition});`);
      return !!func(data);
    } catch (error) {
      console.error(`Error evaluating condition "${condition}":`, error);
      return false;
    }
  }

  /**
   * Parse a simple condition into a json-rules-engine compatible format
   * @param condition Simple condition string like "data.value > 10"
   * @returns Structured condition object for json-rules-engine
   */
  parseCondition(condition: string): any {
    // This is a simplified parser for demonstration
    // In a real-world scenario, this would use a proper parser
    
    // Try to detect some common patterns
    if (condition.includes('==') || condition.includes('===')) {
      const parts = condition.includes('===') 
        ? condition.split('===') 
        : condition.split('==');
      
      const left = parts[0].trim();
      const right = parts[1].trim();
      
      return {
        "all": [{
          "fact": "data",
          "path": left.replace('data.', ''),
          "operator": "equal",
          "value": this.parseValue(right)
        }]
      };
    }
    
    if (condition.includes('>')) {
      const parts = condition.split('>');
      const left = parts[0].trim();
      const right = parts[1].trim();
      
      return {
        "all": [{
          "fact": "data",
          "path": left.replace('data.', ''),
          "operator": "greaterThan",
          "value": this.parseValue(right)
        }]
      };
    }
    
    if (condition.includes('<')) {
      const parts = condition.split('<');
      const left = parts[0].trim();
      const right = parts[1].trim();
      
      return {
        "all": [{
          "fact": "data",
          "path": left.replace('data.', ''),
          "operator": "lessThan",
          "value": this.parseValue(right)
        }]
      };
    }
    
    // Default - use direct evaluation
    return {
      "all": [{
        "fact": "rawCondition",
        "operator": "equal",
        "value": true
      }]
    };
  }
  
  /**
   * Parse a value from string to appropriate JavaScript type
   */
  private parseValue(val: string): any {
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (val === 'null') return null;
    if (val === 'undefined') return undefined;
    
    // Try to parse as number
    const num = Number(val);
    if (!isNaN(num)) return num;
    
    // Remove quotes for strings
    if ((val.startsWith('"') && val.endsWith('"')) || 
        (val.startsWith("'") && val.endsWith("'"))) {
      return val.substring(1, val.length - 1);
    }
    
    return val;
  }
}

// Export a singleton instance
export const ruleEngine = new RuleEngine();
