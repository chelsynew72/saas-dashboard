import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true }) title: string;
  @Prop({ default: '' }) description: string;
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true }) projectId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, required: true }) columnId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', default: null }) assigneeId: Types.ObjectId;
  @Prop({ enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' }) priority: string;
  @Prop({ default: null }) dueDate: Date;
  @Prop({ default: 0 }) position: number;
  @Prop({ type: [String], default: [] }) tags: string[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
