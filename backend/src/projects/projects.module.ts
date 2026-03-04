import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './schemas/project.schema';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { OrgsModule } from '../orgs/orgs.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    OrgsModule,
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [MongooseModule],
})
export class ProjectsModule {}
