# 3DFabrica - Troubleshooting & Error Handling

This guide provides solutions for common issues and unexpected behaviors in the 3DFabrica Beta.

## 🔑 Authentication Issues
### 1. "Failed to exchange code for session"
- **Cause**: The login link has expired, or the Supabase project configuration has changed.
- **Solution**: Go back to the [Home Page](https://3-d-fabrica.vercel.app) and sign in again.

### 2. Stuck on "Completing authentication..."
- **Cause**: Supabase might be experiencing high latency, or your network is blocking the redirect.
- **Solution**: Refresh the page. If the issue persists, clear your browser cookies for the site and try again.

## 🛋 3D Studio Issues
### 1. Canvas is blank or model is not loading
- **Cause**: The 3D model files are large and may take a moment to download on slower connections.
- **Solution**: Wait for the "Loading 3D Model..." message to disappear. If it doesn't load after 30 seconds, refresh the page.

### 2. Texture looks blurry or distorted
- **Cause**: Low-resolution image upload or incorrect tiling settings.
- **Solution**:
  - Ensure your uploaded image is at least 1024x1024 pixels.
  - Adjust the **Tiling Scale** in the **Edit** tab to match the fabric pattern.

### 3. Sidebar won't expand/collapse
- **Cause**: Mouse focus or browser zoom issues.
- **Solution**: 
  - Hover your mouse within 30 pixels of the left screen edge. 
  - Ensure your browser zoom is at 100%.

## 📄 PDF Export Issues
### 1. PDF window opens but shows a blank page
- **Cause**: Content failed to render before the print dialog opened.
- **Solution**: Close the print dialog and click "Export Technical Sheet" again.

### 2. PDF layout looks broken
- **Cause**: Incompatible browser or narrow window size.
- **Solution**: Use **Google Chrome** or **Microsoft Edge** for the best export results.

## 🛠 Reporting a Bug
If your issue is not listed here, please report it to our team with the following details:
- **Browser & OS**: e.g., Chrome on Windows 11.
- **Steps to reproduce**: What were you doing when the error happened?
- **Screenshot/Console Errors**: Press **F12**, go to the **Console** tab, and share any red error messages.
