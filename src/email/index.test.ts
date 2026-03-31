import { validateSmtpConfig } from './index';

describe('validateSmtpConfig', () => {
  it('should return valid when all required SMTP env variables are set correctly', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASSWORD = 'password';
    process.env.SMTP_PORT = '587';

    const result = validateSmtpConfig();

    expect(result).toEqual({ valid: true });
  });

  it('should return invalid when SMTP_HOST is missing', () => {
    process.env.SMTP_HOST = '';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASSWORD = 'password';

    const result = validateSmtpConfig();

    expect(result).toEqual({ valid: false, error: 'SMTP_HOST is missing or empty' });
  });

  it('should return invalid when SMTP_PORT is not a valid integer', () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASSWORD = 'password';
    process.env.SMTP_PORT = 'invalid';

    const result = validateSmtpConfig();

    expect(result).toEqual({
      valid: false,
      error: 'SMTP_PORT must be an integer between 1 and 65535'
    });
  });
});

describe('sendEmail', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should send an email successfully', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASSWORD = 'password';
    process.env.SMTP_PORT = '587';

    const sendMailMock = jest.fn().mockResolvedValue({});
    jest.mock('nodemailer', () => ({
      createTransport: jest.fn(() => ({
        sendMail: sendMailMock
      }))
    }));

    const { sendEmail } = await import('./index');
    const result = await sendEmail({
      to: 'recipient@example.com',
      subject: 'Test Email',
      text: 'This is a test email.'
    });

    expect(result).toEqual({ sent: true });
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'user@example.com',
      to: 'recipient@example.com',
      subject: 'Test Email',
      text: 'This is a test email.',
      html: undefined
    });
  });

  it('should return an error when SMTP is not configured', async () => {
    process.env.SMTP_HOST = '';
    process.env.SMTP_USER = '';
    process.env.SMTP_PASSWORD = '';

    jest.spyOn(console, 'error').mockImplementation(() => {});

    const { sendEmail } = await import('./index');
    const result = await sendEmail({
      to: 'recipient@example.com',
      subject: 'Test Email',
      text: 'This is a test email.'
    });

    expect(console.error).toHaveBeenCalledWith(
      '[email] Send skipped: %s',
      'SMTP_HOST is missing or empty'
    );
    expect(result).toEqual({ sent: false, error: 'SMTP_HOST is missing or empty' });
  });

  it('should retry sending email on failure', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASSWORD = 'password';
    process.env.SMTP_PORT = '587';

    const sendMailMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValueOnce({});
    jest.mock('nodemailer', () => ({
      createTransport: jest.fn(() => ({
        sendMail: sendMailMock
      }))
    }));

    jest.spyOn(console, 'warn').mockImplementation(() => {});

    const { sendEmail } = await import('./index');
    const result = await sendEmail({
      to: 'recipient@example.com',
      subject: 'Test Email',
      text: 'This is a test email.'
    });

    expect(console.warn).toHaveBeenCalledWith(
      '[email] Send attempt %d failed, retrying in %dms: %s',
      1,
      1000,
      'Temporary failure'
    );
    expect(result).toEqual({ sent: true });
    expect(sendMailMock).toHaveBeenCalledTimes(2);
  });
});
