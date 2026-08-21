import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class PlayerAuthGuard extends AuthGuard("player-jwt") {}
