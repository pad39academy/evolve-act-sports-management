# Intelligent Hotel Assignment Workflow Guide

## 🎯 **Complete Auto-Assignment System**

### **Step 1: Team Approval Creates Accommodation Requests**
- When Event Manager approves a team, accommodation requests are automatically created for players who need them
- Each player gets an individual accommodation request with preferences

### **Step 2: Event Manager Assignment - Two Methods**

#### **Option A: Auto-Assign from Cluster (Recommended)**
```
1. Event Manager selects hotel cluster
2. Clicks "Auto-Assign from Cluster"
3. System intelligently assigns hotels with this priority:
   - Priority 1: Pay-per-use hotels with availability
   - Priority 2: On-availability hotels with availability
4. Room availability is automatically managed
```

#### **Option B: Manual Selection**
```
1. Event Manager selects hotel cluster
2. Chooses specific hotel and room category
3. System checks availability and assigns
```

### **Step 3: Automatic Processing Based on Hotel Type**

#### **Pay-Per-Use Hotels (Priority 1)**
- ✅ **Auto-approved immediately**
- ✅ **Room availability decreased by 1 automatically**
- ✅ **Status changes to "confirmed"**
- ✅ **No hotel manager approval needed**
- ✅ **Player gets QR code and confirmation**

#### **On-Availability Hotels (Priority 2)**
- ⏳ **Requires hotel manager approval**
- ⏳ **Status remains "hotel_assigned" until approved**
- ⏳ **Hotel manager sees request in their dashboard**

### **Step 4: Hotel Manager Response (On-Availability Only)**

#### **If Hotel Manager Approves:**
- ✅ **Status changes to "confirmed"**
- ✅ **Room availability decreased by 1**
- ✅ **Player gets QR code and confirmation**

#### **If Hotel Manager Rejects:**
- ❌ **Status changes to "hotel_rejected"**
- ❌ **Request appears in Event Manager's "Rejected Accommodations" tab**
- ❌ **Event Manager must reassign to different hotel**
- ❌ **No room availability changes (rooms weren't allocated)**

### **Step 5: Reassignment Workflow for Rejected Requests**
- Event Manager sees rejected requests in dedicated tab
- Can reassign to different hotel in same cluster
- Process repeats with new hotel
- Continues until successful assignment

## 🏨 **Hotel Availability Management**

### **Room Availability Logic:**
```
Initial State: availableRooms = totalRooms
Auto-Assignment: availableRooms decreases by 1 (pay-per-use)
Hotel Approval: availableRooms decreases by 1 (on-availability)
Hotel Rejection: availableRooms unchanged (no allocation)
```

### **Database Updates:**
- `hotels.availableRooms` - Hotel level availability
- `room_categories.availableRooms` - Room category level availability
- Both decrease by 1 when accommodation is confirmed

## 🔄 **Complete Workflow Example**

### **Scenario: Mumbai Warriors Team Approval**
```
1. Team Manager creates Mumbai Warriors team
2. Event Manager approves team
3. System creates accommodation requests for 3 players
4. Event Manager assigns to "Mumbai Sports Cluster"
5. Auto-assignment prioritizes:
   - Sports Inn (pay-per-use) - 2 players auto-approved
   - Marriott (on-availability) - 1 player needs approval
6. Hotel manager approves Marriott request
7. All 3 players get confirmed accommodations
```

### **Scenario: Rejection and Reassignment**
```
1. Player assigned to Hotel A (on-availability)
2. Hotel A manager rejects (fully booked)
3. Request appears in Event Manager's rejected list
4. Event Manager reassigns to Hotel B in same cluster
5. Hotel B manager approves
6. Player gets confirmed accommodation
```

## 📊 **Assignment Priority Algorithm**

### **Hotel Selection Priority:**
1. **Pay-per-use hotels with availability** (auto-approve)
2. **On-availability hotels with availability** (needs approval)
3. **Hotels with most available rooms** (within same category)

### **Room Category Selection:**
- First available room category in the hotel
- Based on `availableRooms > 0`

### **Availability Check:**
```sql
-- System checks this before assignment
SELECT h.*, rc.* 
FROM hotels h 
JOIN room_categories rc ON h.id = rc.hotel_id 
WHERE h.cluster_id = ? 
  AND h.approved = 'approved'
  AND rc.available_rooms > 0
ORDER BY 
  CASE WHEN h.booking_type = 'pay_per_use' THEN 1 ELSE 2 END,
  rc.available_rooms DESC;
```

## 🎯 **API Endpoints**

### **Auto-Assignment:**
```
POST /api/event-manager/accommodation-requests/:id/assign-hotel
{
  "clusterId": 1,
  "automatic": true
}
```

### **Manual Assignment:**
```
POST /api/event-manager/accommodation-requests/:id/assign-hotel
{
  "hotelId": 5,
  "roomCategoryId": 12,
  "clusterId": 1,
  "automatic": false
}
```

### **Hotel Manager Response:**
```
POST /api/hotel-manager/accommodation-requests/:id/respond
{
  "status": "hotel_approved", // or "hotel_rejected"
  "reason": "Room available for requested dates"
}
```

## 🔧 **Database Schema Updates**

### **player_accommodation_requests table:**
- `status`: pending → hotel_assigned → confirmed/hotel_rejected
- `response_status`: pending → approved/rejected
- `assigned_by`: Event Manager who assigned
- `assigned_at`: Assignment timestamp
- `hotel_responded_by`: Hotel Manager who responded
- `hotel_responded_at`: Response timestamp

### **Room Availability Tracking:**
- `hotels.available_rooms` - Decreases on confirmation
- `room_categories.available_rooms` - Decreases on confirmation
- Both updated automatically by system

## 🎉 **Benefits of This System**

1. **Intelligent Prioritization** - Pay-per-use hotels get priority
2. **Automatic Approval** - Reduces manual work for Event Managers
3. **Availability Management** - Real-time room tracking
4. **Rejection Handling** - Clear workflow for reassignment
5. **Audit Trail** - Complete history of assignments and responses
6. **Scalable** - Works for any number of teams and players

This system ensures efficient hotel allocation while maintaining flexibility for both automatic and manual assignment based on your specific requirements!