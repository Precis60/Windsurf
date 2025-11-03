// Inner Range Inception API Service
// Documentation: https://www.innerrange.com/

class InceptionApiService {
  constructor() {
    // Configure your Inception controller details
    this.baseUrl = import.meta.env.VITE_INCEPTION_API_URL || 'https://your-inception-controller-ip';
    this.username = import.meta.env.VITE_INCEPTION_USERNAME || '';
    this.password = import.meta.env.VITE_INCEPTION_PASSWORD || '';
    this.sessionToken = null;
  }

  /**
   * Authenticate with Inception API
   * @returns {Promise<string>} Session token
   */
  async authenticate() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      this.sessionToken = data.session_token;
      return this.sessionToken;
    } catch (error) {
      console.error('Inception authentication error:', error);
      throw error;
    }
  }

  /**
   * Make authenticated request to Inception API
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}) {
    if (!this.sessionToken) {
      await this.authenticate();
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sessionToken}`,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        // Token expired, re-authenticate
        await this.authenticate();
        return this.request(endpoint, options);
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Inception API request error:', error);
      throw error;
    }
  }

  /**
   * Get list of areas
   * @returns {Promise<Array>} List of areas
   */
  async getAreas() {
    return await this.request('/api/v1/areas');
  }

  /**
   * Get area status
   * @param {number} areaId - Area ID
   * @returns {Promise<object>} Area status
   */
  async getAreaStatus(areaId) {
    return await this.request(`/api/v1/areas/${areaId}`);
  }

  /**
   * Arm an area
   * @param {number} areaId - Area ID
   * @param {string} mode - Arm mode: 'away', 'stay', 'night', 'disarm'
   * @param {string} userCode - Optional user code for arming
   * @returns {Promise<object>} Arm response
   */
  async armArea(areaId, mode = 'away', userCode = null) {
    const payload = {
      mode: mode,
    };

    if (userCode) {
      payload.user_code = userCode;
    }

    return await this.request(`/api/v1/areas/${areaId}/arm`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Disarm an area
   * @param {number} areaId - Area ID
   * @param {string} userCode - User code for disarming
   * @returns {Promise<object>} Disarm response
   */
  async disarmArea(areaId, userCode) {
    return await this.request(`/api/v1/areas/${areaId}/disarm`, {
      method: 'POST',
      body: JSON.stringify({
        user_code: userCode,
      }),
    });
  }

  /**
   * Get area arm status
   * @param {number} areaId - Area ID
   * @returns {Promise<string>} Status: 'armed', 'disarmed', 'arming', 'alarm'
   */
  async getArmStatus(areaId) {
    const area = await this.getAreaStatus(areaId);
    return area.arm_state || 'unknown';
  }

  /**
   * Logout and clear session
   */
  async logout() {
    if (this.sessionToken) {
      try {
        await this.request('/api/v1/session', {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
      this.sessionToken = null;
    }
  }
}

// Export singleton instance
export const inceptionApi = new InceptionApiService();
export default inceptionApi;
