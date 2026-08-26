import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { Readable } from "stream";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import multipart from "@fastify/multipart";
import cookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import { AppModule } from "./app.module";
import {
  corsOriginAllowed,
  swaggerEnabled,
  validateProductionSecurityConfig,
} from "./common/security-config";

loadEnv({ path: resolve(__dirname, "../../../.env") });

declare module "fastify" {
  interface FastifyRequest {
    rawBody?: string;
  }
}

function isPaymentCallbackUrl(url: string): boolean {
  return (
    url.includes("/v1/payments/gateway/callback") ||
    url.includes("/v1/payments/harambe/callback") ||
    url.includes("/v1/payments/cashflows/callback")
  );
}

function isRawBodyUrl(url: string): boolean {
  return (
    isPaymentCallbackUrl(url) ||
    url.includes("/v1/platform/integrations/gra/")
  );
}

async function bootstrap() {
  validateProductionSecurityConfig();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  const fastify = app.getHttpAdapter().getInstance();

  fastify.addHook("preParsing", async (request, _reply, payload) => {
    if (!isRawBodyUrl(String(request.url ?? ""))) {
      return payload;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of payload) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const raw = Buffer.concat(chunks);
    request.rawBody = raw.toString("utf8");
    return Readable.from([raw]);
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  await app.register(cookie);

  app.enableCors({
    origin(origin, callback) {
      if (corsOriginAllowed(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  if (swaggerEnabled()) {
    const swagger = new DocumentBuilder()
      .setTitle("Raffle Platform API")
      .setDescription(
        "Multi-tenant raffle platform — platform control plane and tenant operator/player APIs.",
      )
      .setVersion("0.1.0")
      .addBearerAuth()
      .addTag("platform", "Dashboard, operators list, audit, reports")
      .addTag("platform-auth", "Login, refresh, MFA, password")
      .addTag("platform-operators", "Operator CRUD, domains, drill-down")
      .addTag("platform-system", "Health, jobs, worker, settings")
      .addTag("operator-auth", "Operator staff login, refresh, MFA")
      .addTag("operator-admin", "Dashboard, staff, settings, audit")
      .addTag("operator-raffles", "Raffle catalog, tickets, draws")
      .addTag("player-auth", "Player register, login, refresh")
      .addTag("account", "Player orders, tickets, claims, KYC")
      .addTag("cart", "Cart and coupons")
      .addTag("checkout", "Checkout and payment callbacks")
      .addTag("public", "Public raffles, categories, winners")
      .build();
    const document = SwaggerModule.createDocument(app, swagger);
    SwaggerModule.setup("docs", app, document);
  }

  const port = Number(process.env.API_PORT ?? 4002);
  await app.listen(port, "0.0.0.0");
  console.log(`API listening on http://localhost:${port}`);
}

bootstrap();
