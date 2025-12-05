"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const ProjectCreationModal = ({ isOpen, onClose, onCreateProject }) => {
    const [projectData, setProjectData] = (0, react_1.useState)({
        name: '',
        description: '',
        category: '',
        budget: '',
        startDate: '',
        endDate: '',
        location: '',
        projectManager: '',
        assignedPM: '',
        priority: 'medium',
        status: 'planning'
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
    const handleSubmit = (e) => {
        e.preventDefault();
        const newProject = {
            ...projectData,
            budget: parseFloat(projectData.budget) || 0
        };
        onCreateProject(newProject);
        setProjectData({
            name: '',
            description: '',
            category: '',
            budget: '',
            startDate: '',
            endDate: '',
            location: '',
            projectManager: '',
            assignedPM: '',
            priority: 'medium',
            status: 'planning'
        });
        onClose();
    };
    const handleClose = () => {
        setProjectData({
            name: '',
            description: '',
            category: '',
            budget: '',
            startDate: '',
            endDate: '',
            location: '',
            projectManager: '',
            assignedPM: '',
            priority: 'medium',
            status: 'planning'
        });
        onClose();
    };
    if (!isOpen)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-gray-200", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-900", children: "Create New Project" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleClose, className: "text-gray-400 hover:text-gray-600 transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { className: "h-6 w-6" }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "p-6 overflow-y-auto max-h-[calc(90vh-120px)]", children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Project Name *" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: projectData.name, onChange: (e) => setProjectData(prev => ({ ...prev, name: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Enter project name", required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Category *" }), (0, jsx_runtime_1.jsxs)("select", { value: projectData.category, onChange: (e) => setProjectData(prev => ({ ...prev, category: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", required: true, children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Select category" }), categories.map((category) => ((0, jsx_runtime_1.jsx)("option", { value: category.id, children: category.name }, category.id)))] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Budget (USD)" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.DollarSign, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), (0, jsx_runtime_1.jsx)("input", { type: "number", value: projectData.budget, onChange: (e) => setProjectData(prev => ({ ...prev, budget: e.target.value })), className: "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "0" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Priority" }), (0, jsx_runtime_1.jsxs)("select", { value: projectData.priority, onChange: (e) => setProjectData(prev => ({ ...prev, priority: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "low", children: "Low" }), (0, jsx_runtime_1.jsx)("option", { value: "medium", children: "Medium" }), (0, jsx_runtime_1.jsx)("option", { value: "high", children: "High" }), (0, jsx_runtime_1.jsx)("option", { value: "critical", children: "Critical" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Start Date" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: projectData.startDate, onChange: (e) => setProjectData(prev => ({ ...prev, startDate: e.target.value })), className: "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "End Date" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: projectData.endDate, onChange: (e) => setProjectData(prev => ({ ...prev, endDate: e.target.value })), className: "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Location" }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.MapPin, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: projectData.location, onChange: (e) => setProjectData(prev => ({ ...prev, location: e.target.value })), className: "w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Enter location" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Project Manager (Optional)" }), (0, jsx_runtime_1.jsxs)("select", { value: projectData.assignedPM, onChange: (e) => setProjectData({ ...projectData, assignedPM: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Select PM (Optional)" }), (0, jsx_runtime_1.jsx)("option", { value: "pm-001", children: "PM01 - Project Manager 01" }), (0, jsx_runtime_1.jsx)("option", { value: "pm-002", children: "PM02 - Project Manager 02" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Description" }), (0, jsx_runtime_1.jsx)("textarea", { value: projectData.description, onChange: (e) => setProjectData(prev => ({ ...prev, description: e.target.value })), rows: 4, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", placeholder: "Enter project description" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end space-x-3 pt-6 border-t border-gray-200", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleClose, className: "px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors", children: "Cancel" }), (0, jsx_runtime_1.jsxs)("button", { type: "submit", className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Building, { className: "h-4 w-4" }), "Create Project"] })] })] }) })] }) }));
};
exports.default = ProjectCreationModal;
//# sourceMappingURL=ProjectCreationModal.js.map