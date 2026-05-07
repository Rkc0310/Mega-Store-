import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { useUserStore } from "../store/userStore";
import { Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";

const loadStoredOrders = (key) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredOrders = (key, orders) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(orders));
  } catch {
    // ignore storage errors
  }
};

export const Profile = () => {
  const { user } = useUserStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const storageKey = `order-history-${user.uid}`;
    const previousOrders = loadStoredOrders(storageKey);

    if (previousOrders.length > 0) {
      setOrders(previousOrders);
    }

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? null,
          };
        });

        setOrders(ordersData);
        saveStoredOrders(storageKey, ordersData);
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
        return <Clock className="h-5 w-5 text-[var(--muted)]" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-violet-100 text-violet-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(1fr,720px)]">
        <aside className="sticky top-8 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow)]">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-[var(--border)] bg-[var(--surface-strong)] shadow-md">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-[var(--muted)]">
                {user.displayName?.charAt(0) || user.email?.charAt(0)}
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold text-[var(--text)] mb-1">{user.displayName}</h2>
          <p className="text-sm text-[var(--muted)] mb-6">{user.email}</p>
          <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
            Customer member
          </span>
        </aside>

        <section className="space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text)] mb-4">Order History</h2>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-40 rounded-[32px] bg-[var(--surface)] shadow-[var(--shadow)] animate-pulse" />
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                    <div className="flex flex-col gap-4 border-b border-[var(--border)] bg-[var(--surface-strong)] p-6 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-[var(--muted)]">Order placed</p>
                        <p className="font-semibold text-[var(--text)]">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Processing..."}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--muted)]">Total</p>
                        <p className="font-semibold text-[var(--text)]">${order.totalAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--muted)]">Order ID</p>
                        <p className="font-mono text-sm text-[var(--text)]">{order.id}</p>
                      </div>
                      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold">
                                {item.quantity}x
                              </div>
                              <p className="font-medium text-[var(--text)]">{item.name}</p>
                            </div>
                            <p className="text-[var(--muted)]">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[32px] border border-dashed border-[var(--border)] bg-[var(--surface-strong)] p-12 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-[var(--muted)]" />
                <h3 className="text-xl font-semibold text-[var(--text)] mb-2">No orders yet</h3>
                <p className="text-[var(--muted)]">When you place an order, it will appear here.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
