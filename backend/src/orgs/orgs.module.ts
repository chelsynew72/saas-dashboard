import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Org, OrgSchema } from './schemas/org.schema';
import { OrgsService } from './orgs.service';
import { OrgsController } from './orgs.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Org.name, schema: OrgSchema }]),
    UsersModule,
  ],
  providers: [OrgsService],
  controllers: [OrgsController],
  exports: [MongooseModule],
})
export class OrgsModule {}
