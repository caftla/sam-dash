import bases from "bases";

const btoa = function (str) {
  return new Buffer(str).toString('base64');
};

const atob = function (b64Encoded) {
  return new Buffer(b64Encoded, 'base64').toString();
};

const randomLetter = () => bases.toBase64(Math.floor(Math.random() * 64));

export const encrypt = (i) => btoa(randomLetter() + bases.toBase64(i + 4095)).replace(/=/g, "");

const padRight = s => (s.length % 4 !== 0 ? padRight(s + "=") : s);

export const decrypt = (s): number => bases.fromBase64(atob(padRight(s)).substr(1)) - 4095;
