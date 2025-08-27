# Document Viewing Troubleshooting Guide

## Common Issues and Solutions

### 1. Documents Not Opening When Clicked

**Symptoms:**
- Clicking "View" button doesn't open the document
- Document opens in a blank tab
- Error messages about document access

**Possible Causes:**
- Document URL is not publicly accessible
- CORS (Cross-Origin Resource Sharing) restrictions
- Document requires authentication
- Invalid or malformed document URL

**Solutions:**
1. **Check Console Logs**: Open browser developer tools (F12) and check the console for error messages
2. **Verify Document URLs**: Ensure the document URLs in the database are valid and accessible
3. **Check File Permissions**: Verify that documents are stored with proper public access permissions
4. **Test Direct Access**: Try opening the document URL directly in a new browser tab

### 2. Google Docs Viewer Not Working

**Symptoms:**
- Preview shows "Preview Not Available"
- Google Docs Viewer fails to load
- Blank iframe content

**Solutions:**
1. **Check URL Encoding**: Ensure document URLs are properly encoded
2. **Verify Public Access**: Google Docs Viewer requires publicly accessible URLs
3. **Alternative Viewers**: The system now includes fallback viewers:
   - Microsoft Office Online Viewer for Office documents
   - Direct download as fallback

### 3. Document Preview Issues

**Symptoms:**
- Preview thumbnails not showing
- Broken image previews
- Inconsistent preview behavior

**Solutions:**
1. **Check File Types**: Ensure supported file types are being uploaded
2. **Image Preview**: Images are displayed directly in the preview
3. **Document Preview**: Office documents and PDFs use online viewers
4. **Fallback Handling**: System automatically falls back to download if preview fails

## Debug Information

The improved document viewer now includes debug information that shows:
- File type detection
- File extension
- Document location (truncated for security)

This information helps identify why documents might not be opening properly.

## Supported File Types

### Images (Direct Preview)
- JPG, JPEG, PNG, GIF, BMP, WebP

### Documents (Online Viewers)
- PDF: Google Docs Viewer + Microsoft Office Online
- DOC, DOCX: Google Docs Viewer + Microsoft Office Online
- XLS, XLSX: Google Docs Viewer + Microsoft Office Online
- TXT, RTF: Google Docs Viewer

### Fallback
- If online viewing fails, documents are automatically downloaded

## Testing Document Access

To test if a document is accessible:

1. **Copy the document URL** from the debug information
2. **Open in new tab** to test direct access
3. **Check network tab** in developer tools for failed requests
4. **Verify CORS headers** if using external storage

## Common URL Issues

### Invalid URLs
- URLs without proper protocol (http:// or https://)
- Malformed URLs with special characters
- URLs pointing to local file system

### Access Issues
- URLs requiring authentication
- URLs with expired tokens
- URLs pointing to private/internal networks

## Getting Help

If issues persist:
1. Check browser console for error messages
2. Verify document URLs are accessible
3. Test with different document types
4. Check network connectivity and firewall settings
