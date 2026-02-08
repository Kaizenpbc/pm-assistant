import { FastifyInstance } from 'fastify';

export interface TaskSuggestion {
  id: string;
  name: string;
  description: string;
  estimatedDays: number;
  complexity: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dependencies: string[];
  riskLevel: number; // 0-100
  suggestedAssignee?: string;
  category: string;
  skills: string[];
  deliverables: string[];
}

export interface ProjectAnalysis {
  projectType: string;
  complexity: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  riskLevel: number;
  suggestedPhases: any[];
  taskSuggestions: TaskSuggestion[];
  criticalPath: string[];
  resourceRequirements: {
    developers?: number;
    designers?: number;
    testers?: number;
    managers?: number;
  };
}

/**
 * Fallback service that uses hardcoded templates when Claude API is unavailable.
 * Previously named AITaskBreakdownService.
 */
export class FallbackTaskBreakdownService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async analyzeProject(projectDescription: string, projectType?: string): Promise<ProjectAnalysis> {
    try {
      const analysis = await this.extractProjectInfo(projectDescription);
      const taskData = await this.generateTaskSuggestions(analysis, projectType);

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
        resourceRequirements,
      };
    } catch (error) {
      this.fastify.log.error({ err: error instanceof Error ? error : new Error(String(error)) }, 'Error in fallback task breakdown');
      throw new Error('Failed to analyze project for task breakdown');
    }
  }

  /**
   * Extracts key information from project description using advanced NLP-like analysis
   */
  private async extractProjectInfo(description: string) {
    const keywords = description.toLowerCase();
    
    // Advanced project type detection with confidence scoring
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

    // Mobile app indicators
    if (keywords.includes('mobile app') || keywords.includes('app development') || 
        keywords.includes('ios') || keywords.includes('android') || 
        keywords.includes('react native') || keywords.includes('flutter')) {
      projectTypeScores.mobile_app += 3;
    }
    if (keywords.includes('restaurant') || keywords.includes('ordering') || 
        keywords.includes('delivery') || keywords.includes('food')) {
      projectTypeScores.mobile_app += 2; // Common mobile app use case
    }

    // Web application indicators
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

    // Backend service indicators
    if (keywords.includes('api') || keywords.includes('backend') || 
        keywords.includes('microservice') || keywords.includes('server')) {
      projectTypeScores.backend_service += 3;
    }

    // Data project indicators
    if (keywords.includes('database') || keywords.includes('data') || 
        keywords.includes('analytics') || keywords.includes('reporting') ||
        keywords.includes('dashboard') || keywords.includes('visualization')) {
      projectTypeScores.data_project += 3;
    }

    // AI/ML project indicators
    if (keywords.includes('ai') || keywords.includes('machine learning') || 
        keywords.includes('ml') || keywords.includes('artificial intelligence') ||
        keywords.includes('neural') || keywords.includes('model')) {
      projectTypeScores.ai_ml_project += 3;
    }

    // Design project indicators
    if (keywords.includes('design') || keywords.includes('ui/ux') || 
        keywords.includes('wireframe') || keywords.includes('prototype')) {
      projectTypeScores.design_project += 3;
    }

    // Game development indicators
    if (keywords.includes('game') || keywords.includes('gaming') || 
        keywords.includes('unity') || keywords.includes('unreal')) {
      projectTypeScores.game_development += 3;
    }

    // IoT project indicators
    if (keywords.includes('iot') || keywords.includes('internet of things') || 
        keywords.includes('sensor') || keywords.includes('embedded')) {
      projectTypeScores.iot_project += 3;
    }

    // Construction project indicators
    if (keywords.includes('construction') || keywords.includes('building') || 
        keywords.includes('school') || keywords.includes('dartmouth') ||
        keywords.includes('infrastructure') || keywords.includes('civil') ||
        keywords.includes('architectural') || keywords.includes('contractor') ||
        keywords.includes('foundation') || keywords.includes('structural') ||
        keywords.includes('permits') || keywords.includes('site') ||
        keywords.includes('excavation') || keywords.includes('mep')) {
      projectTypeScores.construction_project += 4;
    }

    // Find the project type with highest score
    const projectType = Object.keys(projectTypeScores).reduce((a, b) => 
      projectTypeScores[a as keyof typeof projectTypeScores] > projectTypeScores[b as keyof typeof projectTypeScores] ? a : b
    );

    // Detect phases based on keywords
    const phases: string[] = [];
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

  /**
   * Generates task suggestions based on project analysis
   */
  private async generateTaskSuggestions(analysis: any, projectType?: string): Promise<{ tasks: TaskSuggestion[], phases: any[] }> {
    // Get base tasks for project type
    const baseTasks = this.getBaseTasksForType(analysis.projectType || projectType);
    
    // Customize tasks based on project description
    const customizedTasks = this.customizeTasksForProject(baseTasks, analysis);
    
    // Add dependencies between tasks
    const tasksWithDependencies = this.addTaskDependencies(customizedTasks);
    
    // Organize tasks by phases
    const { tasks, phases } = this.organizeTasksByPhases(tasksWithDependencies, analysis.projectType || projectType);
    
    return { tasks, phases };
  }

  /**
   * Organizes tasks into phases based on their categories and project type
   */
  private organizeTasksByPhases(tasks: TaskSuggestion[], projectType: string): { tasks: TaskSuggestion[], phases: any[] } {
    if (projectType === 'construction_project') {
      return this.organizeConstructionPhases(tasks);
    }
    
    // For other project types, use default phase organization
    return this.organizeDefaultPhases(tasks);
  }

  /**
   * Organizes construction tasks into logical phases
   */
  private organizeConstructionPhases(tasks: TaskSuggestion[]): { tasks: TaskSuggestion[], phases: any[] } {
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
        tasks: [] as TaskSuggestion[]
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
        tasks: [] as TaskSuggestion[]
      }
    ];

    // Categorize tasks by their category field
    tasks.forEach(task => {
      const category = task.category?.toLowerCase() || '';
      
      if (category.includes('planning') || category.includes('design') || category.includes('survey') || category.includes('permit')) {
        phases[0].tasks.push(task);
        phases[0].estimatedDays += task.estimatedDays;
      } else if (category.includes('procurement') || category.includes('vendor') || category.includes('material')) {
        phases[1].tasks.push(task);
        phases[1].estimatedDays += task.estimatedDays;
      } else if (category.includes('construction') || category.includes('building') || category.includes('foundation') || category.includes('structural') || category.includes('mep') || category.includes('interior') || category.includes('exterior')) {
        phases[2].tasks.push(task);
        phases[2].estimatedDays += task.estimatedDays;
      } else if (category.includes('testing') || category.includes('commissioning') || category.includes('inspection') || category.includes('handover') || category.includes('completion')) {
        phases[3].tasks.push(task);
        phases[3].estimatedDays += task.estimatedDays;
      } else {
        // Default to construction phase if category is unclear
        phases[2].tasks.push(task);
        phases[2].estimatedDays += task.estimatedDays;
      }
    });

    // Filter out empty phases
    const nonEmptyPhases = phases.filter(phase => phase.tasks.length > 0);

    return { tasks, phases: nonEmptyPhases };
  }

  /**
   * Organizes non-construction tasks into default phases
   */
  private organizeDefaultPhases(tasks: TaskSuggestion[]): { tasks: TaskSuggestion[], phases: any[] } {
    type PhaseGroup = { id: string; name: string; description: string; estimatedDays: number; tasks: TaskSuggestion[] };
    const phases: PhaseGroup[] = [
      { id: 'planning-phase', name: '📋 Planning Phase', description: 'Requirements analysis and project planning', estimatedDays: 0, tasks: [] as TaskSuggestion[] },
      { id: 'development-phase', name: '💻 Development Phase', description: 'Main development and implementation work', estimatedDays: 0, tasks: [] as TaskSuggestion[] },
      { id: 'testing-phase', name: '🧪 Testing Phase', description: 'Testing, QA, and quality assurance', estimatedDays: 0, tasks: [] as TaskSuggestion[] },
      { id: 'deployment-phase', name: '🚀 Deployment Phase', description: 'Deployment and project handover', estimatedDays: 0, tasks: [] as TaskSuggestion[] }
    ];

    // Categorize tasks by their category field
    tasks.forEach(task => {
      const category = task.category?.toLowerCase() || '';
      
      if (category.includes('planning') || category.includes('requirements') || category.includes('design')) {
        phases[0].tasks.push(task);
        phases[0].estimatedDays += task.estimatedDays;
      } else if (category.includes('development') || category.includes('implementation') || category.includes('coding')) {
        phases[1].tasks.push(task);
        phases[1].estimatedDays += task.estimatedDays;
      } else if (category.includes('testing') || category.includes('qa') || category.includes('quality')) {
        phases[2].tasks.push(task);
        phases[2].estimatedDays += task.estimatedDays;
      } else if (category.includes('deployment') || category.includes('launch') || category.includes('handover')) {
        phases[3].tasks.push(task);
        phases[3].estimatedDays += task.estimatedDays;
      } else {
        // Default to development phase if category is unclear
        phases[1].tasks.push(task);
        phases[1].estimatedDays += task.estimatedDays;
      }
    });

    // Filter out empty phases
    const nonEmptyPhases = phases.filter(phase => phase.tasks.length > 0);

    return { tasks, phases: nonEmptyPhases };
  }

  /**
   * Gets base task templates for different project types
   */
  private getBaseTasksForType(projectType: string): TaskSuggestion[] {
    const taskTemplates: { [key: string]: TaskSuggestion[] } = {
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

  /**
   * Customizes tasks based on specific project requirements
   */
  private customizeTasksForProject(baseTasks: TaskSuggestion[], analysis: any): TaskSuggestion[] {
    return baseTasks.map(task => ({
      ...task,
      id: `${task.id}_${Date.now()}`,
      riskLevel: this.adjustRiskForProject(task.riskLevel, analysis, task),
      estimatedDays: this.adjustEstimateForProject(task.estimatedDays, analysis, task),
      complexity: this.adjustComplexityForProject(task.complexity, analysis, task)
    }));
  }

  /**
   * Adds dependencies between tasks based on logical relationships
   */
  private addTaskDependencies(tasks: TaskSuggestion[]): TaskSuggestion[] {
    // For now, return tasks as-is. In future, we can add more sophisticated dependency detection
    return tasks;
  }

  /**
   * Calculates overall project complexity
   */
  private calculateProjectComplexity(tasks: TaskSuggestion[]): 'low' | 'medium' | 'high' {
    const highComplexityTasks = tasks.filter(task => task.complexity === 'high').length;
    const totalTasks = tasks.length;
    
    if (highComplexityTasks / totalTasks > 0.6) return 'high';
    if (highComplexityTasks / totalTasks > 0.3) return 'medium';
    return 'low';
  }

  /**
   * Calculates overall project risk level
   */
  private calculateRiskLevel(tasks: TaskSuggestion[]): number {
    const totalRisk = tasks.reduce((sum, task) => sum + task.riskLevel, 0);
    return Math.round(totalRisk / tasks.length);
  }

  /**
   * Identifies critical path through task dependencies
   */
  private identifyCriticalPath(tasks: TaskSuggestion[]): string[] {
    // Simple critical path identification based on dependencies
    const criticalTasks = tasks.filter(task => 
      task.priority === 'high' || task.priority === 'urgent'
    );
    return criticalTasks.map(task => task.id);
  }

  /**
   * Estimates resource requirements based on tasks
   */
  private estimateResourceRequirements(tasks: TaskSuggestion[]) {
    const requirements = {
      developers: 0,
      designers: 0,
      testers: 0,
      managers: 0
    };

    tasks.forEach(task => {
      if (task.skills.some(skill => skill.includes('Development') || skill.includes('Programming'))) {
        requirements.developers += Math.ceil(task.estimatedDays / 5); // Assume 5 days per developer per task
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

  /**
   * Calculates estimated project duration
   */
  private calculateEstimatedDuration(tasks: TaskSuggestion[]): number {
    // Simple calculation - sum of all task days
    return tasks.reduce((sum, task) => sum + task.estimatedDays, 0);
  }

  /**
   * Adjusts risk level based on project characteristics and task specifics
   */
  private adjustRiskForProject(baseRisk: number, analysis: any, task: TaskSuggestion): number {
    let adjustedRisk = baseRisk;
    
    // Adjust based on project complexity
    if (analysis.complexity === 'high') {
      adjustedRisk += 10;
    } else if (analysis.complexity === 'low') {
      adjustedRisk -= 5;
    }
    
    // Adjust based on task complexity
    if (task.complexity === 'high') {
      adjustedRisk += 15;
    } else if (task.complexity === 'low') {
      adjustedRisk -= 10;
    }
    
    // Adjust based on task category
    const highRiskCategories = ['Development', 'Security', 'Payment', 'MLOps'];
    if (highRiskCategories.includes(task.category)) {
      adjustedRisk += 10;
    }
    
    // Adjust based on dependencies
    if (task.dependencies && task.dependencies.length > 2) {
      adjustedRisk += task.dependencies.length * 5;
    }
    
    // Ensure risk is within bounds
    return Math.max(0, Math.min(100, adjustedRisk));
  }

  /**
   * Adjusts time estimates based on project characteristics and task specifics
   */
  private adjustEstimateForProject(baseEstimate: number, analysis: any, task: TaskSuggestion): number {
    let adjustedEstimate = baseEstimate;
    
    // Adjust based on project complexity
    if (analysis.complexity === 'high') {
      adjustedEstimate *= 1.3; // 30% more time for complex projects
    } else if (analysis.complexity === 'low') {
      adjustedEstimate *= 0.8; // 20% less time for simple projects
    }
    
    // Adjust based on task complexity
    if (task.complexity === 'high') {
      adjustedEstimate *= 1.4; // 40% more time for complex tasks
    } else if (task.complexity === 'low') {
      adjustedEstimate *= 0.7; // 30% less time for simple tasks
    }
    
    // Adjust based on risk level
    if (task.riskLevel > 70) {
      adjustedEstimate *= 1.5; // 50% more time for high-risk tasks
    } else if (task.riskLevel < 30) {
      adjustedEstimate *= 0.9; // 10% less time for low-risk tasks
    }
    
    // Round to nearest half day
    return Math.ceil(adjustedEstimate * 2) / 2;
  }

  /**
   * Adjusts complexity based on project characteristics and task specifics
   */
  private adjustComplexityForProject(baseComplexity: string, analysis: any, task: TaskSuggestion): 'low' | 'medium' | 'high' {
    let complexityScore = baseComplexity === 'high' ? 3 : baseComplexity === 'medium' ? 2 : 1;
    
    // Adjust based on project type
    const complexProjectTypes = ['ai_ml_project', 'e_commerce', 'game_development'];
    if (complexProjectTypes.includes(analysis.projectType)) {
      complexityScore += 1;
    }
    
    // Adjust based on task category
    const complexCategories = ['ML Development', 'Payment Integration', 'Security'];
    if (complexCategories.includes(task.category)) {
      complexityScore += 1;
    }
    
    // Adjust based on dependencies
    if (task.dependencies && task.dependencies.length > 3) {
      complexityScore += 1;
    }
    
    // Convert back to string
    if (complexityScore >= 4) return 'high';
    if (complexityScore >= 2) return 'medium';
    return 'low';
  }
}

// Backward-compatible alias
export const AITaskBreakdownService = FallbackTaskBreakdownService;
