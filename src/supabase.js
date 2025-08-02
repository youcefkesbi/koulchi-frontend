import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dngrxmydwffmfkgtivyh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuZ3J4bXlkd2ZmbWZrZ3RpdnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NzQ2MTIsImV4cCI6MjA2OTI1MDYxMn0.PZye76QVS3uPwZ4FRwzCQaf2v6jXhRDtm9nRdvJaOl0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)