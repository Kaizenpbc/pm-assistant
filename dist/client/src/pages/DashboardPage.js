"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardPage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const authStore_1 = require("../stores/authStore");
const api_1 = require("../services/api");
const react_router_dom_1 = require("react-router-dom");
const LoadingSpinner_1 = require("../components/LoadingSpinner");
const AIAssistant_1 = require("../components/AIAssistant");
const ProjectCreationModal_1 = __importDefault(require("../components/ProjectCreationModal"));
const ProjectEditModal_1 = __importDefault(require("../components/ProjectEditModal"));
const lucide_react_1 = require("lucide-react");
const DashboardPage = () => {
    const { user, logout } = (0, authStore_1.useAuthStore)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [searchParams] = (0, react_router_dom_1.useSearchParams)();
    const [aiAssistant, setAIAssistant] = (0, react_1.useState)({ isOpen: false, type: 'chat' });
    const [showCreateProject, setShowCreateProject] = (0, react_1.useState)(false);
    const [showEditProject, setShowEditProject] = (0, react_1.useState)(false);
    const [editingProject, setEditingProject] = (0, react_1.useState)(null);
    console.log('🏠 DashboardPage: Component rendered');
    console.log('📊 DashboardPage: Initial showCreateProject state:', showCreateProject);
    if (showCreateProject) {
        console.log('🎨 MODAL SHOULD BE VISIBLE NOW!');
    }
    const { data: projectsData, isLoading, error, refetch } = (0, react_query_1.useQuery)({
        queryKey: ['projects'],
        queryFn: () => api_1.apiService.getProjects(),
    });
    const projects = projectsData?.projects || [];
    if (isLoading) {
        console.log('🔄 Dashboard is loading projects...');
    }
    if (error) {
        console.error('❌ Dashboard error:', error);
    }
    if (projectsData) {
        console.log('✅ Dashboard received projects:', projects.length);
    }
    (0, react_1.useEffect)(() => {
        const action = searchParams.get('action');
        const shared = searchParams.get('shared');
        if (action === 'create-project') {
            setShowCreateProject(true);
        }
        else if (action === 'ai-tasks') {
            setAIAssistant({ isOpen: true, type: 'analysis' });
        }
        else if (action === 'view-schedules') {
            if (projectsData && projectsData.length > 0) {
                navigate(`/project/${projectsData[0].id}/schedule`);
            }
        }
        if (shared === 'true') {
            console.log('Shared content received');
        }
    }, [searchParams, navigate, projectsData]);
    const handleLogout = async () => {
        try {
            await api_1.apiService.logout();
            logout();
            navigate('/login');
        }
        catch (error) {
            console.error('Logout error:', error);
            logout();
            navigate('/login');
        }
    };
    const handleEditProject = (project) => {
        console.log('✏️ Editing project:', project);
        setEditingProject(project);
        setShowEditProject(true);
    };
    const handleUpdateProject = async (updatedProjectData) => {
        try {
            console.log('🔄 Updating project:', editingProject?.id, updatedProjectData);
            await api_1.apiService.updateProject(editingProject?.id, updatedProjectData);
            setShowEditProject(false);
            setEditingProject(null);
            if (refetch) {
                await refetch();
                console.log('✅ Projects list refreshed after update');
            }
        }
        catch (error) {
            console.error('Error updating project:', error);
            alert('Failed to update project. Please try again.');
        }
    };
    const handlePortfolioAnalysis = () => {
        setAIAssistant({ isOpen: true, type: 'analysis' });
    };
    const handleAdvancedAnalytics = () => {
        setAIAssistant({ isOpen: true, type: 'analysis' });
    };
    const handleProjectHealth = () => {
        setAIAssistant({ isOpen: true, type: 'analysis' });
    };
    const handleResourceAllocation = () => {
        setAIAssistant({ isOpen: true, type: 'recommendations' });
    };
    const handleRiskTrends = () => {
        setAIAssistant({ isOpen: true, type: 'analysis' });
    };
    const handleDeadlines = () => {
        setAIAssistant({ isOpen: true, type: 'recommendations' });
    };
    const handleEscalations = () => {
        setAIAssistant({ isOpen: true, type: 'recommendations' });
    };
    const handleApprovals = () => {
        setAIAssistant({ isOpen: true, type: 'recommendations' });
    };
    const handleSmartAlerts = () => {
        setAIAssistant({ isOpen: true, type: 'chat' });
    };
    const handleAITasks = () => {
        setAIAssistant({ isOpen: true, type: 'chat' });
    };
    const handleProjectClick = (project) => {
        console.log('Project clicked:', project);
        window.location.href = `/project/${project.id}`;
    };
    const handleViewRAID = (project) => {
        console.log('View RAID for project:', project);
        setAIAssistant({ isOpen: true, type: 'analysis' });
    };
    const handleViewSchedule = (project) => {
        console.log('View Schedule for project:', project);
        window.location.href = `/schedule/${project.id}`;
    };
    const handleGetAISuggestions = (project) => {
        console.log('AI Suggestions for project:', project);
        setAIAssistant({ isOpen: true, type: 'recommendations' });
    };
    const handleSmartIssueEscalationClick = (project) => {
        console.log('Issue Escalation for project:', project);
        setAIAssistant({ isOpen: true, type: 'recommendations' });
    };
    const handleSmartDecisionEngineClick = (project) => {
        console.log('Decision Engine for project:', project);
        setAIAssistant({ isOpen: true, type: 'analysis' });
    };
    const handleSmartActionPrioritizationClick = (project) => {
        console.log('Action Prioritization for project:', project);
        setAIAssistant({ isOpen: true, type: 'recommendations' });
    };
    if (isLoading) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen flex flex-col items-center justify-center", children: [(0, jsx_runtime_1.jsx)(LoadingSpinner_1.LoadingSpinner, { size: "lg" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-4 text-gray-600", children: "Loading projects..." }), (0, jsx_runtime_1.jsx)("button", { onClick: () => refetch(), className: "mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", children: "Retry" })] }));
    }
    if (error) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Failed to load projects" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-4", children: "There was an error loading your projects. Please try again." }), (0, jsx_runtime_1.jsx)("button", { onClick: () => window.location.reload(), className: "btn btn-primary", children: "Retry" })] }) }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-gray-50", children: [(0, jsx_runtime_1.jsx)("header", { className: "bg-white shadow-sm border-b", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("span", { className: "text-white text-xl", children: "\uD83D\uDCCA" }) }), (0, jsx_runtime_1.jsx)("h1", { className: "text-3xl font-bold text-gray-900", children: "Project Management Dashboard" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "h-4 w-4 text-white" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-900", children: user?.fullName || user?.username || 'Unknown User' }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-500", children: [user?.role?.toUpperCase() || 'USER', " \u2022 ", user?.username || 'N/A'] })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: handleLogout, className: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-colors", children: "Logout" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap items-center gap-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setShowCreateProject(true), className: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md", type: "button", children: "\u2795 Create New Project" }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => navigate('/monitoring'), className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md flex items-center gap-2", type: "button", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Activity, { className: "w-4 h-4" }), "System Monitoring"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => navigate('/performance'), className: "bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md flex items-center gap-2", type: "button", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BarChart3, { className: "w-4 h-4" }), "Performance Metrics"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: handlePortfolioAnalysis, className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BarChart3, { className: "h-4 w-4 mr-2" }), "Portfolio Analysis"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleAdvancedAnalytics, className: "bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Brain, { className: "h-4 w-4 mr-2" }), "Advanced Analytics"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleProjectHealth, className: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Target, { className: "h-4 w-4 mr-2" }), "Project Health"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleResourceAllocation, className: "bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Users, { className: "h-4 w-4 mr-2" }), "Resource Allocation"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleRiskTrends, className: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "h-4 w-4 mr-2" }), "Risk Trends"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleDeadlines, className: "bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-4 w-4 mr-2" }), "Deadlines"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleEscalations, className: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "h-4 w-4 mr-2" }), "Escalations"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleApprovals, className: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { className: "h-4 w-4 mr-2" }), "Approvals"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleSmartAlerts, className: "bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Bell, { className: "h-4 w-4 mr-2" }), "Smart Alerts"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleAITasks, className: "bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-md", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.User, { className: "h-4 w-4 mr-2" }), "AI Tasks"] })] })] }) }), (0, jsx_runtime_1.jsxs)("main", { className: "max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8", children: [(0, jsx_runtime_1.jsx)("div", { className: "card", children: (0, jsx_runtime_1.jsx)("div", { className: "card-content", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0", children: (0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("span", { className: "text-blue-600 text-lg", children: "\uD83D\uDCC1" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-500", children: "Total Projects" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-semibold text-gray-900", children: projects.length })] })] }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "card", children: (0, jsx_runtime_1.jsx)("div", { className: "card-content", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0", children: (0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("span", { className: "text-green-600 text-lg", children: "\u2705" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-500", children: "Active Projects" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-semibold text-gray-900", children: projects.filter((p) => p.status === 'active').length })] })] }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "card", children: (0, jsx_runtime_1.jsx)("div", { className: "card-content", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0", children: (0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("span", { className: "text-yellow-600 text-lg", children: "\u23F3" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-500", children: "Planning" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-semibold text-gray-900", children: projects.filter((p) => p.status === 'planning').length })] })] }) }) }), (0, jsx_runtime_1.jsx)("div", { className: "card", children: (0, jsx_runtime_1.jsx)("div", { className: "card-content", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0", children: (0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center", children: (0, jsx_runtime_1.jsx)("span", { className: "text-purple-600 text-lg", children: "\uD83C\uDFAF" }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-sm font-medium text-gray-500", children: "Completed" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-semibold text-gray-900", children: projects.filter((p) => p.status === 'completed').length })] })] }) }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-8", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "My Projects" }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white shadow-sm rounded-lg border", children: (0, jsx_runtime_1.jsx)("div", { className: "overflow-x-auto", children: (0, jsx_runtime_1.jsxs)("table", { className: "min-w-full", children: [(0, jsx_runtime_1.jsx)("thead", { className: "bg-gray-50 border-b", children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { className: "sticky left-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-r border-gray-200 min-w-[200px]", children: "Actions & Code" }), (0, jsx_runtime_1.jsx)("th", { className: "sticky left-[200px] z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-r border-gray-200 min-w-[200px]", children: "Project Name" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Created By" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Description" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Base Start" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Base Finish" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Projected Finish" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Projected Budget" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Spend to Date" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "% Complete" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Link to Risks" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "AI Suggestions" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Issue Escalation" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Decision Tracking" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Action Priority" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "View Schedule" }), (0, jsx_runtime_1.jsx)("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Link to Issues" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { className: "bg-white divide-y divide-gray-200", children: isLoading ? ((0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { colSpan: 17, className: "px-6 py-4 text-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-center space-x-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }), (0, jsx_runtime_1.jsx)("span", { children: "Loading projects..." })] }) }) })) : error ? ((0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { colSpan: 17, className: "px-6 py-4 text-center text-red-500", children: (0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center space-x-2", children: (0, jsx_runtime_1.jsx)("span", { children: "Failed to load projects" }) }) }) })) : projects && projects.length > 0 ? (projects.map((project) => {
                                                    return ((0, jsx_runtime_1.jsxs)("tr", { className: "hover:bg-gray-50 cursor-pointer transition-colors", onClick: () => handleProjectClick(project), children: [(0, jsx_runtime_1.jsxs)("td", { className: "sticky left-0 z-10 px-6 py-4 whitespace-nowrap bg-white border-r border-gray-200 min-w-[200px]", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2 mb-2", style: { backgroundColor: 'yellow', padding: '5px', border: '2px solid red' }, children: [(0, jsx_runtime_1.jsx)("button", { style: {
                                                                                    backgroundColor: 'lime',
                                                                                    color: 'black',
                                                                                    padding: '5px 10px',
                                                                                    border: '2px solid green',
                                                                                    fontSize: '12px',
                                                                                    fontWeight: 'bold'
                                                                                }, onClick: (e) => {
                                                                                    e.stopPropagation();
                                                                                    window.location.href = `/project/${project.id}`;
                                                                                }, children: "\uD83D\uDC41\uFE0F VIEW" }), (0, jsx_runtime_1.jsx)("button", { style: {
                                                                                    backgroundColor: 'blue',
                                                                                    color: 'white',
                                                                                    padding: '5px 10px',
                                                                                    border: '2px solid darkblue',
                                                                                    fontSize: '12px',
                                                                                    fontWeight: 'bold'
                                                                                }, onClick: (e) => {
                                                                                    e.stopPropagation();
                                                                                    handleEditProject(project);
                                                                                }, children: "\u270F\uFE0F EDIT" }), (0, jsx_runtime_1.jsx)("button", { style: {
                                                                                    backgroundColor: 'red',
                                                                                    color: 'white',
                                                                                    padding: '5px 10px',
                                                                                    border: '2px solid darkred',
                                                                                    fontSize: '12px',
                                                                                    fontWeight: 'bold'
                                                                                }, onClick: async (e) => {
                                                                                    e.stopPropagation();
                                                                                    if (window.confirm(`Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`)) {
                                                                                        try {
                                                                                            await api_1.apiService.deleteProject(project.id);
                                                                                            if (refetch) {
                                                                                                await refetch();
                                                                                                console.log('✅ Projects list refreshed after deletion');
                                                                                            }
                                                                                        }
                                                                                        catch (error) {
                                                                                            console.error('Failed to delete project:', error);
                                                                                            alert('Failed to delete project. Please try again.');
                                                                                        }
                                                                                    }
                                                                                }, children: "\uD83D\uDDD1\uFE0F DELETE" })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium text-blue-600", children: project.code || 'No Code' }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-500", children: ["ID: ", project.id] })] }), (0, jsx_runtime_1.jsx)("td", { className: "sticky left-[200px] z-10 px-6 py-4 whitespace-nowrap bg-white border-r border-gray-200 min-w-[200px]", children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium text-gray-900", children: project.name }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4", children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-900", children: (0, jsx_runtime_1.jsx)("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: project.created_by || 'Unknown' }) }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4", children: (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-900 max-w-xs truncate", children: project.description }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: project.plannedStartDate ? new Date(project.plannedStartDate).toLocaleDateString() : '-' }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: project.plannedEndDate ? new Date(project.plannedEndDate).toLocaleDateString() : '-' }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: project.projectedEndDate ? new Date(project.projectedEndDate).toLocaleDateString() : '-' }), (0, jsx_runtime_1.jsxs)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: ["$", project.budget?.toLocaleString() || '0'] }), (0, jsx_runtime_1.jsxs)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: ["$", project.spentToDate?.toLocaleString() || '0'] }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-16 bg-gray-200 rounded-full h-2 mr-2", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-blue-600 h-2 rounded-full", style: { width: `${project.progressPercentage || 0}%` } }) }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm text-gray-900", children: [project.progressPercentage || 0, "%"] })] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap", children: (0, jsx_runtime_1.jsx)("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                        project.status === 'in_progress' || project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                                                            project.status === 'initiate' ? 'bg-yellow-100 text-yellow-800' :
                                                                                project.status === 'planning' ? 'bg-purple-100 text-purple-800' :
                                                                                    'bg-gray-100 text-gray-800'}`, children: project.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN' }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: (0, jsx_runtime_1.jsx)("button", { className: "text-blue-600 hover:text-blue-800 hover:underline", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        handleViewRAID(project);
                                                                    }, children: "View RAID" }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: (0, jsx_runtime_1.jsxs)("button", { className: "text-purple-600 hover:text-purple-800 hover:underline flex items-center", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        handleGetAISuggestions(project);
                                                                    }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Lightbulb, { className: "h-4 w-4 mr-1" }), "AI Suggestions"] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: (0, jsx_runtime_1.jsxs)("button", { className: "text-orange-600 hover:text-orange-800 hover:underline flex items-center", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        handleSmartIssueEscalationClick(project);
                                                                    }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.TrendingUp, { className: "h-4 w-4 mr-1" }), "Escalation"] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: (0, jsx_runtime_1.jsxs)("button", { className: "text-indigo-600 hover:text-indigo-800 hover:underline flex items-center", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        handleSmartDecisionEngineClick(project);
                                                                    }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BarChart3, { className: "h-4 w-4 mr-1" }), "Decisions"] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: (0, jsx_runtime_1.jsxs)("button", { className: "bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-xs font-bold flex items-center", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        console.log('AI Priority button clicked for project:', project.name);
                                                                        handleSmartActionPrioritizationClick(project);
                                                                    }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Target, { className: "h-4 w-4 mr-1" }), "\uD83E\uDDE0 AI Priority"] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: (0, jsx_runtime_1.jsxs)("button", { className: "text-blue-600 hover:text-blue-800 hover:underline border border-blue-300 px-3 py-1 rounded-md flex items-center", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        handleViewSchedule(project);
                                                                    }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { className: "h-4 w-4 mr-1" }), "View Schedule"] }) }), (0, jsx_runtime_1.jsx)("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: (0, jsx_runtime_1.jsx)("button", { className: "text-green-600 hover:text-green-800 hover:underline", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        handleViewRAID(project);
                                                                    }, children: "View Issues" }) })] }, project.id));
                                                })) : ((0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsxs)("td", { colSpan: 17, className: "px-6 py-12 text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4", children: (0, jsx_runtime_1.jsx)("span", { className: "text-gray-400 text-2xl", children: "\uD83D\uDCC1" }) }), (0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No projects yet" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 mb-4", children: "Get started by creating your first project." }), (0, jsx_runtime_1.jsx)("button", { className: "btn btn-primary", children: "Create Project" })] }) })) })] }) }) })] })] }), aiAssistant.isOpen && ((0, jsx_runtime_1.jsx)(AIAssistant_1.AIAssistant, { type: aiAssistant.type, onClose: () => setAIAssistant({ isOpen: false, type: 'chat' }) })), showCreateProject && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [console.log('🚀 DashboardPage: Rendering ProjectCreationModal'), console.log('📊 DashboardPage: showCreateProject =', showCreateProject), (0, jsx_runtime_1.jsx)(ProjectCreationModal_1.default, { isOpen: showCreateProject, onClose: () => {
                            console.log('🔒 DashboardPage: Closing modal');
                            setShowCreateProject(false);
                        }, onCreateProject: async (projectData) => {
                            try {
                                console.log('🎯 DashboardPage: onCreateProject called');
                                console.log('📝 DashboardPage: Project data:', projectData);
                                const response = await api_1.apiService.createProject(projectData);
                                if (response.success) {
                                    console.log('✅ DashboardPage: Project created successfully:', response.project);
                                    if (refetch) {
                                        await refetch();
                                        console.log('✅ Projects list refreshed after creation');
                                    }
                                }
                                else {
                                    console.error('❌ DashboardPage: Failed to create project:', response.message);
                                    alert('Failed to create project: ' + response.message);
                                }
                            }
                            catch (error) {
                                console.error('💥 DashboardPage: Error creating project:', error);
                                alert('Error creating project: ' + error.message);
                            }
                            finally {
                                console.log('🔚 DashboardPage: Closing modal after project creation');
                                setShowCreateProject(false);
                            }
                        } })] })), showEditProject && editingProject && ((0, jsx_runtime_1.jsx)(ProjectEditModal_1.default, { isOpen: showEditProject, project: editingProject, onClose: () => {
                    setShowEditProject(false);
                    setEditingProject(null);
                }, onUpdate: handleUpdateProject }))] }));
};
exports.DashboardPage = DashboardPage;
//# sourceMappingURL=DashboardPage.js.map