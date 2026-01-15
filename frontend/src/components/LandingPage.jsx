import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Calendar,
  Star,
  MessageCircle,
  Award,
  X,
  CreditCard,
} from "lucide-react";

export default function PatientDashboard() {
  const [credits, setCredits] = useState(2);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ yaha bas setter add hua
  const [patient, setPatient] = useState({
    name: "",
    email: "",
    age: "",
    bloodGroup: "",
    avatar: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("http://localhost:3000/getUser", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = res.data.user;

        setPatient({
          name: user.name,
          email: user.email,
          age: "",
          bloodGroup: "",
          avatar: user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
        });
      } catch (err) {
        console.error("Auth failed", err);
      }
    };

    fetchUser();
  }, []);

  // ⚙️ CONFIGURATION
  const CONFIG = {
    RAZORPAY_KEY_ID: "rzp_test_S42uUnK03LoNCV",
    BACKEND_URL: "http://localhost:3000",
    AUTH_TOKEN: localStorage.getItem("token"), // localStorage.getItem("token")
  };

  const doctors = [
    {
      id: 1,
      name: "Dr. Priya Sharma",
      specialty: "Cardiologist",
      experience: "15 years",
      rating: 4.8,
      consultationFee: 20,
      avatar: "PS",
      available: true,
      genres: ["General Checkup", "Heart Disease", "Blood Pressure", "ECG"],
    },
    {
      id: 2,
      name: "Dr. Amit Verma",
      specialty: "General Physician",
      experience: "10 years",
      rating: 4.6,
      consultationFee: 15,
      avatar: "AV",
      available: true,
      genres: ["Fever", "Cold & Cough", "General Consultation", "Body Pain"],
    },
    {
      id: 3,
      name: "Dr. Sneha Patel",
      specialty: "Dermatologist",
      experience: "8 years",
      rating: 4.9,
      consultationFee: 18,
      avatar: "SP",
      available: false,
      genres: ["Skin Problems", "Hair Fall", "Acne Treatment", "Allergy"],
    },
    {
      id: 4,
      name: "Dr. Rahul Mehta",
      specialty: "Orthopedic",
      experience: "12 years",
      rating: 4.7,
      consultationFee: 22,
      avatar: "RM",
      available: true,
      genres: ["Joint Pain", "Fracture", "Back Pain", "Sports Injury"],
    },
    {
      id: 5,
      name: "Dr. Anjali Singh",
      specialty: "Pediatrician",
      experience: "9 years",
      rating: 4.8,
      consultationFee: 16,
      avatar: "AS",
      available: true,
      genres: ["Child Fever", "Vaccination", "Growth Issues", "Child Care"],
    },
    {
      id: 6,
      name: "Dr. Vikram Joshi",
      specialty: "Neurologist",
      experience: "18 years",
      rating: 4.9,
      consultationFee: 25,
      avatar: "VJ",
      available: true,
      genres: ["Headache", "Migraine", "Nerve Problems", "Brain Health"],
    },
  ];

  // Load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // API Helper
  const apiCall = async (endpoint, method = "GET", body = null) => {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CONFIG.AUTH_TOKEN}`,
      },
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${CONFIG.BACKEND_URL}${endpoint}`, options);
    return response.json();
  };

  // 💳 PROCESS PAYMENT (Common function for both Add Credits & Appointment)
  const processPayment = async (amount, credits, description, onSuccess) => {
    try {
      if (!CONFIG.AUTH_TOKEN) {
        alert("Please login again");
        return;
      }

      setLoading(true);

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Razorpay SDK load failed");
        return;
      }

      // 🔹 CREATE ORDER
      const orderData = await apiCall("/createOrder", "POST", {
        amount, // rupees
        credits,
      });

      console.log("ORDER DATA:", orderData);

      if (!orderData.success) {
        alert(orderData.message || "Order creation failed");
        return;
      }

      const options = {
        key: CONFIG.RAZORPAY_KEY_ID,
        amount: orderData.amount, // ❗ SAME AS BACKEND
        currency: "INR",
        name: "HealthCare+",
        description,
        order_id: orderData.orderId,

        handler: async function (response) {
          try {
            const verifyData = await apiCall("/verifyPayment", "POST", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyData.success) {
              onSuccess();
            } else {
              alert("Payment verification failed");
            }
          } catch (err) {
            console.error(err);
            alert("Verification error");
          } finally {
            setLoading(false);
          }
        },

        prefill: {
          name: patient.name,
          email: patient.email,
          contact: "9999999999",
        },

        theme: { color: "#4F46E5" },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("PAYMENT ERROR:", error);
      alert("Something went wrong");
      setLoading(false);
    }
  };

  // 💰 ADD CREDITS
  const handleAddCredits = async () => {
    const creditAmount = 2;
    await processPayment(
      creditAmount,
      creditAmount,
      `Purchase ${creditAmount} Credits`,
      async () => {
        setCredits(credits + creditAmount);
        alert(`Success! ${creditAmount} credits added`);
      }
    );
  };

  // 🏥 BOOK APPOINTMENT - Step 1: Open Genre Modal
  const handleBookAppointmentClick = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedGenre("");
    setShowGenreModal(true);
  };

  // 🏥 BOOK APPOINTMENT - Step 2: Confirm Booking
  const confirmBooking = async () => {
    if (!selectedGenre) {
      alert("Please select a consultation type!");
      return;
    }

    const doctor = selectedDoctor;

    // Check credits
    if (credits < doctor.consultationFee) {
      const proceed = window.confirm(
        `Insufficient credits! You need ${doctor.consultationFee} credits but have ${credits}.\n\nWould you like to purchase more credits?`
      );
      if (proceed) {
        setShowGenreModal(false);
        handleAddCredits();
      }
      return;
    }

    // Proceed with booking
    try {
      setLoading(true);

      // Deduct from wallet
      const deductData = await apiCall("/api/wallet/wallet-deduct", "POST", {
        credits: doctor.consultationFee,
      });

      if (!deductData.success) {
        alert("Wallet deduction failed!");
        setLoading(false);
        return;
      }

      // Book appointment (backend me yeh route banana padega)
      const bookingData = await apiCall("/api/appointments/book", "POST", {
        doctorId: doctor.id,
        genre: selectedGenre,
        credits: doctor.consultationFee,
      });

      if (bookingData.success) {
        setCredits(credits - doctor.consultationFee);
        setShowGenreModal(false);
        alert(
          `Appointment booked successfully with ${doctor.name} for ${selectedGenre}!`
        );
      } else {
        alert("Appointment booking failed!");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">HealthCare+</h1>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <Award className="w-5 h-5 text-white" />
                <span className="font-bold text-white text-lg">{credits}</span>
                <span className="text-white text-sm">Credits</span>
              </div>
              <button
                onClick={handleAddCredits}
                disabled={loading}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
              >
                {loading ? "Processing..." : "+ Add Credits"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Section */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold shadow-lg">
              {patient.avatar}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{patient.name}</h2>
              <div className="flex gap-6 text-indigo-100">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {patient.age} years
                </span>
                <span className="flex items-center gap-2">
                  Blood Group: {patient.bloodGroup}
                </span>
              </div>
              <p className="text-indigo-100 mt-1">{patient.email}</p>
            </div>
          </div>
        </div>

        {/* Doctors Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Available Doctors
          </h2>
          <p className="text-gray-600">
            Book an appointment with our experienced doctors
          </p>
        </div>

        {/* Doctor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                      {doctor.avatar}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {doctor.name}
                      </h3>
                      <p className="text-indigo-600 font-medium">
                        {doctor.specialty}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {doctor.experience} experience
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {doctor.rating} Rating
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">
                      {doctor.consultationFee} Credits
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      doctor.available ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></div>
                  <span
                    className={`text-sm font-medium ${
                      doctor.available ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {doctor.available ? "Available Now" : "Not Available"}
                  </span>
                </div>

                <button
                  onClick={() => handleBookAppointmentClick(doctor)}
                  disabled={!doctor.available || loading}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    doctor.available
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg disabled:opacity-50"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  {doctor.available ? "Book Appointment" : "Unavailable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Genre Selection Modal */}
      {showGenreModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowGenreModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Select Consultation Type
              </h3>
              <p className="text-gray-600">
                Booking with {selectedDoctor.name}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {selectedDoctor.genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedGenre === genre
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-indigo-300 text-gray-700"
                  }`}
                >
                  <span className="font-medium">{genre}</span>
                </button>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Consultation Fee:</span>
                <span className="font-bold text-lg text-gray-800">
                  {selectedDoctor.consultationFee} Credits
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Your Balance:</span>
                <span
                  className={`font-bold text-lg ${
                    credits >= selectedDoctor.consultationFee
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {credits} Credits
                </span>
              </div>
            </div>

            <button
              onClick={confirmBooking}
              disabled={loading || !selectedGenre}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : credits >= selectedDoctor.consultationFee
                ? "Confirm Booking"
                : "Purchase Credits & Book"}
            </button>

            {credits < selectedDoctor.consultationFee && (
              <p className="text-center text-sm text-red-600 mt-3">
                Insufficient credits! You need{" "}
                {selectedDoctor.consultationFee - credits} more credits.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// import React, { useState } from "react";
// import { User, Calendar, Star, MessageCircle, Award } from "lucide-react";

// export default function PatientDashboard() {
//   const [credits, setCredits] = useState(150);
//   const [patient] = useState({
//     name: "Rajesh Kumar",
//     email: "rajesh@example.com",
//     age: 32,
//     bloodGroup: "O+",
//     avatar: "RK",
//   });

//   const doctors = [
//     {
//       id: 1,
//       name: "Dr. Priya Sharma",
//       specialty: "Cardiologist",
//       experience: "15 years",
//       rating: 4.8,
//       consultationFee: 20,
//       avatar: "PS",
//       available: true,
//     },
//     {
//       id: 2,
//       name: "Dr. Amit Verma",
//       specialty: "General Physician",
//       experience: "10 years",
//       rating: 4.6,
//       consultationFee: 15,
//       avatar: "AV",
//       available: true,
//     },
//     {
//       id: 3,
//       name: "Dr. Sneha Patel",
//       specialty: "Dermatologist",
//       experience: "8 years",
//       rating: 4.9,
//       consultationFee: 18,
//       avatar: "SP",
//       available: false,
//     },
//     {
//       id: 4,
//       name: "Dr. Rahul Mehta",
//       specialty: "Orthopedic",
//       experience: "12 years",
//       rating: 4.7,
//       consultationFee: 22,
//       avatar: "RM",
//       available: true,
//     },
//     {
//       id: 5,
//       name: "Dr. Anjali Singh",
//       specialty: "Pediatrician",
//       experience: "9 years",
//       rating: 4.8,
//       consultationFee: 16,
//       avatar: "AS",
//       available: true,
//     },
//     {
//       id: 6,
//       name: "Dr. Vikram Joshi",
//       specialty: "Neurologist",
//       experience: "18 years",
//       rating: 4.9,
//       consultationFee: 25,
//       avatar: "VJ",
//       available: true,
//     },
//   ];

//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       const script = document.createElement("script");
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };

//   const handleBookAppointment = async (doctor) => {
//     const res = await loadRazorpayScript();

//     if (!res) {
//       alert(
//         "Razorpay SDK failed to load. Please check your internet connection."
//       );
//       return;
//     }

//     const options = {
//       key: "rzp_test_YOUR_KEY_HERE", // Yaha apni Razorpay KEY_ID daalo
//       amount: doctor.consultationFee * 100, // Amount in paise (1 credit = 1 rupee)
//       currency: "INR",
//       name: "HealthCare+",
//       description: `Consultation with ${doctor.name}`,
//       image: "https://example.com/logo.png", // Optional: Apna logo URL
//       handler: function (response) {
//         // Payment successful
//         console.log("Payment ID:", response.razorpay_payment_id);
//         setCredits(credits - doctor.consultationFee);
//         alert(`Payment successful! Appointment booked with ${doctor.name}`);

//         // Yaha backend API call karke appointment save karo
//         // fetch('/api/book-appointment', { ... })
//       },
//       prefill: {
//         name: patient.name,
//         email: patient.email,
//         contact: "9999999999", // Patient ka phone number
//       },
//       notes: {
//         doctor_id: doctor.id,
//         patient_id: patient.email,
//       },
//       theme: {
//         color: "#4F46E5", // Indigo color
//       },
//       modal: {
//         ondismiss: function () {
//           alert("Payment cancelled");
//         },
//       },
//     };

//     const paymentObject = new window.Razorpay(options);
//     paymentObject.open();
//   };

//   const handleAddCredits = async () => {
//     const res = await loadRazorpayScript();

//     if (!res) {
//       alert(
//         "Razorpay SDK failed to load. Please check your internet connection."
//       );
//       return;
//     }

//     const creditAmount = 100; // 100 credits purchase karenge
//     const pricePerCredit = 1; // 1 credit = 1 rupee

//     const options = {
//       key: "rzp_test_YOUR_KEY_HERE", // Yaha apni Razorpay KEY_ID daalo
//       amount: creditAmount * pricePerCredit * 100, // Amount in paise (100 credits = 10000 paise = 100 rupees)
//       currency: "INR",
//       name: "HealthCare+",
//       description: `Purchase ${creditAmount} Credits`,
//       image: "https://example.com/logo.png", // Optional: Apna logo URL
//       handler: function (response) {
//         // Payment successful
//         console.log("Payment ID:", response.razorpay_payment_id);
//         setCredits(credits + creditAmount);
//         alert(
//           `Payment successful! ${creditAmount} credits added to your account`
//         );

//         // Yaha backend API call karke credits save karo
//         // fetch('/api/add-credits', {
//         //   payment_id: response.razorpay_payment_id,
//         //   credits: creditAmount
//         // })
//       },
//       prefill: {
//         name: patient.name,
//         email: patient.email,
//         contact: "9999999999", // Patient ka phone number
//       },
//       notes: {
//         purpose: "credit_purchase",
//         patient_id: patient.email,
//         credits: creditAmount,
//       },
//       theme: {
//         color: "#4F46E5", // Indigo color
//       },
//       modal: {
//         ondismiss: function () {
//           alert("Payment cancelled. Credits not added.");
//         },
//       },
//     };

//     const paymentObject = new window.Razorpay(options);
//     paymentObject.open();
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex justify-between items-center">
//             <h1 className="text-2xl font-bold text-indigo-600">HealthCare+</h1>

//             {/* Credits Display */}
//             <div className="flex items-center gap-4">
//               <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-2 rounded-full flex items-center gap-2 shadow-lg">
//                 <Award className="w-5 h-5 text-white" />
//                 <span className="font-bold text-white text-lg">{credits}</span>
//                 <span className="text-white text-sm">Credits</span>
//               </div>
//               <button
//                 onClick={handleAddCredits}
//                 className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
//               >
//                 + Add Credits
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Profile Section */}
//         <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
//           <div className="flex items-center gap-6">
//             <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold shadow-lg">
//               {patient.avatar}
//             </div>
//             <div className="flex-1">
//               <h2 className="text-3xl font-bold mb-2">{patient.name}</h2>
//               <div className="flex gap-6 text-indigo-100">
//                 <span className="flex items-center gap-2">
//                   <User className="w-4 h-4" />
//                   {patient.age} years
//                 </span>
//                 <span className="flex items-center gap-2">
//                   Blood Group: {patient.bloodGroup}
//                 </span>
//               </div>
//               <p className="text-indigo-100 mt-1">{patient.email}</p>
//             </div>
//             <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50 transition font-medium">
//               Edit Profile
//             </button>
//           </div>
//         </div>

//         {/* Doctors Section */}
//         <div className="mb-6">
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">
//             Available Doctors
//           </h2>
//           <p className="text-gray-600">
//             Book an appointment with our experienced doctors
//           </p>
//         </div>

//         {/* Doctor Cards Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {doctors.map((doctor) => (
//             <div
//               key={doctor.id}
//               className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
//             >
//               <div className="p-6">
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-center gap-4">
//                     <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
//                       {doctor.avatar}
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-bold text-gray-800">
//                         {doctor.name}
//                       </h3>
//                       <p className="text-indigo-600 font-medium">
//                         {doctor.specialty}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-2 mb-4">
//                   <div className="flex items-center gap-2 text-gray-600">
//                     <Calendar className="w-4 h-4" />
//                     <span className="text-sm">
//                       {doctor.experience} experience
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2 text-gray-600">
//                     <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//                     <span className="text-sm font-medium">
//                       {doctor.rating} Rating
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2 text-gray-600">
//                     <Award className="w-4 h-4 text-orange-500" />
//                     <span className="text-sm font-medium">
//                       {doctor.consultationFee} Credits
//                     </span>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2 mb-4">
//                   <div
//                     className={`w-2 h-2 rounded-full ${
//                       doctor.available ? "bg-green-500" : "bg-gray-400"
//                     }`}
//                   ></div>
//                   <span
//                     className={`text-sm font-medium ${
//                       doctor.available ? "text-green-600" : "text-gray-500"
//                     }`}
//                   >
//                     {doctor.available ? "Available Now" : "Not Available"}
//                   </span>
//                 </div>

//                 <button
//                   onClick={() => handleBookAppointment(doctor)}
//                   disabled={!doctor.available}
//                   className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
//                     doctor.available
//                       ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
//                       : "bg-gray-300 text-gray-500 cursor-not-allowed"
//                   }`}
//                 >
//                   <MessageCircle className="w-5 h-5" />
//                   {doctor.available ? "Book Appointment" : "Unavailable"}
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
