/**
 * NextResponse factory functions
 * @since 2026-03-11
 * @author Michael Townsend <@continuities>
 */

import { NextResponse } from 'next/server';

/**
 * Creates a NextResponse object configured to prompt the user to download a CSV file with the specified content and filename.
 * @param csvContent - The CSV content to be returned in the response
 * @param filename - The desired filename for the downloaded CSV file (without extension)
 * @returns A NextResponse object configured to prompt the user to download a CSV file with the specified content and filename
 */
export const CSVResponse = (csvContent: string, filename: string): NextResponse =>
  new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}.csv"`
    }
  });

/**
 * Creates a NextResponse object with a 501 Not Implemented status and a message body of 'Not Implemented'.
 * @returns A NextResponse object with a 501 Not Implemented status and a message body of 'Not Implemented'
 */
export const NotImplementedResponse = (): NextResponse =>
  new NextResponse('Not Implemented', { status: 501 });

/**
 * Creates a NextResponse object with a 400 Bad Request status and the specified message in the response body.
 * @param message - The message to be included in the response body
 * @returns A NextResponse object with a 400 Bad Request status and the specified message in the response body
 */
export const BadRequestResponse = (message: string): NextResponse =>
  new NextResponse(message, { status: 400 });

/**
 * Creates a NextResponse object with a 404 Not Found status and a message body of 'Not Found'.
 * @returns A NextResponse object with a 404 Not Found status and a message body of 'Not Found'
 */
export const NotFoundResponse = (): NextResponse => new NextResponse('Not Found', { status: 404 });
