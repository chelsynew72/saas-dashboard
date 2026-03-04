import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from './schemas/task.schema';
import { Project } from '../projects/schemas/project.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async getProjectTasks(projectId: string) {
    return this.taskModel
      .find({ projectId })
      .populate('assigneeId', 'name email avatarUrl')
      .sort({ position: 1 })
      .lean();
  }

  async create(dto: {
    title: string;
    description?: string;
    projectId: string;
    columnId: string;
    assigneeId?: string;
    priority?: string;
    dueDate?: Date;
    tags?: string[];
  }) {
    const lastTask = await this.taskModel
      .findOne({ projectId: dto.projectId, columnId: dto.columnId })
      .sort({ position: -1 });

    return this.taskModel.create({
      ...dto,
      position: lastTask ? lastTask.position + 1 : 0,
    });
  }

  async update(taskId: string, dto: Partial<{
    title: string;
    description: string;
    assigneeId: string;
    priority: string;
    dueDate: Date;
    tags: string[];
  }>) {
    const task = await this.taskModel.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');
    return this.taskModel.findByIdAndUpdate(taskId, dto, { new: true });
  }

  async move(taskId: string, newColumnId: string, newPosition: number) {
    const task = await this.taskModel.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');

    // Shift tasks in the target column to make room
    await this.taskModel.updateMany(
      {
        projectId: task.projectId,
        columnId: new Types.ObjectId(newColumnId),
        position: { $gte: newPosition },
        _id: { $ne: task._id },
      },
      { $inc: { position: 1 } },
    );

    return this.taskModel.findByIdAndUpdate(
      taskId,
      { columnId: new Types.ObjectId(newColumnId), position: newPosition },
      { new: true },
    );
  }

  async delete(taskId: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');
    await this.taskModel.findByIdAndDelete(taskId);
    return { message: 'Task deleted' };
  }
}
