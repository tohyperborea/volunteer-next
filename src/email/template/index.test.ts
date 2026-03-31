describe('sendEmailWithTemplate', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should send an email using the provided template and props', async () => {
    const mockSendEmail = jest.fn().mockResolvedValue({ sent: true });
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
    expect(result).toEqual({ sent: true });
  });

  it('should return an error if sendEmail fails', async () => {
    const mockSendEmail = jest.fn().mockResolvedValue({ sent: false, error: 'SMTP error' });
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

    expect(result).toEqual({ sent: false, error: 'SMTP error' });
  });
});
