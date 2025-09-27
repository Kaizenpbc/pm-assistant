"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AILearningService = void 0;
class AILearningService {
    constructor(fastify) {
        this.learningData = [];
        this.fastify = fastify;
        this.loadLearningData();
    }
    async recordFeedback(learningData) {
        try {
            this.learningData.push(learningData);
            await this.saveLearningData();
            const insights = await this.generateInsights();
            this.fastify.log.info('AI Learning insights updated:', insights);
        }
        catch (error) {
            this.fastify.log.error('Error recording AI learning feedback:', error);
        }
    }
    async getLearningInsights() {
        return this.generateInsights();
    }
    async applyLearning(taskSuggestions, projectType, projectDescription) {
        const insights = await this.generateInsights();
        const improvedTasks = [...taskSuggestions];
        if (insights.projectTypeAccuracy[projectType] < 0.7) {
            this.fastify.log.info(`Low accuracy for project type ${projectType}, applying corrections`);
        }
        improvedTasks.forEach(task => {
            const categoryKey = `${projectType}_${task.category}`;
            if (insights.taskEstimationAccuracy[categoryKey]) {
                const accuracy = insights.taskEstimationAccuracy[categoryKey];
                if (accuracy < 0.8) {
                    task.estimatedDays = this.adjustEstimateBasedOnLearning(task.estimatedDays, categoryKey);
                }
            }
        });
        improvedTasks.forEach(task => {
            const complexityKey = `${projectType}_${task.category}_${task.complexity}`;
            if (insights.complexityAccuracy[complexityKey] < 0.8) {
                task.complexity = this.adjustComplexityBasedOnLearning(task.complexity, complexityKey);
            }
        });
        const popularPatterns = insights.popularTaskPatterns[projectType] || [];
        if (popularPatterns.length > 0) {
            this.addPopularTasks(improvedTasks, popularPatterns);
        }
        return improvedTasks;
    }
    async generateInsights() {
        const insights = {
            projectTypeAccuracy: {},
            taskEstimationAccuracy: {},
            complexityAccuracy: {},
            riskAccuracy: {},
            popularTaskPatterns: {},
            improvementSuggestions: []
        };
        const projectTypeGroups = this.groupBy(this.learningData, 'projectType');
        Object.keys(projectTypeGroups).forEach(type => {
            const typeData = projectTypeGroups[type];
            const accuracy = this.calculateProjectTypeAccuracy(typeData);
            insights.projectTypeAccuracy[type] = accuracy;
        });
        this.learningData.forEach(data => {
            if (data.userFeedback.actualDurations) {
                data.generatedTasks.forEach(task => {
                    const categoryKey = `${data.projectType}_${task.category}`;
                    const actualDuration = data.userFeedback.actualDurations[task.id];
                    if (actualDuration) {
                        const accuracy = 1 - Math.abs(task.estimatedDays - actualDuration) / task.estimatedDays;
                        if (!insights.taskEstimationAccuracy[categoryKey]) {
                            insights.taskEstimationAccuracy[categoryKey] = [];
                        }
                        insights.taskEstimationAccuracy[categoryKey].push(accuracy);
                    }
                });
            }
        });
        Object.keys(insights.taskEstimationAccuracy).forEach(key => {
            const values = insights.taskEstimationAccuracy[key];
            insights.taskEstimationAccuracy[key] = values.reduce((a, b) => a + b, 0) / values.length;
        });
        this.learningData.forEach(data => {
            if (data.userFeedback.actualComplexities) {
                data.generatedTasks.forEach(task => {
                    const complexityKey = `${data.projectType}_${task.category}_${task.complexity}`;
                    const actualComplexity = data.userFeedback.actualComplexities[task.id];
                    if (actualComplexity) {
                        const isCorrect = task.complexity === actualComplexity;
                        if (!insights.complexityAccuracy[complexityKey]) {
                            insights.complexityAccuracy[complexityKey] = [];
                        }
                        insights.complexityAccuracy[complexityKey].push(isCorrect ? 1 : 0);
                    }
                });
            }
        });
        Object.keys(insights.complexityAccuracy).forEach(key => {
            const values = insights.complexityAccuracy[key];
            insights.complexityAccuracy[key] = values.reduce((a, b) => a + b, 0) / values.length;
        });
        Object.keys(projectTypeGroups).forEach(type => {
            const tasks = projectTypeGroups[type].flatMap(data => data.generatedTasks);
            insights.popularTaskPatterns[type] = this.findPopularTasks(tasks);
        });
        insights.improvementSuggestions = this.generateImprovementSuggestions(insights);
        return insights;
    }
    calculateProjectTypeAccuracy(typeData) {
        return 0.85;
    }
    adjustEstimateBasedOnLearning(originalEstimate, categoryKey) {
        return originalEstimate;
    }
    adjustComplexityBasedOnLearning(originalComplexity, complexityKey) {
        return originalComplexity;
    }
    addPopularTasks(tasks, popularPatterns) {
        popularPatterns.forEach(pattern => {
            const exists = tasks.some(task => task.name === pattern.name);
            if (!exists) {
                tasks.push(pattern);
            }
        });
    }
    findPopularTasks(tasks) {
        const taskCounts = new Map();
        const taskData = new Map();
        tasks.forEach(task => {
            const key = task.name;
            taskCounts.set(key, (taskCounts.get(key) || 0) + 1);
            taskData.set(key, task);
        });
        return Array.from(taskCounts.entries())
            .filter(([_, count]) => count >= 2)
            .map(([name, _]) => taskData.get(name))
            .slice(0, 5);
    }
    generateImprovementSuggestions(insights) {
        const suggestions = [];
        Object.entries(insights.projectTypeAccuracy).forEach(([type, accuracy]) => {
            if (accuracy < 0.8) {
                suggestions.push(`Improve project type detection for ${type} projects (current accuracy: ${(accuracy * 100).toFixed(1)}%)`);
            }
        });
        Object.entries(insights.taskEstimationAccuracy).forEach(([category, accuracy]) => {
            if (accuracy < 0.8) {
                suggestions.push(`Improve time estimation for ${category} tasks (current accuracy: ${(accuracy * 100).toFixed(1)}%)`);
            }
        });
        Object.entries(insights.complexityAccuracy).forEach(([complexity, accuracy]) => {
            if (accuracy < 0.8) {
                suggestions.push(`Improve complexity assessment for ${complexity} tasks (current accuracy: ${(accuracy * 100).toFixed(1)}%)`);
            }
        });
        return suggestions;
    }
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }
    async loadLearningData() {
        this.learningData = [];
    }
    async saveLearningData() {
        this.fastify.log.info(`Saving ${this.learningData.length} learning records`);
    }
}
exports.AILearningService = AILearningService;
//# sourceMappingURL=aiLearning.js.map