import { NestApplicationOptions, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import cors from 'cors'
import { Logger } from 'nestjs-pino'
import { AppModule } from './app.module'

void (async () => {
  const options: NestApplicationOptions =  {
    bufferLogs: true,
  }

  const app = await NestFactory.create(AppModule, options)
  app.useLogger(app.get(Logger))
  app.useGlobalPipes(new ValidationPipe({
    disableErrorMessages: false,
    transform: true,
  }))
  // Enable CORS for UI origin; allow credentials if needed
  const uiOrigin = process.env.NEXT_PUBLIC_UI_URL || process.env.UI_ORIGIN || '*'
  app.enableCors({
    origin: (origin, callback) => callback(null, origin || uiOrigin),
    credentials: false,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
  app.getHttpAdapter().options('*', cors())

  await app.listen(process.env.PORT || 4100);
})()
