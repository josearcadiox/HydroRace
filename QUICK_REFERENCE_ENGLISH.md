# 📝 Quick Reference - Page Features (English)

## 🎯 Opening (30 seconds)

> "I'm presenting the **Baby Monitor IoT System** - a real-time monitoring solution that allows parents to supervise noise levels in baby rooms through IoT sensors connected to Microsoft Azure."

---

## 🖥️ Dashboard Features

### **1. Real-Time Indicator**
> "The large indicator shows current noise level in decibels. Colors indicate status:
> - **Green** (< 60 dB): Normal, quiet environment
> - **Yellow** (60-75 dB): Warning, moderate noise  
> - **Red** (> 75 dB): Danger, high noise (baby crying)"

### **2. Information Cards**
> "Three cards display:
> - **Device:** Shows which device is active
> - **Last Update:** Timestamp of latest data
> - **Total Records:** Count of all stored data points"

### **3. Interactive Chart**
> "The chart shows noise history over time, automatically updates every 10 seconds, and is fully interactive with zoom and pan capabilities."

---

## ⚙️ Control Panel Features

### **1. Send Data Manually**
> "Simulates sending data from Arduino/ESP32. Enter device ID and decibel level, click 'Send Data', and see immediate confirmation. The dashboard updates automatically."

### **2. View Statistics**
> "Enter a device ID to see:
> - Total number of records
> - Average decibel level
> - Maximum recorded level
> - Minimum recorded level
> - Last record timestamp"

### **3. Manage Data**
> "Two deletion options:
> - **Delete Old Data:** Remove records older than X days (1, 7, 30, 90, or 365 days)
> - **Delete by Device:** Remove all data for a specific device
> Both include dry-run mode to preview before deleting"

### **4. Export History**
> "Download complete history in CSV or JSON format. Optionally save to Azure Storage for long-term archiving. Can filter by specific device."

---

## 🔄 Real-Time Features

> "The dashboard:
> - **Auto-refreshes** every 10 seconds
> - **Updates charts** with new data points
> - **Changes colors** based on noise levels
> - **Shows alerts** when levels exceed thresholds"

---

## 🔌 API Features

> "Seven REST APIs provide:
> - **POST ReceiveNoiseData:** Save noise data
> - **GET GetNoiseHistory:** Retrieve history
> - **GET GetDeviceStats:** Calculate statistics
> - **GET GetActiveDevices:** List active devices
> - **DELETE DeleteOldData:** Remove old records
> - **DELETE DeleteDeviceData:** Remove device data
> - **GET ExportHistory:** Export to CSV/JSON"

---

## 💾 Data Storage

> "All data stored in Azure Cosmos DB:
> - **Database:** BabyMonitorDB
> - **Container:** NoiseData
> - **Partitioned** by deviceId for scalability
> - **Automatically indexed** for fast queries"

---

## 🎯 Key Points

✅ **Real-time monitoring** - Updates every 10 seconds  
✅ **Multiple devices** - Supports unlimited devices  
✅ **Complete history** - All data stored and accessible  
✅ **Statistics** - Average, max, min calculations  
✅ **Data management** - Delete old or specific data  
✅ **Export capability** - Download CSV/JSON  
✅ **Responsive design** - Works on any device  
✅ **Secure** - HTTPS, Key Vault, CORS configured  

---

## 💡 Demo Flow

1. **Show dashboard** - Explain real-time indicator and chart
2. **Send data** - Demonstrate manual data entry
3. **View statistics** - Show device statistics
4. **Explain APIs** - Mention 7 REST APIs available
5. **Show data storage** - Explain Cosmos DB integration

---

## 🎤 Closing

> "The Baby Monitor IoT System demonstrates complete integration of hardware, software, and cloud infrastructure. It's serverless, scalable, cost-effective, and ready for production use."

---

**URL:** https://black-ground-0a9bdd31e.3.azurestaticapps.net

