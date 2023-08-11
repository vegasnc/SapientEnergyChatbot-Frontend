import { useState } from "react";

export default function useModal() {
  const [isOpen, setisOpen] = useState(false); // false

  const toggle = () => {
    setisOpen(!isOpen);
  };

  return {
    isOpen,
    toggle
  };
}
