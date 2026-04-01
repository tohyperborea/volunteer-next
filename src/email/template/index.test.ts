jest.mock('@/service/email-service', () => ({
  queueEmail: jest.fn()
}));

describe('sendEmailWithTemplate', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.USE_EMAIL_QUEUE;
  });

  it('should send an email using the provided template and props', async () => {
    const mockSendEmail = jest.fn().mockResolvedValue({ status: 'sent' });
    jest.mock('@/email', () => ({
      sendEmail: mockSendEmail
    }));

    const mockRenderToStaticMarkup = jest.fn().mockReturnValue('<p>Hello, John!</p>');
    jest.mock('react-dom/server', () => ({
      renderToStaticMarkup: mockRenderToStaticMarkup
    }));

    const mockBody = jest.fn(async (props: any) => `<p>Hello, ${props.name}!</p>`);
    const mockSubject = jest.fn(async (props: any) => `Welcome, ${props.name}`);
    jest.mock('@/email/template/ShiftEmail', () => ({
      body: mockBody,
      subject: mockSubject
    }));

    const { sendEmailWithTemplate } = await import('./index');
    const result = await sendEmailWithTemplate({
      to: 'john@example.com',
      template: 'ShiftEmail',
      props: { name: 'John' } as any
    });

    expect(mockBody).toHaveBeenCalledWith({ name: 'John' });
    expect(mockSubject).toHaveBeenCalledWith({ name: 'John' });
    expect(mockRenderToStaticMarkup).toHaveBeenCalledWith('<p>Hello, John!</p>');
    expect(mockSendEmail).toHaveBeenCalledWith({
      to: 'john@example.com',
      subject: 'Welcome, John',
      html: '<p>Hello, John!</p>',
      text: 'Hello, John!'
    });
    expect(result).toEqual<SendEmailResult>({ status: 'sent' });
  });

  it('should return an error if sendEmail fails', async () => {
    const mockSendEmail = jest.fn().mockResolvedValue({ status: 'failed', error: 'SMTP error' });
    jest.mock('@/email', () => ({
      sendEmail: mockSendEmail
    }));

    const mockRenderToStaticMarkup = jest.fn().mockReturnValue('<p>Hello, John!</p>');
    jest.mock('react-dom/server', () => ({
      renderToStaticMarkup: mockRenderToStaticMarkup
    }));

    const mockBody = jest.fn(async (props: any) => `<p>Hello, ${props.name}!</p>`);
    const mockSubject = jest.fn(async (props: any) => `Welcome, ${props.name}`);
    jest.mock('@/email/template/ShiftEmail', () => ({
      body: mockBody,
      subject: mockSubject
    }));

    const { sendEmailWithTemplate } = await import('./index');
    const result = await sendEmailWithTemplate({
      to: 'john@example.com',
      template: 'ShiftEmail',
      props: { name: 'John' } as any
    });

    expect(mockBody).toHaveBeenCalledWith({ name: 'John' });
    expect(mockSubject).toHaveBeenCalledWith({ name: 'John' });
    expect(mockRenderToStaticMarkup).toHaveBeenCalledWith('<p>Hello, John!</p>');
    expect(mockSendEmail).toHaveBeenCalledWith({
      to: 'john@example.com',
      subject: 'Welcome, John',
      html: '<p>Hello, John!</p>',
      text: 'Hello, John!'
    });

    expect(result).toEqual<SendEmailResult>({ status: 'failed', error: 'SMTP error' });
  });

  it('should queue the email if USE_EMAIL_QUEUE is true', async () => {
    process.env.USE_EMAIL_QUEUE = 'true';

    const mockQueueEmail = jest.fn();
    jest.mock('@/service/email-service', () => ({
      queueEmail: mockQueueEmail
    }));

    const mockRenderToStaticMarkup = jest.fn().mockReturnValue('<p>Hello, John!</p>');
    jest.mock('react-dom/server', () => ({
      renderToStaticMarkup: mockRenderToStaticMarkup
    }));

    const mockBody = jest.fn(async (props: any) => `<p>Hello, ${props.name}!</p>`);
    const mockSubject = jest.fn(async (props: any) => `Welcome, ${props.name}`);
    jest.mock('@/email/template/ShiftEmail', () => ({
      body: mockBody,
      subject: mockSubject
    }));

    const { sendEmailWithTemplate } = await import('./index');
    const result = await sendEmailWithTemplate({
      to: 'john@example.com',
      template: 'ShiftEmail',
      props: { name: 'John' } as any
    });

    expect(mockBody).toHaveBeenCalledWith({ name: 'John' });
    expect(mockSubject).toHaveBeenCalledWith({ name: 'John' });
    expect(mockRenderToStaticMarkup).toHaveBeenCalledWith('<p>Hello, John!</p>');
    expect(mockQueueEmail).toHaveBeenCalledWith({
      to: 'john@example.com',
      subject: 'Welcome, John',
      body: '<p>Hello, John!</p>'
    });
    expect(result).toEqual<SendEmailResult>({ status: 'queued' });
  });
});
