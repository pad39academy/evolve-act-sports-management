# Database Relations & Data Manipulation Guide

## 🏗️ **Key Database Relationships**

### **1. Hotel-Manager Relationship**
```sql
-- Hotels belong to Hotel Managers via manager_id
SELECT 
    h.id as hotel_id,
    h.name as hotel_name,
    h.manager_id,
    u.first_name || ' ' || u.last_name as hotel_manager_name,
    u.email as hotel_manager_email,
    h.booking_type,
    h.total_rooms,
    h.available_rooms
FROM hotels h
LEFT JOIN users u ON h.manager_id = u.id
ORDER BY h.id;
```

### **2. Complete Hotel Ecosystem**
```sql
-- Hotels → Managers → Clusters → Room Categories
SELECT 
    h.id as hotel_id,
    h.name as hotel_name,
    u.first_name || ' ' || u.last_name as manager_name,
    u.email as manager_email,
    hc.name as cluster_name,
    rc.category_name,
    rc.total_rooms as category_rooms,
    rc.price_per_night
FROM hotels h
LEFT JOIN users u ON h.manager_id = u.id
LEFT JOIN hotel_clusters hc ON h.cluster_id = hc.id
LEFT JOIN room_categories rc ON h.id = rc.hotel_id
ORDER BY h.id, rc.id;
```

### **3. Team-Manager Relationship**
```sql
-- Teams belong to Team Managers
SELECT 
    tr.id as team_id,
    tr.team_name,
    tr.status,
    u.first_name || ' ' || u.last_name as team_manager_name,
    u.email as team_manager_email,
    tr.created_at
FROM team_requests tr
LEFT JOIN users u ON tr.team_manager_id = u.id
ORDER BY tr.id;
```

### **4. Player Accommodation Workflow**
```sql
-- Players → Teams → Accommodation Requests → Hotels
SELECT 
    par.id as accommodation_id,
    tm.first_name || ' ' || tm.last_name as player_name,
    tm.email as player_email,
    tr.team_name,
    h.name as hotel_name,
    rc.category_name,
    par.status,
    par.check_in_status,
    par.check_out_status
FROM player_accommodation_requests par
LEFT JOIN team_members tmem ON par.team_member_id = tmem.id
LEFT JOIN users tm ON tmem.user_id = tm.id
LEFT JOIN team_requests tr ON tmem.team_request_id = tr.id
LEFT JOIN hotels h ON par.hotel_id = h.id
LEFT JOIN room_categories rc ON par.room_category_id = rc.id
ORDER BY par.id;
```

## 🔧 **Data Manipulation Commands**

### **Delete Individual Records**

#### **Delete a Hotel**
```sql
-- First, check what will be affected
SELECT 'Room Categories' as table_name, count(*) as records 
FROM room_categories WHERE hotel_id = 1
UNION ALL
SELECT 'Accommodation Requests' as table_name, count(*) as records 
FROM player_accommodation_requests WHERE hotel_id = 1
UNION ALL
SELECT 'Booking Requests' as table_name, count(*) as records 
FROM booking_requests WHERE hotel_id = 1;

-- Delete hotel (cascade will handle related records)
DELETE FROM hotels WHERE id = 1;
```

#### **Delete a Team**
```sql
-- Check team members first
SELECT tm.id, tm.first_name || ' ' || tm.last_name as player_name
FROM team_members tmem
JOIN users tm ON tmem.user_id = tm.id
WHERE tmem.team_request_id = 24;

-- Delete team and all related data
DELETE FROM team_requests WHERE id = 24;
-- This will cascade delete: team_members, player_accommodation_requests, account_creation_requests
```

#### **Delete a User**
```sql
-- Check user's relationships first
SELECT 
    'Hotels Managed' as relationship, count(*) as count FROM hotels WHERE manager_id = 19
UNION ALL
SELECT 'Teams Managed' as relationship, count(*) as count FROM team_requests WHERE team_manager_id = 19
UNION ALL
SELECT 'Team Memberships' as relationship, count(*) as count FROM team_members WHERE user_id = 19;

-- Delete user (be careful - this affects many relationships)
DELETE FROM users WHERE id = 19;
```

### **Update Individual Records**

#### **Change Hotel Manager**
```sql
-- Move hotel from one manager to another
UPDATE hotels 
SET manager_id = 20  -- New manager ID
WHERE id = 1;        -- Hotel ID
```

#### **Update Team Status**
```sql
-- Approve a team
UPDATE team_requests 
SET status = 'approved', 
    approved_by = 10,  -- Event Manager ID
    approved_at = NOW()
WHERE id = 24;
```

#### **Update Room Availability**
```sql
-- Increase room availability
UPDATE room_categories 
SET available_rooms = available_rooms + 5
WHERE hotel_id = 1 AND id = 1;
```

### **Add New Test Data**

#### **Add New Hotel Manager**
```sql
-- First create the user
INSERT INTO users (first_name, last_name, email, password, role, organization, mobile_country_code, mobile_number, is_verified)
VALUES ('Test', 'Manager', 'test.manager@example.com', '$2b$12$encrypted_password_here', 'hotel_manager', 'Test Hotels Corp', '+91', '9876543210', 'true');

-- Get the new user ID
SELECT id FROM users WHERE email = 'test.manager@example.com';
```

#### **Add New Hotel**
```sql
-- Create hotel for the new manager
INSERT INTO hotels (name, manager_id, cluster_id, total_rooms, available_rooms, booking_type, approved)
VALUES ('Test Hotel', 22, 1, 100, 100, 'on_availability', 'approved');
```

#### **Add Room Categories**
```sql
-- Add room categories for the new hotel
INSERT INTO room_categories (hotel_id, category_name, total_rooms, available_rooms, price_per_night)
VALUES 
    (14, 'Deluxe', 30, 30, 2500.00),
    (14, 'Suite', 20, 20, 3500.00),
    (14, 'Standard', 50, 50, 1500.00);
```

## 🔍 **Useful Query Templates**

### **Find All Data for a Hotel Manager**
```sql
-- Everything managed by a specific hotel manager
SELECT 
    'Hotel' as type,
    h.id,
    h.name,
    h.booking_type,
    h.total_rooms as rooms
FROM hotels h
WHERE h.manager_id = 19

UNION ALL

SELECT 
    'Room Category' as type,
    rc.id,
    rc.category_name,
    rc.total_rooms::text,
    rc.available_rooms
FROM room_categories rc
JOIN hotels h ON rc.hotel_id = h.id
WHERE h.manager_id = 19;
```

### **Find All Data for a Team Manager**
```sql
-- Everything managed by a specific team manager
SELECT 
    tr.id as team_id,
    tr.team_name,
    tr.status,
    COUNT(tm.id) as team_members,
    COUNT(par.id) as accommodation_requests
FROM team_requests tr
LEFT JOIN team_members tm ON tr.id = tm.team_request_id
LEFT JOIN player_accommodation_requests par ON tm.id = par.team_member_id
WHERE tr.team_manager_id = 13
GROUP BY tr.id, tr.team_name, tr.status;
```

### **Find Orphaned Records**
```sql
-- Hotels without managers
SELECT h.id, h.name 
FROM hotels h 
LEFT JOIN users u ON h.manager_id = u.id 
WHERE u.id IS NULL;

-- Teams without managers
SELECT tr.id, tr.team_name 
FROM team_requests tr 
LEFT JOIN users u ON tr.team_manager_id = u.id 
WHERE u.id IS NULL;
```

## 🎯 **Your Current Data Overview**

### **Hotel Managers:**
- **Anand Sundaram** (ID: 19) - Manages 6 hotels
- **Anand Iyer** (ID: 20) - Manages 3 hotels  
- **Siddhartha Venkatesan** (ID: 21) - Manages 2 hotels

### **Your Enthiran Team:**
- **Team ID**: 24
- **Status**: pending
- **Team Manager**: Karthik Venkatesan (ID: 13)
- **Created**: 2025-07-15 05:58:10

### **Quick Delete Commands for Testing:**

```sql
-- Delete your Enthiran team
DELETE FROM team_requests WHERE id = 24;

-- Delete a test hotel
DELETE FROM hotels WHERE id = 13;

-- Delete all teams by a specific manager
DELETE FROM team_requests WHERE team_manager_id = 13;
```

Use these commands to manipulate your test data as needed!