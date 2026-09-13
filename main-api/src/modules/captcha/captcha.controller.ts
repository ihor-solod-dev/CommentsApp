import { Controller, Post } from '@nestjs/common';
import { CaptchaService } from './captcha.service';

@Controller('captcha')
export class CaptchaController {
    constructor(private readonly captchaService: CaptchaService) { }

    @Post('generate')
    generate() {
        return this.captchaService.generate();
    }
}