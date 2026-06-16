import { Resend } from 'resend';
import AppError from './appErros.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ISendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  idempotencyKey?: string;
}

export const sendMail = async (payload: ISendEmailPayload) => {
  const emailOptions: any = {
    from: 'Trimly <onboarding@resend.dev>',
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  };

  if (payload.idempotencyKey) {
    emailOptions.headers = {
      'Idempotency-Key': payload.idempotencyKey,
    };
  }

  const { data, error } = await resend.emails.send(emailOptions);

  if (error) {
    throw new AppError(`[Resend Error] ${error.name}: ${error.message}`, 500);
  }

  return data;
};
