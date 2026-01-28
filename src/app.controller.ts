import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    const v: boolean = true;

    return v ? this.appService.getHello() : 'False';
  }

  // @Post('chat')
  // chat(@Body() body: { query: string }): string {
  //   return this.appService.chat(body.query);
  // }
}
