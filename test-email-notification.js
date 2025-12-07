// Test script for email notification system
// Run this in your browser console or as a Node.js script

const testEmailNotification = async () => {
  const supabaseUrl = 'YOUR_SUPABASE_URL'
  const supabaseKey = 'YOUR_SUPABASE_PUBLISHABLE_KEY'
  
  // Initialize Supabase client
  const { createClient } = supabase
  const supabaseClient = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test 1: Get a pending store to test with
    console.log('🔍 Finding a pending store to test with...')
    const { data: stores, error: storesError } = await supabaseClient
      .from('stores')
      .select('id, name, owner_id, status')
      .eq('status', 'pending')
      .limit(1)
    
    if (storesError) {
      console.error('❌ Error fetching stores:', storesError)
      return
    }
    
    if (!stores || stores.length === 0) {
      console.log('⚠️ No pending stores found. Please create a store first.')
      return
    }
    
    const testStore = stores[0]
    console.log('✅ Found test store:', testStore)
    
    // Test 2: Update store status to rejected with a reason
    console.log('📧 Updating store status to rejected...')
    const { data: updateData, error: updateError } = await supabaseClient
      .from('stores')
      .update({
        status: 'rejected',
        rejection_reason: 'Test rejection reason: Please provide better documentation and clearer store description.',
        reviewed_by: 'YOUR_USER_ID', // Replace with actual user ID
        reviewed_at: new Date().toISOString()
      })
      .eq('id', testStore.id)
      .select()
    
    if (updateError) {
      console.error('❌ Error updating store:', updateError)
      return
    }
    
    console.log('✅ Store updated successfully:', updateData)
    console.log('📬 Email notification should be sent to the store owner!')
    console.log('🔍 Check the Edge Function logs in your Supabase dashboard to see if the email was sent.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Instructions for manual testing
console.log(`
🧪 Email Notification Test Instructions:

1. Replace YOUR_SUPABASE_URL and YOUR_SUPABASE_PUBLISHABLE_KEY with your actual values
2. Replace YOUR_USER_ID with an actual user ID (employee/admin)
3. Make sure you have:
   - Deployed the Edge Function: supabase functions deploy send-store-notification
   - Set up the webhook in Supabase dashboard
   - Configured RESEND_API_KEY in Edge Function environment variables
4. Run this script in your browser console or as a Node.js script

📋 Manual Test Steps:
1. Go to your Supabase dashboard > Database > Webhooks
2. Create a new webhook for the 'stores' table
3. Set it to trigger on 'UPDATE' events
4. Point it to your Edge Function URL
5. Add a filter: status = 'rejected'
6. Test by updating a store status to 'rejected'

📧 Expected Result:
- Store owner should receive an email with the rejection reason
- Email should be in the appropriate language (EN/FR/AR)
- Check Edge Function logs for any errors
`)

// Uncomment the line below to run the test
// testEmailNotification()
