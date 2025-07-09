import React, { createContext, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

export const SessionTimeoutContext = createContext();

export const SessionTimeoutProvider = ({ timeout = 15 * 60 * 1000, children }) => { // 15 minutes timeout
  const [isInactive, setIsInactive] = useState(false);
  const timerRef = useRef();

  const resetTimer = () => {
    clearTimeout(timerRef.current);
    setIsInactive(false);
    timerRef.current = setTimeout(() => setIsInactive(true), timeout);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <SessionTimeoutContext.Provider value={{ isInactive }}>
      {children}
    </SessionTimeoutContext.Provider>
  );
};

SessionTimeoutProvider.propTypes = {
  timeout: PropTypes.number,
  children: PropTypes.node.isRequired,
};