# Resume Contact Extractor

<div align="center">
  <img src="/public/miduty.webp" alt="Miduty Logo" width="120" />
  <h3>Professional Resume Data Extraction Tool</h3>
</div>

A modern, professional Next.js application that leverages the Anthropic Claude API to extract contact information from PDF resumes with high accuracy and efficiency.

## Features

- **Multiple Resume Processing**: Upload and process multiple PDF resumes (up to 32MB each)
- **Intelligent Batch Processing**: Progress tracking and smart queue management
- **Large Batch Handling**: Warning system for large batch uploads with estimated processing times
- **Comprehensive Data Extraction**:
  - Full Name
  - Email Address
  - Phone Number
  - LinkedIn URL
  - Location/Address
  - Personal Website
- **Professional Data Management**:
  - View extracted data in a sortable, filterable table format
  - Download all data as CSV or Excel (XLSX) files
  - Copy individual entries or all data as JSON
  - Remove individual entries or clear all data
- **PDF Viewing Capabilities**:
  - View original PDF documents alongside extracted data
  - Tabbed interface for easy switching between data and PDF views
  - Zoom and page navigation controls
  - Click on any row to view the corresponding PDF
- **Modern UI/UX**:
  - Responsive design with Tailwind CSS
  - Professional color scheme and typography
  - Intuitive split-screen layout
  - Smooth animations and transitions
  - Optimized for all device sizes

## Technologies Used

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Anthropic Claude API
- React Dropzone for file uploads

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- Anthropic API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your-api-key-here
   ```

### Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the application.

### Usage

1. Drag and drop a PDF resume onto the upload area, or click to select a file
2. Wait for Claude to process the resume and extract contact information
3. View the extracted information
4. Copy individual fields or all data as JSON

## API Endpoints

### POST /api/extract-resume

Extracts contact information from a PDF resume.

**Request Body:**

```json
{
  "pdfBase64": "base64-encoded-pdf-data"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1 (555) 123-4567",
    "linkedin": "linkedin.com/in/johndoe",
    "location": "San Francisco, CA",
    "website": "johndoe.com"
  }
}
```

## Deployment

### Deploying to Vercel

This application is configured for easy deployment to Vercel:

1. Fork or clone this repository to your GitHub account
2. Create a new project on [Vercel](https://vercel.com)
3. Connect your GitHub repository to Vercel
4. Configure the environment variable:
   - Add `ANTHROPIC_API_KEY` with your Anthropic API key
5. Deploy the application

Alternatively, you can deploy directly from the command line:

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Login to Vercel:
   ```bash
   vercel login
   ```
3. Deploy the application:
   ```bash
   vercel
   ```
4. Follow the prompts to configure your project
5. Set up the environment variable:
   ```bash
   vercel env add ANTHROPIC_API_KEY
   ```

### Mobile Responsiveness

The application is fully responsive and works well on all device sizes:

- **Desktop**: Full split-screen layout with side-by-side panels
- **Tablet**: Responsive layout with optimized spacing and controls
- **Mobile**: Stacked layout with touch-friendly controls and optimized table view

## License

MIT
