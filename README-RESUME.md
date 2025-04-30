# Setting Up Resume Upload Functionality for Archinnection

This document provides instructions for setting up the resume upload functionality for the Archinnection platform, allowing architects to upload and showcase their resumes.

## Database Setup

1. Go to your Supabase dashboard: https://app.supabase.com/
2. Select your project
3. Go to the SQL Editor
4. Run the SQL from `supabase/resume-storage.sql` to set up the storage bucket and policies
5. Run the SQL from `supabase/update-profiles.sql` to add resume fields to the profiles table

## Features Implemented

The resume upload functionality includes:

1. **Resume Upload Component**:
   - Drag and drop or file browser interface
   - File type validation (PDF, DOC, DOCX)
   - File size validation (max 5MB)
   - Progress indication during upload

2. **Resume Management**:
   - View uploaded resume
   - Download resume
   - Delete resume
   - Replace existing resume with a new one

3. **Resume Viewing**:
   - Other users can view and download your resume
   - Resume is displayed on your profile page

## Components

The resume upload functionality is implemented using the following components:

1. `components/resume-upload.tsx`: Component for uploading, viewing, and managing resumes
2. `app/profile/page.tsx`: Updated to include the resume upload component in the resume tab

## Storage

Resumes are stored in the Supabase Storage bucket named 'resumes'. The bucket is configured with the following policies:

- Anyone can view resumes
- Authenticated users can upload resumes
- Users can update and delete their own resumes

## Database Schema

The resume functionality uses the following fields in the profiles table:

- `resume_url`: Stores the URL to the uploaded resume file
- `resume_name`: Stores the original filename of the uploaded resume

## Usage

1. **Uploading a Resume**:
   - Go to your profile page
   - Select the "Resume" tab
   - Drag and drop your resume file or click to browse
   - Click the "Upload Resume" button

2. **Viewing/Downloading a Resume**:
   - Go to a user's profile page
   - Select the "Resume" tab
   - If a resume is available, click the "Download" button to download it

3. **Replacing a Resume**:
   - Go to your profile page
   - Select the "Resume" tab
   - Upload a new resume to replace the existing one

4. **Deleting a Resume**:
   - Go to your profile page
   - Select the "Resume" tab
   - Click the "Delete" button next to your resume
