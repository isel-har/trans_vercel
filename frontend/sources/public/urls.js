export const API_ENDPOINT    = `${process.env.NEXT_PUBLIC_IP}:8443`; // never forget
export const HTTPENDPOINT    = `https://${API_ENDPOINT}/api/`;
export const LoginURL        = `${HTTPENDPOINT}api/auth/login/`;
export const RegisterURL     = `${HTTPENDPOINT}api/auth/register/`;
export const LogoutURL       = `${HTTPENDPOINT}api/auth/logout/`;
export const ProfileURL      = `${HTTPENDPOINT}api/profile/`;
export const meURL           = `${HTTPENDPOINT}api/me/`;
export const NotifsURL       = `${HTTPENDPOINT}api/notifications/`;
export const ReadNotifURL    = `${HTTPENDPOINT}api/notifications/mark_read/`;
export const AcceptFriendURL = `${HTTPENDPOINT}api/friends/accept/`;
export const FriendsURL      = `${HTTPENDPOINT}api/friends/`;
export const searchURL       = `${HTTPENDPOINT}api/search`;
export const ScoreURL        = `${HTTPENDPOINT}api/score/`;
export const BlockURL        = `${HTTPENDPOINT}api/ban/`;
export const TourURL         = `${HTTPENDPOINT}api/tournament/`;
export const PongHistoryURL  = `${HTTPENDPOINT}api/game/history`;
export const ChangeTFAURL    = `${HTTPENDPOINT}api/auth/two-factor/`;
export const addPassURL      = `${HTTPENDPOINT}api/auth/add-pass/`;
export const editURL         = `${HTTPENDPOINT}api/auth/edit/`;
export const ChatURL         = `${HTTPENDPOINT}api/chat/`;

// Websocket urls //
export const WEBSOCKETURL    = `wss://${API_ENDPOINT}/ws/`;
export const NotifWsURL      = `${WEBSOCKETURL}notifications`;
export const GameWsURL         = `${WEBSOCKETURL}game`;
export const ChatWsURL       = `${WEBSOCKETURL}chat`;

// export const intraURL = `${process.env.API_URL}${process.env.QUERY_URL}`;