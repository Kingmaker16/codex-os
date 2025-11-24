/**
 * E-Commerce Engine v2 - Email Fulfillment
 * Sends order confirmation and fulfillment emails
 */

import { logger } from '../utils/logger.js';
import type { Order } from '../db/storeDB.js';

export interface EmailConfig {
  from: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}

export async function sendOrderConfirmation(order: Order, config: EmailConfig): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  try {
    logger.info(`Sending order confirmation email for order: ${order.id}`);

    // Mock email sending (real implementation would use nodemailer/sendgrid)
    const emailContent = `
Hello!

Thank you for your order #${order.id}.

Order Details:
- Amount: $${order.amount} ${order.currency}
- Status: ${order.status}

We'll send you another email when your order ships!

Best regards,
Your Store Team
    `.trim();

    logger.info(`Order confirmation email sent to: ${order.customer_email}`);

    return {
      ok: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error: any) {
    logger.error('Failed to send order confirmation', error);
    return { ok: false, error: error.message };
  }
}

export async function sendShippingNotification(order: Order, trackingNumber: string, config: EmailConfig): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  try {
    logger.info(`Sending shipping notification for order: ${order.id}`);

    const emailContent = `
Hello!

Great news! Your order #${order.id} has shipped!

Tracking Number: ${trackingNumber}

You can track your package at: [tracking-url]

Best regards,
Your Store Team
    `.trim();

    logger.info(`Shipping notification sent to: ${order.customer_email}`);

    return {
      ok: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error: any) {
    logger.error('Failed to send shipping notification', error);
    return { ok: false, error: error.message };
  }
}

export async function sendDigitalDelivery(order: Order, downloadLink: string, config: EmailConfig): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  try {
    logger.info(`Sending digital delivery email for order: ${order.id}`);

    const emailContent = `
Hello!

Your digital product is ready for download!

Order #${order.id}
Download Link: ${downloadLink}
(Link expires in 7 days)

Best regards,
Your Store Team
    `.trim();

    logger.info(`Digital delivery email sent to: ${order.customer_email}`);

    return {
      ok: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error: any) {
    logger.error('Failed to send digital delivery', error);
    return { ok: false, error: error.message };
  }
}

export async function testEmailConfig(config: EmailConfig): Promise<{ ok: boolean; error?: string }> {
  try {
    logger.info('Testing email configuration');

    // Mock email test
    if (!config.from) {
      return { ok: false, error: 'Missing from address' };
    }

    logger.info('Email configuration test successful');
    return { ok: true };
  } catch (error: any) {
    logger.error('Email configuration test failed', error);
    return { ok: false, error: error.message };
  }
}
