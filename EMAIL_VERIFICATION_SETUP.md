# Email Verification Setup Guide

## Overview
This guide will help you set up automatic email verification for TakeItAndLeaveIt, restricting signups to only @cate.org email addresses and sending verification emails from your custom noreply email.

## 1. Supabase Email Configuration

### Step 1: Configure Email Settings in Supabase Dashboard
1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication > Settings**
3. Under **Email**, ensure the following settings:
   - ✅ **Enable email confirmations** is checked
   - ✅ **Secure email change** is checked
   - ✅ **Double confirm email changes** is checked

### Step 2: Configure SMTP Settings
1. In **Authentication > Settings > Email**
2. Choose **Custom SMTP** instead of Supabase's default
3. Configure your SMTP settings:
   - **SMTP Host**: Your email provider's SMTP server
   - **SMTP Port**: Usually 587 or 465
   - **SMTP User**: Your noreply email address (e.g., noreply@takeitandleaveit.org)
   - **SMTP Password**: Your email password or app password
   - **SMTP Admin Email**: noreply@takeitandleaveit.org
   - **SMTP Sender Name**: TakeItAndLeaveIt

### Step 3: Email Templates
Configure custom email templates in **Authentication > Email Templates**:

#### Confirm Signup Template:
```html
<h2>Welcome to TakeItAndLeaveIt!</h2>
<p>Thank you for signing up for TakeItAndLeaveIt, the campus trading platform for Cate School.</p>
<p>Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
<p>If you didn't create an account, please ignore this email.</p>
<p>Best regards,<br>The TakeItAndLeaveIt Team</p>
```

#### Magic Link Template:
```html
<h2>Sign in to TakeItAndLeaveIt</h2>
<p>You can sign in to your TakeItAndLeaveIt account by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Sign In</a></p>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request this, please ignore this email.</p>
```

## 2. Domain Setup for Custom Email

### Option A: Use Your Own Domain (Recommended)
1. **Register a domain** (e.g., takeitandleaveit.org)
2. **Set up email hosting** (Google Workspace, Outlook, or your hosting provider)
3. **Create noreply email**: noreply@takeitandleaveit.org
4. **Configure SPF/DKIM records** for email deliverability

### Option B: Use Existing Email Service
1. **Use Gmail/Outlook** with app-specific password
2. **Create dedicated email**: takeitandleaveit.noreply@gmail.com
3. **Configure SMTP** with app password

## 3. Database Configuration

### Run the SQL Setup Script:
1. Go to **Supabase Dashboard > SQL Editor**
2. Copy and paste the contents of `supabase/email_verification_setup.sql`
3. Execute the script

### Verify Configuration:
```sql
-- Check if email confirmations are working
SELECT * FROM user_confirmation_status LIMIT 5;
```

## 4. Testing Email Verification

### Test Signup Flow:
1. **Try signing up** with a non-@cate.org email → Should be rejected
2. **Sign up** with a valid @cate.org email → Should receive verification email
3. **Check email** and click verification link → Should redirect to app
4. **Try signing in** without verification → Should show error

### Test Email Delivery:
1. **Check spam folder** if emails don't arrive
2. **Verify SMTP settings** in Supabase dashboard
3. **Test with different email providers** (Gmail, Outlook, etc.)

## 5. Troubleshooting

### Common Issues:

#### Emails Not Sending:
- ✅ Check SMTP credentials in Supabase
- ✅ Verify email provider allows SMTP
- ✅ Check spam folder
- ✅ Test with different email addresses

#### Verification Links Not Working:
- ✅ Ensure `emailRedirectTo` is set correctly
- ✅ Check that callback page exists (`/auth/callback`)
- ✅ Verify domain configuration

#### Users Can Sign Up Without @cate.org:
- ✅ Check that validation is added to all signup forms
- ✅ Test with different email domains
- ✅ Verify frontend validation is working

## 6. Security Considerations

### Email Security:
- ✅ Use strong SMTP passwords
- ✅ Enable 2FA on email account
- ✅ Monitor email sending limits
- ✅ Set up email bounce handling

### User Security:
- ✅ Only allow @cate.org domains
- ✅ Require email verification before account activation
- ✅ Implement rate limiting on signup attempts
- ✅ Log authentication events

## 7. Monitoring and Maintenance

### Regular Checks:
- ✅ Monitor email delivery rates
- ✅ Check for failed verification attempts
- ✅ Review user signup patterns
- ✅ Update email templates as needed

### Analytics:
- ✅ Track signup conversion rates
- ✅ Monitor email open/click rates
- ✅ Identify common signup issues
- ✅ Measure user activation rates

## 8. Future Enhancements

### Advanced Features:
- 📧 **Custom email templates** per school (for multi-tenant)
- 📊 **Email analytics** and delivery tracking
- 🔄 **Resend verification** functionality
- 📱 **SMS verification** as backup
- 🎨 **Branded email templates** with school logos

---

## Quick Setup Checklist

- [ ] Enable email confirmations in Supabase
- [ ] Configure SMTP settings with your noreply email
- [ ] Run the SQL setup script
- [ ] Test signup with @cate.org email
- [ ] Test signup with non-@cate.org email (should fail)
- [ ] Verify email delivery and click-through
- [ ] Test login without email verification (should fail)
- [ ] Test login after email verification (should work)

Once completed, your TakeItAndLeaveIt platform will only accept @cate.org email addresses and automatically send verification emails from your custom noreply address!
