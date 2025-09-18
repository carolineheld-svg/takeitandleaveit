# Deployment Guide for TakeItAndLeaveIt

## 🚀 Vercel Deployment

### Prerequisites
- Vercel account (free tier available)
- Supabase project with database setup
- Domain name (optional, for custom domain)

### Step 1: Prepare Your Repository

1. **Commit all changes to Git:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Ensure your code is ready:**
   - ✅ Build passes: `npm run build`
   - ✅ All features tested locally
   - ✅ Database schema is up to date

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com) and sign in**

2. **Import your project:**
   - Click "New Project"
   - Import from GitHub/GitLab/Bitbucket
   - Select your repository

3. **Configure the project:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

4. **Add Environment Variables:**
   In the Vercel dashboard, add these environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete (usually 2-3 minutes)

### Step 3: Verify Deployment

1. **Test the live site:**
   - Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
   - Test all major features:
     - User registration/login
     - Item listing
     - Item browsing
     - Trade requests
     - Chat functionality

2. **Check functionality:**
   - ✅ Authentication works
   - ✅ Image uploads work
   - ✅ Database operations work
   - ✅ Real-time features work

### Step 4: Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Settings" → "Domains"
   - Add your custom domain

2. **Configure DNS:**
   - Add a CNAME record pointing to your Vercel domain
   - Or use Vercel's nameservers if transferring DNS

3. **SSL Certificate:**
   - Vercel automatically provides SSL certificates
   - HTTPS will be enabled automatically

## 🔧 Post-Deployment Checklist

### Database Setup
- [ ] Run `supabase/schema.sql` in Supabase SQL Editor
- [ ] Run `supabase/notifications_migration.sql` for notifications
- [ ] Verify all tables exist and have proper RLS policies
- [ ] Test database operations from the live site

### Environment Variables
- [ ] All Supabase credentials are correctly set in Vercel
- [ ] No sensitive keys are exposed in client-side code
- [ ] Service role key is only used server-side

### Features Testing
- [ ] User registration and login
- [ ] Item listing with image uploads
- [ ] Browse and search functionality
- [ ] Trade request system
- [ ] Chat system
- [ ] Notifications
- [ ] Wishlist functionality
- [ ] SmartMatch AI recommendations
- [ ] Size preferences
- [ ] Profile management

### Performance
- [ ] Site loads quickly
- [ ] Images load properly
- [ ] Real-time features work
- [ ] Mobile responsiveness

## 🐛 Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check environment variables are set
   - Ensure all dependencies are in package.json
   - Review build logs in Vercel dashboard

2. **Database Connection Issues:**
   - Verify Supabase URL and keys are correct
   - Check RLS policies are properly set
   - Ensure database schema is up to date

3. **Image Upload Issues:**
   - Verify Supabase Storage is configured
   - Check storage bucket policies
   - Ensure service role key has proper permissions

4. **Authentication Issues:**
   - Check Supabase Auth settings
   - Verify redirect URLs in Supabase
   - Ensure user profiles are created properly

### Getting Help:
- Check Vercel deployment logs
- Review Supabase logs
- Test locally with production environment variables

## 📊 Monitoring

### Vercel Analytics:
- Enable Vercel Analytics for performance monitoring
- Monitor Core Web Vitals
- Track user engagement

### Supabase Monitoring:
- Monitor database performance
- Track authentication metrics
- Review storage usage

## 🔄 Updates and Maintenance

### Deploying Updates:
1. Make changes locally
2. Test thoroughly
3. Commit and push to Git
4. Vercel will auto-deploy

### Database Migrations:
1. Create migration SQL files
2. Run in Supabase SQL Editor
3. Test on staging environment first

### Environment Variable Updates:
1. Update in Vercel dashboard
2. Redeploy if necessary
3. Test all affected functionality

## 🎉 Success!

Your TakeItAndLeaveIt platform is now live and ready for students and faculty to start trading items sustainably on campus!

### Share Your Platform:
- Announce to the campus community
- Create user guides
- Monitor usage and feedback
- Iterate based on user needs

---

**Need help?** Check the Vercel documentation or Supabase documentation for more detailed guides.
