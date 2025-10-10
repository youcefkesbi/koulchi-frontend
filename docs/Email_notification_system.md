# Store Notification System - Email Implementation Guide

## Overview

This document explains how to implement email notifications for store approval/rejection using Supabase Edge Functions.

## How It Works
Employee clicks "Approve Store"
↓
Database updates store status to "approved"
↓
Supabase says "Hey, something changed!"
↓
Edge Function wakes up and says "I need to send an email!"
↓
Edge Function sends email to store owner
↓
Store owner receives email notification

## What You Need to Provide

### 1. Email Service (Choose One)

#### Resend (Recommended for beginners)
- Free tier: 3,000 emails/month
- Easy setup, good documentation
- Cost: $20/month for 50,000 emails

#### SendGrid (More advanced)
- Free tier: 100 emails/day
- More features, harder setup
- Cost: $15/month for 40,000 emails

#### Nodemailer (Free but complex)
- Use your own email server
- More technical setup required

### 2. Edge Function Code
- JavaScript code that handles email sending
- Runs automatically when database changes

### 3. Email Templates
- HTML templates for approved/rejected stores
- Multi-language support (EN/FR/AR)

## Step-by-Step Setup

### Step 1: Choose Email Service
1. Sign up for Resend (easiest)
2. Get your API key
3. Verify your domain

### Step 2: Create Edge Function
1. Create file: `supabase/functions/send-store-notification/index.js`
2. Write code to send emails
3. Deploy to Supabase

### Step 3: Connect Database to Function
1. Tell Supabase: "When stores table changes, run this function"
2. This is called a "webhook" or "trigger"

### Step 4: Test
1. Employee approves a store
2. Check if email is sent
3. Fix any issues

## What Happens Behind the Scenes

- You don't need to run anything - Supabase handles everything
- No servers to manage - It's all automatic
- Scales automatically - Handles 1 email or 1 million emails
- You only pay for what you use - No fixed costs

## Cost Breakdown

- **Supabase Edge Functions**: Free tier included
- **Resend Email Service**: $20/month for 50,000 emails
- **Total**: ~$20/month for most small businesses


