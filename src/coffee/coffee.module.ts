import { Module } from '@nestjs/common';
import { CoffeeService } from './coffee.service';
import { CoffeeController } from './coffee.controller';

@Module({
  providers: [CoffeeService],
  controllers: [CoffeeController]
})
export class CoffeeModule {}
