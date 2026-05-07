import React from "react";

export const FeatureCard = ({ icon: Icon, title, children, accentClass }) => {
  return (
    <div className="rounded-3xl border border-(--border) bg-(--surface) p-8 shadow-(--shadow)">
      <div className={`inline-flex items-center justify-center rounded-2xl p-4 mb-6 ${accentClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-(--text)">{title}</h3>
      <p className="text-(--muted) leading-relaxed">{children}</p>
    </div>
  );
};
