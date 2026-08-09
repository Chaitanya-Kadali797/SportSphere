export const ROLES = {
  ADMIN: "admin",
  COACH: "coach",
  PLAYER: "player",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.COACH]: "Coach",
  [ROLES.PLAYER]: "Player",
};

export const ROLE_HOME_PATHS = {
  [ROLES.ADMIN]: "/admin/dashboard",
  [ROLES.COACH]: "/coach/dashboard",
  [ROLES.PLAYER]: "/player/dashboard",
};

export const SPORTS = [
  { id: "cricket", name: "Cricket", type: "team" },
  { id: "football", name: "Football", type: "team" },
  { id: "volleyball", name: "Volleyball", type: "team" },
  { id: "basketball", name: "Basketball", type: "team" },
  { id: "kabaddi", name: "Kabaddi", type: "team" },
  { id: "chess", name: "Chess", type: "individual" },
  { id: "badminton", name: "Badminton", type: "individual" },
  { id: "tennis", name: "Tennis", type: "individual" },
  { id: "athletics", name: "Athletics", type: "individual" },
  { id: "table_tennis", name: "Table Tennis", type: "individual" },
];

export const DEFAULT_SPORTS = [
  { id: "cricket", name: "Cricket", type: "team" },
  { id: "football", name: "Football", type: "team" },
  { id: "basketball", name: "Basketball", type: "team" },
  { id: "volleyball", name: "Volleyball", type: "team" },
  { id: "badminton", name: "Badminton", type: "individual" },
  { id: "tennis", name: "Tennis", type: "individual" },
  { id: "chess", name: "Chess", type: "individual" },
  { id: "kabaddi", name: "Kabaddi", type: "team" },
  { id: "athletics", name: "Athletics", type: "individual" },
  { id: "table_tennis", name: "Table Tennis", type: "individual" },
];

export const TOURNAMENT_STATUSES = [
  "Draft",
  "Published",
  "Completed",
  "Cancelled",
];

export const TOURNAMENT_TYPES = [
  { id: "team", label: "Team" },
  { id: "individual", label: "Individual" },
];

export const GENDER_CATEGORIES = {
  MALE: "male",
  FEMALE: "female",
};
