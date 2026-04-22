# Security Specification - Tường Chef

## Data Invariants
1. Orders must belong to a valid Company and User.
2. Orders cannot be created after 10:30 AM unless approved via LateOrderRequest.
3. Users cannot modify their own roles.
4. Users can only see orders from their own company if they are representatives, or their own orders if they are employees.
5. Admins have full access to all collections.
6. Prices in orders must match either the base price or the daily menu override.

## The Dirty Dozen (Test Payloads)
1. **The Ghost Order**: User A creates an order for User B. (DENY)
2. **The Price Hack**: User updates order totalAmount to 1,000 VND. (DENY)
3. **The Role Escalation**: User updates their profile `role` to 'admin'. (DENY)
4. **The Late Snatcher**: User creates an order at 11:00 AM without approval. (DENY)
5. **The Company Spy**: User from Company X reads orders from Company Y. (DENY)
6. **The Shadow Field**: User adds `isVerified: true` to their profile. (DENY)
7. **The Menu Manipulator**: Non-admin updates DailyMenu. (DENY)
8. **The Representative Faker**: User sets `companyId` of a company they don't belong to. (DENY)
9. **The Refund Scam**: User updates an 'confirmed' order back to 'pending_payment'. (DENY)
10. **The ID Poison**: User uses a 2KB string as a document ID. (DENY)
11. **The Orphan Maker**: User creates an order for a non-existent Company. (DENY)
12. **The Bill Eraser**: User deletes the `paymentImageUrl` after it was confirmed. (DENY)
