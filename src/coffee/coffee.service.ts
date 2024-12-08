import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoffeeDto, UpdateCoffeeDto } from '../Dtos/coffee.dto';

@Injectable()
export class CoffeeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch all coffee items.
   */
  async findAll() {
    return this.prisma.coffee.findMany(); // Direct access to the coffee model
  }

  /**
   * Fetch a single coffee item by ID.
   * @throws NotFoundException if the item does not exist.
   */
  async findOne(id: string) {
    const coffee = await this.prisma.coffee.findUnique({ where: { id } });
    if (!coffee) throw new NotFoundException('Coffee item not found');
    return coffee;
  }

  /**
   * Create a new coffee item.
   */
  async create(createCoffeeDto: CreateCoffeeDto) {
    return this.prisma.coffee.create({ data: createCoffeeDto });
  }

  /**
   * Update an existing coffee item.
   * @throws NotFoundException if the item does not exist.
   */
  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const coffee = await this.prisma.coffee.findUnique({ where: { id } });
    if (!coffee) throw new NotFoundException('Coffee item not found');

    return this.prisma.coffee.update({
      where: { id },
      data: updateCoffeeDto,
    });
  }

  /**
   * Delete a coffee item by ID.
   * @throws NotFoundException if the item does not exist.
   */
  async delete(id: string) {
    const coffee = await this.prisma.coffee.findUnique({ where: { id } });
    if (!coffee) throw new NotFoundException('Coffee item not found');

    await this.prisma.coffee.delete({ where: { id } });
    return { message: `Removed product ${coffee} Successfully ` };
  }
}
