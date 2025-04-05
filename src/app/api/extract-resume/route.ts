import { NextRequest, NextResponse } from 'next/server';
import { anthropicClient, MODEL, createResumeExtractionPrompt } from '@/lib/anthropic';
import { ExtractResumeRequest, ExtractResumeResponse, ContactInfo } from '@/lib/types';

// Maximum number of tokens allowed in Claude's context window
const MAX_TOKENS = 180000; // Leave some buffer from the 200K limit

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse the request body
    const body = await request.json() as ExtractResumeRequest;
    
    if (!body.pdfBase64) {
      return NextResponse.json(
        { success: false, error: 'No PDF data provided' } as ExtractResumeResponse,
        { status: 400 }
      );
    }

    // Create a message to Claude with the PDF document
    let message;
    try {
      message = await anthropicClient.messages.create({
        model: MODEL,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: body.pdfBase64
                }
              },
              {
                type: 'text',
                text: createResumeExtractionPrompt(body.pdfBase64)
              }
            ]
          }
        ],
      });
    } catch (apiError: any) {
      console.error('Claude API error:', apiError);
      
      // Check if it's a token limit error
      if (apiError.message && apiError.message.includes('prompt is too long')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'The PDF is too large to process. Please try a smaller PDF file (fewer pages or smaller file size).' 
          } as ExtractResumeResponse,
          { status: 413 } // 413 Payload Too Large
        );
      }
      
      // Handle other API errors
      return NextResponse.json(
        { 
          success: false, 
          error: apiError.message || 'Error communicating with Claude API' 
        } as ExtractResumeResponse,
        { status: 500 }
      );
    }

    // Extract the JSON response from Claude
    let responseText = '';
    
    // Check if the response has content and it's a text block
    if (message.content && message.content.length > 0) {
      const contentBlock = message.content[0];
      if (contentBlock.type === 'text') {
        responseText = contentBlock.text;
      }
    }
    
    if (!responseText) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No text response received from AI' 
        } as ExtractResumeResponse,
        { status: 500 }
      );
    }
    
    // Try to parse the JSON from Claude's response
    try {
      // Find JSON object in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const contactInfo = JSON.parse(jsonMatch[0]) as ContactInfo;
      
      return NextResponse.json(
        { success: true, data: contactInfo } as ExtractResumeResponse,
        { status: 200 }
      );
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to parse contact information from the resume' 
        } as ExtractResumeResponse,
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing resume:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      } as ExtractResumeResponse,
      { status: 500 }
    );
  }
}
