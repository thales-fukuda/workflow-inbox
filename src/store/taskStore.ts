import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskState, StepExecution, StepState, RoleId, Queue, PendingExternalAction } from '../types';
import { getWorkflow } from '../data/workflows';

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

const generateId = () => Math.random().toString(36).substring(2, 11);

const createStepExecutions = (workflowId: string): StepExecution[] => {
  const workflow = getWorkflow(workflowId);
  if (!workflow) return [];

  return workflow.steps.map((step) => ({
    stepId: step.id,
    state: 'pending' as StepState,
  }));
};

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------

interface TaskStore {
  tasks: Task[];
  selectedTaskId: string | null;
  pendingExternalActions: PendingExternalAction[];

  // Selection
  selectTask: (id: string | null) => void;

  // Task CRUD
  createTask: (workflowId: string, title: string, data: Record<string, unknown>, triggeredBy: string) => Task;
  updateTaskData: (taskId: string, data: Record<string, unknown>) => void;
  updateTaskState: (taskId: string, state: TaskState) => void;

  // Task Actions
  approveReview: (taskId: string) => void;
  rejectTask: (taskId: string) => void;
  completeHumanAction: (taskId: string) => void;
  retryTask: (taskId: string) => void;

  // Workflow Execution (simulated)
  runNextStep: (taskId: string) => void;

  // External Actions
  addPendingExternal: (action: Omit<PendingExternalAction, 'id' | 'createdAt'>) => void;
  completeExternalAction: (actionId: string, result?: { success: boolean; message?: string; error?: string }) => void;

  // Filtering
  getTasksForQueue: (queue: Queue, roleId: RoleId) => Task[];
  getTasksByState: (state: TaskState) => Task[];
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      selectedTaskId: null,
      pendingExternalActions: [],

      selectTask: (id) => set({ selectedTaskId: id }),

      createTask: (workflowId, title, data, triggeredBy) => {
        const workflow = getWorkflow(workflowId);
        if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

        const task: Task = {
          id: generateId(),
          workflowId,
          title,
          state: workflow.requiresReview ? 'review' : 'running',
          priority: 'medium',
          tags: [workflow.category],
          data,
          currentStepId: workflow.requiresReview ? workflow.steps.find(s => s.type === 'review')?.id || workflow.steps[0].id : workflow.steps[0].id,
          stepExecutions: createStepExecutions(workflowId),
          assignedTo: 'reviewer',
          createdAt: new Date(),
          updatedAt: new Date(),
          triggeredBy,
        };

        // If requires review, mark the review step as waiting
        if (workflow.requiresReview) {
          const reviewStepIndex = task.stepExecutions.findIndex(
            (se) => se.stepId === task.currentStepId
          );
          if (reviewStepIndex >= 0) {
            task.stepExecutions[reviewStepIndex] = {
              ...task.stepExecutions[reviewStepIndex],
              state: 'waiting',
              startedAt: new Date(),
            };
          }
          // Mark any steps before review as completed (like AI extraction)
          for (let i = 0; i < reviewStepIndex; i++) {
            task.stepExecutions[i] = {
              ...task.stepExecutions[i],
              state: 'completed',
              startedAt: new Date(),
              completedAt: new Date(),
            };
          }
        }

        set((state) => ({
          tasks: [task, ...state.tasks],
        }));

        return task;
      },

      updateTaskData: (taskId, data) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, data: { ...t.data, ...data }, updatedAt: new Date() }
              : t
          ),
        }));
      },

      updateTaskState: (taskId, newState) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, state: newState, updatedAt: new Date() }
              : t
          ),
        }));
      },

      approveReview: (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task || task.state !== 'review') return;

        // Mark current step as completed
        const updatedExecutions = task.stepExecutions.map((se) =>
          se.stepId === task.currentStepId
            ? { ...se, state: 'completed' as StepState, completedAt: new Date() }
            : se
        );

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  state: 'running',
                  stepExecutions: updatedExecutions,
                  updatedAt: new Date(),
                }
              : t
          ),
        }));

        // Continue to next step
        setTimeout(() => get().runNextStep(taskId), 500);
      },

      rejectTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, state: 'cancelled', updatedAt: new Date() }
              : t
          ),
        }));
      },

      completeHumanAction: (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task || task.state !== 'waiting_human') return;

        // Mark current step as completed
        const updatedExecutions = task.stepExecutions.map((se) =>
          se.stepId === task.currentStepId
            ? { ...se, state: 'completed' as StepState, completedAt: new Date() }
            : se
        );

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  state: 'running',
                  stepExecutions: updatedExecutions,
                  updatedAt: new Date(),
                }
              : t
          ),
        }));

        // Continue to next step
        setTimeout(() => get().runNextStep(taskId), 500);
      },

      retryTask: (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task || task.state !== 'failed') return;

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, state: 'running', updatedAt: new Date() }
              : t
          ),
        }));

        setTimeout(() => get().runNextStep(taskId), 500);
      },

      runNextStep: (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;

        const workflow = getWorkflow(task.workflowId);
        if (!workflow) return;

        // Find current step index
        const currentIndex = workflow.steps.findIndex((s) => s.id === task.currentStepId);

        // Find next pending step
        let nextIndex = currentIndex + 1;

        // Handle conditions
        const currentStep = workflow.steps[currentIndex];
        if (currentStep?.type === 'condition') {
          // Simple condition evaluation (mock)
          const conditionMet = Math.random() > 0.5; // Random for demo
          const targetStepId = conditionMet ? currentStep.thenStep : currentStep.elseStep;
          nextIndex = workflow.steps.findIndex((s) => s.id === targetStepId);

          // Mark condition step as completed
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    stepExecutions: t.stepExecutions.map((se) =>
                      se.stepId === currentStep.id
                        ? { ...se, state: 'completed' as StepState, completedAt: new Date() }
                        : se
                    ),
                  }
                : t
            ),
          }));
        }

        // Check if workflow is complete
        if (nextIndex >= workflow.steps.length || nextIndex < 0) {
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    state: 'completed',
                    completedAt: new Date(),
                    updatedAt: new Date(),
                  }
                : t
            ),
          }));
          return;
        }

        const nextStep = workflow.steps[nextIndex];

        // Update task with next step
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  currentStepId: nextStep.id,
                  stepExecutions: t.stepExecutions.map((se) =>
                    se.stepId === nextStep.id
                      ? { ...se, state: 'running' as StepState, startedAt: new Date() }
                      : se
                  ),
                  updatedAt: new Date(),
                }
              : t
          ),
        }));

        // Handle step based on type
        switch (nextStep.type) {
          case 'ai_skill':
            // Simulate AI processing
            setTimeout(() => {
              set((state) => ({
                tasks: state.tasks.map((t) =>
                  t.id === taskId
                    ? {
                        ...t,
                        stepExecutions: t.stepExecutions.map((se) =>
                          se.stepId === nextStep.id
                            ? { ...se, state: 'completed' as StepState, completedAt: new Date() }
                            : se
                        ),
                      }
                    : t
                ),
              }));
              get().runNextStep(taskId);
            }, 1500);
            break;

          case 'human':
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      state: 'waiting_human',
                      assignedTo: nextStep.assignTo,
                      stepExecutions: t.stepExecutions.map((se) =>
                        se.stepId === nextStep.id
                          ? {
                              ...se,
                              state: 'waiting' as StepState,
                              assignedTo: nextStep.assignTo,
                              actionRequired: (nextStep.config as { actionRequired?: string }).actionRequired,
                            }
                          : se
                      ),
                    }
                  : t
              ),
            }));
            break;

          case 'connector':
            // Add to pending external actions
            get().addPendingExternal({
              taskId,
              stepId: nextStep.id,
              system: (nextStep.config as { connector?: string }).connector || 'Unknown',
              action: (nextStep.config as { action?: string }).action || 'Unknown',
              description: nextStep.description || nextStep.name,
            });

            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      state: 'waiting_external',
                      stepExecutions: t.stepExecutions.map((se) =>
                        se.stepId === nextStep.id
                          ? { ...se, state: 'waiting' as StepState }
                          : se
                      ),
                    }
                  : t
              ),
            }));
            break;

          case 'condition':
            // Process condition and continue
            setTimeout(() => get().runNextStep(taskId), 300);
            break;

          default:
            // Unknown step type, continue
            setTimeout(() => get().runNextStep(taskId), 500);
        }
      },

      addPendingExternal: (action) => {
        const newAction: PendingExternalAction = {
          ...action,
          id: generateId(),
          createdAt: new Date(),
        };
        set((state) => ({
          pendingExternalActions: [...state.pendingExternalActions, newAction],
        }));
      },

      completeExternalAction: (actionId, result = { success: true }) => {
        const action = get().pendingExternalActions.find((a) => a.id === actionId);
        if (!action) return;

        // Remove from pending
        set((state) => ({
          pendingExternalActions: state.pendingExternalActions.filter((a) => a.id !== actionId),
        }));

        // Update task step
        const task = get().tasks.find((t) => t.id === action.taskId);
        if (!task) return;

        if (result.success) {
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === action.taskId
                ? {
                    ...t,
                    state: 'running',
                    stepExecutions: t.stepExecutions.map((se) =>
                      se.stepId === action.stepId
                        ? { ...se, state: 'completed' as StepState, completedAt: new Date() }
                        : se
                    ),
                    updatedAt: new Date(),
                  }
                : t
            ),
          }));

          // Continue to next step
          setTimeout(() => get().runNextStep(action.taskId), 500);
        } else {
          // Mark task as failed
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === action.taskId
                ? {
                    ...t,
                    state: 'failed',
                    stepExecutions: t.stepExecutions.map((se) =>
                      se.stepId === action.stepId
                        ? { ...se, state: 'failed' as StepState, error: result.error }
                        : se
                    ),
                    updatedAt: new Date(),
                  }
                : t
            ),
          }));
        }
      },

      getTasksForQueue: (queue, roleId) => {
        const tasks = get().tasks;

        return tasks.filter((task) => {
          // Check state filter
          if (queue.filter.states && queue.filter.states.length > 0) {
            if (!queue.filter.states.includes(task.state)) return false;
          }

          // Check assignment for action queues
          if (queue.id === 'my-actions' && task.state === 'waiting_human') {
            if (task.assignedTo !== roleId && roleId !== 'admin') return false;
          }

          // Check tags
          if (queue.filter.tags && queue.filter.tags.length > 0) {
            if (!queue.filter.tags.some((tag) => task.tags.includes(tag))) return false;
          }

          // Check workflow
          if (queue.filter.workflowIds && queue.filter.workflowIds.length > 0) {
            if (!queue.filter.workflowIds.includes(task.workflowId)) return false;
          }

          return true;
        });
      },

      getTasksByState: (state) => {
        return get().tasks.filter((t) => t.state === state);
      },
    }),
    {
      name: 'globglob-tasks',
      partialize: (state) => ({
        tasks: state.tasks,
        pendingExternalActions: state.pendingExternalActions,
      }),
    }
  )
);
