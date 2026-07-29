# Google Cloud Run Cost Analysis - Femora Image Backend

## 🏷️ Your Deployment Configuration
- **Service**: `femora-image-backend`
- **Region**: `us-central1` (Tier 1 - Iowa)
- **CPU**: 1 vCPU
- **Memory**: 2 GiB
- **Max Instances**: 10
- **Scaling**: Scale to zero (no minimum instances)

## 💰 Google Cloud Run Pricing (Tier 1 Regions)

### Free Tier Allowances (Monthly)
- **CPU**: 240,000 vCPU-seconds FREE
- **Memory**: 450,000 GiB-seconds FREE  
- **Requests**: 2,000,000 requests FREE

### Pay-as-you-go Pricing
- **CPU**: $0.000018 per vCPU-second
- **Memory**: $0.000002 per GiB-second
- **Requests**: $0.40 per million requests

## 📊 Cost Scenarios

### Scenario 1: Light Usage (Development/Testing)
**Monthly Usage:**
- CPU: 100,000 vCPU-seconds
- Memory: 200,000 GiB-seconds
- Requests: 500,000 requests

**Cost Calculation:**
- CPU: 100,000 seconds (FREE - under 240,000 limit)
- Memory: 200,000 GiB-seconds (FREE - under 450,000 limit)
- Requests: 500,000 requests (FREE - under 2M limit)
- **Total Cost: $0.00/month** ✅

### Scenario 2: Moderate Usage (Small Production)
**Monthly Usage:**
- CPU: 500,000 vCPU-seconds
- Memory: 1,000,000 GiB-seconds
- Requests: 3,000,000 requests

**Cost Calculation:**
- CPU: (500,000 - 240,000) × $0.000018 = $4.68
- Memory: (1,000,000 - 450,000) × $0.000002 = $1.10
- Requests: (3M - 2M) × $0.40/1M = $0.40
- **Total Cost: $6.18/month** 💰

### Scenario 3: Heavy Usage (Active Production)
**Monthly Usage:**
- CPU: 2,000,000 vCPU-seconds
- Memory: 4,000,000 GiB-seconds
- Requests: 10,000,000 requests

**Cost Calculation:**
- CPU: (2M - 240K) × $0.000018 = $31.68
- Memory: (4M - 450K) × $0.000002 = $7.10
- Requests: (10M - 2M) × $0.40/1M = $3.20
- **Total Cost: $41.98/month** 💰💰

## 🎯 Real-World Estimates for Your App

### Breast Scan App Usage Patterns
Based on typical medical app usage:

**Conservative Estimate (100 users/month):**
- ~1,000 image uploads/month
- ~5,000 API calls/month
- **Estimated Cost: $0-2/month** (mostly FREE tier)

**Moderate Estimate (1,000 users/month):**
- ~10,000 image uploads/month
- ~50,000 API calls/month
- **Estimated Cost: $5-15/month**

**High Usage (10,000 users/month):**
- ~100,000 image uploads/month
- ~500,000 API calls/month
- **Estimated Cost: $30-60/month**

## 🚀 Cost Optimization Features

### ✅ Already Optimized
1. **Scale to Zero**: No cost when idle
2. **Tier 1 Region**: Lower pricing (us-central1)
3. **Efficient Resource Allocation**: 1 vCPU, 2GB RAM
4. **No Minimum Instances**: Only pay for actual usage

### 💡 Additional Optimizations
1. **Request Batching**: Reduce API calls
2. **Image Compression**: Reduce processing time
3. **Caching**: Cache frequent responses
4. **Monitoring**: Track usage patterns

## 📈 Cost Monitoring

### Google Cloud Console
- Monitor usage in Cloud Run metrics
- Set up billing alerts
- Track resource consumption

### Recommended Alerts
- Set $10/month billing alert
- Set $50/month billing alert
- Monitor CPU/memory usage spikes

## 🔍 Additional Costs to Consider

### Google Cloud Storage (GCS)
- **Storage**: $0.020 per GB per month
- **Operations**: $0.05 per 10,000 operations
- **Network Egress**: $0.12 per GB (first 1GB free)

### Firestore
- **Document Reads**: $0.06 per 100,000 reads
- **Document Writes**: $0.18 per 100,000 writes
- **Storage**: $0.18 per GB per month

### Estimated Additional Costs
- **GCS Storage**: ~$1-5/month (depending on image volume)
- **Firestore**: ~$1-3/month (metadata storage)
- **Total Additional**: ~$2-8/month

## 💰 Total Monthly Cost Estimates

| Usage Level | Cloud Run | GCS + Firestore | **Total** |
|-------------|-----------|-----------------|-----------|
| Light (100 users) | $0-2 | $2-3 | **$2-5** |
| Moderate (1K users) | $5-15 | $3-5 | **$8-20** |
| Heavy (10K users) | $30-60 | $5-10 | **$35-70** |

## 🎉 Key Benefits

1. **Start FREE**: Most development/testing is free
2. **Pay Only for Usage**: No idle costs
3. **Automatic Scaling**: Handles traffic spikes
4. **Global Availability**: Reliable service
5. **Enterprise Security**: HIPAA-compliant infrastructure

## 📋 Cost Management Tips

1. **Monitor Usage**: Check Cloud Console regularly
2. **Set Alerts**: Get notified of unusual costs
3. **Optimize Images**: Compress before upload
4. **Cache Responses**: Reduce redundant processing
5. **Review Monthly**: Analyze usage patterns

---
**Bottom Line**: Your deployment will likely cost **$0-20/month** for typical usage, with most small-scale usage staying within the FREE tier! 🎉


