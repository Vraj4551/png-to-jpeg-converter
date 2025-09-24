# AWS Amplify Deployment Guide

This guide will help you deploy your PNG to JPEG converter to AWS Amplify.

## Prerequisites

1. **AWS Account**: You need an active AWS account
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Git**: Make sure Git is installed on your local machine

## Step 1: Push Code to GitHub

### Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial commit: PNG to JPEG converter"
```

### Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Name it: `png-to-jpeg-converter`
4. Make it public (required for free Amplify hosting)
5. Don't initialize with README (since you already have files)

### Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/png-to-jpeg-converter.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to AWS Amplify

### Option A: Using AWS Console (Recommended for beginners)

1. **Sign in to AWS Console**
   - Go to [AWS Console](https://console.aws.amazon.com)
   - Sign in with your AWS account

2. **Navigate to Amplify**
   - Search for "Amplify" in the AWS services search bar
   - Click on "AWS Amplify"

3. **Create New App**
   - Click "New app" → "Host web app"
   - Select "GitHub" as your source
   - Authorize GitHub connection if prompted

4. **Connect Repository**
   - Select your GitHub account
   - Choose the `png-to-jpeg-converter` repository
   - Select the `main` branch

5. **Configure Build Settings**
   - Amplify will auto-detect the `amplify.yml` file
   - Review the build settings (they should be correct)
   - Click "Save and deploy"

6. **Deploy**
   - Amplify will automatically build and deploy your app
   - This process takes 2-5 minutes
   - You'll see build logs in real-time

### Option B: Using AWS CLI

1. **Install AWS CLI**
   ```bash
   # Download from: https://aws.amazon.com/cli/
   ```

2. **Configure AWS CLI**
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Enter your default region (e.g., us-east-1)
   # Enter default output format (json)
   ```

3. **Create Amplify App**
   ```bash
   aws amplify create-app --name "png-to-jpeg-converter" --repository "https://github.com/YOUR_USERNAME/png-to-jpeg-converter"
   ```

## Step 3: Access Your Deployed App

1. **Get App URL**
   - After deployment completes, you'll see your app URL
   - Format: `https://main.d1234567890.amplifyapp.com`
   - You can also find this in the Amplify console

2. **Test Your App**
   - Open the URL in your browser
   - Upload a PNG file and test the conversion
   - Verify everything works correctly

## Step 4: Custom Domain (Optional)

1. **Add Custom Domain**
   - In Amplify console, go to "Domain management"
   - Click "Add domain"
   - Enter your domain name
   - Follow the DNS configuration instructions

2. **Configure DNS**
   - Add CNAME record pointing to your Amplify domain
   - Wait for SSL certificate provisioning (up to 24 hours)

## Automatic Deployments

- **Auto-Deploy**: Every time you push to the `main` branch, Amplify will automatically redeploy
- **Build Logs**: Monitor builds in the Amplify console
- **Rollback**: You can rollback to previous deployments if needed

## Cost Information

- **Free Tier**: 1000 build minutes per month
- **Hosting**: 5GB storage and 15GB data transfer per month
- **Beyond Free Tier**: Very affordable pricing for most use cases

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check build logs in Amplify console
   - Ensure all files are committed to GitHub
   - Verify `amplify.yml` syntax

2. **App Not Loading**
   - Check if `index.html` is in the root directory
   - Verify file paths in your HTML/CSS/JS

3. **GitHub Connection Issues**
   - Re-authorize GitHub in Amplify settings
   - Check repository permissions

### Getting Help

- **AWS Amplify Documentation**: [docs.aws.amazon.com/amplify](https://docs.aws.amazon.com/amplify/)
- **AWS Support**: Available through AWS Console
- **Community**: AWS Amplify Discord and forums

## Next Steps

After successful deployment:

1. **Monitor Usage**: Check Amplify console for usage statistics
2. **Set Up Alerts**: Configure CloudWatch alarms for monitoring
3. **Optimize**: Consider adding a CDN or performance optimizations
4. **Backup**: Your code is safely stored in GitHub

Your PNG to JPEG converter is now live on AWS Amplify! 🎉