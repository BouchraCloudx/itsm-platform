import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import type { ChannelWrapper } from 'amqp-connection-manager';
import type { ConfirmChannel } from 'amqplib';

const EXCHANGE = 'itsm.events';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private connection: amqp.AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://itsm_user:itsm_pass@rabbitmq:5672');

    this.connection = amqp.connect([url]);
    this.connection.on('connect', () => this.logger.log('Connecté à RabbitMQ'));
    this.connection.on('disconnect', (err) => this.logger.warn(`Déconnecté de RabbitMQ: ${err?.err?.message}`));

    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: (channel: ConfirmChannel) => channel.assertExchange(EXCHANGE, 'topic', { durable: true }),
    });
  }

  async publish(routingKey: string, data: Record<string, any>) {
    const event = {
      eventId: crypto.randomUUID(),
      eventType: routingKey,
      timestamp: new Date().toISOString(),
      data,
    };

    try {
      await this.channelWrapper.publish(EXCHANGE, routingKey, event);
      this.logger.log(`Événement publié: ${routingKey}`);
    } catch (error) {
      // Résilience : on ne bloque jamais l'action principale si RabbitMQ est indisponible
      this.logger.error(`Échec de publication de l'événement ${routingKey}: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    await this.channelWrapper?.close();
    await this.connection?.close();
  }
}
