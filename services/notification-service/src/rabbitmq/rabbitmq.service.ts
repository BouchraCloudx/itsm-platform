import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import type { ChannelWrapper } from 'amqp-connection-manager';
import type { ConfirmChannel, ConsumeMessage } from 'amqplib';
import { NotificationsService } from '../notifications/notifications.service';

const EXCHANGE = 'itsm.events';
const QUEUE = 'notification-service.events';
const ROUTING_KEYS = ['ticket.created', 'ticket.assigned', 'ticket.status_changed', 'ticket.comment_added'];

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private connection: amqp.AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  constructor(
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
    const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://itsm_user:itsm_pass@rabbitmq:5672');

    this.connection = amqp.connect([url]);
    this.connection.on('connect', () => this.logger.log('Connecté à RabbitMQ'));
    this.connection.on('disconnect', (err) => this.logger.warn(`Déconnecté de RabbitMQ: ${err?.err?.message}`));

    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: async (channel: ConfirmChannel) => {
        await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
        await channel.assertQueue(QUEUE, { durable: true });

        for (const key of ROUTING_KEYS) {
          await channel.bindQueue(QUEUE, EXCHANGE, key);
        }

        await channel.consume(QUEUE, (msg) => this.handleMessage(msg, channel), { noAck: false });
      },
    });
  }

  private async handleMessage(msg: ConsumeMessage | null, channel: ConfirmChannel) {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());
      this.logger.log(`Événement reçu: ${event.eventType}`);

      const { userId, type, message, relatedTicketId } = event.data;

      await this.notificationsService.create({ userId, type, message, relatedTicketId });

      channel.ack(msg);
    } catch (error) {
      this.logger.error(`Erreur de traitement du message: ${error.message}`);
      channel.nack(msg, false, false); // rejette sans remettre en file (évite une boucle infinie sur message corrompu)
    }
  }

  async onModuleDestroy() {
    await this.channelWrapper?.close();
    await this.connection?.close();
  }
}
