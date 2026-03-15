import {
  BadRequestResponse,
  CSVResponse,
  NotFoundResponse,
  NotImplementedResponse
} from './response';

jest.mock('next/server', () => ({
  NextResponse: class {
    status: number;
    body: string;
    headers: Map<string, string>;

    constructor(body: string, init?: { status?: number; headers?: Record<string, string> }) {
      this.body = body;
      this.status = init?.status ?? 200;
      this.headers = new Map(Object.entries(init?.headers ?? {}));
    }
  }
}));

describe('CSVResponse', () => {
  it('should return a NextResponse with correct headers and content for CSV download', () => {
    const csvContent = 'name,age\nJohn,30';
    const filename = 'test';
    const response = CSVResponse(csvContent, filename);

    expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="test.csv"');
    expect(response.body).toBe(csvContent);
  });

  it('should sanitize filename by replacing invalid characters', () => {
    const csvContent = 'name,age\nJohn,30';
    const filename = 'test"file\nname';
    const response = CSVResponse(csvContent, filename);

    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="test_file_name.csv"'
    );
  });
});

describe('NotImplementedResponse', () => {
  it('should return a NextResponse with 501 status and "Not Implemented" message', () => {
    const response = NotImplementedResponse();

    expect(response.status).toBe(501);
    expect(response.body).toBe('Not Implemented');
  });
});

describe('BadRequestResponse', () => {
  it('should return a NextResponse with 400 status and the specified message', () => {
    const message = 'Invalid input';
    const response = BadRequestResponse(message);

    expect(response.status).toBe(400);
    expect(response.body).toBe(message);
  });
});

describe('NotFoundResponse', () => {
  it('should return a NextResponse with 404 status and "Not Found" message', () => {
    const response = NotFoundResponse();

    expect(response.status).toBe(404);
    expect(response.body).toBe('Not Found');
  });
});
