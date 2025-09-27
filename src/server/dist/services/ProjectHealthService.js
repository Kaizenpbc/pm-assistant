"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectHealthService = void 0;
class ProjectHealthService {
    constructor(fastify) {
        this.fastify = fastify;
    }
    calculateHealthScore(projectData) {
        const factors = this.calculateHealthFactors(projectData);
        const overallScore = this.calculateOverallScore(factors);
        const healthStatus = this.determineHealthStatus(overallScore);
        const healthColor = this.getHealthColor(overallScore);
        const recommendations = this.generateRecommendations(factors, overallScore);
        return {
            overallScore: Math.round(overallScore),
            healthStatus,
            healthColor,
            factors,
            recommendations,
            lastUpdated: new Date()
        };
    }
    calculateHealthFactors(data) {
        return {
            timelineHealth: this.calculateTimelineHealth(data),
            budgetHealth: this.calculateBudgetHealth(data),
            resourceHealth: this.calculateResourceHealth(data),
            riskHealth: this.calculateRiskHealth(data),
            progressHealth: this.calculateProgressHealth(data),
            issueHealth: this.calculateIssueHealth(data)
        };
    }
    calculateTimelineHealth(data) {
        const totalDays = Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysElapsed = Math.ceil((data.currentDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.ceil((data.endDate.getTime() - data.currentDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysElapsed <= 0) {
            return 100;
        }
        if (daysRemaining < 0) {
            return Math.max(0, 50 + (daysRemaining * 2));
        }
        const expectedProgress = (daysElapsed / totalDays) * 100;
        const actualProgress = (data.completedTasks / data.totalTasks) * 100;
        const progressAlignment = 100 - Math.abs(expectedProgress - actualProgress);
        if (actualProgress > expectedProgress) {
            return Math.min(100, progressAlignment + 10);
        }
        return Math.max(0, progressAlignment);
    }
    calculateBudgetHealth(data) {
        if (data.budgetAllocated === 0)
            return 100;
        const budgetUtilization = (data.budgetSpent / data.budgetAllocated) * 100;
        if (budgetUtilization >= 70 && budgetUtilization <= 90) {
            return 100;
        }
        if (budgetUtilization < 70) {
            return Math.max(60, 100 - (70 - budgetUtilization) * 2);
        }
        if (budgetUtilization > 90) {
            return Math.max(0, 100 - (budgetUtilization - 90) * 3);
        }
        return 100;
    }
    calculateResourceHealth(data) {
        if (data.requiredResources === 0)
            return 100;
        const resourceUtilization = (data.assignedResources / data.requiredResources) * 100;
        if (resourceUtilization >= 90 && resourceUtilization <= 110) {
            return 100;
        }
        if (resourceUtilization < 90) {
            return Math.max(0, resourceUtilization);
        }
        if (resourceUtilization > 110) {
            return Math.max(60, 100 - (resourceUtilization - 110) * 2);
        }
        return 100;
    }
    calculateRiskHealth(data) {
        const totalRisks = data.highRisks + data.mediumRisks + data.lowRisks;
        if (totalRisks === 0)
            return 100;
        const riskScore = (data.highRisks * 10) + (data.mediumRisks * 5) + (data.lowRisks * 2);
        return Math.max(0, 100 - riskScore);
    }
    calculateProgressHealth(data) {
        if (data.totalTasks === 0)
            return 100;
        return (data.completedTasks / data.totalTasks) * 100;
    }
    calculateIssueHealth(data) {
        const totalIssues = data.openIssues + data.resolvedIssues;
        if (totalIssues === 0)
            return 100;
        const issuePenalty = (data.openIssues * 5) + (data.criticalIssues * 15);
        return Math.max(0, 100 - issuePenalty);
    }
    calculateOverallScore(factors) {
        const weights = {
            timeline: 0.25,
            budget: 0.20,
            resource: 0.15,
            risk: 0.20,
            progress: 0.10,
            issue: 0.10
        };
        return (factors.timelineHealth * weights.timeline +
            factors.budgetHealth * weights.budget +
            factors.resourceHealth * weights.resource +
            factors.riskHealth * weights.risk +
            factors.progressHealth * weights.progress +
            factors.issueHealth * weights.issue);
    }
    determineHealthStatus(score) {
        if (score >= 90)
            return 'excellent';
        if (score >= 80)
            return 'good';
        if (score >= 70)
            return 'fair';
        if (score >= 60)
            return 'poor';
        return 'critical';
    }
    getHealthColor(score) {
        if (score >= 90)
            return 'green';
        if (score >= 80)
            return 'yellow';
        if (score >= 70)
            return 'orange';
        if (score >= 60)
            return 'red';
        return 'dark-red';
    }
    generateRecommendations(factors, overallScore) {
        const recommendations = [];
        if (factors.timelineHealth < 70) {
            recommendations.push('Review project timeline and identify bottlenecks');
            recommendations.push('Consider adding resources to critical path tasks');
        }
        if (factors.budgetHealth < 70) {
            if (factors.budgetHealth < 50) {
                recommendations.push('Budget overrun detected - review expenses immediately');
            }
            else {
                recommendations.push('Monitor budget closely - approaching limits');
            }
        }
        if (factors.resourceHealth < 70) {
            recommendations.push('Resource allocation needs attention');
            if (factors.resourceHealth < 50) {
                recommendations.push('Consider hiring additional team members');
            }
        }
        if (factors.riskHealth < 70) {
            recommendations.push('High number of risks identified - develop mitigation strategies');
            recommendations.push('Schedule regular risk review meetings');
        }
        if (factors.progressHealth < 70) {
            recommendations.push('Project progress is behind schedule');
            recommendations.push('Review task assignments and dependencies');
        }
        if (factors.issueHealth < 70) {
            recommendations.push('Multiple issues require immediate attention');
            recommendations.push('Implement issue tracking and resolution process');
        }
        if (overallScore < 60) {
            recommendations.push('Project health is critical - escalate to senior management');
            recommendations.push('Consider project restart or major scope reduction');
        }
        else if (overallScore < 70) {
            recommendations.push('Project needs immediate intervention');
            recommendations.push('Schedule emergency project review meeting');
        }
        return recommendations;
    }
}
exports.ProjectHealthService = ProjectHealthService;
//# sourceMappingURL=ProjectHealthService.js.map