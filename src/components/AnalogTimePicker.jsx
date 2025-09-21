import React, { useState, useRef, useEffect } from 'react';

const AnalogTimePicker = ({ value, onChange, label }) => {
  const [mode, setMode] = useState('hour'); // 'hour' or 'minute'
  const clockRef = useRef(null);
  
  // Parse time value (HH:MM format)
  const parseTime = (timeStr) => {
    if (!timeStr) return { hours: 12, minutes: 0 };
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours: hours || 12, minutes: minutes || 0 };
  };
  
  const { hours, minutes } = parseTime(value);
  
  // Convert 24h to 12h for display
  const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
  
  // Calculate angles for clock hands
  const hourAngle = (displayHours % 12) * 30 + (minutes * 0.5) - 90; // 30 degrees per hour + minute adjustment
  const minuteAngle = minutes * 6 - 90; // 6 degrees per minute
  
  // Handle clock face clicks
  const handleClockClick = (e) => {
    if (!clockRef.current) return;
    
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    
    if (!clientX || !clientY) return;
    
    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    const degrees = (angle * 180 / Math.PI + 90 + 360) % 360;
    
    if (mode === 'hour') {
      const newHour = Math.round(degrees / 30) % 12;
      const finalHour = newHour === 0 ? 12 : newHour;
      const time24h = hours >= 12 ? (finalHour === 12 ? 12 : finalHour + 12) : finalHour;
      onChange(`${time24h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      // Auto-switch to minute mode after setting hour
      setMode('minute');
    } else if (mode === 'minute') {
      const newMinute = Math.round(degrees / 6) % 60;
      onChange(`${hours.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`);
    }
  };
  
  // Generate hour markers
  const hourMarkers = [];
  for (let i = 1; i <= 12; i++) {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const x1 = 50 + 35 * Math.cos(angle);
    const y1 = 50 + 35 * Math.sin(angle);
    const x2 = 50 + 40 * Math.cos(angle);
    const y2 = 50 + 40 * Math.sin(angle);
    const textX = 50 + 32 * Math.cos(angle);
    const textY = 50 + 32 * Math.sin(angle);
    
    hourMarkers.push(
      <g key={i}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#333" strokeWidth="2" />
        <text x={textX} y={textY} textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#333">
          {i}
        </text>
      </g>
    );
  }
  
  // Generate minute markers
  const minuteMarkers = [];
  for (let i = 0; i < 60; i += 5) {
    if (i % 15 !== 0) { // Skip quarter hour marks (already covered by hour markers)
      const angle = (i * 6 - 90) * Math.PI / 180;
      const x1 = 50 + 37 * Math.cos(angle);
      const y1 = 50 + 37 * Math.sin(angle);
      const x2 = 50 + 40 * Math.cos(angle);
      const y2 = 50 + 40 * Math.sin(angle);
      
      minuteMarkers.push(
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#666" strokeWidth="1" />
      );
    }
  }
  
  return (
    <div style={{ margin: '1rem 0' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
        {label}
      </label>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Analog Clock */}
        <div style={{ position: 'relative' }}>
          <svg
            ref={clockRef}
            width="200"
            height="200"
            viewBox="0 0 100 100"
            onClick={handleClockClick}
            style={{
              border: `3px solid ${mode === 'hour' ? '#22314a' : '#dc3545'}`,
              borderRadius: '50%',
              background: mode === 'hour' ? '#f8f9ff' : '#fff8f8',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <defs>
              {/* Arrowhead for Hour Hand */}
              <marker id="hour-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="1.5" markerHeight="1.5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={mode === 'hour' ? '#22314a' : '#aaa'} />
              </marker>
              {/* Arrowhead for Minute Hand */}
              <marker id="minute-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={mode === 'minute' ? '#dc3545' : '#aaa'} />
              </marker>
            </defs>

            {/* Clock face */}
            <circle cx="50" cy="50" r="45" fill="white" stroke="#22314a" strokeWidth="1" />
            
            {/* Hour markers */}
            {hourMarkers}
            
            {/* Minute markers */}
            {minuteMarkers}
            
            {/* Hour hand */}
            <line
              x1="50"
              y1="50"
              x2={50 + 25 * Math.cos(hourAngle * Math.PI / 180)}
              y2={50 + 25 * Math.sin(hourAngle * Math.PI / 180)}
              stroke={mode === 'hour' ? '#22314a' : '#aaa'}
              strokeWidth={mode === 'hour' ? '4' : '2'}
              markerEnd="url(#hour-arrow)"
              pointerEvents="none"
            />
            
            {/* Minute hand */}
            <line
              x1="50"
              y1="50"
              x2={50 + 35 * Math.cos(minuteAngle * Math.PI / 180)}
              y2={50 + 35 * Math.sin(minuteAngle * Math.PI / 180)}
              stroke={mode === 'minute' ? '#dc3545' : '#aaa'}
              strokeWidth={mode === 'minute' ? '3' : '1'}
              markerEnd="url(#minute-arrow)"
              pointerEvents="none"
            />
            
            {/* Center dot */}
            <circle cx="50" cy="50" r="3" fill="#22314a" pointerEvents="none" />
            
          </svg>
        </div>
        
        {/* Digital display and AM/PM toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Digital time display */}
          <div style={{
            background: '#f8f9fa',
            border: '2px solid #22314a',
            borderRadius: '8px',
            padding: '1rem',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22314a', fontFamily: 'monospace' }}>
              {displayHours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '0.25rem' }}>
              {hours >= 12 ? 'PM' : 'AM'}
            </div>
          </div>
          
          {/* AM/PM Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                const newHour = hours >= 12 ? hours - 12 : hours;
                onChange(`${newHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
              }}
              style={{
                padding: '0.5rem 1rem',
                border: '2px solid #22314a',
                borderRadius: '4px',
                background: hours < 12 ? '#22314a' : 'white',
                color: hours < 12 ? 'white' : '#22314a',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => {
                const newHour = hours < 12 ? hours + 12 : hours;
                onChange(`${newHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
              }}
              style={{
                padding: '0.5rem 1rem',
                border: '2px solid #22314a',
                borderRadius: '4px',
                background: hours >= 12 ? '#22314a' : 'white',
                color: hours >= 12 ? 'white' : '#22314a',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              PM
            </button>
          </div>
          
          {/* Mode Toggle */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setMode('hour')}
              style={{
                padding: '0.5rem 1rem',
                border: '2px solid #22314a',
                borderRadius: '4px',
                background: mode === 'hour' ? '#22314a' : 'white',
                color: mode === 'hour' ? 'white' : '#22314a',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Hours
            </button>
            <button
              type="button"
              onClick={() => setMode('minute')}
              style={{
                padding: '0.5rem 1rem',
                border: '2px solid #dc3545',
                borderRadius: '4px',
                background: mode === 'minute' ? '#dc3545' : 'white',
                color: mode === 'minute' ? 'white' : '#dc3545',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Minutes
            </button>
          </div>
          
          {/* Instructions */}
          <div style={{ fontSize: '12px', color: '#666', maxWidth: '150px', lineHeight: '1.4', textAlign: 'center' }}>
            <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: mode === 'hour' ? '#22314a' : '#dc3545' }}>
              {mode === 'hour' ? 'Setting Hours' : 'Setting Minutes'}
            </div>
            <div>Click anywhere on the clock face to set the {mode === 'hour' ? 'hour' : 'minute'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalogTimePicker;
