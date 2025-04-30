# Setting Up Post Functionality for Archinnection

This document provides instructions for setting up the post creation, likes, and comments functionality for the Archinnection platform.

## Database Setup

1. Go to your Supabase dashboard: https://app.supabase.com/
2. Select your project
3. Go to the SQL Editor
4. Run the SQL from `supabase/posts.sql` to set up the necessary tables and policies
5. Run the SQL from `supabase/storage.sql` to set up the storage bucket for post images

## Features Implemented

The post functionality includes:

1. **Post Creation**:
   - Text content
   - Image upload
   - Author information

2. **Post Interactions**:
   - Like/unlike posts
   - Add comments
   - View comments

3. **Feed Display**:
   - Posts are displayed in reverse chronological order
   - Each post shows the author's name, profile picture, and post date
   - Like and comment counts are displayed

## Components

The post functionality is implemented using the following components:

1. `components/post-form.tsx`: Form for creating new posts with text and optional images
2. `components/post-feed.tsx`: Display of posts with like and comment functionality
3. `app/dashboard/page.tsx`: Integration of post components into the dashboard

## Storage

Post images are stored in the Supabase Storage bucket named 'posts'. The bucket is configured with the following policies:

- Anyone can view post images
- Authenticated users can upload post images
- Users can update and delete their own post images

## Database Schema

The post functionality uses the following tables:

1. `posts`: Stores post content, image URLs, and metadata
2. `likes`: Tracks which users have liked which posts
3. `comments`: Stores comments on posts

## Row Level Security

All tables have Row Level Security (RLS) policies that ensure:

- Anyone can view posts, likes, and comments
- Users can only create, update, and delete their own posts
- Users can only like/unlike posts as themselves
- Users can only create, update, and delete their own comments
