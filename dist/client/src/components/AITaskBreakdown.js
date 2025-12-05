"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AITaskBreakdown = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = require("../services/api");
const AITaskBreakdown = ({ onTasksGenerated, projectId, existingDescription = '', projectName = '', projectCode = '', projectStatus = '' }) => {
    const createProjectContext = () => {
        const context = [];
        if (projectName)
            context.push(`Project Name: ${projectName}`);
        if (projectCode)
            context.push(`Project Code: ${projectCode}`);
        if (projectStatus)
            context.push(`Status: ${projectStatus}`);
        if (existingDescription)
            context.push(`Description: ${existingDescription}`);
        return context.join('\n');
    };
    const [projectDescription, setProjectDescription] = (0, react_1.useState)(() => {
        return createProjectContext() || existingDescription;
    });
    const detectProjectType = () => {
        const context = `${projectName} ${projectCode} ${existingDescription}`.toLowerCase();
        if (context.includes('construction') || context.includes('building') || context.includes('school')) {
            return 'construction_project';
        }
        if (context.includes('mobile') || context.includes('app')) {
            return 'mobile_app';
        }
        if (context.includes('web') || context.includes('website')) {
            return 'web_application';
        }
        if (context.includes('data') || context.includes('analytics')) {
            return 'data_project';
        }
        return 'general';
    };
    const [projectType, setProjectType] = (0, react_1.useState)(detectProjectType());
    const [isAnalyzing, setIsAnalyzing] = (0, react_1.useState)(false);
    const [analysis, setAnalysis] = (0, react_1.useState)(null);
    const [insights, setInsights] = (0, react_1.useState)(null);
    const [selectedTasks, setSelectedTasks] = (0, react_1.useState)([]);
    const [showAdvanced, setShowAdvanced] = (0, react_1.useState)(false);
    const projectTypes = [
        { value: 'construction_project', label: '🏗️ Construction Project' },
        { value: 'mobile_app', label: '📱 Mobile App Development' },
        { value: 'web_application', label: '🌐 Web Application' },
        { value: 'backend_service', label: '⚙️ Backend Service/API' },
        { value: 'data_project', label: '📊 Data Project' },
        { value: 'design_project', label: '🎨 Design Project' },
        { value: 'ai_ml_project', label: '🤖 AI/ML Project' },
        { value: 'iot_project', label: '🔌 IoT Project' },
        { value: 'general', label: '📋 General Project' }
    ];
    const handleAnalyzeProject = async () => {
        if (!projectDescription.trim()) {
            alert('Please enter a project description');
            return;
        }
        setIsAnalyzing(true);
        try {
            const response = await api_1.apiService.analyzeProject({
                projectDescription,
                projectType,
                existingTasks: []
            });
            setAnalysis(response.analysis);
            setInsights(response.insights);
            const allTaskIds = response.analysis.taskSuggestions.map((task) => task.id);
            setSelectedTasks(allTaskIds);
        }
        catch (error) {
            console.error('Error analyzing project:', error);
            alert('Failed to analyze project. Please try again.');
        }
        finally {
            setIsAnalyzing(false);
        }
    };
    const handleGenerateSchedule = () => {
        if (!analysis)
            return;
        const selectedTaskSuggestions = analysis.taskSuggestions.filter(task => selectedTasks.includes(task.id));
        onTasksGenerated(selectedTaskSuggestions, analysis.suggestedPhases);
    };
    const toggleTaskSelection = (taskId) => {
        setSelectedTasks(prev => prev.includes(taskId)
            ? prev.filter(id => id !== taskId)
            : [...prev, taskId]);
    };
    const getComplexityColor = (complexity) => {
        switch (complexity) {
            case 'low': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'high': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const getRiskColor = (riskLevel) => {
        if (riskLevel > 70)
            return 'text-red-600 bg-red-100';
        if (riskLevel > 40)
            return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "ai-task-breakdown p-6 bg-white rounded-lg shadow-lg", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-800 mb-4", children: "\uD83E\uDD16 AI Task Breakdown" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-4", children: "Describe your project and let AI suggest an intelligent task breakdown with dependencies, estimates, and risk assessment." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-6", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Project Description *" }), (0, jsx_runtime_1.jsx)("textarea", { value: projectDescription, onChange: (e) => setProjectDescription(e.target.value), placeholder: "Describe your project in detail... e.g., 'Build a mobile app for restaurant ordering with user authentication, menu browsing, order placement, and payment integration'", className: "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent", rows: 4, disabled: isAnalyzing })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mb-6", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Project Type" }), (0, jsx_runtime_1.jsx)("select", { value: projectType, onChange: (e) => setProjectType(e.target.value), className: "w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent", disabled: isAnalyzing, children: projectTypes.map(type => ((0, jsx_runtime_1.jsx)("option", { value: type.value, children: type.label }, type.value))) })] }), (0, jsx_runtime_1.jsx)("div", { className: "mb-6", children: (0, jsx_runtime_1.jsx)("button", { onClick: handleAnalyzeProject, disabled: isAnalyzing || !projectDescription.trim(), className: "px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed", children: isAnalyzing ? ((0, jsx_runtime_1.jsxs)("span", { className: "flex items-center", children: [(0, jsx_runtime_1.jsxs)("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [(0, jsx_runtime_1.jsx)("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), (0, jsx_runtime_1.jsx)("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Analyzing Project..."] })) : ('🧠 Analyze Project with AI') }) }), analysis && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-gray-50 p-4 rounded-lg", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-800 mb-3", children: "\uD83D\uDCCA Project Analysis" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold text-blue-600", children: analysis.estimatedDuration }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600", children: "Estimated Days" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: `text-2xl font-bold px-3 py-1 rounded-full text-sm ${getComplexityColor(analysis.complexity)}`, children: analysis.complexity.toUpperCase() }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600 mt-1", children: "Complexity" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: `text-2xl font-bold px-3 py-1 rounded-full text-sm ${getRiskColor(analysis.riskLevel)}`, children: [analysis.riskLevel, "%"] }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600 mt-1", children: "Risk Level" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-2xl font-bold text-green-600", children: analysis.taskSuggestions.length }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600", children: "Tasks" })] })] })] }), analysis.resourceRequirements && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-blue-50 p-4 rounded-lg", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-800 mb-3", children: "\uD83D\uDC65 Resource Requirements" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [analysis.resourceRequirements.developers > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xl font-bold text-blue-600", children: analysis.resourceRequirements.developers }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600", children: "Developers" })] })), analysis.resourceRequirements.designers > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xl font-bold text-purple-600", children: analysis.resourceRequirements.designers }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600", children: "Designers" })] })), analysis.resourceRequirements.testers > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xl font-bold text-green-600", children: analysis.resourceRequirements.testers }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600", children: "Testers" })] })), analysis.resourceRequirements.managers > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-xl font-bold text-orange-600", children: analysis.resourceRequirements.managers }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm text-gray-600", children: "Managers" })] }))] })] })), insights && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-yellow-50 p-4 rounded-lg", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-800 mb-3", children: "\uD83D\uDCA1 AI Insights" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [insights.recommendations.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium text-green-800 mb-2", children: "\u2705 Recommendations:" }), (0, jsx_runtime_1.jsx)("ul", { className: "list-disc list-inside space-y-1 text-sm text-gray-700", children: insights.recommendations.map((rec, index) => ((0, jsx_runtime_1.jsx)("li", { children: rec }, index))) })] })), insights.warnings.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium text-red-800 mb-2", children: "\u26A0\uFE0F Warnings:" }), (0, jsx_runtime_1.jsx)("ul", { className: "list-disc list-inside space-y-1 text-sm text-gray-700", children: insights.warnings.map((warning, index) => ((0, jsx_runtime_1.jsx)("li", { children: warning }, index))) })] }))] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white border border-gray-200 rounded-lg", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-4 border-b border-gray-200", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-800", children: "\uD83D\uDCCB Suggested Tasks" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-4", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-sm text-gray-600", children: [selectedTasks.length, " of ", analysis.taskSuggestions.length, " selected"] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setSelectedTasks(selectedTasks.length === analysis.taskSuggestions.length
                                                        ? []
                                                        : analysis.taskSuggestions.map(task => task.id)), className: "text-sm text-blue-600 hover:text-blue-800", children: selectedTasks.length === analysis.taskSuggestions.length ? 'Deselect All' : 'Select All' })] })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-6", children: analysis.suggestedPhases.map((phase) => ((0, jsx_runtime_1.jsxs)("div", { className: "border border-gray-200 rounded-lg overflow-hidden", children: [(0, jsx_runtime_1.jsx)("div", { className: "bg-gray-50 px-6 py-4 border-b border-gray-200", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-900", children: phase.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 mt-1", children: phase.description })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-right", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-sm text-gray-500", children: [phase.estimatedDays, " days total"] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-sm text-gray-500", children: [phase.tasks.length, " tasks"] })] })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "divide-y divide-gray-100", children: phase.tasks.map((task) => ((0, jsx_runtime_1.jsx)("div", { className: "p-4 hover:bg-gray-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start space-x-4", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: selectedTasks.includes(task.id), onChange: () => toggleTaskSelection(task.id), className: "mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-2", children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-lg font-medium text-gray-900", children: task.name }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(task.complexity)}`, children: task.complexity }), (0, jsx_runtime_1.jsx)("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`, children: task.priority }), (0, jsx_runtime_1.jsxs)("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(task.riskLevel)}`, children: [task.riskLevel, "% risk"] })] })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mb-3", children: task.description }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium text-gray-700", children: "Duration:" }), " ", task.estimatedDays, " days"] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium text-gray-700", children: "Category:" }), " ", task.category] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium text-gray-700", children: "Skills:" }), " ", task.skills.join(', ')] })] }), task.deliverables.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium text-gray-700 text-sm", children: "Deliverables:" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-1 mt-1", children: task.deliverables.map((deliverable, index) => ((0, jsx_runtime_1.jsx)("span", { className: "px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded", children: deliverable }, index))) })] }))] })] }) }, task.id))) })] }, phase.id))) })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex justify-end", children: (0, jsx_runtime_1.jsxs)("button", { onClick: handleGenerateSchedule, disabled: selectedTasks.length === 0, className: "px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed", children: ["\uD83D\uDCC5 Generate Schedule with ", selectedTasks.length, " Tasks"] }) })] }))] }));
};
exports.AITaskBreakdown = AITaskBreakdown;
//# sourceMappingURL=AITaskBreakdown.js.map