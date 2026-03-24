import React, { useEffect, useState } from "react";
import {collection,query,where,orderBy,onSnapshot,} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { useUserStore } from "../store/userStore";
import { Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";

export const Profile = () => {
  const { user } = useUserStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "orders");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "processing":
        return <Package className="h-5 w-5 text-purple-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-indigo-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* User Info Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-white border rounded-3xl p-8 text-center shadow-sm sticky top-24">
            <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                  {user.displayName?.charAt(0) || user.email?.charAt(0)}
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold mb-1">{user.displayName}</h2>
            <p className="text-gray-500 text-sm mb-6">{user.email}</p>
            <div className="bg-blue-50 text-purple-700 text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-full inline-block">
              Customer Member
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <h2 className="text-3xl font-extrabold tracking-tight mb-8">
            Order History
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 animate-pulse h-40 rounded-2xl"
                />
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border rounded-2xl overflow-hidden shadow-sm"
                >
                  <div className="bg-gray-50 p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Order Placed</p>
                      <p className="font-medium">
                        {order.createdAt?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total</p>
                      <p className="font-medium">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Order ID</p>
                      <p className="font-mono text-sm">{order.id}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                              {item.quantity}x
                            </div>
                            <p className="font-medium">{item.name}</p>
                          </div>
                          <p className="text-gray-600">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed rounded-3xl p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No orders yet</h3>
              <p className="text-gray-500">
                When you place an order, it will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
