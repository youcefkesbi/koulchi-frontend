import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the request body
    const { record, old_record } = await req.json()

    // Check if this is a store rejection
    if (record.status === 'rejected' && old_record.status !== 'rejected') {
      console.log('Store rejected, sending notification email...')
      
    // Get store owner's email from auth.users using service role
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(record.owner_id)

    if (userError || !userData?.user?.email) {
      console.error('Error fetching user email:', userError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

      // Get store owner's profile for name
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('full_name')
        .eq('id', record.owner_id)
        .single()

      const ownerName = profileData?.full_name || 'Store Owner'

      // Get store pack information for language detection
      const { data: packData, error: packError } = await supabaseClient
        .from('packs')
        .select('name_en, name_ar, name_fr')
        .eq('id', record.pack_id)
        .single()

      // Determine language based on pack name (fallback to English)
      let language = 'en'
      if (packData) {
        if (packData.name_ar && packData.name_ar.includes('أساسي')) {
          language = 'ar'
        } else if (packData.name_fr && packData.name_fr.includes('basique')) {
          language = 'fr'
        }
      }

      // Create email content based on language
      const emailContent = createEmailContent(language, {
        storeName: record.name,
        ownerName: ownerName,
        rejectionReason: record.rejection_reason || 'No specific reason provided',
        storeId: record.id
      })

      // Send email using Resend
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Koulchi <contact@koulchi.site>',
          to: [userData.user.email],
          subject: emailContent.subject,
          html: emailContent.html,
        }),
      })

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text()
        console.error('Failed to send email:', errorData)
        return new Response(
          JSON.stringify({ error: 'Failed to send email' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const emailResult = await emailResponse.json()
      console.log('Email sent successfully:', emailResult.id)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Store rejection notification sent',
          emailId: emailResult.id 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // If not a rejection, return success
    return new Response(
      JSON.stringify({ success: true, message: 'No action needed' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-store-notification function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Email content templates
function createEmailContent(language, data) {
  const templates = {
    en: {
      subject: `Store Rejection Notification - ${data.storeName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Store Rejection Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { padding: 20px; }
            .reason-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
            .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Store Rejection Notification</h1>
          </div>
          <div class="content">
            <p>Dear ${data.ownerName},</p>
            <p>We regret to inform you that your store application for <strong>${data.storeName}</strong> has been rejected.</p>
            
            <div class="reason-box">
              <h3>Rejection Reason:</h3>
              <p>${data.rejectionReason}</p>
            </div>
            
            <p>Please review the feedback above and make the necessary corrections before resubmitting your store application.</p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <a href="https://koulchi.site" class="btn">Visit Koulchi</a>
          </div>
          <div class="footer">
            <p>Best regards,<br>The Koulchi Team</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </body>
        </html>
      `
    },
    fr: {
      subject: `Notification de Rejet de Boutique - ${data.storeName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Notification de Rejet de Boutique</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { padding: 20px; }
            .reason-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
            .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Notification de Rejet de Boutique</h1>
          </div>
          <div class="content">
            <p>Cher ${data.ownerName},</p>
            <p>Nous regrettons de vous informer que votre demande de boutique pour <strong>${data.storeName}</strong> a été rejetée.</p>
            
            <div class="reason-box">
              <h3>Raison du Rejet :</h3>
              <p>${data.rejectionReason}</p>
            </div>
            
            <p>Veuillez examiner les commentaires ci-dessus et apporter les corrections nécessaires avant de soumettre à nouveau votre demande de boutique.</p>
            
            <p>Si vous avez des questions ou besoin d'assistance, n'hésitez pas à contacter notre équipe de support.</p>
            
            <a href="https://koulchi.site" class="btn">Visiter Koulchi</a>
          </div>
          <div class="footer">
            <p>Cordialement,<br>L'Équipe Koulchi</p>
            <p>Ceci est un message automatisé. Veuillez ne pas répondre à cet e-mail.</p>
          </div>
        </body>
        </html>
      `
    },
    ar: {
      subject: `إشعار رفض المتجر - ${data.storeName}`,
      html: `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>إشعار رفض المتجر</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { padding: 20px; }
            .reason-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
            .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>إشعار رفض المتجر</h1>
          </div>
          <div class="content">
            <p>عزيزي ${data.ownerName}،</p>
            <p>نأسف لإعلامك بأن طلب متجرك <strong>${data.storeName}</strong> قد تم رفضه.</p>
            
            <div class="reason-box">
              <h3>سبب الرفض:</h3>
              <p>${data.rejectionReason}</p>
            </div>
            
            <p>يرجى مراجعة الملاحظات أعلاه وإجراء التصحيحات اللازمة قبل إعادة تقديم طلب المتجر.</p>
            
            <p>إذا كان لديك أي أسئلة أو تحتاج إلى مساعدة، فلا تتردد في الاتصال بفريق الدعم لدينا.</p>
            
            <a href="https://koulchi.site" class="btn">زيارة كولشي</a>
          </div>
          <div class="footer">
            <p>مع أطيب التحيات،<br>فريق كولشي</p>
            <p>هذه رسالة آلية. يرجى عدم الرد على هذا البريد الإلكتروني.</p>
          </div>
        </body>
        </html>
      `
    }
  }

  return templates[language] || templates.en
}
