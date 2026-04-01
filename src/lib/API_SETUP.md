# AgriTech API Setup Guide

This directory contains all API service modules for communicating with the AgriTech backend API.

## Configuration

### 1. Environment Setup

Create a `.env.local` file in the project root:

```env
VITE_API_URL=http://localhost:8000
```

For production:

```env
VITE_API_URL=https://api.agritechgh.me
```

### 2. API Base URL

The API base URL is configurable via the `VITE_API_URL` environment variable. Defaults to `http://localhost:8000` if not set.

## Services

All services are organized by feature domain:

### Core API (api.js)

- `getAccessToken()` - Retrieve stored JWT token
- `setAccessToken(token)` - Store JWT token
- `apiFetch(endpoint, options)` - Generic fetch wrapper with auto-retry and token refresh

### Auth Service (authService.js)

```javascript
import { authService } from "@/lib";

// Register
authService.register({
  fullName: "Kofi Mensah",
  email: "kofi@example.com",
  password: "mypassword1",
  role: "FARMER",
});

// Login
authService.login({
  email: "kofi@example.com",
  password: "mypassword1",
  rememberMe: false,
});

// Verify Email
authService.verifyEmail(token);

// Change Password
authService.changePassword({
  currentPassword: "oldpassword1",
  newPassword: "newpassword1",
});
```

### Listings Service (listingsService.js)

```javascript
import { listingsService } from "@/lib";

// Create Listing
listingsService.createListing({
  title: "Fresh Tomatoes",
  description: "Organic tomatoes",
  pricePerUnit: 50,
  quantity: 100,
  quantityAvailable: 100,
  unit: "KG",
  location: "Ho, Volta Region",
  listingType: "SELL",
  categoryId: "clh3z2k...",
});

// Get Listings with Filters
listingsService.getListings({
  search: "tomatoes",
  category: "clh3z2k...",
  minPrice: 40,
  maxPrice: 60,
  page: 1,
  limit: 20,
});

// Get Single Listing
listingsService.getListingById(id);

// Update Listing
listingsService.updateListing(id, {
  pricePerUnit: 60,
  quantityAvailable: 80,
});

// Delete Listing
listingsService.deleteListing(id);

// Upload Images
const files = [imageFile1, imageFile2];
listingsService.uploadListingImages(id, files);
```

### Cart Service (cartService.js)

```javascript
import { cartService } from "@/lib";

// Get Cart
cartService.getCart();

// Add Item to Cart
cartService.addItemToCart({
  listingId: "clh3z2k...",
  quantity: 10,
});

// Remove Item
cartService.removeItemFromCart(listingId);

// Clear Cart
cartService.clearCart();

// Validate Cart Before Checkout
cartService.validateCart();
```

### Orders Service (ordersService.js)

```javascript
import { ordersService } from "@/lib";

// Place Order
ordersService.placeOrder({
  paymentMethod: "MOMO",
  deliveryAddress: "Accra, Ghana",
  notes: "Please call before delivery",
});

// Get My Orders
ordersService.getMyOrders({
  status: "PENDING",
  page: 1,
  limit: 10,
});

// Get Order Details
ordersService.getOrderById(id);

// Update Order Status
ordersService.updateOrderStatus(id, {
  status: "CONFIRMED",
});
```

### Barter Service (barterService.js)

```javascript
import { barterService } from "@/lib";

// Create Barter Request
barterService.createBarterRequest({
  targetListingId: "clh3z2k...",
  offeredDescription: "I have 20kg of fresh yam",
  offeredQuantity: 20,
  message: "Exchange request",
});

// Get Barter Requests
barterService.getBarterRequests({
  status: "PENDING",
});

// Update Status
barterService.updateBarterStatus(id, {
  status: "ACCEPTED",
});

// Upload Images
barterService.uploadBarterImages(id, [imageFile1, imageFile2]);
```

### Payments Service (paymentsService.js)

```javascript
import { paymentsService } from "@/lib";

// Initialize Payment
paymentsService
  .initializePayment({
    orderId: "clh3z2k...",
  })
  .then((data) => {
    // Redirect to data.paymentUrl
    window.location.href = data.paymentUrl;
  });

// Verify Payment After Redirect
paymentsService.verifyPayment(reference);

// Check Payment Status
paymentsService.getPaymentStatus(orderId);
```

### Agents Service (agentsService.js)

```javascript
import { agentsService } from "@/lib";

// Register as Agent
agentsService.registerAsAgent({
  assignedRegion: "Greater Accra",
  commissionRate: 5.0,
  bio: "Experienced field agent",
});

// Get All Agents
agentsService.getAllAgents({
  region: "Greater Accra",
  page: 1,
  limit: 20,
});

// Register a Farmer
agentsService.registerFarmer({
  fullName: "Yaw Farmer",
  email: "yaw@example.com",
  password: "mypassword1",
  region: "Ashanti",
  phoneNumber: "0241234567",
});

// Get My Farmers
agentsService.getMyFarmers();

// Get Pending Requests
agentsService.getAgentRequests();

// Request an Agent
agentsService.requestAgent(agentId);

// Handle Request
agentsService.handleAgentRequest(requestId, {
  status: "ACCEPTED",
});
```

### Admin Service (adminService.js)

```javascript
import { adminService } from "@/lib";

// Dashboard Stats
adminService.getDashboardStats();

// Get All Users
adminService.getAllUsers({
  role: "FARMER",
  isActive: true,
  search: "kofi",
  page: 1,
  limit: 20,
});

// Update User
adminService.updateUser(id, {
  isActive: false,
  role: "AGENT",
  isVerified: true,
});

// Delete User
adminService.deleteUser(id);

// Manage Categories
adminService.createCategory({
  name: "Vegetables",
  description: "Fresh vegetables",
  parentId: null,
});
```

### Categories Service (categoriesService.js)

```javascript
import { categoriesService } from "@/lib";

// Get Categories (Public)
categoriesService.getCategories();
```

## Usage in Components

### Example: Login Component

```javascript
import { authService, api } from '@/lib';
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await authService.login({
        email,
        password,
        rememberMe: false
      });

      // Store token
      api.setAccessToken(response.accessToken);

      // Store user info
      localStorage.setItem('user', JSON.stringify(response.user));

      // Redirect based on role
      const { role } = response.user;
      if (role === 'ADMIN') window.location.href = '/admin';
      else if (role === 'AGENT') window.location.href = '/agent';
      else window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    // JSX
  );
}
```

### Example: Listings Component

```javascript
import { listingsService } from '@/lib';
import { useEffect, useState } from 'react';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await listingsService.getListings({
          page: 1,
          limit: 20
        });
        setListings(response.listings);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    // JSX
  );
}
```

### Example: Cart Validation Before Checkout

```javascript
import { cartService, paymentsService } from "@/lib";

// In your checkout handler
const handleCheckout = async () => {
  // Validate cart first
  const validation = await cartService.validateCart();

  if (!validation.valid) {
    // Show issues to user
    console.log("Cart issues:", validation.issues);
    return;
  }

  // Proceed with order
  const orderResponse = await ordersService.placeOrder({
    paymentMethod: "MOMO",
    deliveryAddress: address,
    notes: notes,
  });

  // Initialize payment
  const payment = await paymentsService.initializePayment({
    orderId: orderResponse.order.id,
  });

  // Redirect to payment
  window.location.href = payment.paymentUrl;
};
```

## Error Handling

All services throw errors with the following structure:

```javascript
{
  message: string,        // Error description
  status: number,         // HTTP status code
  data: object           // Server response data
}
```

Example error handling:

```javascript
try {
  await authService.login(credentials);
} catch (error) {
  console.error(`Error (${error.status}): ${error.message}`);

  if (error.status === 401) {
    console.log("Invalid credentials");
  } else if (error.status === 429) {
    console.log("Too many login attempts, please try again later");
  }
}
```

## Authentication Flow

1. **Register/Login**: Call `authService.register()` or `authService.login()`
2. **Store Token**: Call `api.setAccessToken(response.accessToken)`
3. **Automatic Token Refresh**: If API returns 401, token is automatically refreshed using the httpOnly cookie
4. **Logout**: Call `authService.logout()` to clear cookies and tokens
5. **Protected Requests**: All protected routes automatically include the Bearer token in headers

## Important Notes

- **Access Token Storage**: Stored in `localStorage` for persistence across page reloads
- **Refresh Token**: Automatically managed via httpOnly cookies (secure, not exposed to JavaScript)
- **Auto-Refresh**: When a 401 is received, the system automatically attempts to refresh the token
- **Email Verification**: Required for creating listings and placing orders
- **Role-Based Access**: Check `user.role` after login to display appropriate UI

## Available Roles

- `FARMER` - Can create/manage listings, receive orders
- `BUYER` - Can browse, add to cart, and place orders
- `AGENT` - Can register/manage farmers, handle their listings
- `ADMIN` - Full system access, user and category management

## Unit Types

- `KG`
- `BAG`
- `CRATE`
- `PIECE`
- `LITRE`
- `BUNDLE`

## Listing Types

- `SELL` - For sale only
- `BARTER` - For barter only
- `BOTH` - Can be sold or bartered

## Order Statuses

- `PENDING` - Initial state
- `CONFIRMED` - Seller confirmed
- `DISPATCHED` - On the way
- `DELIVERED` - Completed
- `CANCELLED` - Cancelled (stock restored)

## Payment Methods

- `MOMO` - Mobile Money
- `CASH` - Cash on delivery
- `BARTER` - Exchange for goods
- `CREDIT` - Credit payment
