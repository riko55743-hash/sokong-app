import React, { useRef, useState } from 'react';
import { format } from 'date-fns';
import { Sparkles } from 'lucide-react';
import './TimeCapsuleCard.css';

export const TimeCapsuleCard = ({ record }) => {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const formattedDate = format(new Date(record.timestamp * 1000), 'MMM dd, yyyy');
  const shortAddress = `${record.donor.slice(0, 4)}...${record.donor.slice(-4)}`;

  return (
    <div className="card-container">
      <div 
        ref={cardRef}
        className="tc-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
      >
        <div className="card-shine"></div>
        
        <div className="tc-card-header">
          <span className="tc-number">#{record.supporterNumber}</span>
          <span className="tc-date">{formattedDate}</span>
        </div>
        
        <div className="tc-card-image">
          <Sparkles size={64} className="tc-hologram-icon" />
        </div>
        
        <div className="tc-card-body">
          <div className="tc-message-box">
            "{record.message}"
          </div>
          <div className="tc-footer">
            <span>DONOR</span>
            <span className="tc-address">{shortAddress}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
