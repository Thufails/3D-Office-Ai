/* Estimasi lokal Jakarta untuk animasi; bukan jadwal adzan resmi.
   Rumus posisi matahari: NOAA solareqns.PDF.
   Definisi bayangan Asar: praytimes.org/docs/calculation (faktor 1).
   Tidak memerlukan jaringan atau akses lokasi pengguna. */
(() => {
  "use strict";
  const LOCATION = { name: "Jakarta", latitude: -6.2, longitude: 106.8167, timezone: 7 };
  const rad = (degrees) => degrees * Math.PI / 180;

  function calculate(dateKey) {
    const date = new Date(`${dateKey}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== dateKey) throw new Error("Tanggal estimasi salat tidak valid.");
    const year = date.getUTCFullYear();
    const days = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
    const ordinal = (date.getTime() - Date.UTC(year, 0, 1)) / 86400000 + 1;
    const angle = 2 * Math.PI / days * (ordinal - 1);
    const equation = 229.18 * (0.000075 + 0.001868 * Math.cos(angle) - 0.032077 * Math.sin(angle)
      - 0.014615 * Math.cos(2 * angle) - 0.040849 * Math.sin(2 * angle));
    const declination = 0.006918 - 0.399912 * Math.cos(angle) + 0.070257 * Math.sin(angle)
      - 0.006758 * Math.cos(2 * angle) + 0.000907 * Math.sin(2 * angle)
      - 0.002697 * Math.cos(3 * angle) + 0.00148 * Math.sin(3 * angle);
    const latitude = rad(LOCATION.latitude);
    const noon = 720 - 4 * LOCATION.longitude - equation + LOCATION.timezone * 60;
    const altitude = Math.atan(1 / (1 + Math.tan(Math.abs(latitude - declination))));
    const cosine = (Math.sin(altitude) - Math.sin(latitude) * Math.sin(declination))
      / (Math.cos(latitude) * Math.cos(declination));
    const afternoon = Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 / Math.PI * 4;
    return {
      dateKey, location: LOCATION.name,
      dhuhr: Math.ceil(noon + 2), asr: Math.ceil(noon + afternoon + 2),
      note: "Estimasi simulasi Jakarta · faktor Asar 1 · margin 2 menit. Bukan jadwal adzan resmi.",
    };
  }

  const api = { LOCATION, calculate };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else globalThis.PawfficePrayerTimes = api;
})();
