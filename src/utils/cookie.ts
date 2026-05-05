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

/**
 * Gets the value of a cookie by name
 * @param name The name of the cookie to retrieve
 * @returns The value of the cookie, or null if the cookie is not found
 */
export const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split(';').map((cookie) => cookie.trim());
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (decodeURIComponent(cookieName) === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
};

export const deleteCookie = ({ name }: CookieConfig) => {
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0;`;
};