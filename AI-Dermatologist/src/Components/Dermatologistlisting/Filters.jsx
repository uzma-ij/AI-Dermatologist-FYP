import React from "react";
import styles from "./Filters.module.css"; 



const Filters = ({ filter, setFilter }) => {
  const buttons = [
    { label: "Show All", value: "all" },
    { label: "Female Doctors", value: "female" },
    { label: "Male Doctors", value: "male" },
    { label: "Lowest Fees", value: "lowestFees" },
  ];

  return (
    <div className={styles.filters}>
      {buttons.map((btn) => (
        <button
          key={btn.value}
          className={`${styles.filterBtn} ${
            filter === btn.value ? styles.active : ""
          }`}
          onClick={() => setFilter(btn.value)}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};

export default Filters;
