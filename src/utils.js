export const shortenEthAddr = (str) => {
  const shortenStr = str && `${str.substring(0, 5)}...${str.substring(str.length - 5, str.length)}`;
  return shortenStr;
};

export const timeSince = (date) => {

  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = Math.floor(seconds / 31536000);

  if (interval === 1) return interval + " year";
  if (interval > 1) return interval + " years";

  interval = Math.floor(seconds / 2592000);
  if (interval === 1) return interval + " month";
  if (interval > 1) return interval + " months";

  interval = Math.floor(seconds / 86400);
  if (interval === 1) return interval + " day";
  if (interval > 1) return interval + " days";

  interval = Math.floor(seconds / 3600);
  if (interval === 1) return interval + " hour";
  if (interval > 1) return interval + " hours";

  interval = Math.floor(seconds / 60);
  if (interval === 1) return interval + " minute";
  if (interval > 1) return interval + " minutes";

  return Math.floor(seconds) + " seconds";
}

export const checkIsMobileDevice = () => {
  return ((window && typeof window.orientation !== "undefined")) || (navigator && navigator.userAgent.indexOf('IEMobile') !== -1);
};

export const sortChronologically = (threadPosts) => {
  const updatedThreadPosts = threadPosts.sort((a, b) => {
    a = a.timestamp;
    b = b.timestamp;
    return a > b ? -1 : a < b ? 1 : 0;
  });

  return updatedThreadPosts;
}