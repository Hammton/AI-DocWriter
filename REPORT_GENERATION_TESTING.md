# Report Generation & Preview Testing Guide

## New Features Implemented ✅

### 1. **Individual Report Generation**
- Each row in your CSV generates a **separate report**
- Your 10-row CSV will create **10 individual reports**

### 2. **Report Preview System**
- **Preview reports in HTML format** before downloading
- **Select specific reports** from a list by application name
- **Individual PDF downloads** for each report

### 3. **Enhanced UI/UX**
- **File upload interface** with drag-and-drop support
- **Progress tracking** during report generation
- **Report selector** with organization/application details
- **Error handling** with detailed feedback

## 🚀 **How to Test the New Functionality**

### Step 1: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd "C:\Users\HomePC\AI Docuwriter\backend"
npm start
```
*Should show: "🚀 AI DocuWriter Backend running on port 3001"*

**Terminal 2 - Frontend:**
```bash
cd "C:\Users\HomePC\AI Docuwriter\frontend"
npm run dev
```
*Should open: http://localhost:5173*

### Step 2: Navigate Through the Workflow

1. **Domain Selection** → Choose any domain
2. **Template Selection** → Choose "Application Profile Report" (or any template)
3. **Data Source Selection** → Choose any option
4. **Input Form** → Fill out the form
5. **Report Generation** → **NEW ENHANCED PAGE**

### Step 3: Test Report Generation

1. **Upload Your CSV File:**
   - Click the upload area or drag your `Application_Profile_Report_Data.csv`
   - Should show green confirmation with file name

2. **Generate Reports:**
   - Click "Generate Reports" button
   - Watch progress bar: Preparing → Generating → Processing → Completed
   - Should process all 10 rows from your CSV

3. **View Reports:**
   - Click "View & Download Reports" button
   - Redirects to new **Report Preview page**

### Step 4: Test Report Preview & Download

**Report Preview Page Features:**

1. **Report List (Left Side):**
   - Shows all 10 generated reports
   - Each shows: Application Name, Organization, ID
   - Click any report to preview it

2. **Preview Area (Right Side):**
   - Live HTML preview of selected report
   - Professional formatting with your data
   - Real-time switching between reports

3. **Download Individual Reports:**
   - Click download button for specific report
   - Generates PDF on-demand
   - Downloads with proper filename

## 📋 **Expected Results from Your CSV**

From your `Application_Profile_Report_Data.csv`, you should see **10 individual reports**:

1. **TechCorp Employee Portal** (A0001)
2. **GlobalBank Customer Portal** (B0002)  
3. **HealthSystem Patient Portal** (C0003)
4. **EduTech Learning Portal** (D0004)
5. **RetailCorp Vendor Portal** (E0005)
6. **ManufactureCo Production Portal** (F0006)
7. **LogisticsPro Fleet Portal** (G0007)
8. **InsurancePlus Claims Portal** (H0008)
9. **TravelCorp Booking Portal** (I0009)
10. **EnergyGrid Utility Portal** (J0010)

Each report will contain:
- **Organization-specific branding**
- **Application details** from your CSV
- **Dependencies and integrations**
- **Financial information** (TCO, CapEx, OpEx)
- **License details** and utilization
- **Professional formatting** ready for presentation

## 🎯 **Key Testing Points**

### ✅ File Upload
- [ ] CSV file uploads successfully
- [ ] File validation works (only CSV accepted)
- [ ] File size display is accurate
- [ ] Error handling for invalid files

### ✅ Report Generation
- [ ] Progress bar shows correctly
- [ ] All 10 reports generate successfully
- [ ] No errors in browser console
- [ ] Backend logs show processing messages

### ✅ Report Preview
- [ ] All 10 reports appear in the list
- [ ] Report selection works smoothly
- [ ] HTML preview loads for each report
- [ ] Content is properly formatted
- [ ] Data from CSV is correctly mapped

### ✅ PDF Download
- [ ] Individual PDF generation works
- [ ] PDFs download with correct filenames
- [ ] PDF content matches HTML preview
- [ ] No "Failed to load PDF document" errors
- [ ] Multiple downloads work without issues

## 🔧 **Troubleshooting**

### Backend Issues
```bash
# Check if backend is responding
curl http://localhost:3001/api/health

# Should return:
{
  "status": "healthy",
  "templates": {
    "application": true,
    "business": true, 
    "demand": true
  }
}
```

### Frontend Issues
- **File Upload Problems:** Check browser console for errors
- **Preview Not Loading:** Verify backend API responses in Network tab
- **PDF Download Fails:** Check backend logs for Puppeteer errors

### Common Fixes
```bash
# Restart backend if issues occur
cd backend
npm run build
npm start

# Clear browser cache and refresh
# Check that both servers are running on correct ports
```

## 🎉 **Success Criteria**

**✅ Complete Success When:**
1. CSV uploads without errors
2. Progress shows 10 reports generated
3. Report preview page lists all 10 applications
4. HTML preview works for each report
5. PDF downloads work for individual reports
6. No "Failed to load PDF document" errors
7. Each PDF contains correct data from CSV row

## 📊 **Performance Notes**

- **Report Generation:** ~10-30 seconds for 10 reports (depends on OpenAI API)
- **PDF Generation:** ~2-5 seconds per PDF using Puppeteer
- **Preview Loading:** Instant (HTML rendering)
- **File Upload:** <1 second for typical CSV files

## 🔄 **Next Steps After Testing**

Once basic functionality works:

1. **Add More Templates:** Test with Business Profile and Demand Profile templates
2. **Batch PDF Download:** Add "Download All" functionality  
3. **Report Sharing:** Add URL sharing for specific reports
4. **Data Validation:** Enhance CSV validation and error reporting
5. **Styling Improvements:** Customize PDF layouts and branding

Your enhanced AI DocuWriter now supports **individual report generation with preview functionality** - exactly what you requested! 🚀