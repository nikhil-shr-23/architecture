# Setting Up Connection Functionality for Archinnection

This document provides instructions for setting up the connection functionality for the Archinnection platform, allowing architects to connect with each other.

## Database Setup

1. Go to your Supabase dashboard: https://app.supabase.com/
2. Select your project
3. Go to the SQL Editor
4. Run the SQL from `supabase/connections.sql` to set up the necessary table and policies

## Features Implemented

The connection functionality includes:

1. **Connect Button**:
   - Displayed on other architects' profiles
   - Shows different states: Connect, Pending, Connected, Accept/Reject

2. **Network Page**:
   - View all connections
   - View pending connection requests
   - Discover new architects to connect with

3. **Profile Viewing**:
   - View other architects' profiles
   - Send connection requests

## Components

The connection functionality is implemented using the following components:

1. `components/connect-button.tsx`: Button for sending, accepting, and managing connection requests
2. `app/network/page.tsx`: Page for viewing connections and connection requests
3. `app/profile/page.tsx`: Updated to support viewing other architects' profiles and connecting with them

## Database Schema

The connection functionality uses the following table:

- `connections`: Stores connection requests and statuses between architects

## Row Level Security

The connections table has Row Level Security (RLS) policies that ensure:

- Users can only view their own connections
- Users can only create connection requests as themselves
- Users can only update connections they're involved in
- Users can only delete their own connection requests

## Usage

1. **Viewing Profiles**:
   - Navigate to the Network page to see suggested architects
   - Click on an architect's profile to view their details

2. **Sending Connection Requests**:
   - Visit another architect's profile
   - Click the "Connect" button to send a connection request

3. **Managing Connection Requests**:
   - Go to the Network page and select the "Pending" tab
   - View incoming connection requests
   - Visit the profile to accept or reject requests

4. **Viewing Connections**:
   - Go to the Network page to see all your connections
   - Click on a connection to view their profile
