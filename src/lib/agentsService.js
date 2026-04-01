// Agents API Service
import api from "./api";

const agentsService = {
  /**
   * Register as agent
   * @param {Object} agentData - { assignedRegion, commissionRate, bio }
   * @returns {Promise}
   */
  registerAsAgent: (agentData) =>
    api.apiFetch("/api/agents/register", {
      method: "POST",
      body: JSON.stringify(agentData),
    }),

  /**
   * Get all agents
   * @param {Object} params - { region?, page?, limit? }
   * @returns {Promise}
   */
  getAllAgents: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, value);
      }
    });

    return api.apiFetch(`/api/agents?${query.toString()}`, {
      method: "GET",
    });
  },

  /**
   * Get agent by ID
   * @param {string} id - Agent ID
   * @returns {Promise}
   */
  getAgentById: (id) =>
    api.apiFetch(`/api/agents/${id}`, {
      method: "GET",
    }),

  /**
   * Register farmer as agent
   * @param {Object} farmerData - { fullName, email, password, region, phoneNumber }
   * @returns {Promise}
   */
  registerFarmer: (farmerData) =>
    api.apiFetch("/api/agents/register-farmer", {
      method: "POST",
      body: JSON.stringify(farmerData),
    }),

  /**
   * Get farmers managed by agent
   * @returns {Promise}
   */
  getMyFarmers: () =>
    api.apiFetch("/api/agents/my-farmers", {
      method: "GET",
    }),

  /**
   * Get pending requests for agent
   * @returns {Promise}
   */
  getAgentRequests: () =>
    api.apiFetch("/api/agents/requests", {
      method: "GET",
    }),

  /**
   * Request to be managed by agent
   * @param {string} agentId - Agent ID
   * @returns {Promise}
   */
  requestAgent: (agentId) =>
    api.apiFetch(`/api/agents/${agentId}/request`, {
      method: "POST",
    }),

  /**
   * Handle agent request
   * @param {string} requestId - Request ID
   * @param {Object} data - { status }
   * @returns {Promise}
   */
  handleAgentRequest: (requestId, data) =>
    api.apiFetch(`/api/agents/requests/${requestId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Assign agent to order (admin only)
   * @param {string} orderId - Order ID
   * @param {Object} data - { agentId }
   * @returns {Promise}
   */
  assignAgentToOrder: (orderId, data) =>
    api.apiFetch(`/api/agents/orders/${orderId}/assign`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export default agentsService;
