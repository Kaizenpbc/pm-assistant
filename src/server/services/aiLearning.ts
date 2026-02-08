import { FastifyInstance } from 'fastify';

export interface LearningData {
  projectType: string;
  projectDescription: string;
  generatedTasks: any[];
  userFeedback: {
    acceptedTasks: string[];
    rejectedTasks: string[];
    modifiedTasks: any[];
    actualDurations?: Record<string, number>;
    actualComplexities?: Record<string, string>;
  };
  timestamp: string;
}

export interface LearningInsights {
  projectTypeAccuracy: Record<string, number>;
  taskEstimationAccuracy: Record<string, number>;
  complexityAccuracy: Record<string, number>;
  riskAccuracy: Record<string, number>;
  popularTaskPatterns: Record<string, any[]>;
  improvementSuggestions: string[];
}

export class AILearningService {
  private fastify: FastifyInstance;
  private learningData: LearningData[] = [];

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.loadLearningData();
  }

  /**
   * Records user feedback for learning
   */
  async recordFeedback(learningData: LearningData): Promise<void> {
    try {
      this.learningData.push(learningData);
      await this.saveLearningData();
      
      // Generate insights after recording feedback
      const insights = await this.generateInsights();
      this.fastify.log.info({ insights }, 'AI Learning insights updated');
      
    } catch (error) {
      this.fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Error recording AI learning feedback');
    }
  }

  /**
   * Gets learning insights for improving AI suggestions
   */
  async getLearningInsights(): Promise<LearningInsights> {
    return this.generateInsights();
  }

  /**
   * Applies learned patterns to improve task suggestions
   */
  async applyLearning(taskSuggestions: any[], projectType: string, projectDescription: string): Promise<any[]> {
    const insights = await this.generateInsights();
    const improvedTasks = [...taskSuggestions];

    // Apply project type accuracy improvements
    if (insights.projectTypeAccuracy[projectType] < 0.7) {
      this.fastify.log.info(`Low accuracy for project type ${projectType}, applying corrections`);
    }

    // Apply task estimation improvements
    improvedTasks.forEach(task => {
      const categoryKey = `${projectType}_${task.category}`;
      if (insights.taskEstimationAccuracy[categoryKey]) {
        const accuracy = insights.taskEstimationAccuracy[categoryKey];
        if (accuracy < 0.8) {
          // Adjust estimates based on learning
          task.estimatedDays = this.adjustEstimateBasedOnLearning(task.estimatedDays, categoryKey);
        }
      }
    });

    // Apply complexity improvements
    improvedTasks.forEach(task => {
      const complexityKey = `${projectType}_${task.category}_${task.complexity}`;
      if (insights.complexityAccuracy[complexityKey] < 0.8) {
        task.complexity = this.adjustComplexityBasedOnLearning(task.complexity, complexityKey);
      }
    });

    // Add popular task patterns
    const popularPatterns = insights.popularTaskPatterns[projectType] || [];
    if (popularPatterns.length > 0) {
      this.addPopularTasks(improvedTasks, popularPatterns);
    }

    return improvedTasks;
  }

  /**
   * Generates learning insights from collected data
   */
  private async generateInsights(): Promise<LearningInsights> {
    const insights: LearningInsights = {
      projectTypeAccuracy: {},
      taskEstimationAccuracy: {},
      complexityAccuracy: {},
      riskAccuracy: {},
      popularTaskPatterns: {},
      improvementSuggestions: []
    };

    // Calculate project type accuracy
    const projectTypeGroups = this.groupBy(this.learningData, 'projectType');
    Object.keys(projectTypeGroups).forEach(type => {
      const typeData = projectTypeGroups[type];
      const accuracy = this.calculateProjectTypeAccuracy(typeData);
      insights.projectTypeAccuracy[type] = accuracy;
    });

    // Calculate task estimation accuracy (use temp arrays, then convert to averages)
    const taskEstimationAcc: Record<string, number[]> = {};
    this.learningData.forEach(data => {
      if (data.userFeedback.actualDurations) {
        data.generatedTasks.forEach(task => {
          const categoryKey = `${data.projectType}_${task.category}`;
          const actualDuration = data.userFeedback.actualDurations![task.id];
          if (actualDuration) {
            const accuracy = 1 - Math.abs(task.estimatedDays - actualDuration) / task.estimatedDays;
            if (!taskEstimationAcc[categoryKey]) taskEstimationAcc[categoryKey] = [];
            taskEstimationAcc[categoryKey].push(accuracy);
          }
        });
      }
    });
    Object.keys(taskEstimationAcc).forEach(key => {
      const values = taskEstimationAcc[key];
      insights.taskEstimationAccuracy[key] = values.reduce((a, b) => a + b, 0) / values.length;
    });

    // Calculate complexity accuracy
    const complexityAcc: Record<string, number[]> = {};
    this.learningData.forEach(data => {
      if (data.userFeedback.actualComplexities) {
        data.generatedTasks.forEach(task => {
          const complexityKey = `${data.projectType}_${task.category}_${task.complexity}`;
          const actualComplexity = data.userFeedback.actualComplexities![task.id];
          if (actualComplexity) {
            const isCorrect = task.complexity === actualComplexity;
            if (!complexityAcc[complexityKey]) complexityAcc[complexityKey] = [];
            complexityAcc[complexityKey].push(isCorrect ? 1 : 0);
          }
        });
      }
    });
    Object.keys(complexityAcc).forEach(key => {
      const values = complexityAcc[key];
      insights.complexityAccuracy[key] = values.reduce((a, b) => a + b, 0) / values.length;
    });

    // Find popular task patterns
    Object.keys(projectTypeGroups).forEach(type => {
      const tasks = projectTypeGroups[type].flatMap(data => data.generatedTasks);
      insights.popularTaskPatterns[type] = this.findPopularTasks(tasks);
    });

    // Generate improvement suggestions
    insights.improvementSuggestions = this.generateImprovementSuggestions(insights);

    return insights;
  }

  /**
   * Calculates project type accuracy based on user feedback
   */
  private calculateProjectTypeAccuracy(typeData: LearningData[]): number {
    // This would analyze if the AI correctly identified the project type
    // For now, return a placeholder value
    return 0.85;
  }

  /**
   * Adjusts estimates based on learning data
   */
  private adjustEstimateBasedOnLearning(originalEstimate: number, categoryKey: string): number {
    // Apply learning-based adjustments
    // For now, return the original estimate
    return originalEstimate;
  }

  /**
   * Adjusts complexity based on learning data
   */
  private adjustComplexityBasedOnLearning(originalComplexity: string, complexityKey: string): string {
    // Apply learning-based adjustments
    // For now, return the original complexity
    return originalComplexity;
  }

  /**
   * Adds popular tasks based on learning patterns
   */
  private addPopularTasks(tasks: any[], popularPatterns: any[]): void {
    // Add popular tasks that are missing from the current suggestion
    popularPatterns.forEach(pattern => {
      const exists = tasks.some(task => task.name === pattern.name);
      if (!exists) {
        tasks.push(pattern);
      }
    });
  }

  /**
   * Finds popular tasks across learning data
   */
  private findPopularTasks(tasks: any[]): any[] {
    const taskCounts = new Map<string, number>();
    const taskData = new Map<string, any>();

    tasks.forEach(task => {
      const key = task.name;
      taskCounts.set(key, (taskCounts.get(key) || 0) + 1);
      taskData.set(key, task);
    });

    // Return tasks that appear frequently
    return Array.from(taskCounts.entries())
      .filter(([_, count]) => count >= 2)
      .map(([name, _]) => taskData.get(name))
      .slice(0, 5); // Top 5 popular tasks
  }

  /**
   * Generates improvement suggestions based on insights
   */
  private generateImprovementSuggestions(insights: LearningInsights): string[] {
    const suggestions: string[] = [];

    // Check project type accuracy
    Object.entries(insights.projectTypeAccuracy).forEach(([type, accuracy]) => {
      if (accuracy < 0.8) {
        suggestions.push(`Improve project type detection for ${type} projects (current accuracy: ${(accuracy * 100).toFixed(1)}%)`);
      }
    });

    // Check task estimation accuracy
    Object.entries(insights.taskEstimationAccuracy).forEach(([category, accuracy]) => {
      if (accuracy < 0.8) {
        suggestions.push(`Improve time estimation for ${category} tasks (current accuracy: ${(accuracy * 100).toFixed(1)}%)`);
      }
    });

    // Check complexity accuracy
    Object.entries(insights.complexityAccuracy).forEach(([complexity, accuracy]) => {
      if (accuracy < 0.8) {
        suggestions.push(`Improve complexity assessment for ${complexity} tasks (current accuracy: ${(accuracy * 100).toFixed(1)}%)`);
      }
    });

    return suggestions;
  }

  /**
   * Groups data by a specific key
   */
  private groupBy(array: any[], key: string): Record<string, any[]> {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  /**
   * Loads learning data from storage (placeholder)
   */
  private async loadLearningData(): Promise<void> {
    // In a real implementation, this would load from a database
    // For now, we'll use in-memory storage
    this.learningData = [];
  }

  /**
   * Saves learning data to storage (placeholder)
   */
  private async saveLearningData(): Promise<void> {
    // In a real implementation, this would save to a database
    // For now, we'll use in-memory storage
    this.fastify.log.info(`Saving ${this.learningData.length} learning records`);
  }
}
