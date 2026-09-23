import React from 'react';
import operatorIQLogo from '../../assets/images/operatoriq-logo.png';

export default function OperatorIQLogo() {
  return (
    <div className="flex items-center select-none group">
      <img
        src={operatorIQLogo}
        alt="CAT OperatorIQ"
        className="h-[40px] w-auto object-contain"
      />
    </div>
  );
}
