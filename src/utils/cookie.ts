/**
 * Cookie stuff, including configs and utility functions.
 * @since 2026-03-12
 * @author Michael Townsend <@continuities>
 */

/**
 * A session cookie that allows the user to select the event to view
 */
export const EventCookie: CookieConfig = {
  name: 'event-id'
};

/**
 * Sets a cookie with the given CookieConfig and value
 * @param param.name The name of the cookie
 * @param param.maxAge The max age of the cookie in seconds. If not provided, the cookie will be a session cookie.
 * @param value The value to set for the cookie
 */
export const setCookie = ({ name, maxAge }: CookieConfig, value: string) => {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/;${maxAge ? ` max-age=${maxAge};` : ''}`;
};
