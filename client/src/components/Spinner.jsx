import React from "react";

const Spinner = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--color-green)]"></div>
    </div>
  );
};

export default Spinner;
