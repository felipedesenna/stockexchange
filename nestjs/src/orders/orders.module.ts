import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORDERS_PUBLISHER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'orders',
            brokers: ['host.docker.internal:9094'],
            //brokers: ['kafka:29092'],
          },
        },
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
