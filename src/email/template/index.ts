import { htmlToText } from 'html-to-text';
import { sendEmail } from '@/email';

export async function sendEmailWithTemplate(options: {
  to: string;
  template: string;
  props?: Record<string, any>;
}): Promise<SendEmailResult> {
  // dynamically import renderToStaticMarkup because NextJS gets angry otherwise (https://github.com/vercel/next.js/issues/43810#issuecomment-1341136525)
  const renderToStaticMarkup = (await import('react-dom/server')).renderToStaticMarkup;
  const { body, subject } = await import(`@/email/template/${options.template}`);
  const emailBody = renderToStaticMarkup(await body(options.props ?? {}));
  const emailSubject = await subject(options.props ?? {});
  console.log('[email] Sending "%s" email to %s', options.template, options.to);
  return sendEmail({
    to: options.to,
    subject: emailSubject,
    html: emailBody,
    text: htmlToText(emailBody)
  });
}
