-- Guyana-Style Sample Projects for PM Application v2
-- Based on the Guyana-Civic project templates

-- Insert Guyana-style project templates
INSERT IGNORE INTO project_templates (
    id, name, description, category, template_data, created_by
) VALUES (
    'template-road-construction',
    'Road Construction & Repair',
    'Complete road construction, repair, and maintenance projects for Guyana infrastructure',
    'Infrastructure',
    JSON_OBJECT(
        'phases', JSON_ARRAY('Project Initiation', 'Site Analysis & Survey', 'Design & Planning', 'Procurement & Permits', 'Construction & Execution', 'Testing & Handover'),
        'default_tasks', JSON_ARRAY('Project kickoff meeting', 'Site access coordination', 'Road condition survey', 'Engineering design', 'Material procurement', 'Site preparation', 'Quality testing'),
        'estimated_duration', 120,
        'budget_range', '500K - 2M USD',
        'required_roles', JSON_ARRAY('Project Manager', 'Civil Engineer', 'Site Supervisor', 'Safety Officer', 'Quality Inspector'),
        'required_documents', JSON_ARRAY('Site Survey Report', 'Traffic Impact Study', 'Engineering Drawings', 'Material Test Reports', 'Safety Plan')
    ),
    'admin-001'
),
(
    'template-building-construction',
    'Building Construction',
    'Construct new buildings including community centers, offices, and public facilities',
    'Infrastructure',
    JSON_OBJECT(
        'phases', JSON_ARRAY('Project Initiation', 'Design & Planning', 'Permits & Approvals', 'Procurement & Setup', 'Construction', 'Testing & Handover'),
        'default_tasks', JSON_ARRAY('Stakeholder meeting', 'Site survey', 'Architectural design', 'Building permits', 'Material procurement', 'Foundation work', 'System testing'),
        'estimated_duration', 180,
        'budget_range', '1M - 5M USD',
        'required_roles', JSON_ARRAY('Project Manager', 'Architect', 'Structural Engineer', 'MEP Engineer', 'Construction Manager'),
        'required_documents', JSON_ARRAY('Project Charter', 'Architectural Drawings', 'Structural Engineering Report', 'Building Permits', 'Final Inspection Report')
    ),
    'admin-001'
),
(
    'template-agriculture-modernization',
    'Agriculture Modernization',
    'Modernization of agricultural practices with focus on sustainable farming and technology integration',
    'Agriculture',
    JSON_OBJECT(
        'phases', JSON_ARRAY('Agricultural Assessment', 'Modernization Planning', 'Implementation', 'Training & Capacity Building', 'Monitoring & Support'),
        'default_tasks', JSON_ARRAY('Farm assessment', 'Soil analysis', 'Technology integration plan', 'Equipment installation', 'Farmer training programs', 'Performance monitoring'),
        'estimated_duration', 365,
        'budget_range', '300K - 1.5M USD',
        'required_roles', JSON_ARRAY('Project Manager', 'Agricultural Specialist', 'Technology Expert', 'Training Coordinator', 'Field Supervisor'),
        'required_documents', JSON_ARRAY('Agricultural Assessment Report', 'Soil Analysis Report', 'Modernization Plan', 'Training Materials', 'Performance Monitoring Reports')
    ),
    'admin-001'
),
(
    'template-coastal-protection',
    'Coastal Protection & Climate Resilience',
    'Coastal protection and climate resilience projects including sea walls and mangrove restoration',
    'Environmental',
    JSON_OBJECT(
        'phases', JSON_ARRAY('Coastal Assessment', 'Protection Design', 'Construction & Restoration', 'Monitoring & Maintenance'),
        'default_tasks', JSON_ARRAY('Coastal mapping', 'Erosion analysis', 'Seawall design', 'Mangrove planting', 'Environmental monitoring', 'Maintenance planning'),
        'estimated_duration', 150,
        'budget_range', '800K - 3M USD',
        'required_roles', JSON_ARRAY('Project Manager', 'Environmental Engineer', 'Marine Engineer', 'Ecologist', 'Community Coordinator'),
        'required_documents', JSON_ARRAY('Coastal Assessment Report', 'Climate Risk Assessment', 'Protection Design Plans', 'Environmental Impact Assessment', 'Monitoring Plan')
    ),
    'admin-001'
);

-- Insert sample Guyana-style projects
INSERT IGNORE INTO projects (
    id, code, name, description, category, status, priority, budget_allocated, budget_spent, currency, 
    start_date, end_date, project_manager_id, created_by
) VALUES (
    'proj-anna-regina',
    'AR-INFRA-2024',
    'Anna Regina Infrastructure Development',
    'Comprehensive infrastructure development project for Anna Regina including roads, utilities, and public facilities. This project aims to modernize the town\'s infrastructure to support growing population and economic development.',
    'infrastructure',
    'active',
    'high',
    5000000.00,
    1750000.00,
    'USD',
    '2024-01-15',
    '2025-12-31',
    'admin-001',
    'admin-001'
),
(
    'proj-georgetown-smart',
    'GT-SMART-2024',
    'Georgetown Smart City Initiative',
    'Implementation of smart city technologies including IoT sensors, data analytics, and digital governance systems. This project will transform Georgetown into a modern, digitally-enabled city.',
    'technology',
    'planning',
    'high',
    8000000.00,
    1200000.00,
    'USD',
    '2024-03-01',
    '2026-06-30',
    'admin-001',
    'admin-001'
),
(
    'proj-berbice-agri',
    'BR-AGRI-2024',
    'Berbice Agricultural Modernization',
    'Modernization of agricultural practices in Berbice region with focus on sustainable farming and technology integration. This project will help local farmers adopt modern agricultural techniques and improve productivity.',
    'agriculture',
    'active',
    'medium',
    3000000.00,
    840000.00,
    'USD',
    '2024-01-01',
    '2025-08-31',
    'admin-001',
    'admin-001'
),
(
    'proj-essequibo-coastal',
    'ES-COAST-2024',
    'Essequibo Coastal Protection',
    'Coastal protection and climate resilience project for Essequibo region including sea walls and mangrove restoration. This project addresses climate change impacts and protects vulnerable coastal communities.',
    'environmental',
    'planning',
    'high',
    4500000.00,
    225000.00,
    'USD',
    '2024-04-01',
    '2026-03-31',
    'admin-001',
    'admin-001'
),
(
    'proj-linden-mining',
    'LD-MINING-2024',
    'Linden Mining Infrastructure',
    'Development of mining infrastructure and supporting facilities in Linden. This project includes road improvements, utility upgrades, and community facilities to support the mining industry.',
    'road-building',
    'active',
    'medium',
    2500000.00,
    650000.00,
    'USD',
    '2024-02-01',
    '2025-10-31',
    'admin-001',
    'admin-001'
),
(
    'proj-new-amsterdam',
    'NA-URBAN-2024',
    'New Amsterdam Urban Renewal',
    'Urban renewal and development project for New Amsterdam including housing, commercial spaces, and public amenities. This project aims to revitalize the historic town center.',
    'construction',
    'planning',
    'medium',
    1800000.00,
    150000.00,
    'USD',
    '2024-05-01',
    '2025-12-31',
    'admin-001',
    'admin-001'
),
(
    'proj-lethem-border',
    'LT-BORDER-2024',
    'Lethem Border Development',
    'Development of border infrastructure and trade facilities in Lethem. This project includes customs facilities, road improvements, and market development to enhance cross-border trade.',
    'infrastructure',
    'active',
    'high',
    3200000.00,
    480000.00,
    'USD',
    '2024-01-15',
    '2025-09-30',
    'admin-001',
    'admin-001'
),
(
    'proj-mabaruma-health',
    'MB-HEALTH-2024',
    'Mabaruma Health Infrastructure',
    'Development of health infrastructure and medical facilities in Mabaruma. This project includes new hospital construction, medical equipment procurement, and healthcare worker training.',
    'healthcare',
    'active',
    'high',
    2200000.00,
    320000.00,
    'USD',
    '2024-03-01',
    '2025-11-30',
    'admin-001',
    'admin-001'
);

-- Insert sample project schedules
INSERT IGNORE INTO project_schedules (
    id, project_id, name, description, start_date, end_date, status, created_by
) VALUES (
    'sched-anna-regina-1',
    'proj-anna-regina',
    'Anna Regina Phase 1 - Planning & Design',
    'Initial planning and design phase for Anna Regina infrastructure development',
    '2024-01-15',
    '2024-06-30',
    'in_progress',
    'admin-001'
),
(
    'sched-anna-regina-2',
    'proj-anna-regina',
    'Anna Regina Phase 2 - Construction',
    'Main construction phase for Anna Regina infrastructure',
    '2024-07-01',
    '2025-06-30',
    'planned',
    'admin-001'
),
(
    'sched-berbice-agri-1',
    'proj-berbice-agri',
    'Agricultural Assessment & Planning',
    'Assessment of current agricultural practices and modernization planning',
    '2024-01-01',
    '2024-04-30',
    'in_progress',
    'admin-001'
),
(
    'sched-berbice-agri-2',
    'proj-berbice-agri',
    'Technology Implementation',
    'Implementation of modern agricultural technologies and equipment',
    '2024-05-01',
    '2024-12-31',
    'planned',
    'admin-001'
),
(
    'sched-georgetown-smart-1',
    'proj-georgetown-smart',
    'Smart City Planning & Design',
    'Planning and design phase for smart city implementation',
    '2024-03-01',
    '2024-08-31',
    'in_progress',
    'admin-001'
),
(
    'sched-essequibo-coastal-1',
    'proj-essequibo-coastal',
    'Coastal Assessment & Design',
    'Environmental assessment and protection design for coastal areas',
    '2024-04-01',
    '2024-09-30',
    'in_progress',
    'admin-001'
);

-- Insert sample tasks
INSERT IGNORE INTO tasks (
    id, schedule_id, name, description, status, priority, assigned_to, due_date, created_by
) VALUES (
    'task-anna-regina-1',
    'sched-anna-regina-1',
    'Site Survey and Assessment',
    'Conduct comprehensive site survey for Anna Regina infrastructure development including roads, utilities, and public facilities',
    'in_progress',
    'high',
    'admin-001',
    '2024-02-15',
    'admin-001'
),
(
    'task-anna-regina-2',
    'sched-anna-regina-1',
    'Environmental Impact Assessment',
    'Complete environmental impact assessment for infrastructure development project',
    'pending',
    'high',
    'admin-001',
    '2024-03-01',
    'admin-001'
),
(
    'task-anna-regina-3',
    'sched-anna-regina-1',
    'Stakeholder Consultation',
    'Engage with local communities and stakeholders for project planning',
    'completed',
    'medium',
    'admin-001',
    '2024-01-31',
    'admin-001'
),
(
    'task-berbice-agri-1',
    'sched-berbice-agri-1',
    'Farm Assessment and Analysis',
    'Assess current farming practices and productivity in Berbice region',
    'in_progress',
    'medium',
    'admin-001',
    '2024-02-28',
    'admin-001'
),
(
    'task-berbice-agri-2',
    'sched-berbice-agri-1',
    'Soil Testing and Analysis',
    'Conduct comprehensive soil testing and analysis for agricultural modernization',
    'pending',
    'high',
    'admin-001',
    '2024-03-15',
    'admin-001'
),
(
    'task-georgetown-smart-1',
    'sched-georgetown-smart-1',
    'Technology Assessment',
    'Assess available smart city technologies and vendors for implementation',
    'in_progress',
    'high',
    'admin-001',
    '2024-04-30',
    'admin-001'
),
(
    'task-essequibo-coastal-1',
    'sched-essequibo-coastal-1',
    'Coastal Mapping and Survey',
    'Map coastal areas and identify vulnerable zones for protection planning',
    'pending',
    'high',
    'admin-001',
    '2024-05-15',
    'admin-001'
);
