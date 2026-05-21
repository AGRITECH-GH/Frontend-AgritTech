import api from "./api";

const appendPaginationParams = (query, params = {}) => {
  if (params.page !== undefined && params.page !== null) {
    query.append("page", String(params.page));
  }
  if (params.limit !== undefined && params.limit !== null) {
    query.append("limit", String(params.limit));
  }
};

const profileService = {
  getPublicProfile: (userId) =>
    api.apiFetch(`/api/users/${userId}/profile`, {
      method: "GET",
    }),

  getPublicStats: (userId) =>
    api.apiFetch(`/api/users/${userId}/stats`, {
      method: "GET",
    }),

  getPublicReviews: (userId, params = {}) => {
    const query = new URLSearchParams();
    appendPaginationParams(query, params);
    const serialized = query.toString();

    return api.apiFetch(
      serialized
        ? `/api/users/${userId}/reviews?${serialized}`
        : `/api/users/${userId}/reviews`,
      {
        method: "GET",
      },
    );
  },
};

export default profileService;
