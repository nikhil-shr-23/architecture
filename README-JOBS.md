# Setting Up Job Posting Functionality for Archinnection

This document provides instructions for setting up the job posting functionality for the Archinnection platform, allowing companies to post job opportunities for architects.

## Database Setup

1. Go to your Supabase dashboard: https://app.supabase.com/
2. Select your project
3. Go to the SQL Editor
4. Run the SQL from `supabase/jobs.sql` to set up the necessary table and policies

## Features Implemented

The job posting functionality includes:

1. **Post a Job Button**:
   - Located in the navigation bar next to the logout button
   - Opens a modal form for creating new job listings

2. **Job Posting Form**:
   - Fields for job title, company name, location, job type, salary range, description, requirements, contact email, and application URL
   - Form validation to ensure all required fields are filled correctly

3. **Jobs Page**:
   - Browse tab: Displays all active job listings
   - My Posted Jobs tab: Shows jobs posted by the current user
   - Sample job listings to demonstrate the functionality

## Components

The job posting functionality is implemented using the following components:

1. `components/job-post-form.tsx`: Modal form for creating new job listings
2. `app/jobs/page.tsx`: Page for browsing and managing job listings
3. `components/ui/badge.tsx`: Badge component for displaying job types and statuses

## Database Schema

The job posting functionality uses the following table:

- `jobs`: Stores job listings with details like title, company, location, description, requirements, etc.

## Row Level Security

The jobs table has Row Level Security (RLS) policies that ensure:

- Anyone can view active job listings
- Users can only create job listings as themselves
- Users can only update and delete their own job listings

## Usage

1. **Posting a Job**:
   - Click the "Post a Job" button in the navigation bar
   - Fill out the job posting form with all required details
   - Submit the form to create a new job listing

2. **Browsing Jobs**:
   - Go to the Jobs page to see all active job listings
   - View job details including title, company, location, description, requirements, and how to apply

3. **Managing Your Jobs**:
   - Go to the Jobs page and select the "My Posted Jobs" tab
   - View and manage all jobs you've posted
