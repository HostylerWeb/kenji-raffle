import { Module } from "@nestjs/common";
import { EmailModule } from "../email/email.module";
import { PlatformPrismaModule } from "../platform-prisma/platform-prisma.module";
import { ContactController } from "./contact.controller";
import { ContactService } from "./contact.service";

@Module({
  imports: [EmailModule, PlatformPrismaModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
