import { Module, forwardRef } from "@nestjs/common";
import { EmailService } from "./email.service";
import { PlatformModule } from "../platform/platform.module";

@Module({
  imports: [forwardRef(() => PlatformModule)],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
