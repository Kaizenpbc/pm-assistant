"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AITaskBreakdownService = void 0;
const aiLearning_1 = require("./aiLearning");
class AITaskBreakdownService {
    fastify;
    learningService;
    constructor(fastify) {
        this.fastify = fastify;
        this.learningService = new aiLearning_1.AILearningService(fastify);
    }
    async analyzeProject(projectDescription, projectType) {
        try {
            const analysis = await this.extractProjectInfo(projectDescription);
            let taskData = await this.generateTaskSuggestions(analysis, projectType);
            taskData.tasks = await this.learningService.applyLearning(taskData.tasks, analysis.projectType, projectDescription);
            const complexity = this.calculateProjectComplexity(taskData.tasks);
            const riskLevel = this.calculateRiskLevel(taskData.tasks);
            const criticalPath = this.identifyCriticalPath(taskData.tasks);
            const resourceRequirements = this.estimateResourceRequirements(taskData.tasks);
            const estimatedDuration = this.calculateEstimatedDuration(taskData.tasks);
            return {
                projectType: analysis.projectType,
                complexity,
                estimatedDuration,
                riskLevel,
                suggestedPhases: taskData.phases,
                taskSuggestions: taskData.tasks,
                criticalPath,
                resourceRequirements
            };
        }
        catch (error) {
            this.fastify.log.error('Error in AI task breakdown:', error);
            throw new Error('Failed to analyze project for task breakdown');
        }
    }
    async recordFeedback(feedbackData) {
        try {
            await this.learningService.recordFeedback({
                ...feedbackData,
                timestamp: new Date().toISOString()
            });
            this.fastify.log.info('AI learning feedback recorded successfully');
        }
        catch (error) {
            this.fastify.log.error('Error recording AI learning feedback:', error);
            throw new Error('Failed to record learning feedback');
        }
    }
    async getLearningInsights() {
        try {
            return await this.learningService.getLearningInsights();
        }
        catch (error) {
            this.fastify.log.error('Error getting AI learning insights:', error);
            throw new Error('Failed to get learning insights');
        }
    }
    async extractProjectInfo(description) {
        const keywords = description.toLowerCase();
        const projectTypeScores = {
            construction_project: 0,
            mobile_app: 0,
            web_application: 0,
            backend_service: 0,
            data_project: 0,
            design_project: 0,
            e_commerce: 0,
            game_development: 0,
            iot_project: 0,
            ai_ml_project: 0
        };
        if (keywords.includes('mobile app') || keywords.includes('app development') ||
            keywords.includes('ios') || keywords.includes('android') ||
            keywords.includes('react native') || keywords.includes('flutter')) {
            projectTypeScores.mobile_app += 3;
        }
        if (keywords.includes('restaurant') || keywords.includes('ordering') ||
            keywords.includes('delivery') || keywords.includes('food')) {
            projectTypeScores.mobile_app += 2;
        }
        if (keywords.includes('web') || keywords.includes('website') ||
            keywords.includes('react') || keywords.includes('vue') ||
            keywords.includes('angular') || keywords.includes('frontend')) {
            projectTypeScores.web_application += 3;
        }
        if (keywords.includes('e-commerce') || keywords.includes('shopping') ||
            keywords.includes('store') || keywords.includes('payment')) {
            projectTypeScores.e_commerce += 2;
            projectTypeScores.web_application += 1;
        }
        if (keywords.includes('api') || keywords.includes('backend') ||
            keywords.includes('microservice') || keywords.includes('server')) {
            projectTypeScores.backend_service += 3;
        }
        if (keywords.includes('database') || keywords.includes('data') ||
            keywords.includes('analytics') || keywords.includes('reporting') ||
            keywords.includes('dashboard') || keywords.includes('visualization')) {
            projectTypeScores.data_project += 3;
        }
        if (keywords.includes('ai') || keywords.includes('machine learning') ||
            keywords.includes('ml') || keywords.includes('artificial intelligence') ||
            keywords.includes('neural') || keywords.includes('model')) {
            projectTypeScores.ai_ml_project += 3;
        }
        if (keywords.includes('design') || keywords.includes('ui/ux') ||
            keywords.includes('wireframe') || keywords.includes('prototype')) {
            projectTypeScores.design_project += 3;
        }
        if (keywords.includes('game') || keywords.includes('gaming') ||
            keywords.includes('unity') || keywords.includes('unreal')) {
            projectTypeScores.game_development += 3;
        }
        if (keywords.includes('iot') || keywords.includes('internet of things') ||
            keywords.includes('sensor') || keywords.includes('embedded')) {
            projectTypeScores.iot_project += 3;
        }
        if (keywords.includes('construction') || keywords.includes('building') ||
            keywords.includes('school') || keywords.includes('dartmouth') ||
            keywords.includes('infrastructure') || keywords.includes('civil') ||
            keywords.includes('architectural') || keywords.includes('contractor') ||
            keywords.includes('foundation') || keywords.includes('structural') ||
            keywords.includes('permits') || keywords.includes('site') ||
            keywords.includes('excavation') || keywords.includes('mep')) {
            projectTypeScores.construction_project += 4;
        }
        const projectType = Object.keys(projectTypeScores).reduce((a, b) => projectTypeScores[a] > projectTypeScores[b] ? a : b);
        const phases = [];
        if (keywords.includes('planning') || keywords.includes('requirements')) {
            phases.push('Planning & Requirements');
        }
        if (keywords.includes('design') || keywords.includes('ui') || keywords.includes('ux')) {
            phases.push('Design');
        }
        if (keywords.includes('development') || keywords.includes('coding') || keywords.includes('implementation')) {
            phases.push('Development');
        }
        if (keywords.includes('testing') || keywords.includes('qa') || keywords.includes('quality')) {
            phases.push('Testing & QA');
        }
        if (keywords.includes('deployment') || keywords.includes('launch') || keywords.includes('release')) {
            phases.push('Deployment & Launch');
        }
        return { projectType, phases };
    }
    async generateTaskSuggestions(analysis, projectType) {
        const baseTasks = this.getBaseTasksForType(analysis.projectType || projectType);
        const customizedTasks = this.customizeTasksForProject(baseTasks, analysis);
        const tasksWithDependencies = this.addTaskDependencies(customizedTasks);
        const { tasks, phases } = this.organizeTasksByPhases(tasksWithDependencies, analysis.projectType || projectType);
        return { tasks, phases };
    }
    organizeTasksByPhases(tasks, projectType) {
        if (projectType === 'construction_project') {
            return this.organizeConstructionPhases(tasks);
        }
        return this.organizeDefaultPhases(tasks);
    }
    organizeConstructionPhases(tasks) {
        const phases = [
            {
                id: 'planning-phase',
                name: '📋 Planning & Design Phase',
                description: 'Initial planning, surveys, permits, and design work',
                estimatedDays: 0,
                tasks: []
            },
            {
                id: 'procurement-phase',
                name: '📦 Procurement Phase',
                description: 'Material procurement and vendor selection',
                estimatedDays: 0,
                tasks: []
            },
            {
                id: 'construction-phase',
                name: '🏗️ Construction Phase',
                description: 'Main construction activities and building work',
                estimatedDays: 0,
                tasks: []
            },
            {
                id: 'completion-phase',
                name: '✅ Completion Phase',
                description: 'Final testing, inspection, and project handover',
                estimatedDays: 0,
                tasks: []
            }
        ];
        tasks.forEach(task => {
            const category = task.category?.toLowerCase() || '';
            if (category.includes('planning') || category.includes('design') || category.includes('survey') || category.includes('permit')) {
                phases[0].tasks.push(task);
                phases[0].estimatedDays += task.estimatedDays;
            }
            else if (category.includes('procurement') || category.includes('vendor') || category.includes('material')) {
                phases[1].tasks.push(task);
                phases[1].estimatedDays += task.estimatedDays;
            }
            else if (category.includes('construction') || category.includes('building') || category.includes('foundation') || category.includes('structural') || category.includes('mep') || category.includes('interior') || category.includes('exterior')) {
                phases[2].tasks.push(task);
                phases[2].estimatedDays += task.estimatedDays;
            }
            else if (category.includes('testing') || category.includes('commissioning') || category.includes('inspection') || category.includes('handover') || category.includes('completion')) {
                phases[3].tasks.push(task);
                phases[3].estimatedDays += task.estimatedDays;
            }
            else {
                phases[2].tasks.push(task);
                phases[2].estimatedDays += task.estimatedDays;
            }
        });
        const nonEmptyPhases = phases.filter(phase => phase.tasks.length > 0);
        return { tasks, phases: nonEmptyPhases };
    }
    organizeDefaultPhases(tasks) {
        const phases = [
            {
                id: 'planning-phase',
                name: '📋 Planning Phase',
                description: 'Requirements analysis and project planning',
                estimatedDays: 0,
                tasks: []
            },
            {
                id: 'development-phase',
                name: '💻 Development Phase',
                description: 'Main development and implementation work',
                estimatedDays: 0,
                tasks: []
            },
            {
                id: 'testing-phase',
                name: '🧪 Testing Phase',
                description: 'Testing, QA, and quality assurance',
                estimatedDays: 0,
                tasks: []
            },
            {
                id: 'deployment-phase',
                name: '🚀 Deployment Phase',
                description: 'Deployment and project handover',
                estimatedDays: 0,
                tasks: []
            }
        ];
        tasks.forEach(task => {
            const category = task.category?.toLowerCase() || '';
            if (category.includes('planning') || category.includes('requirements') || category.includes('design')) {
                phases[0].tasks.push(task);
                phases[0].estimatedDays += task.estimatedDays;
            }
            else if (category.includes('development') || category.includes('implementation') || category.includes('coding')) {
                phases[1].tasks.push(task);
                phases[1].estimatedDays += task.estimatedDays;
            }
            else if (category.includes('testing') || category.includes('qa') || category.includes('quality')) {
                phases[2].tasks.push(task);
                phases[2].estimatedDays += task.estimatedDays;
            }
            else if (category.includes('deployment') || category.includes('launch') || category.includes('handover')) {
                phases[3].tasks.push(task);
                phases[3].estimatedDays += task.estimatedDays;
            }
            else {
                phases[1].tasks.push(task);
                phases[1].estimatedDays += task.estimatedDays;
            }
        });
        const nonEmptyPhases = phases.filter(phase => phase.tasks.length > 0);
        return { tasks, phases: nonEmptyPhases };
    }
    getBaseTasksForType(projectType) {
        const taskTemplates = {
            construction_project: [
                {
                    id: 'site_survey',
                    name: 'Site Survey & Analysis',
                    description: 'Conduct comprehensive site survey, soil testing, and environmental assessment',
                    estimatedDays: 5,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: [],
                    riskLevel: 25,
                    category: 'Planning',
                    skills: ['Civil Engineering', 'Surveying', 'Environmental Assessment'],
                    deliverables: ['Site Survey Report', 'Soil Test Results', 'Environmental Assessment']
                },
                {
                    id: 'permits_approvals',
                    name: 'Permits & Regulatory Approvals',
                    description: 'Obtain all necessary building permits, zoning approvals, and regulatory clearances',
                    estimatedDays: 15,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['site_survey'],
                    riskLevel: 40,
                    category: 'Planning',
                    skills: ['Regulatory Compliance', 'Permit Processing', 'Legal Documentation'],
                    deliverables: ['Building Permits', 'Zoning Approvals', 'Regulatory Clearances']
                },
                {
                    id: 'architectural_design',
                    name: 'Architectural Design & Engineering',
                    description: 'Develop detailed architectural plans, structural engineering, and MEP systems design',
                    estimatedDays: 20,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['site_survey'],
                    riskLevel: 30,
                    category: 'Design',
                    skills: ['Architecture', 'Structural Engineering', 'MEP Design'],
                    deliverables: ['Architectural Plans', 'Structural Drawings', 'MEP Systems Design']
                },
                {
                    id: 'procurement',
                    name: 'Material Procurement & Vendor Selection',
                    description: 'Source and procure construction materials, equipment, and select contractors',
                    estimatedDays: 10,
                    complexity: 'medium',
                    priority: 'high',
                    dependencies: ['architectural_design'],
                    riskLevel: 35,
                    category: 'Procurement',
                    skills: ['Procurement', 'Vendor Management', 'Cost Estimation'],
                    deliverables: ['Material Contracts', 'Vendor Agreements', 'Procurement Schedule']
                },
                {
                    id: 'site_preparation',
                    name: 'Site Preparation & Excavation',
                    description: 'Clear site, excavate foundation, and prepare construction area',
                    estimatedDays: 8,
                    complexity: 'medium',
                    priority: 'high',
                    dependencies: ['permits_approvals', 'procurement'],
                    riskLevel: 30,
                    category: 'Construction',
                    skills: ['Excavation', 'Site Preparation', 'Heavy Equipment Operation'],
                    deliverables: ['Prepared Site', 'Foundation Excavation', 'Access Roads']
                },
                {
                    id: 'foundation_work',
                    name: 'Foundation Construction',
                    description: 'Pour concrete foundation, install rebar, and complete foundation systems',
                    estimatedDays: 12,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['site_preparation'],
                    riskLevel: 35,
                    category: 'Construction',
                    skills: ['Concrete Work', 'Rebar Installation', 'Foundation Systems'],
                    deliverables: ['Concrete Foundation', 'Foundation Systems', 'Waterproofing']
                },
                {
                    id: 'structural_framing',
                    name: 'Structural Framing & Roof',
                    description: 'Erect structural steel/concrete frame, install roofing system',
                    estimatedDays: 15,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['foundation_work'],
                    riskLevel: 40,
                    category: 'Construction',
                    skills: ['Structural Framing', 'Roofing', 'Crane Operation'],
                    deliverables: ['Structural Frame', 'Roofing System', 'Weather Protection']
                },
                {
                    id: 'mep_installation',
                    name: 'MEP Systems Installation',
                    description: 'Install mechanical, electrical, and plumbing systems',
                    estimatedDays: 18,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['structural_framing'],
                    riskLevel: 35,
                    category: 'Construction',
                    skills: ['Electrical Work', 'Plumbing', 'HVAC Installation'],
                    deliverables: ['Electrical Systems', 'Plumbing Systems', 'HVAC Systems']
                },
                {
                    id: 'interior_finishing',
                    name: 'Interior Finishing & Fit-out',
                    description: 'Install drywall, flooring, fixtures, and complete interior finishes',
                    estimatedDays: 20,
                    complexity: 'medium',
                    priority: 'medium',
                    dependencies: ['mep_installation'],
                    riskLevel: 25,
                    category: 'Construction',
                    skills: ['Interior Finishing', 'Flooring', 'Fixture Installation'],
                    deliverables: ['Finished Interiors', 'Flooring', 'Lighting Fixtures']
                },
                {
                    id: 'exterior_finishing',
                    name: 'Exterior Finishing & Landscaping',
                    description: 'Complete exterior finishes, landscaping, and site improvements',
                    estimatedDays: 10,
                    complexity: 'medium',
                    priority: 'medium',
                    dependencies: ['interior_finishing'],
                    riskLevel: 20,
                    category: 'Construction',
                    skills: ['Exterior Finishing', 'Landscaping', 'Site Work'],
                    deliverables: ['Exterior Finishes', 'Landscaping', 'Parking Areas']
                },
                {
                    id: 'testing_commissioning',
                    name: 'Systems Testing & Commissioning',
                    description: 'Test all systems, conduct safety inspections, and commission building systems',
                    estimatedDays: 5,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['exterior_finishing'],
                    riskLevel: 30,
                    category: 'Testing',
                    skills: ['Systems Testing', 'Safety Inspection', 'Commissioning'],
                    deliverables: ['Test Reports', 'Safety Certificates', 'Commissioning Documents']
                },
                {
                    id: 'final_inspection',
                    name: 'Final Inspection & Handover',
                    description: 'Conduct final inspections, obtain certificates of occupancy, and handover to client',
                    estimatedDays: 3,
                    complexity: 'medium',
                    priority: 'high',
                    dependencies: ['testing_commissioning'],
                    riskLevel: 25,
                    category: 'Completion',
                    skills: ['Inspection', 'Documentation', 'Project Handover'],
                    deliverables: ['Certificate of Occupancy', 'As-Built Drawings', 'Operations Manual']
                }
            ],
            e_commerce: [
                {
                    id: 'requirements',
                    name: 'E-commerce Requirements Analysis',
                    description: 'Define business requirements, user stories, and technical specifications for e-commerce platform',
                    estimatedDays: 4,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: [],
                    riskLevel: 25,
                    category: 'Planning',
                    skills: ['Business Analysis', 'E-commerce Knowledge', 'Requirements Gathering'],
                    deliverables: ['Requirements Document', 'User Stories', 'Technical Specifications']
                },
                {
                    id: 'ui_design',
                    name: 'E-commerce UI/UX Design',
                    description: 'Design user interface for shopping experience, product pages, checkout flow, and admin dashboard',
                    estimatedDays: 6,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['requirements'],
                    riskLevel: 30,
                    category: 'Design',
                    skills: ['UI/UX Design', 'E-commerce Design', 'User Experience'],
                    deliverables: ['Wireframes', 'Mockups', 'Design System', 'Prototypes']
                },
                {
                    id: 'payment_integration',
                    name: 'Payment Gateway Integration',
                    description: 'Integrate payment processing systems and ensure secure transaction handling',
                    estimatedDays: 5,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['requirements'],
                    riskLevel: 45,
                    category: 'Development',
                    skills: ['Payment Integration', 'Security', 'API Development'],
                    deliverables: ['Payment Integration', 'Security Measures', 'Testing Suite']
                },
                {
                    id: 'backend_development',
                    name: 'E-commerce Backend Development',
                    description: 'Develop server-side logic for products, orders, inventory, and user management',
                    estimatedDays: 12,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['requirements'],
                    riskLevel: 40,
                    category: 'Development',
                    skills: ['Backend Development', 'Database Design', 'API Development'],
                    deliverables: ['Backend Services', 'Database Schema', 'API Endpoints']
                },
                {
                    id: 'frontend_development',
                    name: 'E-commerce Frontend Development',
                    description: 'Develop responsive web frontend with product catalog, cart, and checkout functionality',
                    estimatedDays: 10,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['ui_design', 'backend_development'],
                    riskLevel: 35,
                    category: 'Development',
                    skills: ['Frontend Development', 'React/Vue/Angular', 'JavaScript'],
                    deliverables: ['E-commerce Website', 'Product Catalog', 'Shopping Cart']
                },
                {
                    id: 'testing',
                    name: 'E-commerce Testing & QA',
                    description: 'Comprehensive testing including payment flows, security, and performance testing',
                    estimatedDays: 5,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['frontend_development', 'payment_integration'],
                    riskLevel: 35,
                    category: 'Testing',
                    skills: ['Testing', 'Security Testing', 'Performance Testing'],
                    deliverables: ['Test Cases', 'Security Audit', 'Performance Reports']
                },
                {
                    id: 'deployment',
                    name: 'E-commerce Deployment & Launch',
                    description: 'Deploy to production with SSL certificates, monitoring, and backup systems',
                    estimatedDays: 3,
                    complexity: 'medium',
                    priority: 'high',
                    dependencies: ['testing'],
                    riskLevel: 30,
                    category: 'Deployment',
                    skills: ['DevOps', 'SSL Configuration', 'Monitoring'],
                    deliverables: ['Production Website', 'SSL Certificates', 'Monitoring Setup']
                }
            ],
            ai_ml_project: [
                {
                    id: 'requirements',
                    name: 'AI/ML Requirements Analysis',
                    description: 'Define ML objectives, data requirements, and success metrics',
                    estimatedDays: 5,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: [],
                    riskLevel: 30,
                    category: 'Planning',
                    skills: ['Data Science', 'ML Engineering', 'Business Analysis'],
                    deliverables: ['ML Requirements', 'Success Metrics', 'Data Strategy']
                },
                {
                    id: 'data_collection',
                    name: 'Data Collection & Preparation',
                    description: 'Gather, clean, and prepare datasets for machine learning',
                    estimatedDays: 8,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['requirements'],
                    riskLevel: 40,
                    category: 'Data Engineering',
                    skills: ['Data Engineering', 'Data Cleaning', 'ETL Processes'],
                    deliverables: ['Clean Dataset', 'Data Pipeline', 'Data Documentation']
                },
                {
                    id: 'model_development',
                    name: 'ML Model Development',
                    description: 'Develop and train machine learning models',
                    estimatedDays: 12,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['data_collection'],
                    riskLevel: 45,
                    category: 'ML Development',
                    skills: ['Machine Learning', 'Python', 'ML Frameworks'],
                    deliverables: ['Trained Models', 'Model Evaluation', 'Model Documentation']
                },
                {
                    id: 'model_deployment',
                    name: 'Model Deployment & Integration',
                    description: 'Deploy ML models to production environment with API endpoints',
                    estimatedDays: 6,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['model_development'],
                    riskLevel: 40,
                    category: 'MLOps',
                    skills: ['MLOps', 'API Development', 'Model Serving'],
                    deliverables: ['Production Model', 'API Endpoints', 'Monitoring']
                },
                {
                    id: 'testing',
                    name: 'ML Testing & Validation',
                    description: 'Validate model performance and conduct A/B testing',
                    estimatedDays: 4,
                    complexity: 'medium',
                    priority: 'high',
                    dependencies: ['model_deployment'],
                    riskLevel: 30,
                    category: 'Testing',
                    skills: ['ML Testing', 'Statistical Analysis', 'A/B Testing'],
                    deliverables: ['Validation Reports', 'Performance Metrics', 'Test Results']
                }
            ],
            mobile_app: [
                {
                    id: 'requirements',
                    name: 'Requirements Analysis',
                    description: 'Gather and analyze user requirements, create user stories',
                    estimatedDays: 3,
                    complexity: 'medium',
                    priority: 'high',
                    dependencies: [],
                    riskLevel: 20,
                    category: 'Planning',
                    skills: ['Business Analysis', 'Requirements Gathering'],
                    deliverables: ['Requirements Document', 'User Stories']
                },
                {
                    id: 'ui_design',
                    name: 'UI/UX Design',
                    description: 'Create wireframes, mockups, and user interface designs',
                    estimatedDays: 5,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['requirements'],
                    riskLevel: 30,
                    category: 'Design',
                    skills: ['UI/UX Design', 'Prototyping'],
                    deliverables: ['Wireframes', 'Mockups', 'Design System']
                },
                {
                    id: 'backend_api',
                    name: 'Backend API Development',
                    description: 'Develop server-side APIs and database integration',
                    estimatedDays: 8,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['requirements'],
                    riskLevel: 40,
                    category: 'Development',
                    skills: ['Backend Development', 'API Design', 'Database'],
                    deliverables: ['API Endpoints', 'Database Schema', 'API Documentation']
                },
                {
                    id: 'frontend_development',
                    name: 'Frontend Development',
                    description: 'Develop mobile app frontend with UI components',
                    estimatedDays: 10,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['ui_design', 'backend_api'],
                    riskLevel: 35,
                    category: 'Development',
                    skills: ['Mobile Development', 'React Native', 'JavaScript'],
                    deliverables: ['Mobile App', 'UI Components', 'Navigation']
                },
                {
                    id: 'testing',
                    name: 'Testing & QA',
                    description: 'Comprehensive testing including unit, integration, and user testing',
                    estimatedDays: 4,
                    complexity: 'medium',
                    priority: 'high',
                    dependencies: ['frontend_development'],
                    riskLevel: 25,
                    category: 'Testing',
                    skills: ['Testing', 'QA', 'Bug Tracking'],
                    deliverables: ['Test Cases', 'Bug Reports', 'Quality Assurance']
                },
                {
                    id: 'deployment',
                    name: 'Deployment & Launch',
                    description: 'Deploy to app stores and production environment',
                    estimatedDays: 2,
                    complexity: 'medium',
                    priority: 'high',
                    dependencies: ['testing'],
                    riskLevel: 30,
                    category: 'Deployment',
                    skills: ['DevOps', 'App Store Management'],
                    deliverables: ['Production App', 'App Store Listings']
                }
            ],
            web_application: [
                {
                    id: 'requirements',
                    name: 'Requirements Analysis',
                    description: 'Gather and analyze web application requirements',
                    estimatedDays: 2,
                    complexity: 'medium',
                    priority: 'high',
                    dependencies: [],
                    riskLevel: 15,
                    category: 'Planning',
                    skills: ['Business Analysis', 'Requirements Gathering'],
                    deliverables: ['Requirements Document', 'User Stories']
                },
                {
                    id: 'ui_design',
                    name: 'UI/UX Design',
                    description: 'Create web application designs and user experience flows',
                    estimatedDays: 4,
                    complexity: 'medium',
                    priority: 'high',
                    dependencies: ['requirements'],
                    riskLevel: 25,
                    category: 'Design',
                    skills: ['UI/UX Design', 'Web Design'],
                    deliverables: ['Wireframes', 'Mockups', 'Design System']
                },
                {
                    id: 'backend_development',
                    name: 'Backend Development',
                    description: 'Develop server-side logic, APIs, and database integration',
                    estimatedDays: 6,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['requirements'],
                    riskLevel: 35,
                    category: 'Development',
                    skills: ['Backend Development', 'API Design', 'Database'],
                    deliverables: ['Backend Services', 'API Endpoints', 'Database']
                },
                {
                    id: 'frontend_development',
                    name: 'Frontend Development',
                    description: 'Develop responsive web frontend with modern frameworks',
                    estimatedDays: 7,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['ui_design', 'backend_development'],
                    riskLevel: 30,
                    category: 'Development',
                    skills: ['Frontend Development', 'React', 'JavaScript'],
                    deliverables: ['Web Application', 'Responsive UI', 'User Interactions']
                },
                {
                    id: 'testing',
                    name: 'Testing & QA',
                    description: 'Comprehensive testing including cross-browser compatibility',
                    estimatedDays: 3,
                    complexity: 'medium',
                    priority: 'high',
                    dependencies: ['frontend_development'],
                    riskLevel: 20,
                    category: 'Testing',
                    skills: ['Testing', 'QA', 'Cross-browser Testing'],
                    deliverables: ['Test Cases', 'Bug Reports', 'Performance Testing']
                },
                {
                    id: 'deployment',
                    name: 'Deployment & Launch',
                    description: 'Deploy to production servers and configure hosting',
                    estimatedDays: 1,
                    complexity: 'low',
                    priority: 'high',
                    dependencies: ['testing'],
                    riskLevel: 25,
                    category: 'Deployment',
                    skills: ['DevOps', 'Web Hosting'],
                    deliverables: ['Production Website', 'Hosting Configuration']
                }
            ],
            backend_service: [
                {
                    id: 'requirements',
                    name: 'API Requirements Analysis',
                    description: 'Define API specifications and integration requirements',
                    estimatedDays: 2,
                    complexity: 'medium',
                    priority: 'high',
                    dependencies: [],
                    riskLevel: 15,
                    category: 'Planning',
                    skills: ['API Design', 'Requirements Analysis'],
                    deliverables: ['API Specification', 'Integration Requirements']
                },
                {
                    id: 'database_design',
                    name: 'Database Design',
                    description: 'Design database schema and data models',
                    estimatedDays: 3,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['requirements'],
                    riskLevel: 25,
                    category: 'Design',
                    skills: ['Database Design', 'Data Modeling'],
                    deliverables: ['Database Schema', 'Data Models', 'Relationships']
                },
                {
                    id: 'api_development',
                    name: 'API Development',
                    description: 'Develop RESTful APIs with proper error handling',
                    estimatedDays: 8,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['database_design'],
                    riskLevel: 35,
                    category: 'Development',
                    skills: ['API Development', 'Backend Programming'],
                    deliverables: ['API Endpoints', 'Error Handling', 'API Documentation']
                },
                {
                    id: 'authentication',
                    name: 'Authentication & Security',
                    description: 'Implement user authentication and security measures',
                    estimatedDays: 3,
                    complexity: 'high',
                    priority: 'high',
                    dependencies: ['api_development'],
                    riskLevel: 40,
                    category: 'Security',
                    skills: ['Security', 'Authentication', 'Authorization'],
                    deliverables: ['Auth System', 'Security Measures', 'User Management']
                },
                {
                    id: 'testing',
                    name: 'API Testing',
                    description: 'Comprehensive API testing including load testing',
                    estimatedDays: 3,
                    complexity: 'medium',
                    priority: 'high',
                    dependencies: ['authentication'],
                    riskLevel: 20,
                    category: 'Testing',
                    skills: ['API Testing', 'Load Testing', 'Performance Testing'],
                    deliverables: ['Test Suites', 'Performance Reports', 'API Validation']
                },
                {
                    id: 'deployment',
                    name: 'Service Deployment',
                    description: 'Deploy API service to production with monitoring',
                    estimatedDays: 2,
                    complexity: 'medium',
                    priority: 'high',
                    dependencies: ['testing'],
                    riskLevel: 30,
                    category: 'Deployment',
                    skills: ['DevOps', 'Service Deployment', 'Monitoring'],
                    deliverables: ['Production API', 'Monitoring Setup', 'Health Checks']
                }
            ]
        };
        return taskTemplates[projectType] || taskTemplates.mobile_app;
    }
    customizeTasksForProject(baseTasks, analysis) {
        return baseTasks.map(task => ({
            ...task,
            id: `${task.id}_${Date.now()}`,
            riskLevel: this.adjustRiskForProject(task.riskLevel, analysis, task),
            estimatedDays: this.adjustEstimateForProject(task.estimatedDays, analysis, task),
            complexity: this.adjustComplexityForProject(task.complexity, analysis, task)
        }));
    }
    addTaskDependencies(tasks) {
        return tasks;
    }
    calculateProjectComplexity(tasks) {
        const highComplexityTasks = tasks.filter(task => task.complexity === 'high').length;
        const totalTasks = tasks.length;
        if (highComplexityTasks / totalTasks > 0.6)
            return 'high';
        if (highComplexityTasks / totalTasks > 0.3)
            return 'medium';
        return 'low';
    }
    calculateRiskLevel(tasks) {
        const totalRisk = tasks.reduce((sum, task) => sum + task.riskLevel, 0);
        return Math.round(totalRisk / tasks.length);
    }
    identifyCriticalPath(tasks) {
        const criticalTasks = tasks.filter(task => task.priority === 'high' || task.priority === 'urgent');
        return criticalTasks.map(task => task.id);
    }
    estimateResourceRequirements(tasks) {
        const requirements = {
            developers: 0,
            designers: 0,
            testers: 0,
            managers: 0
        };
        tasks.forEach(task => {
            if (task.skills.some(skill => skill.includes('Development') || skill.includes('Programming'))) {
                requirements.developers += Math.ceil(task.estimatedDays / 5);
            }
            if (task.skills.some(skill => skill.includes('Design') || skill.includes('UI/UX'))) {
                requirements.designers += Math.ceil(task.estimatedDays / 3);
            }
            if (task.skills.some(skill => skill.includes('Testing') || skill.includes('QA'))) {
                requirements.testers += Math.ceil(task.estimatedDays / 4);
            }
            if (task.skills.some(skill => skill.includes('Management') || skill.includes('Analysis'))) {
                requirements.managers += Math.ceil(task.estimatedDays / 7);
            }
        });
        return requirements;
    }
    calculateEstimatedDuration(tasks) {
        return tasks.reduce((sum, task) => sum + task.estimatedDays, 0);
    }
    adjustRiskForProject(baseRisk, analysis, task) {
        let adjustedRisk = baseRisk;
        if (analysis.complexity === 'high') {
            adjustedRisk += 10;
        }
        else if (analysis.complexity === 'low') {
            adjustedRisk -= 5;
        }
        if (task.complexity === 'high') {
            adjustedRisk += 15;
        }
        else if (task.complexity === 'low') {
            adjustedRisk -= 10;
        }
        const highRiskCategories = ['Development', 'Security', 'Payment', 'MLOps'];
        if (highRiskCategories.includes(task.category)) {
            adjustedRisk += 10;
        }
        if (task.dependencies && task.dependencies.length > 2) {
            adjustedRisk += task.dependencies.length * 5;
        }
        return Math.max(0, Math.min(100, adjustedRisk));
    }
    adjustEstimateForProject(baseEstimate, analysis, task) {
        let adjustedEstimate = baseEstimate;
        if (analysis.complexity === 'high') {
            adjustedEstimate *= 1.3;
        }
        else if (analysis.complexity === 'low') {
            adjustedEstimate *= 0.8;
        }
        if (task.complexity === 'high') {
            adjustedEstimate *= 1.4;
        }
        else if (task.complexity === 'low') {
            adjustedEstimate *= 0.7;
        }
        if (task.riskLevel > 70) {
            adjustedEstimate *= 1.5;
        }
        else if (task.riskLevel < 30) {
            adjustedEstimate *= 0.9;
        }
        return Math.ceil(adjustedEstimate * 2) / 2;
    }
    adjustComplexityForProject(baseComplexity, analysis, task) {
        let complexityScore = baseComplexity === 'high' ? 3 : baseComplexity === 'medium' ? 2 : 1;
        const complexProjectTypes = ['ai_ml_project', 'e_commerce', 'game_development'];
        if (complexProjectTypes.includes(analysis.projectType)) {
            complexityScore += 1;
        }
        const complexCategories = ['ML Development', 'Payment Integration', 'Security'];
        if (complexCategories.includes(task.category)) {
            complexityScore += 1;
        }
        if (task.dependencies && task.dependencies.length > 3) {
            complexityScore += 1;
        }
        if (complexityScore >= 4)
            return 'high';
        if (complexityScore >= 2)
            return 'medium';
        return 'low';
    }
}
exports.AITaskBreakdownService = AITaskBreakdownService;
//# sourceMappingURL=aiTaskBreakdown.js.map