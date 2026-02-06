# 🩺 Doctor Desk – Healthcare Management Platform

Doctor Desk is a **full-stack web application** designed to manage healthcare-related workflows with a secure **wallet & payment system**.  
The platform integrates **Razorpay Payment Gateway** to handle transactions, update user wallets, and manage credits in real time.

---

## ✨ Features

### 👤 User Authentication
- 🔐 User **Login & Signup**
- Secure access to user dashboard

---

### 💳 Wallet & Payments
- 💰 Razorpay payment integration
- 🔄 Real-time **wallet balance updates**
- 🪙 Credits system linked with payments
- ✅ Transaction validation & status handling

---

### ⚙️ Core Functionalities
- 🧾 Payment order creation
- 🔐 Secure payment verification
- 📊 Wallet & credit synchronization
- 🛡️ Backend-controlled payment flow

---

## 🛠️ Tech Stack

**Frontend**
- React.js
- React Router
- Axios
- CSS / Bootstrap

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB

**Payments**
- Razorpay API

---

## 🌐 API Routes

### 🔓 Public Routes
| Method | Endpoint | Description |
|------|--------|------------|
| POST | `/signup` | User registration |
| POST | `/login` | User login |

---

### 💳 Payment Routes
| Method | Endpoint | Description |
|------|--------|------------|
| POST | `/api/payment/create-order` | Create Razorpay payment order |
| POST | `/api/payment/verify` | Verify payment signature |
| POST | `/api/payment/wallet-update` | Update wallet & credits after payment |

---

## 🧭 Application Flow

1. User signs up or logs in  
2. User initiates payment  
3. Backend creates Razorpay order  
4. Payment is completed on Razorpay  
5. Payment is verified on backend  
6. Wallet balance & credits are updated  

✔️ Secure  
✔️ Reliable  
✔️ Scalable  

---

## 🔐 Environment Variables

```env
RAZORPAY_KEY_ID=rzp_test_S42uUnK03LoNCV
RAZORPAY_KEY_SECRET=RscGKKICpgaE8ts7rUNKbIQT
MONGODB_URI=mongodb://localhost:27017/doctorDesk
