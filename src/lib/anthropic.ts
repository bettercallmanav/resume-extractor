import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client with the API key from environment variables
export const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// The model to use for PDF processing
export const MODEL = 'claude-3-5-sonnet-20240620';

// Function to create a prompt for extracting contact information from a resume
export function createResumeExtractionPrompt(pdfContent: string): string {
  return `
Please analyze this resume PDF and extract the following contact information:
1. Full Name
2. Email Address
3. Phone Number
4. LinkedIn URL (if present)
5. Location/Address (if present)
6. Personal Website (if present)

Format your response as a JSON object with these fields:
{
  "fullName": "...",
  "email": "...",
  "phone": "...",
  "linkedin": "...",
  "location": "...",
  "website": "..."
}

Only include fields that you can find in the resume. If you can't find a particular field, omit it from the JSON.
`;
}
