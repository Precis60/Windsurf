import React, { useState, useEffect } from 'react';
import inceptionApi from '../services/inceptionApi';
import './SecurityControl.css';

const SecurityControl = ({ areaId = 1, areaName = 'Main Area' }) => {
  const [armStatus, setArmStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Load initial status
  useEffect(() => {
    loadStatus();
    // Poll status every 10 seconds
    const interval = setInterval(loadStatus, 10000);
    return () => clearInterval(interval);
  }, [areaId]);

  const loadStatus = async () => {
    try {
      const status = await inceptionApi.getArmStatus(areaId);
      setArmStatus(status);
      setError(null);
    } catch (err) {
      console.error('Failed to load status:', err);
      setError('Failed to connect to security system');
    }
  };

  const handleArmClick = (mode) => {
    setPendingAction({ type: 'arm', mode });
    setShowCodeInput(true);
  };

  const handleDisarmClick = () => {
    setPendingAction({ type: 'disarm' });
    setShowCodeInput(true);
  };

  const executeAction = async () => {
    if (!userCode) {
      setError('Please enter your security code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (pendingAction.type === 'arm') {
        await inceptionApi.armArea(areaId, pendingAction.mode, userCode);
        setArmStatus('arming');
      } else if (pendingAction.type === 'disarm') {
        await inceptionApi.disarmArea(areaId, userCode);
        setArmStatus('disarming');
      }

      // Clear code and close input
      setUserCode('');
      setShowCodeInput(false);
      setPendingAction(null);

      // Reload status after 2 seconds
      setTimeout(loadStatus, 2000);
    } catch (err) {
      console.error('Action failed:', err);
      setError('Action failed. Check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelAction = () => {
    setUserCode('');
    setShowCodeInput(false);
    setPendingAction(null);
    setError(null);
  };

  const getStatusColor = () => {
    switch (armStatus) {
      case 'armed':
      case 'armed_away':
        return '#dc3545'; // Red
      case 'disarmed':
        return '#28a745'; // Green
      case 'arming':
      case 'disarming':
        return '#ffc107'; // Yellow
      case 'alarm':
        return '#ff0000'; // Bright red
      default:
        return '#6c757d'; // Gray
    }
  };

  const getStatusText = () => {
    switch (armStatus) {
      case 'armed':
      case 'armed_away':
        return 'Armed';
      case 'armed_stay':
        return 'Armed (Stay)';
      case 'armed_night':
        return 'Armed (Night)';
      case 'disarmed':
        return 'Disarmed';
      case 'arming':
        return 'Arming...';
      case 'disarming':
        return 'Disarming...';
      case 'alarm':
        return 'ALARM!';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="security-control">
      <div className="security-header">
        <h3>{areaName}</h3>
        <div 
          className="status-indicator" 
          style={{ backgroundColor: getStatusColor() }}
        >
          {getStatusText()}
        </div>
      </div>

      {error && (
        <div className="security-error">
          {error}
        </div>
      )}

      {!showCodeInput ? (
        <div className="security-buttons">
          {(armStatus === 'disarmed' || armStatus === 'unknown') && (
            <>
              <button
                className="security-btn arm-away"
                onClick={() => handleArmClick('away')}
                disabled={loading}
              >
                🏠 Arm Away
              </button>
              <button
                className="security-btn arm-stay"
                onClick={() => handleArmClick('stay')}
                disabled={loading}
              >
                🛋️ Arm Stay
              </button>
              <button
                className="security-btn arm-night"
                onClick={() => handleArmClick('night')}
                disabled={loading}
              >
                🌙 Arm Night
              </button>
            </>
          )}

          {(armStatus === 'armed' || armStatus === 'armed_away' || armStatus === 'armed_stay' || armStatus === 'armed_night') && (
            <button
              className="security-btn disarm"
              onClick={handleDisarmClick}
              disabled={loading}
            >
              🔓 Disarm
            </button>
          )}
        </div>
      ) : (
        <div className="security-code-input">
          <h4>Enter Security Code</h4>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength="6"
            placeholder="Enter code"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && executeAction()}
            autoFocus
          />
          <div className="code-buttons">
            <button
              className="security-btn confirm"
              onClick={executeAction}
              disabled={loading || !userCode}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </button>
            <button
              className="security-btn cancel"
              onClick={cancelAction}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="security-footer">
        <small>Last updated: {new Date().toLocaleTimeString()}</small>
      </div>
    </div>
  );
};

export default SecurityControl;
