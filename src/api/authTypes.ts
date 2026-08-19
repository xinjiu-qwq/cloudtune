/** User profile as returned by /login/status. */
export interface UserProfile {
  userId: number;
  nickname: string;
  avatarUrl: string;
}

/** Item from /user/playlist. */
export interface UserPlaylistItem {
  id: number;
  name: string;
  coverImgUrl: string;
  trackCount: number;
  /** Owner uid; equals profile.userId for own playlists. */
  userId: number;
}

export interface QrKeyResponse {
  code: number;
  data: {
    code: number;
    unikey?: string;
    message?: string;
  };
}

export interface QrCreateResponse {
  code: number;
  data?: {
    qrurl?: string;
    /** Base64 data-url PNG of the QR code. */
    qrimg?: string;
  };
}

/**
 * /login/qr/check codes:
 * 800 expired, 801 waiting for scan, 802 confirming on phone, 803 success.
 */
export interface QrCheckResponse {
  code: number;
  message?: string;
  cookie?: string;
}
