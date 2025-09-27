"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const ProjectPlanningTemplates_1 = __importDefault(require("./ProjectPlanningTemplates"));
const ProjectCreationModal = ({ isOpen, onClose, onCreateProject }) => {
    const [showTemplates, setShowTemplates] = (0, react_1.useState)(false);
    const [selectedTemplate, setSelectedTemplate] = (0, react_1.useState)(null);
    const [projectData, setProjectData] = (0, react_1.useState)({
        name: '',
        description: '',
        category: '',
        budget: '',
        startDate: '',
        endDate: '',
        location: '',
        projectManager: 'admin'
    });
    const categories = [
        { id: 'construction', name: 'Construction', icon: lucide_react_1.Building, color: 'blue' },
        { id: 'road-building', name: 'Road Building', icon: lucide_react_1.MapPin, color: 'orange' },
        { id: 'agriculture', name: 'Agriculture', icon: lucide_react_1.Wrench, color: 'green' },
        { id: 'infrastructure', name: 'Infrastructure', icon: lucide_react_1.Building, color: 'indigo' },
        { id: 'environmental', name: 'Environmental', icon: lucide_react_1.Shield, color: 'emerald' },
        { id: 'education', name: 'Education', icon: lucide_react_1.GraduationCap, color: 'purple' },
        { id: 'healthcare', name: 'Healthcare', icon: lucide_react_1.Heart, color: 'red' },
        { id: 'technology', name: 'Technology', icon: lucide_react_1.Zap, color: 'yellow' }
    ];
    const handleTemplateSelect = (templateData) => {
        const template = templateData;
        setSelectedTemplate(template);
        setProjectData(prev => ({
            ...prev,
            name: template.name,
            description: template.description,
            category: template.category.toLowerCase(),
            budget: '500000'
        }));
        setShowTemplates(false);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const newProject = {
            ...projectData,
            template: selectedTemplate,
            status: 'planning',
            priority: 'medium',
            budget_allocated: parseFloat(projectData.budget),
            budget_spent: 0,
            currency: 'USD',
            progress: 0
        };
        onCreateProject(newProject);
        onClose();
        setProjectData({
            name: '',
            description: '',
            category: '',
            budget: '',
            startDate: '',
            endDate: '',
            location: '',
            projectManager: 'admin'
        });
        setSelectedTemplate(null);
    };
    const getCategoryIcon = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.icon : lucide_react_1.Building;
    };
    const getCategoryColor = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.color : 'blue';
    };
    if (!isOpen)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-gray-200", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-900", children: "\uD83C\uDFD7\uFE0F Create New Project" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mt-1", children: "Start a new project using our Guyana-style templates" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-6 w-6 text-gray-500" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-6 overflow-y-auto max-h-[calc(90vh-120px)]", children: [(0, jsx_runtime_1.jsx)("div", { className: "mb-4 p-3 bg-red-100 border border-red-300 rounded-lg", children: (0, jsx_runtime_1.jsxs)("p", { className: "text-red-800 text-sm", children: ["\uD83D\uDD0D ", (0, jsx_runtime_1.jsx)("strong", { children: "Debug:" }), " showTemplates = ", showTemplates.toString()] }) }), showTemplates ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-yellow-800 text-sm", children: ["\uD83D\uDE80 ", (0, jsx_runtime_1.jsx)("strong", { children: "Debug:" }), " Templates should be showing now!", projectData.category && ` Category: ${projectData.category}`] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-yellow-800 text-sm mt-2", children: ["\uD83D\uDCCA ", (0, jsx_runtime_1.jsx)("strong", { children: "State:" }), " showTemplates = ", showTemplates.toString()] })] }), (0, jsx_runtime_1.jsx)("div", { className: "mb-4 p-3 bg-green-100 border border-green-300 rounded-lg", children: (0, jsx_runtime_1.jsxs)("p", { className: "text-green-800 text-sm", children: ["\u2705 ", (0, jsx_runtime_1.jsx)("strong", { children: "Component:" }), " About to render ProjectPlanningTemplates"] }) }), (0, jsx_runtime_1.jsx)(ProjectPlanningTemplates_1.default, { projectCategory: projectData.category || 'infrastructure', onTemplateSelect: handleTemplateSelect, onClose: () => setShowTemplates(false) })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-6", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-blue-900 mb-2", children: "\uD83D\uDCCB Project Template" }), selectedTemplate ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-2 bg-blue-100 rounded-lg mr-3", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Building, { className: "h-5 w-5 text-blue-600" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "font-medium text-blue-900", children: selectedTemplate.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-blue-700", children: selectedTemplate.description })] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setSelectedTemplate(null), className: "text-blue-600 hover:text-blue-800 text-sm", children: "Change Template" })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-blue-900", children: "No template selected" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-blue-700", children: "Choose from our Guyana-style project templates" })] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => {
                                                        console.log('🚀 Choosing template, category:', projectData.category);
                                                        console.log('🚀 Before setShowTemplates, showTemplates =', showTemplates);
                                                        setShowTemplates(true);
                                                        console.log('🚀 After setShowTemplates(true)');
                                                    }, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4" }), "Choose Template"] })] }))] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Project Name *" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: projectData.name, onChange: (e) => setProjectData(prev => ({ ...prev, name: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Enter project name", required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Project Category" }), (0, jsx_runtime_1.jsxs)("select", { value: projectData.category, onChange: (e) => setProjectData(prev => ({ ...prev, category: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Select category (optional)" }), categories.map((category) => {
                                                                    const Icon = category.icon;
                                                                    return ((0, jsx_runtime_1.jsx)("option", { value: category.id, children: category.name }, category.id));
                                                                })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-500 mt-1", children: "Category helps determine available project templates" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Budget (USD) *" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { className: "absolute left-3 top-2.5 h-4 w-4 text-gray-400" }), (0, jsx_runtime_1.jsx)("input", { type: "number", value: projectData.budget, onChange: (e) => setProjectData(prev => ({ ...prev, budget: e.target.value })), className: "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Enter budget amount", required: true })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Location *" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MapPin, { className: "absolute left-3 top-2.5 h-4 w-4 text-gray-400" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: projectData.location, onChange: (e) => setProjectData(prev => ({ ...prev, location: e.target.value })), className: "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "e.g., Georgetown, Berbice, Essequibo", required: true })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Start Date *" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "absolute left-3 top-2.5 h-4 w-4 text-gray-400" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: projectData.startDate, onChange: (e) => setProjectData(prev => ({ ...prev, startDate: e.target.value })), className: "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", required: true })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "End Date *" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "absolute left-3 top-2.5 h-4 w-4 text-gray-400" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: projectData.endDate, onChange: (e) => setProjectData(prev => ({ ...prev, endDate: e.target.value })), className: "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", required: true })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Project Description *" }), (0, jsx_runtime_1.jsx)("textarea", { value: projectData.description, onChange: (e) => setProjectData(prev => ({ ...prev, description: e.target.value })), rows: 4, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Describe the project objectives, scope, and key deliverables...", required: true })] }), selectedTemplate && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-4", children: [(0, jsx_runtime_1.jsx)("h4", { className: "font-medium text-gray-900 mb-2", children: "Template Summary" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Duration:" }), (0, jsx_runtime_1.jsx)("p", { className: "font-medium", children: selectedTemplate.estimatedDuration })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Phases:" }), (0, jsx_runtime_1.jsx)("p", { className: "font-medium", children: selectedTemplate.phases.length })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Documents:" }), (0, jsx_runtime_1.jsx)("p", { className: "font-medium", children: selectedTemplate.documents.length })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-600", children: "Budget Range:" }), (0, jsx_runtime_1.jsx)("p", { className: "font-medium", children: selectedTemplate.budgetRange })] })] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end gap-3 pt-6 border-t border-gray-200", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onClose, className: "px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors", children: "Cancel" }), (0, jsx_runtime_1.jsxs)("button", { type: "submit", disabled: !selectedTemplate, className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { className: "h-4 w-4" }), "Create Project"] })] })] })] }))] })] }) }));
};
exports.default = ProjectCreationModal;
//# sourceMappingURL=ProjectCreationModal.js.map