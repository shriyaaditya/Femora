# Femora Backend Operational Cost Breakdown

## 💰 Your Current Budget Setup
- **Monthly Budget**: ₹5,000 (approximately $60 USD)
- **Alert Thresholds**: 50%, 90%, 100%, 150%
- **Currency**: INR (Indian Rupees)

---

## 🏷️ Your Deployed Services

### Service Configuration
| Service | CPU | Memory | Max Instances | Region |
|---------|-----|--------|---------------|--------|
| **Image Backend** | 1 vCPU | 2 GiB | 10 | us-central1 |
| **Mora Backend** | 1 vCPU | 2 GiB | 10 | us-central1 |

### Current Status
- **Deployment Date**: September 7, 2025
- **Status**: Both services active and healthy
- **Traffic**: 100% routed to latest revisions
- **Scaling**: Scale-to-zero enabled (no idle costs)

---

## 📊 Google Cloud Run Pricing (Tier 1 - us-central1)

### Free Tier Allowances (Monthly)
- **CPU**: 240,000 vCPU-seconds FREE
- **Memory**: 450,000 GiB-seconds FREE
- **Requests**: 2,000,000 requests FREE

### Pay-as-you-go Rates
- **CPU**: $0.000018 per vCPU-second
- **Memory**: $0.000002 per GiB-second
- **Requests**: $0.40 per million requests

### Currency Conversion (Approximate)
- **1 USD ≈ ₹83** (as of September 2025)
- **Your Budget**: ₹5,000 ≈ $60 USD

---

## 🎯 Realistic Cost Scenarios

### Scenario 1: Development/Testing Phase
**Usage Pattern**: Light testing, occasional requests
- **CPU Usage**: 50,000 vCPU-seconds/month per service
- **Memory Usage**: 100,000 GiB-seconds/month per service
- **Requests**: 50,000 requests/month per service

**Cost Calculation:**
- CPU: FREE (under 240K limit)
- Memory: FREE (under 450K limit)
- Requests: FREE (under 2M limit)
- **Total Cost: ₹0/month** ✅

---

### Scenario 2: Beta Testing (100-200 users)
**Usage Pattern**: Regular testing, moderate requests
- **CPU Usage**: 300,000 vCPU-seconds/month per service
- **Memory Usage**: 600,000 GiB-seconds/month per service
- **Requests**: 500,000 requests/month per service

**Cost Calculation per Service:**
- CPU: (300,000 - 240,000) × $0.000018 = $1.08 ≈ ₹90
- Memory: (600,000 - 450,000) × $0.000002 = $0.30 ≈ ₹25
- Requests: FREE (under 2M limit)
- **Cost per Service: ₹115/month**

**Total for Both Services: ₹230/month** (4.6% of budget)

---

### Scenario 3: Early Production (500-1,000 users)
**Usage Pattern**: Active users, regular image uploads and chat
- **CPU Usage**: 1,000,000 vCPU-seconds/month per service
- **Memory Usage**: 2,000,000 GiB-seconds/month per service
- **Requests**: 1,500,000 requests/month per service

**Cost Calculation per Service:**
- CPU: (1,000,000 - 240,000) × $0.000018 = $13.68 ≈ ₹1,135
- Memory: (2,000,000 - 450,000) × $0.000002 = $3.10 ≈ ₹257
- Requests: FREE (under 2M limit)
- **Cost per Service: ₹1,392/month**

**Total for Both Services: ₹2,784/month** (55.7% of budget)

---

### Scenario 4: Active Production (2,000-5,000 users)
**Usage Pattern**: High usage, frequent image processing and AI chat
- **CPU Usage**: 3,000,000 vCPU-seconds/month per service
- **Memory Usage**: 6,000,000 GiB-seconds/month per service
- **Requests**: 4,000,000 requests/month per service

**Cost Calculation per Service:**
- CPU: (3,000,000 - 240,000) × $0.000018 = $49.68 ≈ ₹4,123
- Memory: (6,000,000 - 450,000) × $0.000002 = $11.10 ≈ ₹921
- Requests: (4,000,000 - 2,000,000) × $0.40/1M = $0.80 ≈ ₹66
- **Cost per Service: ₹5,110/month**

**Total for Both Services: ₹10,220/month** ⚠️ **EXCEEDS BUDGET**

---

## 🔍 Additional Service Costs

### Google Cloud Storage (Image Storage)
- **Storage**: $0.020 per GB per month ≈ ₹1.66 per GB
- **Operations**: $0.05 per 10,000 operations ≈ ₹4.15 per 10K ops
- **Estimated**: ₹200-1,000/month (depending on image volume)

### Firestore (Metadata & Chat History)
- **Document Reads**: $0.06 per 100,000 reads ≈ ₹5 per 100K reads
- **Document Writes**: $0.18 per 100,000 writes ≈ ₹15 per 100K writes
- **Storage**: $0.18 per GB per month ≈ ₹15 per GB
- **Estimated**: ₹300-1,500/month

### Network Egress
- **First 1 GB**: FREE per month
- **Additional**: $0.12 per GB ≈ ₹10 per GB
- **Estimated**: ₹100-500/month

---

## 📈 Total Monthly Cost Estimates

| Usage Level | Cloud Run | GCS + Firestore | Network | **Total** | **Budget %** |
|-------------|-----------|-----------------|---------|-----------|--------------|
| **Development** | ₹0 | ₹200-500 | ₹100-200 | **₹300-700** | **6-14%** |
| **Beta (200 users)** | ₹230 | ₹300-600 | ₹150-300 | **₹680-1,130** | **14-23%** |
| **Early Prod (1K users)** | ₹2,784 | ₹500-1,000 | ₹200-400 | **₹3,484-4,184** | **70-84%** |
| **Active Prod (5K users)** | ₹10,220 | ₹1,000-2,000 | ₹400-800 | **₹11,620-13,020** | **232-260%** |

---

## ⚠️ Budget Alerts Analysis

### Your Current Alert Thresholds
- **50%**: ₹2,500 - Early warning
- **90%**: ₹4,500 - Critical warning
- **100%**: ₹5,000 - Budget exceeded
- **150%**: ₹7,500 - Severe overage

### When You'll Hit Alerts
- **50% Alert**: Around 500-800 active users
- **90% Alert**: Around 1,000-1,500 active users
- **100% Alert**: Around 1,500+ active users

---

## 💡 Cost Optimization Strategies

### Immediate Optimizations
1. **Resource Right-sizing**
   - Monitor actual CPU/memory usage
   - Adjust limits based on real usage
   - Consider reducing memory to 1GB if possible

2. **Request Optimization**
   - Implement request batching
   - Add response caching
   - Optimize API calls

3. **Image Optimization**
   - Compress images before upload
   - Use appropriate image formats
   - Implement image resizing

### Advanced Optimizations
1. **CDN Integration**
   - Use Cloud CDN for static content
   - Reduce bandwidth costs
   - Improve performance

2. **Database Optimization**
   - Optimize Firestore queries
   - Implement data archiving
   - Use efficient data structures

3. **Caching Strategy**
   - Implement Redis caching
   - Cache frequent responses
   - Reduce redundant processing

---

## 🎯 Recommended Budget Management

### Phase 1: Development (Months 1-3)
- **Target**: Stay under ₹1,000/month
- **Users**: 0-100 beta testers
- **Focus**: Testing and optimization

### Phase 2: Beta Launch (Months 4-6)
- **Target**: Stay under ₹2,500/month (50% alert)
- **Users**: 100-500 beta users
- **Focus**: User feedback and scaling

### Phase 3: Production Launch (Months 7-12)
- **Target**: Stay under ₹4,500/month (90% alert)
- **Users**: 500-1,500 production users
- **Focus**: Revenue generation and optimization

### Phase 4: Scale (Year 2+)
- **Target**: Increase budget to ₹10,000-20,000/month
- **Users**: 1,500+ active users
- **Focus**: Market expansion

---

## 📊 Cost Per User Analysis

| User Count | Monthly Cost | Cost Per User | Revenue Potential |
|------------|--------------|---------------|-------------------|
| **100 users** | ₹680-1,130 | ₹6.8-11.3 | ₹500-2,000 |
| **500 users** | ₹2,784-3,484 | ₹5.6-7.0 | ₹2,500-10,000 |
| **1,000 users** | ₹5,110-6,110 | ₹5.1-6.1 | ₹5,000-20,000 |
| **5,000 users** | ₹11,620-13,020 | ₹2.3-2.6 | ₹25,000-100,000 |

---

## 🚨 Budget Exceeded Scenarios

### If You Exceed ₹5,000 Budget:

**Option 1: Increase Budget**
- Increase to ₹10,000/month (₹120 USD)
- Allows for 2,000-3,000 active users
- Provides room for growth

**Option 2: Optimize Resources**
- Reduce memory allocation to 1GB
- Implement aggressive caching
- Optimize image processing

**Option 3: Tiered Service**
- Implement usage limits for free users
- Premium features for paid users
- Revenue-based scaling

---

## 💰 Bottom Line

### Current Status
- **Budget**: ₹5,000/month ($60 USD)
- **Current Usage**: Minimal (development phase)
- **Cost**: ₹0-300/month (well within budget)

### Growth Projections
- **500 users**: ₹2,784/month (55% of budget) ✅
- **1,000 users**: ₹5,110/month (102% of budget) ⚠️
- **2,000 users**: ₹10,220/month (204% of budget) ❌

### Recommendations
1. **Monitor usage closely** as you approach 500 users
2. **Implement optimizations** before reaching 1,000 users
3. **Plan budget increase** for production scale
4. **Focus on revenue generation** to offset costs

---

**🎯 Key Takeaway**: Your ₹5,000 budget will comfortably support development and early production (up to 500-800 users). Beyond that, you'll need to either optimize costs or increase your budget to ₹10,000+ for sustainable growth.


