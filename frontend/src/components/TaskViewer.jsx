import React from 'react';
import { CheckSquare, Square } from 'lucide-react';

const TaskViewer = ({ tasks }) => {
    if (!tasks || tasks.length === 0) {
        return <p className="text-xs text-gray-400 italic mt-2">No tasks assigned yet.</p>;
    }

    return (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 w-full text-left">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Your Tasks</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {tasks.map(task => (
                    <div key={task._id} className="flex items-center text-sm">
                        {task.completed ? (
                            <CheckSquare size={16} className="mr-2 text-green-500 flex-shrink-0" />
                        ) : (
                            <Square size={16} className="mr-2 text-gray-400 flex-shrink-0" />
                        )}
                        <span className={task.completed ? 'text-gray-500' : 'text-gray-700 dark:text-gray-300'}>
                            {task.description}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskViewer;