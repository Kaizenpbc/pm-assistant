"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const ProjectPlanningTemplates = ({ projectCategory, onTemplateSelect, onClose }) => {
    const [selectedTemplate, setSelectedTemplate] = (0, react_1.useState)(null);
    const [selectedPhases, setSelectedPhases] = (0, react_1.useState)([]);
    const [selectedDocuments, setSelectedDocuments] = (0, react_1.useState)([]);
    const templates = [
        {
            id: 'road-construction',
            name: 'Road Construction & Repair',
            icon: lucide_react_1.MapPin,
            description: 'Complete road construction, repair, and maintenance projects for Guyana infrastructure',
            estimatedDuration: '3-6 months',
            category: 'Infrastructure',
            budgetRange: '$500K - $2M',
            phases: [
                {
                    id: 'initiation',
                    name: 'Project Initiation',
                    description: 'Initial project setup and stakeholder alignment',
                    estimatedDays: 5,
                    tasks: [
                        { id: 't1', name: 'Project kickoff meeting', description: 'Meet with stakeholders and team', estimatedHours: 4 },
                        { id: 't2', name: 'Site access coordination', description: 'Arrange site access and permits', estimatedHours: 8 },
                        { id: 't3', name: 'Safety protocols setup', description: 'Establish safety procedures and equipment', estimatedHours: 6 }
                    ]
                },
                {
                    id: 'analysis',
                    name: 'Site Analysis & Survey',
                    description: 'Comprehensive site assessment and condition analysis',
                    estimatedDays: 10,
                    dependencies: ['initiation'],
                    tasks: [
                        { id: 't4', name: 'Road condition survey', description: 'Assess current road condition and damage', estimatedHours: 16 },
                        { id: 't5', name: 'Traffic impact assessment', description: 'Analyze traffic patterns and impact', estimatedHours: 12 },
                        { id: 't6', name: 'Drainage system evaluation', description: 'Check existing drainage and water flow', estimatedHours: 8 },
                        { id: 't7', name: 'Utility mapping', description: 'Map underground utilities and conflicts', estimatedHours: 10 },
                        { id: 't8', name: 'Environmental assessment', description: 'Evaluate environmental impact and requirements', estimatedHours: 6 }
                    ]
                },
                {
                    id: 'design',
                    name: 'Design & Planning',
                    description: 'Create detailed project design and specifications',
                    estimatedDays: 15,
                    dependencies: ['analysis'],
                    tasks: [
                        { id: 't9', name: 'Engineering design', description: 'Create detailed road design and specifications', estimatedHours: 24 },
                        { id: 't10', name: 'Material specifications', description: 'Define required materials and quantities', estimatedHours: 8 },
                        { id: 't11', name: 'Cost estimation', description: 'Calculate detailed project costs', estimatedHours: 12 },
                        { id: 't12', name: 'Timeline development', description: 'Create detailed project schedule', estimatedHours: 8 }
                    ]
                },
                {
                    id: 'procurement',
                    name: 'Procurement & Permits',
                    description: 'Obtain materials, equipment, and necessary permits',
                    estimatedDays: 20,
                    dependencies: ['design'],
                    tasks: [
                        { id: 't13', name: 'Material procurement', description: 'Source and order required materials', estimatedHours: 16 },
                        { id: 't14', name: 'Equipment rental', description: 'Arrange heavy equipment and machinery', estimatedHours: 8 },
                        { id: 't15', name: 'Permit applications', description: 'Submit and obtain necessary permits', estimatedHours: 12 },
                        { id: 't16', name: 'Contractor selection', description: 'Select and contract construction teams', estimatedHours: 16 }
                    ]
                },
                {
                    id: 'construction',
                    name: 'Construction & Execution',
                    description: 'Physical construction and implementation',
                    estimatedDays: 45,
                    dependencies: ['procurement'],
                    tasks: [
                        { id: 't17', name: 'Site preparation', description: 'Clear and prepare construction site', estimatedHours: 20 },
                        { id: 't18', name: 'Excavation and grading', description: 'Excavate and grade road foundation', estimatedHours: 40 },
                        { id: 't19', name: 'Base layer construction', description: 'Install road base materials', estimatedHours: 32 },
                        { id: 't20', name: 'Surface layer application', description: 'Apply final road surface', estimatedHours: 24 },
                        { id: 't21', name: 'Drainage installation', description: 'Install or repair drainage systems', estimatedHours: 16 },
                        { id: 't22', name: 'Signage and markings', description: 'Install road signs and markings', estimatedHours: 8 }
                    ]
                },
                {
                    id: 'completion',
                    name: 'Testing & Handover',
                    description: 'Quality testing and project completion',
                    estimatedDays: 5,
                    dependencies: ['construction'],
                    tasks: [
                        { id: 't23', name: 'Quality testing', description: 'Test road quality and safety standards', estimatedHours: 8 },
                        { id: 't24', name: 'Final inspection', description: 'Conduct final project inspection', estimatedHours: 4 },
                        { id: 't25', name: 'Documentation completion', description: 'Complete all project documentation', estimatedHours: 6 },
                        { id: 't26', name: 'Project handover', description: 'Hand over completed project to client', estimatedHours: 4 }
                    ]
                }
            ],
            documents: [
                { id: 'd1', name: 'Site Survey Report', description: 'Detailed site condition assessment', required: true },
                { id: 'd2', name: 'Traffic Impact Study', description: 'Analysis of traffic impact during construction', required: true },
                { id: 'd3', name: 'Engineering Drawings', description: 'Detailed technical drawings and specifications', required: true },
                { id: 'd4', name: 'Material Test Reports', description: 'Quality test results for all materials', required: true },
                { id: 'd5', name: 'Safety Plan', description: 'Comprehensive safety procedures and protocols', required: true },
                { id: 'd6', name: 'Environmental Compliance', description: 'Environmental impact and compliance documentation', required: false },
                { id: 'd7', name: 'Progress Photos', description: 'Documentation photos throughout construction', required: false }
            ]
        },
        {
            id: 'building-construction',
            name: 'Building Construction',
            icon: lucide_react_1.Building,
            description: 'Construct new buildings including community centers, offices, and public facilities',
            estimatedDuration: '4-8 months',
            category: 'Infrastructure',
            budgetRange: '$1M - $5M',
            phases: [
                {
                    id: 'initiation',
                    name: 'Project Initiation',
                    description: 'Initial project setup and stakeholder alignment',
                    estimatedDays: 7,
                    tasks: [
                        { id: 't1', name: 'Stakeholder meeting', description: 'Meet with community leaders and officials', estimatedHours: 6 },
                        { id: 't2', name: 'Site survey', description: 'Conduct detailed site survey and assessment', estimatedHours: 8 },
                        { id: 't3', name: 'Budget confirmation', description: 'Confirm final budget and funding sources', estimatedHours: 4 }
                    ]
                },
                {
                    id: 'design',
                    name: 'Design & Planning',
                    description: 'Create detailed building design and specifications',
                    estimatedDays: 25,
                    dependencies: ['initiation'],
                    tasks: [
                        { id: 't4', name: 'Architectural design', description: 'Create building layout and architectural plans', estimatedHours: 48 },
                        { id: 't5', name: 'Structural engineering', description: 'Design structural elements and foundation', estimatedHours: 32 },
                        { id: 't6', name: 'MEP design', description: 'Design mechanical, electrical, and plumbing systems', estimatedHours: 40 },
                        { id: 't7', name: 'Accessibility design', description: 'Ensure accessibility compliance and features', estimatedHours: 12 },
                        { id: 't8', name: 'Interior design', description: 'Plan interior spaces and finishes', estimatedHours: 24 }
                    ]
                },
                {
                    id: 'permits',
                    name: 'Permits & Approvals',
                    description: 'Obtain all necessary permits and approvals',
                    estimatedDays: 35,
                    dependencies: ['design'],
                    tasks: [
                        { id: 't9', name: 'Building permits', description: 'Submit and obtain building construction permits', estimatedHours: 20 },
                        { id: 't10', name: 'Environmental permits', description: 'Obtain environmental impact and compliance permits', estimatedHours: 16 },
                        { id: 't11', name: 'Utility approvals', description: 'Arrange utility connections and approvals', estimatedHours: 12 },
                        { id: 't12', name: 'Fire safety approval', description: 'Obtain fire safety and emergency system approval', estimatedHours: 8 },
                        { id: 't13', name: 'Zoning compliance', description: 'Ensure zoning compliance and approvals', estimatedHours: 6 }
                    ]
                },
                {
                    id: 'procurement',
                    name: 'Procurement & Setup',
                    description: 'Source materials and prepare construction site',
                    estimatedDays: 20,
                    dependencies: ['permits'],
                    tasks: [
                        { id: 't14', name: 'Material procurement', description: 'Source and order building materials', estimatedHours: 24 },
                        { id: 't15', name: 'Equipment rental', description: 'Arrange construction equipment and machinery', estimatedHours: 12 },
                        { id: 't16', name: 'Contractor selection', description: 'Select and contract construction teams', estimatedHours: 20 },
                        { id: 't17', name: 'Site preparation', description: 'Prepare construction site and access', estimatedHours: 16 }
                    ]
                },
                {
                    id: 'construction',
                    name: 'Construction',
                    description: 'Physical construction of the building',
                    estimatedDays: 90,
                    dependencies: ['procurement'],
                    tasks: [
                        { id: 't18', name: 'Foundation work', description: 'Excavate and pour building foundation', estimatedHours: 60 },
                        { id: 't19', name: 'Structural framework', description: 'Build structural framework and walls', estimatedHours: 100 },
                        { id: 't20', name: 'Roofing', description: 'Install roof structure and covering', estimatedHours: 40 },
                        { id: 't21', name: 'MEP installation', description: 'Install mechanical, electrical, and plumbing systems', estimatedHours: 80 },
                        { id: 't22', name: 'Interior construction', description: 'Complete interior walls, floors, and fixtures', estimatedHours: 80 },
                        { id: 't23', name: 'Exterior finishing', description: 'Complete exterior walls, windows, and doors', estimatedHours: 40 },
                        { id: 't24', name: 'Landscaping', description: 'Complete exterior landscaping and parking', estimatedHours: 24 }
                    ]
                },
                {
                    id: 'completion',
                    name: 'Testing & Handover',
                    description: 'Final testing and project handover',
                    estimatedDays: 12,
                    dependencies: ['construction'],
                    tasks: [
                        { id: 't25', name: 'System testing', description: 'Test all building systems and equipment', estimatedHours: 20 },
                        { id: 't26', name: 'Safety inspection', description: 'Conduct comprehensive safety and code inspection', estimatedHours: 8 },
                        { id: 't27', name: 'Final walkthrough', description: 'Final walkthrough with stakeholders', estimatedHours: 6 },
                        { id: 't28', name: 'Documentation', description: 'Complete all project documentation and manuals', estimatedHours: 16 },
                        { id: 't29', name: 'Training', description: 'Provide building operation and maintenance training', estimatedHours: 8 }
                    ]
                }
            ],
            documents: [
                { id: 'd1', name: 'Project Charter', description: 'Formal project authorization and scope definition', required: true },
                { id: 'd2', name: 'Architectural Drawings', description: 'Complete architectural design and layout drawings', required: true },
                { id: 'd3', name: 'Structural Engineering Report', description: 'Structural analysis and design calculations', required: true },
                { id: 'd4', name: 'MEP Design Plans', description: 'Mechanical, electrical, and plumbing system designs', required: true },
                { id: 'd5', name: 'Building Permits', description: 'All required building and construction permits', required: true },
                { id: 'd6', name: 'Safety Plan', description: 'Comprehensive construction safety procedures and protocols', required: true },
                { id: 'd7', name: 'Material Certificates', description: 'Quality certificates for all building materials', required: true },
                { id: 'd8', name: 'Final Inspection Report', description: 'Final building inspection and approval documentation', required: true },
                { id: 'd9', name: 'As-Built Drawings', description: 'Final drawings reflecting actual construction', required: true },
                { id: 'd10', name: 'Operation Manual', description: 'Building operation and maintenance manual', required: false }
            ]
        },
        {
            id: 'school-construction',
            name: 'School Construction',
            icon: lucide_react_1.GraduationCap,
            description: 'Comprehensive school construction project following industry-standard building construction phases',
            estimatedDuration: '6-12 months',
            category: 'Education',
            budgetRange: '$1M - $3M',
            phases: [
                {
                    id: 'project-initiation',
                    name: 'Project Initiation Phase',
                    description: 'Define project scope, objectives, and stakeholder alignment',
                    estimatedDays: 7,
                    tasks: [
                        { id: 't1', name: 'Define project scope and objectives', description: 'Clearly define what the school project will deliver', estimatedHours: 8 },
                        { id: 't2', name: 'Identify key stakeholders and roles', description: 'Map all project stakeholders and their responsibilities', estimatedHours: 6 },
                        { id: 't3', name: 'Conduct stakeholder analysis and engagement planning', description: 'Plan how to engage with community and officials', estimatedHours: 8 },
                        { id: 't4', name: 'Develop preliminary budget and timeline', description: 'Create initial budget estimates and project timeline', estimatedHours: 12 },
                        { id: 't5', name: 'Risk identification and initial mitigation planning', description: 'Identify potential risks and mitigation strategies', estimatedHours: 6 },
                        { id: 't6', name: 'Kick-off meeting and communication plan', description: 'Hold project kickoff and establish communication protocols', estimatedHours: 4 },
                        { id: 't7', name: 'Approval of project charter', description: 'Get formal approval for project charter and scope', estimatedHours: 4 }
                    ]
                },
                {
                    id: 'pre-construction',
                    name: 'Pre-Construction Phase',
                    description: 'Site selection, design development, and regulatory approvals',
                    estimatedDays: 45,
                    dependencies: ['project-initiation'],
                    tasks: [
                        { id: 't8', name: 'Site selection and survey', description: 'Select optimal site and conduct detailed survey', estimatedHours: 16 },
                        { id: 't9', name: 'Environmental impact assessment', description: 'Assess environmental impact and requirements', estimatedHours: 20 },
                        { id: 't10', name: 'Detailed budgeting and financing', description: 'Create detailed budget and secure financing', estimatedHours: 24 },
                        { id: 't11', name: 'Permits and regulatory approvals', description: 'Obtain all necessary permits and approvals', estimatedHours: 32 },
                        { id: 't12', name: 'Design development (architectural, structural, MEP)', description: 'Complete detailed design for all building systems', estimatedHours: 80 },
                        { id: 't13', name: 'Tendering and contractor selection', description: 'Issue tenders and select construction contractors', estimatedHours: 40 }
                    ]
                },
                {
                    id: 'mobilization',
                    name: 'Mobilization Phase',
                    description: 'Site preparation and temporary facilities setup',
                    estimatedDays: 10,
                    dependencies: ['pre-construction'],
                    tasks: [
                        { id: 't14', name: 'Site preparation and clearing', description: 'Clear and prepare the construction site', estimatedHours: 24 },
                        { id: 't15', name: 'Temporary facilities setup (offices, fencing, signage)', description: 'Set up construction site facilities', estimatedHours: 16 },
                        { id: 't16', name: 'Utility connections (water, power, telecom)', description: 'Connect temporary utilities to site', estimatedHours: 12 },
                        { id: 't17', name: 'Safety and compliance setup', description: 'Establish safety protocols and compliance measures', estimatedHours: 8 },
                        { id: 't18', name: 'Stakeholder alignment and readiness review', description: 'Ensure all stakeholders are ready for construction', estimatedHours: 6 }
                    ]
                },
                {
                    id: 'foundation',
                    name: 'Foundation Phase',
                    description: 'Excavation, grading, and foundation construction',
                    estimatedDays: 20,
                    dependencies: ['mobilization'],
                    tasks: [
                        { id: 't19', name: 'Excavation and grading', description: 'Excavate foundation area and grade site', estimatedHours: 40 },
                        { id: 't20', name: 'Shoring and dewatering (if applicable)', description: 'Install shoring and dewatering systems if needed', estimatedHours: 24 },
                        { id: 't21', name: 'Footings and slab-on-grade', description: 'Pour foundation footings and slab', estimatedHours: 32 },
                        { id: 't22', name: 'Foundation walls and waterproofing', description: 'Build foundation walls and apply waterproofing', estimatedHours: 28 },
                        { id: 't23', name: 'Inspections and approvals', description: 'Conduct foundation inspections and get approvals', estimatedHours: 8 }
                    ]
                },
                {
                    id: 'structural',
                    name: 'Structural Phase',
                    description: 'Building frame and structural elements construction',
                    estimatedDays: 35,
                    dependencies: ['foundation'],
                    tasks: [
                        { id: 't24', name: 'Framing (steel, concrete, wood)', description: 'Construct building structural frame', estimatedHours: 80 },
                        { id: 't25', name: 'Floor systems and decking', description: 'Install floor systems and decking', estimatedHours: 60 },
                        { id: 't26', name: 'Roof structure and sheathing', description: 'Build roof structure and install sheathing', estimatedHours: 48 },
                        { id: 't27', name: 'Structural inspections', description: 'Conduct structural inspections and approvals', estimatedHours: 12 }
                    ]
                },
                {
                    id: 'envelope',
                    name: 'Envelope Phase',
                    description: 'Building exterior walls, roof, and weatherproofing',
                    estimatedDays: 25,
                    dependencies: ['structural'],
                    tasks: [
                        { id: 't28', name: 'Exterior walls and cladding', description: 'Install exterior walls and cladding systems', estimatedHours: 60 },
                        { id: 't29', name: 'Roofing and waterproofing', description: 'Complete roofing installation and waterproofing', estimatedHours: 40 },
                        { id: 't30', name: 'Windows and doors installation', description: 'Install windows and exterior doors', estimatedHours: 32 },
                        { id: 't31', name: 'Insulation and vapor barriers', description: 'Install insulation and vapor barriers', estimatedHours: 28 }
                    ]
                },
                {
                    id: 'interior-systems',
                    name: 'Interior Systems Phase',
                    description: 'Mechanical, electrical, and plumbing rough-in',
                    estimatedDays: 30,
                    dependencies: ['envelope'],
                    tasks: [
                        { id: 't32', name: 'HVAC rough-in', description: 'Install HVAC system rough-in', estimatedHours: 64 },
                        { id: 't33', name: 'Electrical rough-in', description: 'Install electrical system rough-in', estimatedHours: 80 },
                        { id: 't34', name: 'Plumbing rough-in', description: 'Install plumbing system rough-in', estimatedHours: 56 },
                        { id: 't35', name: 'Fire protection systems', description: 'Install fire protection and sprinkler systems', estimatedHours: 32 },
                        { id: 't36', name: 'Low-voltage systems (security, data)', description: 'Install security and data systems', estimatedHours: 28 }
                    ]
                },
                {
                    id: 'interior-finishes',
                    name: 'Interior Finishes Phase',
                    description: 'Interior walls, floors, ceilings, and fixtures',
                    estimatedDays: 40,
                    dependencies: ['interior-systems'],
                    tasks: [
                        { id: 't37', name: 'Drywall and painting', description: 'Install drywall and complete interior painting', estimatedHours: 80 },
                        { id: 't38', name: 'Flooring installation', description: 'Install all interior flooring', estimatedHours: 64 },
                        { id: 't39', name: 'Ceiling systems', description: 'Install ceiling systems and fixtures', estimatedHours: 48 },
                        { id: 't40', name: 'Millwork and cabinetry', description: 'Install built-in millwork and cabinetry', estimatedHours: 40 },
                        { id: 't41', name: 'Fixtures and equipment', description: 'Install light fixtures and equipment', estimatedHours: 32 }
                    ]
                },
                {
                    id: 'commissioning',
                    name: 'Commissioning & Closeout Phase',
                    description: 'Final testing, inspections, and project handover',
                    estimatedDays: 15,
                    dependencies: ['interior-finishes'],
                    tasks: [
                        { id: 't42', name: 'Final inspections and testing', description: 'Conduct final building inspections and testing', estimatedHours: 24 },
                        { id: 't43', name: 'Systems commissioning (HVAC, electrical, fire)', description: 'Commission all building systems', estimatedHours: 32 },
                        { id: 't44', name: 'Punch list resolution', description: 'Address all punch list items', estimatedHours: 40 },
                        { id: 't45', name: 'Occupancy permit', description: 'Obtain final occupancy permit', estimatedHours: 8 },
                        { id: 't46', name: 'Handover and documentation', description: 'Complete project handover and documentation', estimatedHours: 16 },
                        { id: 't47', name: 'Warranty and maintenance setup', description: 'Establish warranty and maintenance programs', estimatedHours: 8 }
                    ]
                }
            ],
            documents: [
                { id: 'd1', name: 'Project Charter', description: 'Formal project authorization and scope definition', required: true },
                { id: 'd2', name: 'Educational Facility Design Standards', description: 'School-specific design standards and requirements', required: true },
                { id: 'd3', name: 'Site Survey Report', description: 'Detailed site condition and suitability assessment', required: true },
                { id: 'd4', name: 'Environmental Impact Assessment', description: 'Environmental impact and mitigation measures', required: true },
                { id: 'd5', name: 'Architectural Drawings', description: 'Complete architectural design and layout drawings', required: true },
                { id: 'd6', name: 'Structural Engineering Report', description: 'Structural analysis and design calculations', required: true },
                { id: 'd7', name: 'MEP Design Plans', description: 'Mechanical, electrical, and plumbing system designs', required: true },
                { id: 'd8', name: 'Building Permits', description: 'All required building and construction permits', required: true },
                { id: 'd9', name: 'Safety Plan', description: 'Comprehensive construction safety procedures and protocols', required: true },
                { id: 'd10', name: 'Accessibility Compliance', description: 'ADA and accessibility compliance documentation', required: true },
                { id: 'd11', name: 'Fire Safety Systems', description: 'Fire protection and emergency systems documentation', required: true },
                { id: 'd12', name: 'Material Certificates', description: 'Quality certificates for all building materials', required: true },
                { id: 'd13', name: 'Final Inspection Report', description: 'Final building inspection and approval documentation', required: true },
                { id: 'd14', name: 'As-Built Drawings', description: 'Final drawings reflecting actual construction', required: true },
                { id: 'd15', name: 'Operation Manual', description: 'Building operation and maintenance manual', required: true },
                { id: 'd16', name: 'Warranty Documentation', description: 'All warranty and guarantee documentation', required: true }
            ]
        },
        {
            id: 'agriculture-modernization',
            name: 'Agriculture Modernization',
            icon: lucide_react_1.Wrench,
            description: 'Modernization of agricultural practices with focus on sustainable farming and technology integration',
            estimatedDuration: '6-12 months',
            category: 'Agriculture',
            budgetRange: '$300K - $1.5M',
            phases: [
                {
                    id: 'assessment',
                    name: 'Agricultural Assessment',
                    description: 'Assess current farming practices and modernization needs',
                    estimatedDays: 15,
                    tasks: [
                        { id: 't1', name: 'Farm assessment', description: 'Assess current farming practices and productivity', estimatedHours: 24 },
                        { id: 't2', name: 'Soil analysis', description: 'Conduct comprehensive soil testing and analysis', estimatedHours: 16 },
                        { id: 't3', name: 'Water resource evaluation', description: 'Evaluate water resources and irrigation needs', estimatedHours: 12 },
                        { id: 't4', name: 'Technology gap analysis', description: 'Identify technology gaps and opportunities', estimatedHours: 20 }
                    ]
                },
                {
                    id: 'planning',
                    name: 'Modernization Planning',
                    description: 'Develop comprehensive modernization plan',
                    estimatedDays: 20,
                    dependencies: ['assessment'],
                    tasks: [
                        { id: 't5', name: 'Technology integration plan', description: 'Develop plan for agricultural technology integration', estimatedHours: 32 },
                        { id: 't6', name: 'Sustainable farming strategy', description: 'Create sustainable farming and environmental strategy', estimatedHours: 24 },
                        { id: 't7', name: 'Training curriculum development', description: 'Develop farmer training programs and materials', estimatedHours: 28 },
                        { id: 't8', name: 'Equipment specifications', description: 'Specify required agricultural equipment and tools', estimatedHours: 16 }
                    ]
                },
                {
                    id: 'implementation',
                    name: 'Implementation',
                    description: 'Implement modernization technologies and practices',
                    estimatedDays: 60,
                    dependencies: ['planning'],
                    tasks: [
                        { id: 't9', name: 'Equipment installation', description: 'Install new agricultural equipment and technology', estimatedHours: 80 },
                        { id: 't10', name: 'Irrigation system setup', description: 'Install modern irrigation and water management systems', estimatedHours: 60 },
                        { id: 't11', name: 'Greenhouse construction', description: 'Build modern greenhouse facilities', estimatedHours: 100 },
                        { id: 't12', name: 'Technology integration', description: 'Integrate IoT sensors and monitoring systems', estimatedHours: 40 },
                        { id: 't13', name: 'Soil improvement', description: 'Implement soil improvement and conservation practices', estimatedHours: 48 }
                    ]
                },
                {
                    id: 'training',
                    name: 'Training & Capacity Building',
                    description: 'Train farmers and build local capacity',
                    estimatedDays: 30,
                    dependencies: ['implementation'],
                    tasks: [
                        { id: 't14', name: 'Farmer training programs', description: 'Conduct comprehensive farmer training sessions', estimatedHours: 60 },
                        { id: 't15', name: 'Technology workshops', description: 'Train farmers on new technology and equipment', estimatedHours: 40 },
                        { id: 't16', name: 'Sustainable practices education', description: 'Educate on sustainable farming practices', estimatedHours: 32 },
                        { id: 't17', name: 'Local technician training', description: 'Train local technicians for equipment maintenance', estimatedHours: 24 }
                    ]
                },
                {
                    id: 'monitoring',
                    name: 'Monitoring & Support',
                    description: 'Monitor progress and provide ongoing support',
                    estimatedDays: 45,
                    dependencies: ['training'],
                    tasks: [
                        { id: 't18', name: 'Performance monitoring', description: 'Monitor agricultural productivity and improvements', estimatedHours: 40 },
                        { id: 't19', name: 'Technical support', description: 'Provide ongoing technical support and maintenance', estimatedHours: 60 },
                        { id: 't20', name: 'Data collection and analysis', description: 'Collect and analyze agricultural performance data', estimatedHours: 32 },
                        { id: 't21', name: 'Continuous improvement', description: 'Implement continuous improvement based on results', estimatedHours: 28 }
                    ]
                }
            ],
            documents: [
                { id: 'd1', name: 'Agricultural Assessment Report', description: 'Comprehensive assessment of current farming practices', required: true },
                { id: 'd2', name: 'Soil Analysis Report', description: 'Detailed soil testing and analysis results', required: true },
                { id: 'd3', name: 'Modernization Plan', description: 'Detailed plan for agricultural modernization', required: true },
                { id: 'd4', name: 'Technology Specifications', description: 'Specifications for agricultural technology and equipment', required: true },
                { id: 'd5', name: 'Training Materials', description: 'Training programs and educational materials', required: true },
                { id: 'd6', name: 'Environmental Impact Assessment', description: 'Assessment of environmental impact and sustainability', required: true },
                { id: 'd7', name: 'Performance Monitoring Reports', description: 'Regular reports on agricultural performance and improvements', required: false },
                { id: 'd8', name: 'Maintenance Manuals', description: 'Equipment operation and maintenance manuals', required: false }
            ]
        },
        {
            id: 'coastal-protection',
            name: 'Coastal Protection & Climate Resilience',
            icon: lucide_react_1.Shield,
            description: 'Coastal protection and climate resilience projects including sea walls and mangrove restoration',
            estimatedDuration: '2-4 months',
            category: 'Environmental',
            budgetRange: '$800K - $3M',
            phases: [
                {
                    id: 'assessment',
                    name: 'Coastal Assessment',
                    description: 'Assess coastal conditions and climate risks',
                    estimatedDays: 10,
                    tasks: [
                        { id: 't1', name: 'Coastal mapping', description: 'Map coastal areas and identify vulnerable zones', estimatedHours: 20 },
                        { id: 't2', name: 'Erosion analysis', description: 'Analyze coastal erosion patterns and causes', estimatedHours: 16 },
                        { id: 't3', name: 'Climate risk assessment', description: 'Assess climate change risks and impacts', estimatedHours: 24 },
                        { id: 't4', name: 'Mangrove evaluation', description: 'Evaluate existing mangrove ecosystems', estimatedHours: 12 }
                    ]
                },
                {
                    id: 'design',
                    name: 'Protection Design',
                    description: 'Design coastal protection and restoration systems',
                    estimatedDays: 20,
                    dependencies: ['assessment'],
                    tasks: [
                        { id: 't5', name: 'Seawall design', description: 'Design coastal protection structures', estimatedHours: 40 },
                        { id: 't6', name: 'Mangrove restoration plan', description: 'Plan mangrove restoration and protection', estimatedHours: 32 },
                        { id: 't7', name: 'Drainage system design', description: 'Design coastal drainage and water management', estimatedHours: 24 },
                        { id: 't8', name: 'Environmental mitigation', description: 'Plan environmental mitigation measures', estimatedHours: 20 }
                    ]
                },
                {
                    id: 'implementation',
                    name: 'Construction & Restoration',
                    description: 'Implement coastal protection and restoration',
                    estimatedDays: 45,
                    dependencies: ['design'],
                    tasks: [
                        { id: 't9', name: 'Seawall construction', description: 'Build coastal protection structures', estimatedHours: 120 },
                        { id: 't10', name: 'Mangrove planting', description: 'Plant and establish mangrove ecosystems', estimatedHours: 80 },
                        { id: 't11', name: 'Drainage installation', description: 'Install coastal drainage systems', estimatedHours: 60 },
                        { id: 't12', name: 'Erosion control', description: 'Implement erosion control measures', estimatedHours: 40 }
                    ]
                },
                {
                    id: 'monitoring',
                    name: 'Monitoring & Maintenance',
                    description: 'Monitor effectiveness and maintain systems',
                    estimatedDays: 30,
                    dependencies: ['implementation'],
                    tasks: [
                        { id: 't13', name: 'Environmental monitoring', description: 'Monitor environmental impact and effectiveness', estimatedHours: 40 },
                        { id: 't14', name: 'Structural monitoring', description: 'Monitor structural integrity and performance', estimatedHours: 32 },
                        { id: 't15', name: 'Maintenance planning', description: 'Develop long-term maintenance plans', estimatedHours: 24 },
                        { id: 't16', name: 'Community engagement', description: 'Engage communities in protection efforts', estimatedHours: 20 }
                    ]
                }
            ],
            documents: [
                { id: 'd1', name: 'Coastal Assessment Report', description: 'Comprehensive coastal condition and risk analysis', required: true },
                { id: 'd2', name: 'Climate Risk Assessment', description: 'Assessment of climate change risks and impacts', required: true },
                { id: 'd3', name: 'Protection Design Plans', description: 'Detailed design plans for coastal protection', required: true },
                { id: 'd4', name: 'Environmental Impact Assessment', description: 'Assessment of environmental impact and mitigation', required: true },
                { id: 'd5', name: 'Construction Specifications', description: 'Detailed construction specifications and requirements', required: true },
                { id: 'd6', name: 'Monitoring Plan', description: 'Long-term monitoring and maintenance plan', required: true },
                { id: 'd7', name: 'Community Engagement Report', description: 'Community involvement and education activities', required: false }
            ]
        }
    ];
    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setSelectedPhases([]);
        setSelectedDocuments([]);
    };
    const handlePhaseToggle = (phaseId) => {
        console.log('handlePhaseToggle called with phaseId:', phaseId);
        setSelectedPhases(prev => {
            const newSelection = prev.includes(phaseId)
                ? prev.filter(id => id !== phaseId)
                : [...prev, phaseId];
            console.log('New selectedPhases:', newSelection);
            return newSelection;
        });
    };
    const handleDocumentToggle = (docId) => {
        setSelectedDocuments(prev => prev.includes(docId)
            ? prev.filter(id => id !== docId)
            : [...prev, docId]);
    };
    const handleGenerateProject = () => {
        console.log('handleGenerateProject called');
        console.log('selectedTemplate:', selectedTemplate);
        console.log('selectedPhases:', selectedPhases);
        console.log('selectedDocuments:', selectedDocuments);
        if (selectedTemplate) {
            const templateData = {
                ...selectedTemplate,
                selectedPhases: selectedPhases,
                selectedDocuments: selectedDocuments
            };
            console.log('Calling onTemplateSelect with:', templateData);
            onTemplateSelect(templateData);
        }
        else {
            console.error('No template selected');
        }
    };
    if (!selectedTemplate) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-6xl mx-auto p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-3xl font-bold text-gray-900 mb-4", children: "\uD83C\uDFD7\uFE0F Guyana Project Templates" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Choose from our comprehensive project templates designed for Guyana's infrastructure and development needs." })] }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6", children: templates.map((template) => {
                        const TemplateIcon = template.icon;
                        return ((0, jsx_runtime_1.jsxs)("div", { onClick: () => handleTemplateSelect(template), className: "bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 cursor-pointer transition-all duration-200", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center mb-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-3 bg-blue-100 rounded-lg mr-4", children: (0, jsx_runtime_1.jsx)(TemplateIcon, { className: "h-8 w-8 text-blue-600" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xl font-semibold text-gray-900", children: template.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-blue-600 font-medium", children: template.category })] })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-4", children: template.description }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-2 mb-4", children: [(0, jsx_runtime_1.jsxs)("span", { className: "px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-3 w-3 inline mr-1" }), template.estimatedDuration] }), (0, jsx_runtime_1.jsxs)("span", { className: "px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { className: "h-3 w-3 inline mr-1" }), template.budgetRange] }), (0, jsx_runtime_1.jsxs)("span", { className: "px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Users, { className: "h-3 w-3 inline mr-1" }), template.phases.length, " Phases"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center text-sm text-gray-500", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { className: "h-4 w-4 mr-1" }), template.documents.length, " Required Documents"] })] }, template.id));
                    }) }), (0, jsx_runtime_1.jsx)("div", { className: "mt-8 flex justify-end", children: (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors", children: "Cancel" }) })] }));
    }
    const TemplateIcon = selectedTemplate.icon;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-6xl mx-auto p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center mb-4", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setSelectedTemplate(null), className: "mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors", children: "\u2190 Back to Templates" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-3 bg-blue-100 rounded-lg mr-4", children: (0, jsx_runtime_1.jsx)(TemplateIcon, { className: "h-8 w-8 text-blue-600" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-3xl font-bold text-gray-900", children: selectedTemplate.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-blue-600 font-medium", children: selectedTemplate.category })] })] })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-4", children: selectedTemplate.description }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap gap-2", children: [(0, jsx_runtime_1.jsxs)("span", { className: "px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-3 w-3 inline mr-1" }), selectedTemplate.estimatedDuration] }), (0, jsx_runtime_1.jsxs)("span", { className: "px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { className: "h-3 w-3 inline mr-1" }), selectedTemplate.budgetRange] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-xl font-semibold text-gray-900 mb-4 flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "h-5 w-5 mr-2" }), "Project Phases"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-6", children: "Select the phases you want to include in your project:" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: selectedTemplate.phases.map((phase) => ((0, jsx_runtime_1.jsx)("div", { className: "border border-gray-200 rounded-lg p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-3", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", id: phase.id, checked: selectedPhases.includes(phase.id), onChange: () => handlePhaseToggle(phase.id), className: "mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: phase.id, className: "font-medium text-gray-900 cursor-pointer", children: phase.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 mt-1", children: phase.description }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4 mt-2 text-xs text-gray-500", children: [(0, jsx_runtime_1.jsxs)("span", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-3 w-3" }), phase.estimatedDays, " days"] }), (0, jsx_runtime_1.jsxs)("span", { className: "flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Users, { className: "h-3 w-3" }), phase.tasks.length, " tasks"] })] })] })] }) }, phase.id))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-xl font-semibold text-gray-900 mb-4 flex items-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { className: "h-5 w-5 mr-2" }), "Required Documents"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-6", children: "Select the documents you need for this project:" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-3", children: selectedTemplate.documents.map((doc) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-start gap-3 p-3 border border-gray-200 rounded-lg", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", id: doc.id, checked: selectedDocuments.includes(doc.id), onChange: () => handleDocumentToggle(doc.id), className: "mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsxs)("label", { htmlFor: doc.id, className: "font-medium text-gray-900 cursor-pointer flex items-center gap-2", children: [doc.name, doc.required && ((0, jsx_runtime_1.jsx)("span", { className: "px-2 py-1 bg-red-100 text-red-800 rounded text-xs", children: "Required" }))] }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 mt-1", children: doc.description })] })] }, doc.id))) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-8 flex justify-end gap-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors", children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleGenerateProject, disabled: selectedPhases.length === 0, className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors", children: "Create Project from Template" }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-2 p-2 bg-gray-100 text-xs text-gray-600 rounded", children: ["Debug: selectedPhases=", JSON.stringify(selectedPhases), " (", selectedPhases.length, " selected), selectedDocuments=", JSON.stringify(selectedDocuments), " (", selectedDocuments.length, " selected)"] })] })] }));
};
exports.default = ProjectPlanningTemplates;
//# sourceMappingURL=ProjectPlanningTemplates.js.map