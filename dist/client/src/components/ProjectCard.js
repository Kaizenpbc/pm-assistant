"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const api_1 = require("../services/api");
const ProjectCard = ({ project, onProjectDeleted }) => {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'planning':
                return 'bg-blue-100 text-blue-800';
            case 'on_hold':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-purple-100 text-purple-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    const handleClick = () => {
        navigate(`/project/${project.id}`);
    };
    const handleViewProject = (e) => {
        e.stopPropagation();
        navigate(`/project/${project.id}`);
    };
    const handleDeleteProject = async (e) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`)) {
            try {
                await api_1.apiService.deleteProject(project.id);
                onProjectDeleted?.();
            }
            catch (error) {
                console.error('Failed to delete project:', error);
                alert('Failed to delete project. Please try again.');
            }
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "card hover:shadow-md transition-shadow duration-200 cursor-pointer", onClick: handleClick, children: [(0, jsx_runtime_1.jsxs)("div", { className: "card-header", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-start justify-between", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex-1", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: project.name }), project.description && ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 line-clamp-2", children: project.description }))] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mt-4 mb-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center space-x-2", children: (0, jsx_runtime_1.jsx)("span", { className: "text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700", children: project.code || `ID: ${project.id}` }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center space-x-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleViewProject, className: "bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium", children: "View" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleDeleteProject, className: "bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium", children: "Delete" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "card-content", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`, children: project.status.replace('_', ' ') }), (0, jsx_runtime_1.jsx)("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`, children: project.priority })] }), project.budgetAllocated && ((0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm text-gray-600 mb-1", children: [(0, jsx_runtime_1.jsx)("span", { children: "Budget" }), (0, jsx_runtime_1.jsxs)("span", { children: ["$", project.budgetSpent.toLocaleString(), " / $", project.budgetAllocated.toLocaleString()] })] }), (0, jsx_runtime_1.jsx)("div", { className: "w-full bg-gray-200 rounded-full h-2", children: (0, jsx_runtime_1.jsx)("div", { className: "bg-blue-600 h-2 rounded-full", style: {
                                        width: `${Math.min((project.budgetSpent / project.budgetAllocated) * 100, 100)}%`,
                                    } }) })] })), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between text-sm text-gray-500", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["Created ", new Date(project.createdAt).toLocaleDateString()] }), (0, jsx_runtime_1.jsx)("span", { className: "text-blue-600 hover:text-blue-800", children: "View Details \u2192" })] })] })] }));
};
exports.ProjectCard = ProjectCard;
//# sourceMappingURL=ProjectCard.js.map